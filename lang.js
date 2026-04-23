const translations = {
    en: {
        hero_title: "Building Intelligent Systems That Transform Data Into",
        hero_desc: "Specialize in AI and Data Science, building intelligent web systems that solve real-world problems through practical and research-driven approaches.",
    },
    ar: {
        hero_title: "بناء أنظمة ذكية تحول البيانات إلى",
        hero_desc: "متخصصة في الذكاء الاصطناعي وعلوم البيانات، أعمل على تطوير أنظمة ويب ذكية لحل مشاكل واقعية باستخدام أساليب عملية قائمة على البحث.",
    }
};

let currentLang = "en";

const toggleBtn = document.getElementById("lang-toggle");

toggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ar" : "en";
    updateLanguage();
});

function updateLanguage() {
    const elements = document.querySelectorAll("[data-lang]");

    elements.forEach(el => {
        const key = el.getAttribute("data-lang");
        el.textContent = translations[currentLang][key];
    });

    const icon = document.querySelector(".lang-icon");
    const text = document.querySelector(".lang-text");

    if (currentLang === "ar") {
        icon.textContent = "🇯🇴";
        text.textContent = "AR";
        document.body.style.direction = "rtl";
    } else {
        icon.textContent = "🌐";
        text.textContent = "EN";
        document.body.style.direction = "ltr";
    }
}