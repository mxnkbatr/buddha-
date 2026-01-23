# Sync Services for All Monks

This guide explains how to ensure all monks have the same services available.

## 🎯 What This Does

The universal services system ensures that **every monk offers every available service**. This means:
- All monks have identical service offerings
- Users can book any monk for any service
- Service management is centralized and consistent

## 🚀 Quick Sync Methods

### Method 1: Admin Dashboard (Recommended)
1. Log in as admin
2. Go to Admin Panel → Services tab
3. Click the **"Бүх лам нартай синхрончлох"** (Sync with all monks) button
4. All monks will immediately get all current services

### Method 2: Direct API Call
```bash
curl -X POST https://your-domain.com/api/admin/sync-services \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Method 3: Run Sync Script (Development)
```bash
# Make sure you have .env file with MONGODB_URI and MONGODB_DB
npm install dotenv
node sync-monks-services.js
```

## 📋 What Gets Synced

When you sync services, every monk receives:
- ✅ All current services from the services collection
- ✅ Complete service details (name, price, duration, description, etc.)
- ✅ Active status for all services
- ✅ Updated timestamp

## 🔄 Automatic Sync

The system also automatically syncs services when:
- ✅ A new monk gets approved
- ✅ A new service is created
- ✅ Services are fetched (automatic cleanup)

## 📊 Verification

After syncing, you can verify by:
1. Check Admin Dashboard → Users tab
2. Each monk should show the same number of services
3. Check individual monk profiles
4. All services should be marked as "available from all monks"

## 🛠️ Troubleshooting

### No Services Found
- Create services first in the Admin Services tab
- Then run the sync

### No Monks Found
- Approve monk applications first
- Then run the sync

### Sync Fails
- Check database connection
- Verify admin permissions
- Check server logs for detailed errors

## 📞 Support

If you encounter issues, check:
1. Admin Dashboard error messages
2. Server console logs
3. Database connectivity
4. Service collection has data