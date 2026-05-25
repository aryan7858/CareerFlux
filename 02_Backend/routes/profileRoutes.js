const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    uploadPortfolio,
    deletePortfolio,
    toggleEndorsement,
    requestVerification
} = require('../controllers/profileController');

const { protect, authorize } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = '';
        if (file.fieldname === 'portfolioFile') {
            uploadPath = path.join(__dirname, '..', 'uploads', 'portfolio');
        } else if (file.fieldname === 'verificationDoc') {
            uploadPath = path.join(__dirname, '..', 'uploads', 'verifications');
        } else {
            uploadPath = path.join(__dirname, '..', 'uploads', 'temp');
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});

// File filter: accept images, PDFs, ZIPs for portfolio, and images/PDFs for verification
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|zip|rar|tar|octet-stream/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, true); // Allow flexible uploads, validation is handled gracefully
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max limit
});

// ─── Portfolio Routes (Jobseeker only) ─────────────────────────────────────────
router.post('/portfolio/upload', protect, authorize('jobseeker'), upload.single('portfolioFile'), uploadPortfolio);
router.delete('/portfolio/:projectId', protect, authorize('jobseeker'), deletePortfolio);

// ─── Endorsement Routes (Shared) ───────────────────────────────────────────────
router.post('/users/:userId/endorse/:skill', protect, toggleEndorsement);

// ─── Verification Routes (Shared) ──────────────────────────────────────────────
router.post('/verify/request', protect, upload.single('verificationDoc'), requestVerification);

module.exports = router;
