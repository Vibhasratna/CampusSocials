document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const showSignup = document.getElementById("show-signup");
    const showLogin = document.getElementById("show-login");
    const formTitle = document.getElementById("form-title");

    // Toggle Forms
    showSignup.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        formTitle.textContent = "Sign Up";
    });

    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.style.display = "none";
        loginForm.style.display = "block";
        formTitle.textContent = "Login";
    });

    // Signup Functionality
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        const response = await fetch("http://localhost:3000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        alert(data.message);
        if (response.ok) {
            signupForm.style.display = "none";
            loginForm.style.display = "block";
            formTitle.textContent = "Login";
        }
    });

    // Login Functionality
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
    
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("loggedInUser", JSON.stringify(data.user)); // Store user data
            window.location.href = "main.html"; // Redirect to main page
        } else {
            alert(data.message);
        }
    });
});
