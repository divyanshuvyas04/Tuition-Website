const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    motherName: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    class: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: false,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    aadharNumber: {
        type: String,
        required: true,
        trim: true,
        unique: false,
        validate: {
            validator: function(v) {
                return /^\d{12}$/.test(v);
            },
            message: 'Aadhar number must be exactly 12 digits'
        }
    },
    formFees: {
        type: Number,
        required: true,
        enum: [50, 100, 200, 500]
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    photoUrl: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema); 