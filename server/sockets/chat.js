const { createChat, getAllChats, getChatByUser } = require("../controllers/chat");

const users = {};

const chatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("New user connected:", socket.user?.id, socket.id);

        const userId = socket.user?.id
        const username = socket.user?.username

        socket.on("user-joined", (username) => {
            users[socket.id] = username;
            io.emit("user-joined", username);
        });

        socket.on("send-message", async (message) => {
            try {
                await createChat(message, userId);
                io.emit("message", { message, username });
            } catch (error) {
                console.error("Error saving message:", error);
                socket.emit("error", "Message could not be saved");
            }
        });

        socket.on("get-all-chats", async () => {
            const chats = await getAllChats();
            socket.emit("all-chats", chats);
        });

        socket.on("get-user-chats", async () => {
            const chats = await getChatByUser(userId);
            socket.emit("user-chats", chats);
        });

        socket.on("disconnect", () => {
            const username = users[socket.id];
            if (username) {
                io.emit("user-left", username);
                delete users[socket.id];
            }
        });
    });
};

module.exports = chatSocket;
