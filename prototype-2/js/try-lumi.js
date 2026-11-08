// Demo interactiva "Prueba Lumi"
// Simula en memoria 35 HU del core. Al recargar la página, los datos vuelven al inicio.
(function () {
  'use strict';

  var app = document.getElementById('app');
  if (!app) return;

  /* ------------------------------------------------------------------
     Utilidades de fecha
     ------------------------------------------------------------------ */
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function diffDays(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }
  function toKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fromKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(d) { return d.getDate() + ' de ' + MONTHS[d.getMonth()]; }
  function shortDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); }
  function isValidKey(k) { return /^\d{4}-\d{2}-\d{2}$/.test(k) && !isNaN(fromKey(k)); }

  /* ------------------------------------------------------------------
     Catálogos
     ------------------------------------------------------------------ */
  var SEGMENTS = { student: 'Estudiante universitaria', professional: 'Mujer profesional', mother: 'Madre de familia' };
  var GOALS = { stress: 'Reducir el estrés', exams: 'Organizar exámenes y entregas', home: 'Gestionar el hogar', work: 'Rendir mejor en el trabajo' };
  var EVENT_TYPES = { academic: 'Clase o examen', work: 'Reunión laboral', home: 'Tarea del hogar', family: 'Cita familiar', personal: 'Personal' };
  var MEETING_PURPOSES = { planning: 'Planificación', follow_up: 'Seguimiento', client: 'Cliente', one_on_one: 'Uno a uno' };
  var IMPORTANCE = { high: 'Alta', medium: 'Media', low: 'Baja' };
  var SOURCES = { lumi: 'Lumi', google: 'Google Calendar', outlook: 'Outlook', csv: 'Horario CSV' };
  var FLOWS = ['Ligero', 'Medio', 'Fuerte', 'Muy fuerte'];
  var SYMPTOMS = ['Cólicos', 'Dolor de cabeza', 'Hinchazón', 'Fatiga', 'Sensibilidad'];
  var MOODS = { happy: 'Feliz', calm: 'Tranquila', tired: 'Cansada', irritable: 'Irritable', sad: 'Triste', anxious: 'Ansiosa' };
  var MEDS = ['Analgésico', 'Anticonceptivo', 'Suplemento de hierro'];
  var MOMENTS = { morning: 'Mañana', afternoon: 'Tarde', night: 'Noche' };
  var HABIT_CATALOG = [
    { name: 'Meditar 5 minutos', moment: 'morning' },
    { name: 'Planificar el día', moment: 'morning' },
    { name: 'Tomar vitaminas', moment: 'morning' },
    { name: 'Caminar 20 minutos', moment: 'afternoon' },
    { name: 'Pausa activa', moment: 'afternoon' },
    { name: 'Leer 15 minutos', moment: 'night' },
    { name: 'Estiramientos', moment: 'night' },
    { name: 'Diario de gratitud', moment: 'night' }
  ];
  var SELF_CARE = {
    happy: ['Aprovecha para avanzar tu tarea más difícil.', 'Sal a caminar 20 minutos y disfruta el día.'],
    calm: ['Buen momento para organizar tu semana.', 'Haz 10 minutos de estiramientos suaves.'],
    tired: ['Respiración 4-7-8 durante 3 minutos.', 'Toma una siesta corta de 20 minutos.', 'Estira cuello y espalda.'],
    irritable: ['Respiración cuadrada: inhala 4, sostén 4, exhala 4, sostén 4.', 'Escucha música tranquila 10 minutos.'],
    sad: ['Escríbele a alguien de confianza.', 'Toma una ducha tibia y descansa.', 'Anota una cosa que te salió bien hoy.'],
    anxious: ['Técnica 5-4-3-2-1: nombra lo que ves, oyes y sientes.', 'Respiración diafragmática 5 minutos.', 'Haz una lista corta con solo 3 pendientes.']
  };
  var SNACKS = {
    menstrual: ['Chocolate oscuro 70 %', 'Plátano con mantequilla de maní', 'Lentejas o espinaca (hierro)'],
    late: ['Frutos secos', 'Yogur con avena', 'Camote al horno'],
    normal: ['Fruta de temporada', 'Huevo duro', 'Hummus con zanahoria']
  };
  var NUTRITION = {
    menstrual: 'Prioriza alimentos con hierro (lentejas, espinaca) y bebe infusiones tibias.',
    follicular: 'Buen momento para proteínas magras y verduras frescas; mantén 8 vasos de agua.',
    ovulatory: 'Incluye fibra y antioxidantes (frutos rojos, avena) y no olvides hidratarte.',
    luteal: 'Reduce la sal y la cafeína; suma magnesio (plátano, palta, frutos secos).'
  };

  /* Modo discreto (US-26): cambia los términos biológicos por neutros */
  var TERMS = {
    period: ['periodo', 'fase ●'],
    Period: ['Periodo', 'Fase ●'],
    menstrual: ['Fase menstrual', 'Fase 1'],
    follicular: ['Fase folicular', 'Fase 2'],
    ovulatory: ['Fase ovulatoria', 'Fase 3'],
    luteal: ['Fase lútea', 'Fase 4'],
    lateLuteal: ['Fase lútea tardía', 'Fase 4'],
    flow: ['Intensidad del flujo', 'Intensidad'],
    symptoms: ['Síntomas', 'Notas'],
    meds: ['Medicamentos y anticonceptivos', 'Tomas del día'],
    cycle: ['ciclo', 'rutina']
  };
  function t(key) { var v = TERMS[key]; return v ? v[state.security.discreet ? 1 : 0] : key; }

  /* ------------------------------------------------------------------
     Estado en memoria
     ------------------------------------------------------------------ */
  var REAL_TODAY = startOfDay(new Date());
  var nextId = 1;
  var state;

  function buildHistory(lastStart, length) {
    // Tres ciclos anteriores con variación, para mostrar el ajuste por irregularidad (US-14)
    var lengths = [length + 1, length + 4, length - 1];
    var periods = [];
    var start = lastStart;
    for (var i = 0; i < lengths.length; i++) {
      start = addDays(start, -lengths[i]);
      periods.unshift({ start: toKey(start), end: toKey(addDays(start, 4 + (i % 2))) });
    }
    periods.push({ start: toKey(lastStart), end: null });
    return periods;
  }

  function createState(today) {
    var lastStart = addDays(today, -10);
    var s = {
      today: today,
      started: false,
      profile: { segment: 'student', goals: ['exams', 'stress'], name: 'Sofía' },
      cycle: { length: 28, periodLength: 5, autoAdjust: true },
      periods: buildHistory(lastStart, 28),
      logs: {},
      events: [],
      calendars: { google: 'off', outlook: 'off' },
      water: { goal: 8, reminderEvery: 2, reminderOn: false, byDay: {} },
      habits: [],
      security: { pin: null, locked: false, discreet: false },
      ui: { tab: 'home', month: new Date(today.getFullYear(), today.getMonth(), 1), selected: today, onboardingStep: 0 }
    };
    return s;
  }

  function seedData() {
    var today = state.today;
    var last = currentPeriod();
    var ls = fromKey(last.start);
    // Registros de días pasados para el historial y el reporte
    state.logs[toKey(ls)] = { flow: 'Fuerte', symptoms: ['Cólicos', 'Fatiga'], mood: 'tired', meds: ['Analgésico'] };
    state.logs[toKey(addDays(ls, 1))] = { flow: 'Medio', symptoms: ['Cólicos', 'Dolor de cabeza'], mood: 'irritable', meds: ['Analgésico'] };
    state.logs[toKey(addDays(ls, 2))] = { flow: 'Ligero', symptoms: ['Hinchazón'], mood: 'calm', meds: [] };
    var prev = fromKey(state.periods[state.periods.length - 2].start);
    state.logs[toKey(prev)] = { flow: 'Muy fuerte', symptoms: ['Cólicos'], mood: 'sad', meds: [] };
    state.logs[toKey(addDays(prev, 1))] = { flow: 'Fuerte', symptoms: ['Cólicos', 'Fatiga'], mood: 'tired', meds: ['Analgésico'] };

    // Actividades: dos importantes en días de baja energía (US-46 y US-47)
    var lowDays = [];
    for (var i = 2; i < 40 && lowDays.length < 2; i++) {
      var d = addDays(today, i);
      if (isLowEnergy(d) && (!lowDays.length || diffDays(d, lowDays[0]) > 2)) lowDays.push(d);
    }
    addEvent({ title: 'Examen de Cálculo', date: toKey(lowDays[0] || addDays(today, 3)), time: '08:00', type: 'academic', importance: 'high' });
    addEvent({ title: 'Presentación con cliente', date: toKey(lowDays[1] || addDays(today, 5)), time: '10:00', type: 'work', purpose: 'client', importance: 'high' });
    addEvent({ title: 'Cita con el pediatra de Mateo', date: toKey(addDays(today, 1)), time: '16:00', type: 'family', importance: 'medium', reminder: 1, cycleAware: false });
    addEvent({ title: 'Lavar la ropa', date: toKey(addDays(today, 2)), time: '18:00', type: 'home', importance: 'low' });
    addEvent({ title: 'Clase de yoga', date: toKey(today), time: '19:00', type: 'personal', importance: 'low' });

    state.habits = [
      { id: nextId++, name: 'Meditar 5 minutos', moment: 'morning', streak: 4, doneOn: null, paused: false, archived: false, totalDone: 12 },
      { id: nextId++, name: 'Caminar 20 minutos', moment: 'afternoon', streak: 2, doneOn: null, paused: false, archived: false, totalDone: 7 }
    ];
    var waterHistory = [6, 8, 5, 7, 4, 8];
    for (var w = 0; w < waterHistory.length; w++) state.water.byDay[toKey(addDays(today, -(waterHistory.length - w)))] = waterHistory[w];
    state.water.byDay[toKey(today)] = 3;
  }

  function addEvent(data) {
    var ev = {
      id: nextId++, title: data.title, date: data.date, time: data.time || '', type: data.type || 'personal',
      purpose: data.purpose || '', importance: data.importance || 'medium', source: data.source || 'lumi',
      reminder: data.reminder === undefined ? null : data.reminder, cycleAware: !!data.cycleAware, dismissed: false
    };
    state.events.push(ev);
    return ev;
  }

  /* ------------------------------------------------------------------
     Modelo del ciclo (simulación de la predicción)
     ------------------------------------------------------------------ */
  function sortedPeriods() { return state.periods.slice().sort(function (a, b) { return a.start < b.start ? -1 : 1; }); }
  function currentPeriod() { var p = sortedPeriods(); return p[p.length - 1]; }

  function cycleStats() {
    var p = sortedPeriods();
    var lengths = [];
    for (var i = 1; i < p.length; i++) lengths.push(diffDays(fromKey(p[i].start), fromKey(p[i - 1].start)));
    var periodLengths = p.filter(function (x) { return x.end; }).map(function (x) { return diffDays(fromKey(x.end), fromKey(x.start)) + 1; });
    var avg = lengths.length ? lengths.reduce(function (a, b) { return a + b; }, 0) / lengths.length : state.cycle.length;
    var min = lengths.length ? Math.min.apply(null, lengths) : avg;
    var max = lengths.length ? Math.max.apply(null, lengths) : avg;
    var avgPeriod = periodLengths.length ? periodLengths.reduce(function (a, b) { return a + b; }, 0) / periodLengths.length : state.cycle.periodLength;
    return { lengths: lengths, avg: avg, min: min, max: max, irregular: (max - min) >= 4, avgPeriod: avgPeriod };
  }

  // US-14: si el ciclo es irregular, la predicción usa el promedio real
  function cycleLength() {
    var st = cycleStats();
    return (state.cycle.autoAdjust && st.irregular) ? Math.round(st.avg) : state.cycle.length;
  }

  function lastStart() { return fromKey(currentPeriod().start); }

  function cycleDay(date) {
    var L = cycleLength();
    var d = diffDays(date, lastStart());
    return ((d % L) + L) % L + 1;
  }

  function daysLate() {
    var expected = addDays(lastStart(), cycleLength());
    var late = diffDays(state.today, expected);
    return late >= 1 ? late : 0;
  }

  // Fecha estimada del siguiente periodo (si ya pasó y no se registró, sigue siendo la misma)
  function nextPeriodDate() { return addDays(lastStart(), cycleLength()); }

  function phaseInfo(date) {
    var L = cycleLength();
    var P = state.cycle.periodLength;
    var day = cycleDay(date);
    if (day <= P) return { key: 'menstrual', name: t('menstrual'), energy: day <= 3 ? 30 : 45, level: 'Baja', advice: 'Prioriza el descanso y deja las tareas pesadas para después.' };
    if (day <= L - 15) return { key: 'follicular', name: t('follicular'), energy: 80, level: 'Alta', advice: 'Buen momento para estudiar temas difíciles o adelantar entregas.' };
    if (day <= L - 12) return { key: 'ovulatory', name: t('ovulatory'), energy: 90, level: 'Muy alta', advice: 'Aprovecha para exposiciones, reuniones y actividad física intensa.' };
    if (day <= L - 4) return { key: 'luteal', name: t('luteal'), energy: 60, level: 'Media', advice: 'Organiza tu semana y evita sobrecargar tu agenda.' };
    return { key: 'late', name: t('lateLuteal'), energy: 35, level: 'Baja', advice: 'Tu ' + t('period') + ' se acerca: planifica actividades más ligeras.' };
  }
  function isLowEnergy(date) { return phaseInfo(date).energy <= 45; }

  function periodStatus(date) {
    var key = toKey(date);
    var periods = sortedPeriods();
    for (var i = 0; i < periods.length; i++) {
      var p = periods[i];
      var end = p.end ? p.end : toKey(addDays(fromKey(p.start), state.cycle.periodLength - 1));
      if (key >= p.start && key <= end) {
        if (!p.end && key > toKey(state.today)) return 'predicted';
        return 'logged';
      }
    }
    if (diffDays(date, state.today) <= 0) return '';
    var d = diffDays(date, lastStart());
    var L = cycleLength();
    if (d >= L && (d % L) < state.cycle.periodLength) return 'predicted';
    return '';
  }

  /* ------------------------------------------------------------------
     Ayudas para construir HTML
     ------------------------------------------------------------------ */
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'checked' || k === 'selected' || k === 'disabled' || k === 'value') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
  }
  function card(title, hu, cls) {
    var c = h('section', { class: 'app-card' + (cls ? ' ' + cls : ''), 'data-hu': hu });
    c.appendChild(h('h4', { class: 'app-card__title' }, title, hu ? h('span', { class: 'app-card__hu', text: hu }) : null));
    return c;
  }
  var uid = 0;
  function fieldId() { uid += 1; return 'f' + uid; }
  function labeledInput(label, input) {
    var id = fieldId();
    input.id = id;
    return h('div', { class: 'field' }, h('label', { for: id, text: label }), input);
  }
  function select(options, value, name) {
    var s = h('select', { class: 'select', name: name || null });
    Object.keys(options).forEach(function (k) { s.appendChild(h('option', { value: k, selected: k === value, text: options[k] })); });
    return s;
  }
  function chips(name, values, checked, type, discreetLabels) {
    var group = h('div', { class: 'chips' });
    values.forEach(function (v, i) {
      var id = fieldId();
      var key = typeof v === 'object' ? v[0] : v;
      var label = typeof v === 'object' ? v[1] : v;
      group.appendChild(h('input', { type: type || 'checkbox', id: id, name: name, value: key, checked: checked.indexOf(key) >= 0, class: 'chips__input' }));
      group.appendChild(h('label', { for: id, class: 'chips__label', text: discreetLabels ? 'Nota ' + (i + 1) : label }));
    });
    return group;
  }
  function badge(text, mod) { return h('span', { class: 'badge' + (mod ? ' badge--' + mod : ''), text: text }); }

  var toastTimer;
  function toast(message) {
    var el = app.querySelector('.app__toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3500);
  }

  /* ------------------------------------------------------------------
     Barra superior: fecha simulada, modo discreto y bloqueo
     ------------------------------------------------------------------ */
  function renderTopbar() {
    var bar = app.querySelector('.app__topbar');
    bar.textContent = '';
    bar.appendChild(h('div', { class: 'app__greeting' },
      h('strong', { text: 'Hola, ' + state.profile.name }),
      h('span', { text: WEEKDAYS[state.today.getDay()] + ' ' + longDate(state.today) + (diffDays(state.today, REAL_TODAY) ? ' (simulado)' : '') })));
    var controls = h('div', { class: 'app__controls', role: 'group', 'aria-label': 'Simular el paso de los días' },
      h('button', { type: 'button', class: 'app-chip', onclick: function () { moveToday(-1); }, 'aria-label': 'Retroceder un día', text: '−1 día' }),
      h('button', { type: 'button', class: 'app-chip', onclick: function () { moveToday(1); }, 'aria-label': 'Avanzar un día', text: '+1 día' }),
      h('button', { type: 'button', class: 'app-chip', onclick: function () { moveToday(7); }, 'aria-label': 'Avanzar una semana', text: '+7 días' }),
      h('button', { type: 'button', class: 'app-chip', onclick: function () { moveToday(diffDays(REAL_TODAY, state.today)); }, text: 'Hoy' }),
      h('button', { type: 'button', class: 'app-chip' + (state.security.discreet ? ' is-active' : ''), 'aria-pressed': String(state.security.discreet), onclick: toggleDiscreet, text: 'Modo discreto' }),
      h('button', { type: 'button', class: 'app-chip', onclick: lockNow, text: 'Bloquear' }));
    bar.appendChild(controls);
  }

  function moveToday(n) {
    if (!n) return;
    state.today = addDays(state.today, n);
    state.ui.selected = state.today;
    state.ui.month = new Date(state.today.getFullYear(), state.today.getMonth(), 1);
    toast('Fecha simulada: ' + longDate(state.today));
    render();
  }

  /* ------------------------------------------------------------------
     Pestaña Inicio
     ------------------------------------------------------------------ */
  function renderHome(panel) {
    var info = phaseInfo(state.today);
    var late = daysLate();

    // US-45 Fase y energía
    var phase = card('Tu fase de hoy', 'US-45', 'app-card--phase');
    phase.appendChild(h('p', { class: 'app-phase__name', text: late ? 'Esperando tu ' + t('period') : info.name }));
    phase.appendChild(h('p', { class: 'app-muted', text: 'Día ' + cycleDay(state.today) + ' de tu ' + t('cycle') + ' de ' + cycleLength() + ' días · Próximo ' + t('period') + ': ' + longDate(nextPeriodDate()) }));
    var bar = h('div', { class: 'app-energy', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(info.energy), 'aria-label': 'Energía esperada' },
      h('div', { class: 'app-energy__fill', style: 'width:' + info.energy + '%' }));
    phase.appendChild(h('p', { class: 'app-label', text: 'Energía esperada: ' + info.level + ' (' + info.energy + ' %)' }));
    phase.appendChild(bar);
    phase.appendChild(h('p', { class: 'app-tip', text: info.advice }));
    panel.appendChild(phase);

    // US-16 Retraso
    if (late) {
      var lateCard = card('Retraso de tu ' + t('period'), 'US-16', 'app-card--warning');
      lateCard.appendChild(h('p', { text: 'Tu ' + t('period') + ' lleva ' + late + ' días de retraso respecto a la fecha estimada (' + longDate(addDays(lastStart(), cycleLength())) + '). Si el retraso continúa, considera consultar con un profesional de salud.' }));
      lateCard.appendChild(h('button', { type: 'button', class: 'button button--primary', onclick: function () { goTab('calendar'); }, text: 'Registrar inicio' }));
      panel.appendChild(lateCard);
    }

    // US-14 Ajuste por irregularidad
    var st = cycleStats();
    var irr = card('Predicción ajustada a tu ' + t('cycle'), 'US-14');
    if (st.irregular) {
      irr.appendChild(h('p', { text: 'Tus últimos ' + t('cycle') + 's duraron entre ' + st.min + ' y ' + st.max + ' días. ' +
        (state.cycle.autoAdjust ? 'Ajustamos la predicción a ' + Math.round(st.avg) + ' días (tu promedio real).' : 'El ajuste automático está apagado: usamos ' + state.cycle.length + ' días.') }));
    } else {
      irr.appendChild(h('p', { text: 'Tu ' + t('cycle') + ' es regular (' + Math.round(st.avg) + ' días en promedio).' }));
    }
    var autoId = fieldId();
    irr.appendChild(h('div', { class: 'app-switch' },
      h('input', { type: 'checkbox', id: autoId, checked: state.cycle.autoAdjust, onchange: function (e) { state.cycle.autoAdjust = e.target.checked; render(); toast(e.target.checked ? 'Ajuste automático activado' : 'Ajuste automático desactivado'); } }),
      h('label', { for: autoId, text: 'Ajustar automáticamente si detectamos irregularidad' })));
    panel.appendChild(irr);

    // US-46 y US-47 Alertas y reprogramación
    var alerts = card('Alertas de baja energía', 'US-46 · US-47');
    var list = upcomingConflicts();
    if (!list.length) alerts.appendChild(h('p', { class: 'app-ok', text: 'Ninguna actividad importante coincide con días de baja energía en los próximos 30 días.' }));
    list.forEach(function (ev) {
      var d = fromKey(ev.date);
      var suggestion = suggestDate(ev);
      var item = h('div', { class: 'app-alert' },
        h('p', {}, h('strong', { text: ev.title + ' · ' + longDate(d) }), h('br'),
          'Coincide con tu ' + phaseInfo(d).name.toLowerCase() + ' (energía ' + phaseInfo(d).level.toLowerCase() + ').'));
      if (suggestion) {
        item.appendChild(h('p', { class: 'app-muted', text: 'Sugerencia: el ' + WEEKDAYS[suggestion.getDay()] + ' ' + longDate(suggestion) + ' tendrás energía ' + phaseInfo(suggestion).level.toLowerCase() + '.' }));
        item.appendChild(h('div', { class: 'app-actions' },
          h('button', { type: 'button', class: 'button button--primary button--small', onclick: function () { ev.date = toKey(suggestion); toast('"' + ev.title + '" se movió al ' + longDate(suggestion)); render(); }, text: 'Mover al ' + shortDate(suggestion) }),
          h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { ev.dismissed = true; toast('Mantendremos la fecha. ¡Prepárate con anticipación!'); render(); }, text: 'Mantener fecha' })));
      } else {
        item.appendChild(h('p', { class: 'app-muted', text: 'No hay un día de energía alta cercano. Te recomendamos prepararte con anticipación y descansar el día anterior.' }));
        item.appendChild(h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { ev.dismissed = true; toast('Entendido. Te lo recordaremos.'); render(); }, text: 'Entendido' }));
      }
      alerts.appendChild(item);
    });
    panel.appendChild(alerts);

    // US-48 Recordatorios combinados
    var rem = card('Recordatorios inteligentes', 'US-48');
    var reminders = upcomingReminders();
    if (!reminders.length) rem.appendChild(h('p', { class: 'app-muted', text: 'No tienes recordatorios para hoy ni mañana. Créalos al agregar una actividad en Calendario.' }));
    reminders.forEach(function (r) { rem.appendChild(h('p', { class: 'app-reminder' }, h('strong', { text: r.when + ': ' }), r.text)); });
    panel.appendChild(rem);

    // Accesos rápidos
    var quick = card('Accesos rápidos', '');
    quick.appendChild(h('div', { class: 'app-actions' },
      h('button', { type: 'button', class: 'button button--primary', onclick: function () { state.ui.selected = state.today; goTab('calendar', '#log-form'); }, text: 'Registrar hoy' }),
      h('button', { type: 'button', class: 'button button--outline', onclick: function () { goTab('calendar', '#event-form'); }, text: 'Agregar actividad' }),
      h('button', { type: 'button', class: 'button button--outline', onclick: function () { goTab('wellness'); }, text: 'Ver bienestar' })));
    panel.appendChild(quick);
  }

  function upcomingConflicts() {
    return state.events.filter(function (ev) {
      var d = fromKey(ev.date);
      var diff = diffDays(d, state.today);
      return ev.importance === 'high' && !ev.dismissed && diff >= 0 && diff <= 30 && isLowEnergy(d);
    }).sort(byDate);
  }

  // US-47: busca el día más cercano con energía alta (hasta 14 días antes o después)
  function suggestDate(ev) {
    var base = fromKey(ev.date);
    for (var i = 1; i <= 14; i++) {
      var options = [addDays(base, -i), addDays(base, i)];
      for (var j = 0; j < options.length; j++) {
        var d = options[j];
        if (diffDays(d, state.today) >= 1 && phaseInfo(d).energy >= 80) return d;
      }
    }
    return null;
  }

  function upcomingReminders() {
    var out = [];
    var tomorrow = addDays(state.today, 1);
    state.events.forEach(function (ev) {
      if (ev.reminder === null || ev.reminder === undefined) return;
      var d = fromKey(ev.date);
      var remindOn = addDays(d, -ev.reminder);
      var when = diffDays(remindOn, state.today) === 0 ? 'Hoy' : (diffDays(remindOn, tomorrow) === 0 ? 'Mañana' : null);
      if (!when || diffDays(d, state.today) < 0) return;
      var text = ev.title + ' el ' + longDate(d) + (ev.time ? ' a las ' + ev.time : '') + '.';
      if (ev.cycleAware && (periodStatus(d) || isLowEnergy(d))) text += ' Ese día estarás en ' + phaseInfo(d).name.toLowerCase() + ': lleva lo necesario y descansa antes.';
      out.push({ when: when, text: text });
    });
    var next = nextPeriodDate();
    var until = diffDays(next, state.today);
    if (until >= 0 && until <= 2 && !daysLate()) out.push({ when: until === 0 ? 'Hoy' : 'En ' + until + ' días', text: 'Empieza tu ' + t('period') + ' estimado. Ten a mano lo que necesites.' });
    return out;
  }

  function byDate(a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }

  /* ------------------------------------------------------------------
     Pestaña Calendario
     ------------------------------------------------------------------ */
  function renderCalendar(panel) {
    var cal = card('Calendario unificado', 'US-44', 'app-card--calendar');
    var m = state.ui.month;
    cal.appendChild(h('div', { class: 'app-cal__head' },
      h('button', { type: 'button', class: 'app-icon-button', 'aria-label': 'Mes anterior', onclick: function () { state.ui.month = new Date(m.getFullYear(), m.getMonth() - 1, 1); render(); }, text: '‹' }),
      h('p', { class: 'app-cal__month', text: MONTHS[m.getMonth()] + ' ' + m.getFullYear() }),
      h('button', { type: 'button', class: 'app-icon-button', 'aria-label': 'Mes siguiente', onclick: function () { state.ui.month = new Date(m.getFullYear(), m.getMonth() + 1, 1); render(); }, text: '›' })));
    var week = h('div', { class: 'app-cal__week', 'aria-hidden': 'true' });
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(function (d) { week.appendChild(h('span', { text: d })); });
    cal.appendChild(week);
    var grid = h('div', { class: 'app-cal__grid', role: 'group', 'aria-label': 'Días de ' + MONTHS[m.getMonth()] });
    var offset = (new Date(m.getFullYear(), m.getMonth(), 1).getDay() + 6) % 7;
    for (var i = 0; i < offset; i++) grid.appendChild(h('span', { class: 'app-cal__day is-empty', 'aria-hidden': 'true' }));
    var days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (var dnum = 1; dnum <= days; dnum++) grid.appendChild(dayButton(new Date(m.getFullYear(), m.getMonth(), dnum)));
    cal.appendChild(grid);
    var legend = h('ul', { class: 'app-legend' },
      h('li', {}, h('span', { class: 'app-dot app-dot--period' }), t('Period')),
      h('li', {}, h('span', { class: 'app-dot app-dot--predicted' }), t('Period') + ' estimado'),
      h('li', {}, h('span', { class: 'app-dot app-dot--low' }), 'Baja energía'),
      h('li', {}, h('span', { class: 'app-dot app-dot--event' }), 'Actividad'));
    cal.appendChild(legend);
    panel.appendChild(cal);

    panel.appendChild(renderDayDetail());
    panel.appendChild(renderLogForm());
    panel.appendChild(renderEventForm());
  }

  function dayButton(date) {
    var key = toKey(date);
    var status = periodStatus(date);
    var events = state.events.filter(function (e) { return e.date === key; });
    var cls = 'app-cal__day';
    var labels = [WEEKDAYS[date.getDay()] + ' ' + longDate(date)];
    if (status === 'logged') { cls += ' is-period'; labels.push(t('period')); }
    else if (status === 'predicted') { cls += ' is-predicted'; labels.push(t('period') + ' estimado'); }
    else if (isLowEnergy(date)) { cls += ' is-low'; labels.push('baja energía'); }
    if (diffDays(date, state.today) === 0) { cls += ' is-today'; labels.push('hoy'); }
    if (diffDays(date, state.ui.selected) === 0) cls += ' is-selected';
    if (events.length) labels.push(events.length + (events.length === 1 ? ' actividad' : ' actividades'));
    var btn = h('button', { type: 'button', class: cls, 'aria-label': labels.join(', '), 'aria-pressed': String(diffDays(date, state.ui.selected) === 0),
      onclick: function () { state.ui.selected = date; render(); } }, String(date.getDate()));
    if (events.length) btn.appendChild(h('span', { class: 'app-cal__mark', 'aria-hidden': 'true' }));
    return btn;
  }

  function renderDayDetail() {
    var d = state.ui.selected;
    var key = toKey(d);
    var info = phaseInfo(d);
    var c = card(longDate(d) + ' · ' + info.name, 'US-44 · US-22 · US-23 · US-50', 'app-card--day');
    var events = state.events.filter(function (e) { return e.date === key; }).sort(byDate);
    if (!events.length) c.appendChild(h('p', { class: 'app-muted', text: 'Sin actividades este día.' }));
    var list = h('ul', { class: 'app-list' });
    events.forEach(function (ev) {
      list.appendChild(h('li', { class: 'app-list__item' },
        h('div', {}, h('strong', { text: (ev.time ? ev.time + ' · ' : '') + ev.title }), h('br'),
          badge(EVENT_TYPES[ev.type]), ' ', badge('Importancia ' + IMPORTANCE[ev.importance].toLowerCase(), ev.importance), ' ',
          ev.type === 'work' && ev.purpose ? badge(MEETING_PURPOSES[ev.purpose]) : null, ' ',
          ev.source !== 'lumi' ? badge(SOURCES[ev.source]) : null,
          ev.reminder !== null && ev.reminder !== undefined ? badge('Recordatorio') : null),
        h('button', { type: 'button', class: 'app-icon-button', 'aria-label': 'Eliminar ' + ev.title, onclick: function () { state.events = state.events.filter(function (x) { return x !== ev; }); toast('Actividad eliminada'); render(); }, text: '×' })));
    });
    c.appendChild(list);
    var log = state.logs[key];
    if (log) {
      var parts = [];
      if (log.flow) parts.push(t('flow') + ': ' + (state.security.discreet ? '●' : log.flow.toLowerCase()));
      if (log.symptoms.length) parts.push(t('symptoms') + ': ' + (state.security.discreet ? log.symptoms.length + ' notas' : log.symptoms.join(', ').toLowerCase()));
      if (log.mood) parts.push('Ánimo: ' + MOODS[log.mood].toLowerCase());
      if (log.meds.length) parts.push(t('meds') + ': ' + log.meds.join(', ').toLowerCase());
      c.appendChild(h('p', { class: 'app-tip', text: 'Registro del día · ' + parts.join(' · ') }));
    }
    return c;
  }

  // US-11, US-17, US-12, US-18, US-15
  function renderLogForm() {
    var d = state.ui.selected;
    var key = toKey(d);
    var log = state.logs[key] || { flow: '', symptoms: [], mood: '', meds: [] };
    var c = card('Registrar el ' + longDate(d), 'US-11 · US-17 · US-12 · US-18 · US-15');
    c.id = 'log-form';
    var msg = h('p', { class: 'app-message', role: 'status' });
    c.appendChild(h('div', { class: 'app-actions' },
      h('button', { type: 'button', class: 'button button--primary', onclick: function () { msg.textContent = startPeriod(d); }, text: 'Iniciar ' + t('period') }),
      h('button', { type: 'button', class: 'button button--outline', onclick: function () { msg.textContent = endPeriod(d); }, text: 'Terminar ' + t('period') })));
    var form = h('form', { novalidate: true });
    form.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: t('flow') }), chips('flow', FLOWS, [log.flow], 'radio', state.security.discreet)));
    form.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: t('symptoms') }), chips('symptoms', SYMPTOMS, log.symptoms, 'checkbox', state.security.discreet)));
    form.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: 'Estado de ánimo' }), chips('mood', Object.keys(MOODS).map(function (k) { return [k, MOODS[k]]; }), [log.mood], 'radio')));
    form.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: t('meds') + ' tomados' }), chips('meds', MEDS, log.meds, 'checkbox')));
    form.appendChild(h('button', { type: 'submit', class: 'button button--primary', text: 'Guardar registro' }));
    form.appendChild(msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (diffDays(d, state.today) > 0) { msg.textContent = 'No puedes registrar un día futuro.'; return; }
      var flow = form.querySelector('input[name=flow]:checked');
      var mood = form.querySelector('input[name=mood]:checked');
      var sym = Array.prototype.map.call(form.querySelectorAll('input[name=symptoms]:checked'), function (i) { return i.value; });
      var meds = Array.prototype.map.call(form.querySelectorAll('input[name=meds]:checked'), function (i) { return i.value; });
      if (!flow && !mood && !sym.length && !meds.length) { msg.textContent = 'Elige al menos una opción para guardar.'; return; }
      state.logs[key] = { flow: flow ? flow.value : '', symptoms: sym, mood: mood ? mood.value : '', meds: meds };
      toast('Registro guardado para el ' + longDate(d));
      render();
    });
    c.appendChild(form);
    return c;
  }

  function startPeriod(d) {
    if (diffDays(d, state.today) > 0) return 'No puedes registrar el inicio en una fecha futura.';
    var cur = currentPeriod();
    if (diffDays(d, fromKey(cur.start)) < 15) return 'Ya registraste un ' + t('period') + ' el ' + longDate(fromKey(cur.start)) + '. Elige una fecha posterior.';
    if (!cur.end) cur.end = toKey(addDays(fromKey(cur.start), state.cycle.periodLength - 1));
    state.periods.push({ start: toKey(d), end: null });
    toast('Inicio registrado el ' + longDate(d) + '. Actualizamos tus predicciones.');
    render();
    return '';
  }
  function endPeriod(d) {
    var cur = currentPeriod();
    if (diffDays(d, fromKey(cur.start)) < 0) return 'El fin no puede ser antes del inicio (' + longDate(fromKey(cur.start)) + ').';
    if (diffDays(d, state.today) > 0) return 'No puedes registrar el fin en una fecha futura.';
    if (diffDays(d, fromKey(cur.start)) > 10) return 'El fin debe estar dentro de los 10 días desde el inicio.';
    cur.end = toKey(d);
    toast('Fin registrado el ' + longDate(d) + '.');
    render();
    return '';
  }

  // US-21, US-50, US-22, US-23, US-48
  function renderEventForm() {
    var c = card('Agregar actividad', 'US-21 · US-50 · US-22 · US-23 · US-48');
    c.id = 'event-form';
    var title = h('input', { class: 'input', type: 'text', placeholder: 'Ej.: Reunión de equipo', maxlength: '60' });
    var date = h('input', { class: 'input', type: 'date', value: toKey(state.ui.selected) });
    var time = h('input', { class: 'input', type: 'time', value: '09:00' });
    var type = select(EVENT_TYPES, 'personal');
    var purpose = select(MEETING_PURPOSES, 'planning');
    var purposeField = labeledInput('Propósito de la reunión', purpose);
    purposeField.hidden = true;
    type.addEventListener('change', function () { purposeField.hidden = type.value !== 'work'; });
    var importance = select(IMPORTANCE, 'medium');
    var reminder = select({ none: 'Sin recordatorio', '0': 'El mismo día', '1': '1 día antes', '2': '2 días antes' }, 'none');
    var awareId = fieldId();
    var aware = h('input', { type: 'checkbox', id: awareId });
    var msg = h('p', { class: 'app-message', role: 'status' });
    var form = h('form', { novalidate: true, class: 'app-form-grid' },
      labeledInput('Título', title), labeledInput('Fecha', date), labeledInput('Hora', time),
      labeledInput('Tipo', type), purposeField, labeledInput('Importancia', importance), labeledInput('Recordatorio', reminder),
      h('div', { class: 'app-switch app-form-grid__full' }, aware, h('label', { for: awareId, text: 'Tener en cuenta mi ' + t('cycle') + ' en el recordatorio' })),
      h('button', { type: 'submit', class: 'button button--primary', text: 'Agregar al calendario' }), msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!title.value.trim()) { msg.textContent = 'Escribe un título para la actividad.'; title.focus(); return; }
      if (!isValidKey(date.value)) { msg.textContent = 'Elige una fecha válida.'; date.focus(); return; }
      var ev = addEvent({ title: title.value.trim(), date: date.value, time: time.value, type: type.value,
        purpose: type.value === 'work' ? purpose.value : '', importance: importance.value,
        reminder: reminder.value === 'none' ? null : +reminder.value, cycleAware: aware.checked });
      var d = fromKey(ev.date);
      state.ui.selected = d;
      state.ui.month = new Date(d.getFullYear(), d.getMonth(), 1);
      toast('"' + ev.title + '" agregada el ' + longDate(d) + (ev.importance === 'high' && isLowEnergy(d) ? '. Atención: cae en un día de baja energía.' : '.'));
      render();
    });
    c.appendChild(form);
    return c;
  }

  /* ------------------------------------------------------------------
     Pestaña Horarios
     ------------------------------------------------------------------ */
  var SAMPLE_SYNC = {
    google: [['Clase de Estadística', 1, '07:00', 'academic', 'medium'], ['Grupo de estudio', 3, '17:00', 'academic', 'low'], ['Entrega del informe', 6, '23:00', 'academic', 'high']],
    outlook: [['Reunión de planificación', 2, '09:00', 'work', 'medium', 'planning'], ['One-on-one con mi jefa', 4, '11:00', 'work', 'medium', 'one_on_one'], ['Demo con el cliente', 8, '15:00', 'work', 'high', 'client']]
  };

  function renderSchedule(panel) {
    // US-19 y US-24
    var sync = card('Agendas vinculadas', 'US-19 · US-24');
    ['google', 'outlook'].forEach(function (src) {
      var status = state.calendars[src];
      var count = state.events.filter(function (e) { return e.source === src; }).length;
      var row = h('div', { class: 'app-sync' },
        h('div', {}, h('strong', { text: SOURCES[src] }), h('br'),
          h('span', { class: 'app-muted', text: status === 'on' ? 'Sincronizada · ' + count + ' actividades' : (status === 'paused' ? 'Desconectada · ' + count + ' actividades guardadas' : 'Sin vincular') })));
      var actions = h('div', { class: 'app-actions' });
      if (status !== 'on') actions.appendChild(h('button', { type: 'button', class: 'button button--primary button--small', onclick: function () { connect(src); }, text: status === 'paused' ? 'Reconectar' : 'Vincular' }));
      if (status === 'on') actions.appendChild(h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { state.calendars[src] = 'paused'; toast(SOURCES[src] + ' desconectado. Tus actividades se mantienen.'); render(); }, text: 'Desconectar' }));
      if (status !== 'off') actions.appendChild(h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { removeCalendar(src); }, text: 'Eliminar agenda' }));
      row.appendChild(actions);
      sync.appendChild(row);
    });
    sync.appendChild(h('p', { class: 'app-muted', text: 'Simulación: al vincular se agregan actividades de ejemplo como si vinieran de tu cuenta.' }));
    panel.appendChild(sync);

    // US-20 Importar CSV
    var csv = card('Importar horario académico (CSV)', 'US-20');
    var area = h('textarea', { class: 'textarea', spellcheck: 'false' });
    area.value = 'curso,dia,hora\nCálculo,lunes,08:00\nFísica,miércoles,10:00\nProgramación,viernes,14:00';
    var file = h('input', { type: 'file', accept: '.csv,text/csv', class: 'input' });
    file.addEventListener('change', function () {
      var f = file.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () { area.value = String(reader.result); };
      reader.readAsText(f);
    });
    var result = h('div', { class: 'app-message', role: 'status' });
    if (state.ui.csvResult) {
      result.appendChild(h('p', { text: state.ui.csvResult.summary }));
      if (state.ui.csvResult.errors.length) result.appendChild(h('ul', {}, state.ui.csvResult.errors.map(function (e) { return h('li', { text: e }); })));
    }
    csv.appendChild(h('p', { class: 'app-muted', text: 'Formato: curso,dia,hora. Cada clase se agrega las próximas 4 semanas.' }));
    csv.appendChild(labeledInput('Pega tu horario', area));
    csv.appendChild(labeledInput('O sube un archivo .csv', file));
    csv.appendChild(h('button', { type: 'button', class: 'button button--primary', onclick: function () { importCsv(area.value, result); }, text: 'Importar horario' }));
    csv.appendChild(result);
    panel.appendChild(csv);

    // Agenda de los próximos 14 días con clasificación de reuniones (US-23)
    var agenda = card('Tu agenda (próximos 14 días)', 'US-23');
    var upcoming = state.events.filter(function (e) { var d = diffDays(fromKey(e.date), state.today); return d >= 0 && d <= 14; }).sort(byDate);
    if (!upcoming.length) agenda.appendChild(h('p', { class: 'app-muted', text: 'No hay actividades en los próximos 14 días.' }));
    var list = h('ul', { class: 'app-list' });
    upcoming.forEach(function (ev) {
      var item = h('li', { class: 'app-list__item' },
        h('div', {}, h('strong', { text: shortDate(fromKey(ev.date)) + (ev.time ? ' · ' + ev.time : '') + ' · ' + ev.title }), h('br'),
          badge(SOURCES[ev.source]), ' ', badge(EVENT_TYPES[ev.type]), ' ', badge(IMPORTANCE[ev.importance], ev.importance)));
      if (ev.type === 'work') {
        var s = select(MEETING_PURPOSES, ev.purpose || 'planning');
        s.setAttribute('aria-label', 'Propósito de ' + ev.title);
        s.classList.add('select--small');
        s.addEventListener('change', function () { ev.purpose = s.value; toast('Reunión clasificada como "' + MEETING_PURPOSES[s.value] + '"'); });
        item.appendChild(s);
      }
      list.appendChild(item);
    });
    agenda.appendChild(list);
    panel.appendChild(agenda);
  }

  function connect(src) {
    if (state.calendars[src] === 'off') {
      SAMPLE_SYNC[src].forEach(function (r) {
        addEvent({ title: r[0], date: toKey(addDays(state.today, r[1])), time: r[2], type: r[3], importance: r[4], purpose: r[5] || '', source: src });
      });
    }
    state.calendars[src] = 'on';
    toast(SOURCES[src] + ' sincronizado con Lumi.');
    render();
  }
  function removeCalendar(src) {
    var n = state.events.filter(function (e) { return e.source === src; }).length;
    state.events = state.events.filter(function (e) { return e.source !== src; });
    state.calendars[src] = 'off';
    toast(SOURCES[src] + ' eliminado. Se quitaron ' + n + ' actividades.');
    render();
  }

  function importCsv(text, result) {
    var dayIndex = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, 'miércoles': 3, jueves: 4, viernes: 5, sabado: 6, 'sábado': 6 };
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length && /^curso\s*,/i.test(lines[0])) lines.shift();
    var ok = 0, errors = [];
    lines.forEach(function (line, i) {
      var parts = line.split(',').map(function (p) { return p.trim(); });
      var course = parts[0], day = (parts[1] || '').toLowerCase(), time = parts[2] || '';
      if (parts.length < 3 || !course) { errors.push('Fila ' + (i + 1) + ': faltan datos.'); return; }
      if (!(day in dayIndex)) { errors.push('Fila ' + (i + 1) + ': el día "' + parts[1] + '" no es válido.'); return; }
      if (!/^\d{1,2}:\d{2}$/.test(time)) { errors.push('Fila ' + (i + 1) + ': la hora "' + time + '" debe tener el formato 08:00.'); return; }
      var first = addDays(state.today, (dayIndex[day] - state.today.getDay() + 7) % 7);
      for (var w = 0; w < 4; w++) addEvent({ title: 'Clase de ' + course, date: toKey(addDays(first, w * 7)), time: time, type: 'academic', importance: 'medium', source: 'csv' });
      ok++;
    });
    void result;
    var summary = ok ? ok + (ok === 1 ? ' curso importado' : ' cursos importados') + ' (4 semanas cada uno).' : 'No se importó ningún curso.';
    if (!lines.length) summary = 'No hay filas para importar.';
    if (errors.length) summary += ' Revisa estas filas:';
    state.ui.csvResult = { summary: summary, errors: errors };
    if (ok) toast(summary.replace(' Revisa estas filas:', ''));
    render();
  }

  /* ------------------------------------------------------------------
     Pestaña Bienestar
     ------------------------------------------------------------------ */
  function renderWellness(panel) {
    var todayKey = toKey(state.today);
    var info = phaseInfo(state.today);
    var log = state.logs[todayKey];

    // US-35 Autocuidado según ánimo
    var care = card('Autocuidado según tu ánimo', 'US-35');
    var mood = log && log.mood;
    if (!mood) care.appendChild(h('p', { class: 'app-muted', text: '¿Cómo te sientes hoy? Elige tu ánimo y te sugerimos actividades.' }));
    var moods = h('div', { class: 'app-actions' });
    Object.keys(MOODS).forEach(function (k) {
      moods.appendChild(h('button', { type: 'button', class: 'app-chip' + (mood === k ? ' is-active' : ''), 'aria-pressed': String(mood === k),
        onclick: function () { var l = state.logs[todayKey] || { flow: '', symptoms: [], mood: '', meds: [] }; l.mood = k; state.logs[todayKey] = l; render(); }, text: MOODS[k] }));
    });
    care.appendChild(moods);
    if (mood) care.appendChild(h('ul', { class: 'app-tips' }, SELF_CARE[mood].map(function (s) { return h('li', { text: s }); })));
    panel.appendChild(care);

    // US-36 Refrigerios
    var snack = card('Refrigerios para tu energía', 'US-36');
    var snackKey = info.key === 'menstrual' ? 'menstrual' : (info.key === 'late' ? 'late' : 'normal');
    snack.appendChild(h('p', { class: info.energy <= 45 ? 'app-warning' : 'app-muted', text: info.energy <= 45 ? 'Tu energía hoy es baja. Te recomendamos:' : 'Tu energía hoy es ' + info.level.toLowerCase() + '. Opciones saludables:' }));
    snack.appendChild(h('ul', { class: 'app-tips' }, SNACKS[snackKey].map(function (s) { return h('li', { text: s }); })));
    panel.appendChild(snack);

    // US-37 Agua
    var water = card('Hidratación', 'US-37');
    var glasses = state.water.byDay[todayKey] || 0;
    water.appendChild(h('p', { class: 'app-water' }, h('strong', { text: glasses + ' / ' + state.water.goal }), ' vasos de agua hoy'));
    water.appendChild(h('div', { class: 'app-energy', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(state.water.goal), 'aria-valuenow': String(glasses), 'aria-label': 'Vasos de agua' },
      h('div', { class: 'app-energy__fill app-energy__fill--water', style: 'width:' + Math.min(100, glasses / state.water.goal * 100) + '%' })));
    water.appendChild(h('div', { class: 'app-actions' },
      h('button', { type: 'button', class: 'button button--primary button--small', onclick: function () { state.water.byDay[todayKey] = glasses + 1; if (glasses + 1 === state.water.goal) toast('¡Meta de agua cumplida!'); render(); }, text: '+1 vaso' }),
      h('button', { type: 'button', class: 'button button--outline button--small', disabled: glasses === 0, onclick: function () { state.water.byDay[todayKey] = Math.max(0, glasses - 1); render(); }, text: '−1 vaso' })));
    var every = select({ '1': 'Cada 1 hora', '2': 'Cada 2 horas', '3': 'Cada 3 horas' }, String(state.water.reminderEvery));
    every.addEventListener('change', function () { state.water.reminderEvery = +every.value; render(); });
    var remId = fieldId();
    water.appendChild(h('div', { class: 'app-form-grid' }, labeledInput('Frecuencia del recordatorio', every),
      h('div', { class: 'app-switch' }, h('input', { type: 'checkbox', id: remId, checked: state.water.reminderOn, onchange: function (e) { state.water.reminderOn = e.target.checked; if (e.target.checked) toast('Recordatorio activado: próximo a las ' + nextWaterTime()); render(); } }),
        h('label', { for: remId, text: 'Activar recordatorio de agua' }))));
    if (state.water.reminderOn) water.appendChild(h('p', { class: 'app-tip', text: 'Próximo recordatorio: ' + nextWaterTime() + ' · Te avisaremos cada ' + state.water.reminderEvery + ' h entre las 8:00 y las 22:00.' }));
    panel.appendChild(water);

    // US-38 Resumen semanal
    var week = card('Resumen semanal de hidratación y nutrición', 'US-38');
    var chart = h('div', { class: 'app-bars', role: 'img', 'aria-label': 'Vasos de agua de los últimos 7 días' });
    var total = 0;
    for (var i = 6; i >= 0; i--) {
      var d = addDays(state.today, -i);
      var v = state.water.byDay[toKey(d)] || 0;
      total += v;
      chart.appendChild(h('div', { class: 'app-bars__col' },
        h('span', { class: 'app-bars__value', text: String(v) }),
        h('span', { class: 'app-bars__bar' + (v >= state.water.goal ? ' is-goal' : ''), style: 'height:' + Math.max(6, v / state.water.goal * 80) + 'px' }),
        h('span', { class: 'app-bars__label', text: WEEKDAYS[d.getDay()].slice(0, 2) })));
    }
    week.appendChild(chart);
    var avg = (total / 7).toFixed(1);
    week.appendChild(h('p', { text: 'Promedio: ' + avg + ' vasos al día. ' + (avg >= state.water.goal ? '¡Excelente hidratación!' : 'Intenta sumar ' + Math.ceil(state.water.goal - avg) + ' vasos más al día.') }));
    week.appendChild(h('p', { class: 'app-tip', text: 'Nutrición para tu ' + (info.key === 'late' ? t('luteal') : info.name).toLowerCase() + ': ' + NUTRITION[info.key === 'late' ? 'luteal' : info.key] }));
    panel.appendChild(week);

    panel.appendChild(renderHabits());
  }

  function nextWaterTime() {
    var now = new Date();
    var hour = Math.max(8, now.getHours() + state.water.reminderEvery);
    if (hour > 22) return '8:00 de mañana';
    return hour + ':00';
  }

  // US-30, US-31, US-32, US-33, US-34
  function renderHabits() {
    var todayKey = toKey(state.today);
    var c = card('Mis hábitos', 'US-30 · US-31 · US-32 · US-33 · US-34');
    var available = HABIT_CATALOG.filter(function (x) { return !state.habits.some(function (hb) { return hb.name === x.name && !hb.archived; }); });
    var opts = {};
    available.forEach(function (x, i) { opts[i] = x.name + ' (' + MOMENTS[x.moment].toLowerCase() + ')'; });
    if (available.length) {
      var s = select(opts, '0');
      c.appendChild(h('div', { class: 'app-form-grid' }, labeledInput('Catálogo de hábitos sugeridos', s),
        h('button', { type: 'button', class: 'button button--primary', onclick: function () {
          var x = available[+s.value];
          var archived = state.habits.filter(function (hb) { return hb.name === x.name && hb.archived; })[0];
          if (archived) { archived.archived = false; toast('Recuperamos "' + x.name + '" con su historial.'); }
          else { state.habits.push({ id: nextId++, name: x.name, moment: x.moment, streak: 0, doneOn: null, paused: false, archived: false, totalDone: 0 }); toast('"' + x.name + '" agregado a tu rutina.'); }
          render();
        }, text: 'Agregar hábito' })));
    }
    Object.keys(MOMENTS).forEach(function (m) {
      var items = state.habits.filter(function (hb) { return hb.moment === m && !hb.archived; });
      if (!items.length) return;
      var group = h('div', { class: 'app-habits' }, h('h5', { class: 'app-habits__moment', text: MOMENTS[m] }));
      items.forEach(function (hb) {
        var doneToday = hb.doneOn === todayKey;
        var id = fieldId();
        group.appendChild(h('div', { class: 'app-habit' + (hb.paused ? ' is-paused' : '') },
          h('div', { class: 'app-switch' },
            h('input', { type: 'checkbox', id: id, checked: doneToday, disabled: hb.paused, onchange: function (e) { toggleHabit(hb, e.target.checked); } }),
            h('label', { for: id }, hb.name, h('br'), h('span', { class: 'app-muted', text: hb.paused ? 'En pausa: no cuenta como incumplido' : '🔥 Racha: ' + hb.streak + (hb.streak === 1 ? ' día' : ' días') }))),
          h('div', { class: 'app-actions' },
            h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { hb.paused = !hb.paused; toast(hb.paused ? '"' + hb.name + '" en pausa.' : '"' + hb.name + '" reactivado.'); render(); }, text: hb.paused ? 'Reanudar' : 'Pausar' }),
            h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { hb.archived = true; toast('"' + hb.name + '" archivado. Sus estadísticas se guardan.'); render(); }, text: 'Archivar' }))));
      });
      c.appendChild(group);
    });
    var archived = state.habits.filter(function (hb) { return hb.archived; });
    if (archived.length) {
      c.appendChild(h('details', { class: 'app-archived' }, h('summary', { text: 'Hábitos archivados (' + archived.length + ')' }),
        h('ul', { class: 'app-list' }, archived.map(function (hb) {
          return h('li', { class: 'app-list__item' }, h('span', { text: hb.name + ' · ' + hb.totalDone + ' días cumplidos' }),
            h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { hb.archived = false; render(); }, text: 'Restaurar' }));
        }))));
    }
    return c;
  }

  function toggleHabit(hb, done) {
    var todayKey = toKey(state.today);
    if (done) {
      hb.streak += 1; hb.totalDone += 1; hb.doneOn = todayKey;
      toast('¡Bien! Racha de ' + hb.streak + ' días en "' + hb.name + '".');
    } else if (hb.doneOn === todayKey) {
      hb.streak = Math.max(0, hb.streak - 1); hb.totalDone = Math.max(0, hb.totalDone - 1); hb.doneOn = null;
    }
    render();
  }

  /* ------------------------------------------------------------------
     Pestaña Perfil
     ------------------------------------------------------------------ */
  function renderProfile(panel) {
    // US-01, US-05, US-03
    var prof = card('Mi perfil', 'US-01 · US-05 · US-03');
    prof.appendChild(h('ul', { class: 'app-list' },
      h('li', {}, h('strong', { text: 'Estilo de vida: ' }), SEGMENTS[state.profile.segment]),
      h('li', {}, h('strong', { text: 'Objetivos: ' }), state.profile.goals.map(function (g) { return GOALS[g]; }).join(' · ') || 'Sin objetivos'),
      h('li', {}, h('strong', { text: 'Último ' + t('period') + ': ' }), longDate(lastStart())),
      h('li', {}, h('strong', { text: 'Duración del ' + t('cycle') + ': ' }), state.cycle.length + ' días (predicción actual: ' + cycleLength() + ')')));
    prof.appendChild(h('button', { type: 'button', class: 'button button--outline', onclick: function () { openOnboarding(); }, text: 'Editar configuración' }));
    panel.appendChild(prof);

    // US-25 y US-26
    var sec = card('Privacidad y seguridad', 'US-25 · US-26');
    var pin = h('input', { class: 'input', type: 'password', inputmode: 'numeric', maxlength: '4', autocomplete: 'off', placeholder: '4 dígitos' });
    var pin2 = h('input', { class: 'input', type: 'password', inputmode: 'numeric', maxlength: '4', autocomplete: 'off', placeholder: 'Repite el PIN' });
    var msg = h('p', { class: 'app-message', role: 'status' });
    sec.appendChild(h('p', { class: 'app-muted', text: state.security.pin ? 'Tu bloqueo con PIN está activo.' : 'Protege Lumi con un PIN o con tu huella (simulado).' }));
    sec.appendChild(h('div', { class: 'app-form-grid' }, labeledInput(state.security.pin ? 'Nuevo PIN' : 'Crear PIN', pin), labeledInput('Confirmar PIN', pin2)));
    sec.appendChild(h('div', { class: 'app-actions' },
      h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        if (!/^\d{4}$/.test(pin.value)) { msg.textContent = 'El PIN debe tener exactamente 4 números.'; return; }
        if (pin.value !== pin2.value) { msg.textContent = 'Los PIN no coinciden.'; return; }
        state.security.pin = pin.value; toast('PIN guardado. Prueba con "Bloquear".'); render();
      }, text: 'Guardar PIN' }),
      state.security.pin ? h('button', { type: 'button', class: 'button button--outline', onclick: function () { state.security.pin = null; toast('Bloqueo con PIN desactivado.'); render(); }, text: 'Quitar PIN' }) : null,
      h('button', { type: 'button', class: 'button button--outline', onclick: lockNow, text: 'Bloquear ahora' })));
    sec.appendChild(msg);
    var discId = fieldId();
    sec.appendChild(h('div', { class: 'app-switch' },
      h('input', { type: 'checkbox', id: discId, checked: state.security.discreet, onchange: toggleDiscreet }),
      h('label', { for: discId, text: 'Modo discreto: cambia los términos biológicos por nombres neutros para usar Lumi en público' })));
    panel.appendChild(sec);

    // US-13 Historial
    var hist = card('Historial de ' + t('cycle') + 's', 'US-13');
    var periods = sortedPeriods();
    var table = h('table', { class: 'app-table' },
      h('caption', { class: 'visually-hidden', text: 'Historial de ' + t('cycle') + 's anteriores' }),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Inicio' }), h('th', { scope: 'col', text: 'Días de ' + t('period') }), h('th', { scope: 'col', text: 'Duración del ' + t('cycle') }))));
    var body = h('tbody');
    periods.slice().reverse().forEach(function (p, i, arr) {
      var start = fromKey(p.start);
      var prev = arr[i + 1];
      var len = i === 0 ? 'En curso' : diffDays(fromKey(arr[i - 1].start), start) + ' días';
      body.appendChild(h('tr', {}, h('td', { text: longDate(start) + ' ' + start.getFullYear() }),
        h('td', { text: p.end ? String(diffDays(fromKey(p.end), start) + 1) : 'En curso' }), h('td', { text: len })));
      void prev;
    });
    table.appendChild(body);
    hist.appendChild(h('div', { class: 'app-table-wrap' }, table));
    panel.appendChild(hist);

    panel.appendChild(renderReport());
  }

  // US-49 y estadística de US-15
  function renderReport() {
    var c = card('Reporte de patrones', 'US-49');
    var st = cycleStats();
    var symptomCount = {}, moodCount = {}, cramps = 0, crampsWithPain = 0, logged = 0;
    Object.keys(state.logs).forEach(function (k) {
      var l = state.logs[k];
      logged++;
      l.symptoms.forEach(function (s) { symptomCount[s] = (symptomCount[s] || 0) + 1; });
      if (l.mood) moodCount[l.mood] = (moodCount[l.mood] || 0) + 1;
      if (l.symptoms.indexOf('Cólicos') >= 0) { cramps++; if (l.meds.indexOf('Analgésico') >= 0) crampsWithPain++; }
    });
    var topSymptom = Object.keys(symptomCount).sort(function (a, b) { return symptomCount[b] - symptomCount[a]; })[0];
    var topMood = Object.keys(moodCount).sort(function (a, b) { return moodCount[b] - moodCount[a]; })[0];
    c.appendChild(h('div', { class: 'app-stats' },
      stat(Math.round(st.avg) + ' días', 'Duración promedio del ' + t('cycle')),
      stat(st.min + '–' + st.max, 'Rango de duración'),
      stat(st.avgPeriod.toFixed(1) + ' días', 'Duración promedio del ' + t('period')),
      stat(String(logged), 'Días registrados')));
    c.appendChild(h('ul', { class: 'app-tips' },
      h('li', { text: (state.security.discreet ? 'Nota' : 'Síntoma') + ' más frecuente: ' + (topSymptom ? (state.security.discreet ? 'nota registrada ' + symptomCount[topSymptom] + ' veces' : topSymptom.toLowerCase() + ' (' + symptomCount[topSymptom] + ' veces)') : 'sin datos') }),
      h('li', { text: 'Ánimo más frecuente: ' + (topMood ? MOODS[topMood].toLowerCase() : 'sin datos') }),
      h('li', { text: 'Días con cólicos en que tomaste analgésico: ' + crampsWithPain + ' de ' + cramps + '.' }),
      h('li', { text: 'Tu energía suele ser más baja en los días 1–3 y en los últimos 4 días de tu ' + t('cycle') + '.' })));
    return c;
  }
  function stat(value, label) { return h('div', { class: 'app-stat' }, h('strong', { text: value }), h('span', { text: label })); }

  /* ------------------------------------------------------------------
     Modo discreto y bloqueo
     ------------------------------------------------------------------ */
  function toggleDiscreet() {
    state.security.discreet = !state.security.discreet;
    toast(state.security.discreet ? 'Modo discreto activado' : 'Modo discreto desactivado');
    render();
  }

  function lockNow() {
    if (!state.security.pin) { toast('Primero crea un PIN en Perfil.'); goTab('profile'); return; }
    state.security.locked = true;
    render();
  }

  function renderLock(overlay) {
    var pin = h('input', { class: 'input app-lock__pin', type: 'password', inputmode: 'numeric', maxlength: '4', autocomplete: 'off', 'aria-label': 'PIN de 4 dígitos' });
    var msg = h('p', { class: 'app-message', role: 'alert' });
    var form = h('form', { class: 'app-lock', novalidate: true },
      h('p', { class: 'app-lock__logo', text: 'LUMI' }),
      h('h4', { text: 'Lumi está bloqueada' }),
      h('p', { class: 'app-muted', text: 'Ingresa tu PIN para continuar.' }),
      pin,
      h('button', { type: 'submit', class: 'button button--primary', text: 'Desbloquear' }),
      h('button', { type: 'button', class: 'button button--outline', onclick: function () {
        msg.textContent = 'Leyendo huella…';
        setTimeout(function () { state.security.locked = false; toast('Desbloqueado con huella (simulado).'); render(); }, 900);
      }, text: 'Usar huella (simulado)' }),
      msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pin.value === state.security.pin) { state.security.locked = false; toast('Desbloqueado.'); render(); }
      else { msg.textContent = 'PIN incorrecto. Inténtalo de nuevo.'; pin.value = ''; pin.focus(); }
    });
    overlay.appendChild(form);
    setTimeout(function () { pin.focus(); }, 50);
  }

  /* ------------------------------------------------------------------
     Bienvenida y configuración inicial: US-01, US-03, US-05, US-06
     ------------------------------------------------------------------ */
  var draft;
  function openOnboarding() {
    draft = { segment: state.profile.segment, goals: state.profile.goals.slice(), name: state.profile.name,
      lastStart: toKey(lastStart()), length: state.cycle.length };
    state.ui.onboardingStep = 1;
    render();
  }

  function renderOnboarding(overlay) {
    var step = state.ui.onboardingStep;
    var box = h('div', { class: 'app-onboarding', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'onboarding-title' });
    box.appendChild(h('p', { class: 'app-muted', text: 'Paso ' + step + ' de 4' }));
    var msg = h('p', { class: 'app-message', role: 'status' });
    var next = function () { state.ui.onboardingStep++; render(); };
    var back = h('button', { type: 'button', class: 'button button--outline', onclick: function () { state.ui.onboardingStep--; render(); }, text: 'Atrás' });

    if (step === 1) {
      box.appendChild(h('h4', { id: 'onboarding-title', text: '¿Cuál es tu estilo de vida? (US-01)' }));
      var name = h('input', { class: 'input', type: 'text', value: draft.name, maxlength: '20' });
      box.appendChild(labeledInput('¿Cómo te llamamos?', name));
      var seg = h('fieldset', { class: 'field' }, h('legend', { text: 'Así adaptamos las sugerencias a tu rutina' }),
        chips('segment', Object.keys(SEGMENTS).map(function (k) { return [k, SEGMENTS[k]]; }), [draft.segment], 'radio'));
      box.appendChild(seg);
      box.appendChild(h('div', { class: 'app-actions' }, h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        draft.name = name.value.trim() || 'Sofía';
        draft.segment = seg.querySelector('input:checked').value;
        next();
      }, text: 'Continuar' })));
    } else if (step === 2) {
      box.appendChild(h('h4', { id: 'onboarding-title', text: 'Tu ' + t('cycle') + ' (US-03)' }));
      var last = h('input', { class: 'input', type: 'date', value: draft.lastStart, max: toKey(state.today) });
      var len = h('input', { class: 'input', type: 'number', min: '21', max: '40', value: String(draft.length) });
      box.appendChild(labeledInput('Fecha de tu última menstruación', last));
      box.appendChild(labeledInput('Duración promedio de tu ' + t('cycle') + ' (21 a 40 días)', len));
      box.appendChild(msg);
      box.appendChild(h('div', { class: 'app-actions' }, back, h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        if (!isValidKey(last.value)) { msg.textContent = 'Elige la fecha de tu última menstruación.'; return; }
        if (diffDays(fromKey(last.value), state.today) > 0) { msg.textContent = 'La fecha no puede estar en el futuro.'; return; }
        if (diffDays(state.today, fromKey(last.value)) > 60) { msg.textContent = 'La fecha debe ser de los últimos 60 días.'; return; }
        var n = +len.value;
        if (!(n >= 21 && n <= 40)) { msg.textContent = 'La duración debe estar entre 21 y 40 días.'; return; }
        draft.lastStart = last.value; draft.length = n;
        next();
      }, text: 'Continuar' })));
    } else if (step === 3) {
      box.appendChild(h('h4', { id: 'onboarding-title', text: '¿Qué quieres lograr? (US-05)' }));
      var goals = h('fieldset', { class: 'field' }, h('legend', { text: 'Elige uno o más objetivos' }),
        chips('goals', Object.keys(GOALS).map(function (k) { return [k, GOALS[k]]; }), draft.goals, 'checkbox'));
      box.appendChild(goals);
      box.appendChild(msg);
      box.appendChild(h('div', { class: 'app-actions' }, back, h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        var sel = Array.prototype.map.call(goals.querySelectorAll('input:checked'), function (i) { return i.value; });
        if (!sel.length) { msg.textContent = 'Elige al menos un objetivo.'; return; }
        draft.goals = sel;
        next();
      }, text: 'Continuar' })));
    } else {
      box.appendChild(h('h4', { id: 'onboarding-title', text: 'Así funciona Lumi (US-06)' }));
      box.appendChild(h('ol', { class: 'app-tutorial' },
        h('li', {}, h('strong', { text: 'Inicio: ' }), 'mira tu fase, tu energía y las alertas del día.'),
        h('li', {}, h('strong', { text: 'Calendario: ' }), 'tu ' + t('cycle') + ' y tus actividades en un solo lugar; registra cómo te sientes.'),
        h('li', {}, h('strong', { text: 'Horarios: ' }), 'vincula Google u Outlook o importa tu horario.'),
        h('li', {}, h('strong', { text: 'Bienestar: ' }), 'autocuidado, agua y hábitos.'),
        h('li', {}, h('strong', { text: 'Perfil: ' }), 'tu historial, tu reporte y tu privacidad.')));
      box.appendChild(h('div', { class: 'app-actions' }, back, h('button', { type: 'button', class: 'button button--primary', onclick: finishOnboarding, text: 'Empezar a usar Lumi' })));
    }
    overlay.appendChild(box);
    var first = box.querySelector('input, button.button--primary');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function finishOnboarding() {
    var changedCycle = draft.lastStart !== toKey(lastStart()) || draft.length !== state.cycle.length;
    state.profile.segment = draft.segment;
    state.profile.goals = draft.goals;
    state.profile.name = draft.name;
    if (changedCycle) {
      state.cycle.length = draft.length;
      state.periods = buildHistory(fromKey(draft.lastStart), draft.length);
    }
    state.ui.onboardingStep = 0;
    state.started = true;
    toast('¡Listo, ' + state.profile.name + '! Configuramos Lumi para ti.');
    render();
  }

  /* ------------------------------------------------------------------
     Pestañas y render general
     ------------------------------------------------------------------ */
  var PANELS = { home: renderHome, calendar: renderCalendar, schedule: renderSchedule, wellness: renderWellness, profile: renderProfile };

  function goTab(tab, focusSelector) {
    state.ui.tab = tab;
    render();
    var panel = document.getElementById('app-panel-' + tab);
    var target = focusSelector ? panel.querySelector(focusSelector) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function render() {
    var overlay = app.querySelector('.app__overlay');
    overlay.textContent = '';
    overlay.hidden = true;
    app.classList.toggle('is-discreet', state.security.discreet);

    var welcome = app.querySelector('.app__welcome');
    var body = app.querySelector('.app__body');
    var tabs = app.querySelector('.app__tabs');
    if (!state.started && !state.ui.onboardingStep) {
      welcome.hidden = false; body.hidden = true; tabs.hidden = true;
    } else {
      welcome.hidden = true; body.hidden = false; tabs.hidden = false;
    }

    renderTopbar();
    Object.keys(PANELS).forEach(function (key) {
      var panel = document.getElementById('app-panel-' + key);
      var tabButton = document.getElementById('app-tab-' + key);
      var active = state.ui.tab === key;
      tabButton.setAttribute('aria-selected', String(active));
      tabButton.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      if (active) { panel.textContent = ''; PANELS[key](panel); }
    });

    if (state.ui.onboardingStep) { overlay.hidden = false; renderOnboarding(overlay); }
    else if (state.security.locked) { overlay.hidden = false; renderLock(overlay); }
  }

  function setupTabs() {
    var buttons = Array.prototype.slice.call(app.querySelectorAll('[role=tab]'));
    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { goTab(btn.dataset.tab); });
      btn.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
        if (!dir) return;
        e.preventDefault();
        var next = buttons[(i + dir + buttons.length) % buttons.length];
        goTab(next.dataset.tab);
        next.focus();
      });
    });
  }

  function init() {
    state = createState(REAL_TODAY);
    seedData();
    setupTabs();
    app.querySelector('[data-action=start]').addEventListener('click', openOnboarding);
    app.querySelector('[data-action=sample]').addEventListener('click', function () { state.started = true; toast('Usando los datos de ejemplo de Sofía.'); render(); });
    render();
  }

  init();
})();
