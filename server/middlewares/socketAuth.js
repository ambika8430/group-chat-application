const jwt = require("jsonwebtoken");
const { getUser } = require('../controllers/user')

const socketAuth = async(socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user = await getUser(decoded.userId)
        socket.user = user;
        next(); 
    } catch (error) {
        next(new Error("Authentication error: Invalid token"));
    }
};

module.exports = socketAuth;
