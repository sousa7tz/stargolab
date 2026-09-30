document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCopyEmail();
  initReveal();
});

/**
 * Altera a opacidade do Header no Scroll com requestAnimationFrame
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Página recarregada já rolada (ex.: voltar do WhatsApp)
  update();
}

/**
 * Copia o e-mail corporativo com feedback visual
 * (fallback para mailto quando a Clipboard API não está disponível)
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailSpan = document.getElementById('email-text');

  if (!copyBtn || !emailSpan) return;

  const emailText = 'contact@stargolab.com.br';
  let resetTimer;

  const openMail = () => {
    window.location.href = `mailto:${emailText}`;
  };

  copyBtn.addEventListener('click', () => {
    if (!navigator.clipboard || !window.isSecureContext) {
      openMail();
      return;
    }

    navigator.clipboard.writeText(emailText).then(() => {
      emailSpan.textContent = '✓ E-mail copiado!';

      // Reinicia o timer em cliques repetidos, sem perder o texto original
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        emailSpan.textContent = emailText;
      }, 2000);
    }).catch(openMail);
  });
}

/**
 * Anima elementos .reveal ao entrarem na viewport
 */
function initReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  // Sem suporte: exibe tudo direto para não esconder conteúdo
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Para de observar depois que já animou uma vez (economiza memória)
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px', // Dispara um pouco antes do elemento encostar no fundo da tela
    threshold: 0.1 // Dispara quando 10% do elemento estiver visível
  });

  revealElements.forEach(el => revealObserver.observe(el));
}
