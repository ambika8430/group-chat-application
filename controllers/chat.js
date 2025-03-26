const { Chat } = require("../models/association");
const { Op } = require("sequelize");

exports.createChat = async (message, group_id, user_id, username) => {
    console.log(message, group_id, user_id, username)
    try {
        const chat = await Chat.create({ 
            message,
            user_id,
            group_id,
            username
        });
        return chat; 
    } catch (error) {
        console.error("Error creating chat:", error);
        return null; 
    }
};

exports.getAllChats = async (req, res) => {
    try {
        const { group_id, lastMessageId } = req.params;

        if (!group_id) {
            return res.status(400).json({ error: "Group ID is required" });
        }

        const chatQuery = {
            where: { group_id },
            attributes: ["id", "message", "group_id", "user_id", "username", "createdAt"],
            order: [["id", "DESC"]],
            limit: 20,
        };

        if (lastMessageId) {
            chatQuery.where.id = { [Op.lt]: lastMessageId };
        }

        console.log("chatquery",chatQuery)

        const data = await Chat.findAll(chatQuery);

        return res.status(200).json(data);
    } catch (error) {
        console.log("Error fetching all chats:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
