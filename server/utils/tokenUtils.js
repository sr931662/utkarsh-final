const jwt = require('jsonwebtoken');

const generateAdminToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            fname: user.fname,
            isAdmin: user.isAdmin
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = { generateAdminToken };