/* =========================================================
   MOBILE MENU
========================================================= */

const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");

menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("bx-x");
    navbar.classList.toggle("active");
});


/* =========================================================
   CLOSE MOBILE MENU WHEN LINK IS CLICKED
========================================================= */

const navLinks = document.querySelectorAll(".navbar a");

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        menuIcon.classList.remove("bx-x");
        navbar.classList.remove("active");
    });
});


/* =========================================================
   ACTIVE NAVIGATION LINK ON SCROLL
========================================================= */

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (href === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});


/* =========================================================
   HEADER BACKGROUND ON SCROLL
========================================================= */

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


/* =========================================================
   RESET MENU WHEN WINDOW IS RESIZED
========================================================= */

window.addEventListener("resize", () => {

    if (window.innerWidth > 850) {
        navbar.classList.remove("active");
        menuIcon.classList.remove("bx-x");
    }

});


/* =========================================================
   CONTACT FORM — BACKEND CONNECTION
========================================================= */

const contactForm = document.querySelector(".contact form");

if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const phoneInput = contactForm.querySelector('input[type="tel"]');
        const subjectInput = contactForm.querySelector(
            'input[placeholder="Subject"]'
        );
        const messageInput = contactForm.querySelector("textarea");

        const submitButton = contactForm.querySelector(
            'button[type="submit"], input[type="submit"], .btn'
        );

        if (!nameInput || !emailInput || !messageInput) {
            console.error("Required contact form fields could not be found.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const subject = subjectInput ? subjectInput.value.trim() : "";
        const message = messageInput.value.trim();


        // Basic frontend validation
        if (!name || !email || !message) {
            showContactStatus(
                "Please fill in your name, email, and message.",
                "error"
            );
            return;
        }


        const originalButtonContent = submitButton
            ? submitButton.value || submitButton.innerHTML
            : "";


        // Loading state
        if (submitButton) {
            submitButton.disabled = true;

            if (submitButton.tagName === "INPUT") {
                submitButton.value = "Sending...";
            } else {
                submitButton.innerHTML = `
                    <i class="bx bx-loader-alt bx-spin"></i>
                    Sending...
                `;
            }
        }


        try {

            const response = await fetch(
                "/api/contact",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        subject: subject,
                        message: message
                    })
                }
            );


            const result = await response.json();


            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to send your message."
                );
            }


            showContactStatus(
                "Your message has been sent successfully!",
                "success"
            );

            contactForm.reset();


        } catch (error) {

            console.error("Contact form error:", error);

            showContactStatus(
                error.message ||
                "Something went wrong. Please try again.",
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                if (submitButton.tagName === "INPUT") {
                    submitButton.value = originalButtonContent;
                } else {
                    submitButton.innerHTML = originalButtonContent;
                }

            }

        }

    });

}


/* =========================================================
   CONTACT STATUS MESSAGE
========================================================= */

function showContactStatus(message, type) {

    if (!contactForm) {
        return;
    }

    let statusMessage =
        contactForm.querySelector(".contact-status");

    if (!statusMessage) {

        statusMessage = document.createElement("p");
        statusMessage.className = "contact-status";

        contactForm.appendChild(statusMessage);

    }

    statusMessage.textContent = message;

    statusMessage.style.marginTop = "1rem";
    statusMessage.style.textAlign = "center";
    statusMessage.style.fontSize = "1.3rem";
    statusMessage.style.fontWeight = "500";

    if (type === "success") {
        statusMessage.style.color = "#00ffee";
    } else {
        statusMessage.style.color = "#ff6b6b";
    }


    setTimeout(() => {

        if (statusMessage && statusMessage.parentNode) {
            statusMessage.remove();
        }

    }, 5000);

}
