/**
 * NutriPulse Calorie Tracker
 * Pure Vanilla JavaScript with LocalStorage Persistence
 * No external libraries, no frameworks, no backend.
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'nutripulse_calorie_data_v1';
  const RING_CIRCUMFERENCE = 439.82; // 2 * pi * 70

  // Default Quick Add Preset Items
  const PRESET_FOODS = [
    { name: '🍌 Banana', defaultMeal: 'snacks', cals: 105, p: 1.3, c: 27, f: 0.3 },
    { name: '🥚 2 Boiled Eggs', defaultMeal: 'breakfast', cals: 140, p: 12, c: 1, f: 10 },
    { name: '🥣 Oatmeal & Berries', defaultMeal: 'breakfast', cals: 280, p: 9, c: 48, f: 4 },
    { name: '🍗 Grilled Chicken Breast', defaultMeal: 'lunch', cals: 310, p: 58, c: 0, f: 6 },
    { name: '🍚 Jasmine Rice (1 Cup)', defaultMeal: 'lunch', cals: 210, p: 4, c: 45, f: 0.5 },
    { name: '🥗 Green Salad & Olive Oil', defaultMeal: 'dinner', cals: 160, p: 2, c: 7, f: 14 },
    { name: '🥩 Salmon Fillet (150g)', defaultMeal: 'dinner', cals: 320, p: 34, c: 0, f: 18 },
    { name: '🥤 Whey Protein Shake', defaultMeal: 'snacks', cals: 135, p: 25, c: 3, f: 2 },
    { name: '☕ Coffee with Milk', defaultMeal: 'breakfast', cals: 80, p: 4, c: 6, f: 3 },
    { name: '🥜 Handful of Almonds', defaultMeal: 'snacks', cals: 165, p: 6, c: 6, f: 14 }
  ];

  // --- Initial App State ---
  let appState = {
    settings: {
      dailyCalorieGoal: 2000,
      proteinGoal: 140,
      carbsGoal: 220,
      fatGoal: 65
    },
    days: {}
  };

  // Currently viewed date in YYYY-MM-DD format
  let currentDateString = getTodayDateString();

  // --- DOM Elements ---
  const dateLabel = document.getElementById('dateLabel');
  const dateSubLabel = document.getElementById('dateSubLabel');
  const datePickerInput = document.getElementById('datePickerInput');
  const prevDateBtn = document.getElementById('prevDateBtn');
  const nextDateBtn = document.getElementById('nextDateBtn');
  const todayBtn = document.getElementById('todayBtn');

  // Ring & Metrics
  const calorieRingProgress = document.getElementById('calorieRingProgress');
  const caloriesRemainingNumber = document.getElementById('caloriesRemainingNumber');
  const caloriesRemainingLabel = document.getElementById('caloriesRemainingLabel');
  const calorieStatusBadge = document.getElementById('calorieStatusBadge');
  const metricGoal = document.getElementById('metricGoal');
  const metricConsumed = document.getElementById('metricConsumed');
  const metricNet = document.getElementById('metricNet');
  const calorieProgressBar = document.getElementById('calorieProgressBar');
  const percentConsumedLabel = document.getElementById('percentConsumedLabel');
  const percentRemainingLabel = document.getElementById('percentRemainingLabel');

  // Macros
  const macroCalsTotal = document.getElementById('macroCalsTotal');
  const proteinCurrent = document.getElementById('proteinCurrent');
  const proteinTarget = document.getElementById('proteinTarget');
  const proteinBar = document.getElementById('proteinBar');
  const carbsCurrent = document.getElementById('carbsCurrent');
  const carbsTarget = document.getElementById('carbsTarget');
  const carbsBar = document.getElementById('carbsBar');
  const fatCurrent = document.getElementById('fatCurrent');
  const fatTarget = document.getElementById('fatTarget');
  const fatBar = document.getElementById('fatBar');

  // Hydration
  const waterGlassesContainer = document.getElementById('waterGlassesContainer');
  const waterCountLabel = document.getElementById('waterCountLabel');
  const addGlassBtn = document.getElementById('addGlassBtn');
  const removeGlassBtn = document.getElementById('removeGlassBtn');

  // Meal Lists & Badges
  const breakfastList = document.getElementById('breakfastList');
  const lunchList = document.getElementById('lunchList');
  const dinnerList = document.getElementById('dinnerList');
  const snacksList = document.getElementById('snacksList');
  const breakfastCalories = document.getElementById('breakfastCalories');
  const lunchCalories = document.getElementById('lunchCalories');
  const dinnerCalories = document.getElementById('dinnerCalories');
  const snacksCalories = document.getElementById('snacksCalories');

  // Presets & Admin
  const presetTagsList = document.getElementById('presetTagsList');
  const clearDayBtn = document.getElementById('clearDayBtn');
  const resetAllDataBtn = document.getElementById('resetAllDataBtn');

  // Food Modal
  const foodModal = document.getElementById('foodModal');
  const foodModalTitle = document.getElementById('foodModalTitle');
  const foodForm = document.getElementById('foodForm');
  const editEntryId = document.getElementById('editEntryId');
  const foodNameInput = document.getElementById('foodNameInput');
  const foodMealSelect = document.getElementById('foodMealSelect');
  const foodCaloriesInput = document.getElementById('foodCaloriesInput');
  const foodProteinInput = document.getElementById('foodProteinInput');
  const foodCarbsInput = document.getElementById('foodCarbsInput');
  const foodFatInput = document.getElementById('foodFatInput');
  const closeFoodModalBtn = document.getElementById('closeFoodModalBtn');
  const cancelFoodBtn = document.getElementById('cancelFoodBtn');
  const globalAddFoodBtn = document.getElementById('globalAddFoodBtn');

  // Goals Modal
  const goalsModal = document.getElementById('goalsModal');
  const goalsForm = document.getElementById('goalsForm');
  const targetCaloriesInput = document.getElementById('targetCaloriesInput');
  const targetProteinInput = document.getElementById('targetProteinInput');
  const targetCarbsInput = document.getElementById('targetCarbsInput');
  const targetFatInput = document.getElementById('targetFatInput');
  const openGoalsBtn = document.getElementById('openGoalsBtn');
  const closeGoalsModalBtn = document.getElementById('closeGoalsModalBtn');
  const cancelGoalsBtn = document.getElementById('cancelGoalsBtn');

  // Toast
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout = null;

  // ==========================================================================
  // Date Helpers
  // ==========================================================================

  function getTodayDateString() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDisplayDate(dateStr) {
    const todayStr = getTodayDateString();
    const targetDate = parseDateKey(dateStr);

    // Calculate relative day
    const todayDate = parseDateKey(todayStr);
    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    let mainTitle = '';
    if (diffDays === 0) {
      mainTitle = 'Today';
    } else if (diffDays === -1) {
      mainTitle = 'Yesterday';
    } else if (diffDays === 1) {
      mainTitle = 'Tomorrow';
    } else {
      mainTitle = targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    const subTitle = targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    return { mainTitle, subTitle };
  }

  // ==========================================================================
  // Storage Management
  // ==========================================================================

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.settings && parsed.days) {
          appState = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }

    // First time onboarding setup: Populate with sample data for today
    seedSampleData();
    saveState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  function seedSampleData() {
    const todayStr = getTodayDateString();
    appState.days[todayStr] = {
      waterGlasses: 4,
      entries: [
        {
          id: 'seed_1',
          meal: 'breakfast',
          name: 'Greek Yogurt with Granola & Honey',
          calories: 320,
          protein: 22,
          carbs: 42,
          fat: 6
        },
        {
          id: 'seed_2',
          meal: 'breakfast',
          name: 'Black Coffee with Splash of Oat Milk',
          calories: 35,
          protein: 1,
          carbs: 5,
          fat: 1.5
        },
        {
          id: 'seed_3',
          meal: 'lunch',
          name: 'Grilled Chicken Salad with Avocado & Vinaigrette',
          calories: 520,
          protein: 44,
          carbs: 18,
          fat: 28
        },
        {
          id: 'seed_4',
          meal: 'snacks',
          name: 'Green Apple & Peanut Butter',
          calories: 210,
          protein: 5,
          carbs: 26,
          fat: 11
        }
      ]
    };
  }

  function getDayData(dateStr) {
    if (!appState.days[dateStr]) {
      appState.days[dateStr] = {
        waterGlasses: 0,
        entries: []
      };
    }
    return appState.days[dateStr];
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function renderAll() {
    renderDateHeader();
    renderSummaryMetrics();
    renderMeals();
    renderHydration();
    renderPresets();
  }

  function renderDateHeader() {
    const formatted = formatDisplayDate(currentDateString);
    dateLabel.textContent = formatted.mainTitle;
    dateSubLabel.textContent = formatted.subTitle;
    datePickerInput.value = currentDateString;

    // Toggle today button highlight
    if (currentDateString === getTodayDateString()) {
      todayBtn.style.opacity = '0.5';
      todayBtn.style.pointerEvents = 'none';
    } else {
      todayBtn.style.opacity = '1';
      todayBtn.style.pointerEvents = 'auto';
    }
  }

  function renderSummaryMetrics() {
    const dayData = getDayData(currentDateString);
    const goalCals = appState.settings.dailyCalorieGoal || 2000;

    let totalCals = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    dayData.entries.forEach(entry => {
      totalCals += Number(entry.calories) || 0;
      totalP += Number(entry.protein) || 0;
      totalC += Number(entry.carbs) || 0;
      totalF += Number(entry.fat) || 0;
    });

    totalP = Math.round(totalP * 10) / 10;
    totalC = Math.round(totalC * 10) / 10;
    totalF = Math.round(totalF * 10) / 10;

    const remaining = goalCals - totalCals;
    const isOver = remaining < 0;

    // Numerical stats
    metricGoal.textContent = goalCals.toLocaleString();
    metricConsumed.textContent = totalCals.toLocaleString();
    metricNet.textContent = Math.abs(remaining).toLocaleString();

    // Center Big Ring Counter
    if (isOver) {
      caloriesRemainingNumber.textContent = '+' + Math.abs(remaining).toLocaleString();
      caloriesRemainingLabel.textContent = 'kcal over budget';
      caloriesRemainingNumber.style.color = '#dc2626';
      calorieStatusBadge.textContent = 'Over Budget';
      calorieStatusBadge.className = 'status-badge badge-over';
    } else {
      caloriesRemainingNumber.textContent = remaining.toLocaleString();
      caloriesRemainingLabel.textContent = 'kcal remaining';
      caloriesRemainingNumber.style.color = '#0f172a';
      calorieStatusBadge.textContent = 'On Track';
      calorieStatusBadge.className = 'status-badge badge-good';
    }

    // Circular Ring Progress
    const percentConsumed = goalCals > 0 ? (totalCals / goalCals) : 0;
    const clampedPercent = Math.min(Math.max(percentConsumed, 0), 1);
    const strokeOffset = RING_CIRCUMFERENCE - (clampedPercent * RING_CIRCUMFERENCE);

    calorieRingProgress.style.strokeDashoffset = strokeOffset;
    if (isOver) {
      calorieRingProgress.classList.add('over-budget');
    } else {
      calorieRingProgress.classList.remove('over-budget');
    }

    // Linear Progress Bar
    const percentInt = Math.round(percentConsumed * 100);
    calorieProgressBar.style.width = Math.min(percentInt, 100) + '%';
    if (isOver) {
      calorieProgressBar.classList.add('over-budget');
    } else {
      calorieProgressBar.classList.remove('over-budget');
    }

    percentConsumedLabel.textContent = `${percentInt}% of budget`;
    percentRemainingLabel.textContent = isOver ? `${Math.abs(remaining)} kcal over` : `${remaining} kcal left`;

    // Macronutrients
    const pGoal = appState.settings.proteinGoal || 140;
    const cGoal = appState.settings.carbsGoal || 220;
    const fGoal = appState.settings.fatGoal || 65;

    proteinCurrent.textContent = `${totalP}g`;
    proteinTarget.textContent = `${pGoal}g`;
    proteinBar.style.width = Math.min(Math.round((totalP / pGoal) * 100), 100) + '%';

    carbsCurrent.textContent = `${totalC}g`;
    carbsTarget.textContent = `${cGoal}g`;
    carbsBar.style.width = Math.min(Math.round((totalC / cGoal) * 100), 100) + '%';

    fatCurrent.textContent = `${totalF}g`;
    fatTarget.textContent = `${fGoal}g`;
    fatBar.style.width = Math.min(Math.round((totalF / fGoal) * 100), 100) + '%';

    // Total macro calories derived
    const macroCaloriesTotal = Math.round(totalP * 4 + totalC * 4 + totalF * 9);
    macroCalsTotal.textContent = `${macroCaloriesTotal} kcal from macros`;
  }

  function renderMeals() {
    const dayData = getDayData(currentDateString);

    const mealCategories = {
      breakfast: { listEl: breakfastList, badgeEl: breakfastCalories, total: 0 },
      lunch: { listEl: lunchList, badgeEl: lunchCalories, total: 0 },
      dinner: { listEl: dinnerList, badgeEl: dinnerCalories, total: 0 },
      snacks: { listEl: snacksList, badgeEl: snacksCalories, total: 0 }
    };

    // Clear existing DOM lists
    Object.keys(mealCategories).forEach(cat => {
      mealCategories[cat].listEl.innerHTML = '';
    });

    // Populate meals
    const mealsGrouped = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    dayData.entries.forEach(entry => {
      const category = (entry.meal || 'snacks').toLowerCase();
      if (mealsGrouped[category]) {
        mealsGrouped[category].push(entry);
        mealCategories[category].total += Number(entry.calories) || 0;
      }
    });

    // Render each category
    Object.keys(mealCategories).forEach(cat => {
      const { listEl, badgeEl, total } = mealCategories[cat];
      badgeEl.textContent = `${total.toLocaleString()} kcal`;

      const entries = mealsGrouped[cat];
      if (entries.length === 0) {
        listEl.innerHTML = `<div class="empty-meal-state">No items logged yet</div>`;
        return;
      }

      entries.forEach(item => {
        const row = document.createElement('div');
        row.className = 'food-item-row';

        const p = item.protein !== undefined && item.protein !== '' ? Number(item.protein) : null;
        const c = item.carbs !== undefined && item.carbs !== '' ? Number(item.carbs) : null;
        const f = item.fat !== undefined && item.fat !== '' ? Number(item.fat) : null;

        let macrosHtml = '';
        if (p !== null || c !== null || f !== null) {
          macrosHtml = `
            <div class="food-item-macros">
              ${p !== null ? `<span class="macro-tag-p">P: ${p}g</span>` : ''}
              ${c !== null ? `<span class="macro-tag-c">C: ${c}g</span>` : ''}
              ${f !== null ? `<span class="macro-tag-f">F: ${f}g</span>` : ''}
            </div>
          `;
        }

        row.innerHTML = `
          <div class="food-item-main">
            <span class="food-item-name">${escapeHtml(item.name)}</span>
            ${macrosHtml}
          </div>
          <div class="food-item-actions">
            <span class="food-item-cals">${Number(item.calories).toLocaleString()} kcal</span>
            <button class="food-delete-btn" data-id="${item.id}" title="Remove Item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        // Delete button listener
        const deleteBtn = row.querySelector('.food-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFoodEntry(item.id, item.name);
        });

        listEl.appendChild(row);
      });
    });
  }

  function renderHydration() {
    const dayData = getDayData(currentDateString);
    const count = dayData.waterGlasses || 0;
    const totalMl = count * 250;

    waterCountLabel.textContent = `${count} / 8 glasses (${totalMl} ml)`;
    waterGlassesContainer.innerHTML = '';

    for (let i = 1; i <= 8; i++) {
      const glassBtn = document.createElement('button');
      glassBtn.className = `water-cup-btn ${i <= count ? 'filled' : ''}`;
      glassBtn.title = `${i * 250} ml`;
      glassBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${i <= count ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      `;

      glassBtn.addEventListener('click', () => {
        // Toggle or set to i
        if (dayData.waterGlasses === i) {
          dayData.waterGlasses = i - 1;
        } else {
          dayData.waterGlasses = i;
        }
        saveState();
        renderHydration();
      });

      waterGlassesContainer.appendChild(glassBtn);
    }
  }

  function renderPresets() {
    presetTagsList.innerHTML = '';
    PRESET_FOODS.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = 'preset-tag-btn';
      btn.innerHTML = `
        <span>${preset.name}</span>
        <span class="preset-tag-cals">${preset.cals} kcal</span>
      `;
      btn.addEventListener('click', () => {
        quickAddPreset(preset);
      });
      presetTagsList.appendChild(btn);
    });
  }

  // ==========================================================================
  // Food Item Management
  // ==========================================================================

  function quickAddPreset(preset) {
    const dayData = getDayData(currentDateString);
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      meal: preset.defaultMeal,
      name: preset.name,
      calories: preset.cals,
      protein: preset.p,
      carbs: preset.c,
      fat: preset.f
    };

    dayData.entries.push(newEntry);
    saveState();
    renderAll();
    showToast(`Added ${preset.name} to ${capitalize(preset.defaultMeal)}`);
  }

  function openFoodModal(defaultMeal = 'breakfast') {
    editEntryId.value = '';
    foodModalTitle.textContent = 'Log Food Item';
    foodForm.reset();
    foodMealSelect.value = defaultMeal;
    foodModal.classList.remove('hidden');
    setTimeout(() => foodNameInput.focus(), 50);
  }

  function closeFoodModal() {
    foodModal.classList.add('hidden');
  }

  function saveFoodEntryFromForm(e) {
    e.preventDefault();

    const name = foodNameInput.value.trim();
    const meal = foodMealSelect.value;
    const calories = parseFloat(foodCaloriesInput.value);
    const protein = foodProteinInput.value !== '' ? parseFloat(foodProteinInput.value) : 0;
    const carbs = foodCarbsInput.value !== '' ? parseFloat(foodCarbsInput.value) : 0;
    const fat = foodFatInput.value !== '' ? parseFloat(foodFatInput.value) : 0;

    if (!name || isNaN(calories) || calories < 0) {
      alert('Please enter a valid food name and positive calorie count.');
      return;
    }

    const dayData = getDayData(currentDateString);
    const entryId = editEntryId.value;

    if (entryId) {
      // Edit existing
      const existing = dayData.entries.find(it => it.id === entryId);
      if (existing) {
        existing.name = name;
        existing.meal = meal;
        existing.calories = Math.round(calories);
        existing.protein = protein;
        existing.carbs = carbs;
        existing.fat = fat;
      }
    } else {
      // Create new entry
      const newEntry = {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        meal: meal,
        name: name,
        calories: Math.round(calories),
        protein: protein,
        carbs: carbs,
        fat: fat
      };
      dayData.entries.push(newEntry);
    }

    saveState();
    closeFoodModal();
    renderAll();
    showToast(`Logged ${name}`);
  }

  function deleteFoodEntry(entryId, foodName) {
    const dayData = getDayData(currentDateString);
    dayData.entries = dayData.entries.filter(item => item.id !== entryId);
    saveState();
    renderAll();
    showToast(`Removed ${foodName || 'item'}`);
  }

  // ==========================================================================
  // Goals & Settings Management
  // ==========================================================================

  function openGoalsModal() {
    targetCaloriesInput.value = appState.settings.dailyCalorieGoal || 2000;
    targetProteinInput.value = appState.settings.proteinGoal || 140;
    targetCarbsInput.value = appState.settings.carbsGoal || 220;
    targetFatInput.value = appState.settings.fatGoal || 65;

    goalsModal.classList.remove('hidden');
    setTimeout(() => targetCaloriesInput.focus(), 50);
  }

  function closeGoalsModal() {
    goalsModal.classList.add('hidden');
  }

  function saveGoalsFromForm(e) {
    e.preventDefault();

    const calGoal = parseInt(targetCaloriesInput.value, 10);
    const pGoal = parseInt(targetProteinInput.value, 10);
    const cGoal = parseInt(targetCarbsInput.value, 10);
    const fGoal = parseInt(targetFatInput.value, 10);

    if (isNaN(calGoal) || calGoal <= 0) {
      alert('Please enter a valid calorie budget greater than zero.');
      return;
    }

    appState.settings.dailyCalorieGoal = calGoal;
    appState.settings.proteinGoal = isNaN(pGoal) ? 140 : pGoal;
    appState.settings.carbsGoal = isNaN(cGoal) ? 220 : cGoal;
    appState.settings.fatGoal = isNaN(fGoal) ? 65 : fGoal;

    saveState();
    closeGoalsModal();
    renderAll();
    showToast('Updated daily nutritional targets');
  }

  // ==========================================================================
  // Date Navigation Handlers
  // ==========================================================================

  function stepDate(daysDelta) {
    const current = parseDateKey(currentDateString);
    current.setDate(current.getDate() + daysDelta);
    currentDateString = formatDateKey(current);
    renderAll();
  }

  function goToToday() {
    currentDateString = getTodayDateString();
    renderAll();
  }

  function handleDatePickerChange(e) {
    if (e.target.value) {
      currentDateString = e.target.value;
      renderAll();
    }
  }

  // ==========================================================================
  // Toast Helper
  // ==========================================================================

  function showToast(msg) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastMessage.textContent = msg;
    toastNotification.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2800);
  }

  // ==========================================================================
  // Utility & Escapes
  // ==========================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==========================================================================
  // Event Listeners Setup
  // ==========================================================================

  function setupEventListeners() {
    // Date Nav
    prevDateBtn.addEventListener('click', () => stepDate(-1));
    nextDateBtn.addEventListener('click', () => stepDate(1));
    todayBtn.addEventListener('click', goToToday);
    datePickerInput.addEventListener('change', handleDatePickerChange);

    // Clicking date wrapper triggers date picker
    document.querySelector('.date-display-wrapper').addEventListener('click', () => {
      datePickerInput.showPicker ? datePickerInput.showPicker() : datePickerInput.focus();
    });

    // Global Add Food
    globalAddFoodBtn.addEventListener('click', () => openFoodModal('breakfast'));

    // Category Add buttons
    document.querySelectorAll('.add-to-meal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealType = btn.getAttribute('data-meal') || 'breakfast';
        openFoodModal(mealType);
      });
    });

    // Food Modal Controls
    closeFoodModalBtn.addEventListener('click', closeFoodModal);
    cancelFoodBtn.addEventListener('click', closeFoodModal);
    foodForm.addEventListener('submit', saveFoodEntryFromForm);

    foodModal.addEventListener('click', (e) => {
      if (e.target === foodModal) closeFoodModal();
    });

    // Goals Modal Controls
    openGoalsBtn.addEventListener('click', openGoalsModal);
    closeGoalsModalBtn.addEventListener('click', closeGoalsModal);
    cancelGoalsBtn.addEventListener('click', closeGoalsModal);
    goalsForm.addEventListener('submit', saveGoalsFromForm);

    goalsModal.addEventListener('click', (e) => {
      if (e.target === goalsModal) closeGoalsModal();
    });

    // Hydration Buttons
    addGlassBtn.addEventListener('click', () => {
      const dayData = getDayData(currentDateString);
      if (dayData.waterGlasses < 16) {
        dayData.waterGlasses = (dayData.waterGlasses || 0) + 1;
        saveState();
        renderHydration();
        showToast('Added 250ml water 💧');
      }
    });

    removeGlassBtn.addEventListener('click', () => {
      const dayData = getDayData(currentDateString);
      dayData.waterGlasses = 0;
      saveState();
      renderHydration();
    });

    // Sidebar Data Management
    clearDayBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all logged food for this day?")) {
        const dayData = getDayData(currentDateString);
        dayData.entries = [];
        saveState();
        renderAll();
        showToast("Day's entries cleared");
      }
    });

    resetAllDataBtn.addEventListener('click', () => {
      if (confirm("Reset ALL data across all days to defaults? This cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEY);
        loadState();
        renderAll();
        showToast('All data has been reset to defaults');
      }
    });

    // Keyboard Shortcuts (Esc closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFoodModal();
        closeGoalsModal();
      }
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    loadState();
    setupEventListeners();
    renderAll();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

