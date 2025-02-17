document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Initialize EmailJS
    emailjs.init("sVXnFqJJzYbiTQ0FG"); // Replace with your actual EmailJS public key

    // Get form data
    let email = document.getElementById('inputEmail3').value;
    let year = document.querySelector('input[name="year"]:checked').value;
    let query = document.getElementById('queryTextarea').value;

    // Send email using EmailJS
    emailjs.send("service_t3lj4jv", "template_mknzinj", {
        from_email: email,
        user_year: year,
        user_query: query,
        to_email: "campussocial.helpdesk@gmail.com"
    }).then(function(response) {
        console.log("Email sent successfully!", response);

        // Hide form and show success message
        document.querySelector('.contact-container').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';

        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = "contact.html";
        }, 3000);
    }).catch(function(error) {
        console.error("Error sending email:", error);
        alert("Failed to send message. Please check your EmailJS settings and try again.");
    });
});
