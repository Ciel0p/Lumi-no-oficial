// Preguntas frecuentes: muestra u oculta cada respuesta
(function () {
  document.querySelectorAll('.faq__question').forEach(function (button) {
    button.addEventListener('click', function () {
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();
