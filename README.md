# Lumi – Landing Page

Landing page de **Lumi**, la app que une el seguimiento del ciclo menstrual con la agenda diaria.
Startup **6Bits** · UPC · IHC y Tecnologías Móviles (1ASI0385).

## Enlaces

- 🌐 **Landing (prototipo 3):** https://ciel0p.github.io/Lumi-no-oficial/
- 📱 **App para el celular:** https://ciel0p.github.io/Lumi-no-oficial/prototype-3/app.html
- 🎤 **Modo entrevista de validación:** https://ciel0p.github.io/Lumi-no-oficial/prototype-3/app.html#entrevista
- 🔒 **Privacidad y términos:** https://ciel0p.github.io/Lumi-no-oficial/prototype-3/privacy.html
- 🌐 **Versiones anteriores:** [prototipo 2](https://ciel0p.github.io/Lumi-no-oficial/prototype-2/) · [prototipo 1](https://ciel0p.github.io/Lumi-no-oficial/prototipo-1/)
- 🎨 **Diseño en Figma:** https://www.figma.com/design/BCU2mabbaiTamg5pwkz2T3/LUMI-grupo1-2026
- 💻 **Repositorio oficial:** https://github.com/LUMI-UPC/Lumi-landing-page

## Prototipos

| Carpeta | Contenido |
|---|---|
| [`prototype-3/`](prototype-3/) | Landing + **app a pantalla completa para el celular** (`app.html`), **modo entrevista** para las validaciones y las correcciones de la auditoría de UX. |
| [`prototype-2/`](prototype-2/) | Landing completo con nombres en inglés y la demo **Prueba Lumi** con 35 HU del core funcionando (simuladas en memoria). |
| [`prototipo-1/`](prototipo-1/) | Primera versión: estructura de secciones y estilos base. |

## Usar Lumi en el celular

1. Abre `prototype-3/app.html` en el navegador del celular.
2. En el menú del navegador elige **Agregar a pantalla de inicio**: se abre a pantalla completa, como una app.
3. Empieza con **Configurar mi Lumi** o con **Usar datos de ejemplo**.

Los datos de la app viven en memoria: al recargar vuelven al inicio.

## Modo entrevista (validación con usuarias)

La barra oscura de arriba en `app.html` guía la entrevista y registra los resultados:

1. **Iniciar entrevista** → nombre del entrevistador, datos de la entrevistada, segmento y consentimiento de grabación.
2. Por cada tarea del guion: **Empezar tarea** (corre el cronómetro) → la usuaria usa la app → **Terminó la tarea**.
3. Se anota si la completó (sí / con ayuda / no), la facilidad del 1 al 5, comentarios y la heurística afectada.
4. Preguntas finales: qué le gustó, qué cambiaría, confianza, si la usaría y pagaría, y recomendación (0–10).
5. El resumen se **descarga en .txt** o se copia. Todas las entrevistas del celular se exportan en **.csv**.

Las tareas cambian según el segmento (universitaria, profesional o madre de familia). Las entrevistas se guardan
solo en el navegador de ese celular; se borran desde **Guardadas → Borrar todas**.

## Correcciones de la auditoría de UX

| # | Problema encontrado | Corrección |
|---|---|---|
| 1 | El calendario comunicaba los estados solo con color | Ícono de gota (periodo), batería (energía baja) y contador de actividades, con leyenda |
| 2 | Privacidad, Términos y redes sin destino | Página `privacy.html` con política, términos y eliminación de datos; se retiraron los enlaces sin destino |
| 3 | Testimonios y videos de relleno | Sección **Validación** con el proceso real de entrevistas; sin contenido de relleno |
| 4 | Códigos de HU visibles en la app | Ocultos por defecto; se activan con **Ver códigos HU** en las herramientas de la demo |
| 5 | El aviso tapaba botones y no se podía cerrar | Aviso arriba, con botón de cerrar |
| 6 | Botones de App Store / Google Play no descargaban | Etiquetas "Próximamente" (no son botones) y botón real **Probar Lumi ahora** |
| 7 | Controles de simulación mezclados con los de la app | Panel aparte **Herramientas de la demo**, con otro estilo y plegado en el celular |
| 8 | Datos del ciclo contradictorios entre pantallas | El historial muestra el periodo estimado y "Actual · día N" igual que Inicio |
| 9 | Textos de 12–13 px | Tamaño mínimo de 14 px en todo el sitio |

## Prueba Lumi: historias de usuario

Demo con las 5 pestañas del diseño móvil: **Inicio, Calendario, Horarios, Bienestar y Perfil**.

| Pestaña | Historias de usuario |
|---|---|
| Bienvenida | US-01, US-03, US-05, US-06 |
| Inicio | US-45, US-14, US-16, US-46, US-47, US-48 |
| Calendario | US-44, US-11, US-17, US-12, US-18, US-15, US-21, US-50, US-22, US-23, US-48 |
| Horarios | US-19, US-24, US-20, US-23 |
| Bienestar | US-35, US-36, US-37, US-38, US-30, US-31, US-32, US-33, US-34 |
| Perfil | US-25, US-26, US-13, US-49 |

## Estructura del prototipo 3

```
prototype-3/
├── index.html            # landing
├── app.html              # app a pantalla completa (celular)
├── privacy.html          # privacidad, términos y eliminación de datos
├── manifest.webmanifest  # permite agregarla a la pantalla de inicio
├── css/
│   ├── base.css          # colores, tipografía y componentes compartidos
│   └── sections/         # un archivo por sección (try-lumi, interview, legal…)
├── js/
│   ├── menu.js           # menú en celular
│   ├── faq.js            # preguntas frecuentes
│   ├── try-lumi.js       # app de demostración
│   └── interview.js      # modo entrevista de validación
└── assets/images/
```

## Convenciones

- GitFlow: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
- Conventional Commits en inglés (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`).
- Nombres de archivos, clases e ids en inglés (BEM); textos visibles en español.
