// multer.js - Update to handle multiple files
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Dynamic storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Always use "Utkarsh-profile" for profile images
    if (file.fieldname === 'profileImage') {
      // Delete old profile image if exists
      const oldFiles = fs.readdirSync(uploadDir).filter(fn => fn.startsWith('Utkarsh-profile'));
      oldFiles.forEach(file => fs.unlinkSync(path.join(uploadDir, file)));
      
      // Use the same name with original extension
      const ext = path.extname(file.originalname);
      cb(null, `Utkarsh-profile${ext}`);
    } else if (file.fieldname === 'carousel') {
      // For carousel images, use timestamp + original name
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `carousel-${uniqueSuffix}${ext}`);
    } else {
      // For other files
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create specific upload handlers
exports.uploadProfile = upload.single('profileImage');
exports.uploadCarousel = upload.array('carousel', 10); // Allow up to 10 carousel images
exports.uploadMultiple = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'carousel', maxCount: 10 }
]);

module.exports = upload;









// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure upload directory exists
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Dynamic storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // Always use "Utkarsh-profile" for profile images
//     if (file.fieldname === 'profileImage') {
//       // Delete old profile image if exists
//       const oldFiles = fs.readdirSync(uploadDir).filter(fn => fn.startsWith('Utkarsh-profile'));
//       oldFiles.forEach(file => fs.unlinkSync(path.join(uploadDir, file)));
      
//       // Use the same name with original extension
//       const ext = path.extname(file.originalname);
//       cb(null, `Utkarsh-profile${ext}`);
//     } else {
//       // For other files (like carousel), use original behavior
//       const prefix = file.fieldname === 'carouselImage' ? 'carousel-' : '';
//       cb(null, `${prefix}${Date.now()}${path.extname(file.originalname)}`);
//     }
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed!"), false);
//   }
// };

// const upload = multer({ 
//   storage, 
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// module.exports = upload;



































// // // server/utils/multer.js
// // const multer = require("multer");
// // const path = require("path");

// // // Storage config
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, path.join(__dirname, "../uploads")); // ✅ always server/uploads
// //   },
// //   filename: (req, file, cb) => {
// //     cb(
// //       null,
// //       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
// //     );
// //   },
// // });

// // const fileFilter = (req, file, cb) => {
// //   if (file.mimetype.startsWith("image/")) {
// //     cb(null, true);
// //   } else {
// //     cb(new Error("Only image files are allowed!"), false);
// //   }
// // };

// // const upload = multer({ storage, fileFilter });
// // module.exports = upload;
