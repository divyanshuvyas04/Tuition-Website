const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const Registration = require('./models/Registration');
const Result = require('./models/Result');
const Admin = require('./models/Admin');
const connectDB = require('./config/database');

// File paths
const dataDir = path.join(__dirname, 'data');
const registrationsPath = path.join(dataDir, 'registrations.json');
const resultsPath = path.join(dataDir, 'results.json');
const adminsPath = path.join(dataDir, 'admins.json');

async function migrateData() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        // Migrate registrations
        if (fs.existsSync(registrationsPath)) {
            const registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
            if (registrations.length > 0) {
                for (const reg of registrations) {
                    const existingReg = await Registration.findOne({ 
                        studentName: reg.studentName, 
                        email: reg.email,
                        date: reg.date 
                    });
                    
                    if (!existingReg) {
                        const newReg = new Registration({
                            studentName: reg.studentName,
                            class: reg.class,
                            phone: reg.phone,
                            email: reg.email,
                            photoUrl: reg.photoUrl,
                            date: reg.date
                        });
                        await newReg.save();
                        console.log(`Migrated registration: ${reg.studentName}`);
                    }
                }
                console.log(`Migrated ${registrations.length} registrations`);
            }
        }

        // Migrate results
        if (fs.existsSync(resultsPath)) {
            const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
            if (results.length > 0) {
                for (const result of results) {
                    const existingResult = await Result.findOne({ 
                        title: result.title, 
                        date: result.date 
                    });
                    
                    if (!existingResult) {
                        const newResult = new Result({
                            title: result.title,
                            description: result.description,
                            imageUrl: result.imageUrl,
                            date: result.date
                        });
                        await newResult.save();
                        console.log(`Migrated result: ${result.title}`);
                    }
                }
                console.log(`Migrated ${results.length} results`);
            }
        }

        // Migrate admins
        if (fs.existsSync(adminsPath)) {
            const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
            if (admins.length > 0) {
                for (const admin of admins) {
                    const existingAdmin = await Admin.findOne({ username: admin.username });
                    
                    if (!existingAdmin) {
                        const newAdmin = new Admin({
                            username: admin.username,
                            password: admin.password
                        });
                        await newAdmin.save();
                        console.log(`Migrated admin: ${admin.username}`);
                    }
                }
                console.log(`Migrated ${admins.length} admins`);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateData(); 