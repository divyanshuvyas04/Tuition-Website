const mongoose = require('mongoose');

const homeImageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Victory Classes'
    },
    description: {
        type: String,
        default: 'Empowering students with quality education'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HomeImage', homeImageSchema); 