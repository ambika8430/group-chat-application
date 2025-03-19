const bcrypt = require("bcrypt");
const User = require('../models/user');
const jwt = require('jsonwebtoken')


exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Plain Password:", password);
        console.log("Hashed Password:", hashedPassword);

        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        const token = jwt.sign({ userId: user.id }, "MY_SECRET_KEY", { expiresIn: "1h" });

        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Received Email:", email);
        console.log("Received Password:", password);

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log("Stored Password (hashed):", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, "MY_SECRET_KEY", { expiresIn: "1h" });

        res.status(200).json({ message: "Sign-in successful", token });
    } catch (error) {
        console.error("Error in verifyUser:", error);
        res.status(500).json({ error: error.message });
    }
};