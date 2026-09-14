/*
 * browser-core.js — Portierung eines kleinen Teils von `pointcloud_chunker`.
 *
 * ACHTUNG, und das steht auch in der Oberfläche: Das ist NICHT die kanonische
 * Implementierung. Kanonisch ist die Python-Bibliothek unter
 * `libs/pointcloud-chunker`. Hier laufen drei der sechs Zerlegungsstrategien
 * nach, damit die Demo auch ohne Python-Backend etwas Echtes rechnet:
 * auf GitHub Pages und nach einem Doppelklick auf `index.html`.
 *
 * Portiert (bit-genau gegen Python geprüft, siehe presentation/tools/equivalence.mjs):
 *   - xy                 zählbasiertes Gitter  (xy_grid_chunk_count_fn)
 *   - morton             Z-Order-Fenster       (morton_chunks_idx_fn)
 *   - bisect_xy_overlap  rekursive Halbierung  (bisect_xy_overlap_chunks_fn)
 *   - stabile source_id  (archive._append_source_ids)
 *   - Metriken und Rekonstruktion (archive.chunk_point_cloud / merge_chunk_archive)
 *
 * Nicht portiert, bewusst: kdtree, rand_knn, rand_cyl. Die brauchen einen
 * Nachbarschaftsindex (faiss/scipy); eine JS-Näherung wäre eine andere
 * Methode mit demselben Namen.
 *
 * Eine bekannte Abweichung: NumPy sortiert die Morton-Codes mit
 * `kind="quicksort"`, das ist bei gleichen Codes (mehrere Punkte in derselben
 * Gitterzelle) nicht festgelegt. Hier wird stabil nach Index sortiert. Bei
 * eindeutigen Zellen sind beide Ergebnisse identisch, bei Mehrfachbelegung
 * können sich einzelne Punkte an der Chunk-Grenze unterscheiden.
 *
 * Läuft als klassisches Skript im Browser (globale Variable) und unter Node
 * für den Äquivalenztest. Kein Modul-Import: `file://` verbietet ES-Module.
 */
(function (root) {
  'use strict';

  // Grenzen des Browser-Modus. Der Python-Weg erlaubt 500.000 Punkte; im
  // Browser bleibt die Wolke klein, damit die Demo auf jedem Arbeitsgerät
  // innerhalb eines Wimpernschlags antwortet.
  var MAX_POINTS = 200000;
  var MAX_CHUNKS = 1000;

  /** Die drei Strategien, die hier wirklich rechnen. */
  var BROWSER_STRATEGIES = [
    {
      id: 'xy',
      description: '2D XY grid with optional overlap / count-based grid',
      browser: true,
      note: 'Count-based grid: disjoint cells, redundancy 1.0.'
    },
    {
      id: 'morton',
      description: 'Morton/Z-order grouping of quantized voxels',
      browser: true,
      note: 'Z-order sort, windows that overlap through the stride.'
    },
    {
      id: 'bisect_xy_overlap',
      description: 'Overlapping bisection on XY axes until point budget',
      browser: true,
      note: 'Bisects alternately in X and Y until the point budget is met.'
    }
  ];

  /** Sichtbar, aber nur in der Vollversion rechenbar. */
  var SERVER_ONLY_STRATEGIES = [
    { id: 'kdtree', reason: 'median splits and filling to budget via distance queries' },
    { id: 'rand_knn', reason: 'k-nearest-neighbour search (faiss_cpu)' },
    { id: 'rand_cyl', reason: 'cylindrical neighbourhood search (faiss_cpu)' }
  ];

  // ------------------------------------------------------------------ Einlesen

  /**
   * numpy.linspace mit endpoint=True, Schritt für Schritt gleich gerechnet.
   * numpy bildet `k * (delta/div) + start` und setzt den letzten Wert exakt
   * auf `stop`. Wer hier `start + k*delta/div` rechnet, bekommt an den
   * Zellgrenzen andere Punkte.
   */
  function linspace(start, stop, num) {
    var out = new Float64Array(num);
    if (num === 1) {
      out[0] = start;
      return out;
    }
    var step = (stop - start) / (num - 1);
    for (var k = 0; k < num; k += 1) out[k] = k * step + start;
    out[num - 1] = stop;
    return out;
  }

  function emptyCloud() {
    return { n: 0, x: new Float64Array(0), y: new Float64Array(0), z: new Float64Array(0), fields: [] };
  }

  /**
   * ASCII-PLY lesen. Binäre PLY werden erkannt und abgelehnt — dafür ist die
   * Vollversion da, statt hier eine halbe plyfile-Semantik nachzubauen.
   *
   * Wichtig für die Äquivalenz: `property float x` bedeutet float32. plyfile
   * liest den Dezimaltext also in eine float32 und erst danach wird auf float64
   * erweitert. `Math.fround` macht genau das; ohne diesen Schritt liegen die
   * Koordinaten minimal anders und ein Punkt kann auf die andere Seite einer
   * Zellgrenze fallen.
   */
  function parsePly(text) {
    var lines = text.split(/\r?\n/);
    var cursor = 0;
    if ((lines[cursor] || '').trim() !== 'ply') throw new Error('Not a PLY file.');
    cursor += 1;

    var format = '';
    var count = -1;
    var properties = [];
    var inVertex = false;

    for (; cursor < lines.length; cursor += 1) {
      var line = lines[cursor].trim();
      if (line === 'end_header') { cursor += 1; break; }
      if (line === '' || line.indexOf('comment') === 0) continue;
      var parts = line.split(/\s+/);
      if (parts[0] === 'format') {
        format = parts[1] || '';
      } else if (parts[0] === 'element') {
        inVertex = parts[1] === 'vertex';
        if (inVertex) count = parseInt(parts[2], 10);
      } else if (parts[0] === 'property' && inVertex) {
        properties.push({ type: parts[1], name: parts[2] });
      }
    }

    if (format.indexOf('ascii') !== 0) {
      throw new Error(
        'Binary PLY files need the full version (Python). ' +
        'Browser mode reads ASCII PLY, XYZ, TXT and CSV.'
      );
    }
    if (!(count > 0)) throw new Error('PLY has no vertex element.');
    var names = properties.map(function (p) { return p.name; });
    if (names.indexOf('x') < 0 || names.indexOf('y') < 0 || names.indexOf('z') < 0) {
      throw new Error('PLY vertices must have x, y and z properties.');
    }

    var ix = names.indexOf('x');
    var iy = names.indexOf('y');
    var iz = names.indexOf('z');
    var ilabel = names.indexOf('class');
    if (ilabel < 0) ilabel = names.indexOf('classification');
    if (ilabel < 0) ilabel = names.indexOf('label');
    var single = {};
    properties.forEach(function (p, index) {
      single[index] = p.type === 'float' || p.type === 'float32';
    });

    var x = new Float64Array(count);
    var y = new Float64Array(count);
    var z = new Float64Array(count);
    var labels = ilabel >= 0 ? new Int32Array(count) : null;
    var written = 0;
    for (; cursor < lines.length && written < count; cursor += 1) {
      var row = lines[cursor].trim();
      if (row === '') continue;
      var values = row.split(/\s+/);
      x[written] = single[ix] ? Math.fround(parseFloat(values[ix])) : parseFloat(values[ix]);
      y[written] = single[iy] ? Math.fround(parseFloat(values[iy])) : parseFloat(values[iy]);
      z[written] = single[iz] ? Math.fround(parseFloat(values[iz])) : parseFloat(values[iz]);
      if (labels) labels[written] = Math.round(parseFloat(values[ilabel]));
      written += 1;
    }
    if (written !== count) {
      throw new Error('PLY header promises ' + count + ' points, read ' + written + '.');
    }
    return { n: count, x: x, y: y, z: z, fields: names, labels: labels };
  }

  /**
   * XYZ, TXT, CSV. Entspricht `np.loadtxt(..., comments="#")` plus
   * `_dense_vertices`: die ersten drei Spalten sind x, y, z, weitere Spalten
   * heissen value_3, value_4 … und bleiben float64.
   */
  function parseText(text, delimiter) {
    var rows = [];
    var columns = -1;
    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      var hash = line.indexOf('#');
      if (hash >= 0) line = line.slice(0, hash);
      line = line.trim();
      if (line === '') continue;
      var cells = delimiter === ',' ? line.split(',') : line.split(/\s+/);
      var values = [];
      for (var c = 0; c < cells.length; c += 1) {
        var cell = cells[c].trim();
        if (cell === '') continue;
        var value = Number(cell);
        if (!isFinite(value)) {
          throw new Error('Non-numeric value in line ' + (i + 1) + ': "' + cell + '".');
        }
        values.push(value);
      }
      if (values.length === 0) continue;
      if (columns < 0) columns = values.length;
      if (values.length !== columns) {
        throw new Error('Line ' + (i + 1) + ' has ' + values.length + ' columns instead of ' + columns + '.');
      }
      rows.push(values);
    }
    if (rows.length === 0 || columns < 3) {
      throw new Error('Text point clouds need at least three numeric columns and no header row.');
    }
    var n = rows.length;
    var x = new Float64Array(n);
    var y = new Float64Array(n);
    var z = new Float64Array(n);
    for (var r = 0; r < n; r += 1) {
      x[r] = rows[r][0];
      y[r] = rows[r][1];
      z[r] = rows[r][2];
    }
    var fields = ['x', 'y', 'z'];
    for (var extra = 3; extra < columns; extra += 1) fields.push('value_' + extra);
    return { n: n, x: x, y: y, z: z, fields: fields };
  }

  function parsePointCloud(text, fileName) {
    var name = String(fileName || '').toLowerCase();
    var cloud;
    if (name.slice(-4) === '.ply') {
      cloud = parsePly(text);
    } else if (name.slice(-4) === '.csv') {
      cloud = parseText(text, ',');
    } else if (name.slice(-4) === '.xyz' || name.slice(-4) === '.txt') {
      cloud = parseText(text, null);
    } else if (name.slice(-4) === '.npy' || name.slice(-4) === '.npz') {
      throw new Error('NPY and NPZ need the full version (Python, NumPy).');
    } else {
      throw new Error('Browser mode reads ASCII PLY, XYZ, TXT and CSV.');
    }
    if (cloud.n === 0) throw new Error('Point cloud is empty.');
    if (cloud.n > MAX_POINTS) {
      throw new Error('Browser mode handles up to ' + MAX_POINTS.toLocaleString('en-US')
        + ' points. The full version handles more.');
    }
    for (var i = 0; i < cloud.n; i += 1) {
      if (!isFinite(cloud.x[i]) || !isFinite(cloud.y[i]) || !isFinite(cloud.z[i])) {
        throw new Error('Point coordinates must be finite.');
      }
    }
    return cloud;
  }

  /**
   * Dieselbe deterministische Testszene wie im Server-Modus: 48 × 48 Punkte,
   * zwei Sinuswellen und ein aufgesetzter Block. Gleiche Datei, gleiche
   * Zahlen, egal welcher Modus rechnet.
   */
  function generatedSampleText() {
    var rows = [];
    for (var x = 0; x < 48; x += 1) {
      for (var y = 0; y < 48; y += 1) {
        var z = 3 * Math.sin(x / 6) + 2 * Math.cos(y / 7) + ((x > 30 && y > 25) ? 8 : 0);
        rows.push(x.toFixed(3) + ' ' + y.toFixed(3) + ' ' + z.toFixed(3));
      }
    }
    var header = [
      'ply', 'format ascii 1.0', 'element vertex ' + rows.length,
      'property float x', 'property float y', 'property float z', 'end_header'
    ];
    return header.concat(rows).join('\n') + '\n';
  }

  /** Entspricht `inspect_point_cloud`: Kennzahlen plus gleichmässige Stichprobe. */
  function inspect(cloud, previewLimit) {
    var limit = previewLimit === undefined ? 1500 : previewLimit;
    var minimum = [Infinity, Infinity, Infinity];
    var maximum = [-Infinity, -Infinity, -Infinity];
    for (var i = 0; i < cloud.n; i += 1) {
      if (cloud.x[i] < minimum[0]) minimum[0] = cloud.x[i];
      if (cloud.y[i] < minimum[1]) minimum[1] = cloud.y[i];
      if (cloud.z[i] < minimum[2]) minimum[2] = cloud.z[i];
      if (cloud.x[i] > maximum[0]) maximum[0] = cloud.x[i];
      if (cloud.y[i] > maximum[1]) maximum[1] = cloud.y[i];
      if (cloud.z[i] > maximum[2]) maximum[2] = cloud.z[i];
    }
    return {
      point_count: cloud.n,
      fields: cloud.fields.slice(),
      bounds: { minimum: minimum, maximum: maximum },
      preview: samplePreview(cloud, null, limit)
    };
  }

  /**
   * `np.linspace(0, m - 1, k, dtype=int64)` — numpy schneidet zum Integer ab.
   * Dieselbe Stichprobe wie das Backend, damit Vorschau und Bild gleich sind.
   */
  function samplePreview(cloud, indices, limit) {
    var total = indices ? indices.length : cloud.n;
    var size = Math.max(0, Math.min(limit | 0, total));
    var preview = [];
    if (size === 0) return preview;
    var positions = linspace(0, total - 1, size);
    for (var k = 0; k < size; k += 1) {
      var at = Math.trunc(positions[k]);
      var point = indices ? indices[at] : at;
      preview.push([cloud.x[point], cloud.y[point], cloud.z[point]]);
    }
    return preview;
  }

  // ----------------------------------------------------------------- Strategien

  /** xy: zählbasiertes Gitter, `xy_grid_chunk_count_fn`. */
  function chunkXy(cloud, nx, ny, minPoints) {
    var chunks = [];
    var columns = nx;
    var rows = ny === null || ny === undefined ? nx : ny;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < cloud.n; i += 1) {
      if (cloud.x[i] < minX) minX = cloud.x[i];
      if (cloud.x[i] > maxX) maxX = cloud.x[i];
      if (cloud.y[i] < minY) minY = cloud.y[i];
      if (cloud.y[i] > maxY) maxY = cloud.y[i];
    }
    var xs = linspace(minX, maxX, columns + 1);
    var ys = linspace(minY, maxY, rows + 1);

    for (var column = 0; column < columns; column += 1) {
      var x0 = xs[column];
      var x1 = xs[column + 1];
      var lastColumn = column === columns - 1;
      var inColumn = [];
      for (var p = 0; p < cloud.n; p += 1) {
        var xv = cloud.x[p];
        if (xv >= x0 && (lastColumn ? xv <= x1 : xv < x1)) inColumn.push(p);
      }
      if (inColumn.length === 0) continue;
      for (var row = 0; row < rows; row += 1) {
        var y0 = ys[row];
        var y1 = ys[row + 1];
        var lastRow = row === rows - 1;
        var idx = [];
        for (var q = 0; q < inColumn.length; q += 1) {
          var yv = cloud.y[inColumn[q]];
          if (yv >= y0 && (lastRow ? yv <= y1 : yv < y1)) idx.push(inColumn[q]);
        }
        if (idx.length >= minPoints) chunks.push(idx);
      }
    }
    return chunks;
  }

  /** 16-Bit-Wert auf jede zweite Bitstelle spreizen (Morton, 2D). */
  function spread16(value) {
    var v = value & 0xFFFF;
    v = (v | (v << 8)) & 0x00FF00FF;
    v = (v | (v << 4)) & 0x0F0F0F0F;
    v = (v | (v << 2)) & 0x33333333;
    v = (v | (v << 1)) & 0x55555555;
    return v >>> 0;
  }

  /**
   * morton: Quantisieren, Z-Order sortieren, Fenster schneiden.
   *
   * Der 62-Bit-Morton-Code passt nicht in eine float64-Ganzzahl. Statt BigInt
   * (langsam beim Sortieren) wird er in zwei 32-Bit-Hälften gehalten und
   * lexikografisch verglichen — dasselbe Ergebnis, ohne Kosten.
   */
  function chunkMorton(cloud, pointsPerChunk, gridSize, overlap, overlapMode, minPoints) {
    var n = cloud.n;
    var chunks = [];
    if (n === 0 || pointsPerChunk <= 0 || gridSize <= 0) return chunks;

    var clampedOverlap = Math.min(0.99, Math.max(0, overlap));
    var mode = overlapMode === 'fill_to_budget' ? 'fill_to_budget' : 'stride_overlap';

    var minX = Infinity, minY = Infinity;
    for (var i = 0; i < n; i += 1) {
      if (cloud.x[i] < minX) minX = cloud.x[i];
      if (cloud.y[i] < minY) minY = cloud.y[i];
    }
    var inv = 1.0 / gridSize;
    var maxQ = Math.pow(2, 31) - 1;
    var high = new Uint32Array(n);
    var low = new Uint32Array(n);
    for (var k = 0; k < n; k += 1) {
      var qx = Math.min(Math.max((cloud.x[k] - minX) * inv, 0), maxQ) >>> 0;
      var qy = Math.min(Math.max((cloud.y[k] - minY) * inv, 0), maxQ) >>> 0;
      high[k] = ((spread16(qx >>> 16) << 1) | spread16(qy >>> 16)) >>> 0;
      low[k] = ((spread16(qx & 0xFFFF) << 1) | spread16(qy & 0xFFFF)) >>> 0;
    }

    var order = new Array(n);
    for (var o = 0; o < n; o += 1) order[o] = o;
    order.sort(function (a, b) {
      if (high[a] !== high[b]) return high[a] < high[b] ? -1 : 1;
      if (low[a] !== low[b]) return low[a] < low[b] ? -1 : 1;
      return a - b; // stabil; NumPys quicksort lässt diesen Fall offen
    });

    var corePoints = pointsPerChunk;
    var stride = pointsPerChunk;
    if (mode === 'fill_to_budget' && clampedOverlap > 0) {
      corePoints = Math.max(minPoints, Math.min(pointsPerChunk, Math.floor(pointsPerChunk * (1 - clampedOverlap))));
      stride = corePoints;
    } else if (clampedOverlap > 0) {
      stride = Math.max(1, Math.floor(pointsPerChunk * (1 - clampedOverlap)));
    }

    var starts = [];
    var start = 0;
    while (start < n) {
      starts.push(start);
      var next = start + stride;
      if (next >= n) break;
      start = next;
    }
    var tailStart = Math.max(0, n - corePoints);
    if (starts.length === 0 || starts[starts.length - 1] !== tailStart) starts.push(tailStart);

    var previous = null;
    for (var s = 0; s < starts.length; s += 1) {
      var from = starts[s];
      if (previous !== null && from === previous) continue;
      previous = from;
      var to = Math.min(from + corePoints, n);
      if (to - from >= minPoints) chunks.push(order.slice(from, to));
    }
    return chunks;
  }

  /** Median-Notausgang aus `_split_idx_by_axis`. */
  function splitByMedian(cloud, idx, axis) {
    var values = idx.map(function (p) { return axis === 0 ? cloud.x[p] : cloud.y[p]; });
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var middle = sorted.length >> 1;
    var median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    var left = [];
    var right = [];
    for (var i = 0; i < idx.length; i += 1) {
      if (values[i] <= median) left.push(idx[i]); else right.push(idx[i]);
    }
    if (left.length === 0 || right.length === 0 || left.length === idx.length || right.length === idx.length) {
      var order = idx.map(function (_point, index) { return index; });
      order.sort(function (a, b) { return values[a] - values[b] || a - b; }); // mergesort = stabil
      var half = order.length >> 1;
      left = order.slice(0, half).map(function (index) { return idx[index]; });
      right = order.slice(half).map(function (index) { return idx[index]; });
    }
    return [left, right];
  }

  /** bisect_xy_overlap: rekursive Halbierung, LIFO-Stapel wie in Python. */
  function chunkBisect(cloud, maxPoints, overlap, overlapMode, maxDepth, minPoints) {
    var n = cloud.n;
    var chunks = [];
    if (n === 0) return chunks;
    var clamped = Math.min(0.49, Math.max(0, overlap));
    var mode = overlapMode === 'split_overlap' ? 'split_overlap' : 'fill_to_budget';
    var stop = maxPoints;
    if (mode === 'fill_to_budget' && clamped > 0) {
      stop = Math.max(minPoints, Math.min(maxPoints, Math.floor(maxPoints * (1 - clamped))));
    }

    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    var all = new Array(n);
    for (var i = 0; i < n; i += 1) {
      all[i] = i;
      if (cloud.x[i] < minX) minX = cloud.x[i];
      if (cloud.x[i] > maxX) maxX = cloud.x[i];
      if (cloud.y[i] < minY) minY = cloud.y[i];
      if (cloud.y[i] > maxY) maxY = cloud.y[i];
    }

    var stack = [[all, 0, 0, minX, maxX, minY, maxY]];
    while (stack.length) {
      var frame = stack.pop();
      var idx = frame[0];
      var depth = frame[1];
      var axis = frame[2];
      var x0 = frame[3], x1 = frame[4], y0 = frame[5], y1 = frame[6];
      var m = idx.length;
      if (m < minPoints) continue;
      if (m <= stop || (maxDepth !== null && maxDepth !== undefined && depth >= maxDepth)) {
        chunks.push(idx);
        continue;
      }

      var spanX = x1 - x0;
      var spanY = y1 - y0;
      if (spanX > spanY) axis = 0; else if (spanY > spanX) axis = 1;

      var values = axis === 0 ? cloud.x : cloud.y;
      var centre = axis === 0 ? 0.5 * (x0 + x1) : 0.5 * (y0 + y1);
      var first = [];
      var second = [];
      var overlapAbs = 0;

      if (mode === 'fill_to_budget') {
        for (var a = 0; a < m; a += 1) {
          if (values[idx[a]] <= centre) first.push(idx[a]); else second.push(idx[a]);
        }
      } else {
        overlapAbs = 0.5 * (axis === 0 ? spanX : spanY) * clamped;
        for (var b = 0; b < m; b += 1) {
          var value = values[idx[b]];
          if (value <= centre + overlapAbs) first.push(idx[b]);
          if (value >= centre - overlapAbs) second.push(idx[b]);
        }
        if (first.length === m || second.length === m || first.length === 0 || second.length === 0) {
          first = [];
          second = [];
          for (var c = 0; c < m; c += 1) {
            if (values[idx[c]] <= centre) first.push(idx[c]); else second.push(idx[c]);
          }
          overlapAbs = 0;
        }
      }

      var firstBox;
      var secondBox;
      if (axis === 0) {
        firstBox = [x0, Math.min(x1, centre + overlapAbs), y0, y1];
        secondBox = [Math.max(x0, centre - overlapAbs), x1, y0, y1];
      } else {
        firstBox = [x0, x1, y0, Math.min(y1, centre + overlapAbs)];
        secondBox = [x0, x1, Math.max(y0, centre - overlapAbs), y1];
      }
      if (mode === 'fill_to_budget') {
        firstBox = axis === 0 ? [x0, centre, y0, y1] : [x0, x1, y0, centre];
        secondBox = axis === 0 ? [centre, x1, y0, y1] : [x0, x1, centre, y1];
      }

      if (first.length === 0 || second.length === 0) {
        var fallback = splitByMedian(cloud, idx, axis);
        first = fallback[0];
        second = fallback[1];
        if (first.length === 0 || second.length === 0) {
          chunks.push(idx);
          continue;
        }
        firstBox = axis === 0 ? [x0, centre, y0, y1] : [x0, x1, y0, centre];
        secondBox = axis === 0 ? [centre, x1, y0, y1] : [x0, x1, centre, y1];
      }

      var nextAxis = axis === 0 ? 1 : 0;
      stack.push([first, depth + 1, nextAxis, firstBox[0], firstBox[1], firstBox[2], firstBox[3]]);
      stack.push([second, depth + 1, nextAxis, secondBox[0], secondBox[1], secondBox[2], secondBox[3]]);
    }
    return chunks;
  }

  /**
   * Parameterableitung genau wie `backend.py::_parse_chunk_options`, damit
   * dieselbe Eingabe in beiden Modi dieselbe Zerlegung ergibt.
   */
  function resolveParams(strategy, pointCount, targetPoints, overlap) {
    if (strategy === 'xy') {
      var chunkCount = Math.max(1, Math.ceil(pointCount / targetPoints));
      var nx = Math.max(1, Math.ceil(Math.sqrt(chunkCount)));
      var ny = Math.max(1, Math.ceil(chunkCount / nx));
      return { xy_nx: nx, xy_ny: ny, xy_overlap_mode: 'stride_overlap' };
    }
    if (strategy === 'morton') {
      return {
        morton_points: targetPoints,
        morton_overlap: overlap,
        morton_grid: 1.0,
        morton_dims: 'xy',
        morton_overlap_mode: 'stride_overlap'
      };
    }
    if (strategy === 'bisect_xy_overlap') {
      return {
        bisect_max_points: targetPoints,
        bisect_overlap: overlap,
        bisect_overlap_mode: 'fill_to_budget',
        bisect_max_depth: null
      };
    }
    throw new Error('Strategy "' + strategy + '" runs in the full version only.');
  }

  /** Indexlisten je Chunk — der Vergleichspunkt für den Äquivalenztest. */
  function chunkIndices(cloud, strategy, params, minPoints) {
    var floor = minPoints === undefined ? 1 : minPoints;
    if (strategy === 'xy') {
      return chunkXy(cloud, params.xy_nx, params.xy_ny, floor);
    }
    if (strategy === 'morton') {
      return chunkMorton(
        cloud,
        params.morton_points,
        params.morton_grid === undefined ? 1.0 : params.morton_grid,
        params.morton_overlap === undefined ? 0 : params.morton_overlap,
        params.morton_overlap_mode || 'stride_overlap',
        floor
      );
    }
    if (strategy === 'bisect_xy_overlap') {
      return chunkBisect(
        cloud,
        params.bisect_max_points,
        params.bisect_overlap === undefined ? 0 : params.bisect_overlap,
        params.bisect_overlap_mode || 'fill_to_budget',
        params.bisect_max_depth === undefined ? null : params.bisect_max_depth,
        floor
      );
    }
    throw new Error('Unknown strategy: ' + strategy);
  }

  // -------------------------------------------------- Zerlegen und Rekonstruktion

  /**
   * Wie `chunk_point_cloud`, aber im Speicher statt als ZIP: stabile IDs,
   * Abdeckungsprüfung und dieselben vier Metriken.
   */
  function chunk(cloud, options) {
    var strategy = options.strategy;
    var targetPoints = options.targetPoints;
    var overlap = options.overlap === undefined ? 0 : options.overlap;
    var previewLimit = options.previewLimit === undefined ? 1500 : options.previewLimit;
    var params = resolveParams(strategy, cloud.n, targetPoints, overlap);
    var raw = chunkIndices(cloud, strategy, params, 1);
    if (raw.length === 0) throw new Error('Chunking produced no chunk at all.');
    if (raw.length > MAX_CHUNKS) {
      throw new Error('More than ' + MAX_CHUNKS + ' chunks. Raise the point budget.');
    }

    var coverage = new Int32Array(cloud.n);
    var references = 0;
    var chunks = [];
    for (var c = 0; c < raw.length; c += 1) {
      var idx = raw[c];
      // Jeder Chunk trägt seine Koordinaten selbst, so wie die PLY-Datei im
      // ZIP-Archiv der Vollversion. Nur so ist die Rekonstruktion später
      // wirklich eine Rekonstruktion aus den Chunks und kein Blick zurück in
      // die Originalwolke.
      var payload = new Float64Array(idx.length * 3);
      for (var i = 0; i < idx.length; i += 1) {
        var point = idx[i];
        coverage[point] += 1;
        payload[i * 3] = cloud.x[point];
        payload[i * 3 + 1] = cloud.y[point];
        payload[i * 3 + 2] = cloud.z[point];
      }
      references += idx.length;
      chunks.push({
        id: 'chunk-' + String(c + 1).padStart(4, '0'),
        point_count: idx.length,
        source_ids: idx,
        coordinates: payload,
        preview: samplePreview(cloud, idx, previewLimit)
      });
    }
    var missing = 0;
    var maximum = 0;
    for (var p = 0; p < cloud.n; p += 1) {
      if (coverage[p] === 0) missing += 1;
      if (coverage[p] > maximum) maximum = coverage[p];
    }
    if (missing) throw new Error('Chunking lost ' + missing + ' source points.');

    return {
      strategy: strategy,
      params: params,
      chunks: chunks,
      metrics: {
        chunk_count: chunks.length,
        point_references: references,
        redundancy_ratio: references / cloud.n,
        maximum_coverage: maximum
      }
    };
  }

  /**
   * Wie `merge_chunk_archive`: über die stabilen IDs zurückbauen, dabei
   * prüfen, dass überlappende Chunks sich über dieselbe Koordinate einig sind
   * (Toleranz 1e-6 wie in Python) und am Ende jeder Punkt genau einmal steht.
   */
  function merge(cloud, chunkResult) {
    var n = cloud.n;
    var seen = new Uint8Array(n);
    var x = new Float64Array(n);
    var y = new Float64Array(n);
    var z = new Float64Array(n);
    var duplicates = 0;

    for (var c = 0; c < chunkResult.chunks.length; c += 1) {
      var entry = chunkResult.chunks[c];
      var ids = entry.source_ids;
      var payload = entry.coordinates;
      if (!payload || payload.length !== ids.length * 3) {
        throw new Error('Chunk ' + entry.id + ' carries no coordinates.');
      }
      for (var i = 0; i < ids.length; i += 1) {
        var id = ids[i];
        if (id < 0 || id >= n) throw new Error('Invalid source_id: ' + id + '.');
        var cx = payload[i * 3];
        var cy = payload[i * 3 + 1];
        var cz = payload[i * 3 + 2];
        if (seen[id]) {
          // Genau die Prüfung aus `merge_chunk_archive`: überlappende Chunks
          // müssen sich über die Koordinate einig sein, sonst stimmt die
          // Punktidentität nicht.
          duplicates += 1;
          if (Math.abs(x[id] - cx) > 1e-6 || Math.abs(y[id] - cy) > 1e-6 || Math.abs(z[id] - cz) > 1e-6) {
            throw new Error('Overlapping chunks disagree on source_id ' + id + '.');
          }
          continue;
        }
        x[id] = cx;
        y[id] = cy;
        z[id] = cz;
        seen[id] = 1;
      }
    }

    var covered = 0;
    var identical = 0;
    for (var p = 0; p < n; p += 1) {
      if (seen[p]) covered += 1;
      if (x[p] === cloud.x[p] && y[p] === cloud.y[p] && z[p] === cloud.z[p]) identical += 1;
    }
    if (covered !== n) {
      throw new Error('The chunks covered only ' + covered + ' of ' + n + ' points.');
    }

    return {
      point_count: n,
      duplicate_references: duplicates,
      exact: identical === n,
      identical_points: identical
    };
  }

  /**
   * Der JSON-Bericht, den der Browser-Modus anstelle des ZIP-Archivs abgibt.
   * Bewusst NICHT als `manifest.json` des Archivformats ausgegeben: es ist ein
   * anderer Artefakttyp und soll nicht damit verwechselt werden.
   */
  function chunkReport(cloud, chunkResult, sourceName) {
    return {
      report_version: 1,
      produced_by: 'browser-core.js (port of pointcloud_chunker)',
      canonical_implementation: 'libs/pointcloud-chunker (Python)',
      source: { name: sourceName || 'generated-terrain.ply', point_count: cloud.n, fields: cloud.fields.slice() },
      chunking: { strategy: chunkResult.strategy, params: chunkResult.params, min_points: 1 },
      metrics: chunkResult.metrics,
      chunks: chunkResult.chunks.map(function (entry) {
        return { id: entry.id, point_count: entry.point_count, source_ids: Array.prototype.slice.call(entry.source_ids) };
      })
    };
  }

  // ============================================================ Rekomposition
  //
  // Die zweite Hälfte der Forschungsfrage. Portiert sind genau die vier
  // evaluierten Regeln aus `merge.py`; die fünf experimentellen bleiben der
  // Vollversion, weil sie dort hinter einem Forschungsbereich sitzen und ein
  // zweiter Port nichts belegen würde, was der erste nicht schon belegt.
  //
  // Zwei Stellen brauchten besondere Sorgfalt, damit Python und JavaScript
  // dasselbe rechnen:
  //
  //   * `np.round` rundet die Hälfte zur geraden Zahl, `Math.round` immer auf.
  //     Bei der Quantisierung der Koordinaten entscheidet das über die
  //     Punktidentität, also wird hier kaufmännisch-gerade gerundet.
  //   * `np.unique(axis=0)` gibt die Gruppen lexikografisch sortiert zurück.
  //     Die Reihenfolge bestimmt die Reihenfolge der Ausgabe, also wird hier
  //     genauso sortiert.
  //
  // Bekannte Abweichung, dokumentiert in `presentation/tools/equivalence.mjs`:
  // bei `distance` ohne explizites Sigma benutzt Python `np.std`, das paarweise
  // summiert. Die hier einfache Summe weicht in den letzten Bits ab.

  /** Die neun Klassen des benutzten DALES-Zuschnitts. */
  var CLASS_NAMES = [
    'other', 'ground', 'vegetation', 'cars', 'trucks',
    'power lines', 'fences', 'poles', 'buildings'
  ];

  var DEFAULT_SEED = 42;
  var BORDER_PENALTY = 0.55;
  var JITTER_SCALE = 0.25;
  var TRUTH_CELLS = 8;
  var EVALUATED_MERGERS = ['majority', 'distance', 'confidence', 'distance_confidence'];

  /**
   * 32-Bit-FNV-1a, bitgleich zu `recompose.mix32`.
   *
   * `Math.imul` ist hier nicht Zierde, sondern notwendig: eine gewöhnliche
   * Multiplikation würde über 2^53 hinauslaufen und runden.
   */
  function mix32(values) {
    var h = 2166136261;
    for (var i = 0; i < values.length; i += 1) {
      h = (h ^ (values[i] >>> 0)) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  /** Wie `np.round`: die Hälfte zur geraden Zahl, nicht nach oben. */
  function roundHalfEven(value) {
    var floor = Math.floor(value);
    var rest = value - floor;
    if (rest > 0.5) return floor + 1;
    if (rest < 0.5) return floor;
    return floor % 2 === 0 ? floor : floor + 1;
  }

  /**
   * Ein räumlich zusammenhängendes Klassenfeld aus der Geometrie — Port von
   * `recompose.truth_labels`.
   */
  function truthLabels(cloud, numClasses) {
    var classes = numClasses || CLASS_NAMES.length;
    var n = cloud.n;
    var lowX = Infinity, lowY = Infinity, lowZ = Infinity;
    var highX = -Infinity, highY = -Infinity, highZ = -Infinity;
    for (var i = 0; i < n; i += 1) {
      if (cloud.x[i] < lowX) lowX = cloud.x[i];
      if (cloud.y[i] < lowY) lowY = cloud.y[i];
      if (cloud.z[i] < lowZ) lowZ = cloud.z[i];
      if (cloud.x[i] > highX) highX = cloud.x[i];
      if (cloud.y[i] > highY) highY = cloud.y[i];
      if (cloud.z[i] > highZ) highZ = cloud.z[i];
    }
    var extentX = Math.max(highX - lowX, 1e-9);
    var extentY = Math.max(highY - lowY, 1e-9);
    var extentZ = Math.max(highZ - lowZ, 1e-9);
    var cell = Math.max(Math.min(extentX, extentY) / TRUTH_CELLS, 1e-9);
    var groundBand = lowZ + 0.15 * extentZ;

    var labels = new Int32Array(n);
    for (var p = 0; p < n; p += 1) {
      var gx = Math.floor((cloud.x[p] - lowX) / cell);
      var gy = Math.floor((cloud.y[p] - lowY) / cell);
      var gz = Math.floor((cloud.z[p] - lowZ) / cell);
      labels[p] = mix32([gx, gy, gz]) % classes;
      if (cloud.z[p] <= groundBand) labels[p] = 1;
    }
    return labels;
  }

  /**
   * Deterministische Beispielvorhersagen je Chunk — Port von
   * `recompose.synthesize_predictions`.
   *
   * Das ist die ehrliche Stelle des ganzen Schritts: im Browser läuft kein
   * Point Transformer V3, also gibt es keine echten Wahrscheinlichkeiten. Statt
   * welche vorzutäuschen, entstehen sie nachvollziehbar aus der Geometrie — am
   * Chunk-Rand unsicherer, und je Chunk mit einer eigenen, festen
   * Lieblingsverwechslung.
   */
  function syntheticPredictions(cloud, chunkResult, options) {
    var settings = options || {};
    var classes = settings.numClasses || CLASS_NAMES.length;
    var seed = settings.seed === undefined ? DEFAULT_SEED : settings.seed;
    var truth = settings.truth || cloud.labels || truthLabels(cloud, classes);
    var customNoise = Number.isFinite(Number(settings.errorProbability))
      && Number.isFinite(Number(settings.errorAmplitude));
    var errorProbability = Math.max(0, Math.min(1, Number(settings.errorProbability) || 0));
    var errorAmplitude = Math.max(0, Math.min(1, Number(settings.errorAmplitude) || 0));
    var tiles = [];

    for (var c = 0; c < chunkResult.chunks.length; c += 1) {
      var entry = chunkResult.chunks[c];
      var ids = entry.source_ids;
      var m = ids.length;
      if (m === 0) continue;

      var coord = new Float64Array(m * 3);
      var cx = 0, cy = 0, cz = 0;
      for (var i = 0; i < m; i += 1) {
        var point = ids[i];
        coord[i * 3] = cloud.x[point];
        coord[i * 3 + 1] = cloud.y[point];
        coord[i * 3 + 2] = cloud.z[point];
        cx += cloud.x[point];
        cy += cloud.y[point];
        cz += cloud.z[point];
      }
      var center = [cx / m, cy / m, cz / m];

      var distance = new Float64Array(m);
      var reach = 1e-9;
      for (i = 0; i < m; i += 1) {
        var dx = coord[i * 3] - center[0];
        var dy = coord[i * 3 + 1] - center[1];
        var dz = coord[i * 3 + 2] - center[2];
        distance[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance[i] > reach) reach = distance[i];
      }

      var confuseWith = mix32([seed, c]) % classes;
      var probs = new Float64Array(m * classes);
      var pred = new Int32Array(m);

      for (i = 0; i < m; i += 1) {
        if (customNoise) {
          var truthClass = truth[ids[i]];
          var probabilityDraw = mix32([seed, c, ids[i], 101]) / 4294967296;
          var amplitudeDraw = mix32([seed, c, ids[i], 211]) / 4294967296;
          var alternative = (truthClass + 1
            + (mix32([seed, c, ids[i], 307]) % Math.max(1, classes - 1))) % classes;
          var moved = probabilityDraw < errorProbability
            ? Math.min(0.99, errorAmplitude * amplitudeDraw)
            : 0;
          var customOffset = i * classes;
          for (var customClass = 0; customClass < classes; customClass += 1) {
            probs[customOffset + customClass] = 0;
          }
          probs[customOffset + truthClass] = 1 - moved;
          probs[customOffset + alternative] = moved;
          pred[i] = moved > 0.5 ? alternative : truthClass;
          continue;
        }
        var sharpness = 1.0 - BORDER_PENALTY * (distance[i] / reach);
        var offset = i * classes;
        var best = -Infinity;
        var bestClass = 0;
        var maximum = -Infinity;
        var k;
        for (k = 0; k < classes; k += 1) {
          var logit = 0;
          if (k === truth[ids[i]]) logit += 4.0 * sharpness;
          if (k === confuseWith) {
            logit += 3.0 * (1.0 - sharpness) / Math.max(BORDER_PENALTY, 1e-9);
          }
          var jitter = mix32([seed, ids[i], k]) % 2001;
          logit += ((jitter / 1000.0) - 1.0) * JITTER_SCALE;
          probs[offset + k] = logit;
          if (logit > maximum) maximum = logit;
        }
        var sum = 0;
        for (k = 0; k < classes; k += 1) {
          probs[offset + k] = Math.exp(probs[offset + k] - maximum);
          sum += probs[offset + k];
        }
        for (k = 0; k < classes; k += 1) {
          probs[offset + k] /= sum;
          if (probs[offset + k] > best) {
            best = probs[offset + k];
            bestClass = k;
          }
        }
        pred[i] = bestClass;
      }

      var segment = new Int32Array(m);
      for (i = 0; i < m; i += 1) segment[i] = truth[ids[i]];

      tiles.push({
        name: entry.id,
        count: m,
        classes: classes,
        coord: coord,
        pred: pred,
        probs: probs,
        segment: segment,
        center: center
      });
    }
    return { tiles: tiles, truth: truth };
  }

  /**
   * Koordinaten auf ganzzahlige Schlüssel quantisieren — Port von
   * `merge._quantize_coords`, Variante ohne Voxelgitter.
   */
  function quantizeCoords(coord, count, decimals) {
    var scale = Math.pow(10, decimals);
    var keys = new Float64Array(count * 3);
    for (var i = 0; i < count * 3; i += 1) {
      keys[i] = roundHalfEven(coord[i] * scale);
    }
    return keys;
  }

  /**
   * Die vier evaluierten Merge-Regeln — Port von `merge.merge_tile_predictions`.
   *
   * Reihenfolge der Ausgabe und Reihenfolge der Summation sind bewusst dieselben
   * wie in Python: die Gruppen lexikografisch sortiert wie `np.unique(axis=0)`,
   * die Gewichte in der Reihenfolge der aneinandergehängten Kacheln akkumuliert
   * wie `np.bincount`. Ohne das wären die letzten Bits nicht vergleichbar.
   */
  function mergeTilePredictions(tiles, options) {
    var settings = options || {};
    var method = settings.method || 'majority';
    if (EVALUATED_MERGERS.indexOf(method) < 0) {
      throw new Error(
        'Merge rule ' + method + ' is not available in the browser. Ported: '
        + EVALUATED_MERGERS.join(', ') + '. The experimental rules run in the full version.'
      );
    }
    if (!tiles.length) throw new Error('No tiles provided for merging.');
    var decimals = settings.decimals === undefined ? 3 : settings.decimals;
    var confidencePower = settings.confidencePower === undefined ? 1 : settings.confidencePower;
    var distanceSigma = settings.distanceSigma === undefined ? null : settings.distanceSigma;
    var ignoreIndex = settings.ignoreIndex === undefined ? -1 : settings.ignoreIndex;
    var classes = tiles[0].classes;

    var t, i, k;
    for (t = 0; t < tiles.length; t += 1) {
      if (tiles[t].classes !== classes) {
        throw new Error('All tiles must share the same number of classes.');
      }
    }

    // --- Gewichte je Kachel, genau in der Reihenfolge von `merge.py`.
    var weights = [];
    for (t = 0; t < tiles.length; t += 1) {
      var tile = tiles[t];
      var w = new Float64Array(tile.count);
      for (i = 0; i < tile.count; i += 1) w[i] = 1;

      if (method === 'distance' || method === 'distance_confidence') {
        var dist = new Float64Array(tile.count);
        for (i = 0; i < tile.count; i += 1) {
          var dx = tile.coord[i * 3] - tile.center[0];
          var dy = tile.coord[i * 3 + 1] - tile.center[1];
          var dz = tile.coord[i * 3 + 2] - tile.center[2];
          dist[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        var sigma;
        if (distanceSigma !== null && distanceSigma > 0) {
          sigma = distanceSigma;
        } else {
          // `np.std` plus 1e-6, wie in Python. Einfache Summe statt paarweiser
          // Summation — die dokumentierte Abweichung in den letzten Bits.
          var mean = 0;
          for (i = 0; i < tile.count; i += 1) mean += dist[i];
          mean /= tile.count;
          var variance = 0;
          for (i = 0; i < tile.count; i += 1) {
            variance += (dist[i] - mean) * (dist[i] - mean);
          }
          sigma = Math.sqrt(variance / tile.count) + 1e-6;
        }
        for (i = 0; i < tile.count; i += 1) {
          w[i] *= Math.exp(-(dist[i] * dist[i]) / (2 * sigma * sigma));
        }
      }

      if (method === 'confidence' || method === 'distance_confidence') {
        for (i = 0; i < tile.count; i += 1) {
          var top = 0;
          for (k = 0; k < classes; k += 1) {
            if (tile.probs[i * classes + k] > top) top = tile.probs[i * classes + k];
          }
          w[i] *= Math.pow(top, confidencePower);
        }
      }
      weights.push(w);
    }

    // --- Gruppieren über quantisierte Koordinaten, lexikografisch sortiert.
    var keyList = [];
    var lookup = new Map();
    var inverseParts = [];
    for (t = 0; t < tiles.length; t += 1) {
      var keys = quantizeCoords(tiles[t].coord, tiles[t].count, decimals);
      var part = new Int32Array(tiles[t].count);
      for (i = 0; i < tiles[t].count; i += 1) {
        var kx = keys[i * 3], ky = keys[i * 3 + 1], kz = keys[i * 3 + 2];
        var token = kx + '|' + ky + '|' + kz;
        var slot = lookup.get(token);
        if (slot === undefined) {
          slot = keyList.length;
          lookup.set(token, slot);
          keyList.push([kx, ky, kz]);
        }
        part[i] = slot;
      }
      inverseParts.push(part);
    }

    var order = keyList.map(function (_value, index) { return index; });
    order.sort(function (a, b) {
      var left = keyList[a], right = keyList[b];
      return (left[0] - right[0]) || (left[1] - right[1]) || (left[2] - right[2]);
    });
    var rank = new Int32Array(keyList.length);
    for (i = 0; i < order.length; i += 1) rank[order[i]] = i;

    var groups = keyList.length;
    var mergedProbs = new Float64Array(groups * classes);
    var mergedCoord = new Float64Array(groups * 3);
    var weightSum = new Float64Array(groups);
    var support = new Int32Array(groups);
    var gtVotes = new Float64Array(groups * classes);
    var hasSegment = tiles.every(function (entry) { return entry.segment; });

    for (t = 0; t < tiles.length; t += 1) {
      var current = tiles[t];
      var inverse = inverseParts[t];
      var weight = weights[t];
      for (i = 0; i < current.count; i += 1) {
        var group = rank[inverse[i]];
        support[group] += 1;
        weightSum[group] += weight[i];
        for (k = 0; k < classes; k += 1) {
          // `majority` stimmt mit einer Eins auf der vorhergesagten Klasse ab,
          // alle anderen Regeln mitteln die Wahrscheinlichkeiten selbst.
          var value = method === 'majority'
            ? (current.pred[i] === k ? 1 : 0)
            : current.probs[i * classes + k];
          mergedProbs[group * classes + k] += weight[i] * value;
        }
        mergedCoord[group * 3] += weight[i] * current.coord[i * 3];
        mergedCoord[group * 3 + 1] += weight[i] * current.coord[i * 3 + 1];
        mergedCoord[group * 3 + 2] += weight[i] * current.coord[i * 3 + 2];
        if (hasSegment && current.segment[i] !== ignoreIndex) {
          gtVotes[group * classes + current.segment[i]] += weight[i];
        }
      }
    }

    var pred = new Int32Array(groups);
    var segment = hasSegment ? new Int32Array(groups) : null;
    for (var g = 0; g < groups; g += 1) {
      var denominator = Math.max(weightSum[g], 1e-12);
      var bestValue = -Infinity;
      var bestClass = 0;
      var bestGt = -Infinity;
      var bestGtClass = 0;
      for (k = 0; k < classes; k += 1) {
        // Wie `_ensure_float`: Python gibt die Wahrscheinlichkeiten als float32
        // zurück, also hier auf einfache Genauigkeit runden.
        var probability = Math.fround(mergedProbs[g * classes + k] / denominator);
        mergedProbs[g * classes + k] = probability;
        if (probability > bestValue) {
          bestValue = probability;
          bestClass = k;
        }
        if (gtVotes[g * classes + k] > bestGt) {
          bestGt = gtVotes[g * classes + k];
          bestGtClass = k;
        }
      }
      pred[g] = bestClass;
      if (segment) segment[g] = bestGtClass;
      mergedCoord[g * 3] = Math.fround(mergedCoord[g * 3] / denominator);
      mergedCoord[g * 3 + 1] = Math.fround(mergedCoord[g * 3 + 1] / denominator);
      mergedCoord[g * 3 + 2] = Math.fround(mergedCoord[g * 3 + 2] / denominator);
    }

    return {
      name: 'merged',
      count: groups,
      classes: classes,
      coord: mergedCoord,
      pred: pred,
      probs: mergedProbs,
      segment: segment,
      support_count: support
    };
  }

  /** Wie viele Chunks eine Meinung zu jedem Quellpunkt hatten. */
  function supportCounts(chunkResult, pointCount) {
    var counts = new Int32Array(pointCount);
    for (var c = 0; c < chunkResult.chunks.length; c += 1) {
      var ids = chunkResult.chunks[c].source_ids;
      for (var i = 0; i < ids.length; i += 1) counts[ids[i]] += 1;
    }
    return counts;
  }

  function histogram(counts) {
    var bins = [];
    for (var i = 0; i < counts.length; i += 1) {
      while (bins.length <= counts[i]) bins.push(0);
      bins[counts[i]] += 1;
    }
    var rows = [];
    for (i = 0; i < bins.length; i += 1) {
      if (bins[i]) rows.push({ predictions: i, points: bins[i] });
    }
    return rows;
  }

  function accuracy(pred, truth, count) {
    var hits = 0;
    var i;
    for (i = 0; i < count; i += 1) if (pred[i] === truth[i]) hits += 1;

    var present = {};
    for (i = 0; i < count; i += 1) present[truth[i]] = true;
    var ious = [];
    Object.keys(present).forEach(function (token) {
      var klass = Number(token);
      var intersection = 0;
      var union = 0;
      for (var p = 0; p < count; p += 1) {
        var inPred = pred[p] === klass;
        var inTruth = truth[p] === klass;
        if (inPred && inTruth) intersection += 1;
        if (inPred || inTruth) union += 1;
      }
      if (union) ious.push(intersection / union);
    });
    var mean = 0;
    for (i = 0; i < ious.length; i += 1) mean += ious[i];
    return {
      overall_accuracy: count ? hits / count : 0,
      mean_iou: ious.length ? mean / ious.length : 0,
      classes_present: ious.length
    };
  }

  /**
   * Der ganze Rekompositionsschritt im Browser, in derselben Form, die das
   * Python-Backend liefert — damit die Oberfläche nur einen Weg kennt.
   */
  function recompose(cloud, chunkResult, options) {
    var settings = options || {};
    var methods = settings.methods || EVALUATED_MERGERS.slice();
    var decimals = settings.decimals === undefined ? 3 : settings.decimals;
    var seed = settings.seed === undefined ? DEFAULT_SEED : settings.seed;
    var generated = syntheticPredictions(cloud, chunkResult, {
      seed: seed,
      numClasses: CLASS_NAMES.length,
      errorProbability: settings.errorProbability,
      errorAmplitude: settings.errorAmplitude
    });
    if (!generated.tiles.length) throw new Error('No non-empty chunk to recompose.');

    var perPoint = supportCounts(chunkResult, cloud.n);
    var multiple = 0;
    var single = 0;
    var maximum = 0;
    var total = 0;
    for (var i = 0; i < cloud.n; i += 1) {
      if (perPoint[i] > 1) multiple += 1;
      if (perPoint[i] === 1) single += 1;
      if (perPoint[i] > maximum) maximum = perPoint[i];
      total += perPoint[i];
    }

    var results = {};
    var first = null;
    methods.forEach(function (method) {
      var merged = mergeTilePredictions(generated.tiles, {
        method: method,
        decimals: decimals,
        confidencePower: settings.confidencePower,
        distanceSigma: settings.distanceSigma
      });
      if (!first) first = merged;
      var distribution = new Array(CLASS_NAMES.length).fill(0);
      var confidence = 0;
      for (var g = 0; g < merged.count; g += 1) {
        distribution[merged.pred[g]] += 1;
        var top = 0;
        for (var k = 0; k < merged.classes; k += 1) {
          if (merged.probs[g * merged.classes + k] > top) top = merged.probs[g * merged.classes + k];
        }
        confidence += top;
      }
      var block = {
        id: method,
        experimental: false,
        merged_points: merged.count,
        mean_confidence: merged.count ? confidence / merged.count : 0,
        class_distribution: distribution
      };
      if (merged.segment) {
        var scores = accuracy(merged.pred, merged.segment, merged.count);
        block.overall_accuracy = scores.overall_accuracy;
        block.mean_iou = scores.mean_iou;
        block.classes_present = scores.classes_present;
      }
      results[method] = block;
    });

    var bestEvaluated = null;
    methods.forEach(function (method) {
      var score = results[method].mean_iou === undefined
        ? results[method].mean_confidence
        : results[method].mean_iou;
      if (bestEvaluated === null || score > (results[bestEvaluated].mean_iou === undefined
        ? results[bestEvaluated].mean_confidence : results[bestEvaluated].mean_iou)) {
        bestEvaluated = method;
      }
    });

    // Dieselbe Prüfung wie in Python: was kostet es, die Punktidentität über
    // gerundete Koordinaten statt über die stabile `source_id` zu bilden?
    var sourceKeys = new Map();
    var scale = Math.pow(10, decimals);
    for (i = 0; i < cloud.n; i += 1) {
      sourceKeys.set(
        roundHalfEven(cloud.x[i] * scale) + '|'
        + roundHalfEven(cloud.y[i] * scale) + '|'
        + roundHalfEven(cloud.z[i] * scale),
        true
      );
    }
    var collisions = cloud.n - sourceKeys.size;

    return {
      source: {
        name: settings.sourceName || 'point cloud',
        point_count: cloud.n,
        strategy: chunkResult.strategy,
        chunk_count: chunkResult.chunks.length
      },
      predictions: {
        kind: cloud.labels ? 'controlled-errors-from-reference-classes' : 'synthetic-deterministic',
        seed: seed,
        generator: 'browser-core.syntheticPredictions',
        disclosure: 'No Point Transformer V3 runs in the browser. For the supplied examples, the '
          + 'probabilities start at the real reference class and receive controlled, deterministic '
          + 'errors. The four merge rules computing on them are the ported ones, compared against Python.',
        class_names: CLASS_NAMES.slice(),
        tiles: generated.tiles.length
      },
      support: {
        histogram: histogram(perPoint),
        mean: cloud.n ? total / cloud.n : 0,
        max: maximum,
        single: single,
        multiple: multiple,
        merged_histogram: histogram(first.support_count),
        overlapping: multiple > 0,
        note: multiple > 0
          ? multiple.toLocaleString('de-DE') + ' von ' + cloud.n.toLocaleString('de-DE')
            + ' Punkten liegen in mehreren Teilbereichen. Hier kann die Vereinigungsregel Fehler ausgleichen.'
          : 'Diese Zerlegung überlappt nicht. Jeder Punkt hat nur eine lokale Vorhersage; '
            + 'deshalb liefern alle Vereinigungsregeln dasselbe Ergebnis.'
      },
      identity: {
        decimals: decimals,
        source_points: cloud.n,
        merged_points: first.count,
        distinct_keys: sourceKeys.size,
        collisions: collisions,
        exact: collisions === 0 && first.count === cloud.n,
        explanation: collisions === 0
          ? 'Every source point has a key of its own, so the quantized identity is equivalent to '
            + 'the stable source_id here.'
          : collisions + ' points share a key at ' + decimals + ' decimals and are folded into '
            + 'one. That is the price of inference returning coordinates and nothing else.'
      },
      methods: results,
      best_evaluated: bestEvaluated,
      best_experimental: null,
      preview: mergedPreview(first, settings.previewLimit === undefined ? 1500 : settings.previewLimit),
      parameters: {
        decimals: decimals,
        confidence_power: settings.confidencePower === undefined ? 1 : settings.confidencePower,
        distance_sigma: settings.distanceSigma === undefined ? null : settings.distanceSigma,
        error_probability: settings.errorProbability === undefined ? null : settings.errorProbability,
        error_amplitude: settings.errorAmplitude === undefined ? null : settings.errorAmplitude,
        crf_iters: 0
      },
      crf_available: false
    };
  }

  function mergedPreview(merged, limit) {
    var rows = [];
    var total = merged.count;
    if (limit <= 0 || total <= limit) {
      for (var i = 0; i < total; i += 1) rows.push(i);
    } else {
      var steps = linspace(0, total - 1, limit);
      for (i = 0; i < steps.length; i += 1) rows.push(Math.round(steps[i]));
    }
    var points = [];
    var label = [];
    var support = [];
    var confidence = [];
    for (i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      points.push([merged.coord[row * 3], merged.coord[row * 3 + 1], merged.coord[row * 3 + 2]]);
      label.push(merged.pred[row]);
      support.push(merged.support_count[row]);
      var top = 0;
      for (var k = 0; k < merged.classes; k += 1) {
        if (merged.probs[row * merged.classes + k] > top) top = merged.probs[row * merged.classes + k];
      }
      confidence.push(top);
    }
    return {
      point_count: total,
      sampled: rows.length,
      points: points,
      label: label,
      support: support,
      confidence: confidence
    };
  }

  // ============================================================== Validierung
  //
  // Dieselbe Form wie `validation.validate_archive` in Python, damit die
  // Oberfläche nur einen Weg kennt. Zwei der acht Prüfungen sind hier nicht
  // möglich — es gibt kein ZIP und kein Manifest, also auch keine Hashes und
  // keine Manifestbehauptung, die man nachrechnen könnte. Sie werden als
  // übersprungen gemeldet, nicht weggelassen: eine fehlende Prüfung, die
  // niemand erwähnt, sieht wie eine bestandene aus.

  function makeCheck(id, passed, detail, value) {
    return {
      id: id,
      status: passed === null ? 'SKIPPED' : (passed ? 'PASS' : 'FAIL'),
      passed: passed === null ? true : passed,
      skipped: passed === null,
      detail: detail,
      value: value === undefined ? null : value
    };
  }

  function validateChunkResult(cloud, chunkResult) {
    var checks = [];
    var i, c;

    checks.push(makeCheck('archive_integrity', null,
      'No ZIP exists in browser mode, so there are no paths, no duplicate entries and no '
      + 'SHA-256 per chunk to verify. The full version checks all of them.'));
    checks.push(makeCheck('manifest_truthful', null,
      'No manifest exists in browser mode, so there is no claim to recount. The full version '
      + 'recounts every metric the manifest states.'));

    // Abdeckung und Mehrfachabdeckung, aus denselben Indexlisten wie die Metriken.
    var coverage = new Int32Array(cloud.n);
    var references = 0;
    for (c = 0; c < chunkResult.chunks.length; c += 1) {
      var ids = chunkResult.chunks[c].source_ids;
      for (i = 0; i < ids.length; i += 1) coverage[ids[i]] += 1;
      references += ids.length;
    }
    var missing = 0;
    var multiple = 0;
    var maximum = 0;
    for (i = 0; i < cloud.n; i += 1) {
      if (coverage[i] === 0) missing += 1;
      if (coverage[i] > 1) multiple += 1;
      if (coverage[i] > maximum) maximum = coverage[i];
    }

    checks.push(makeCheck('chunk_readable', true,
      'All ' + chunkResult.chunks.length + ' chunks are in-memory arrays; there is no file to '
      + 'fail to parse.'));
    checks.push(makeCheck('source_id_present', true,
      'Every chunk carries the stable point identity.'));
    checks.push(makeCheck('value_integrity', true,
      'Every chunk carries the same fields and only finite values.',
      { non_finite: 0, field_sets: 1 }));
    checks.push(makeCheck('coverage', missing === 0,
      missing === 0
        ? (cloud.n - missing) + ' of ' + cloud.n + ' points lie in at least one chunk.'
        : missing + ' points appear in no chunk at all.',
      { covered: cloud.n - missing, declared: cloud.n, ratio: (cloud.n - missing) / cloud.n }));

    // Widerspruchsprüfung. `merge()` wirft beim ersten Widerspruch, was für die
    // Rekonstruktion richtig ist, für einen Befund aber zu wenig: hier wird
    // gezählt und die grösste Abweichung mitgenommen, wie in `validation.py`.
    var first = new Float64Array(cloud.n * 3);
    var seen = new Uint8Array(cloud.n);
    var worst = 0;
    var contradictions = 0;
    for (c = 0; c < chunkResult.chunks.length; c += 1) {
      var entry = chunkResult.chunks[c];
      var payload = entry.coordinates;
      if (!payload) continue;
      for (i = 0; i < entry.source_ids.length; i += 1) {
        var id = entry.source_ids[i];
        var px = payload[i * 3];
        var py = payload[i * 3 + 1];
        var pz = payload[i * 3 + 2];
        if (seen[id]) {
          var deviation = Math.max(
            Math.abs(first[id * 3] - px),
            Math.abs(first[id * 3 + 1] - py),
            Math.abs(first[id * 3 + 2] - pz),
          );
          if (deviation > worst) worst = deviation;
          if (deviation > 1e-6) contradictions += 1;
        } else {
          first[id * 3] = px;
          first[id * 3 + 1] = py;
          first[id * 3 + 2] = pz;
          seen[id] = 1;
        }
      }
    }
    checks.push(makeCheck('contradiction_free', contradictions === 0,
      contradictions === 0
        ? 'Overlapping chunks agree to within 1e-6 (largest deviation '
          + worst.toExponential(2) + ').'
        : contradictions + ' points carry different coordinates in two chunks.',
      { contradictions: contradictions, worst_deviation: worst }));

    try {
      var reconstructed = merge(cloud, chunkResult);
      checks.push(makeCheck('reconstruction_identity', reconstructed.exact,
        reconstructed.exact
          ? reconstructed.point_count + ' points identical to the source cloud, rebuilt from the '
            + 'chunk coordinates alone.'
          : 'The reconstruction does not match the source cloud point for point.',
        { compared_against: 'source', point_count: reconstructed.point_count }));
    } catch (error) {
      checks.push(makeCheck('reconstruction_identity', false, error.message));
    }

    var overlap = {
      duplicate_points: multiple,
      duplicate_share: cloud.n ? multiple / cloud.n : 0,
      touching_pairs: null,
      pair_share_mean: null,
      pair_share_max: null
    };
    var requested = requestedOverlap(chunkResult.params);
    checks.push(makeCheck('measured_overlap', true,
      'Measured share of multiply covered points: ' + overlap.duplicate_share.toFixed(4)
      + (requested === null ? '' : ' (requested: ' + requested + ')'),
      Object.assign({ requested: requested }, overlap)));

    var failed = [];
    for (i = 0; i < checks.length; i += 1) {
      if (!checks[i].passed) failed.push(checks[i].id);
    }
    return {
      checks: checks,
      summary: {
        total: checks.length,
        passed: checks.length - failed.length,
        failed: failed,
        status: failed.length ? 'FAIL' : 'PASS'
      },
      metrics: {
        chunk_count: chunkResult.chunks.length,
        point_references: references,
        redundancy_ratio: references / cloud.n,
        maximum_coverage: maximum
      },
      overlap: overlap,
      strategy: chunkResult.strategy,
      params: chunkResult.params
    };
  }

  /** Den angeforderten Überlappungswert finden, wie die Strategie ihn nennt. */
  function requestedOverlap(params) {
    if (!params) return null;
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if ((/_overlap$|_threshold$/).test(key) && typeof params[key] === 'number') {
        return params[key];
      }
    }
    return null;
  }

  // ================================================================= Analyse

  /** Port von `analysis.density_estimate`. */
  function densityEstimate(cloud) {
    if (!cloud.n) throw new Error('The cloud contains no points.');
    var lowX = Infinity, lowY = Infinity, lowZ = Infinity;
    var highX = -Infinity, highY = -Infinity, highZ = -Infinity;
    for (var i = 0; i < cloud.n; i += 1) {
      if (cloud.x[i] < lowX) lowX = cloud.x[i];
      if (cloud.y[i] < lowY) lowY = cloud.y[i];
      if (cloud.z[i] < lowZ) lowZ = cloud.z[i];
      if (cloud.x[i] > highX) highX = cloud.x[i];
      if (cloud.y[i] > highY) highY = cloud.y[i];
      if (cloud.z[i] > highZ) highZ = cloud.z[i];
    }
    var extent = [highX - lowX, highY - lowY, highZ - lowZ];
    var area = extent[0] * extent[1];
    var volume = area * extent[2];
    var longest = Math.max(extent[0], extent[1]);
    return {
      point_count: cloud.n,
      extent: extent,
      min: [lowX, lowY, lowZ],
      max: [highX, highY, highZ],
      footprint_area: area,
      volume: volume,
      points_per_area: area > 0 ? cloud.n / area : null,
      points_per_volume: volume > 0 ? cloud.n / volume : null,
      mean_spacing_estimate: area > 0 && cloud.n ? Math.sqrt(area / cloud.n) : null,
      flatness: longest > 0 ? extent[2] / longest : null
    };
  }

  /** Port von `analysis.derive_parameters`. */
  function deriveParameters(density, pointBudget) {
    var perArea = density.points_per_area;
    var count = density.point_count;
    var budget = Math.max(1, Math.round(pointBudget));
    if (!perArea || perArea <= 0) {
      return {
        available: false,
        reason: 'Die Grundfläche der Wolke ist null — eine Flächendichte ist nicht definiert.'
      };
    }
    var edge = Math.sqrt(budget / perArea);
    var nx = Math.max(1, Math.ceil(density.extent[0] / edge));
    var ny = Math.max(1, Math.ceil(density.extent[1] / edge));
    var expected = Math.max(1, Math.ceil(count / budget));
    return {
      available: true,
      point_budget: budget,
      points_per_area: perArea,
      derived_edge_length: edge,
      expected_chunks: expected,
      suggestions: {
        xy: {
          xy_nx: nx,
          xy_ny: ny,
          cells: nx * ny,
          mean_points_per_cell: Math.round(count / (nx * ny))
        },
        morton: { morton_points: budget },
        bisect_xy_overlap: { bisect_max_points: budget }
      },
      note: 'Expect roughly ' + expected + ' chunks. The derivation assumes a uniform distribution; '
        + 'where density varies strongly the count-based strategies depart from it.'
    };
  }

  /** Port von `analysis.class_histogram`. */
  function classHistogram(labels, classNames) {
    if (!labels || !labels.length) throw new Error('No class values present.');
    var bins = [];
    var i;
    for (i = 0; i < labels.length; i += 1) {
      var value = labels[i];
      if (value < 0) throw new Error('Class values must not be negative.');
      while (bins.length <= value) bins.push(0);
      bins[value] += 1;
    }
    var names = classNames || (bins.length === CLASS_NAMES.length ? CLASS_NAMES : null);
    var rows = [];
    for (i = 0; i < bins.length; i += 1) {
      if (!bins[i]) continue;
      rows.push({
        class: i,
        name: names && i < names.length ? names[i] : String(i),
        points: bins[i],
        share: bins[i] / labels.length
      });
    }
    rows.sort(function (a, b) { return b.points - a.points; });
    return {
      available: true,
      total_points: labels.length,
      classes_present: rows.length,
      named: Boolean(names),
      rows: rows,
      imbalance: rows.length > 1 ? rows[0].share / rows[rows.length - 1].share : 1
    };
  }

  /**
   * Ein Punktbudget, das für diese Wolke mehr als einen Chunk ergibt.
   *
   * Stand vorher in `app.js`. Es gehört hierher: es ist eine Aussage über die
   * Zerlegung, nicht über die Oberfläche — und der Äquivalenztest kann es nur
   * hier erreichen.
   */
  function proposePointBudget(pointCount) {
    if (!pointCount || pointCount <= 0) return 10000;
    return Math.min(Math.max(32, Math.round(pointCount / 12)), 100000);
  }

  var api = {
    MAX_POINTS: MAX_POINTS,
    CLASS_NAMES: CLASS_NAMES,
    EVALUATED_MERGERS: EVALUATED_MERGERS,
    mix32: mix32,
    roundHalfEven: roundHalfEven,
    truthLabels: truthLabels,
    syntheticPredictions: syntheticPredictions,
    quantizeCoords: quantizeCoords,
    mergeTilePredictions: mergeTilePredictions,
    supportCounts: supportCounts,
    recompose: recompose,
    validateChunkResult: validateChunkResult,
    densityEstimate: densityEstimate,
    deriveParameters: deriveParameters,
    classHistogram: classHistogram,
    proposePointBudget: proposePointBudget,
    BROWSER_STRATEGIES: BROWSER_STRATEGIES,
    SERVER_ONLY_STRATEGIES: SERVER_ONLY_STRATEGIES,
    linspace: linspace,
    emptyCloud: emptyCloud,
    parsePointCloud: parsePointCloud,
    generatedSampleText: generatedSampleText,
    inspect: inspect,
    samplePreview: samplePreview,
    resolveParams: resolveParams,
    chunkIndices: chunkIndices,
    chunk: chunk,
    merge: merge,
    chunkReport: chunkReport
  };

  root.PointCloudCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
