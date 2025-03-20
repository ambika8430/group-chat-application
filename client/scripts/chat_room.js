document.addEventListener("DOMContentLoaded", function () {

    const socket = io("http://localhost:3000", {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
            token: sessionStorage.getItem("token")
        }
    });
    socket.on("connect", () => {
        console.log("Connected to WebSocket server:", socket.id);
    });

    const chatBox = document.getElementById("chat-box");
    const messageInput = document.getElementById("message");

    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token")

    const getAllChats = async() => {
        try {
            const res = await fetch(`http://localhost:3000/chat`, {
                method: "GET",
                headers: { "Authorization": token }
            });
            const data = await res.json()
            console.log(data)
            
        } catch (error) {
            console.error(error);
        }
    }

    if (!username) {
        window.location.href = "sign-in.html";
    }else{
        getAllChats()
        socket.emit('user-joined', username)
    }

    socket.on("user-joined", (name) => {
        const msg = document.createElement("div");
        msg.classList.add("chat-message", "join");
        msg.textContent = `${name} joined the chat`;
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
        const msg = document.createElement("div");
        msg.classList.add("chat-message", data.username === username ? "user" : "other");
        msg.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    const send_message_btn = document.getElementById("send-message")

    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (message !== "") {
            socket.emit("send-message", message ); 
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