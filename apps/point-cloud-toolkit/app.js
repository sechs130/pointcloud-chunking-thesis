const apiBase = "/api/apps/point-cloud-toolkit";

// --- Betriebsart -----------------------------------------------------------
// Dieselbe Oberflaeche laeuft an zwei Stellen: hinter dem Flask-Backend (dann
// rechnet die kanonische Python-Bibliothek) und als reine Datei auf GitHub
// Pages oder nach einem Doppelklick (dann rechnet der Port in
// browser-core.js). Die Betriebsart wird beim Bauen in demo-config.js
// festgelegt, damit ein statischer Build gar nicht erst versucht, eine API
// anzusprechen, die es dort nicht gibt.
//
//   "server"  nur Backend, kein Fallback
//   "browser" nur Browser-Kern, kein einziger fetch
//   "auto"    Backend versuchen, sonst Browser-Kern
const config = window.PCT_CONFIG || { mode: "auto" };
let engine = null; // "server" | "browser", steht nach loadCapabilities fest

// Zustand des Browser-Modus. Im Server-Modus bleiben diese Werte leer.
let browserCloud = null;
let browserResult = null;

const elements = {
  sourceInput: document.querySelector("#source-file"),
  examplePart: document.querySelector("#example-part"),
  archiveInput: document.querySelector("#archive-file"),
  sampleButton: document.querySelector("#sample-button"),
  chunkButton: document.querySelector("#chunk-button"),
  mergeButton: document.querySelector("#merge-button"),
  strategy: document.querySelector("#strategy"),
  pointBudget: document.querySelector("#point-budget"),
  overlap: document.querySelector("#overlap"),
  advancedParams: document.querySelector("#advanced-params"),
  sourceName: document.querySelector("#source-name"),
  archiveName: document.querySelector("#archive-name"),
  strategyDescription: document.querySelector("#strategy-description"),
  chunkStatus: document.querySelector("#chunk-status"),
  mergeStatus: document.querySelector("#merge-status"),
  metricPoints: document.querySelector("#metric-points"),
  metricFields: document.querySelector("#metric-fields"),
  metricExtent: document.querySelector("#metric-extent"),
  version: document.querySelector("#library-version"),
  canvas: document.querySelector("#point-viewer"),
  viewerEmpty: document.querySelector("#viewer-empty"),
  chunkNavigator: document.querySelector("#chunk-navigator"),
  chunkSelect: document.querySelector("#chunk-select"),
  previousChunk: document.querySelector("#previous-chunk"),
  nextChunk: document.querySelector("#next-chunk"),
  chunkMeta: document.querySelector("#chunk-meta"),
  sceneOverview: document.querySelector("#scene-overview"),
  engineNote: document.querySelector("#engine-note"),
  chunkFormats: document.querySelector("#chunk-formats"),
  mergeLede: document.querySelector("#merge-lede"),
  archiveLabel: document.querySelector("#archive-label"),
  reportButton: document.querySelector("#report-button"),
  mergeHeading: document.querySelector("#merge-heading"),

  // Schritt 03 bis 06 und der Forschungsbereich.
  validateRun: document.querySelector("#validate-run"),
  validateStatus: document.querySelector("#validate-status"),
  validateReport: document.querySelector("#validate-report"),
  recomposeMethod: document.querySelector("#recompose-method"),
  recomposeMethodDescription: document.querySelector("#recompose-method-description"),
  recomposeDecimals: document.querySelector("#recompose-decimals"),
  recomposePower: document.querySelector("#recompose-power"),
  recomposeCrf: document.querySelector("#recompose-crf"),
  recomposeCrfEnable: document.querySelector("#recompose-crf-enable"),
  recomposeRun: document.querySelector("#recompose-run"),
  recomposeCompare: document.querySelector("#recompose-compare"),
  recomposeStatus: document.querySelector("#recompose-status"),
  recomposeResult: document.querySelector("#recompose-result"),
  recomposeTable: document.querySelector("#recompose-table"),
  recomposeCaveat: document.querySelector("#recompose-caveat"),
  recomposeIdentity: document.querySelector("#recompose-identity"),
  supportNote: document.querySelector("#support-note"),
  supportBars: document.querySelector("#support-bars"),
  errorRate: document.querySelector("#error-rate"),
  errorAmplitude: document.querySelector("#error-amplitude"),
  errorRateOutput: document.querySelector("#error-rate-output"),
  errorAmplitudeOutput: document.querySelector("#error-amplitude-output"),
  showResult: document.querySelector("#show-result"),
  analyzeRun: document.querySelector("#analyze-run"),
  analyzeStatus: document.querySelector("#analyze-status"),
  analyzeResult: document.querySelector("#analyze-result"),
  analyzeDensity: document.querySelector("#analyze-density"),
  analyzeSuggest: document.querySelector("#analyze-suggest"),
  analyzeClasses: document.querySelector("#analyze-classes"),
  analyzeConfusion: document.querySelector("#analyze-confusion"),
  exportArchive: document.querySelector("#export-archive"),
  exportMerged: document.querySelector("#export-merged"),
  exportBundle: document.querySelector("#export-bundle"),
  exportSchema: document.querySelector("#export-schema"),
  exportHashes: document.querySelector("#export-hashes"),
  viewerModes: document.querySelector("#viewer-modes"),
};

let sourceFile = null;
let archiveFile = null;
let capabilities = null;
let previewPoints = [];
let scenePreviewPoints = [];
let chunkPreviews = [];

// Ohne gespeicherte Wahl folgt die Demo dem Betriebssystem. Hell und Dunkel
// bleiben als bewusste Alternativen direkt erreichbar.
function applyTheme(choice) {
  const value = ["system", "light", "dark"].includes(choice) ? choice : "system";
  if (value === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = value;
  for (const button of document.querySelectorAll("[data-theme-choice]")) {
    const active = button.dataset.themeChoice === value;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }
  try { localStorage.setItem("pct-theme", value); } catch (_error) {}
  if (elements.canvas) window.requestAnimationFrame(readViewerBackground);
}

let initialTheme = "system";
try { initialTheme = localStorage.getItem("pct-theme") || "system"; } catch (_error) {}
for (const button of document.querySelectorAll("[data-theme-choice]")) {
  button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
}
applyTheme(initialTheme);
// --- Viewer-Zustand und Gestenphysik ---------------------------------------
// pitchRaw folgt dem Zeiger 1:1 und darf die Grenze ueberschreiten. Was
// gezeichnet wird, ist der abgefederte Wert aus resistPitch(): jenseits der
// Grenze folgt die Szene immer weniger, statt hart stehen zu bleiben.

const PITCH_LIMIT = 1.35;
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.4;
const RADIANS_PER_PIXEL = 0.009;

// Zerfall pro Millisekunde. 0.998 ist Apples Wert fuer Scroll-Nachlauf; hier
// waere er zu traege (rund 3.8 s bis zur Ruhe). 0.99 ist die knackigere
// Variante und laesst die Drehung in gut einer halben Sekunde auslaufen.
const DECELERATION = 0.99;

// Unterhalb dieser Winkelgeschwindigkeit bewegt sich ein Punkt am Rand der
// Szene weniger als ein Pixel pro Frame - weiterzurechnen waere unsichtbar.
const MOMENTUM_EPSILON = 5e-5;

// Obergrenze, damit ein sehr schneller Wurf die Szene nicht wegschleudert.
const MAX_MOMENTUM = 0.02;

// Zeitkonstanten fuer das Zulaufen auf einen Zielwert. Nach rund 2.3 tau sind
// 90 Prozent des Wegs zurueckgelegt, nach 4.6 tau 99 Prozent - PITCH_TAU von
// 80 ms landet damit bei etwa 370 ms und trifft Apples Response von 0.3-0.4 s.
const PITCH_TAU = 80;
const ZOOM_TAU = 90;

// Restabstaende, ab denen weitergerechnet wuerde, ohne dass man es sieht.
const PITCH_REST = 1e-3; // Radiant, deutlich unter einem Pixel am Szenenrand
const ZOOM_REST = 1e-3;

/** Anteil der Reststrecke, der in diesem Frame zurueckgelegt wird. */
function approach(elapsed, tau) {
  return 1 - Math.exp(-elapsed / tau);
}

const view = { yaw: -0.45, pitchRaw: 0.55, zoom: 0.84, zoomTarget: 0.84 };
const drag = { active: false, pointerId: null, x: 0, y: 0, samples: [] };
const momentum = { yaw: 0, pitch: 0 }; // Radiant pro Millisekunde

let frameHandle = null;
let lastFrameTime = 0;
let viewerBackground = "#101820";

/** Progressiver Widerstand jenseits einer Grenze statt hartem Anschlag. */
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function resistPitch(value) {
  if (value > PITCH_LIMIT) {
    return PITCH_LIMIT + rubberband(value - PITCH_LIMIT, PITCH_LIMIT);
  }
  if (value < -PITCH_LIMIT) {
    return -PITCH_LIMIT - rubberband(-PITCH_LIMIT - value, PITCH_LIMIT);
  }
  return value;
}

function setStatus(element, message, kind = "") {
  element.textContent = message;
  element.className = `status ${kind}`.trim();
}

async function errorMessage(response) {
  try {
    const payload = await response.json();
    return payload.error || `Request failed (${response.status})`;
  } catch (_error) {
    return `Request failed (${response.status})`;
  }
}

function fileHeaders(file) {
  return { "Content-Type": "application/octet-stream", "X-File-Name": encodeURIComponent(file.name) };
}

function triggerDownload(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadName(response, fallback) {
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/i);
  return match ? match[1] : fallback;
}

function fillStrategySelect() {
  elements.strategy.replaceChildren();
  for (const strategy of capabilities.strategies) {
    if (engine === "browser" && strategy.serverOnly) continue;
    const option = document.createElement("option");
    option.value = strategy.id;
    option.textContent = ({
      xy: "Flächenraster",
      morton: "Z-Kurven-Sortierung",
      bisect_xy_overlap: "Rekursive Flächenteilung",
      kdtree: "K-D-Baum",
      rand_knn: "Kugelnachbarschaften",
      rand_cyl: "Zylindernachbarschaften",
    })[strategy.id] || strategy.id.replaceAll("_", " ");
    // Die drei nicht portierten Strategien bleiben sichtbar, aber waehlbar
    // sind sie nicht. Sie wegzulassen wuerde die Arbeit kleiner aussehen
    // lassen, als sie ist; sie anzubieten waere gelogen.
    if (strategy.serverOnly) {
      option.disabled = true;
      option.textContent += " — full version only";
    }
    elements.strategy.append(option);
  }
  elements.strategy.value = "morton";
  updateStrategyDescription();
}

/** Der Katalog, den das Python-Backend unter /capabilities liefert. */
async function loadServerCapabilities() {
  const response = await fetch(`${apiBase}/capabilities`);
  if (!response.ok) throw new Error(await errorMessage(response));
  capabilities = await response.json();
  engine = "server";
  elements.version.textContent = `core ${capabilities.library_version}`;
  fillStrategySelect();
  applyEngineText();
}

/** Derselbe Katalog, aber aus browser-core.js statt aus der API. */
function loadBrowserCapabilities(reason) {
  const core = window.PointCloudCore;
  if (!core) throw new Error("browser-core.js was not loaded.");
  capabilities = {
    library_version: "browser-port",
    formats: ["ply-ascii", "xyz", "txt", "csv"],
    strategies: core.BROWSER_STRATEGIES.map((entry) => ({
      id: entry.id,
      description: `${entry.description} — ${entry.note}`,
      defaults: {},
    })).concat(
      core.SERVER_ONLY_STRATEGIES.map((entry) => ({
        id: entry.id,
        description: `Full version only: ${entry.reason}.`,
        defaults: {},
        serverOnly: true,
      })),
    ),
    limits: { points: core.MAX_POINTS },
  };
  engine = "browser";
  elements.version.textContent = "läuft lokal";
  fillStrategySelect();
  applyEngineText(reason);
}

/** Alle Texte, die sich zwischen den Betriebsarten unterscheiden. */
function applyEngineText(reason) {
  const browser = engine === "browser";
  elements.engineNote.textContent = browser
    ? "Die Berechnung läuft vollständig in diesem Browser. Dateien werden nicht hochgeladen."
    : "Die vollständige Version nutzt die Python-Bibliothek auf dem lokalen Server.";
  elements.engineNote.classList.toggle("browser", browser);

  if (elements.chunkFormats) {
    elements.chunkFormats.textContent = browser
      ? `ASCII-PLY, XYZ, TXT oder CSV mit maximal ${window.PointCloudCore.MAX_POINTS.toLocaleString("de-DE")} Punkten. `
        + "Die vollständige 12-Millionen-Punkte-Szene wäre für diese Browserdemo zu groß."
      : "PLY, NumPy und numerische Textformate bis 16 MB und 500.000 Punkte.";
  }
  elements.chunkButton.textContent = browser ? "Teilbereiche erzeugen" : "Archiv mit Teilbereichen erzeugen";
  elements.advancedParams.disabled = browser;
  if (browser) {
    elements.advancedParams.value = "Weitere Parameter stehen in der vollständigen Version bereit.";
  }

  if (elements.mergeLede) {
    elements.mergeLede.textContent = browser
      ? "Rebuild the cloud from the chunks by their stable source IDs and compare it point by point "
        + "with the original."
      : "Validate a toolkit ZIP and reconstruct the original PLY by stable source IDs.";
  }
  if (elements.mergeHeading) {
    elements.mergeHeading.textContent = browser ? "Reconstruct the cloud" : "Merge an archive";
  }
  elements.mergeButton.textContent = browser ? "Verify reconstruction" : "Merge and download";
  if (elements.archiveLabel) elements.archiveLabel.hidden = browser;
  elements.archiveName.hidden = browser;
  if (elements.reportButton) elements.reportButton.hidden = !browser;
  // Der Chunk-Bericht ist ein Erzeugnis des Browser-Kerns. In der Vollversion
  // steckt dieselbe Auskunft im Manifest des Archivs, also verschwindet die
  // ganze Karte statt einen leeren Knopf stehen zu lassen.
  const reportOption = document.querySelector("#report-option");
  if (reportOption) reportOption.hidden = !browser;

  // Die Liste der Merge-Regeln haengt an der Betriebsart: im Browser laufen vier,
  // in der Vollversion neun. Sie wird deshalb hier gefuellt und nicht einmalig
  // beim Laden der Seite.
  fillMergeSelect();
}

async function loadCapabilities() {
  if (config.mode === "browser") {
    loadBrowserCapabilities();
    return;
  }
  try {
    await loadServerCapabilities();
  } catch (error) {
    if (config.mode === "server") throw error;
    loadBrowserCapabilities("Kein Backend erreichbar");
  }
}

function updateStrategyDescription() {
  const selected = capabilities?.strategies.find((item) => item.id === elements.strategy.value);
  elements.strategyDescription.textContent = selected?.description || "";
  elements.overlap.disabled = elements.strategy.value === "xy";
  // Im Browser-Modus gibt es keine zusaetzlichen Parameter; das Feld traegt
  // dort einen Hinweis und darf nicht ueberschrieben werden.
  if (engine === "browser") return;
  const managed = new Set({
    xy: ["xy_nx", "xy_ny"],
    morton: ["morton_points", "morton_overlap"],
    kdtree: ["kdtree_point_max", "kdtree_overlap"],
    bisect_xy_overlap: ["bisect_max_points", "bisect_overlap"],
    rand_knn: ["rand_knn_max_points", "rand_knn_threshold"],
    rand_cyl: ["rand_cyl_max_points", "rand_cyl_threshold"],
  }[elements.strategy.value] || []);
  const advanced = Object.fromEntries(
    Object.entries(selected?.defaults || {}).filter(([name]) => !managed.has(name)),
  );
  elements.advancedParams.value = JSON.stringify(advanced, null, 2);
}

/**
 * Punktwolke im Browser lesen. Die Datei bleibt auf dem Geraet: der
 * File-Picker liefert sie direkt an FileReader, es gibt keinen Upload und
 * keine Netzwerkanfrage.
 */
async function inspectInBrowser(file) {
  const core = window.PointCloudCore;
  const text = await file.text();
  browserCloud = core.parsePointCloud(text, file.name);
  browserResult = null;
  return core.inspect(browserCloud, 1500);
}

/**
 * Ein Punktbudget, das groesser ist als die ganze Wolke, ergibt genau einen
 * Chunk - formal richtig und als Demonstration wertlos. In diesem einen Fall
 * wird das Budget vorgeschlagen statt stehengelassen, und der Hinweis sagt es.
 * Hat der Nutzer ein kleineres Budget gesetzt, bleibt es unangetastet.
 */
function proposePointBudget(pointCount) {
  const current = Number(elements.pointBudget.value);
  if (Number.isFinite(current) && current < pointCount) return null;
  // Die Rechnung selbst steht in browser-core.js: sie ist eine Aussage über
  // die Zerlegung, nicht über die Oberflaeche, und nur dort erreicht sie der
  // Aequivalenztest.
  const proposed = window.PointCloudCore.proposePointBudget(pointCount);
  elements.pointBudget.value = String(proposed);
  return proposed;
}

async function inspectSource(file) {
  setStatus(elements.chunkStatus, engine === "browser"
    ? "Reading the point cloud in the browser..."
    : "Inspecting point cloud...");
  elements.chunkButton.disabled = true;
  let info;
  if (engine === "browser") {
    info = await inspectInBrowser(file);
  } else {
    const response = await fetch(`${apiBase}/inspect`, {
      method: "POST",
      headers: fileHeaders(file),
      body: file,
    });
    if (!response.ok) throw new Error(await errorMessage(response));
    info = (await response.json()).point_cloud;
  }
  elements.metricPoints.textContent = Number(info.point_count).toLocaleString("en-US");
  elements.metricFields.textContent = info.fields.join(", ");
  const minimum = info.bounds.minimum;
  const maximum = info.bounds.maximum;
  const extent = maximum.map((value, index) => value - minimum[index]);
  elements.metricExtent.textContent = extent.map((value) => value.toFixed(1)).join(" x ");
  previewPoints = info.preview;
  scenePreviewPoints = info.preview;
  chunkPreviews = [];
  elements.chunkNavigator.hidden = true;
  elements.viewerEmpty.hidden = previewPoints.length > 0;
  drawPointCloud();
  elements.chunkButton.disabled = false;
  if (engine === "browser") {
    const proposed = proposePointBudget(info.point_count);
    setStatus(
      elements.chunkStatus,
      proposed
        ? `Ready. Point budget set to ${proposed.toLocaleString("en-US")} — the whole cloud would `
          + "otherwise fit into a single chunk."
        : "Ready. Pick a strategy and a point budget, then chunk.",
      "success",
    );
    return;
  }
  setStatus(elements.chunkStatus, "Ready to create a versioned chunk archive.", "success");
}

async function selectSource(file) {
  if (!file) return;
  sourceFile = file;
  resetDownstream();
  elements.sourceName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  try {
    await inspectSource(file);
  } catch (error) {
    sourceFile = null;
    previewPoints = [];
    drawPointCloud();
    setStatus(elements.chunkStatus, error.message, "error");
  }
}

function generatedSample() {
  // Der Browser-Kern erzeugt dieselbe Szene; eine Quelle statt zwei, damit
  // Server- und Browser-Modus garantiert dieselben Zahlen zeigen.
  if (window.PointCloudCore) {
    return new File([window.PointCloudCore.generatedSampleText()], "generated-terrain.ply",
                    { type: "application/octet-stream" });
  }
  const rows = [];
  for (let x = 0; x < 48; x += 1) {
    for (let y = 0; y < 48; y += 1) {
      const z = 3 * Math.sin(x / 6) + 2 * Math.cos(y / 7) + ((x > 30 && y > 25) ? 8 : 0);
      rows.push(`${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}`);
    }
  }
  const header = [
    "ply", "format ascii 1.0", `element vertex ${rows.length}`,
    "property float x", "property float y", "property float z", "end_header",
  ];
  return new File([[...header, ...rows].join("\n") + "\n"], "generated-terrain.ply", { type: "application/octet-stream" });
}

function initializeExamples() {
  if (!elements.examplePart) return;
  const examples = window.PCT_EXAMPLE_SCENES || [];
  elements.examplePart.replaceChildren();
  for (const [index, example] of examples.entries()) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${example.name} · ${Number(example.pointCount).toLocaleString("de-DE")} Punkte`;
    elements.examplePart.append(option);
  }
  if (!examples.length) {
    const option = document.createElement("option");
    option.value = "generated";
    option.textContent = "Generierte Beispielszene";
    elements.examplePart.append(option);
  }
}

function examplePartFile() {
  const examples = window.PCT_EXAMPLE_SCENES || [];
  const example = examples[Number(elements.examplePart?.value || 0)];
  if (!example) return generatedSample();
  return new File([example.ply], `${example.id}.ply`, { type: "application/octet-stream" });
}

/** Zerlegen im Browser: dieselben Metriken, aber im Speicher statt als ZIP. */
function buildChunksInBrowser() {
  const core = window.PointCloudCore;
  browserResult = core.chunk(browserCloud, {
    strategy: elements.strategy.value,
    targetPoints: Number(elements.pointBudget.value),
    overlap: Number(elements.overlap.value),
  });
  chunkPreviews = browserResult.chunks.map((entry) => ({
    id: entry.id,
    point_count: entry.point_count,
    preview: entry.preview,
  }));
  elements.chunkSelect.replaceChildren();
  for (const [index, entry] of chunkPreviews.entries()) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${entry.id} · ${Number(entry.point_count).toLocaleString("de-DE")} Punkte`;
    elements.chunkSelect.append(option);
  }
  elements.chunkNavigator.hidden = chunkPreviews.length === 0;
  if (chunkPreviews.length) showChunk(0);

  const metrics = browserResult.metrics;
  elements.mergeButton.disabled = false;
  if (elements.reportButton) elements.reportButton.disabled = false;
  setStatus(
    elements.chunkStatus,
    `${metrics.chunk_count} Teilbereiche · Redundanz ${metrics.redundancy_ratio.toFixed(2)} · `
      + `maximal ${metrics.maximum_coverage} lokale Sichten pro Punkt · kein Punkt verloren.`,
    "success",
  );
  afterDecompose();
}

async function buildArchive() {
  if (engine === "browser") {
    if (!browserCloud) return;
    elements.chunkButton.disabled = true;
    setStatus(elements.chunkStatus, "Chunking in the browser...");
    try {
      buildChunksInBrowser();
    } catch (error) {
      setStatus(elements.chunkStatus, error.message, "error");
    } finally {
      elements.chunkButton.disabled = false;
    }
    return;
  }
  if (!sourceFile) return;
  elements.chunkButton.disabled = true;
  setStatus(elements.chunkStatus, "Chunking on the Python backend...");
  const query = new URLSearchParams({
    strategy: elements.strategy.value,
    target_points: elements.pointBudget.value,
    overlap: elements.overlap.value,
    params: elements.advancedParams.value.trim() || "{}",
  });
  try {
    const response = await fetch(`${apiBase}/chunk?${query}`, {
      method: "POST",
      headers: fileHeaders(sourceFile),
      body: sourceFile,
    });
    if (!response.ok) throw new Error(await errorMessage(response));
    const blob = await response.blob();
    triggerDownload(blob, downloadName(response, "point-cloud-chunks.zip"));
    archiveFile = new File([blob], downloadName(response, "point-cloud-chunks.zip"), { type: "application/zip" });
    archiveBlob = archiveFile;
    elements.archiveName.textContent = `${archiveFile.name} (${(archiveFile.size / 1024).toFixed(1)} KB)`;
    elements.mergeButton.disabled = false;
    await loadChunkPreviews(archiveFile);
    const chunks = response.headers.get("X-Chunk-Count") || "?";
    const redundancy = response.headers.get("X-Redundancy-Ratio") || "?";
    setStatus(elements.chunkStatus, `Downloaded ${chunks} chunks. Redundancy ratio: ${redundancy}.`, "success");
    afterDecompose();
  } catch (error) {
    setStatus(elements.chunkStatus, error.message, "error");
  } finally {
    elements.chunkButton.disabled = !sourceFile;
  }
}

async function loadChunkPreviews(file) {
  const response = await fetch(`${apiBase}/archive-preview`, {
    method: "POST",
    headers: fileHeaders(file),
    body: file,
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  const payload = await response.json();
  chunkPreviews = payload.chunks || [];
  elements.chunkSelect.replaceChildren();
  for (const [index, chunk] of chunkPreviews.entries()) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${chunk.id} (${Number(chunk.point_count).toLocaleString("en-US")} points)`;
    elements.chunkSelect.append(option);
  }
  elements.chunkNavigator.hidden = chunkPreviews.length === 0;
  if (chunkPreviews.length) showChunk(0);
}

function showChunk(index) {
  if (!chunkPreviews.length) return;
  const bounded = Math.max(0, Math.min(chunkPreviews.length - 1, Number(index)));
  const chunk = chunkPreviews[bounded];
  elements.chunkSelect.value = String(bounded);
  previewPoints = chunk.preview;
  elements.chunkMeta.textContent = `${bounded + 1} of ${chunkPreviews.length}`;
  elements.previousChunk.disabled = bounded === 0;
  elements.nextChunk.disabled = bounded === chunkPreviews.length - 1;
  elements.viewerEmpty.hidden = previewPoints.length > 0;
  drawPointCloud();
}

/** Rekonstruktion im Browser: aus den Chunk-Koordinaten, nicht aus dem Original. */
function mergeInBrowser() {
  const core = window.PointCloudCore;
  elements.mergeButton.disabled = true;
  setStatus(elements.mergeStatus, "Rebuilding the cloud from the chunks by source ID...");
  try {
    const summary = core.merge(browserCloud, browserResult);
    setStatus(
      elements.mergeStatus,
      `Reconstructed ${summary.point_count.toLocaleString("en-US")} points, `
        + `${summary.identical_points.toLocaleString("en-US")} of them coordinate-identical, `
        + `${summary.duplicate_references.toLocaleString("en-US")} duplicate references resolved.`,
      summary.exact ? "success" : "error",
    );
  } catch (error) {
    setStatus(elements.mergeStatus, error.message, "error");
  } finally {
    elements.mergeButton.disabled = !browserResult;
  }
}

/** Der JSON-Bericht ist bewusst kein Archiv-Manifest, sondern ein Protokoll. */
function downloadChunkReport() {
  const core = window.PointCloudCore;
  const report = core.chunkReport(browserCloud, browserResult, sourceFile ? sourceFile.name : undefined);
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  triggerDownload(blob, "chunk-report.json");
  setStatus(elements.mergeStatus,
    "Chunk report downloaded — index lists and metrics, no coordinates.", "success");
}

async function mergeArchive() {
  if (engine === "browser") {
    if (!browserResult) return;
    mergeInBrowser();
    return;
  }
  if (!archiveFile) return;
  elements.mergeButton.disabled = true;
  setStatus(elements.mergeStatus, "Validating and reconstructing archive...");
  try {
    const response = await fetch(`${apiBase}/merge`, {
      method: "POST",
      headers: fileHeaders(archiveFile),
      body: archiveFile,
    });
    if (!response.ok) throw new Error(await errorMessage(response));
    triggerDownload(await response.blob(), downloadName(response, "merged-point-cloud.ply"));
    const points = response.headers.get("X-Point-Count") || "?";
    setStatus(elements.mergeStatus, `Reconstructed ${points} source points.`, "success");
  } catch (error) {
    setStatus(elements.mergeStatus, error.message, "error");
  } finally {
    elements.mergeButton.disabled = !archiveFile;
  }
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = elements.canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width * ratio));
  const height = Math.max(1, Math.floor(rect.height * ratio));
  if (elements.canvas.width !== width || elements.canvas.height !== height) {
    elements.canvas.width = width;
    elements.canvas.height = height;
  }
  drawPointCloud();
}

function drawPointCloud() {
  const canvas = elements.canvas;
  const context = canvas.getContext("2d");
  context.fillStyle = viewerBackground;
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (!previewPoints.length) return;

  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  for (const point of previewPoints) {
    for (let axis = 0; axis < 3; axis += 1) {
      minimum[axis] = Math.min(minimum[axis], point[axis]);
      maximum[axis] = Math.max(maximum[axis], point[axis]);
    }
  }
  const center = minimum.map((value, axis) => (value + maximum[axis]) / 2);
  const span = Math.max(...maximum.map((value, axis) => value - minimum[axis]), 1);
  const cosineYaw = Math.cos(view.yaw);
  const sineYaw = Math.sin(view.yaw);
  const pitch = resistPitch(view.pitchRaw);
  const cosinePitch = Math.cos(pitch);
  const sinePitch = Math.sin(pitch);
  const scale = Math.min(canvas.width, canvas.height) * 0.78 * view.zoom;
  const projected = [];

  for (const point of previewPoints) {
    const x = (point[0] - center[0]) / span;
    const y = (point[1] - center[1]) / span;
    const z = (point[2] - center[2]) / span;
    const rotatedX = x * cosineYaw - y * sineYaw;
    const rotatedY = x * sineYaw + y * cosineYaw;
    const screenY = rotatedY * cosinePitch - z * sinePitch;
    const depth = rotatedY * sinePitch + z * cosinePitch;
    projected.push({ x: rotatedX, y: screenY, depth, height: z, index: projected.length });
  }
  projected.sort((a, b) => a.depth - b.depth);
  for (const point of projected) {
    const lightness = 52 + Math.max(-18, Math.min(18, point.height * 42));
    context.fillStyle = pointColour(point, lightness);
    context.beginPath();
    context.arc(canvas.width / 2 + point.x * scale, canvas.height / 2 - point.y * scale, 2.1, 0, Math.PI * 2);
    context.fill();
  }
}

elements.sourceInput.addEventListener("change", () => selectSource(elements.sourceInput.files[0]));
elements.sampleButton.addEventListener("click", () => selectSource(examplePartFile()));
elements.strategy.addEventListener("change", updateStrategyDescription);
elements.chunkButton.addEventListener("click", buildArchive);
elements.archiveInput.addEventListener("change", () => {
  if (engine === "browser") return; // im Browser-Modus gibt es kein ZIP-Archiv
  archiveFile = elements.archiveInput.files[0] || null;
  elements.archiveName.textContent = archiveFile ? `${archiveFile.name} (${(archiveFile.size / 1024).toFixed(1)} KB)` : "No archive selected";
  elements.mergeButton.disabled = !archiveFile;
  archiveBlob = archiveFile;
  // Ein fremdes Archiv ist eine vollwertige Grundlage fuer Validate,
  // Recompose und Export — es muss nicht aus dieser Sitzung stammen.
  if (archiveFile) {
    afterDecompose();
    loadChunkPreviews(archiveFile).catch((error) => setStatus(elements.mergeStatus, error.message, "error"));
  }
});
elements.mergeButton.addEventListener("click", mergeArchive);
if (elements.reportButton) elements.reportButton.addEventListener("click", downloadChunkReport);
elements.chunkSelect.addEventListener("change", () => showChunk(elements.chunkSelect.value));
elements.previousChunk.addEventListener("click", () => showChunk(Number(elements.chunkSelect.value) - 1));
elements.nextChunk.addEventListener("click", () => showChunk(Number(elements.chunkSelect.value) + 1));
elements.sceneOverview.addEventListener("click", () => {
  previewPoints = scenePreviewPoints;
  elements.chunkMeta.textContent = "Full scene";
  drawPointCloud();
});

// --- Bildtakt --------------------------------------------------------------
// Ein einziger Frame-Takt fuer Nachlauf, Rueckfederung und Zoom. Ohne ihn
// wuerde ein schnelles pointermove mehrfach pro Frame zeichnen: Arbeit, die
// nie auf dem Bildschirm landet.

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function startLoop() {
  if (frameHandle !== null) return;
  lastFrameTime = performance.now();
  frameHandle = requestAnimationFrame(step);
}

function step(now) {
  frameHandle = null;
  const elapsed = Math.min(now - lastFrameTime, 50); // Sprung nach Tab-Wechsel begrenzen
  lastFrameTime = now;
  let running = false;

  if (!drag.active) {
    // Nachlauf: exponentieller Abfall, dieselbe Familie wie Apples Projektion
    if (Math.abs(momentum.yaw) > MOMENTUM_EPSILON || Math.abs(momentum.pitch) > MOMENTUM_EPSILON) {
      view.yaw += momentum.yaw * elapsed;
      view.pitchRaw += momentum.pitch * elapsed;
      const decay = DECELERATION ** elapsed;
      momentum.yaw *= decay;
      momentum.pitch *= decay;
      running = true;
    }

    // Rueckfederung, sobald der Nachlauf die Grenze ueberschritten hat
    const settled = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, view.pitchRaw));
    if (view.pitchRaw !== settled) {
      momentum.pitch = 0;
      view.pitchRaw += (settled - view.pitchRaw) * approach(elapsed, PITCH_TAU);
      if (Math.abs(settled - view.pitchRaw) < PITCH_REST) view.pitchRaw = settled;
      running = true;
    }
  }

  // Zoom laeuft immer auf sein Ziel zu - auch waehrend gezogen wird, damit
  // ein Rad-Impuls mitten in der Drehung nicht warten muss.
  if (Math.abs(view.zoomTarget - view.zoom) > ZOOM_REST) {
    view.zoom += (view.zoomTarget - view.zoom) * approach(elapsed, ZOOM_TAU);
    running = true;
  } else {
    view.zoom = view.zoomTarget;
  }

  drawPointCloud();
  if (running) frameHandle = requestAnimationFrame(step);
}

// --- Zeigergesten ----------------------------------------------------------

elements.canvas.addEventListener("pointerdown", (event) => {
  // Eine laufende Bewegung wird sofort abgefangen und uebernommen. Der
  // Nutzer greift die Szene dort, wo sie gerade steht.
  momentum.yaw = 0;
  momentum.pitch = 0;

  drag.active = true;
  drag.pointerId = event.pointerId;
  drag.x = event.clientX;
  drag.y = event.clientY;
  drag.samples = [{ x: event.clientX, y: event.clientY, time: event.timeStamp }];
  elements.canvas.setPointerCapture(event.pointerId);
});

elements.canvas.addEventListener("pointermove", (event) => {
  if (!drag.active || event.pointerId !== drag.pointerId) return;

  view.yaw += (event.clientX - drag.x) * RADIANS_PER_PIXEL;
  view.pitchRaw += (event.clientY - drag.y) * RADIANS_PER_PIXEL;
  drag.x = event.clientX;
  drag.y = event.clientY;

  // Kurze Historie statt nur des letzten Punktes: eine einzelne Differenz
  // ist zu verrauscht, um daraus die Wurfgeschwindigkeit abzuleiten.
  drag.samples.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
  if (drag.samples.length > 6) drag.samples.shift();

  startLoop();
});

function endDrag(event) {
  if (!drag.active || event.pointerId !== drag.pointerId) return;
  drag.active = false;
  drag.pointerId = null;

  // Geschwindigkeit beim Loslassen uebergeben, damit zwischen Ziehen und
  // Nachlauf keine sichtbare Naht entsteht.
  const first = drag.samples[0];
  const last = drag.samples[drag.samples.length - 1];
  const span = last && first ? last.time - first.time : 0;
  if (!reducedMotion() && span > 8) {
    const clamp = (value) => Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, value));
    momentum.yaw = clamp(((last.x - first.x) * RADIANS_PER_PIXEL) / span);
    momentum.pitch = clamp(((last.y - first.y) * RADIANS_PER_PIXEL) / span);
  }
  drag.samples = [];
  startLoop();
}

elements.canvas.addEventListener("pointerup", endDrag);
elements.canvas.addEventListener("pointercancel", endDrag);

elements.canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const factor = event.deltaY > 0 ? 0.9 : 1.1;
  view.zoomTarget = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, view.zoomTarget * factor));
  if (reducedMotion()) view.zoom = view.zoomTarget;
  startLoop();
}, { passive: false });

// --- Theme ------------------------------------------------------------------
// Die Canvas-Flaeche kennt keine CSS-Variablen, also wird der Wert einmal
// ausgelesen und bei jedem Theme-Wechsel neu geholt.

function readViewerBackground() {
  const value = getComputedStyle(elements.canvas).getPropertyValue("--viewer-bg").trim();
  if (value) viewerBackground = value;
  drawPointCloud();
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readViewerBackground);
readViewerBackground();

new ResizeObserver(resizeCanvas).observe(elements.canvas);
loadCapabilities().then(() => {
  initializeExamples();
  const example = examplePartFile();
  if (example) return selectSource(example);
  return undefined;
}).catch((error) => {
  elements.version.textContent = "core unavailable";
  setStatus(elements.chunkStatus, error.message, "error");
});

// ===========================================================================
// Schritt 03 bis 06 und der Forschungsbereich
// ===========================================================================
//
// Der Ablauf ist bewusst linear: eine Quelle, eine Zerlegung, dann die drei
// Schritte, die auf ihr aufbauen. Jeder von ihnen bleibt gesperrt, bis es etwas
// zu tun gibt — ein Knopf, der nichts kann, ist schlimmer als kein Knopf.
//
// Beide Betriebsarten liefern dieselbe Datenform: das Backend über seine
// Routen, der Browser über `browser-core.js`. Deshalb gibt es für das Zeichnen
// der Ergebnisse nur einen Weg und nicht zwei.

let archiveBlob = null;      // das ZIP, das Validate/Recompose/Export brauchen
let lastValidation = null;
let lastRecompose = null;
let lastAnalysis = null;

// Farbe je Vorschaupunkt. Gesetzt, sobald eine Rekomposition vorliegt; bis dahin
// färbt die Höhe, wie vorher.
let colourMode = "height";
let previewColours = null;

/** Neun Klassenfarben. Gleichmässig über den Farbkreis, feste Zuordnung. */
const CLASS_COLOURS = [
  "hsl(0 0% 62%)", "hsl(32 52% 48%)", "hsl(128 46% 40%)", "hsl(205 62% 52%)",
  "hsl(262 46% 56%)", "hsl(52 72% 46%)", "hsl(338 48% 52%)", "hsl(178 48% 42%)",
  "hsl(16 62% 48%)",
];

function pointColour(point, lightness) {
  if (previewColours && colourMode !== "height") {
    const value = previewColours[point.index];
    if (value !== undefined) return value;
  }
  return `hsl(${154 + point.height * 55} 64% ${lightness}%)`;
}

function clearElement(element) {
  if (element) element.replaceChildren();
}

/** Ein Element mit Klasse und Text in einem Schritt. */
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "–";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

/** Eine neue Quelle macht alles ungültig, was auf der alten Zerlegung stand. */
function resetDownstream() {
  archiveBlob = null;
  lastValidation = null;
  lastRecompose = null;
  lastAnalysis = null;
  previewColours = null;
  colourMode = "height";
  for (const button of [elements.validateRun, elements.recomposeRun, elements.recomposeCompare,
                        elements.exportArchive, elements.exportMerged, elements.exportBundle]) {
    if (button) button.disabled = true;
  }
  if (elements.analyzeRun) elements.analyzeRun.disabled = !sourceFile && !browserCloud;
  clearElement(elements.validateReport);
  if (elements.recomposeResult) elements.recomposeResult.hidden = true;
  if (elements.analyzeResult) elements.analyzeResult.hidden = true;
  if (elements.viewerModes) elements.viewerModes.hidden = true;
  if (elements.validateStatus) setStatus(elements.validateStatus, "Decompose first.");
  if (elements.recomposeStatus) setStatus(elements.recomposeStatus, "Decompose first.");
  if (elements.exportSchema) elements.exportSchema.textContent = "–";
  if (elements.exportHashes) elements.exportHashes.textContent = "–";
}

/** Nach einer erfolgreichen Zerlegung geben die Folgeschritte frei. */
function afterDecompose() {
  const ready = engine === "browser" ? Boolean(browserResult) : Boolean(archiveBlob);
  for (const button of [elements.validateRun, elements.recomposeRun, elements.recomposeCompare]) {
    if (button) button.disabled = !ready;
  }
  if (elements.exportMerged) elements.exportMerged.disabled = !ready;
  if (elements.exportBundle) elements.exportBundle.disabled = true;
  if (elements.exportArchive) elements.exportArchive.disabled = !ready;
  if (elements.analyzeRun) elements.analyzeRun.disabled = false;
  if (elements.reportButton) elements.reportButton.disabled = engine !== "browser" || !browserResult;
  if (elements.validateStatus) setStatus(elements.validateStatus, "Ready to validate.");
  if (elements.recomposeStatus) setStatus(elements.recomposeStatus, "Ready to recompose.");

  if (elements.exportSchema) {
    elements.exportSchema.textContent = engine === "browser"
      ? "no archive in browser mode"
      : "version 1, in manifest.json";
  }
  if (elements.exportHashes) {
    elements.exportHashes.textContent = engine === "browser"
      ? "full version only"
      : "SHA-256 per chunk";
  }
}

// --------------------------------------------------------------- Navigation

function showView(name) {
  for (const tab of document.querySelectorAll(".view-tab")) {
    const active = tab.dataset.view === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", active ? "true" : "false");
  }
  const workflow = document.querySelector("#view-workflow");
  const research = document.querySelector("#view-research");
  if (workflow) workflow.hidden = name !== "workflow";
  if (research) research.hidden = name !== "research";
}

function showResearchPanel(name) {
  for (const chip of document.querySelectorAll("[data-research]")) {
    chip.classList.toggle("is-active", chip.dataset.research === name);
  }
  for (const panel of document.querySelectorAll("[data-panel]")) {
    panel.hidden = panel.dataset.panel !== name;
  }
}

// ------------------------------------------------------------- 03 Validate

async function runValidate() {
  elements.validateRun.disabled = true;
  setStatus(elements.validateStatus, "Checking the decomposition...");
  try {
    if (engine === "browser") {
      lastValidation = window.PointCloudCore.validateChunkResult(browserCloud, browserResult);
    } else {
      const response = await fetch(`${apiBase}/validate`, {
        method: "POST",
        headers: fileHeaders(archiveBlob),
        body: archiveBlob,
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      lastValidation = await response.json();
    }
    renderValidation(lastValidation);
    const summary = lastValidation.summary;
    setStatus(
      elements.validateStatus,
      `${summary.passed} of ${summary.total} checks passed.`
        + (summary.failed.length ? ` Failed: ${summary.failed.join(", ")}.` : ""),
      summary.status === "PASS" ? "success" : "error",
    );
  } catch (error) {
    setStatus(elements.validateStatus, error.message, "error");
  } finally {
    elements.validateRun.disabled = false;
  }
}

/** Die Prüfungen als Befundliste, nicht als Rohausgabe eines Skripts. */
function renderValidation(report) {
  clearElement(elements.validateReport);
  for (const check of report.checks) {
    const row = node("div", `check check-${check.status.toLowerCase()}`);
    row.append(node("span", "check-status", check.status));
    const body = node("div", "check-body");
    body.append(node("span", "check-id", check.id.replaceAll("_", " ")));
    body.append(node("p", "check-detail", check.detail));
    row.append(body);
    elements.validateReport.append(row);
  }
  if (report.metrics && report.metrics.chunk_count) {
    const metrics = report.metrics;
    const summary = node("p", "hint",
      `${formatNumber(metrics.chunk_count)} chunks · `
      + `${formatNumber(metrics.point_references)} point references · `
      + `redundancy ${metrics.redundancy_ratio.toFixed(4)} · `
      + `maximum coverage ${metrics.maximum_coverage}`);
    elements.validateReport.append(summary);
  }
}

// ------------------------------------------------------------ 04 Recompose

/**
 * Den Katalog der Merge-Regeln aus dem Fähigkeitenregister bilden.
 *
 * Das Register entsteht aus `MERGER_SPECS` und `EXPERIMENTAL_MERGER_SPECS` der
 * Bibliothek. Eine neue Regel dort erscheint damit auch im Browser-Modus, ohne
 * dass hier eine zweite Liste gepflegt werden muss.
 */
function mergersFromRegistry(core) {
  const rows = (registry() && registry().capabilities) || [];
  // Erkannt wird eine Merge-Regel an ihrer Implementierung, nicht am Namen: die
  // experimentellen Cluster-Chunker heissen genauso `lab.experimental_…` wie die
  // experimentellen Merge-Regeln, liegen aber in einer anderen Datei.
  const found = rows
    .filter((row) => row.canonical.includes("experimental_mergers.py")
      || row.canonical.includes("merge.py") && row.id.startsWith("recompose."))
    .map((row) => ({
      id: row.id.split(".").slice(1).join("."),
      experimental: row.canonical.includes("experimental_mergers.py"),
      description: row.note || row.capability,
      rationale: "",
    }))
    .filter((entry) => core.EVALUATED_MERGERS.indexOf(entry.id) >= 0
      || entry.id.startsWith("experimental_"));
  if (found.length) return found;
  // Ohne Register bleiben die vier, die der Port wirklich rechnet.
  return core.EVALUATED_MERGERS.map((id) => ({
    id, experimental: false, description: "Evaluated merge rule of the thesis.", rationale: "",
  }));
}

function fillMergeSelect() {
  if (!elements.recomposeMethod) return;
  const core = window.PointCloudCore;
  // Im Browser-Modus liefert kein Backend den Katalog. Die neun Regeln stehen
  // aber im Register, das aus der Bibliothek erzeugt wird — also von dort, damit
  // die Liste nicht driften kann. Sie alle zu zeigen ist Absicht: fünf davon
  // laufen hier nicht, und das sichtbar zu sperren sagt mehr als sie wegzulassen.
  const mergers = (capabilities && capabilities.mergers) || mergersFromRegistry(core);

  elements.recomposeMethod.replaceChildren();
  for (const merger of mergers) {
    if (core.EVALUATED_MERGERS.indexOf(merger.id) < 0) continue;
    const option = document.createElement("option");
    option.value = merger.id;
    option.textContent = ({
      majority: "Mehrheit",
      distance: "Abstand zum Mittelpunkt",
      confidence: "Vertrauen",
      distance_confidence: "Abstand und Vertrauen",
    })[merger.id] || merger.id.replaceAll("_", " ")
      + (merger.experimental ? " — experimental" : "");
    // Die fünf experimentellen Regeln laufen nur in der Vollversion. Sie bleiben
    // sichtbar: sie gehören zur Arbeit, und sie zu verstecken liesse sie kleiner
    // aussehen, als sie ist.
    elements.recomposeMethod.append(option);
  }
  elements.recomposeMethod.value = "confidence";
  updateMergeDescription();

  if (elements.recomposeCrfEnable) {
    elements.recomposeCrfEnable.disabled = true;
    elements.recomposeCrf.classList.add("is-disabled");
  }
}

function updateMergeDescription() {
  if (!elements.recomposeMethodDescription) return;
  const chosen = elements.recomposeMethod.value;
  const mergers = (capabilities && capabilities.mergers) || [];
  const merger = mergers.find((entry) => entry.id === chosen);
  elements.recomposeMethodDescription.textContent = ({
    majority: "Jede lokale Vorhersage hat genau eine Stimme.",
    distance: "Vorhersagen nahe der Mitte eines Teilbereichs zählen stärker.",
    confidence: "Sichere Vorhersagen zählen stärker.",
    distance_confidence: "Räumliche Lage und Sicherheit bestimmen gemeinsam das Gewicht.",
  })[chosen] || (merger ? [merger.description, merger.rationale].filter(Boolean).join(" ") : "");
}

async function runRecompose(compareAll) {
  elements.recomposeRun.disabled = true;
  elements.recomposeCompare.disabled = true;
  setStatus(elements.recomposeStatus, compareAll
    ? "Recomposing with every available rule..."
    : "Recomposing...");
  try {
    const core = window.PointCloudCore;
    const decimals = Number(elements.recomposeDecimals.value);
    const power = Number(elements.recomposePower.value);
    const methods = compareAll
      ? core.EVALUATED_MERGERS.slice()
      : [elements.recomposeMethod.value];

    if (engine === "browser") {
      lastRecompose = core.recompose(browserCloud, browserResult, {
        methods,
        decimals,
        confidencePower: power,
        errorProbability: Number(elements.errorRate?.value || 0),
        errorAmplitude: Number(elements.errorAmplitude?.value || 0),
        sourceName: sourceFile ? sourceFile.name : "generated sample",
      });
    } else {
      const query = new URLSearchParams({
        methods: methods.join(","),
        decimals: String(decimals),
        confidence_power: String(power),
        crf_iters: elements.recomposeCrfEnable && elements.recomposeCrfEnable.checked ? "3" : "0",
      });
      const response = await fetch(`${apiBase}/recompose?${query}`, {
        method: "POST",
        headers: fileHeaders(archiveBlob),
        body: archiveBlob,
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      lastRecompose = await response.json();
    }
    renderRecompose(lastRecompose);
    if (elements.exportBundle) elements.exportBundle.disabled = false;
    setStatus(
      elements.recomposeStatus,
      `${formatNumber(lastRecompose.preview.point_count)} Punkte aus `
        + `${lastRecompose.predictions.tiles} lokalen Vorhersagen zusammengeführt.`,
      "success",
    );
  } catch (error) {
    setStatus(elements.recomposeStatus, error.message, "error");
  } finally {
    elements.recomposeRun.disabled = false;
    elements.recomposeCompare.disabled = false;
  }
}

function renderRecompose(result) {
  elements.recomposeResult.hidden = false;

  // --- Mehrfachabdeckung. Die Zahl, die erklaert, warum es diesen Schritt gibt.
  elements.supportNote.textContent = result.support.multiple > 0
    ? `${formatNumber(result.support.multiple)} von ${formatNumber(result.source.point_count)} Punkten liegen in mehreren Teilbereichen. Hier können die Vereinigungsregeln Fehler ausgleichen.`
    : "Diese Zerlegung überlappt nicht. Jeder Punkt besitzt nur eine lokale Vorhersage.";
  clearElement(elements.supportBars);
  const maximum = Math.max(...result.support.histogram.map((row) => row.points), 1);
  for (const row of result.support.histogram) {
    const bar = node("div", "bar");
    bar.append(node("span", "bar-label", `${row.predictions}×`));
    const track = node("span", "bar-track");
    const fill = node("span", "bar-fill");
    fill.style.width = `${Math.max(1, (row.points / maximum) * 100)}%`;
    track.append(fill);
    bar.append(track);
    bar.append(node("span", "bar-count", formatNumber(row.points)));
    elements.supportBars.append(bar);
  }

  // --- Ergebnis je Regel.
  const body = elements.recomposeTable.querySelector("tbody");
  clearElement(body);
  const entries = Object.values(result.methods);
  for (const entry of entries) {
    const row = document.createElement("tr");
    const name = node("td", "", ({
      majority: "Mehrheit",
      distance: "Abstand",
      confidence: "Vertrauen",
      distance_confidence: "Abstand und Vertrauen",
    })[entry.id] || entry.id.replaceAll("_", " "));
    if (entry.experimental) name.append(node("span", "tag t-experimental", "experimental"));
    if (entry.id === result.best_evaluated) name.append(node("span", "tag t-best", "bestes Ergebnis"));
    row.append(name);
    row.append(node("td", "", formatNumber(entry.merged_points)));
    row.append(node("td", "", entry.overall_accuracy === undefined
      ? "–" : `${(entry.overall_accuracy * 100).toFixed(2)} %`));
    row.append(node("td", "", entry.mean_iou === undefined
      ? "–" : entry.mean_iou.toFixed(4)));
    row.append(node("td", "", entry.mean_confidence.toFixed(4)));
    body.append(row);
  }

  const experimental = entries.filter((entry) => entry.experimental).length;
  elements.recomposeCaveat.textContent =
    "Die Kennzahlen beziehen sich auf die hier kontrolliert erzeugten Fehler. "
    + "So wird sichtbar, welche Vereinigungsregel Fehler in überlappenden Bereichen am besten ausgleicht."
    + (experimental ? ` ${experimental} experimentelle Regeln bleiben außerhalb dieses Vergleichs.` : "");

  elements.recomposeIdentity.textContent =
    `Punktidentität: ${formatNumber(result.identity.source_points)} Ausgangspunkte und `
    + `${formatNumber(result.identity.merged_points)} Punkte nach dem Zusammenführen.`;

  // --- Der Viewer kann jetzt nach Klasse und Support färben.
  applyRecomposeColours(result);
}

/**
 * Die zusammengeführte Szene in den Viewer bringen.
 *
 * Die Vorschau der Rekomposition ist eine eigene Stichprobe mit eigener
 * Reihenfolge, also wird sie als Punktmenge übernommen und nicht über die alte
 * gelegt — sonst zeigte die Farbe auf den falschen Punkt.
 */
function applyRecomposeColours(result) {
  const preview = result.preview;
  if (!preview || !preview.points.length) return;
  previewPoints = preview.points;
  scenePreviewPoints = preview.points;
  elements.viewerEmpty.hidden = true;
  elements.viewerModes.hidden = false;

  const maxSupport = Math.max(...preview.support, 1);
  elements.viewerModes.dataset.labels = JSON.stringify(preview.label);
  elements.viewerModes.dataset.support = JSON.stringify(preview.support);
  for (const chip of elements.viewerModes.querySelectorAll("[data-colour]")) {
    chip.disabled = false;
  }
  setColourMode("label", preview, maxSupport);
}

function setColourMode(mode, preview, maxSupport) {
  colourMode = mode;
  for (const chip of elements.viewerModes.querySelectorAll("[data-colour]")) {
    chip.classList.toggle("is-active", chip.dataset.colour === mode);
  }
  if (mode === "height" || !preview) {
    previewColours = null;
  } else if (mode === "label") {
    previewColours = preview.label.map((value) => CLASS_COLOURS[value % CLASS_COLOURS.length]);
  } else {
    previewColours = preview.support.map((value) => {
      const share = maxSupport > 1 ? (value - 1) / (maxSupport - 1) : 0;
      return `hsl(${210 - share * 190} 70% ${58 - share * 14}%)`;
    });
  }
  drawPointCloud();
}

// -------------------------------------------------------------- 05 Analyze

async function runAnalyze() {
  elements.analyzeRun.disabled = true;
  setStatus(elements.analyzeStatus, "Analyzing...");
  try {
    const core = window.PointCloudCore;
    const budget = Number(elements.pointBudget.value);
    if (engine === "browser") {
      const density = core.densityEstimate(browserCloud);
      const derived = core.deriveParameters(density, budget);
      // Der Browser-Parser liest nur Koordinaten. Ein Klassenfeld der Quelle
      // kennt er nicht — wohl aber die zusammengeführten Klassen, sobald eine
      // Rekomposition vorliegt. Das ist eine echte Verteilung, nur eine andere,
      // und sie wird als solche benannt.
      const classes = lastRecompose
        ? Object.assign(core.classHistogram(lastRecompose.preview.label), {
          field: "merged prediction",
        })
        : {
          available: false,
          what: "Class distribution",
          missing: "The browser parser reads coordinates only. Run Recompose to get the "
            + "distribution of the merged classes instead.",
        };
      lastAnalysis = {
        source: { name: sourceFile ? sourceFile.name : "generated sample", fields: browserCloud.fields },
        density, derived, classes,
        confusion: {
          available: false,
          what: "Confusion matrix",
          missing: "Needs a prediction and a reference. Recompose computes both; the measured "
            + "confusions of the thesis are in Research & Engineering.",
        },
      };
    } else {
      const query = new URLSearchParams({ target_points: String(budget) });
      const response = await fetch(`${apiBase}/analyze?${query}`, {
        method: "POST",
        headers: fileHeaders(sourceFile),
        body: sourceFile,
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      lastAnalysis = await response.json();
    }
    renderAnalysis(lastAnalysis);
    setStatus(elements.analyzeStatus, "Done.", "success");
  } catch (error) {
    setStatus(elements.analyzeStatus, error.message, "error");
  } finally {
    elements.analyzeRun.disabled = false;
  }
}

function renderAnalysis(analysis) {
  elements.analyzeResult.hidden = false;

  clearElement(elements.analyzeDensity);
  const density = analysis.density;
  const rows = [
    ["Points", formatNumber(density.point_count)],
    ["Footprint", `${formatNumber(density.footprint_area, 1)} m²`],
    ["Points per m²", formatNumber(density.points_per_area, 3)],
    ["Points per m³", formatNumber(density.points_per_volume, 4)],
    ["Mean spacing", `${formatNumber(density.mean_spacing_estimate, 3)} m`],
    ["Flatness (z / longest)", formatNumber(density.flatness, 3)],
  ];
  for (const [label, value] of rows) {
    const wrapper = node("div");
    wrapper.append(node("dt", "", label));
    wrapper.append(node("dd", "", value));
    elements.analyzeDensity.append(wrapper);
  }

  clearElement(elements.analyzeSuggest);
  const derived = analysis.derived;
  if (!derived.available) {
    elements.analyzeSuggest.append(node("p", "hint", derived.reason));
  } else {
    elements.analyzeSuggest.append(node("p", "",
      `Edge length ${formatNumber(derived.derived_edge_length, 2)} m from a budget of `
      + `${formatNumber(derived.point_budget)} points at `
      + `${formatNumber(derived.points_per_area, 3)} points per m².`));
    const list = node("dl", "mechanics");
    for (const [strategy, suggestion] of Object.entries(derived.suggestions)) {
      const values = Object.entries(suggestion)
        .filter(([key]) => key !== "explanation")
        .map(([key, value]) => `${key} = ${value}`)
        .join(", ");
      list.append(node("dt", "", strategy));
      const definition = node("dd", "", values);
      if (suggestion.explanation) {
        definition.append(node("p", "hint", suggestion.explanation));
      }
      list.append(definition);
    }
    elements.analyzeSuggest.append(list);
    elements.analyzeSuggest.append(node("p", "hint", derived.note));
    const apply = node("button", "button secondary", "Apply to the decompose step");
    apply.type = "button";
    apply.addEventListener("click", () => {
      elements.pointBudget.value = String(derived.point_budget);
      setStatus(elements.chunkStatus,
        `Point budget set to ${formatNumber(derived.point_budget)} from the density estimate.`,
        "success");
      document.querySelector("#decompose-heading").scrollIntoView({ behavior: "smooth" });
    });
    elements.analyzeSuggest.append(apply);
  }

  renderClassBlock(elements.analyzeClasses, analysis.classes);
  renderConfusionBlock(elements.analyzeConfusion, analysis.confusion);
}

function renderClassBlock(target, classes) {
  clearElement(target);
  if (!classes || !classes.available) {
    target.append(unavailableNote(classes));
    return;
  }
  if (classes.field) {
    target.append(node("p", "hint", `Field: ${classes.field}`));
  }
  const maximum = Math.max(...classes.rows.map((row) => row.points), 1);
  for (const row of classes.rows) {
    const bar = node("div", "bar");
    bar.append(node("span", "bar-label", row.name));
    const track = node("span", "bar-track");
    const fill = node("span", "bar-fill");
    fill.style.width = `${Math.max(1, (row.points / maximum) * 100)}%`;
    fill.style.background = CLASS_COLOURS[row.class % CLASS_COLOURS.length];
    track.append(fill);
    bar.append(track);
    bar.append(node("span", "bar-count", `${(row.share * 100).toFixed(2)} %`));
    target.append(bar);
  }
  target.append(node("p", "hint",
    `${classes.classes_present} classes present, most frequent to least frequent by a factor of `
    + `${formatNumber(classes.imbalance, 1)}. Class imbalance is the reason the loss was weighted `
    + "by inverse frequency and why mean IoU sits far below overall accuracy."));
}

function renderConfusionBlock(target, confusion) {
  clearElement(target);
  if (!confusion || !confusion.available) {
    target.append(unavailableNote(confusion));
    // Die gemessene Confusion der Arbeit liegt bei. Sie gehört nicht in diesen
    // Schritt — dort ginge es um die geladene Wolke —, aber der Hinweis darauf
    // schon, sonst sieht es aus als gäbe es keine.
    const evidence = window.PointCloudEvidence;
    if (evidence && evidence.confusion) {
      const link = node("button", "button secondary", "Show the measured confusions instead");
      link.type = "button";
      link.addEventListener("click", () => {
        showView("research");
        showResearchPanel("diagnostics");
      });
      target.append(link);
    }
    return;
  }
  target.append(confusionTable(confusion.matrix, confusion.class_names));
}

function unavailableNote(block) {
  const note = node("div", "unavailable");
  note.append(node("strong", "", (block && block.what) || "Not available"));
  note.append(node("p", "", (block && block.missing) || "No data for this metric."));
  return note;
}

/** Zeilen sind die Wahrheit, Spalten die Vorhersage. */
function confusionTable(matrix, classNames) {
  const wrapper = node("div", "wrap");
  const table = node("table", "confusion");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(node("th", "", "truth \\ prediction"));
  for (const name of classNames) headRow.append(node("th", "", name));
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  const totals = matrix.map((row) => row.reduce((sum, value) => sum + value, 0));
  const largest = Math.max(...totals, 1);
  matrix.forEach((row, index) => {
    const line = document.createElement("tr");
    line.append(node("th", "", classNames[index] || String(index)));
    row.forEach((value, column) => {
      const share = totals[index] ? value / totals[index] : 0;
      const cell = node("td", index === column ? "diagonal" : "", value ? formatNumber(value) : "·");
      cell.style.background = value
        ? `color-mix(in oklab, ${index === column ? "#2f7d4f" : "#b63a3a"} ${Math.round(share * 70)}%, transparent)`
        : "transparent";
      cell.title = `${(share * 100).toFixed(2)} % of ${classNames[index]}`;
      line.append(cell);
    });
    body.append(line);
  });
  table.append(body);
  wrapper.append(table);
  wrapper.append(node("p", "hint",
    `Row sums between ${formatNumber(Math.min(...totals))} and ${formatNumber(largest)} points.`));
  return wrapper;
}

// --------------------------------------------------------------- 06 Export

async function downloadArchive() {
  if (engine === "browser") {
    if (!browserResult) return;
    const report = window.PointCloudCore.chunkReport(
      browserCloud, browserResult, sourceFile ? sourceFile.name : undefined,
    );
    triggerDownload(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
      "zerlegungsplan.json",
    );
    setStatus(elements.mergeStatus, "Zerlegungsplan heruntergeladen.", "success");
    return;
  }
  if (!archiveBlob) return;
  triggerDownload(archiveBlob, archiveBlob.name || "point-cloud-chunks.zip");
  setStatus(elements.mergeStatus, "Archive downloaded.", "success");
}

async function downloadMerged() {
  if (engine === "browser") {
    if (!browserCloud || !browserResult) return;
    const rows = [
      "ply", "format ascii 1.0",
      "comment reconstructed in the Point Cloud Toolkit browser demo",
      `element vertex ${browserCloud.n}`,
      "property float x", "property float y", "property float z", "end_header",
    ];
    for (let index = 0; index < browserCloud.n; index += 1) {
      rows.push(`${browserCloud.x[index]} ${browserCloud.y[index]} ${browserCloud.z[index]}`);
    }
    triggerDownload(
      new Blob([rows.join("\n") + "\n"], { type: "application/octet-stream" }),
      "rekonstruierte-szene.ply",
    );
    setStatus(elements.mergeStatus, "Rekonstruierte Szene heruntergeladen.", "success");
    return;
  }
  await mergeArchive();
}

async function downloadBundle() {
  if (engine === "browser") {
    if (!lastRecompose) return;
    const rows = [["Regel", "Punkte", "Trefferquote", "Mittlere IoU", "Mittleres Vertrauen"]];
    for (const entry of Object.values(lastRecompose.methods)) {
      rows.push([
        entry.id,
        entry.merged_points,
        entry.overall_accuracy ?? "",
        entry.mean_iou ?? "",
        entry.mean_confidence,
      ]);
    }
    const csv = rows.map((row) => row.map((value) => JSON.stringify(value)).join(",")).join("\n") + "\n";
    triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), "vergleich-vereinigungsregeln.csv");
    setStatus(elements.mergeStatus, "Regelvergleich heruntergeladen.", "success");
    return;
  }
  if (!archiveBlob) return;
  elements.exportBundle.disabled = true;
  setStatus(elements.mergeStatus, "Building the review bundle...");
  try {
    const query = new URLSearchParams({
      methods: elements.recomposeMethod.value,
      decimals: String(Number(elements.recomposeDecimals.value)),
    });
    const response = await fetch(`${apiBase}/export?${query}`, {
      method: "POST",
      headers: fileHeaders(archiveBlob),
      body: archiveBlob,
    });
    if (!response.ok) throw new Error(await errorMessage(response));
    triggerDownload(await response.blob(), downloadName(response, "review-bundle.zip"));
    const points = response.headers.get("X-Point-Count") || "?";
    setStatus(elements.mergeStatus,
      `Bundle with four views over ${points} points downloaded.`, "success");
  } catch (error) {
    setStatus(elements.mergeStatus, error.message, "error");
  } finally {
    elements.exportBundle.disabled = false;
  }
}

// =========================================================================
// Research & Engineering
// =========================================================================
//
// Alles hier ist datengetrieben: `evidence.js` traegt die Messergebnisse,
// `capabilities.js` das Register. Beide sind klassische Skripte und keine
// `fetch`-Ziele, damit der Bereich auch nach einem Doppelklick auf index.html
// funktioniert — ab file:// ist fetch auf lokale Dateien blockiert.

function evidence() {
  return window.PointCloudEvidence || null;
}

function registry() {
  return window.PointCloudCapabilities || null;
}

/**
 * Ein Engineering-Block: Problem, Untersuchung, Ergebnis, Entscheidung.
 *
 * Diese vier Felder sind die Form, in der sich technische Arbeit erzaehlen
 * laesst, ohne in eine Zahlenwand zu verfallen. Jeder Block nennt zum Schluss
 * seine Quelle im Thesis-Repository.
 */
function storyBlock(block, extra) {
  const section = node("section", "story");
  section.append(node("h3", "", block.title));
  const grid = node("div", "story-grid");
  for (const [label, key] of [["Problem", "problem"], ["Investigation", "investigation"],
                              ["Result", "result"], ["Decision", "decision"]]) {
    if (!block[key]) continue;
    const cell = node("div", `story-cell story-${key}`);
    cell.append(node("span", "eyebrow", label));
    cell.append(node("p", "", block[key]));
    grid.append(cell);
  }
  section.append(grid);
  if (extra) section.append(extra);
  const sources = Array.isArray(block.source) ? block.source : [block.source];
  section.append(node("p", "provenance",
    `Measured data: ${sources.filter(Boolean).join(" · ")} (thesis repository)`));
  return section;
}

/** Eine einfache, beschriftete Balkenreihe. Kein Diagramm-Paket. */
function barChart(rows, options) {
  const settings = options || {};
  const chart = node("div", "histogram");
  const maximum = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
  for (const row of rows) {
    const bar = node("div", "bar");
    bar.append(node("span", "bar-label", row.label));
    const track = node("span", "bar-track");
    const fill = node("span", "bar-fill");
    fill.style.width = `${Math.max(1, (Math.abs(row.value) / maximum) * 100)}%`;
    if (row.colour) fill.style.background = row.colour;
    track.append(fill);
    bar.append(track);
    bar.append(node("span", "bar-count", row.text || formatNumber(row.value, settings.digits || 0)));
    if (row.note) bar.append(node("span", "bar-note", row.note));
    chart.append(bar);
  }
  return chart;
}

function renderKnnBackends(target) {
  const data = evidence() && evidence().knn_backends;
  if (!data) return;
  const table = node("div", "wrap");
  const element = node("table", "result-table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const label of ["Backend", "Search", "Status", "Peak RAM", "Runtime"]) {
    headRow.append(node("th", "", label));
  }
  head.append(headRow);
  element.append(head);
  const body = document.createElement("tbody");
  for (const row of data.rows) {
    const line = document.createElement("tr");
    if (row.exceeded_limit) line.className = "is-over";
    const name = node("td", "", row.backend);
    if (row.backend === data.chosen) name.append(node("span", "tag t-best", "selected"));
    line.append(name);
    line.append(node("td", "", row.search));
    line.append(node("td", "", row.exceeded_limit ? `killed at ${data.limit_gb} GB` : "completed"));
    line.append(node("td", "", `${row.ram_peak_gb.toFixed(1)} GB`));
    line.append(node("td", "", `${row.duration_minutes.toFixed(0)} min`));
    body.append(line);
  }
  element.append(body);
  table.append(element);
  target.replaceChildren(storyBlock(data, table));
}

function renderScaling(target) {
  const data = evidence() && evidence().parallel_scaling;
  if (!data) return;
  const charts = node("div", "chart-pair");
  for (const [label, stage] of [["Decomposition", data.preprocess], ["Recomposition", data.recompose]]) {
    const block = node("div");
    block.append(node("h4", "", `${label} — speedup over workers`));
    block.append(barChart(stage.rows.map((row) => ({
      label: `${row.workers} worker${row.workers === 1 ? "" : "s"}`,
      value: row.speedup,
      text: `${row.speedup.toFixed(2)}×`,
      note: `${row.wall_minutes.toFixed(0)} min · ${(row.efficiency * 100).toFixed(0)} % efficiency`,
    }))));
    block.append(node("p", "hint", label === "Decomposition"
      ? `${stage.scenes} scenes, ${formatNumber(stage.tiles)} chunks, strategy ${stage.chunker}.`
      : `${stage.scenes} scenes à ${stage.tiles_per_scene} chunks, `
        + `${formatNumber(stage.points_total)} points, rule ${stage.merge_method}.`));
    charts.append(block);
  }
  target.replaceChildren(storyBlock(data, charts));
}

function renderNumbaNote(target) {
  const rows = (registry() && registry().capabilities) || [];
  const entries = rows.filter((row) =>
    row.id === "decompose.numba_fastpath" || row.id === "resources.numba_benchmark");
  if (!entries.length) return;
  // Bewusst kein `.story`: ein Engineering-Block nennt Problem, Untersuchung,
  // Ergebnis und Entscheidung aus Messdaten. Hier gibt es keine Messreihe, also
  // sieht der Block auch anders aus — sonst behauptete die Form einen Beleg,
  // den es nicht gibt.
  const section = node("section", "story-note");
  section.append(node("h3", "", "Numba fast path — described, not quantified"));
  section.append(node("p", "hint",
    "Everything else in this area rests on stored measurements. This one does not, and says so."));
  for (const entry of entries) {
    const block = node("div", "story-cell");
    block.append(node("span", "eyebrow", entry.capability));
    if (entry.note) block.append(node("p", "", entry.note));
    if (entry.reason) block.append(node("p", "honest", entry.reason));
    block.append(node("p", "provenance", entry.canonical));
    section.append(block);
  }
  target.replaceChildren(section);
}

function renderBudgetProbe(target) {
  const data = evidence() && evidence().budget_probe;
  if (!data) return;
  const extra = node("div");
  const table = node("dl", "inline-meta");
  for (const [label, value] of [
    ["Outcome", data.outcome],
    ["Largest safe budget", data.best_safe_point_max === null ? "never established" : data.best_safe_point_max],
    ["First failing candidate", data.first_failing_point_max],
  ]) {
    const wrapper = node("div");
    wrapper.append(node("dt", "", label));
    wrapper.append(node("dd", "", String(value)));
    table.append(wrapper);
  }
  extra.append(table);
  extra.append(node("p", "honest",
    "This block documents a failure. It is here because the decision that followed from it only "
    + "makes sense with it."));
  target.replaceChildren(storyBlock(data, extra));
}

/** Zeilen des Registers eines Bereichs als Karten. */
function capabilityCards(area, target) {
  const rows = ((registry() && registry().capabilities) || []).filter((row) => row.area === area);
  const list = node("div", "capability-cards");
  for (const row of rows) {
    const card = node("article", "capability-card");
    card.append(node("h4", "", row.capability));
    const tags = node("div", "tags");
    tags.append(node("span", `tag t-${row.state.toLowerCase()}`, row.state.replaceAll("_", " ").toLowerCase()));
    tags.append(node("span", "tag t-provenance", provenanceLabel(row.provenance)));
    if (row.browser) tags.append(node("span", "tag t-browser", "browser-native"));
    card.append(tags);
    if (row.note) card.append(node("p", "", row.note));
    if (row.reason) card.append(node("p", "honest", row.reason));
    if (row.changed) card.append(node("p", "changed", `My share: ${row.changed}`));
    card.append(node("p", "provenance", row.canonical));
    if (row.tests && row.tests.length) {
      card.append(node("p", "provenance", `Tests: ${row.tests.join(", ")}`));
    }
    list.append(card);
  }
  if (target) target.replaceChildren(list);
  return list;
}

function provenanceLabel(key) {
  return {
    ORIGINAL: "own work",
    MODIFIED_UPSTREAM: "extended third-party",
    UPSTREAM: "third-party",
    EXPERIMENTAL: "experimental",
    RESEARCH_INFRASTRUCTURE: "research infrastructure",
  }[key] || key.toLowerCase();
}

function renderReproducibility(target) {
  const data = registry();
  if (!data) return;
  clearElement(target);
  target.append(node("h3", "", "Reproducibility"));
  target.append(node("p", "lede",
    "A run of the thesis is reproducible when its metadata says, without being asked, what went "
    + "in and what came out. These are the parts of that machinery — and the explicit decision "
    + "not to rebuild the control centre here."));

  // Der Aufbau eines Laufs, an echten Feldern gezeigt und aus den Evidenzdaten
  // gespeist, damit die Struktur keine Behauptung bleibt.
  const results = evidence() && evidence().results;
  if (results) {
    const example = Object.entries(results.chunkers)[2];
    if (example) {
      const [name, block] = example;
      const card = node("article", "capability-card");
      card.append(node("h4", "", `Run metadata, on a real sanitized run (${name})`));
      const fields = node("dl", "inline-meta");
      for (const [label, value] of [
        ["Strategy", name],
        ["Train chunks", formatNumber(block.train_chunks)],
        ["Holdout chunks", formatNumber(block.val_chunks)],
        ["Epochs trained", block.trained_epochs],
        ["Stop reason", block.stop_reason],
        ["Peak GPU", `${formatNumber(block.peak_gpu_mb)} MB`],
        ["Preprocess", `${block.preprocess_hours.toFixed(2)} h`],
        ["Training", `${block.train_hours.toFixed(2)} h`],
        ["Chunk inference", `${block.chunk_test_hours.toFixed(2)} h`],
        ["Best merge rule", block.best_merge],
        ["Scene mIoU", block.merges[block.best_merge].miou.toFixed(4)],
      ]) {
        const wrapper = node("div");
        wrapper.append(node("dt", "", label));
        wrapper.append(node("dd", "", String(value)));
        fields.append(wrapper);
      }
      card.append(fields);
      card.append(node("p", "hint",
        "Every one of these fields comes out of the run metadata, not out of a spreadsheet. "
        + "The stop reason and the peak GPU figure exist because a hook wrote them per run."));
      card.append(node("p", "provenance", results.source.join(" · ")));
      target.append(card);
    }
  }
  target.append(capabilityCards("reproducibility"));
  target.append(capabilityCards("pipeline"));
}

function renderResources(target) {
  clearElement(target);
  target.append(node("h3", "", "Resource Management"));
  target.append(node("p", "lede",
    "The thesis ran on one machine with a fixed memory budget. Most of the engineering visible "
    + "here exists because that budget was reached."));
  const data = evidence() && evidence().knn_backends;
  if (data) {
    target.append(storyBlock({
      title: "RAM guard",
      problem: data.problem,
      investigation: data.investigation,
      result: data.result,
      decision: data.decision,
      source: data.source,
    }));
  }
  target.append(capabilityCards("resources"));
  target.append(capabilityCards("platform"));
}

function renderDiagnostics(target) {
  clearElement(target);
  target.append(node("h3", "", "Diagnostics"));
  target.append(node("p", "lede",
    "What the decomposition and the result actually look like. Two of these views became the "
    + "normal case of this tool; one needs a twelve-million-point scene and stayed an image."));

  const data = evidence() && evidence().confusion;
  if (data) {
    const chooser = node("div", "research-nav");
    const holder = node("div");
    const names = Object.keys(data.per_chunker);
    const draw = (name) => {
      const block = data.per_chunker[name];
      holder.replaceChildren(
        node("h4", "", `${name} — merged with ${block.merge}`),
        confusionTable(block.matrix, data.class_names),
      );
      for (const chip of chooser.querySelectorAll("button")) {
        chip.classList.toggle("is-active", chip.textContent === name);
      }
    };
    for (const name of names) {
      const chip = node("button", "chip", name);
      chip.type = "button";
      chip.addEventListener("click", () => draw(name));
      chooser.append(chip);
    }
    const section = node("section", "story");
    section.append(node("h3", "", data.title));
    section.append(node("p", "",
      "Aggregated over the eleven test scenes, for the best merge rule of each strategy. Rows are "
      + "the reference, columns the prediction. These are measured results of the thesis."));
    section.append(chooser);
    section.append(holder);
    section.append(node("p", "provenance", `Measured data: ${data.source} (thesis repository)`));
    target.append(section);
    draw(names[0]);
  }
  target.append(capabilityCards("diagnostics"));
}

function renderPipeline(target) {
  clearElement(target);
  target.append(node("h3", "", "Research Pipeline"));
  target.append(node("p", "lede",
    "How a number gets from a measurement file into a figure — and how the same chain continues "
    + "into this tool without exposing the private repository."));
  const chain = node("ol", "chain");
  for (const step of [
    "A run writes its metadata and metrics as files",
    "thesis_data.py reads them, nothing is retyped",
    "build_charts.py draws the figures of the talk from them",
    "export_evidence.py aggregates and sanitizes the same source",
    "evidence.js carries it into this page, without a network request",
  ]) {
    const item = document.createElement("li");
    item.append(node("span", "chain-step", step));
    chain.append(item);
  }
  target.append(chain);
  target.append(capabilityCards("pipeline"));
}

function renderLab(target) {
  const data = registry();
  if (!data) return;
  const catalog = data.experimental_catalog || [];
  clearElement(target);

  // Die Dreiteilung muss vollständig sein, sonst verspricht die Legende eine
  // Kategorie, die der Abschnitt nicht zeigt. Was evaluiert wurde, steht im
  // Arbeitsablauf — genannt wird es hier trotzdem, weil die Abgrenzung erst mit
  // beiden Seiten eine Abgrenzung ist.
  const evaluated = data.capabilities.filter((row) =>
    row.maturity === "FINAL" && row.state === "CORE_UI"
    && (row.id.startsWith("decompose.") || row.id.startsWith("recompose.")));
  if (evaluated.length) {
    const card = node("article", "capability-card");
    card.append(node("h4", "", `Final / evaluated (${evaluated.length}) — in the workflow, not here`));
    const tags = node("div", "tags");
    tags.append(node("span", "tag t-final", "part of the quantitative comparison"));
    card.append(tags);
    card.append(node("p", "",
      evaluated.map((row) => row.capability.split(" — ")[0]).join(" · ")));
    card.append(node("p", "hint",
      "These are the methods the thesis measured against each other. Everything below was built "
      + "and deliberately left out of that comparison."));
    target.append(card);
  }

  const groups = [
    ["EXPERIMENTAL", "Experimental — implemented, outside the evaluation"],
    ["ABANDONED", "Abandoned — a placeholder with a reason, never implemented"],
  ];
  for (const [maturity, title] of groups) {
    const entries = catalog.filter((entry) => entry.maturity === maturity);
    if (!entries.length) continue;
    target.append(node("h4", "", `${title} (${entries.length})`));
    const list = node("div", "capability-cards");
    for (const entry of entries) {
      const card = node("article", "capability-card");
      card.append(node("h4", "", entry.name));
      const tags = node("div", "tags");
      tags.append(node("span", `tag t-${maturity.toLowerCase()}`, entry.status));
      tags.append(node("span", "tag t-state",
        entry.runnable_full_tool ? "runnable in the full version" : "catalog entry only"));
      if (entry.visible_in_browser) tags.append(node("span", "tag t-browser", "browser-native"));
      card.append(tags);
      card.append(node("p", "", entry.purpose));
      for (const [label, values] of [["Strengths", entry.pros], ["Weaknesses", entry.cons],
                                     ["Adaptation needed", entry.adaptation],
                                     ["Known implementations", entry.systems]]) {
        if (!values || !values.length) continue;
        const wrapper = node("div", "notes");
        wrapper.append(node("span", "eyebrow", label));
        const items = node("ul");
        for (const value of values) {
          const item = document.createElement("li");
          item.textContent = value;
          items.append(item);
        }
        wrapper.append(items);
        card.append(wrapper);
      }
      if (entry.reason) card.append(node("p", "honest", entry.reason));
      card.append(node("p", "provenance", entry.implementation));
      list.append(card);
    }
    target.append(list);
  }
}

function renderProvenance(target) {
  const data = registry();
  if (!data) return;
  clearElement(target);
  const summary = data.summary;
  target.append(node("h3", "", "Technische Herkunft"));
  target.append(node("p", "lede",
    "Every capability of this project, what it is, where it is implemented, and whether it has an "
    + "intentional place here. Generated from the registry that a test checks on every run, so the "
    + "claim cannot quietly drift from the code."));

  const numbers = node("div", "numbers");
  for (const [value, label] of [
    [summary.atomic, "atomic implementations"],
    [summary.families, "capability families"],
    [summary.represented, `represented (before ${summary.represented_before})`],
    [summary.not_represented, "without an intentional place"],
    [summary.browser_supported, "browser-native"],
  ]) {
    const cell = node("div");
    cell.append(node("strong", "", formatNumber(value)));
    cell.append(node("span", "", label));
    numbers.append(cell);
  }
  target.append(numbers);

  target.append(node("p", "hint",
    "The count is atomic on purpose. An earlier audit counted families — 27 experimental cluster "
    + "chunkers as one row — which made the coverage look better than it was."));

  for (const area of data.areas) {
    const rows = data.capabilities.filter((row) => row.area === area.id);
    if (!rows.length) continue;
    const details = document.createElement("details");
    details.className = "tech-details";
    const summaryElement = document.createElement("summary");
    summaryElement.textContent = `${area.title} (${rows.length})`;
    details.append(summaryElement);
    details.append(capabilityCards(area.id));
    target.append(details);
  }
}

/** Die Herkunftsangaben je Arbeitsschritt, in den aufklappbaren Abschnitten. */
function renderWorkflowProvenance() {
  for (const holder of document.querySelectorAll("[data-provenance-for]")) {
    capabilityCards(holder.dataset.provenanceFor, holder);
  }
}

function renderResearch() {
  if (!document.querySelector("#view-research")) return;
  renderKnnBackends(document.querySelector("#perf-backends"));
  renderScaling(document.querySelector("#perf-scaling"));
  renderNumbaNote(document.querySelector("#perf-numba"));
  renderBudgetProbe(document.querySelector("#perf-budget"));
  renderResources(document.querySelector("#resource-blocks"));
  renderReproducibility(document.querySelector("#repro-panel"));
  renderPipeline(document.querySelector("#pipeline-blocks"));
  renderDiagnostics(document.querySelector("#diagnostics-blocks"));
  renderLab(document.querySelector("#lab-catalog"));
  renderProvenance(document.querySelector("#provenance-panel"));
  renderWorkflowProvenance();
}

// ---------------------------------------------------------------- Verdrahtung

for (const tab of document.querySelectorAll(".view-tab")) {
  tab.addEventListener("click", () => showView(tab.dataset.view));
}
for (const chip of document.querySelectorAll("[data-research]")) {
  chip.addEventListener("click", () => showResearchPanel(chip.dataset.research));
}
if (elements.validateRun) elements.validateRun.addEventListener("click", runValidate);
if (elements.recomposeRun) elements.recomposeRun.addEventListener("click", () => runRecompose(false));
if (elements.recomposeCompare) {
  elements.recomposeCompare.addEventListener("click", () => runRecompose(true));
}
if (elements.recomposeMethod) {
  elements.recomposeMethod.addEventListener("change", updateMergeDescription);
}
function updateNoiseLabels() {
  if (elements.errorRateOutput) {
    elements.errorRateOutput.textContent = `${Math.round(Number(elements.errorRate.value) * 100)} %`;
  }
  if (elements.errorAmplitudeOutput) {
    elements.errorAmplitudeOutput.textContent = `${Math.round(Number(elements.errorAmplitude.value) * 100)} %`;
  }
}
if (elements.errorRate) elements.errorRate.addEventListener("input", updateNoiseLabels);
if (elements.errorAmplitude) elements.errorAmplitude.addEventListener("input", updateNoiseLabels);
updateNoiseLabels();
if (elements.showResult) {
  elements.showResult.addEventListener("click", () => {
    document.querySelector("#preview-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
if (elements.analyzeRun) elements.analyzeRun.addEventListener("click", runAnalyze);
if (elements.exportArchive) elements.exportArchive.addEventListener("click", downloadArchive);
if (elements.exportMerged) elements.exportMerged.addEventListener("click", downloadMerged);
if (elements.exportBundle) elements.exportBundle.addEventListener("click", downloadBundle);
if (elements.viewerModes) {
  elements.viewerModes.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-colour]");
    if (!chip || chip.disabled || !lastRecompose) return;
    const preview = lastRecompose.preview;
    setColourMode(chip.dataset.colour, preview, Math.max(...preview.support, 1));
  });
}

renderResearch();
