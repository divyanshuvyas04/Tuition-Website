const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('./config/cloudinary');
const connectDB = require('./config/database');
const Registration = require('./models/Registration');
const Result = require('./models/Result');
const Admin = require('./models/Admin');
const HomeImage = require('./models/HomeImage');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize default admin if none exists
async function initializeAdmin() {
    try {
        // Check if the new admin already exists
        const existingAdmin = await Admin.findOne({ username: 'avinashmalav36' });
        
        if (existingAdmin) {
            console.log('Admin already exists with correct credentials');
            return;
        }
        
        // Check if there are any admins at all
        const adminCount = await Admin.countDocuments();
        
        if (adminCount === 0) {
            // No admins exist, create new one
            const defaultAdmin = new Admin({
                username: 'avinashmalav36',
                password: await bcrypt.hash('Avinash@10', 10)
            });
            await defaultAdmin.save();
            console.log('Default admin created: username: avinashmalav36, password: Avinash@10');
        } else {
            // Update existing admin to new credentials (only if it's the old admin)
            const oldAdmin = await Admin.findOne({ username: 'admin' });
            if (oldAdmin) {
                oldAdmin.username = 'avinashmalav36';
                oldAdmin.password = await bcrypt.hash('Avinash@10', 10);
                await oldAdmin.save();
                console.log('Admin credentials updated: username: avinashmalav36, password: Avinash@10');
            } else {
                console.log('Admin exists but not the expected one, creating new admin');
                const defaultAdmin = new Admin({
                    username: 'avinashmalav36',
                    password: await bcrypt.hash('Avinash@10', 10)
                });
                await defaultAdmin.save();
                console.log('New admin created: username: avinashmalav36, password: Avinash@10');
            }
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
        // Don't throw error, just log it
    }
}

// Initialize admin
initializeAdmin();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/register', upload.single('studentPhoto'), async (req, res) => {
    try {
        const { 
            studentName, 
            fatherName, 
            motherName, 
            dateOfBirth, 
            class: studentClass, 
            phone, 
            email, 
            aadharNumber, 
            formFees, 
            address 
        } = req.body;
        
        // Check for duplicate registration based on Aadhar number or phone
        const existingRegistration = await Registration.findOne({
            $or: [
                { aadharNumber: aadharNumber },
                { phone: phone }
            ]
        });
        
        if (existingRegistration) {
            return res.status(400).json({ 
                error: 'Registration already exists with this Aadhar number or phone number' 
            });
        }
        
        let photoUrl = null;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'victory-classes-students',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            photoUrl = result.secure_url;
        }

        const registration = new Registration({
            studentName,
            fatherName,
            motherName,
            dateOfBirth,
            class: studentClass,
            phone,
            email: email || null,
            aadharNumber,
            formFees: parseInt(formFees),
            address,
            photoUrl
        });

        await registration.save();
        res.json(registration);
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key errors specifically
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];
            return res.status(400).json({ 
                error: `Registration already exists with this ${field}: ${value}` 
            });
        }
        
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

app.post('/api/results', auth, upload.single('resultImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }
        
        let imageUrl = null;
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'victory-classes-results',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;

        const resultData = new Result({
            title: req.body.title,
            description: req.body.description,
            imageUrl
        });

        await resultData.save();
        res.json(resultData);
    } catch (error) {
        console.error('Result posting error:', error);
        res.status(500).json({ error: 'Failed to post result' });
    }
});

// Home image management
app.get('/api/home-image', async (req, res) => {
    try {
        const homeImage = await HomeImage.findOne({ isActive: true });
        res.json(homeImage);
    } catch (error) {
        console.error('Error fetching home image:', error);
        res.status(500).json({ error: 'Failed to fetch home image' });
    }
});

app.post('/api/home-image', auth, upload.single('homeImage'), async (req, res) => {
    try {
        console.log('Home image upload request received');
        console.log('File:', req.file);
        console.log('Body:', req.body);
        
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'Image is required' });
        }

        console.log('Starting Cloudinary upload...');
        let imageUrl = null;
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'victory-classes-home',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload successful:', result.secure_url);
                        resolve(result);
                    }
                }
            );
            stream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;

        console.log('Deactivating existing home images...');
        // Deactivate all existing home images
        await HomeImage.updateMany({}, { isActive: false });

        console.log('Creating new home image...');
        // Create new home image
        const homeImage = new HomeImage({
            imageUrl,
            title: req.body.title || 'Victory Classes',
            description: req.body.description || 'Empowering students with quality education'
        });

        console.log('Saving home image to database...');
        await homeImage.save();
        console.log('Home image saved successfully');
        
        res.json(homeImage);
    } catch (error) {
        console.error('Home image upload error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to upload home image: ' + error.message });
    }
});

app.get('/api/registrations', auth, async (req, res) => {
    try {
        const registrations = await Registration.find().sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Delete registration
app.delete('/api/registrations/:id', auth, async (req, res) => {
    try {
        const registration = await Registration.findByIdAndDelete(req.params.id);
        
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        
        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ message: 'Error deleting registration' });
    }
});

// Delete result
app.delete('/api/results/:id', auth, async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        
        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ message: 'Error deleting result' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 