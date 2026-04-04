import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { currentUser, verifyToken } from "@clerk/nextjs/server";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// ─── Audit Logger ─────────────────────────────────────────────────────────────
async function logAdminAudit(
  db: any,
  event: "access_denied" | "access_granted" | "rate_limited",
  details: { ip?: string; path?: string; userId?: string; reason?: string }
) {
  try {
    await db.collection("admin_audit_log").insertOne({
      event,
      ...details,
      timestamp: new Date(),
    });
  } catch { /* Non-blocking — don't let audit failure break the request */ }
}

// ─── Core Auth Function ───────────────────────────────────────────────────────
/**
 * Authenticates an admin user from a Next.js Request.
 * Supports: Custom JWT (mobile Bearer token) + Clerk Cookie/Bearer (web).
 * Returns { user, db } on success, null on failure.
 */
export async function getAdminUserFromRequest(request?: Request) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("[Admin] JWT_SECRET environment variable is not set");
    return null;
  }

  const { db } = await connectToDatabase();

  // ── 1. Custom JWT Bearer token (Mobile app) ──────────────────────────────
  const authHeader = request?.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (bearerToken) {
    // 1a. Try our own Custom JWT first
    try {
      const { payload } = await jwtVerify(bearerToken, new TextEncoder().encode(JWT_SECRET));
      if (payload.sub && ObjectId.isValid(payload.sub as string)) {
        const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
        if (dbUser && (dbUser.role === "admin" || dbUser.isSpecial === true)) {
          return { user: dbUser, db, isClerk: false };
        }
        // User found but not admin
        if (dbUser) return null;
      }
    } catch { /* Not a valid custom JWT — try Clerk next */ }

    // 1b. Try Clerk Bearer token (Clerk-issued JWT)
    try {
      const payload = await verifyToken(bearerToken, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      if (payload?.sub) {
        const dbUser = await db.collection("users").findOne({ clerkId: payload.sub });
        if (dbUser && (dbUser.role === "admin" || dbUser.isSpecial === true)) {
          return { user: dbUser, db, isClerk: true };
        }
        if (dbUser) return null;
      }
    } catch { /* Invalid Clerk token */ }
  }

  // ── 2. Clerk session cookie (Web browser) ────────────────────────────────
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const dbUser = await db.collection("users").findOne({
        $or: [
          { clerkId: clerkUser.id },
          { email: clerkUser.emailAddresses?.[0]?.emailAddress },
        ],
      });
      if (dbUser && (dbUser.role === "admin" || dbUser.isSpecial === true)) {
        return { user: dbUser, db, isClerk: true };
      }
      // Clerk user found but not admin — no fallback
      if (dbUser) return null;
    }
  } catch { /* Clerk not available in this context */ }

  // NOTE: Intentionally no userId query param fallback — that would be a security bypass.
  return null;
}

// ─── Admin Guard Helper ───────────────────────────────────────────────────────
/**
 * Full admin middleware: Rate limit → Auth → Audit log.
 * Usage:
 *   const { adminUser, db, errorResponse } = await adminGuard(request);
 *   if (errorResponse) return errorResponse;
 */
export async function adminGuard(request: Request): Promise<{
  adminUser: any;
  db: any;
  errorResponse: null;
} | {
  adminUser: null;
  db: null;
  errorResponse: NextResponse;
}> {
  const ip = getClientIp(request);
  const path = new URL(request.url).pathname;

  // ── Rate limit: 100 req/min per IP on /api/admin/* ──
  const allowed = rateLimit(ip, 100, 60_000);
  if (!allowed) {
    // Get db for audit log (best effort)
    try {
      const { db } = await connectToDatabase();
      await logAdminAudit(db, "rate_limited", { ip, path });
    } catch { }

    return {
      adminUser: null,
      db: null,
      errorResponse: NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      ),
    };
  }

  // ── Authentication ──
  const result = await getAdminUserFromRequest(request);

  if (!result) {
    // Audit the failed attempt
    try {
      const { db } = await connectToDatabase();
      await logAdminAudit(db, "access_denied", {
        ip,
        path,
        reason: "Not authenticated or not an admin",
      });
    } catch { }

    return {
      adminUser: null,
      db: null,
      errorResponse: NextResponse.json(
        { message: "Forbidden: Admin access required." },
        { status: 403 }
      ),
    };
  }

  // Success audit
  await logAdminAudit(result.db, "access_granted", {
    ip,
    path,
    userId: result.user._id?.toString(),
  });

  return { adminUser: result.user, db: result.db, errorResponse: null };
}


/**
 * Utility functions for admin operations with rollback capabilities
 */

export interface RollbackOperation {
  collection: string;
  operation: 'insert' | 'update' | 'delete';
  query: any;
  previousData?: any;
  rollbackData?: any;
}

export interface AdminOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  rollbackOperations?: RollbackOperation[];
}

/**
 * Execute a complex admin operation with rollback capabilities
 */
export async function executeAdminOperation(
  operationName: string,
  operations: Array<{
    collection: string;
    operation: 'insert' | 'update' | 'delete';
    query: any;
    data?: any;
    options?: any;
  }>
): Promise<AdminOperationResult> {
  const rollbackOperations: RollbackOperation[] = [];
  let db: any = null;

  try {
    // Connect to database
    const connection = await connectToDatabase();
    db = connection.db;

    // Execute operations and track for rollback
    for (const op of operations) {
      let previousData = null;

      // For updates and deletes, store previous data for rollback
      if (op.operation === 'update' || op.operation === 'delete') {
        try {
          previousData = await db.collection(op.collection).findOne(op.query);
        } catch (fetchError) {
          console.error(`Failed to fetch previous data for ${op.collection}:`, fetchError);
        }
      }

      // Execute the operation
      let result;
      switch (op.operation) {
        case 'insert':
          result = await db.collection(op.collection).insertOne(op.data);
          rollbackOperations.push({
            collection: op.collection,
            operation: 'delete',
            query: { _id: result.insertedId },
            rollbackData: result.insertedId
          });
          break;

        case 'update':
          result = await db.collection(op.collection).updateOne(op.query, op.data, op.options);
          if (previousData) {
            rollbackOperations.push({
              collection: op.collection,
              operation: 'update',
              query: op.query,
              previousData,
              rollbackData: op.data
            });
          }
          break;

        case 'delete':
          result = await db.collection(op.collection).deleteOne(op.query);
          if (previousData) {
            rollbackOperations.push({
              collection: op.collection,
              operation: 'insert',
              query: op.query,
              rollbackData: previousData
            });
          }
          break;
      }

      // Check if operation was successful
      if ((op.operation === 'update' && result.matchedCount === 0) ||
        (op.operation === 'delete' && result.deletedCount === 0)) {
        throw new Error(`Operation failed: ${op.operation} on ${op.collection} matched no documents`);
      }
    }

    console.log(`${operationName} completed successfully`);
    return { success: true, rollbackOperations };

  } catch (error: any) {
    console.error(`${operationName} failed:`, error);

    // Attempt rollback
    if (rollbackOperations.length > 0) {
      console.log(`Attempting rollback for ${operationName}...`);
      await performRollback(db, rollbackOperations.reverse());
    }

    return {
      success: false,
      error: error.message,
      rollbackOperations
    };
  }
}

/**
 * Perform rollback operations
 */
async function performRollback(db: any, rollbackOps: RollbackOperation[]): Promise<void> {
  for (const op of rollbackOps) {
    try {
      switch (op.operation) {
        case 'insert':
          // Insert the previous data back
          if (op.rollbackData) {
            await db.collection(op.collection).insertOne(op.rollbackData);
            console.log(`Rollback: Inserted data back into ${op.collection}`);
          }
          break;

        case 'update':
          // Revert to previous data
          if (op.previousData) {
            await db.collection(op.collection).updateOne(op.query, op.previousData);
            console.log(`Rollback: Reverted update in ${op.collection}`);
          }
          break;

        case 'delete':
          // Delete the inserted document
          if (op.rollbackData) {
            await db.collection(op.collection).deleteOne({ _id: op.rollbackData });
            console.log(`Rollback: Deleted inserted document from ${op.collection}`);
          }
          break;
      }
    } catch (rollbackError) {
      console.error(`Rollback operation failed for ${op.collection}:`, rollbackError);
      // Continue with other rollback operations even if one fails
    }
  }
}

/**
 * Validate admin permissions
 */
export async function validateAdminAccess(userId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({
      clerkId: userId,
      role: "admin"
    });
    return !!user;
  } catch (error) {
    console.error("Admin validation failed:", error);
    return false;
  }
}

/**
 * Validate service data
 */
export function validateServiceData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Price validation
  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || isNaN(data.price)) {
      errors.push("Price must be a valid number");
    } else if (data.price < 0) {
      errors.push("Price cannot be negative");
    } else if (data.price > 1000000) { // Reasonable upper limit
      errors.push("Price cannot exceed 1,000,000₮");
    }
  }

  // Duration validation
  if (data.duration !== undefined) {
    if (typeof data.duration !== 'string') {
      errors.push("Duration must be a string");
    } else if (data.duration.trim().length === 0) {
      errors.push("Duration cannot be empty");
    } else if (data.duration.length > 50) {
      errors.push("Duration cannot exceed 50 characters");
    }
  }

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name === 'string') {
      if (data.name.trim().length === 0) {
        errors.push("Name cannot be empty");
      } else if (data.name.length > 200) {
        errors.push("Name cannot exceed 200 characters");
      }
    } else if (typeof data.name === 'object') {
      // Localized name validation
      const locales = ['mn', 'en'];
      let hasValidLocale = false;
      for (const locale of locales) {
        if (data.name[locale] !== undefined) {
          if (typeof data.name[locale] !== 'string') {
            errors.push(`Name.${locale} must be a string`);
          } else if (data.name[locale].trim().length === 0) {
            errors.push(`Name.${locale} cannot be empty`);
          } else if (data.name[locale].length > 200) {
            errors.push(`Name.${locale} cannot exceed 200 characters`);
          } else {
            hasValidLocale = true;
          }
        }
      }
      if (!hasValidLocale) {
        errors.push("Name must have at least one valid locale (mn or en)");
      }
    } else {
      errors.push("Name must be a string or localized object");
    }
  }

  // Type validation
  if (data.type !== undefined) {
    const validTypes = ['ritual', 'consultation', 'teaching', 'ceremony', 'blessing', 'meditation'];
    if (typeof data.type !== 'string') {
      errors.push("Type must be a string");
    } else if (!validTypes.includes(data.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }
  }

  // Status validation
  if (data.status !== undefined) {
    const validStatuses = ['active', 'inactive', 'pending', 'rejected'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate user data
 */
export function validateUserData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Email validation
  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push("Email must be a string");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format");
    } else if (data.email.length > 254) { // RFC 5321 limit
      errors.push("Email cannot exceed 254 characters");
    }
  }

  // Role validation
  if (data.role !== undefined) {
    const validRoles = ['user', 'monk', 'admin'];
    if (!validRoles.includes(data.role)) {
      errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }
  }

  // Monk status validation
  if (data.monkStatus !== undefined) {
    const validStatuses = ['pending', 'approved', 'rejected', 'active'];
    if (!validStatuses.includes(data.monkStatus)) {
      errors.push(`Monk status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Name validation (localized)
  if (data.name !== undefined) {
    if (typeof data.name === 'object') {
      const locales = ['mn', 'en'];
      for (const locale of locales) {
        if (data.name[locale] !== undefined) {
          if (typeof data.name[locale] !== 'string') {
            errors.push(`Name.${locale} must be a string`);
          } else if (data.name[locale].trim().length === 0) {
            errors.push(`Name.${locale} cannot be empty`);
          } else if (data.name[locale].length > 100) {
            errors.push(`Name.${locale} cannot exceed 100 characters`);
          }
        }
      }
    } else if (typeof data.name === 'string') {
      if (data.name.trim().length === 0) {
        errors.push("Name cannot be empty");
      } else if (data.name.length > 100) {
        errors.push("Name cannot exceed 100 characters");
      }
    }
  }

  // Experience validation
  if (data.yearsOfExperience !== undefined) {
    if (typeof data.yearsOfExperience !== 'number' || !Number.isInteger(data.yearsOfExperience)) {
      errors.push("Years of experience must be an integer");
    } else if (data.yearsOfExperience < 0) {
      errors.push("Years of experience cannot be negative");
    } else if (data.yearsOfExperience > 100) {
      errors.push("Years of experience cannot exceed 100");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate booking data
 */
export function validateBookingData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Status validation
  if (data.status !== undefined) {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Date validation
  if (data.date !== undefined) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push("Invalid date format");
    } else if (date < new Date()) {
      errors.push("Date cannot be in the past");
    }
  }

  // Time validation
  if (data.time !== undefined) {
    if (typeof data.time !== 'string') {
      errors.push("Time must be a string");
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
      errors.push("Time must be in HH:MM format");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check data consistency before operations
 */
export async function checkDataConsistency(
  operation: string,
  data: any
): Promise<{ consistent: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  try {
    const { db } = await connectToDatabase();

    // Check for monk approval consistency
    if (operation === 'approve_monk' && data.userId) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(data.userId) });
      if (user && user.role === 'monk' && user.monkStatus === 'approved') {
        warnings.push("User is already approved as a monk");
      }
    }

    // Check for service existence
    if (operation === 'update_service' && data.serviceId) {
      const serviceExists = await db.collection("services").findOne({ _id: new ObjectId(data.serviceId) });
      if (!serviceExists) {
        // Also check monk services
        const monkServiceExists = await db.collection("users").findOne({
          "services.id": data.serviceId
        });
        if (!monkServiceExists) {
          warnings.push("Service not found in database");
        }
      }
    }

    // Check for user existence
    if (operation === 'update_user' && data.userId) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(data.userId) });
      if (!user) {
        warnings.push("User not found in database");
      }
    }

  } catch (error) {
    console.error("Consistency check failed:", error);
    warnings.push("Could not perform consistency checks due to database error");
  }

  return {
    consistent: warnings.length === 0,
    warnings
  };
}