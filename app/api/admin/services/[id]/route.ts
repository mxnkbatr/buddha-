import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { logSuccess, logFailure, createOperationContext } from "@/lib/admin-logger";
import { validateServiceData, checkDataConsistency, adminGuard } from "@/lib/admin-utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;

    // 1. Check Admin Auth
    const { adminUser, db: guardDb, errorResponse } = await adminGuard(request);
    if (errorResponse) return errorResponse;

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON in request body",
        error: "INVALID_JSON"
      }, { status: 400 });
    }

    const { name, title, type, price, duration, desc, subtitle, image, quote } = body;

    // 3. Validate service ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        message: "Invalid service ID",
        error: "INVALID_ID"
      }, { status: 400 });
    }

    // 4. Comprehensive validation
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (dbError: any) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: "DATABASE_CONNECTION_ERROR"
      }, { status: 500 });
    }

    let deleteResult = null;

    try {
      // 4. Try deleting from 'services' collection (Standard Services)
      const serviceQuery = ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { id: id }] }
        : { id: id };

      const result = await db.collection("services").deleteOne(serviceQuery);

      if (result.deletedCount > 0) {
        deleteResult = {
          type: 'standard_service',
          deletedCount: result.deletedCount
        };
      }
    } catch (standardDeleteError: any) {
      console.error("Standard service deletion failed:", standardDeleteError);
      return NextResponse.json({
        success: false,
        message: "Failed to delete standard service",
        error: "STANDARD_SERVICE_DELETE_FAILED",
        details: standardDeleteError.message
      }, { status: 500 });
    }

    // 5. If no standard service deleted, try monk services
    if (!deleteResult) {
      try {
        const userResult = await db.collection("users").updateMany(
          { "services.id": id },
          {
            $pull: { services: { id: id } } as any,
            $set: { updatedAt: new Date() }
          }
        );

        if (userResult.modifiedCount > 0) {
          deleteResult = {
            type: 'monk_service',
            modifiedCount: userResult.modifiedCount
          };
        }
      } catch (monkDeleteError: any) {
        console.error("Monk service deletion failed:", monkDeleteError);
        return NextResponse.json({
          success: false,
          message: "Failed to delete monk service",
          error: "MONK_SERVICE_DELETE_FAILED",
          details: monkDeleteError.message
        }, { status: 500 });
      }
    }

    // 6. Check if any service was deleted
    if (!deleteResult) {
      return NextResponse.json({
        success: false,
        message: "Service not found",
        error: "SERVICE_NOT_FOUND"
      }, { status: 404 });
    }

    // 7. Log successful operation
    console.log(`Service ${id} deleted successfully:`, deleteResult);

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
      data: {
        serviceId: id,
        ...deleteResult
      }
    });

  } catch (error: any) {
    console.error("Service Deletion Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error during service deletion",
      error: "INTERNAL_SERVER_ERROR",
      details: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: Props) {
  const params = await props.params;
  const { id } = params;

  let operationContext: ReturnType<typeof createOperationContext> | undefined;
  let action: string | undefined;
  let user: any;

  try {

    // 1. Parse and validate request body first
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON in request body",
        error: "INVALID_JSON"
      }, { status: 400 });
    }

    const bodyData = body;
    action = bodyData.action;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
        error: "INVALID_ACTION"
      }, { status: 400 });
    }

    // 2. Check Admin Auth
    const { adminUser: patchAdminUser, db: patchDb, errorResponse: patchErrorResponse } = await adminGuard(request);
    if (patchErrorResponse) return patchErrorResponse;
    user = patchAdminUser;

    // Create operation context for logging
    operationContext = createOperationContext("Service Management", user?.clerkId || undefined, id, "service");

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    // 3. Connect to database
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (dbError: any) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: "DATABASE_CONNECTION_ERROR"
      }, { status: 500 });
    }

    // 4. Validate service ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        message: "Invalid service ID",
        error: "INVALID_ID"
      }, { status: 400 });
    }

    let updateResult = null;

    try {
      // 5. Try updating in 'users' collection (Monk Services)
      const monkServiceResult = await db.collection("users").updateMany(
        { "services.id": id },
        {
          $set: {
            "services.$.status": newStatus,
            "services.$.updatedAt": new Date(),
            "updatedAt": new Date()
          }
        }
      );

      if (monkServiceResult.matchedCount > 0) {
        updateResult = {
          type: 'monk_service',
          matchedCount: monkServiceResult.matchedCount,
          modifiedCount: monkServiceResult.modifiedCount
        };
      }
    } catch (monkUpdateError: any) {
      console.error("Monk service update failed:", monkUpdateError);
      return NextResponse.json({
        success: false,
        message: "Failed to update monk services",
        error: "MONK_SERVICE_UPDATE_FAILED",
        details: monkUpdateError.message
      }, { status: 500 });
    }

    // 6. If no monk services updated, try standard services
    if (!updateResult) {
      try {
        const serviceQuery = ObjectId.isValid(id)
          ? { $or: [{ _id: new ObjectId(id) }, { id: id }] }
          : { id: id };

        const standardServiceResult = await db.collection("services").updateOne(
          serviceQuery,
          {
            $set: {
              status: newStatus,
              updatedAt: new Date()
            }
          }
        );

        if (standardServiceResult && standardServiceResult.matchedCount > 0) {
          updateResult = {
            type: 'standard_service',
            matchedCount: standardServiceResult.matchedCount,
            modifiedCount: standardServiceResult.modifiedCount
          };
        }
      } catch (standardUpdateError: any) {
        console.error("Standard service update failed:", standardUpdateError);
        return NextResponse.json({
          success: false,
          message: "Failed to update standard service",
          error: "STANDARD_SERVICE_UPDATE_FAILED",
          details: standardUpdateError.message
        }, { status: 500 });
      }
    }

    // 7. Check if any service was found and updated
    if (!updateResult) {
      return NextResponse.json({
        success: false,
        message: "Service not found",
        error: "SERVICE_NOT_FOUND"
      }, { status: 404 });
    }

    // 8. Log successful operation
    logSuccess(
      operationContext,
      `${action} service`,
      {
        serviceId: id,
        newStatus,
        ...updateResult
      }
    );

    return NextResponse.json({
      success: true,
      message: `Service ${action}d successfully`,
      data: {
        serviceId: id,
        newStatus,
        ...updateResult
      }
    });

  } catch (error: any) {
    console.error("Service Approval Error:", error);
    if (operationContext) {
      logFailure(
        operationContext,
        `${action || 'unknown'} service`,
        error.message
      );
    }
    return NextResponse.json({
      success: false,
      message: "Internal server error during service approval",
      error: "INTERNAL_SERVER_ERROR",
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: Request, props: Props) {
  const params = await props.params;
  const { id } = params;
  let user: any;

  try {
    // 1. Check Admin Auth
    const { adminUser: putAdminUser, db: putDb, errorResponse: putErrorResponse } = await adminGuard(request);
    if (putErrorResponse) return putErrorResponse;
    user = putAdminUser;

    // 2. Validate service ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        message: "Invalid service ID",
        error: "INVALID_ID"
      }, { status: 400 });
    }

    // 3. Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON in request body",
        error: "INVALID_JSON"
      }, { status: 400 });
    }

    const { name, title, type, price, duration, desc, subtitle, image, quote } = body;

    // 4. Comprehensive validation
    const validation = validateServiceData(body);
    if (!validation.valid) {
      logFailure(
        createOperationContext("Service Management", user?.clerkId, id, "service"),
        "update service validation failed",
        validation.errors.join(", ")
      );
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        error: "VALIDATION_FAILED",
        details: validation.errors
      }, { status: 400 });
    }

    // Data consistency check
    const consistency = await checkDataConsistency('update_service', { serviceId: id });
    if (!consistency.consistent) {
      console.warn("Data consistency warnings:", consistency.warnings);
      // Log warnings but don't block the operation
      logSuccess(
        createOperationContext("Service Management", user?.clerkId, id, "service"),
        "update service consistency check",
        { warnings: consistency.warnings }
      );
    }

    // 4. Connect to database
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (dbError: any) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: "DATABASE_CONNECTION_ERROR"
      }, { status: 500 });
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(title !== undefined && { title }),
      ...(type !== undefined && { type }),
      ...(price !== undefined && { price }),
      ...(duration !== undefined && { duration }),
      ...(desc !== undefined && { desc }),
      ...(subtitle !== undefined && { subtitle }),
      ...(image !== undefined && { image }),
      ...(quote !== undefined && { quote }),
      updatedAt: new Date()
    };

    let standardServiceResult = null;
    let monkServiceResult = null;

    try {
      // 5. Update Standard Service (if exists)
      const serviceQuery = ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { id: id }] }
        : { id: id };

      standardServiceResult = await db.collection("services").updateOne(serviceQuery, {
        $set: updateData
      });
    } catch (standardUpdateError: any) {
      console.error("Standard service update failed:", standardUpdateError);
      return NextResponse.json({
        success: false,
        message: "Failed to update standard service",
        error: "STANDARD_SERVICE_UPDATE_FAILED",
        details: standardUpdateError.message
      }, { status: 500 });
    }

    try {
      // 6. Bulk Update Monk Services
      const monkUpdateFields: any = { updatedAt: new Date() };
      if (name !== undefined) monkUpdateFields["services.$.name"] = name;
      if (title !== undefined) monkUpdateFields["services.$.title"] = title;
      if (type !== undefined) monkUpdateFields["services.$.type"] = type;
      if (price !== undefined) monkUpdateFields["services.$.price"] = price;
      if (duration !== undefined) monkUpdateFields["services.$.duration"] = duration;
      if (desc !== undefined) monkUpdateFields["services.$.desc"] = desc;
      if (subtitle !== undefined) monkUpdateFields["services.$.subtitle"] = subtitle;
      if (image !== undefined) monkUpdateFields["services.$.image"] = image;
      if (quote !== undefined) monkUpdateFields["services.$.quote"] = quote;

      monkServiceResult = await db.collection("users").updateMany(
        { "services.id": id },
        { $set: monkUpdateFields }
      );
    } catch (monkUpdateError: any) {
      console.error("Monk service update failed:", monkUpdateError);
      return NextResponse.json({
        success: false,
        message: "Failed to update monk services",
        error: "MONK_SERVICE_UPDATE_FAILED",
        details: monkUpdateError.message
      }, { status: 500 });
    }

    // 7. Check if any updates were made
    const totalModified = (standardServiceResult?.modifiedCount || 0) + (monkServiceResult?.modifiedCount || 0);

    if (totalModified === 0) {
      return NextResponse.json({
        success: false,
        message: "Service not found or no changes made",
        error: "SERVICE_NOT_FOUND_OR_NO_CHANGES"
      }, { status: 404 });
    }

    // 8. Log successful operation
    console.log(`Service ${id} updated successfully:`, {
      standardService: standardServiceResult,
      monkService: monkServiceResult
    });

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: {
        serviceId: id,
        standardServiceModified: standardServiceResult?.modifiedCount || 0,
        monkServiceModified: monkServiceResult?.modifiedCount || 0,
        totalModified
      }
    });

  } catch (error: any) {
    console.error("Service Update Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error during service update",
      error: "INTERNAL_SERVER_ERROR",
      details: error.message
    }, { status: 500 });
  }
}
