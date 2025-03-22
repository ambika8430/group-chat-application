document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const messageInput = document.getElementById("message");
    const user_id  = sessionStorage.getItem("user_id")

    const group_id = sessionStorage.getItem("group_id")
    const group_name = sessionStorage.getItem("group_name")

    console.log("group id", group_id)

    const socket = io("http://localhost:3000", {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
            token: sessionStorage.getItem("token")
        }
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    
        if (err.message.includes("Invalid token") || err.message.includes("Unauthorized")) {
            window.location.href = "sign-in.html"; 
        }
    });

    socket.on("connect", () => {
        console.log("Connected to WebSocket server:", socket.id);

        socket.emit("join-group", group_id);

        socket.emit('user-joined')
    });

    socket.on("user-joined", (username) => {
        const msg = document.createElement("div");
        msg.classList.add("chat-message", "join");
        msg.textContent = `${username} joined the chat`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on("user-left", (name) => {
        const msg = document.createElement("div");
        msg.classList.add("chat-message", "join");
        msg.textContent = `${name} left the chat`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on("message", (data) => {
        const message = data.message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" class="text-primary">$1</a>'
        );
        const msg = document.createElement("div");
        msg.classList.add("chat-message", data.user_id == user_id ? "user" : "other");
        msg.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    const send_message_btn = document.getElementById("send-message")

    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (message !== "") {
            socket.emit("send-message", { message, group_id } ); 
            messageInput.value = ""; 
        }
    }

    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") { 
            event.preventDefault();
            sendMessage()
        }
    });

    send_message_btn.addEventListener('click', sendMessage);
});