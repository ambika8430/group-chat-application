document.addEventListener("DOMContentLoaded", function () {
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Sign-up triggered");

            const username = document.querySelector(".signup-username").value;
            const email = document.querySelector(".signup-email").value;
            const password = document.querySelector(".signup-password").value;

            console.log({ username, email, password })

            const response = await fetch("http://localhost:3000/user/sign-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("Sign-up successful! Please log in.");
                window.location.href = "/";
            } else {
                alert("Sign-up failed: " + data.message);
            }
        });
    } else {
        console.warn("Sign-up form not found");
    }
})