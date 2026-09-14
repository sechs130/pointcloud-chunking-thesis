/*
 * Sprecheransicht, Fensterseite.
 *
 * Redet ausschliesslich über `postMessage` mit dem Deck. Kein Zugriff auf
 * `opener.document`: ab `file://` gilt jedes Dokument als eigene, undurchsichtige
 * Origin, ein direkter DOM-Zugriff würde dort scheitern. postMessage funktioniert
 * in allen drei Zielen — Flask, statisches Hosting, entpackte ZIP.
 *
 * Protokoll (beide Richtungen, Namensraum `pct-speaker`):
 *
 *   Fenster → Deck   { ns, type: 'ready' }              beim Laden
 *                    { ns, type: 'command', command }   'next' | 'prev' | 'first'
 *   Deck → Fenster   { ns, type: 'state', … }           bei jedem Folienwechsel
 *
 * Angenommen werden nur Nachrichten vom eigenen Öffner. Alles andere wird
 * verworfen — ein fremdes Fenster darf hier nichts hineinschreiben.
 */
(function () {
  'use strict';

  var NAMESPACE = 'pct-speaker';
  var LOST_AFTER_MS = 8000;

  var elements = {
    index: document.getElementById('slide-index'),
    total: document.getElementById('slide-total'),
    status: document.getElementById('status'),
    clock: document.getElementById('clock'),
    timer: document.getElementById('timer'),
    currentTitle: document.getElementById('current-title'),
    notes: document.getElementById('notes'),
    onscreen: document.getElementById('onscreen'),
    nextTitle: document.getElementById('next-title'),
    nextNotes: document.getElementById('next-notes'),
    deckName: document.getElementById('deck-name')
  };

  var startedAt = Date.now();
  var lastMessageAt = 0;

  function setStatus(text, state) {
    elements.status.textContent = text;
    elements.status.setAttribute('data-state', state);
  }

  function pad(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function tick() {
    var now = new Date();
    elements.clock.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());

    var seconds = Math.floor((Date.now() - startedAt) / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    elements.timer.textContent = hours > 0
      ? hours + ':' + pad(minutes % 60) + ':' + pad(seconds % 60)
      : pad(minutes) + ':' + pad(seconds % 60);

    // Kein Lebenszeichen mehr: lieber ehrlich anzeigen als eine alte Notiz
    // stehen lassen, die längst nicht mehr zur Leinwand gehört.
    if (lastMessageAt && Date.now() - lastMessageAt > LOST_AFTER_MS) {
      setStatus('Verbindung verloren', 'lost');
    }
  }

  /**
   * Notiz-HTML einsetzen.
   *
   * Der Inhalt stammt aus dem eigenen Deck, das aus der eigenen AsciiDoc-Quelle
   * gebaut wurde — dieselbe Herkunft wie diese Datei. Er wird trotzdem nur als
   * Fragment geparst und ohne Skripte übernommen, damit ein späterer Fehler in
   * der Kette hier nicht zu ausgeführtem Code wird.
   */
  function setHtml(target, html, placeholder) {
    target.replaceChildren();
    if (!html) {
      if (placeholder) {
        var hint = document.createElement('p');
        hint.className = 'placeholder';
        hint.textContent = placeholder;
        target.append(hint);
      }
      return;
    }
    var template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script, style, iframe, object, embed').forEach(function (node) {
      node.remove();
    });
    template.content.querySelectorAll('*').forEach(function (node) {
      Array.prototype.slice.call(node.attributes).forEach(function (attribute) {
        var name = attribute.name.toLowerCase();
        if (name.indexOf('on') === 0 || name === 'style') node.removeAttribute(attribute.name);
      });
    });
    target.append(template.content);
  }

  function render(state) {
    elements.index.textContent = state.index;
    elements.total.textContent = state.total;
    elements.currentTitle.textContent = state.title || '(ohne Überschrift)';
    setHtml(elements.notes, state.notes, 'Für diese Folie ist keine Sprechernotiz hinterlegt.');
    elements.onscreen.textContent = state.visible || '—';
    // `hasNext` statt eines leeren Titels: eine Bildfolie ohne Überschrift ist
    // nicht dasselbe wie das Ende des Vortrags.
    elements.nextTitle.textContent = state.hasNext
      ? (state.nextTitle || '(ohne Überschrift)')
      : '— Ende der Präsentation —';
    setHtml(elements.nextNotes, state.nextNotes, '');
    if (state.deck) elements.deckName.textContent = state.deck;
    setStatus('Verbunden', 'connected');
  }

  function send(message) {
    if (!window.opener || window.opener.closed) return;
    message.ns = NAMESPACE;
    window.opener.postMessage(message, '*');
  }

  window.addEventListener('message', function (event) {
    // Nur der eigene Öffner darf diese Ansicht steuern.
    if (!window.opener || event.source !== window.opener) return;
    var data = event.data;
    if (!data || data.ns !== NAMESPACE || data.type !== 'state') return;
    lastMessageAt = Date.now();
    render(data);
  });

  // Blättern vom Sprecherfenster aus: der Blick liegt hier, die Hand auch.
  document.addEventListener('keydown', function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var command = null;
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') command = 'next';
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') command = 'prev';
    else if (event.key === 'Home') command = 'first';
    if (!command) return;
    event.preventDefault();
    send({ type: 'command', command: command });
  });

  elements.timer.addEventListener('click', function () {
    startedAt = Date.now();
    tick();
  });

  if (!window.opener) {
    setStatus('Ohne Präsentationsfenster geöffnet', 'lost');
    elements.notes.replaceChildren();
    var hint = document.createElement('p');
    hint.className = 'placeholder';
    hint.textContent = 'Diese Ansicht wird aus der Präsentation heraus geöffnet — '
      + 'dort die Taste S drücken oder oben rechts auf „Notizen“ klicken.';
    elements.notes.append(hint);
  } else {
    setStatus('Verbinde …', 'waiting');
    send({ type: 'ready' });
    // Das Deck kann noch beim Initialisieren sein; ein zweiter Anlauf kostet
    // nichts und erspart ein Fenster, das ohne Grund leer bleibt.
    window.setTimeout(function () { if (!lastMessageAt) send({ type: 'ready' }); }, 600);
    window.setTimeout(function () { if (!lastMessageAt) send({ type: 'ready' }); }, 2000);
  }

  tick();
  window.setInterval(tick, 1000);
})();
