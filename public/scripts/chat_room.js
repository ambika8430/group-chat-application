document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.getElementById("message");
    const user_id  = sessionStorage.getItem("user_id")
    const newMessageIndicator = document.getElementById("newMessageIndicator");

    const group_id = sessionStorage.getItem("group_id")
    const chatBox = document.getElementById(`chat-box-${group_id}`);
    const group_name = sessionStorage.getItem("group_name")
    const fileInput = document.getElementById("fileInput");

    const token =  sessionStorage.getItem("token")

    const socket = io("http://localhost:3000", {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
            token: token
        }
    });

    function showNewMessageIndicator() {
        newMessageIndicator.style.display = "block";
    }

    newMessageIndicator.addEventListener('click',()=>{
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
        newMessageIndicator.style.display = "none";
    })

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    
        if (err.message.includes("Invalid token") || err.message.includes("Unauthorized")) {
            window.location.href = "sign-in.html"; 
        }
    });

    socket.on("connect", () => {

        socket.emit("join-group", group_id);

        socket.emit('user-joined')
    });

    socket.on("user-joined", (username) => {
        const msg = document.createElement("div");
        msg.classList.add("chat-message", "join");
        msg.textContent = `${username} joined the chat`;
        chatBox.appendChild(msg);
        showNewMessageIndicator()
    });

    socket.on("user-left", (name) => {
        const msg = document.createElement("div");
        msg.classList.add("chat-message", "join");
        msg.textContent = `${name} left the chat`;
        chatBox.appendChild(msg);
        showNewMessageIndicator()
    });    

    socket.on("message", (data) => {
        let message = data.message.trim();
        let fileExtension = message.split('.').pop().toLowerCase();
    
        let content = message; // Default: Treat as plain text
    
        // Check if message is a URL (for files)
        if (message.startsWith("http") && message.includes(":")) {
            content = `<a href="${message}" target="_blank" class="text-primary">${message}</a>`;
    
            // Check if it's an image
            if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
                content = `<img src="${message}" alt="Image" style="max-width: 200px; border-radius: 8px;">`;
            }
            // Check if it's a video
            else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
                content = `<video controls style="max-width: 300px; border-radius: 8px;">
                              <source src="${message}" type="video/${fileExtension}">
                              Your browser does not support the video tag.
                           </video>`;
            }
            // Check if it's an audio file
            else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
                content = `<audio controls>
                              <source src="${message}" type="audio/${fileExtension}">
                              Your browser does not support the audio tag.
                           </audio>`;
            }
            // Check if it's a PDF
            else if (fileExtension === "pdf") {
                content = `<iframe src="${message}" style="width: 300px; height: 400px; border-radius: 8px;"></iframe>`;
            }
        }
    
        const msg = document.createElement("div");
        msg.classList.add("chat-message", data.user_id == user_id ? "user" : "other");
        msg.innerHTML = `<strong>${data.username}:</strong> ${content}`;
        chatBox.appendChild(msg);
    
        if (data.user_id != user_id) {
            showNewMessageIndicator();
        } else {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });    

    socket.on("receive-file", ({ fileUrl, fileName, username, user_id }) => {
        const chatItem = document.createElement("div");
    
        chatItem.innerHTML = `<strong>${username}:</strong> 
            <a href="${fileUrl}" target="_blank">📎 ${fileName}</a>`;
    
        chatBox.appendChild(chatItem);
        if(user_id!=user_id){
            showNewMessageIndicator()
        }else{
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
    

    const send_message_btn = document.getElementById("send-message")

    const sendFile = async(file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:3000/api/file", {
                method: "POST",
                headers: { 
                    "Authorization": token
                },
                body: formData
            });

            const data = await response.json();
            console.log(data);
            return { fileUrl: data.data.fileUrl, fileName: data.data.fileName }
        } catch (error) {
            console.error("File upload failed:", error);
            return;
        }
    }

    const sendMessage = async() => {
        const message = messageInput.value.trim();
        const file = fileInput.files[0]; 

        console.log({ group_id, message })

        if (!fileInput && !message) {
            return;
        }

        let fileUrl = null;
        let fileName = null;

        if(fileInput){
            const data = await sendFile(file)
            fileUrl = data.fileUrl
            fileName = data.fileName
        }

        if (message){
            socket.emit("send-message", { message, group_id } );  
            messageInput.value = ""; 
        }

        if(fileUrl){
            socket.emit("send-file", { fileUrl, fileName, group_id } );
            fileInput.value = "";
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") { 
            event.preventDefault();
            sendMessage()
        }
    });

    send_message_btn.addEventListener('click', sendMessage);
});