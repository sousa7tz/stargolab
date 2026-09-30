/** Apex Gym — interações leves (sem bibliotecas). */

/** Menu mobile: abre/fecha o painel lateral, com overlay e tecla Esc. */
function initMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    if (!hamburger || !navMenu || !navOverlay) return;

    const setMenu = (open) => {
        hamburger.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        navOverlay.classList.toggle('active', open);
        document.body.classList.toggle('no-scroll', open);
        hamburger.setAttribute('aria-expanded', open);
        hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
    navOverlay.addEventListener('click', () => setMenu(false));
    navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            setMenu(false);
            hamburger.focus();
        }
    });
}

/** Animação de entrada: adiciona .active aos elementos .reveal quando entram na tela. */
function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    revealEls.forEach((el) => observer.observe(el));
}

/** Header: escurece e ganha sombra depois de rolar a página. */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;
    const update = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        window.requestAnimationFrame(update);
        ticking = true;
    }, { passive: true });

    update();
}

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initReveal();
    initHeader();
});
