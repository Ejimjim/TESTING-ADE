# NutriPulse — Calorie & Nutrition Tracker

A lightweight, responsive calorie and macronutrient tracker built with **100% Vanilla HTML, CSS, and JavaScript**.

No backend, no external dependencies, no CSS frameworks (no Tailwind), and no CSS variables. All data is persisted locally in the web browser via `localStorage`.

---

## ✨ Features

- **Energy Gauge & Daily Budget**: Real-time circular SVG meter and linear progress bar showing consumed vs. remaining calories (with dynamic warning alerts when exceeding daily limits).
- **Macronutrient Tracking**: Live counters and visual progress indicators for **Protein**, **Carbs**, and **Fat** against custom target grams.
- **Categorized Meal Logging**: Log foods under **Breakfast**, **Lunch**, **Dinner**, and **Snacks** with per-meal caloric totals.
- **Date Navigation**: Switch between past, present, and future dates with independent logs stored per calendar day.
- **⚡ Quick Log Presets**: 1-click addition of common foods (oatmeal, bananas, eggs, chicken breast, rice, etc.).
- **💧 Hydration Counter**: 8-glass (2,000 ml) daily water intake logger.
- **Custom Targets & Settings**: Customize your daily calorie target and macro ratios anytime.
- **Browser-Only Persistence**: Preserves all entries and preferences locally using `localStorage`.

---

## 🚀 Getting Started

No build step or server required!

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Ejimjim/TESTING-ADE.git
   ```
2. Open `index.html` in any web browser.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic document structure and accessible dialogs.
- **CSS3**: Pure vanilla CSS layout (Flexbox & CSS Grid) without CSS custom properties or preprocessors.
- **JavaScript (ES6+)**: Vanilla state management, SVG geometry calculations, and `localStorage` persistence.
