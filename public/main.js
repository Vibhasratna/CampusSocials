document.addEventListener("DOMContentLoaded", () => {
    // Performance tracking
    const pageLoadStart = Date.now();
    
    const userAccount = document.getElementById("user-account");
    const joinNowBtn = document.getElementById("join-now");
    const logoutBtn = document.getElementById("logout-button");
    const academicSection = document.getElementById("academic-section");
    const userAvatar = document.querySelector(".user-avatar");

    // Track login state
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
            console.log("Admin user detected");
        } else if (email.match(/(1st|2nd|3rd|4th)@/)) {
            enableEditing("year-based");
            console.log("Year admin detected");
        }
    } else {
        academicSection.href = "#";
        academicSection.addEventListener("click", (e) => {
            e.preventDefault();
            showPopup("You must Join Now to access the Academic Section!");
        });
    }

    // Performance metric
    console.log(`DOM loaded in ${Date.now() - pageLoadStart}ms`);

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.reload();
    });

    // Fetch content with performance tracking
    const fetchStart = Date.now();
    fetchContentFromDB().finally(() => {
        console.log(`Content fetched in ${Date.now() - fetchStart}ms`);
    });

    // Add performance monitoring button
    addPerfMonitor();
});

function enableEditing(role) {
    const sections = document.querySelectorAll(".editable");
    console.log(`Enabling editing for ${sections.length} sections`);
    
    sections.forEach(section => {
        const sectionRole = section.dataset.role;
        
        if (role === "admin" || (role === "year-based" && sectionRole !== "admin")) {
            const content = section.querySelector(".content");
            if (!content) return;

            if (section.querySelector(".edit-btn")) return;

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.classList.add("edit-btn");
            editBtn.style.marginLeft = "10px";
            editBtn.style.cursor = "pointer";
            
            editBtn.addEventListener("click", async () => {
                const newValue = prompt("Enter new value:", content.textContent);
                if (newValue !== null) {
                    const saveStart = Date.now();
                    await saveContentToDB(section.id, newValue);
                    console.log(`Save operation took ${Date.now() - saveStart}ms`);
                    content.textContent = newValue;
                }
            });

            content.parentNode.appendChild(editBtn);
        }
    });
}

async function saveContentToDB(sectionId, newValue) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) {
        showPopup("You need to log in!");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/update-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: user.email, 
                section: sectionId, 
                content: newValue 
            })
        });
        
        const data = await response.json();
        if (data.message !== "Content updated successfully") {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error("Error updating content:", error);
        showPopup("Failed to update content.");
    }
}

async function fetchContentFromDB() {
    try {
        const response = await fetch("http://localhost:3000/api/get-content");
        const data = await response.json();
        
        data.forEach(item => {
            const section = document.getElementById(item.section);
            if (section) {
                const contentElement = section.querySelector(".content");
                if (contentElement) {
                    contentElement.textContent = item.content;
                }
            }
        });
    } catch (error) {
        console.error("Error fetching content:", error);
    }
}

function addPerfMonitor() {
    const perfBtn = document.createElement("button");
    perfBtn.textContent = "Show Metrics";
    perfBtn.style.position = "fixed";
    perfBtn.style.bottom = "20px";
    perfBtn.style.right = "20px";
    perfBtn.style.zIndex = "1000";
    
    perfBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("http://localhost:3000/api/perf-metrics");
            const data = await response.json();
            showPopup(`System Metrics:\nUsers: ${data.metrics.userCount}\nUptime: ${Math.floor(data.metrics.uptime)}s`);
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
            showPopup("Couldn't load metrics");
        }
    });
    
    document.body.appendChild(perfBtn);
}
function showPopup(message) {
    alert(message);}
