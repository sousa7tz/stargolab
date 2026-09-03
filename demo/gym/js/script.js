// Ativar Menu Mobile
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navOverlay = document.querySelector(".nav-overlay");

function toggleMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    if(navOverlay) navOverlay.classList.toggle("active"); 
    document.body.classList.toggle("no-scroll"); 
}

if(hamburger) hamburger.addEventListener("click", toggleMenu);
if(navOverlay) navOverlay.addEventListener("click", toggleMenu);

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    if(navOverlay) navOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}));

// Animação ao Scroll (Intersection Observer)
const observerOptions = { threshold: 0.1 }; // Reduzi para 0.1 para disparar mais rápido no mobile

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Para de observar depois que animou (Performance)
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => { observer.observe(el); });

// --- HEADER PERFORMÁTICO (CLASSE AO INVÉS DE ESTILO DIRETO) ---
const header = document.getElementById('header');
let ticking = false;

function onScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled'); // Adiciona a classe
    } else {
        header.classList.remove('scrolled'); // Remove a classe
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });