// Menu Mobile
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navOverlay = document.querySelector(".nav-overlay");

function setMenu(open) {
    hamburger.classList.toggle("active", open);
    navMenu.classList.toggle("active", open);
    navOverlay.classList.toggle("active", open);
    document.body.classList.toggle("no-scroll", open);
    hamburger.setAttribute("aria-expanded", open);
    hamburger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

hamburger.addEventListener("click", () => {
    setMenu(!navMenu.classList.contains("active"));
});
navOverlay.addEventListener("click", () => setMenu(false));

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
        setMenu(false);
        hamburger.focus();
    }
});

// Scroll suave para links internos (o offset do header fixo vem do scroll-padding-top no CSS)
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        const target = id.length > 1 ? document.querySelector(id) : null;
        if (!target) return;

        e.preventDefault();
        setMenu(false);
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        history.pushState(null, "", id);
    });
});

// Animação ao Scroll (Intersection Observer)
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Para de observar depois que animou (Performance)
            }
        });
    }, { threshold: 0.1 });

    revealEls.forEach((el) => observer.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add("active"));
}

// Header performático (classe ao invés de estilo direto)
const header = document.getElementById("header");
let ticking = false;

function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 50);
    ticking = false;
}

window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });

onScroll();
