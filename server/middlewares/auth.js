const jwt = require("jsonwebtoken");
const { User } = require('../models/association');


module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization");

        console.log(token)

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, "MY_SECRET_KEY"); 
        console.log("decoded",decoded)

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token." });
        }

        req.userId = decoded.userId;

        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = user; 
       
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        res.status(401).json({ message: "Invalid or expired token." });
    }
};
