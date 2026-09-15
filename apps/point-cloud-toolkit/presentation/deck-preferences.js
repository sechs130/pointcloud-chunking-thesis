/* Theme, language and browser-native narration for the static deck. */
(function () {
  'use strict';

  var THEME_KEY = 'pct-deck-theme';
  var LANGUAGE_KEY = 'pct-deck-language';
  var READING_KEY = 'pct-deck-reading';
  var currentLanguage = 'de';
  var narrating = false;
  var advancingNarration = false;
  var reading = false;
  var textOrigins = new WeakMap();
  var attributeOrigins = new WeakMap();

  var EN = {
    'Große 3D-Daten für KI beherrschbar machen': 'Making large 3D data manageable for AI',
    'Vom 3D-Scan zur belastbaren Daten- und KI-Pipeline': 'From a 3D scan to a reliable data and AI pipeline',
    'Silvio Leon Echsle · Masterarbeit, TU Berlin · Bewerbung Data & AI Engineer · 15. September 2026': 'Silvio Leon Echsle · Master’s thesis, TU Berlin · Data & AI Engineer application · 15 September 2026',
    'Ein Scanner macht die reale Welt messbar': 'A scanner turns the real world into measurable data',
    'Ein 3D-Scanner tastet seine Umgebung ab. Millionen Messpunkte ergeben gemeinsam ein digitales 3D-Abbild.': 'A 3D scanner samples its surroundings. Millions of measurements form a digital 3D representation.',
    'aus der Luft': 'from the air',
    'Drohne oder Flugzeug': 'drone or aircraft',
    'vom Boden': 'from the ground',
    'stationärer Scanner': 'stationary scanner',
    'in Bewegung': 'while moving',
    'Fahrzeug oder Roboter': 'vehicle or robot',
    'Nutzen': 'Uses',
    'Vermessung, Dokumentation und industrielle Prüfung': 'surveying, documentation and industrial inspection',
    'Beispiel: Eine digitalisierte Gasturbine': 'Example: a digitised gas turbine',
    'Welche Punkte gehören zu welchem Bauteil?': 'Which points belong to which component?',
    'Bauteile erkennen': 'Identify components',
    'Soll und Ist vergleichen': 'Compare target and actual geometry',
    'Inspektion unterstützen': 'Support inspection',
    'Digitalen Zwilling vorbereiten': 'Prepare a digital twin',
    'Die KI gibt jedem Punkt eine Bedeutung': 'AI assigns a meaning to every point',
    'Messpunkte ohne Klassenfarben': 'Measurements without class colours',
    'erkennt Form und Umgebung': 'recognises shape and context',
    'Klasse für jeden Punkt': 'A class for every point',
    'Semantische Segmentierung': 'Semantic segmentation',
    'bedeutet hier: Die KI entscheidet für jeden Punkt, was er darstellt.': 'means that AI decides what each individual point represents.',
    'Eine ganze Szene passt nicht auf einmal in den Grafikspeicher': 'A complete scene does not fit into GPU memory at once',
    '≈ 12 Mio.': '≈ 12 million',
    'Punkte in einer Szene': 'points in one scene',
    'zu groß für einen Durchlauf': 'too large for one pass',
    'Punkte je Teilbereich im Experiment': 'points per region in the experiment',
    '45.000': '45,000',
    'Globale Aufmerksamkeit vergleicht jeden Punkt mit jedem anderen.': 'Global attention compares every point with every other point.',
    '144 Billionen Punktpaare': '144 trillion point pairs',
    'Sechs Schritte machen große 3D-Daten beherrschbar': 'Six steps make large 3D data manageable',
    'Daten erfassen': 'Capture data',
    '3D-Szene verstehen': 'understand the 3D scene',
    'Daten zerlegen': 'Partition data',
    'passende Teilbereiche': 'create suitable regions',
    'KI anwenden': 'Apply AI',
    'KI': 'AI',
    'Klasse je Punkt': 'classify every point',
    'Ergebnisse vereinen': 'Merge results',
    'Gesamtszene herstellen': 'rebuild the complete scene',
    'Qualität messen': 'Measure quality',
    'faire Kennzahlen': 'use comparable metrics',
    'Lösung wählen': 'Choose a solution',
    'Zielkonflikte abwägen': 'balance trade-offs',
    'Meine Arbeit: die vollständige Daten- und Evaluationspipeline aufbauen und ihre Stellschrauben systematisch vergleichen.': 'My work covered the complete data and evaluation pipeline and a systematic comparison of its design choices.',
    'Die Zerlegung entscheidet, welchen Kontext die KI sieht': 'Partitioning determines the context available to AI',
    'Raster': 'Grid',
    'Z-Kurve': 'Z-order curve',
    'K-D-Baum': 'K-d tree',
    'Kugeln': 'Spheres',
    'Zylinder': 'Cylinders',
    'Flächenteilung': 'Recursive split',
    'Automatisch': 'Automatic',
    'Angehalten': 'Paused',
    'Reihenfolge der Teilbereiche': 'Order of the regions',
    'fertige Teilbereiche': 'completed regions',
    'Teilbereiche': 'regions',
    'Punkte verarbeitet': 'points processed',
    'mehrfach betrachtete Punkte': 'points seen more than once',
    'Methoden': 'methods',
    'andere Grenzen': 'different boundaries',
    'und Reihenfolgen': 'and processing orders',
    'Dasselbe KI-Modell analysiert jeden Teilbereich': 'The same AI model analyses every region',
    'erkennt lokale Formen und Nachbarschaften': 'recognises local shapes and neighbourhoods',
    'für alle Versuche unverändert': 'unchanged across all experiments',
    'Vorhersagen je Punkt': 'predictions for every point',
    'Teilanalysen müssen wieder ein Gesamtbild ergeben': 'Local analyses must form one consistent result',
    'Teil A: Gebäude': 'Region A: building',
    'Teil B: Gebäude': 'Region B: building',
    'Teil C: Boden': 'Region C: ground',
    'gewichten': 'weight votes',
    'Mehrheit, Abstand oder Vertrauen': 'majority, distance or confidence',
    'Gebäude': 'building',
    'eine konsistente Klasse': 'one consistent class',
    'Mehrere lokale Sichtweisen können widersprechen. Eine klare Regel löst den Konflikt reproduzierbar.': 'Local views may disagree. A defined rule resolves the conflict reproducibly.',
    'Eine automatisierte Pipeline macht 24 Varianten vergleichbar': 'An automated pipeline makes 24 variants comparable',
    'Zerlegungen': 'partitioning methods',
    'Regeln zum Vereinen': 'merge rules',
    'kontrollierte Varianten': 'controlled variants',
    'Qualität': 'Quality',
    'Wie viele Klassen erkennt die KI?': 'How well does AI recognise the classes?',
    'Laufzeit': 'Runtime',
    'Wie lange dauert der gesamte Ablauf?': 'How long does the full process take?',
    'Ressourcen': 'Resources',
    'Wie viel Speicher und Redundanz entstehen?': 'How much memory and duplicate work are required?',
    'Der K-D-Baum liefert in diesem Versuch die beste Qualität': 'The k-d tree delivers the highest quality in this experiment',
    'beste Qualität': 'highest quality',
    '0,5552': '0.5552',
    'vollständiger Lauf': 'complete run',
    'Gesamtlaufzeit': 'total runtime',
    'Technologien nach Aufgabe': 'Technologies by role',
    'Daten': 'Data',
    'Zerlegung': 'Partitioning',
    'Auswertung': 'Evaluation',
    'Automatisierung': 'Automation',
    'Produktisierung': 'Productisation',
    'Präsentation': 'Presentation',
    'Vielen Dank': 'Thank you',
    'Fragen?': 'Questions?',
    'Optional: 75 Sekunden Vorführung': 'Optional: 75-second demonstration',
    'Vorführung starten': 'Start demonstration',
    'Die Browserdemo zeigt denselben Ablauf im Kleinen — vom Laden bis zur wiederhergestellten Szene.': 'The browser demo shows the same process on a small scale, from loading to the reconstructed scene.',
    'Punkte geladen': 'points loaded',
    '2.304': '2,304',
    'Teilbereiche erzeugt': 'regions created',
    'Punkte verloren': 'points lost',
    'Punkte rekonstruiert': 'points reconstructed',
    'Notizen': 'Notes',
    'Präsentation überspringen': 'Skip presentation',
    'Gliederung der Präsentation': 'Presentation outline',
    'Zurück zum App Hub': 'Back to the App Hub',
    'Sprecheransicht in einem zweiten Fenster öffnen': 'Open speaker view in a second window',
    'Automatische Vertonung starten': 'Start automatic narration',
    'Erklärung': 'Explanation',
    'Erklärung neben der Folie anzeigen': 'Show an explanation beside the slide',
    'Erklärung zur aktuellen Folie': 'Explanation of the current slide',
    'Erklärung schließen': 'Close explanation',
    'Die Erklärung folgt automatisch der aktuellen Folie.': 'The explanation automatically follows the current slide.',
    'Systemeinstellung': 'System setting',
    'Helles Farbschema': 'Light theme',
    'Dunkles Farbschema': 'Dark theme',

    'Guten Morgen, vielen Dank für die Einladung': 'Good morning, and thank you for the invitation',
    'Ein Scanner erzeugt Millionen Punkte, aber noch kein Verständnis': 'A scanner produces millions of points, but no understanding yet',
    'Wie wird daraus eine belastbare KI-Lösung?': 'How can this become a reliable AI solution?',
    'Masterarbeit an der TU Berlin': 'Master’s thesis at TU Berlin',
    'Zuerst die Daten selbst': 'Start with the data itself',
    'Laser misst Abstand in viele Richtungen': 'A laser measures distance in many directions',
    'Jeder Treffer wird ein Punkt im Raum': 'Every return becomes a point in space',
    'Viele Punkte ergeben Form und Oberfläche': 'Many points describe shape and surface',
    'Luftgestützte Erfassung von oben': 'Airborne capture from above',
    'Messpunkte werden erst durch einen Anwendungsfall wertvoll': 'Measurements become valuable through a use case',
    'Scan liefert zunächst Geometrie ohne Bauteilnamen': 'The scan initially provides geometry without component names',
    'KI könnte Gehäuse, Leitungen oder Flansche unterscheiden': 'AI could distinguish housings, pipes or flanges',
    'Darauf aufbauend Vergleich, Dokumentation und Wartung': 'This can support comparison, documentation and maintenance',
    'Diesen Anwendungsfall mit Daten und Folgeprozess verbinden': 'Connect the use case with its data and downstream process',
    'Dafür braucht jeder Punkt eine Bedeutung': 'Every point needs a meaning first',
    'Manuelle Beschriftung von Millionen Punkten nicht praktikabel': 'Manual labelling of millions of points is impractical',
    'KI nutzt Geometrie und lokale Nachbarschaft': 'AI uses geometry and the local neighbourhood',
    'Boden, Gebäude, Fahrzeuge, Vegetation und Leitungen': 'Ground, buildings, vehicles, vegetation and power lines',
    'Große Szenen erzeugen ein Skalierungsproblem': 'Large scenes create a scaling problem',
    'Ungefähr 12 Millionen Punkte in einer Szene': 'Around 12 million points in one scene',
    'Naive globale Aufmerksamkeit vergleicht jeden Punkt mit jedem Punkt': 'Naive global attention compares every point with every point',
    '144 Billionen Paarwerte': '144 trillion pair values',
    'Etwa 288 TB pro Kopf in FP16, nur für die Aufmerksamkeitsmatrix': 'About 288 terabytes per attention head in FP16, only for the attention matrix',
    'Ohne Aktivierungen, Gradienten oder Optimierungszustände': 'This excludes activations, gradients and optimiser state',
    'Deshalb verarbeitet das Modell begrenzte lokale Ausschnitte': 'The model therefore processes limited local regions',
    'Daraus folgt die gesamte Pipeline': 'This motivates the complete pipeline',
    'Zerlegung und Zusammenführung als Stellschrauben': 'Partitioning and merging are the design choices',
    'KI-Modell und Datensatz bewusst konstant': 'The AI model and dataset remain constant',
    'Ergebnisse vereinen; Qualität messen; Lösung wählen': 'Merge results, measure quality and choose a solution',
    'Zuerst die Zerlegung': 'Start with partitioning',
    'Mehrere Lösungsansätze entwickeln': 'Develop several solution approaches',
    'Die Zerlegungsmethoden teilen dieselben Punkte unterschiedlich in Bereiche': 'The methods divide the same points into different regions',
    'Überlappung sorgt dafür, dass Randpunkte in einem anderen Teilbereich auch innere Punkte sein können': 'Overlap lets boundary points become interior points in another region',
    'Dadurch erhalten Randpunkte eine weitere Chance mit besserem räumlichem Kontext': 'Boundary points receive another view with better spatial context',
    'Jeder Teilbereich läuft durch dasselbe Modell': 'Every region passes through the same model',
    'Erkennt lokale geometrische Muster': 'Recognises local geometric patterns',
    'Gleicher Datensatz, gleiches Training, gleiche Konfiguration': 'Same dataset, training and configuration',
    'Nur Zerlegung und spätere Vereinigung variieren': 'Only partitioning and subsequent merging vary',
    'Interne Datenanreicherung durch Drehen, Skalieren und Spiegeln': 'Internal data augmentation through rotation, scaling and mirroring',
    'Variablen isolieren und Vergleich fair halten': 'Isolate variables and keep the comparison fair',
    'Überlappung erzeugt mehrere Vorhersagen': 'Overlap creates multiple predictions',
    'Einfaches Beispiel auf der Folie': 'Simple example on the slide',
    'Vier Regeln verglichen': 'Four rules compared',
    'Mehrheit': 'Majority',
    'Nähe zum Mittelpunkt des Teilbereichs': 'Distance to the centre of the region',
    'Vertrauen des Modells': 'Model confidence',
    'Kombination aus Nähe und Vertrauen': 'Combination of distance and confidence',
    '6 Zerlegungen mal 4 Vereinigungsregeln': 'Six partitioning methods times four merge rules',
    'Automatisierte Verarbeitung und Auswertung': 'Automated processing and evaluation',
    'Qualität nicht nur als Gesamtgenauigkeit': 'Quality measured beyond overall accuracy',
    'Laufzeit umfasst Verarbeitungskette': 'Runtime covers the complete processing chain',
    'Ressourcen berücksichtigen Speicher und Mehrfacharbeit': 'Resource metrics include memory and duplicate work',
    'Bestwert im kontrollierten Vergleich': 'Best result in the controlled comparison',
    'K-D-Baum plus kombinierte Gewichtung': 'K-d tree with combined weighting',
    'Abwechselnd entlang der Raumachsen am Median teilen': 'Alternate spatial axes and split at the median',
    'Gute lokale Sicht wichtiger als spätere Reparatur': 'A useful local view matters more than later correction',
    'Aufteilung anhand der Dateneigenschaften ist wichtiger als bloße Überlappung': 'Data-aware partitioning matters more than overlap alone',
    'Python, NumPy, SciPy und Numba für Daten und Geometrie': 'Python, NumPy, SciPy and Numba for data and geometry',
    'PyTorch, Pointcept, PTv3 und CUDA für das Modell': 'PyTorch, Pointcept, PTv3 and CUDA for the model',
    'Jupyter, Git, Bash und pytest für reproduzierbare Experimente': 'Jupyter, Git, Bash and pytest for reproducible experiments',
    'Flask, JavaScript, HTML und CSS für die spätere Produktisierung': 'Flask, JavaScript, HTML and CSS for later productisation',
    'Hier läuft dieselbe Pipeline in klein direkt im Browser': 'The same pipeline runs on a smaller example directly in the browser',
    'Beispieldatei laden': 'Load the example file',
    'Zuerst Struktur und Metadaten prüfen': 'Inspect its structure and metadata',
    'Zerlegung wählen und ausführen': 'Choose and run a partitioning method',
    'Validieren und rekonstruieren': 'Check and reconstruct the scene',
    'Alle 2.304 Punkte sind eindeutig zurückgeführt, keiner fehlt': 'All 2,304 points are mapped back unambiguously and none are missing',
    'Keine Experimentierfunktionen öffnen': 'Avoid opening experimental functions',
    'Bei Problemen Ergebniszahlen auf der Folie zeigen': 'Use the result figures on the slide if the live demo fails'
  };

  var NARRATION = {
    de: [
      '3D-Scanner erzeugen Millionen Messpunkte. Meine Masterarbeit untersucht, wie daraus eine belastbare Daten- und KI-Pipeline wird, die auch mit sehr großen Szenen umgehen kann.',
      'Ein Scanner misst seine Umgebung Punkt für Punkt. Je nach Anwendung sitzt er in einem Flugzeug, auf einem Fahrzeug oder fest am Boden. Die Messungen ergeben gemeinsam ein digitales dreidimensionales Abbild.',
      'Ein möglicher industrieller Anwendungsfall ist der Scan einer Gasturbine oder einer Anlage. Eine automatische Klassifikation kann Bauteile unterscheiden und damit Inspektion, Dokumentation oder einen Soll-Ist-Vergleich vorbereiten.',
      'Die KI weist jedem Messpunkt eine Klasse zu, zum Beispiel Boden, Gebäude, Vegetation oder Leitung. Diese Aufgabe heißt semantische Segmentierung. Eine manuelle Zuordnung für Millionen Punkte wäre nicht praktikabel.',
      'Die zentrale Grenze ist der Grafikspeicher. Eine Szene mit ungefähr zwölf Millionen Punkten würde bei naiver globaler Aufmerksamkeit 144 Billionen Punktpaare erzeugen. Deshalb verarbeitet das Modell kleinere, lokal zusammenhängende Bereiche.',
      'Meine Lösung folgt sechs Schritten. Daten erfassen, sinnvoll zerlegen, mit derselben KI analysieren, lokale Ergebnisse vereinen, die Qualität messen und anhand der Kennzahlen eine Lösung auswählen.',
      'Die Zerlegung ist keine reine technische Vorarbeit. Unterschiedliche Grenzen verändern den räumlichen Kontext, den das Modell sieht. Überlappung gibt Punkten am Rand eine zweite lokale Sicht.',
      'Alle Teilbereiche durchlaufen dasselbe Point-Transformer-Modell mit identischer Konfiguration. Dadurch bleiben Modell und Training konstant, während ich gezielt die Zerlegung und das spätere Zusammenführen vergleiche.',
      'Überlappende Teilbereiche können für denselben Punkt verschiedene Klassen vorhersagen. Eine feste Vereinigungsregel, etwa Mehrheit, Abstand oder Modellvertrauen, macht daraus wieder eine konsistente Gesamtszene.',
      'Sechs Zerlegungsverfahren kombiniert mit vier Vereinigungsregeln ergeben 24 kontrollierte Varianten. Die Pipeline misst Qualität, Laufzeit und Ressourcenverbrauch automatisiert und vergleichbar.',
      'In diesem Versuchsaufbau liefert der K-D-Baum die beste Qualität. Entscheidend war eine sinnvolle lokale Sicht auf die Daten. Eine schlechte Zerlegung ließ sich durch die spätere Vereinigung nur begrenzt ausgleichen.',
      'Das Projekt verbindet Datenverarbeitung, Machine Learning, automatisierte Auswertung und spätere Produktisierung. Die Technologien stehen hier nach ihrer Aufgabe im Ablauf geordnet.',
      'Vielen Dank. Wenn es die Zeit erlaubt, zeige ich jetzt denselben Ablauf in einer kurzen Browserdemo. Ansonsten beantworte ich gern Ihre Fragen.'
    ],
    en: [
      '3D scanners create millions of measurements. My master’s thesis investigates how to turn them into a reliable data and AI pipeline that can handle very large scenes.',
      'A scanner measures its surroundings point by point. Depending on the use case, it may operate from an aircraft, a vehicle or a fixed position. Together, the measurements form a digital three-dimensional representation.',
      'One possible industrial use case is scanning a gas turbine or a larger facility. Automatic classification could distinguish components and prepare inspection, documentation or comparison with target geometry.',
      'AI assigns a class to every measurement, such as ground, building, vegetation or power line. This task is called semantic segmentation. Manually assigning millions of points would not be practical.',
      'The central constraint is GPU memory. A scene with roughly twelve million points would create 144 trillion point pairs with naive global attention. The model therefore has to process smaller, locally coherent regions.',
      'My solution follows six steps. Capture the data, partition it, analyse every region with the same AI, merge local results, measure quality and select a solution from the evidence.',
      'Partitioning is more than technical preparation. Different boundaries change the spatial context available to the model. Overlap gives boundary points a second local view.',
      'Every region passes through the same Point Transformer with an identical configuration. The model and training stay constant while I compare partitioning and subsequent merging.',
      'Overlapping regions may predict different classes for the same point. A defined merge rule, such as majority, distance or model confidence, rebuilds one consistent scene.',
      'Six partitioning methods combined with four merge rules create 24 controlled variants. The pipeline measures quality, runtime and resource use automatically and comparably.',
      'In this experiment, the k-d tree delivers the highest quality. A useful local view of the data mattered most. Later merging could only partly compensate for weak partitioning.',
      'The project combines data processing, machine learning, automated evaluation and later productisation. The technologies are arranged here by their role in the process.',
      'Thank you. If time permits, I will now show the same process in a short browser demo. Otherwise, I am happy to take your questions.'
    ]
  };

  function saved(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (_error) { return fallback; }
  }

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (_error) { /* optional preference */ }
  }

  function applyTheme(choice) {
    var value = ['system', 'light', 'dark'].indexOf(choice) >= 0 ? choice : 'system';
    if (value === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', value);
    store(THEME_KEY, value);
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-choice]'), function (button) {
      var active = button.dataset.themeChoice === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    window.dispatchEvent(new CustomEvent('pct-themechange', { detail: value }));
  }

  function translated(value) {
    return currentLanguage === 'en' && EN[value] ? EN[value] : value;
  }

  function translateTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || /^(SCRIPT|STYLE)$/.test(node.parentElement.tagName)) continue;
      if (!textOrigins.has(node)) textOrigins.set(node, node.nodeValue);
      var original = textOrigins.get(node);
      var clean = original.replace(/\s+/g, ' ').trim();
      if (!clean) continue;
      var replacement = translated(clean);
      var leading = (original.match(/^\s*/) || [''])[0];
      var trailing = (original.match(/\s*$/) || [''])[0];
      node.nodeValue = leading + replacement + trailing;
    }
  }

  function translateAttributes(root) {
    Array.prototype.forEach.call(root.querySelectorAll('*'), function (element) {
      var origins = attributeOrigins.get(element) || {};
      ['aria-label', 'title', 'alt'].forEach(function (name) {
        if (!element.hasAttribute(name)) return;
        if (!(name in origins)) origins[name] = element.getAttribute(name);
        element.setAttribute(name, translated(origins[name]));
      });
      attributeOrigins.set(element, origins);
    });
  }

  function updateNarrationButton() {
    var button = document.getElementById('deck-autoplay');
    if (!button) return;
    button.classList.toggle('active', narrating);
    button.setAttribute('aria-pressed', narrating ? 'true' : 'false');
    var label = button.querySelector('.autoplay-label');
    if (label) label.textContent = narrating ? (currentLanguage === 'en' ? 'Stop' : 'Stopp') : 'Auto';
  }

  function updateReadingPanel() {
    var panel = document.getElementById('deck-reading-panel');
    if (!panel || typeof Reveal === 'undefined') return;
    var slides = Reveal.getSlides();
    var current = Reveal.getCurrentSlide();
    var index = slides.indexOf(current);
    var title = current && current.querySelector('h1, h2');
    var position = document.getElementById('reading-position');
    var heading = document.getElementById('reading-title');
    var copy = document.getElementById('reading-copy');
    if (position) position.textContent = currentLanguage === 'en'
      ? 'SLIDE ' + (index + 1) + ' OF ' + slides.length
      : 'FOLIE ' + (index + 1) + ' VON ' + slides.length;
    if (heading) heading.textContent = title ? title.textContent.trim() : '';
    if (copy) copy.textContent = NARRATION[currentLanguage][index] || '';
  }

  function applyReading(value) {
    reading = Boolean(value);
    document.body.classList.toggle('deck-reading-open', reading);
    var panel = document.getElementById('deck-reading-panel');
    var button = document.getElementById('deck-reading');
    if (panel) panel.setAttribute('aria-hidden', reading ? 'false' : 'true');
    if (button) {
      button.classList.toggle('active', reading);
      button.setAttribute('aria-expanded', reading ? 'true' : 'false');
    }
    store(READING_KEY, reading ? 'open' : 'closed');
    if (reading) updateReadingPanel();
    if (typeof Reveal !== 'undefined' && Reveal.layout) {
      window.setTimeout(function () { Reveal.layout(); }, 50);
    }
  }

  function stopNarration() {
    narrating = false;
    advancingNarration = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    updateNarrationButton();
  }

  function applyLanguage(choice) {
    stopNarration();
    currentLanguage = choice === 'en' ? 'en' : 'de';
    store(LANGUAGE_KEY, currentLanguage);
    document.documentElement.lang = currentLanguage;
    translateTextNodes(document.body);
    translateAttributes(document.body);
    document.title = currentLanguage === 'en'
      ? 'Making large 3D data manageable for AI'
      : 'Große 3D-Daten für KI beherrschbar machen';
    Array.prototype.forEach.call(document.querySelectorAll('[data-language-choice]'), function (button) {
      var active = button.dataset.languageChoice === currentLanguage;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    updateNarrationButton();
    updateReadingPanel();
    window.dispatchEvent(new CustomEvent('pct-languagechange', { detail: currentLanguage }));
  }

  function preferredVoice(language) {
    var prefix = language === 'en' ? 'en' : 'de';
    var voices = window.speechSynthesis.getVoices();
    return voices.find(function (voice) { return voice.lang.toLowerCase().indexOf(prefix) === 0 && voice.localService; })
      || voices.find(function (voice) { return voice.lang.toLowerCase().indexOf(prefix) === 0; })
      || null;
  }

  function speakCurrentSlide() {
    if (!narrating || typeof Reveal === 'undefined') return;
    var slides = Reveal.getSlides();
    var current = Reveal.getCurrentSlide();
    var index = slides.indexOf(current);
    var script = NARRATION[currentLanguage][index];
    if (!script) { stopNarration(); return; }
    var utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = currentLanguage === 'en' ? 'en-GB' : 'de-DE';
    utterance.rate = 1.02;
    utterance.pitch = 1;
    var voice = preferredVoice(currentLanguage);
    if (voice) utterance.voice = voice;
    utterance.onend = function () {
      if (!narrating) return;
      if (index >= slides.length - 1) { stopNarration(); return; }
      advancingNarration = true;
      Reveal.next();
      window.setTimeout(function () {
        advancingNarration = false;
        speakCurrentSlide();
      }, 450);
    };
    utterance.onerror = stopNarration;
    window.speechSynthesis.speak(utterance);
  }

  function toggleNarration() {
    if (narrating) { stopNarration(); return; }
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      window.alert(currentLanguage === 'en'
        ? 'This browser does not provide speech synthesis.'
        : 'Dieser Browser stellt keine Sprachsynthese bereit.');
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    narrating = true;
    updateNarrationButton();
    speakCurrentSlide();
  }

  function init() {
    applyTheme(saved(THEME_KEY, 'system'));
    currentLanguage = saved(LANGUAGE_KEY, 'de') === 'en' ? 'en' : 'de';
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-choice]'), function (button) {
      button.addEventListener('click', function () { applyTheme(button.dataset.themeChoice); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-language-choice]'), function (button) {
      button.addEventListener('click', function () { applyLanguage(button.dataset.languageChoice); });
    });
    var autoplay = document.getElementById('deck-autoplay');
    if (autoplay) autoplay.addEventListener('click', toggleNarration);
    var readingButton = document.getElementById('deck-reading');
    if (readingButton) readingButton.addEventListener('click', function () { applyReading(!reading); });
    var readingClose = document.getElementById('reading-close');
    if (readingClose) readingClose.addEventListener('click', function () { applyReading(false); });
    applyLanguage(currentLanguage);
    applyReading(saved(READING_KEY, 'closed') === 'open');
    if (typeof Reveal !== 'undefined' && Reveal.on) {
      Reveal.on('slidechanged', function () {
        if (narrating && !advancingNarration) stopNarration();
        updateReadingPanel();
      });
    }
    document.addEventListener('keydown', function (event) {
      if ((event.key === 'e' || event.key === 'E') && !event.altKey && !event.ctrlKey && !event.metaKey) {
        var target = event.target;
        if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        event.preventDefault();
        applyReading(!reading);
      }
    });
    window.PointCloudDeckPreferences = {
      language: function () { return currentLanguage; },
      theme: applyTheme,
      setLanguage: applyLanguage,
      setReading: applyReading,
      stopNarration: stopNarration
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
