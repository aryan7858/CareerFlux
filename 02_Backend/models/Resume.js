const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
            enum: ['application/pdf'],
        },
        size: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// One active resume per user
resumeSchema.index({ user: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
