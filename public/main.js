document.addEventListener("DOMContentLoaded", () => {
    const userAccount = document.getElementById("user-account");
    const joinNowBtn = document.getElementById("join-now");
    const logoutBtn = document.getElementById("logout-button");
    const academicSection = document.getElementById("academic-section");
    const userAvatar = document.querySelector(".user-avatar");

    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (user) {
        const email = user.email;
        const username = user.username || email.split('@')[0];
        const initials = username.charAt(0).toUpperCase();

        userAccount.style.display = "flex";
        userAvatar.textContent = initials;
        joinNowBtn.style.display = "none";
        academicSection.href = "CI.html";

        if (email.includes("admin@")) {
            enableEditing("admin");
            alert("Welcome Admin!");
        } else if (email.match(/(1st|2nd|3rd|4th)@/)) {
            enableEditing("year-based");
            alert("Welcome Course Year Admin!");
        }
    } else {
        academicSection.href = "#";
        academicSection.addEventListener("click", (e) => {
            e.preventDefault();
            alert("You must Join Now to access the Academic Section!");
        });
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.reload();
    });

    // Fetch latest content from DB on page load
    fetchContentFromDB();
});

// Function to enable editing based on user role
function enableEditing(role) {
    document.querySelectorAll(".editable").forEach(section => {
        const sectionRole = section.dataset.role;
        
        if (role === "admin" || (role === "year-based" && sectionRole !== "admin")) {
            const content = section.querySelector(".content");
            if (!content) return;

            const existingBtn = section.querySelector(".edit-btn");
            if (existingBtn) return; // Prevent duplicate buttons

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.classList.add("edit-btn");
            editBtn.style.marginLeft = "10px";
            editBtn.style.cursor = "pointer";
            editBtn.addEventListener("click", () => {
                const newValue = prompt("Enter new value:", content.textContent);
                if (newValue !== null) {
                    content.textContent = newValue;
                    saveContentToDB(section.id, newValue); // Save to MySQL
                }
            });

            content.parentNode.appendChild(editBtn);
        }
    });
}

// Function to save content to the database
function saveContentToDB(sectionId, newValue) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return alert("You need to log in!");

    fetch("http://localhost:3000/api/update-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, section: sectionId, content: newValue })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Content updated successfully") {
            alert("Content saved!");
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error("Error updating content:", error);
        alert("Failed to update content.");
    });
}

// Function to fetch content and update UI
function fetchContentFromDB() {
    fetch("http://localhost:3000/api/get-content")
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const section = document.getElementById(item.section);
                if (section) {
                    section.querySelector(".content").textContent = item.content;
                }
            });
        })
        .catch(error => console.error("Error fetching content:", error));
}

// Function to show a pop-up message
function showPopup(message) {
    alert(message);
}
