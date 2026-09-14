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
    var notes = document.getElementById('deck-notes');
    if (notes) notes.addEventListener('click', openSpeaker);

    // Über reveal registriert, damit die Taste auch in der Hilfe (?) auftaucht.
    if (typeof Reveal !== 'undefined' && Reveal.addKeyBinding) {
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
