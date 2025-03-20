const { Chat } = require("../models/association")

exports.createChat = async (message, userId) => {

    try {
        const chat = await Chat.create({ 
            message: message,
            userId: userId 
        });

        return chat; 
    } catch (error) {
        console.error("Error creating chat:", error);
        return null; 
    }
};

exports.getAllChats = async (req, res) => {
    try {

        const chat = await Chat.findAll();

        res.status(201).json({ message: "Chat created successfully", chat });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

exports.getChatByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await sequelize.query(
            `
            SELECT Users.id AS userId, Users.username, Chats.message
            FROM Chats
            LEFT JOIN Users ON Chats.userId = Users.id
            WHERE Chats.userId = :userId
            `,
            { 
                type: QueryTypes.SELECT,
                replacements: { userId }
            }
        );

        res.status(200).json({ message: "Chats retrieved successfully", chats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};