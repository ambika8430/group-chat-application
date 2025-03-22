const { createChat } = require("../controllers/chat");

const users = {};

const chatSocket = (io) => {
    io.on("connection", async (socket) => {
        console.log("New user connected:", socket.user?.id, socket.user?.username, socket.id);

        const user_id = socket.user?.id;
        const username = socket.user?.username;

        try {
            // User joins a group chat room
            socket.on("join-group", (group_id) => {
                socket.join(group_id);  // Join the room based on group_id
                console.log(`${username} joined group ${group_id}`);

                // Notify others in the group
                socket.to(group_id).emit("user-joined", username);
            });

            // Handle sending messages within a group
            socket.on("send-message", async ({ message, group_id }) => {
                console.log("Received message:", { message, group_id });

                try {
                    await createChat(message, group_id, user_id, username);
                    io.to(group_id).emit("message", { message, group_id, user_id, username });
                } catch (error) {
                    console.error("Error saving message:", error);
                    socket.emit("error", "Message could not be saved");
                }
            });

            // Handle user disconnection
            socket.on("disconnect", () => {
                console.log(`${username} disconnected`);
                delete users[socket.id];
            });
        } catch (err) {
            console.log(err);
            socket.disconnect();
        }
    });
};

module.exports = chatSocket;
