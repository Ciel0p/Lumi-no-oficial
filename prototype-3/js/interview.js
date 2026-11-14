// Modo entrevista de validación
// Guía las tareas del guion según el segmento, mide el tiempo y registra el resultado de cada tarea.
// Los resultados se pueden descargar y se guardan en este celular (si el navegador lo permite).
(function () {
  'use strict';

  var root = document.getElementById('interview');
  if (!root || !window.LumiDemo) return;

  var STORAGE_KEY = 'lumi-validation-interviews';

  var SEGMENTS = {
    student: 'Universitaria (18–25)',
    professional: 'Profesional (25–40)',
    mother: 'Madre de familia (30–50)'
  };

  var SETUP_TASK = {
    id: 'T1', stories: 'US-01 · US-03 · US-05 · US-06', start: 'welcome',
    text: 'Es la primera vez que abres Lumi. Configúrala con tus datos: tu estilo de vida, la fecha de tu último periodo y tus objetivos.'
  };

  var TASKS = {
    student: [
      SETUP_TASK,
      { id: 'T2', stories: 'US-45 · US-11 · US-17 · US-12 · US-44', start: 'home', text: 'Hoy empezó tu periodo. Regístralo, indica que el flujo es fuerte, anota que tienes cólicos y luego revisa cómo se ve tu calendario.' },
      { id: 'T3', stories: 'US-20 · US-44 · US-46', start: 'home', text: 'Quieres pasar tu horario de la universidad a Lumi. Impórtalo y revisa si algún examen coincide con un día de baja energía.' },
      { id: 'T4', stories: 'US-45 · US-49 · US-13', start: 'home', text: 'Quieres saber cuánto dura normalmente tu ciclo y cuál es tu síntoma más frecuente. Encuéntralo.' }
    ],
    professional: [
      SETUP_TASK,
      { id: 'T2', stories: 'US-45 · US-11 · US-17 · US-44', start: 'home', text: 'Hoy empezó tu periodo. Regístralo, indica la intensidad del flujo y revisa tu calendario.' },
      { id: 'T3', stories: 'US-19 · US-23 · US-46 · US-47 · US-44', start: 'home', text: 'Conecta tu calendario de Outlook. Si tu presentación con el cliente cae en un día de baja energía, muévela a una mejor fecha.' },
      { id: 'T4', stories: 'US-25 · US-26', start: 'home', text: 'No quieres que nadie vea tus datos de salud en el trabajo. Crea un PIN y activa el modo discreto.' }
    ],
    mother: [
      SETUP_TASK,
      { id: 'T2', stories: 'US-45 · US-11 · US-12 · US-44', start: 'home', text: 'Hoy empezó tu periodo. Regístralo, anota tus síntomas y revisa tu calendario.' },
      { id: 'T3', stories: 'US-44 · US-50 · US-48 · US-46', start: 'home', text: 'Agrega la cita médica de tu hijo para este sábado a las 4 p. m. y activa un recordatorio que tome en cuenta tu ciclo.' },
      { id: 'T4', stories: 'US-35 · US-36 · US-45', start: 'home', text: 'Hoy te sientes con poca energía. Busca qué te recomienda Lumi para sentirte mejor.' }
    ]
  };

  var HEURISTICS = [
    'Visibilidad del estado del sistema', 'Relación con el mundo real', 'Control y libertad', 'Consistencia y estándares',
    'Prevención de errores', 'Reconocer antes que recordar', 'Flexibilidad y eficiencia', 'Diseño estético y minimalista',
    'Recuperarse de errores', 'Ayuda y documentación', 'Arquitectura de información', 'Diseño inclusivo'
  ];

  var COMPLETION = { yes: 'Sí', help: 'Con ayuda', no: 'No' };

  var session = null; // entrevista en curso
  var timer = null;

  /* ---------- utilidades ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'checked' || k === 'disabled' || k === 'value') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      (Array.isArray(c) ? c : [c]).forEach(function (x) { el.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    }
    return el;
  }
  var uid = 0;
  function nid() { uid += 1; return 'iv' + uid; }
  function field(label, input) { input.id = input.id || nid(); return h('div', { class: 'field' }, h('label', { for: input.id, text: label }), input); }
  function seconds(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function loadSaved() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; } }
  function saveAll(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // Grupo de botones grandes de una sola opción
  function choice(name, options, value, onChange) {
    var group = h('div', { class: 'iv-choice', role: 'radiogroup', 'aria-label': name });
    Object.keys(options).forEach(function (k) {
      group.appendChild(h('button', { type: 'button', role: 'radio', class: 'iv-choice__btn' + (value === k ? ' is-selected' : ''),
        'aria-checked': String(value === k), onclick: function () { onChange(k); }, text: options[k] }));
    });
    return group;
  }

  /* ---------- barra superior del modo entrevista ---------- */
  function renderBar() {
    root.textContent = '';
    if (!session) {
      var saved = loadSaved();
      root.appendChild(h('div', { class: 'iv-bar iv-bar--idle' },
        h('strong', { class: 'iv-bar__title', text: 'Entrevistas' }),
        h('div', { class: 'iv-bar__actions' },
          saved.length ? h('button', { type: 'button', class: 'button button--outline button--small', onclick: openSaved, text: 'Guardadas (' + saved.length + ')' }) : null,
          h('button', { type: 'button', class: 'button button--primary button--small', onclick: openSetup, text: 'Iniciar entrevista' }))));
      syncBarHeight();
      return;
    }
    var task = session.tasks[session.index];
    var running = task && task.startedAt && !task.endedAt;
    var bar = h('div', { class: 'iv-bar iv-bar--active', 'aria-live': 'polite' });
    if (task) {
      bar.appendChild(h('div', { class: 'iv-task' },
        h('p', { class: 'iv-task__meta' }, 'Tarea ' + (session.index + 1) + ' de ' + session.tasks.length + ' · ' + session.participant.name,
          running ? h('span', { class: 'iv-timer', id: 'iv-timer', text: ' · ' + seconds(Date.now() - task.startedAt) }) : null),
        h('p', { class: 'iv-task__text' + (running ? ' is-clamped' : ''), title: running ? 'Toca para ver la tarea completa' : null,
          onclick: function () { if (running) this.classList.toggle('is-clamped'); syncBarHeight(); }, text: task.text })));
      bar.appendChild(h('div', { class: 'iv-bar__actions' },
        running
          ? h('button', { type: 'button', class: 'button button--primary', onclick: finishTask, text: 'Terminó la tarea' })
          : h('button', { type: 'button', class: 'button button--primary', onclick: startTask, text: 'Empezar tarea' }),
        h('button', { type: 'button', class: 'button button--outline button--small', onclick: cancelInterview, text: 'Salir' })));
    }
    root.appendChild(bar);
    syncBarHeight();
  }

  // La app usa esta altura para que sus avisos no queden debajo de la barra
  function syncBarHeight() {
    var bar = root.querySelector('.iv-bar');
    document.documentElement.style.setProperty('--iv-bar-height', (bar ? bar.offsetHeight : 0) + 'px');
  }
  window.addEventListener('resize', syncBarHeight);

  function tick() {
    var el = document.getElementById('iv-timer');
    var task = session && session.tasks[session.index];
    if (el && task && task.startedAt) el.textContent = ' · ' + seconds(Date.now() - task.startedAt);
  }

  /* ---------- hoja (pantalla completa) ---------- */
  function sheet(title) {
    closeSheet();
    var overlay = h('div', { class: 'iv-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'iv-sheet-title' });
    var box = h('div', { class: 'iv-sheet__box' }, h('h2', { id: 'iv-sheet-title', class: 'iv-sheet__title', text: title }));
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.body.classList.add('iv-open');
    setTimeout(function () { var f = box.querySelector('input, button'); if (f) f.focus(); }, 50);
    return box;
  }
  function closeSheet() {
    var old = document.querySelector('.iv-sheet');
    if (old) old.remove();
    document.body.classList.remove('iv-open');
  }

  /* ---------- 1. datos y consentimiento ---------- */
  function openSetup() {
    var data = { interviewer: '', name: '', age: '', district: '', segment: '', consent: false };
    var box = sheet('Nueva entrevista');
    var msg = h('p', { class: 'iv-message', role: 'alert' });
    var interviewer = h('input', { class: 'input', type: 'text', autocomplete: 'off', placeholder: 'Tu nombre' });
    var name = h('input', { class: 'input', type: 'text', autocomplete: 'off', placeholder: 'Nombre y apellido' });
    var age = h('input', { class: 'input', type: 'number', inputmode: 'numeric', min: '15', max: '70' });
    var district = h('input', { class: 'input', type: 'text', autocomplete: 'off' });
    var segWrap = h('div');
    function drawSeg() { segWrap.textContent = ''; segWrap.appendChild(choice('Segmento', SEGMENTS, data.segment, function (k) { data.segment = k; drawSeg(); })); }
    drawSeg();
    var consentId = nid();
    var consent = h('input', { type: 'checkbox', id: consentId, class: 'iv-check' });
    box.appendChild(h('p', { class: 'iv-help', text: 'Antes de empezar, lee la introducción del guion y pide autorización para grabar.' }));
    box.appendChild(field('Entrevistador(a)', interviewer));
    box.appendChild(field('Entrevistada', name));
    box.appendChild(h('div', { class: 'iv-row' }, field('Edad', age), field('Distrito', district)));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: 'Segmento' }), segWrap));
    box.appendChild(h('div', { class: 'iv-consent' }, consent, h('label', { for: consentId, text: 'La entrevistada autorizó la grabación con fines académicos (quedó grabado).' })));
    box.appendChild(msg);
    box.appendChild(h('div', { class: 'iv-actions' },
      h('button', { type: 'button', class: 'button button--outline', onclick: closeSheet, text: 'Cancelar' }),
      h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        if (!interviewer.value.trim() || !name.value.trim()) { msg.textContent = 'Escribe el nombre del entrevistador y de la entrevistada.'; return; }
        if (!data.segment) { msg.textContent = 'Elige el segmento de la entrevistada.'; return; }
        if (!consent.checked) { msg.textContent = 'Sin autorización no se puede grabar la entrevista.'; return; }
        session = {
          date: today(), interviewer: interviewer.value.trim(),
          participant: { name: name.value.trim(), age: age.value, district: district.value.trim(), segment: data.segment },
          index: 0, final: {},
          tasks: TASKS[data.segment].map(function (t) { return { id: t.id, stories: t.stories, text: t.text, start: t.start }; })
        };
        closeSheet();
        prepareTask();
      }, text: 'Comenzar' })));
  }

  /* ---------- 2. tareas ---------- */
  function prepareTask() {
    var task = session.tasks[session.index];
    // Cada entrevistada empieza con la app nueva: la T1 desde la bienvenida, las demás con los datos de ejemplo
    window.LumiDemo.reset(task.start !== 'welcome');
    renderBar();
    window.scrollTo(0, 0);
  }
  function startTask() {
    var task = session.tasks[session.index];
    task.startedAt = Date.now();
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    renderBar();
  }
  function finishTask() {
    var task = session.tasks[session.index];
    task.endedAt = Date.now();
    clearInterval(timer);
    renderBar();
    openTaskResult(task);
  }

  function openTaskResult(task) {
    var box = sheet('Resultado de la tarea ' + (session.index + 1));
    box.appendChild(h('p', { class: 'iv-help', text: task.text }));
    box.appendChild(h('p', { class: 'iv-help' }, 'Tiempo: ', h('strong', { text: seconds(task.endedAt - task.startedAt) })));
    var compWrap = h('div'), easeWrap = h('div'), heurWrap = h('div', { class: 'iv-chips' });
    task.heuristics = task.heuristics || [];
    function draw() {
      compWrap.textContent = ''; easeWrap.textContent = '';
      compWrap.appendChild(choice('¿Completó la tarea?', COMPLETION, task.completion, function (k) { task.completion = k; draw(); }));
      easeWrap.appendChild(choice('Facilidad', { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }, String(task.ease || ''), function (k) { task.ease = +k; draw(); }));
    }
    draw();
    HEURISTICS.forEach(function (name) {
      var id = nid();
      heurWrap.appendChild(h('input', { type: 'checkbox', id: id, class: 'chips__input', checked: task.heuristics.indexOf(name) >= 0,
        onchange: function (e) { if (e.target.checked) task.heuristics.push(name); else task.heuristics = task.heuristics.filter(function (x) { return x !== name; }); } }));
      heurWrap.appendChild(h('label', { for: id, class: 'chips__label', text: name }));
    });
    var notes = h('textarea', { class: 'textarea', placeholder: '¿Dónde dudó? ¿Qué dijo? ¿Qué esperaba encontrar?' });
    notes.value = task.notes || '';
    var msg = h('p', { class: 'iv-message', role: 'alert' });
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: '¿Completó la tarea?' }), compWrap));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: 'Del 1 al 5, ¿qué tan fácil fue? (pregúntale a ella)' }), easeWrap));
    box.appendChild(field('Comentarios y dudas', notes));
    box.appendChild(h('details', { class: 'iv-details' }, h('summary', { text: 'Problema de usabilidad observado (opcional)' }), heurWrap));
    box.appendChild(msg);
    var last = session.index === session.tasks.length - 1;
    box.appendChild(h('div', { class: 'iv-actions' },
      h('button', { type: 'button', class: 'button button--outline', onclick: function () { delete task.endedAt; closeSheet(); timer = setInterval(tick, 1000); renderBar(); }, text: 'Volver a la tarea' }),
      h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        if (!task.completion) { msg.textContent = 'Marca si completó la tarea.'; return; }
        if (!task.ease) { msg.textContent = 'Marca la facilidad del 1 al 5.'; return; }
        task.notes = notes.value.trim();
        closeSheet();
        if (last) openFinalQuestions();
        else { session.index += 1; prepareTask(); }
      }, text: last ? 'Ir a preguntas finales' : 'Siguiente tarea' })));
  }

  /* ---------- 3. preguntas finales ---------- */
  function openFinalQuestions() {
    var f = session.final;
    var box = sheet('Preguntas finales');
    var liked = h('textarea', { class: 'textarea' }); liked.value = f.liked || '';
    var disliked = h('textarea', { class: 'textarea' }); disliked.value = f.disliked || '';
    var change = h('textarea', { class: 'textarea' }); change.value = f.change || '';
    var quote = h('textarea', { class: 'textarea', placeholder: 'Frase textual de la entrevistada' }); quote.value = f.quote || '';
    var trustWrap = h('div'), lookWrap = h('div'), useWrap = h('div'), payWrap = h('div'), npsWrap = h('div', { class: 'iv-nps' });
    var YES_NO = { yes: 'Sí', maybe: 'Tal vez', no: 'No' };
    var FIVE = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' };
    function draw() {
      [trustWrap, lookWrap, useWrap, payWrap, npsWrap].forEach(function (w) { w.textContent = ''; });
      trustWrap.appendChild(choice('Confianza', FIVE, String(f.trust || ''), function (k) { f.trust = +k; draw(); }));
      lookWrap.appendChild(choice('Colores y letras', FIVE, String(f.look || ''), function (k) { f.look = +k; draw(); }));
      useWrap.appendChild(choice('¿Usaría Lumi?', YES_NO, f.use, function (k) { f.use = k; draw(); }));
      payWrap.appendChild(choice('¿Pagaría S/ 9.90?', YES_NO, f.pay, function (k) { f.pay = k; draw(); }));
      var nps = {}; for (var i = 0; i <= 10; i++) nps[i] = String(i);
      npsWrap.appendChild(choice('Recomendación', nps, f.nps === undefined ? '' : String(f.nps), function (k) { f.nps = +k; draw(); }));
    }
    draw();
    var quoteOkId = nid();
    var quoteOk = h('input', { type: 'checkbox', id: quoteOkId, class: 'iv-check', checked: !!f.quoteOk });
    box.appendChild(field('¿Qué fue lo que más te gustó de Lumi?', liked));
    box.appendChild(field('¿Qué fue lo que menos te gustó o te costó más?', disliked));
    box.appendChild(field('¿Qué le cambiarías o agregarías?', change));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: '¿Qué tanto confiarías en Lumi para guardar tus datos de salud? (1 a 5)' }), trustWrap));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: '¿Los colores, letras e íconos te parecieron agradables y fáciles de ver? (1 a 5)' }), lookWrap));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: '¿Usarías Lumi en tu día a día?' }), useWrap));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: '¿Pagarías S/ 9.90 al mes por el plan Premium?' }), payWrap));
    box.appendChild(h('fieldset', { class: 'field' }, h('legend', { text: 'Del 0 al 10, ¿qué tan probable es que recomiendes Lumi a una amiga?' }), npsWrap));
    box.appendChild(field('Frase para testimonio', quote));
    box.appendChild(h('div', { class: 'iv-consent' }, quoteOk, h('label', { for: quoteOkId, text: 'Autorizó usar su frase como testimonio (quedó grabado).' })));
    var msg = h('p', { class: 'iv-message', role: 'alert' });
    box.appendChild(msg);
    box.appendChild(h('div', { class: 'iv-actions' },
      h('button', { type: 'button', class: 'button button--primary', onclick: function () {
        f.liked = liked.value.trim(); f.disliked = disliked.value.trim(); f.change = change.value.trim();
        f.quote = quote.value.trim(); f.quoteOk = quoteOk.checked;
        if (f.nps === undefined) { msg.textContent = 'Marca la recomendación del 0 al 10.'; return; }
        finishInterview();
      }, text: 'Terminar entrevista' })));
  }

  /* ---------- 4. resumen ---------- */
  function finishInterview() {
    session.finishedAt = new Date().toISOString();
    var list = loadSaved();
    list.push(session);
    var saved = saveAll(list);
    var done = session;
    session = null;
    renderBar();
    openSummary(done, saved);
  }

  function summaryText(s) {
    var p = s.participant, f = s.final || {};
    var YES_NO = { yes: 'Sí', maybe: 'Tal vez', no: 'No' };
    var lines = [
      'ENTREVISTA DE VALIDACIÓN – LUMI',
      'Fecha: ' + s.date + '   Entrevistador(a): ' + s.interviewer,
      'Entrevistada: ' + p.name + (p.age ? '   Edad: ' + p.age : '') + (p.district ? '   Distrito: ' + p.district : ''),
      'Segmento: ' + SEGMENTS[p.segment],
      '',
      'TAREAS'
    ];
    s.tasks.forEach(function (t, i) {
      lines.push((i + 1) + '. ' + t.text);
      lines.push('   HU: ' + t.stories);
      lines.push('   Completó: ' + (COMPLETION[t.completion] || '-') + '   Facilidad: ' + (t.ease || '-') + '/5   Tiempo: ' + (t.endedAt ? seconds(t.endedAt - t.startedAt) : '-'));
      if (t.heuristics && t.heuristics.length) lines.push('   Problema observado: ' + t.heuristics.join(', '));
      if (t.notes) lines.push('   Comentarios: ' + t.notes);
    });
    lines.push('', 'PREGUNTAS FINALES');
    lines.push('Lo que más le gustó: ' + (f.liked || '-'));
    lines.push('Lo que menos le gustó: ' + (f.disliked || '-'));
    lines.push('Qué cambiaría: ' + (f.change || '-'));
    lines.push('Confianza en sus datos: ' + (f.trust || '-') + '/5   Colores y letras: ' + (f.look || '-') + '/5');
    lines.push('¿Usaría Lumi?: ' + (YES_NO[f.use] || '-') + '   ¿Pagaría S/ 9.90?: ' + (YES_NO[f.pay] || '-') + '   Recomendación: ' + (f.nps !== undefined ? f.nps : '-') + '/10');
    if (f.quote) lines.push('Testimonio: "' + f.quote + '"' + (f.quoteOk ? ' (autorizó su uso)' : ' (NO autorizó su uso)'));
    return lines.join('\n');
  }

  function openSummary(s, saved) {
    var box = sheet('Entrevista terminada');
    var completed = s.tasks.filter(function (t) { return t.completion === 'yes'; }).length;
    var avgEase = (s.tasks.reduce(function (a, t) { return a + (t.ease || 0); }, 0) / s.tasks.length).toFixed(1);
    box.appendChild(h('div', { class: 'iv-stats' },
      h('div', {}, h('strong', { text: completed + '/' + s.tasks.length }), h('span', { text: 'tareas completadas sin ayuda' })),
      h('div', {}, h('strong', { text: avgEase }), h('span', { text: 'facilidad promedio (1–5)' })),
      h('div', {}, h('strong', { text: String(s.final.nps) }), h('span', { text: 'recomendación (0–10)' }))));
    box.appendChild(h('p', { class: 'iv-help', text: saved ? 'Se guardó en este celular. Descárgala igual para pasarla al informe (6.2.2).' : 'Este navegador no permite guardar: descárgala ahora para no perderla.' }));
    var text = summaryText(s);
    box.appendChild(h('pre', { class: 'iv-pre', text: text }));
    var safe = s.participant.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
    box.appendChild(h('div', { class: 'iv-actions' },
      h('button', { type: 'button', class: 'button button--primary', onclick: function () { download('entrevista-' + safe + '-' + s.date + '.txt', text); }, text: 'Descargar (.txt)' }),
      h('button', { type: 'button', class: 'button button--outline', onclick: function (e) {
        var btn = e.currentTarget;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { btn.textContent = 'Copiado ✓'; }, function () { btn.textContent = 'No se pudo copiar'; });
      }, text: 'Copiar' }),
      h('button', { type: 'button', class: 'button button--outline', onclick: function () { closeSheet(); window.LumiDemo.reset(false); renderBar(); }, text: 'Cerrar' })));
  }

  /* ---------- entrevistas guardadas ---------- */
  function csv(list) {
    var esc = function (v) { v = v === undefined || v === null ? '' : String(v); return '"' + v.replace(/"/g, '""') + '"'; };
    var head = ['fecha', 'entrevistador', 'entrevistada', 'edad', 'distrito', 'segmento'];
    for (var i = 1; i <= 4; i++) head.push('t' + i + '_completo', 't' + i + '_facilidad', 't' + i + '_segundos', 't' + i + '_comentarios');
    head.push('confianza', 'colores', 'usaria', 'pagaria', 'recomendacion', 'gusto', 'no_gusto', 'cambiaria', 'testimonio', 'autoriza_testimonio');
    var rows = list.map(function (s) {
      var p = s.participant, f = s.final || {};
      var r = [s.date, s.interviewer, p.name, p.age, p.district, SEGMENTS[p.segment]];
      for (var i = 0; i < 4; i++) {
        var t = s.tasks[i] || {};
        r.push(COMPLETION[t.completion] || '', t.ease || '', t.endedAt ? Math.round((t.endedAt - t.startedAt) / 1000) : '', t.notes || '');
      }
      var yn = { yes: 'sí', maybe: 'tal vez', no: 'no' };
      r.push(f.trust, f.look, yn[f.use] || '', yn[f.pay] || '', f.nps, f.liked, f.disliked, f.change, f.quote, f.quoteOk ? 'sí' : 'no');
      return r.map(esc).join(',');
    });
    return '﻿' + head.map(esc).join(',') + '\n' + rows.join('\n');
  }

  function openSaved() {
    var list = loadSaved();
    var box = sheet('Entrevistas guardadas (' + list.length + ')');
    var ul = h('ul', { class: 'iv-list' });
    list.forEach(function (s, i) {
      ul.appendChild(h('li', {}, h('span', { text: s.date + ' · ' + s.participant.name + ' · ' + SEGMENTS[s.participant.segment] }),
        h('button', { type: 'button', class: 'button button--outline button--small', onclick: function () { openSummary(list[i], true); }, text: 'Ver' })));
    });
    box.appendChild(ul);
    var clearBtn = h('button', { type: 'button', class: 'button button--outline', text: 'Borrar todas' });
    clearBtn.addEventListener('click', function () {
      if (clearBtn.dataset.confirm) { saveAll([]); closeSheet(); renderBar(); return; }
      clearBtn.dataset.confirm = '1';
      clearBtn.textContent = '¿Seguro? Toca otra vez para borrar';
    });
    box.appendChild(h('div', { class: 'iv-actions' },
      h('button', { type: 'button', class: 'button button--primary', onclick: function () { download('entrevistas-lumi-' + today() + '.csv', csv(list), 'text/csv;charset=utf-8'); }, text: 'Descargar todas (.csv)' }),
      clearBtn,
      h('button', { type: 'button', class: 'button button--outline', onclick: closeSheet, text: 'Cerrar' })));
  }

  function cancelInterview() {
    if (!session) return;
    var box = sheet('¿Salir de la entrevista?');
    box.appendChild(h('p', { class: 'iv-help', text: 'Se perderán las respuestas de esta entrevista.' }));
    box.appendChild(h('div', { class: 'iv-actions' },
      h('button', { type: 'button', class: 'button button--outline', onclick: closeSheet, text: 'Seguir entrevistando' }),
      h('button', { type: 'button', class: 'button button--primary', onclick: function () { clearInterval(timer); session = null; closeSheet(); window.LumiDemo.reset(false); renderBar(); }, text: 'Salir' })));
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.querySelector('.iv-sheet') && !session) closeSheet();
  });

  renderBar();
  if (location.hash === '#entrevista') openSetup();
})();
