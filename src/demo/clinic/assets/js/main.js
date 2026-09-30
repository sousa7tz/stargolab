document.addEventListener('DOMContentLoaded', () => {
  // Atualiza dinamicamente o ano no rodapé
  const yearElement = document.getElementById('ano');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Comportamento de Accordion exclusivo no FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });
});