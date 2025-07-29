# MongoDB Setup Guide for Victory Classes Website

## Step-by-Step MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create your account with email and password

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your location
5. Click "Create"

### 3. Set Up Security
1. **Create Database User:**
   - Click "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username (e.g., `victory_admin`)
   - Enter password (save this securely!)
   - Select "Read and write to any database"
   - Click "Add User"

2. **Configure Network Access:**
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses
   - Click "Confirm"

### 4. Get Connection String
1. Click "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your values

### 5. Update Environment Variables
1. Open your `.env` file
2. Replace the `MONGODB_URI` line with your actual connection string:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/victory_classes?retryWrites=true&w=majority
   ```

## Project Updates Made

### New Files Created:
- `config/database.js` - MongoDB connection configuration
- `models/Registration.js` - Student registration model
- `models/Result.js` - Exam results/posts model  
- `models/Admin.js` - Admin user model
- `migrate-data.js` - Data migration script

### Updated Files:
- `package.json` - Added mongoose dependency
- `server.js` - Replaced JSON file operations with MongoDB operations
- `.env` - Added MongoDB connection string

## Running the Updated Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Connection
1. Update your `.env` file with the MongoDB connection string
2. Make sure your MongoDB Atlas cluster is running

### 3. Migrate Existing Data (Optional)
If you have existing data in JSON files, run the migration:
```bash
node migrate-data.js
```

### 4. Start the Application
```bash
npm start
```

## Features Now Available

### Database Storage:
- ✅ Student registrations stored in MongoDB
- ✅ Exam results and posts stored in MongoDB
- ✅ Admin credentials stored in MongoDB
- ✅ Automatic ID generation and timestamps
- ✅ Data persistence across server restarts

### Enhanced Functionality:
- ✅ Better data validation
- ✅ Improved error handling
- ✅ Scalable database architecture
- ✅ Automatic indexing for better performance
- ✅ Data backup and recovery through MongoDB Atlas

### Admin Features:
- ✅ Default admin account created automatically
- ✅ Username: `admin`, Password: `admin123`
- ✅ Secure password hashing
- ✅ JWT-based authentication

## MongoDB Atlas Dashboard Features

### Monitor Your Database:
1. **Overview Tab:**
   - View cluster status and performance
   - Monitor connection count
   - Check storage usage

2. **Collections Tab:**
   - View all collections (registrations, results, admins)
   - Browse and edit documents
   - Export data

3. **Performance Tab:**
   - Monitor query performance
   - View slow queries
   - Optimize database operations

### Security Features:
- ✅ IP whitelisting
- ✅ Database user management
- ✅ SSL/TLS encryption
- ✅ Automated backups
- ✅ Point-in-time recovery

## Troubleshooting

### Common Issues:

1. **Connection Failed:**
   - Check your connection string in `.env`
   - Verify username and password
   - Ensure IP address is whitelisted

2. **Authentication Error:**
   - Verify database user credentials
   - Check user permissions

3. **Migration Issues:**
   - Ensure MongoDB is connected before running migration
   - Check console for error messages

### Support:
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/docs/

## Next Steps

1. **Backup Strategy:** Set up automated backups in MongoDB Atlas
2. **Monitoring:** Configure alerts for database performance
3. **Scaling:** Upgrade to paid tier when needed
4. **Security:** Implement additional security measures
5. **Performance:** Add database indexes for better performance

Your tuition website now has a robust, scalable database backend with MongoDB! 