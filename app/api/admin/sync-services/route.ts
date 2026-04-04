import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-utils";

/**
 * Admin-only endpoint to sync all services to ALL monks
 * Ensures every monk has exactly the same services available
 */
export async function POST(request: Request) {
    try {
        const { adminUser, db, errorResponse } = await adminGuard(request);
        if (errorResponse) return errorResponse;




        // 1. Fetch all services from the services collection
        const allServices = await db.collection("services").find({}).toArray();

        if (allServices.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No services found",
                message: "Please create services first before syncing"
            }, { status: 400 });
        }

        // 2. Map services to the format expected in user.services array
        const serviceRefs = allServices.map((svc: any) => ({
            id: svc.id || svc._id.toString(),
            name: svc.name,
            title: svc.title,
            type: svc.type,
            price: svc.price,
            duration: svc.duration,
            desc: svc.desc,
            subtitle: svc.subtitle,
            image: svc.image,
            quote: svc.quote,
            status: 'active'
        }));

        // 3. Find ALL monks (not just those without services)
        const allMonks = await db.collection("users").find({
            role: "monk"
        }).toArray();

        if (allMonks.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No monks found",
                message: "No monks available to sync services to"
            }, { status: 400 });
        }

        // 4. Update ALL monks to have exactly these services
        const updatePromises = allMonks.map((monk: any) =>
            db.collection("users").updateOne(
                { _id: monk._id },
                {
                    $set: {
                        services: serviceRefs,
                        updatedAt: new Date()
                    }
                }
            )
        );

        const updateResults = await Promise.all(updatePromises);

        // 5. Count successful updates
        const successfulUpdates = updateResults.filter(result => result.modifiedCount > 0).length;

        console.log(`Service sync completed: Updated ${successfulUpdates}/${allMonks.length} monks with ${allServices.length} services`);

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${allServices.length} services to all ${allMonks.length} monks`,
            data: {
                totalMonks: allMonks.length,
                servicesSynced: allServices.length,
                successfulUpdates: successfulUpdates,
                services: serviceRefs.map((s: any) => ({ id: s.id, name: s.name }))
            }
        });

    } catch (error: any) {
        console.error("Service Sync Error:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to sync services",
            message: error.message
        }, { status: 500 });
    }
}