import { saveRating, getAverageRating } from "./firebase.js";

// 🔥 حطيها هون فوق
function showMessage(key, type = "success") {
    const box = document.getElementById("feedbackMessage");
    const textEl = document.getElementById("feedbackText");

    textEl.setAttribute("data-i18n", key);
    
    const currentLang = localStorage.getItem("lang") || "en";
    setLanguage(currentLang);

    box.classList.remove("success", "error");
    box.classList.add(type);

    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {

    const avgElement = document.getElementById("avgRating");

    async function loadAverage() {
        const avg = await getAverageRating();

        if (avgElement) {
            avgElement.textContent = avg;
        } else {
            console.error("avgRating element not found ❌");
        }
    }

    loadAverage();

    const stars = document.querySelectorAll("#rating .star");
    const modal = document.getElementById("ratingModal");
    const modalStars = document.querySelectorAll("#modalStars .star");
    const closeBtn = document.getElementById("closeModal");
    const submitBtn = document.querySelector(".popup-btn");
    const nameInput = document.getElementById("userName");
    

    let currentRating = localStorage.getItem("rating") || 0;

    highlightStars(currentRating);

    // ⭐ النجوم الأساسية
    stars.forEach(star => {

        star.addEventListener("mouseover", () => {
            highlightStars(star.getAttribute("data-value"));
        });

        star.addEventListener("mouseout", () => {
            highlightStars(currentRating);
        });

        star.addEventListener("click", () => {
            currentRating = star.getAttribute("data-value");

            localStorage.setItem("rating", currentRating);
            highlightStars(currentRating);

            updateModalStars(currentRating);
            modal.classList.add("show");
        });
    });

    // ⭐ النجوم داخل المودال
    modalStars.forEach((star, index) => {

        star.addEventListener("mouseover", () => {
            updateModalStars(index + 1);
        });

        star.addEventListener("mouseout", () => {
            updateModalStars(currentRating);
        });

        star.addEventListener("click", () => {
            currentRating = index + 1;

            localStorage.setItem("rating", currentRating);

            highlightStars(currentRating);
            updateModalStars(currentRating);
        });
    });

    // ❌ إغلاق
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });

    // 🔹 inputs
    const emailInput = document.querySelector('input[type="email"]');

    // إزالة error عند التعديل
    nameInput.addEventListener("input", () => {
        nameInput.classList.remove("error");
    });

    emailInput.addEventListener("input", () => {
        emailInput.classList.remove("error");
    });


    // ✅ VALIDATION
    submitBtn.addEventListener("click", async () => {

        if (localStorage.getItem("rated")) {
            showMessage("spam_rated", "error");
            return;
        }

        if (!nameInput.value.trim()) {
            nameInput.classList.add("error");
            nameInput.placeholder = "Name is required!";
            nameInput.focus();
            return;
        }

        submitBtn.disabled = true;

        try {
            nameInput.classList.remove("error");

            const emailValue = emailInput.value;
            const messageValue = document.querySelector('.popup-textarea').value;

            // ✅ EMAIL VALIDATION (optional)
            if (emailValue.trim() !== "") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(emailValue)) {
                    emailInput.classList.add("error");
                    showMessage("invalid_email", "error");

                    submitBtn.disabled = false; // 🔥 أهم سطر
                    return;
                }
            }

            // 🔥 1. خزّن في Firebase
            await saveRating({
                name: nameInput.value,
                email: emailValue,
                feedback: messageValue,
                rating: currentRating,
                createdAt: new Date()
            });

            localStorage.setItem("rated", "true");

            await loadAverage();

            // 🔥 2. ابعت إيميل
            emailjs.send("service_9fz4bq3", "template_ac1whp4", {
                name: nameInput.value,
                email: emailValue,
                rating: currentRating,
                message: messageValue
            })
            .then(() => {
                console.log("Email sent ✅");
            })
            .catch((error) => {
                console.error("Email error ❌", error);
            });

            // UI
            modal.classList.remove("show");

            showMessage("success_message", "success");

        } catch (error) {
            console.error("Submission error ❌", error);
        } finally {
            submitBtn.disabled = false; // 🔥 دايمًا يرجع يشتغل
        }
    });

    // ===== functions =====

    function highlightStars(rating) {
        stars.forEach(star => {
            if (star.getAttribute("data-value") <= rating) {
                star.classList.add("active");
            } else {
                star.classList.remove("active");
            }
        });
    }

    function updateModalStars(rating) {
        modalStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add("active");
            } else {
                star.classList.remove("active");
            }
        });
    }


});

