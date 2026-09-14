/*
 * Integration des Decks in den App Hub.
 *
 * Wird über docinfo-footer.html eingebunden, damit die von Asciidoctor
 * erzeugte HTML-Datei nie von Hand angefasst werden muss.
 *
 * Aufgaben:
 *   1. "Präsentation überspringen" und "Demo starten" führen zur Demo.
 *   2. Die Folienposition überlebt den Wechsel zur Demo und zurück.
 *   3. Tastatur: D öffnet die Demo, ohne mit Reveals eigenen Kürzeln zu kollidieren.
 *   4. Im Vollbild tritt die Chrome zurück.
 *
 * Die Plattform setzt "frame-ancestors 'none'", eine iframe-Einbettung ist also
 * ausgeschlossen; deshalb echte Seitenwechsel unter derselben Origin.
 */
(function () {
  'use strict';

  var DEMO_URL = 'demo.html';
  var SPEAKER_URL = 'presentation/speaker.html';
  var SPEAKER_NAMESPACE = 'pct-speaker';
  var POSITION_KEY = 'pct-deck-position';

  var speakerWindow = null;

  function buildPipelineNavigation() {
    var items = [
      ['1', 'Daten erfassen', '#/daten-verstehen'],
      ['2', 'Daten zerlegen', '#/zerlegen'],
      ['3', 'KI anwenden', '#/ki-anwenden'],
      ['4', 'Ergebnisse vereinen', '#/vereinen'],
      ['5', 'Qualität messen', '#/qualitaet'],
      ['6', 'Lösung wählen', '#/loesung-waehlen']
    ];
    var nav = document.createElement('nav');
    nav.className = 'pipeline-nav';
    nav.setAttribute('aria-label', 'Gliederung der Präsentation');
    items.forEach(function (item, index) {
      var link = document.createElement('a');
      link.href = item[2];
      link.dataset.step = String(index + 1);
      link.innerHTML = '<b>' + item[0] + '</b>' + item[1];
      nav.appendChild(link);
    });
    document.body.appendChild(nav);
    return nav;
  }

  function updatePipelineNavigation(nav) {
    if (!nav || typeof Reveal === 'undefined') return;
    var slide = Reveal.getCurrentSlide();
    var slides = Reveal.getSlides();
    var currentIndex = slides.indexOf(slide);
    var backupIndex = slides.findIndex(function (item) { return item.classList.contains('backup-divider'); });
    document.body.classList.toggle('on-title', currentIndex === 0);
    document.body.classList.toggle('on-backup', Boolean(slide && (
      (slide.classList.contains('demo-slide') && !slide.classList.contains('final-slide'))
      || (backupIndex >= 0 && currentIndex >= backupIndex)
    )));
    var step = 0;
    if (slide) {
      for (var i = 1; i <= 6; i += 1) if (slide.classList.contains('step-' + i)) step = i;
    }
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      link.classList.toggle('active', Number(link.dataset.step) === step);
    });
  }

  function prepareSlideLayouts() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.reveal .slides > section'));
    slides.forEach(function (slide, index) {
      if (index === 0) return;
      var heading = slide.querySelector(':scope > h2');
      if (!heading) return;
      if (slide.querySelector(':scope > .slide-content')) {
        slide.classList.add('main-layout');
        return;
      }
      var content = document.createElement('div');
      content.className = 'slide-content';
      Array.prototype.slice.call(slide.childNodes).forEach(function (node) {
        if (node === heading || (node.nodeType === 1 && node.matches('aside.notes'))) return;
        content.appendChild(node);
      });
      slide.insertBefore(content, slide.querySelector(':scope > aside.notes'));
      slide.classList.add('main-layout');
    });
  }

  function initChunkExplorer() {
    var explorer = document.querySelector('[data-chunk-explorer]');
    var gallery = window.PointCloudChunkerGallery;
    if (!explorer || !gallery) return;
    var canvas = explorer.querySelector('canvas');
    var context = canvas.getContext('2d');
    var order = ['xy', 'morton', 'kdtree', 'rand_knn', 'rand_cyl', 'bisect_xy_overlap'];
    var names = {
      xy: 'Raster', morton: 'Z-Kurve', kdtree: 'K-D-Baum',
      rand_knn: 'Kugeln', rand_cyl: 'Zylinder', bisect_xy_overlap: 'Flächenteilung'
    };
    var palette = ['#0a63c9', '#23a879', '#e07435', '#8064b6', '#d0a51f', '#4a91b8', '#bd5071', '#667581'];
    var coords = gallery.coords;
    var minX = Math.min.apply(null, coords.map(function (point) { return point[0]; }));
    var maxX = Math.max.apply(null, coords.map(function (point) { return point[0]; }));
    var minY = Math.min.apply(null, coords.map(function (point) { return point[1]; }));
    var maxY = Math.max.apply(null, coords.map(function (point) { return point[1]; }));
    var pad = 34;
    var autoplay = true;
    var currentIndex = 0;

    function project(point, pane) {
      var plotWidth = (canvas.width - 3 * pad) / 2;
      var offsetX = pane === 1 ? 2 * pad + plotWidth : pad;
      return [
        offsetX + (point[0] - minX) / (maxX - minX || 1) * plotWidth,
        canvas.height - pad - (point[1] - minY) / (maxY - minY || 1) * (canvas.height - 2 * pad - 28)
      ];
    }

    function chunkRectangle(chunk, pane) {
      var points = chunk.map(function (pointIndex) { return project(coords[pointIndex], pane); });
      var xs = points.map(function (point) { return point[0]; });
      var ys = points.map(function (point) { return point[1]; });
      var margin = 3;
      return {
        x: Math.min.apply(null, xs) - margin,
        y: Math.min.apply(null, ys) - margin,
        width: Math.max.apply(null, xs) - Math.min.apply(null, xs) + 2 * margin,
        height: Math.max.apply(null, ys) - Math.min.apply(null, ys) + 2 * margin
      };
    }

    function rectangle(box, fill, stroke, lineWidth) {
      context.fillStyle = fill;
      context.fillRect(box.x, box.y, box.width, box.height);
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth || 2;
      context.strokeRect(box.x, box.y, box.width, box.height);
    }

    function render(strategy) {
      var result = gallery.strategies[strategy];
      var coverage = new Uint16Array(coords.length);
      var owner = new Int16Array(coords.length);
      owner.fill(-1);
      result.chunks.forEach(function (chunk, chunkIndex) {
        chunk.forEach(function (pointIndex) {
          coverage[pointIndex] += 1;
          if (owner[pointIndex] < 0) owner[pointIndex] = chunkIndex;
        });
      });
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#fbfcfd';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = '#555d67';
      context.font = '700 18px system-ui';
      context.textAlign = 'center';
      context.fillText('Reihenfolge der Teilbereiche', canvas.width * 0.25, 22);
      context.fillText('fertige Teilbereiche', canvas.width * 0.75, 22);

      result.chunks.forEach(function (chunk, chunkIndex) {
        var color = palette[chunkIndex % palette.length];
        rectangle(chunkRectangle(chunk, 0), color + '0f', color + 'a8', 2);
        rectangle(chunkRectangle(chunk, 1), color + '14', color + 'b8', 2);
      });

      coords.forEach(function (coordinate) {
        var point = project(coordinate, 0);
        context.beginPath();
        context.arc(point[0], point[1], 3.4, 0, Math.PI * 2);
        context.fillStyle = '#d9dde2';
        context.fill();
      });

      var duplicate = 0;
      for (var i = 0; i < coords.length; i += 1) {
        var point = project(coords[i], 1);
        context.beginPath();
        context.arc(point[0], point[1], coverage[i] > 1 ? 5.2 : 3.7, 0, Math.PI * 2);
        context.fillStyle = palette[Math.max(0, owner[i]) % palette.length];
        context.fill();
        if (coverage[i] > 1) {
          duplicate += 1;
          context.strokeStyle = '#16181c';
          context.lineWidth = 1.4;
          context.stroke();
        }
      }

      result.centroids.forEach(function (centroid, index) {
        var point = project(centroid, 0);
        var labelSize = result.count > 20 ? 17 : 21;
        context.fillStyle = '#ffffff';
        context.fillRect(point[0] - labelSize / 2, point[1] - labelSize / 2, labelSize, labelSize);
        context.strokeStyle = palette[index % palette.length];
        context.lineWidth = 2.2;
        context.strokeRect(point[0] - labelSize / 2, point[1] - labelSize / 2, labelSize, labelSize);
        context.fillStyle = '#16181c';
        context.font = '700 ' + (result.count > 20 ? 10 : 12) + 'px system-ui';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(String(index + 1), point[0], point[1] + 0.5);
      });

      explorer.querySelector('[data-chunk-name]').textContent = names[strategy];
      explorer.querySelector('[data-chunk-count]').textContent = String(result.count);
      explorer.querySelector('[data-chunk-overlap]').textContent = Math.round(duplicate / coords.length * 100) + ' %';
      Array.prototype.forEach.call(explorer.querySelectorAll('[data-strategy]'), function (button) {
        button.classList.toggle('active', button.dataset.strategy === strategy);
        button.setAttribute('aria-pressed', button.dataset.strategy === strategy ? 'true' : 'false');
      });
    }

    Array.prototype.forEach.call(explorer.querySelectorAll('[data-strategy]'), function (button) {
      button.addEventListener('pointerdown', function () { button.classList.add('pressed'); });
      button.addEventListener('pointerup', function () { button.classList.remove('pressed'); });
      button.addEventListener('pointercancel', function () { button.classList.remove('pressed'); });
      button.addEventListener('click', function () {
        currentIndex = order.indexOf(button.dataset.strategy);
        render(button.dataset.strategy);
      });
    });

    var toggle = explorer.querySelector('[data-autoplay-toggle]');
    toggle.addEventListener('click', function () {
      autoplay = !autoplay;
      toggle.classList.toggle('active', autoplay);
      toggle.setAttribute('aria-pressed', autoplay ? 'true' : 'false');
      toggle.textContent = autoplay ? 'Automatisch' : 'Angehalten';
    });

    render('xy');
    window.setInterval(function () {
      var currentSlide = typeof Reveal !== 'undefined' && Reveal.getCurrentSlide ? Reveal.getCurrentSlide() : null;
      if (!autoplay || document.hidden || !currentSlide || !currentSlide.contains(explorer)) return;
      currentIndex = (currentIndex + 1) % order.length;
      render(order[currentIndex]);
    }, 3200);
  }

  function initResultChart() {
    var svg = document.querySelector('[data-result-chart]');
    var results = window.PointCloudEvidence && window.PointCloudEvidence.results;
    if (!svg || !results) return;
    var ns = 'http://www.w3.org/2000/svg';
    var names = { xy: 'Raster', morton: 'Z-Kurve', kdtree: 'K-D-Baum', bisect_xy_overlap: 'Flächenteilung', rand_knn: 'Kugeln', rand_cyl: 'Zylinder' };
    var rows = Object.keys(results.chunkers).map(function (id) {
      var row = results.chunkers[id];
      var merge = row.merges[row.best_merge];
      return { id: id, name: names[id] || id, hours: row.total_hours, quality: merge.miou };
    });
    var left = 86, right = 1010, top = 34, bottom = 350;
    function x(hours) { return left + (hours - 13) / 23 * (right - left); }
    function y(quality) { return bottom - (quality - 0.2) / 0.4 * (bottom - top); }
    function add(tag, attrs, label) {
      var node = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      if (label !== undefined) node.textContent = label;
      svg.appendChild(node);
      return node;
    }
    add('line', { x1: left, y1: bottom, x2: right, y2: bottom, class: 'chart-axis' });
    add('line', { x1: left, y1: top, x2: left, y2: bottom, class: 'chart-axis' });
    [15, 20, 25, 30, 35].forEach(function (tick) {
      add('line', { x1: x(tick), y1: top, x2: x(tick), y2: bottom, class: 'chart-grid' });
      add('text', { x: x(tick), y: 382, class: 'chart-tick', 'text-anchor': 'middle' }, tick + ' h');
    });
    [0.3, 0.4, 0.5, 0.6].forEach(function (tick) {
      add('line', { x1: left, y1: y(tick), x2: right, y2: y(tick), class: 'chart-grid' });
      add('text', { x: 66, y: y(tick) + 6, class: 'chart-tick', 'text-anchor': 'end' }, tick.toFixed(1).replace('.', ','));
    });
    add('text', { x: right, y: 412, class: 'chart-label', 'text-anchor': 'end' }, 'Gesamtlaufzeit');
    add('text', { x: 18, y: top, class: 'chart-label' }, 'Qualität');
    rows.forEach(function (row) {
      var winner = row.id === 'kdtree';
      add('circle', { cx: x(row.hours), cy: y(row.quality), r: winner ? 13 : 8, class: winner ? 'chart-point winner' : 'chart-point' });
      add('text', { x: x(row.hours) + 14, y: y(row.quality) - 12, class: winner ? 'chart-name winner' : 'chart-name' }, row.name);
    });
  }

  function readPosition() {
    try {
      var raw = sessionStorage.getItem(POSITION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writePosition(state) {
    try {
      sessionStorage.setItem(POSITION_KEY, JSON.stringify(state));
    } catch (error) {
      /* Privater Modus oder blockierter Speicher: die Position geht verloren,
         die Präsentation funktioniert weiter. */
    }
  }

  function currentState() {
    if (typeof Reveal === 'undefined' || !Reveal.getIndices) return null;
    var indices = Reveal.getIndices();
    return { h: indices.h || 0, v: indices.v || 0 };
  }

  function goToDemo(event) {
    if (event) event.preventDefault();
    var state = currentState();
    if (state) {
      // "pending" statt document.referrer: die Plattform sendet
      // Referrer-Policy: no-referrer, der Referrer ist hier also immer leer.
      state.pending = true;
      state.at = Date.now();
      writePosition(state);
    }
    window.location.href = DEMO_URL;
  }

  function restorePosition() {
    // Ein Hash in der URL gewinnt immer: er ist die ausdrückliche Absicht des Nutzers.
    if (window.location.hash && window.location.hash.length > 1) return;
    var state = readPosition();
    if (!state || !state.pending) return;
    // Ein alter Eintrag soll einen frischen Aufruf des Decks nicht entführen.
    if (state.at && Date.now() - state.at > 6 * 60 * 60 * 1000) return;
    if (typeof Reveal === 'undefined' || !Reveal.slide) return;

    state.pending = false;
    writePosition(state);
    Reveal.slide(state.h, state.v);

    // reveal.js stellt nach "ready" noch aus dem (leeren) Hash wieder her.
    // Deshalb im nächsten Frame prüfen und notfalls einmal nachsetzen.
    window.requestAnimationFrame(function () {
      var indices = Reveal.getIndices();
      if (indices.h !== state.h || indices.v !== state.v) Reveal.slide(state.h, state.v);
    });
  }

  // --- Sprecheransicht ------------------------------------------------------
  // Eigene Ansicht statt der von reveal.js. Deren Fenster wird per
  // document.write in ein about:blank geschrieben und enthält inline <style>
  // und inline <script>; ein about:blank erbt die CSP seines Öffners, und unter
  // der Plattform-CSP (default-src 'self') wird beides blockiert — das Fenster
  // bleibt dann bei „Loading speaker view...“ stehen. Die eigene Ansicht ist
  // eine normale Datei mit ausgelagerten Ressourcen und läuft deshalb überall
  // gleich. Messwerte: audit/13_SPEAKER_NOTES_INCIDENT.md

  /**
   * Sichtbarer Text der Folie, ohne die Notiz — das, was das Publikum liest.
   *
   * Blockelemente werden mit einem Trenner verbunden: `textContent` würde
   * „Überschrift“ und „0,5552“ zu „Überschrift0,5552“ zusammenziehen, und
   * genau dieser Text soll im Notizfenster mit einem Blick erfassbar sein.
   */
  function visibleText(slide) {
    if (!slide) return '';
    var clone = slide.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('aside.notes'), function (node) {
      node.remove();
    });
    var parts = [];
    Array.prototype.forEach.call(
      clone.querySelectorAll('h1, h2, h3, h4, p, li, td, th, figcaption'),
      function (node) {
        var text = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (text && parts.indexOf(text) < 0) parts.push(text);
      }
    );
    if (parts.length === 0) parts.push((clone.textContent || '').replace(/\s+/g, ' ').trim());
    return parts.join(' · ').slice(0, 600);
  }

  /**
   * Überschrift der Folie, sonst ein brauchbarer Ersatz.
   *
   * Die beiden vollflächigen Bildfolien tragen bewusst keine Überschrift
   * (`[%notitle.full-bleed]`). Ohne Ersatz stünde im Notizfenster nichts — und
   * für die nächste Folie sähe es aus, als wäre der Vortrag zu Ende.
   */
  function slideTitle(slide) {
    if (!slide) return '';
    var heading = slide.querySelector('h1, h2, h3');
    if (heading && heading.textContent.trim()) return heading.textContent.trim();
    var image = slide.querySelector('img[alt]');
    if (image && image.getAttribute('alt')) return '🖼 ' + image.getAttribute('alt').trim();
    return '(ohne Überschrift)';
  }

  function notesHtml(slide) {
    if (!slide) return '';
    var aside = slide.querySelector('aside.notes');
    return aside ? aside.innerHTML : '';
  }

  function speakerState() {
    var slides = Reveal.getSlides();
    var current = Reveal.getCurrentSlide();
    var index = slides.indexOf(current);
    var next = index >= 0 ? slides[index + 1] : null;
    return {
      ns: SPEAKER_NAMESPACE,
      type: 'state',
      index: index + 1,
      total: slides.length,
      title: slideTitle(current),
      notes: notesHtml(current),
      visible: visibleText(current),
      hasNext: Boolean(next),
      nextTitle: slideTitle(next),
      nextNotes: notesHtml(next),
      deck: document.title
    };
  }

  function sendSpeakerState() {
    if (!speakerWindow || speakerWindow.closed) return;
    try {
      speakerWindow.postMessage(speakerState(), '*');
    } catch (error) {
      /* Fenster gerade geschlossen; beim nächsten Wechsel ist es ohnehin weg. */
    }
  }

  function openSpeaker(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (speakerWindow && !speakerWindow.closed) {
      speakerWindow.focus();
      sendSpeakerState();
      return;
    }
    // Direkt aus der Nutzeraktion heraus öffnen, sonst greift der Popup-Blocker.
    speakerWindow = window.open(SPEAKER_URL, 'pct-speaker', 'width=1180,height=800');
    if (!speakerWindow) {
      window.alert('Der Browser hat das Notizfenster blockiert. '
        + 'Bitte Pop-ups für diese Seite erlauben und erneut auf „Notizen“ klicken.');
    }
  }

  function listenToSpeaker() {
    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || data.ns !== SPEAKER_NAMESPACE) return;
      // Nur das selbst geöffnete Fenster darf hier etwas auslösen.
      if (!speakerWindow || event.source !== speakerWindow) return;
      if (data.type === 'ready') {
        sendSpeakerState();
      } else if (data.type === 'command') {
        if (data.command === 'next') Reveal.next();
        else if (data.command === 'prev') Reveal.prev();
        else if (data.command === 'first') Reveal.slide(0, 0);
      }
    });

    if (typeof Reveal !== 'undefined' && Reveal.on) {
      ['slidechanged', 'fragmentshown', 'fragmenthidden', 'ready'].forEach(function (name) {
        Reveal.on(name, sendSpeakerState);
      });
    }
    // Ein offenes Notizfenster ohne Präsentation ist nutzlos.
    window.addEventListener('pagehide', function () {
      if (speakerWindow && !speakerWindow.closed) speakerWindow.close();
    });
  }

  function wire() {
    var pipelineNav = buildPipelineNavigation();
    Array.prototype.forEach.call(
      document.querySelectorAll('.method-card, .evidence-card'),
      function (card) {
        card.addEventListener('click', function () {
          var group = card.parentElement;
          Array.prototype.forEach.call(group.children, function (item) {
            item.classList.toggle('selected', item === card);
          });
        });
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('canvas[data-figure-src]'),
      function (canvas) {
        var source = canvas.getAttribute('data-figure-src');
        var picture = new Image();
        picture.addEventListener('load', function () {
          canvas.width = picture.naturalWidth || 1200;
          canvas.height = picture.naturalHeight || 700;
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(picture, 0, 0, canvas.width, canvas.height);
          canvas.dataset.ready = 'true';
        });
        picture.src = source;

        var figure = canvas.closest('.interactive-canvas');
        if (!figure) return;
        figure.setAttribute('tabindex', '0');
        figure.setAttribute('role', 'button');
        figure.setAttribute('aria-label', (canvas.getAttribute('aria-label') || 'Abbildung') + ' vergrößern');
        function toggleFigure(event) {
          if (event && event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
          if (event) event.preventDefault();
          figure.classList.toggle('expanded');
          document.body.classList.toggle('figure-open', figure.classList.contains('expanded'));
        }
        figure.addEventListener('click', toggleFigure);
        figure.addEventListener('keydown', toggleFigure);
      }
    );

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var expanded = document.querySelector('.interactive-canvas.expanded');
      if (!expanded) return;
      expanded.classList.remove('expanded');
      document.body.classList.remove('figure-open');
      event.stopPropagation();
    }, true);

    var notes = document.getElementById('deck-notes');
    if (notes) notes.addEventListener('click', openSpeaker);

    // Über reveal registriert, damit die Taste auch in der Hilfe (?) auftaucht.
    if (typeof Reveal !== 'undefined' && Reveal.addKeyBinding) {
      // Der getestete RF-Presenter (VID_25A7/PID_1001, PowerPoint-Modus)
      // sendet Pfeil runter/hoch. Explizit horizontal blättern, damit Reveal
      // die Signale nicht als Navigation innerhalb vertikaler Stacks deutet.
      Reveal.addKeyBinding(40, function () { Reveal.next(); });
      Reveal.addKeyBinding(38, function () { Reveal.prev(); });
      Reveal.addKeyBinding(
        { keyCode: 83, key: 'S', description: 'Sprecheransicht öffnen' },
        function () { openSpeaker(); }
      );
    } else {
      // Sollte reveal.js nicht bereitstehen, bleibt die Taste trotzdem belegt —
      // ein Vortrag ohne Notizen wäre der teuerste denkbare Fehler hier.
      document.addEventListener('keydown', function (event) {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        var tag = (event.target && event.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (event.key === 's' || event.key === 'S') openSpeaker(event);
      });
    }
    listenToSpeaker();

    if (typeof Reveal !== 'undefined' && Reveal.on) {
      Reveal.on('ready', function () { updatePipelineNavigation(pipelineNav); });
      Reveal.on('slidechanged', function () { updatePipelineNavigation(pipelineNav); });
    }
    if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) updatePipelineNavigation(pipelineNav);

    var skip = document.getElementById('deck-skip');
    if (skip) skip.addEventListener('click', goToDemo);

    // Die Demo-CTA entsteht erst durch Asciidoctor als .demo-cta-Absatz.
    Array.prototype.forEach.call(
      document.querySelectorAll('.demo-cta'),
      function (node) {
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.addEventListener('click', goToDemo);
        node.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') goToDemo(event);
        });
      }
    );

    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      // Reveal belegt B und . für Blackout, S für Sprechernotizen, F für Vollbild,
      // ESC/O für die Übersicht. D ist frei.
      if (event.key === 'd' || event.key === 'D') goToDemo(event);
    });

    document.addEventListener('fullscreenchange', function () {
      document.body.classList.toggle('deck-immersive', Boolean(document.fullscreenElement));
    });
  }

  function start() {
    prepareSlideLayouts();
    initChunkExplorer();
    initResultChart();
    wire();
    if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
      restorePosition();
    } else if (typeof Reveal !== 'undefined' && Reveal.on) {
      Reveal.on('ready', restorePosition);
    } else {
      window.setTimeout(restorePosition, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
