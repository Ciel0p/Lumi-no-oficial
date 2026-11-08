// Abre y cierra el menú en celular
(function () {
  var menuButton = document.querySelector('.header__menu-button');
  var menu = document.getElementById('main-menu');
  if (!menuButton || !menu) return;

  function closeMenu() {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  // al elegir una opción, el menú se cierra
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });
})();
