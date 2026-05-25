const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel 
    ? path.join('/tmp', 'uploads', 'resumes') 
    : path.join(__dirname, '..', 'uploads', 'resumes');

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Warning: Could not create upload directory:', err.message);
    }
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: userId-timestamp-originalname
        const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// File filter: only allow PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

module.exports = upload;
