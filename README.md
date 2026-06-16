# Academia Jota Rubio

> La plataforma premium donde los técnicos en reparación electrónica se vuelven leyenda.

Sitio web estático de presentación de la plataforma. **Fase 1**: landing + mockups de los módulos.

## Stack

- HTML5 semántico
- CSS3 con variables (paleta exacta del brief)
- JavaScript vanilla (sin frameworks, sin build step)
- Glassmorphism + animaciones suaves
- Mobile-first responsive
- Accesibilidad WCAG básica

## Estructura

```
plataforma-de-tecnicos/
├── index.html            # Landing principal
├── assets/
│   └── logos/            # Logo + favicon SVG
├── css/
│   ├── main.css          # Sistema de diseño (variables, tipografía, base)
│   ├── components.css    # Componentes (navbar, hero, cards, pricing, etc)
│   └── animations.css    # Keyframes, scroll reveal, transiciones
├── js/
│   ├── main.js           # Navbar, tabs, scroll suave
│   └── animations.js     # IntersectionObserver, contadores, parallax
└── pages/                # Mockups de páginas internas
```

## Diseño

- **Modo oscuro** por defecto
- **Paleta** exacta: `#0F172A`, `#1E293B`, `#3B82F6`, `#10B981`, `#F59E0B`, `#F8FAFC`, `#94A3B8`
- **Tipografía**: Inter (sans) + JetBrains Mono (código)
- **Glassmorphism** sutil en cards y navbar
- **Animaciones**: scroll reveal, parallax, contadores, nodos pulsantes
- **Sin frameworks**: cero dependencias externas en runtime

## Ver localmente

```bash
python3 -m http.server 8000
# Abrí http://localhost:8000
```

## Roadmap

- [x] **Fase 1** — Landing + sistema de diseño + mockups visuales
- [ ] **Fase 2** — Backend Flask + auth + base de datos
- [ ] **Fase 3** — Integración Stripe (suscripciones)
- [ ] **Fase 4** — Deploy con nginx + DuckDNS
- [ ] **Fase 5** — App móvil (PWA)

---

Hecho con ⚡ para la comunidad técnica.
