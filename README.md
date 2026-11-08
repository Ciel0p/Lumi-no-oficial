# Lumi – Landing Page

Landing page de **Lumi**, la app que une el seguimiento del ciclo menstrual con la agenda diaria.
Startup **6Bits** · UPC · IHC y Tecnologías Móviles (1ASI0385).

## Enlaces

- 🌐 **Landing (prototipo 2):** https://ciel0p.github.io/Lumi-no-oficial/
- 🌐 **Prototipo 1:** https://ciel0p.github.io/Lumi-no-oficial/prototipo-1/
- 🎨 **Diseño en Figma:** https://www.figma.com/design/BCU2mabbaiTamg5pwkz2T3/LUMI-grupo1-2026
- 💻 **Repositorio oficial:** https://github.com/LUMI-UPC/Lumi-landing-page

## Prototipos

| Carpeta | Contenido |
|---|---|
| [`prototype-2/`](prototype-2/) | Landing completo con nombres en inglés y la demo **Prueba Lumi** con **35 HU del core** funcionando (simuladas en memoria). |
| [`prototipo-1/`](prototipo-1/) | Primera versión: estructura de secciones y estilos base. |

## Prueba Lumi (prototipo 2)

Demo interactiva con las 5 pestañas del diseño móvil: **Inicio, Calendario, Horarios, Bienestar y Perfil**.
Los datos viven en memoria: al recargar la página vuelven al inicio. Los botones *−1 día / +1 día / +7 días*
simulan el paso del tiempo para ver predicciones, alertas y retrasos.

| Pestaña | Historias de usuario |
|---|---|
| Bienvenida | US-01, US-03, US-05, US-06 |
| Inicio | US-45, US-14, US-16, US-46, US-47, US-48 |
| Calendario | US-44, US-11, US-17, US-12, US-18, US-15, US-21, US-50, US-22, US-23, US-48 |
| Horarios | US-19, US-24, US-20, US-23 |
| Bienestar | US-35, US-36, US-37, US-38, US-30, US-31, US-32, US-33, US-34 |
| Perfil | US-25, US-26, US-13, US-49 |

## Estructura del prototipo 2

```
prototype-2/
├── index.html
├── css/
│   ├── base.css          # colores, tipografía y componentes compartidos
│   └── sections/         # un archivo por sección (incluye try-lumi.css)
├── js/
│   ├── menu.js           # menú en celular
│   ├── faq.js            # preguntas frecuentes
│   └── try-lumi.js       # demo interactiva
└── assets/images/
```

## Convenciones

- GitFlow: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
- Conventional Commits en inglés (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`).
- Nombres de archivos, clases e ids en inglés (BEM); textos visibles en español.
