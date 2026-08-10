document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCopyEmail();
});

/**
 * Altera a opacidade do Header no Scroll com requestAnimationFrame
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Copia o e-mail corporativo com feedback visual
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailSpan = document.getElementById('email-text');

  if (!copyBtn || !emailSpan) return;

  copyBtn.addEventListener('click', () => {
    const emailText = 'contact@stargolab.com.br';

    navigator.clipboard.writeText(emailText).then(() => {
      const originalText = emailSpan.innerText;
      emailSpan.innerText = '✓ E-mail copiado!';

      setTimeout(() => {
        emailSpan.innerText = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Erro ao copiar e-mail: ', err);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Configuração do Observador de Scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px', // Dispara um pouco antes do elemento encostar no fundo da tela
    threshold: 0.15 // Dispara quando 15% do elemento estiver visível
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Para de observar depois que já animou uma vez (economiza memória)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Aplica em todos os elementos com a classe .reveal
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => revealObserver.observe(el));
});