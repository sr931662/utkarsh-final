const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../userSchema'); // Adjust path as needed
require('dotenv').config({ path: './config.env' });

async function getAdminToken() {
  try {
    // 1. Find your admin user
    const admin = await User.findOne({ 
      email: "sr931662@gmail.com" 
    }).select('+pass');

    if (!admin) {
      console.log("Admin user not found");
      return;
    }

    // 2. Verify password (optional check)
    const isMatch = await bcrypt.compare("abc12345", admin.pass);
    if (!isMatch) {
      console.log("Invalid password");
      return;
    }

    // 3. Generate token
    const token = jwt.sign(
      {
        _id: admin._id,
        email: admin.email,
        isAdmin: admin.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log("ADMIN TOKEN:", token);
  } catch (err) {
    console.error("Error:", err);
  }
}

getAdminToken();