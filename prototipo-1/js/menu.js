// PARTE 1 · Abre y cierra el menú en celular
(function () {
  var boton = document.querySelector('.header__menu-btn');
  var menu = document.getElementById('menu-principal');
  if (!boton || !menu) return;

  function cerrar() {
    menu.classList.remove('abierto');
    boton.setAttribute('aria-expanded', 'false');
  }

  boton.addEventListener('click', function () {
    var abierto = menu.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', String(abierto));
  });

  // al elegir una opción, el menú se cierra
  menu.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', cerrar);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrar();
  });
})();
