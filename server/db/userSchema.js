// db/userSchema.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // Auth fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'manager'],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    carouselItems: [
      {
        title: String,
        venue: String,
        achievements: String,
        imageUrl: String,
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
      }
    ],
    // OTP-based reset fields (single secure approach)
    passwordResetOTP: String,    // hashed OTP
    otpExpires: Date,           // OTP expiry

    // Password reset token (in case you still want token-based resets)
    passwordResetToken: String,
    passwordResetExpires: Date,

    passwordChangedAt: Date,

    // Personal information
    professionalTitle: String,
    profileImage: {
      type: String,
      default: ''
    }, // URL
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    dateOfBirth: Date,
    phoneNumber: String,
    alternateEmail: String,
    socialMedia: {
      twitter: String,
      linkedin: String,
      github: String,
      researchGate: String,
      googleScholar: String,
      ORCID: String,
    },

    // Affiliation details
    affiliation: {
      institution: String,
      department: String,
      position: String,
      faculty: String,
      joiningDate: Date,
      officeLocation: String,
      officeHours: String,
    },

    // Location information
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      timeZone: String,
    },

    // Professional details
    bio: String,
    education: [
      {
        degree: String,
        field: String,
        institution: String,
        grade: String,
        startdate: String,
        enddate: String,
        description: String,
      },
    ],
    crashcourses: [
      {
        course: String,
        field: String,
        organization: String,
      },
    ],
    workExperience: [
      {
        position: String,
        organization: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    awards: [
      {
        title: String,
        year: Number,
        description: String,
      },
    ],

    // Skills and interests
    researchInterests: [String],
    teachingInterests: [String],
    skills: [String],
    technicalSkills: [
      {
        name: String,
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
      },
    ],
    languages: [
      {
        name: String,
        proficiency: {
          type: String,
          enum: ['basic', 'conversational', 'professional', 'fluent', 'native'],
        },
      },
    ],
    hobbies: [String],

    // Settings and preferences
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    certificates: [
      {
        title: String,
        organization: String,
        issueDate: String,
        certID: String,
        credentialslink: String,
      },
    ],

    // Metadata
    lastActive: Date,
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware for hashing password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // update passwordChangedAt so tokens issued before are invalid
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method for checking password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ====== OTP methods (single secure implementation) ======
// Creates a 6-digit OTP, stores hashed OTP and expiry, returns the raw OTP
userSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  // Hash the OTP before storing
  this.passwordResetOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Verify candidate OTP (raw) by hashing and comparing + expiry check
userSchema.methods.verifyOTP = function (candidateOTP) {
  if (!this.passwordResetOTP || !this.otpExpires) return false;
  if (Date.now() > this.otpExpires) return false;

  const hashed = crypto.createHash('sha256').update(candidateOTP).digest('hex');
  return this.passwordResetOTP === hashed;
};

// Clear stored OTP fields
userSchema.methods.clearOTP = function () {
  this.passwordResetOTP = undefined;
  this.otpExpires = undefined;
  return this;
};

// Check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token (optional token-based approach)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Invalidate tokens (e.g., after admin action)
userSchema.methods.invalidateAllTokens = function () {
  this.passwordChangedAt = Date.now() - 1000;
  return this;
};

module.exports = mongoose.model('User', userSchema);















































// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');

// const userSchema = new mongoose.Schema(
//   {
//     // Auth fields
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       unique: true,
//       match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 8,
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ['superadmin', 'manager'],
//       required: true,
//     },
//     isApproved: {
//       type: Boolean,
//       default: false,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       default: null,
//     },
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//     passwordChangedAt: Date,
//     passwordResetOTP: String,    // For OTP-based reset (add this if not present)
//     otpExpires: Date,           // For OTP expiration (add this if not present)

//     // Personal information
//     professionalTitle: String,
//     profileImage: String, // URL
//     gender: {
//       type: String,
//       enum: ['male', 'female'],
//     },
//     dateOfBirth: Date,
//     phoneNumber: String,
//     alternateEmail: String,
//     socialMedia: {
//       twitter: String,
//       linkedin: String,
//       github: String,
//       researchGate: String,
//       googleScholar: String,
//       ORCID: String,
//     },
    
//     // Affiliation details
//     affiliation: {
//       institution: String,
//       department: String,
//       position: String,
//       faculty: String,
//       joiningDate: Date,
//       officeLocation: String,
//       officeHours: String,
//     },
    
//     // Location information
//     location: {
//       address: String,
//       city: String,
//       state: String,
//       country: String,
//       postalCode: String,
//       timeZone: String,
//     },
    
//     // Professional details
//     bio: String,
//     education: [
//       {
//         degree: String,
//         field: String,
//         institution: String,
//         grade: String,
//         startdate: String,
//         enddate: String,
//         description: String,
//       }
//     ],
//     crashcourses: [
//       {
//         course: String,
//         field: String,
//         organization: String
//       }
//     ],
//     workExperience: [
//       {
//         position: String,
//         organization: String,
//         startDate: Date,
//         endDate: Date,
//         current: Boolean,
//         description: String,
//       }
//     ],
//     awards: [
//       {
//         title: String,
//         year: Number,
//         description: String,
//       }
//     ],
    
//     // Skills and interests
//     researchInterests: [String],
//     teachingInterests: [String],
//     skills: [String],
//     technicalSkills: [
//       {
//         name: String,
//         level: {
//           type: String,
//           enum: ['beginner', 'intermediate', 'advanced', 'expert'],
//         }
//       }
//     ],
//     languages: [
//       {
//         name: String,
//         proficiency: {
//           type: String,
//           enum: ['basic', 'conversational', 'professional', 'fluent', 'native'],
//         }
//       }
//     ],
//     hobbies: [String],
    
//     // Settings and preferences
//     notificationPreferences: {
//       emailNotifications: { type: Boolean, default: true },
//       pushNotifications: { type: Boolean, default: true },
//     },
//     certificates: [
//       {
//       title: String,
//       organization: String,
//       issueDate: String,
//       certID: String,
//       credentialslink: String,
//       }
//     ],
    
//     // Metadata
//     lastActive: Date,
//     profileCompletion: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Middleware for hashing password
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Instance method for checking password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };
// // Generate OTP
// userSchema.methods.createOTP = function() {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//   this.passwordResetOTP = otp;
//   this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   return otp;
// };

// // Verify OTP
// userSchema.methods.verifyOTP = function(otp) {
//   return this.passwordResetOTP === otp && this.otpExpires > Date.now();
// };

// // Clear OTP
// userSchema.methods.clearOTP = function() {
//   this.passwordResetOTP = undefined;
//   this.otpExpires = undefined;
// };
// // Check if password changed after JWT was issued
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// // Generate password reset token
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   return resetToken;
// };
// // ====== Enhanced OTP Methods ====== //
// userSchema.methods.createOTP = function() {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
//   // Hash the OTP before storing (security improvement)
//   this.passwordResetOTP = crypto
//     .createHash('sha256')
//     .update(otp)
//     .digest('hex');
    
//   this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
//   return otp;
// };

// userSchema.methods.verifyOTP = function(candidateOTP) {
//   if (!this.passwordResetOTP || !this.otpExpires) return false;
  
//   // Hash the candidate OTP for comparison
//   const hashedOTP = crypto
//     .createHash('sha256')
//     .update(candidateOTP)
//     .digest('hex');
    
//   return this.passwordResetOTP === hashedOTP && Date.now() < this.otpExpires;
// };

// userSchema.methods.clearOTP = function() {
//   this.passwordResetOTP = undefined;
//   this.otpExpires = undefined;
//   return this;
// };

// // ====== Additional Security Method ====== //
// userSchema.methods.invalidateAllTokens = function() {
//   this.passwordChangedAt = Date.now() - 1000; // Makes all existing tokens invalid
//   return this;
// };

// module.exports = mongoose.model('User', userSchema);
