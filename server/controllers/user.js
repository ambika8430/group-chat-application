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