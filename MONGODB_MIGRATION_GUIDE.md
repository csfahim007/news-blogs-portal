# MongoDB Atlas Migration Guide

## ✅ Completed Steps

1. **Prisma Schema Updated** - Converted all models from MySQL to MongoDB
   - Changed provider from `mysql` to `mongodb`
   - Updated all IDs to use `@default(auto()) @map("_id") @db.ObjectId`
   - Removed MySQL-specific field types (`@db.Text`, `@db.LongText`, `@db.VarChar`)
   - Removed indexes (MongoDB handles indexing differently)
   - Updated many-to-many relationships to use explicit fields

2. **Environment Variables Updated** - All .env files now use MongoDB connection string
   - `.env.local`
   - `.env`
   - `backend/.env`
   - `backend/.env.production`

3. **Prisma Client Generated** - Both frontend and backend Prisma clients regenerated for MongoDB

## ⚠️ Connection Issue

The MongoDB Atlas connection is timing out. This is typically due to:

### **Issue: IP Whitelisting**
MongoDB Atlas requires your IP address to be whitelisted.

### **Solution:**

1. **Go to MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com/
   - Log in with your credentials

2. **Whitelist Your IP:**
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose one of:
     - **Add Current IP Address** (for development)
     - **Allow Access from Anywhere** (0.0.0.0/0) for testing/production
   - Click "Confirm"

3. **Wait 2-3 minutes** for the changes to propagate

4. **Test the connection:**
   ```powershell
   cd pinesaas-blogs
   npx prisma db push
   ```

## 📝 Your Connection Details

**Connection String Format:**
```
mongodb+srv://pinesaasUser:PinesaasbloG%4025@cluster0.edd72n6.mongodb.net/pinesaas_blogs?retryWrites=true&w=majority&appName=Cluster0
```

**Note:** The password `PinesaasbloG@25` is URL-encoded as `PinesaasbloG%4025` (@ → %40)

## 🔄 Next Steps After Connection Works

1. **Push Schema to MongoDB:**
   ```powershell
   cd pinesaas-blogs
   npx prisma db push
   ```

2. **Seed Initial Data (Optional):**
   ```powershell
   npx prisma db seed
   ```

3. **Test the Application:**
   ```powershell
   npm run dev
   ```

4. **For Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

## 🔍 Key Changes Made

### Many-to-Many Relationships
The `Blog` ↔ `Tag` relationship now uses explicit ID arrays:

**Before (MySQL):**
```prisma
model Blog {
  tags Tag[] @relation("blogtotag")
}

model Tag {
  blogs Blog[] @relation("blogtotag")
}
```

**After (MongoDB):**
```prisma
model Blog {
  tags    Tag[]    @relation("blogtotag", fields: [tagIds], references: [id])
  tagIds  String[] @db.ObjectId
}

model Tag {
  blogs   Blog[]   @relation("blogtotag", fields: [blogIds], references: [id])
  blogIds String[] @db.ObjectId
}
```

### Self-Referencing Relationships
`FeedbackComment` self-reference uses `NoAction` instead of `Cascade`:

```prisma
parent FeedbackComment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
```

This is required for MongoDB to avoid circular cascade deletes.

## 🧪 Testing Database Connection

Create a test file to verify connection:

**test-mongo-connection.js:**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Run it with:
```powershell
node test-mongo-connection.js
```

## 📚 MongoDB vs MySQL Differences

1. **No Migrations** - MongoDB is schemaless, use `prisma db push` instead of `prisma migrate`
2. **ObjectId** - All IDs are MongoDB ObjectIds (24-character hex strings)
3. **No Foreign Keys** - MongoDB doesn't enforce foreign keys at database level
4. **Indexes** - Created automatically by MongoDB, manual indexing available via MongoDB Compass or driver
5. **Text Fields** - No size limits like MySQL's TEXT vs VARCHAR

## 🚀 Deployment Notes

When deploying to production:
1. Ensure production server IPs are whitelisted in MongoDB Atlas
2. Use environment-specific connection strings
3. MongoDB Atlas handles scaling and backups automatically
4. Monitor connection limits based on your cluster tier

## 🛠️ Troubleshooting

### Connection Timeout
- Check IP whitelist in MongoDB Atlas
- Verify firewall/network settings
- Test connection from MongoDB Compass

### Authentication Failed
- Verify username: `pinesaasUser`
- Verify password is URL-encoded: `PinesaasbloG%4025`
- Check database user permissions in Atlas

### Schema Errors
- Run `npx prisma validate` to check schema
- Regenerate client: `npx prisma generate`

## 📞 Support Resources

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Prisma MongoDB Guide: https://www.prisma.io/docs/concepts/database-connectors/mongodb
- Connection String Format: https://www.mongodb.com/docs/manual/reference/connection-string/
