document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");
    const user_id  = sessionStorage.getItem("user_id")
    const create_group = document.getElementById("create-group-btn")
    const groupList = document.getElementById("group-list");
    const chatBox = document.getElementById("chat-box");
    const inviteButton = document.getElementById("invite-button")
    const adminButton = document.getElementById("adminButton");
    const groupNameInput = document.getElementById("edit-group-name");
    const saveGroupChangesBtn = document.getElementById("save-group-changes");
    const memberBox = document.getElementById("group-members-list")
    const cancelGroupChangesBtn = document.getElementById("cancel-group-changes");
    const deleteGroupBtn = document.getElementById("delete-group");

    var group_id = null;
    var group_name = null;
    var inviteLink = null;
    var lastMessageId = 30;
    let isFetching = false

    create_group.addEventListener("click", async() => {
        const groupName = document.getElementById("group-name").value;

        if (groupName.trim()) {
            try{
                const response = await fetch("http://localhost:3000/group", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify({ group_name: groupName }),
                });
                if(response.ok){
                    alert("group created successfully")
                }
            }catch(err){
                console.error(err)
            }
            
            document.getElementById("group-name").value = "";
            bootstrap.Modal.getInstance(document.getElementById("createGroupModal")).hide();
        }
    });

    function appendMessage(data) {
        const message = data.message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" class="text-primary">$1</a>'
        );
        const msg = document.createElement("div");
        msg.classList.add("chat-message", data.user_id == user_id ? "user" : "other");
        msg.innerHTML = `<strong>${data.username}:</strong> ${message}`;
        chatBox.prepend(msg);
    }

    const fetchMessages = async(group_id) => {
        try {
            const response = await fetch(`http://localhost:3000/group/${group_id}/chat/${lastMessageId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                data.forEach(msg => appendMessage(msg));
                lastMessageId = data[data.length - 1]?.id
                console.log(lastMessageId)
            }
        } catch (err) {
            console.error(err);
        }
    }

    if(groupList){
        const getGroupsByUser = async() => {
            try{
                const response = await fetch("http://localhost:3000/group", {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });
                
                if(response.ok){
                    const data = await response.json()
                    console.log(data)
                    const groups = data.data
                    groups.forEach((group) => {
                        const newGroup = document.createElement("li");
                        newGroup.className = "list-group-item my-2 btn";
                        newGroup.dataset.groupId = group.group_id;
                        newGroup.innerHTML = `${group.group_name}`;
                        groupList.appendChild(newGroup);
                    })
                    if(groups.length>=1){
                        group_id = groups[0].group_id
                        group_name = groups[0].group_name
                        sessionStorage.setItem("group_id", group_id)
                        sessionStorage.setItem("group_name", group_name)
                        await fetchMessages(group_id)
                        await showAdminButton(group_id)
                    }
                }
            }catch(err){    
                console.error(err)
            }
        }

        getGroupsByUser()
    }

    const getGroupMembers = async(admin_id) => {
        try{
            const response1 = await fetch(`http://localhost:3000/group/${group_id}/members`, { 
                method: "GET", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
            })

            if(response1.ok){
                const data = await response1.json()
                console.log("members",data)
                groupNameInput.value = group_name;
                memberBox.innerHTML = ""
                data.data.forEach((member, index) => {

                    const memberRow = document.createElement("tr");
    
                    // Serial Number
                    const srNo = document.createElement("td");
                    srNo.textContent = index+1
    
                    // Username
                    const username = document.createElement("td");
                    username.textContent = member.username;
    
                    // User ID
                    const userId = document.createElement("td");
                    userId.textContent = member.user_id;
    
                    // Remove Button
                    const actions = document.createElement("td");
                    const removeButton = document.createElement("button");

                    if(admin_id==member.user_id){
                        removeButton.textContent = "Admin";
                        removeButton.classList.add("btn", "btn-info", "btn-sm");
                    }else{
                        removeButton.textContent = "Remove";
                        removeButton.classList.add("btn", "btn-danger", "btn-sm");
                    }
    
                    actions.appendChild(removeButton);
    
                    // Append to row
                    memberRow.appendChild(srNo);
                    memberRow.appendChild(username);
                    memberRow.appendChild(userId);
                    memberRow.appendChild(actions);
    
                    // Append row to table body
                    memberBox.appendChild(memberRow);
                });
            }
        }catch(err){
            console.error(err)
        }
    }

    const saveGroupChanges = async(userIds, group_name) => {

        try{
            const response1 = await fetch(`http://localhost:3000/group/${group_id}`, { 
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ group_name})
            })

            const response2 = await fetch(`http://localhost:3000/group/${group_id}/member`, { 
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ userIds })
            })
            
            if(response1.ok && response2.ok){
                const data = await response1.json()
                const data2 = await response2.json()
                console.log(data, data2)
            }
        }catch(err){
            console.error(err)
        }
    }

    editGroupModal.addEventListener('click', (e) => {
        let newGroupName = ""
        let userIds = []

        if(e.target.id=="edit-group-name"){
            newGroupName =  e.target.value
        }

        if (e.target.classList.contains("btn-danger")) {
            const row = e.target.closest("tr"); 
            const userId = row.children[2].textContent.trim(); 
    
            userIds.push(userId);
            row.remove(); 
        }

        saveGroupChangesBtn.onclick = () => {
            saveGroupChanges(userIds, newGroupName);
        };
    })

    cancelGroupChangesBtn.addEventListener("hidden.bs.modal", () => {
        window.location.href = "/home.html";
    });    

    const showAdminButton = async(group_id) => {
        try{
            const response2 = await fetch(`http://localhost:3000/group/${group_id}/admin`, { 
                method: "GET", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
            })

            if(response2.ok){
                const data = await response2.json()
                console.log("admin",data)
                console.log(user_id, data.data.user_id)
                if(user_id==data.data.user_id){
                    adminButton.style.display = "block";
                    getGroupMembers(user_id);
                }else{
                    adminButton.style.display = "none";
                }
            }
        }catch(err){
            console.error(err)
        }
    }

    groupList.addEventListener('click', async(e) => {
        const groupItem = e.target.closest("li"); 

        if (!groupItem) return;
        
        console.log(groupItem.dataset.groupId, group_id)

        const temp_group_id = groupItem.dataset.groupId

        if(temp_group_id && temp_group_id!=parseInt(group_id)){
             chatBox.innerHTML = "";
             lastMessageId = 30;
        }

        

        group_id = groupItem.dataset.groupId;
        group_name = groupItem.innerHTML;

        groupNameInput.value = group_name;

        sessionStorage.setItem("group_id", group_id)
        sessionStorage.setItem("group_name", group_name)
        await fetchMessages(group_id)
        if(adminButton){
            await showAdminButton(group_id)
        }
    })

    chatBox.addEventListener("scroll", async() => {
        if (isFetching) return;

        if (chatBox.scrollTop <= 5 && lastMessageId >= 1) {
            await fetchMessages()
            console.log(lastMessageId)
            isFetching = true;
        }
    });

    inviteButton.addEventListener('click', ()=>{
        const inviteLink = `http://localhost:3000/invite/group/${group_id}`;
            navigator.clipboard.writeText(inviteLink).then(() => {
                alert("Invite link copied to clipboard!");
        });
    });

    const joinGroup = async(group_id) => {
        try{
            const response = await fetch(`http://localhost:3000/invite/group/${group_id}`, { 
                method: "POST", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ user_id })
            })
            
            if(response.ok){
                const data = await response.json()
                console.log(data)
                window.location.href = "/home.html";
            }
        }catch(err){
            console.error(err)
        }
    }
    

    function showInviteModal(group_id) {
        const modalElement = document.getElementById("inviteModal");
        const inviteModal = new bootstrap.Modal(modalElement); // Initialize Bootstrap modal
        inviteModal.show()
    
        // Handle Join Button
        document.getElementById("joinGroupBtn").onclick = () => {
            joinGroup(group_id);
            inviteModal.hide(); // Close modal
        };
    
        // Handle Cancel Button
        document.getElementById("cancelInviteBtn").onclick = () => {
            inviteModal.hide(); // Close modal
        };
    }    

    chatBox.addEventListener("click", (event) => {
        const clickedElement = event.target;
    
        if (clickedElement.tagName === "A") {
        
            const inviteUrl = new URL(clickedElement.href);
    
            if (
                inviteUrl.origin === "http://localhost:3000" &&
                inviteUrl.pathname.includes("/invite/") &&
                inviteUrl.pathname.includes("/group")
            ) {
                event.preventDefault(); // Prevent navigation
                const group_id = inviteUrl.pathname.split("/")[3]; // Extract Group ID
                showInviteModal(group_id);
            }
        }
    }); 

    deleteGroupBtn.addEventListener('click', async()=>{
        try{
            const response = await fetch(`http://localhost:3000/group/${group_id}`, { 
                method: "DELETE", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            })
            
            if(response.ok){
                const data = await response.json()
                console.log(data)
                window.location.href = "/home.html";
            }
        }catch(err){
            console.error(err)
        }
    })
})