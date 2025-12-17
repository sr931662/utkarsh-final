const express = require('express');
const multer = require('multer');
const pubController = require('../controllers/pub-controller');
const authController = require('../controllers/auth-controller');
const authMid = require("../middlewares/auth-mid")

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Public routes
router.get('/', pubController.getAllPublications);
router.get('/stats', pubController.getPublicationStats);
router.get('/:id', pubController.getPublication);

// Protected routes (require authentication)
router.use(authMid.protect);

// Admin-only routes
router.use(authMid.restrictTo('superadmin', 'manager'));

router.post('/create', upload.single('file'), pubController.createPublication);
router.patch('/:id', pubController.updatePublication);
router.delete('/:id', pubController.deletePublication);

module.exports = router;