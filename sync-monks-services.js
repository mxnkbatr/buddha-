/**
 * One-time script to sync all available services to all monks
 * Run this script to ensure every monk has the same services
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function syncMonkServices() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;

    if (!uri) {
        console.error('MONGODB_URI environment variable is required');
        console.error('Make sure you have a .env file with MONGODB_URI set');
        process.exit(1);
    }

    if (!dbName) {
        console.error('MONGODB_DB environment variable is required');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);

        // 1. Fetch all services from the services collection
        const allServices = await db.collection("services").find({}).toArray();
        console.log(`Found ${allServices.length} services in the system`);

        if (allServices.length === 0) {
            console.log('No services found. Please create services first.');
            return;
        }

        // 2. Map services to the format expected in user.services array
        const serviceRefs = allServices.map((svc) => ({
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

        // 3. Find ALL monks
        const allMonks = await db.collection("users").find({
            role: "monk"
        }).toArray();

        console.log(`Found ${allMonks.length} monks to update`);

        if (allMonks.length === 0) {
            console.log('No monks found to sync services to');
            return;
        }

        // 4. Update ALL monks to have exactly these services
        console.log('Updating monks with services...');

        const updatePromises = allMonks.map((monk) =>
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

        console.log(`✅ Service sync completed successfully!`);
        console.log(`📊 Updated ${successfulUpdates}/${allMonks.length} monks`);
        console.log(`🛍️  Synced ${allServices.length} services to all monks`);
        console.log('\n📋 Services synced:');
        serviceRefs.forEach((service, index) => {
            console.log(`   ${index + 1}. ${service.name?.en || service.name?.mn || service.title?.en || service.title?.mn || 'Unnamed Service'} - ₮${service.price}`);
        });

    } catch (error) {
        console.error('❌ Error during service sync:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// Run the sync
console.log('🚀 Starting monk services synchronization...');
syncMonkServices().then(() => {
    console.log('✨ Sync completed successfully!');
}).catch((error) => {
    console.error('💥 Sync failed:', error);
    process.exit(1);
});