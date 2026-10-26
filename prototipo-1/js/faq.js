// PARTE 7 · Preguntas frecuentes: muestra u oculta cada respuesta
(function () {
  document.querySelectorAll('.faq__pregunta').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var respuesta = document.getElementById(boton.getAttribute('aria-controls'));
      var abierta = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierta));
      respuesta.hidden = abierta;
    });
  });
})();
