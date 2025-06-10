const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('./config/cloudinary');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// File paths
const dataDir = path.join(__dirname, 'data');
const registrationsPath = path.join(dataDir, 'registrations.json');
const resultsPath = path.join(dataDir, 'results.json');
const adminsPath = path.join(dataDir, 'admins.json');

// Helper function to generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper function to ensure data has IDs
function ensureDataHasIds(data) {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
        if (!item._id) {
            item._id = generateId();
        }
        return item;
    });
}

// Initialize data directory and files
function initializeData() {
    try {
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        // Initialize registrations file
        if (!fs.existsSync(registrationsPath)) {
            fs.writeFileSync(registrationsPath, '[]');
        }

        // Initialize results file
        if (!fs.existsSync(resultsPath)) {
            fs.writeFileSync(resultsPath, '[]');
        }

        // Initialize admins file
        if (!fs.existsSync(adminsPath)) {
            const defaultAdmin = {
                username: 'admin',
                password: bcrypt.hashSync('admin123', 10)
            };
            fs.writeFileSync(adminsPath, JSON.stringify([defaultAdmin], null, 2));
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Initialize data
initializeData();

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
        const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
        const admin = admins.find(a => a.username === username);

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
        const { studentName, class: studentClass, phone, email } = req.body;
        let photoUrl = null;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { upload_preset: 'victory-classes-students' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            photoUrl = result.secure_url;
        }

        const registration = {
            _id: generateId(),
            studentName,
            class: studentClass,
            phone,
            email,
            photoUrl,
            date: new Date().toISOString()
        };

        const registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
        registrations.unshift(registration);
        fs.writeFileSync(registrationsPath, JSON.stringify(registrations, null, 2));

        res.json(registration);
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
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
                { upload_preset: 'victory-classes-results' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;

        const resultData = {
            _id: generateId(),
            title: req.body.title,
            description: req.body.description,
            imageUrl,
            date: new Date().toISOString()
        };

        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        results.unshift(resultData);
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

        res.json(resultData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post result' });
    }
});

app.get('/api/registrations', auth, (req, res) => {
    try {
        const registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
        // Ensure all registrations have IDs
        const updatedRegistrations = ensureDataHasIds(registrations);
        if (updatedRegistrations.length !== registrations.length) {
            fs.writeFileSync(registrationsPath, JSON.stringify(updatedRegistrations, null, 2));
        }
        res.json(updatedRegistrations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

app.get('/api/results', (req, res) => {
    try {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        // Ensure all results have IDs
        const updatedResults = ensureDataHasIds(results);
        if (updatedResults.length !== results.length) {
            fs.writeFileSync(resultsPath, JSON.stringify(updatedResults, null, 2));
        }
        res.json(updatedResults);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Delete registration
app.delete('/api/registrations/:id', auth, async (req, res) => {
    try {
        const registrations = JSON.parse(fs.readFileSync(registrationsPath));
        // Ensure all registrations have IDs before trying to delete
        const updatedRegistrations = ensureDataHasIds(registrations);
        const index = updatedRegistrations.findIndex(r => r._id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        
        updatedRegistrations.splice(index, 1);
        fs.writeFileSync(registrationsPath, JSON.stringify(updatedRegistrations, null, 2));
        
        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ message: 'Error deleting registration' });
    }
});

// Delete result
app.delete('/api/results/:id', auth, async (req, res) => {
    try {
        const results = JSON.parse(fs.readFileSync(resultsPath));
        // Ensure all results have IDs before trying to delete
        const updatedResults = ensureDataHasIds(results);
        const index = updatedResults.findIndex(r => r._id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ message: 'Result not found' });
        }
        
        updatedResults.splice(index, 1);
        fs.writeFileSync(resultsPath, JSON.stringify(updatedResults, null, 2));
        
        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ message: 'Error deleting result' });
    }
});

app.listen(port); 