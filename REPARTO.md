# Reparto del landing – Prototipo 1

El landing está dividido en **7 partes**. Cada parte tiene su propio bloque en `index.html`
(busca el comentario `PARTE X`) y su propio archivo CSS, así nadie pisa el trabajo de otro.

> Regla del equipo: `css/base.css` es compartido. Si necesitas cambiar un color o un botón
> para todos, avísalo al grupo antes de tocarlo.

| Parte | Secciones | Archivos | Qué hacer para el prototipo 2 |
|---|---|---|---|
| **1** | Header, navegación y footer | `index.html` (PARTE 1) · `css/secciones/header.css` · `css/secciones/footer.css` · `js/menu.js` | Resaltar la sección activa del menú al hacer scroll; enlaces reales de redes y páginas legales. |
| **2** | Hero (presentación) | `index.html` (PARTE 2) · `css/secciones/hero.css` | Cambiar el mock-up dibujado por una captura del prototipo móvil; enlaces reales de App Store / Google Play. |
| **3** | Problema y Funcionalidades | `index.html` (PARTE 3) · `css/secciones/problema.css` · `css/secciones/funcionalidades.css` | Íconos propios para cada problema y cada funcionalidad. |
| **4** | Cómo funciona y Para quién es | `index.html` (PARTE 4) · `css/secciones/como-funciona.css` · `css/secciones/para-quien.css` | Imágenes de cada segmento (universitarias, profesionales, madres de familia). |
| **5** | Planes | `index.html` (PARTE 5) · `css/secciones/planes.css` | Botón para cambiar entre precio mensual y anual; tabla comparativa. |
| **6** | Testimonios y video About-the-Product | `index.html` (PARTE 6) · `css/secciones/testimonios.css` | Insertar el video de YouTube; frases reales de las entrevistas de validación. |
| **7** | Nosotros (equipo) y Preguntas frecuentes | `index.html` (PARTE 7) · `css/secciones/equipo.css` · `css/secciones/faq.css` · `js/faq.js` | Insertar el video About-the-Team; tarjetas con foto, nombre y rol de cada integrante; más preguntas. |

## Cómo trabajar sin conflictos

1. Actualiza antes de empezar: `git pull`.
2. Crea tu rama: `git checkout -b parte-3-problema` (cambia el nombre según tu parte).
3. Edita **solo** tu bloque de `index.html` y tus archivos CSS/JS.
4. Sube tu rama y abre un Pull Request hacia `main`.

## Checklist de cada parte

- [ ] Se ve bien en celular (375 px) y en escritorio (1440 px).
- [ ] Usa los colores y la tipografía de `base.css` (nada de colores nuevos sin avisar).
- [ ] Las imágenes tienen `alt`; los botones y enlaces se pueden usar con teclado.
- [ ] Los textos coinciden con el Figma.
