/* Erzeugt von presentation/tools/coverage.py. Nicht von Hand ändern —
 * Quelle ist presentation/tools/capability_registry.py.
 * Als klassisches Skript, damit die Daten auch nach einem Doppelklick auf
 * index.html zur Verfügung stehen: ab file:// ist fetch auf lokale Dateien
 * blockiert. */
(function (root) {
  root.PointCloudCapabilities = {
 "schema": 1,
 "generated_by": "presentation/tools/coverage.py",
 "levels": {
  "CORE_UI": "Part of the normal workflow.",
  "ADVANCED_UI": "Runnable, deliberately behind the research area.",
  "FULL_TOOL_ONLY": "Runnable only in the complete Python implementation.",
  "ENGINEERING_EVIDENCE": "Represented by verified measurements rather than an interactive rerun.",
  "EXPERIMENTAL_LAB": "Visible and explicitly labelled a prototype.",
  "DOCUMENTED_RESEARCH": "Deliberately documented, deliberately not runnable.",
  "NOT_REPRESENTED": "No intentional place in the tool."
 },
 "provenance": {
  "ORIGINAL": "Designed and implemented by me.",
  "MODIFIED_UPSTREAM": "Third-party code substantially extended by me; my share is named.",
  "UPSTREAM": "Pointcept, PTv3, CUDA libraries, DALES — not my work.",
  "EXPERIMENTAL": "Written by me, deliberately outside the reported results.",
  "RESEARCH_INFRASTRUCTURE": "Written by me; part of the investigation, not of the product."
 },
 "maturity": {
  "FINAL": "Part of the final evaluation of the thesis.",
  "EXPERIMENTAL": "Implemented, deliberately outside the evaluation.",
  "ABANDONED": "Started or earmarked and never finished.",
  "INFRASTRUCTURE": "A tool of the research process, not a subject of measurement."
 },
 "areas": [
  {
   "id": "inspect",
   "title": "Inspect",
   "kind": "workflow"
  },
  {
   "id": "decompose",
   "title": "Decompose",
   "kind": "workflow"
  },
  {
   "id": "validate",
   "title": "Validate",
   "kind": "workflow"
  },
  {
   "id": "recompose",
   "title": "Recompose",
   "kind": "workflow"
  },
  {
   "id": "analyze",
   "title": "Analyze",
   "kind": "workflow"
  },
  {
   "id": "export",
   "title": "Export",
   "kind": "workflow"
  },
  {
   "id": "performance",
   "title": "Performance & Scalability",
   "kind": "research"
  },
  {
   "id": "resources",
   "title": "Resource Management",
   "kind": "research"
  },
  {
   "id": "reproducibility",
   "title": "Experiment Reproducibility",
   "kind": "research"
  },
  {
   "id": "pipeline",
   "title": "Research Pipeline",
   "kind": "research"
  },
  {
   "id": "diagnostics",
   "title": "Diagnostics",
   "kind": "research"
  },
  {
   "id": "lab",
   "title": "Experimental Lab",
   "kind": "research"
  },
  {
   "id": "platform",
   "title": "Platform and distribution",
   "kind": "platform"
  },
  {
   "id": "training",
   "title": "Training side (third-party code)",
   "kind": "upstream"
  }
 ],
 "summary": {
  "atomic": 119,
  "families": 69,
  "represented": 119,
  "represented_before": 28,
  "not_represented": 0,
  "browser_supported": 27,
  "by_state": {
   "CORE_UI": 46,
   "FULL_TOOL_ONLY": 2,
   "ADVANCED_UI": 17,
   "EXPERIMENTAL_LAB": 29,
   "ENGINEERING_EVIDENCE": 18,
   "DOCUMENTED_RESEARCH": 7
  }
 },
 "capabilities": [
  {
   "id": "inspect.ply_ascii",
   "capability": "Read ASCII PLY",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → _read_ply_vertices",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_io.py"
   ]
  },
  {
   "id": "inspect.ply_binary",
   "capability": "Read and write binary PLY",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "FULL_TOOL_ONLY",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → _write_vertices",
   "reason": "A DataView parser for every PLY property variant would be a second implementation of the same thing. The browser mode reads text PLY instead.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_io.py"
   ]
  },
  {
   "id": "inspect.numpy",
   "capability": "Read NPY and NPZ",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "FULL_TOOL_ONLY",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → _read_numpy",
   "reason": "The NPY format needs a binary parser; deliberately not ported to the browser.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_io.py"
   ]
  },
  {
   "id": "inspect.text",
   "capability": "Read XYZ, TXT and CSV",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → _read_text_points",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_io.py"
   ]
  },
  {
   "id": "inspect.summary",
   "capability": "Point count, fields and bounding box",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → inspect_point_cloud",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_pointcloud_app.py"
   ]
  },
  {
   "id": "inspect.preview",
   "capability": "Bounded, evenly spaced preview sample",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → inspect_point_cloud",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_pointcloud_app.py"
   ]
  },
  {
   "id": "inspect.vertex_normals",
   "capability": "Vertex normals from faces",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/io.py → _vertex_normals",
   "reason": "",
   "note": "Reported on load when the file carries faces.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_io.py"
   ]
  },
  {
   "id": "inspect.npy_integrity",
   "capability": "Integrity scan of every .npy file in a dataset",
   "area": "diagnostics",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ADVANCED_UI",
   "canonical": "Thesis repository: scripts/scan_all_npy_integrity.py",
   "reason": "",
   "note": "Its core — header readable, shape and dtype plausible, values finite — runs as a check over the archive instead of over a dataset tree.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "decompose.xy",
   "capability": "xy — 2D XY grid with optional overlap / count-based grid",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → xy_grid_chunk_count_fn",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "decompose.morton",
   "capability": "morton — Morton/Z-order grouping of quantized voxels",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → morton_chunks_idx_fn",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "decompose.kdtree",
   "capability": "kdtree — KD-tree split until point budget with optional overlap",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → kdtree_chunks_fn",
   "reason": "Needs a neighbour search (FAISS or scipy). A JavaScript approximation would be a different method under the same name, so the browser mode does not offer it.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.bisect_xy_overlap",
   "capability": "bisect_xy_overlap — Overlapping bisection on XY axes until point budget",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → bisect_xy_overlap_chunks_fn",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "decompose.rand_knn",
   "capability": "rand_knn — Random center, KNN chunks with optional overlap",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "Needs a neighbour search (FAISS or scipy). A JavaScript approximation would be a different method under the same name, so the browser mode does not offer it.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.rand_cyl",
   "capability": "rand_cyl — Random center, XY-KNN chunks with optional overlap",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "Needs a neighbour search (FAISS or scipy). A JavaScript approximation would be a different method under the same name, so the browser mode does not offer it.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.rand_slope_cyl",
   "capability": "rand_slope_cyl — slope-adaptive cylinders, the seventh chunker",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → rand_slope_cyl_chunks_fn",
   "reason": "",
   "note": "Fully implemented and registered in the library, but never admitted to the quantitative comparison — hence the lab, not the strategy list.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_diana",
   "capability": "experimental_diana",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. Approximate DIANA-style divisive clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_birch",
   "capability": "experimental_birch",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. BIRCH-style clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_cure",
   "capability": "experimental_cure",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. CURE-inspired representative clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_kmedoids",
   "capability": "experimental_kmedoids",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. Approximate k-medoids clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_clarans",
   "capability": "experimental_clarans",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. Approximate CLARANS-style randomized medoid search.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_ward",
   "capability": "experimental_ward",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. Ward-linkage agglomerative clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_dbscan",
   "capability": "experimental_dbscan",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. DBSCAN density clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_optics",
   "capability": "experimental_optics",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "reason": "",
   "note": "OUTDATED experimental prototype; not part of thesis experiments. OPTICS density clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_hdbscan",
   "capability": "experimental_hdbscan",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. HDBSCAN density clustering for irregular shapes and variable density.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_dbscan_baseline",
   "capability": "experimental_dbscan_baseline",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. DBSCAN baseline as a framework-aligned density chunker candidate.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_euclidean_cluster",
   "capability": "experimental_euclidean_cluster",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Euclidean cluster extraction via radius graph / flood fill.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_connected_components",
   "capability": "experimental_connected_components",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Connected-components labeling on a prebuilt local neighborhood graph.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_voxel_grid_cluster",
   "capability": "experimental_voxel_grid_cluster",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Voxel-grid clustering after spatial quantization / densification.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_adaptive_cluster",
   "capability": "experimental_adaptive_cluster",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Adaptive clustering with density-aware local scale changes.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_optics_placeholder",
   "capability": "experimental_optics_placeholder",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. OPTICS placeholder with explicit framework-integration notes.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_region_growing",
   "capability": "experimental_region_growing",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Region growing based on normals, curvature, or local smoothness.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_supervoxel",
   "capability": "experimental_supervoxel",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Supervoxel / VCCS-style presegmentation.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_gmm",
   "capability": "experimental_gmm",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Gaussian-mixture chunker with EM used only as the optimizer.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_bmm",
   "capability": "experimental_bmm",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Bayesian mixture model placeholder as a more expensive probabilistic extension of GMM.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_mean_shift",
   "capability": "experimental_mean_shift",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Mean-shift density-mode chunker.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_bisecting_kmeans",
   "capability": "experimental_bisecting_kmeans",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Bisecting k-means as a balanced hierarchical partitioner.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_auto_kmeans",
   "capability": "experimental_auto_kmeans",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Auto-k-means family placeholder covering X-means, G-means, and DP-means.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_chameleon",
   "capability": "experimental_chameleon",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. CHAMELEON-style graph clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_snn",
   "capability": "experimental_snn",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Shared-nearest-neighbor / Jarvis-Patrick style clustering.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_ransac_seeded",
   "capability": "experimental_ransac_seeded",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. RANSAC-seeded geometric presegmentation.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_spectral",
   "capability": "experimental_spectral",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Spectral clustering placeholder requiring approximation before it becomes realistic.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "lab.experimental_affinity_propagation",
   "capability": "experimental_affinity_propagation",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "ABANDONED",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "reason": "",
   "note": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Affinity propagation placeholder requiring approximation before it becomes realistic.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "decompose.knn_bruteforce",
   "capability": "kNN backend `bruteforce` (exact)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "Blockwise distance comparison, always available, the fallback.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_kdtree",
   "capability": "kNN backend `kdtree` (exact)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "One global scipy cKDTree over the whole scene.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_ann",
   "capability": "kNN backend `ann` (exact)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "The same tree with tolerance `eps`; exact at eps=0.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_local_kdtree",
   "capability": "kNN backend `local_kdtree` (approximate)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "A tree per leaf of a pre-partition instead of one global tree.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_lsh",
   "capability": "kNN backend `lsh` (approximate)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "Random hyperplanes, candidates from the Hamming neighbourhood.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_annoy",
   "capability": "kNN backend `annoy` (approximate)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "Annoy index, built on disk.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_faiss_cpu",
   "capability": "kNN backend `faiss_cpu` (exact)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "`faiss.IndexFlatL2`, the library default.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_faiss_gpu",
   "capability": "kNN backend `faiss_gpu` (exact)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "The same index on the GPU, falling back to CPU.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_pynndescent",
   "capability": "kNN backend `pynndescent` (approximate)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "NN-descent graph, `low_memory`.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.knn_morton",
   "capability": "kNN backend `morton` (approximate)",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _knn_cover_chunks",
   "reason": "",
   "note": "Rank window over Z-order codes; the most frugal backend.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.topup_knn",
   "capability": "Top-up policy: fill from a ball around the centre",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _fill_chunk_to_target",
   "reason": "",
   "note": "One of four variants. It decides where the points filling a chunk to its budget come from — and therefore what the overlap looks like geometrically.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_budget.py"
   ]
  },
  {
   "id": "decompose.topup_box",
   "capability": "Top-up policy: fill from a box around the chunk",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _fill_chunk_to_target_box",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_budget.py"
   ]
  },
  {
   "id": "decompose.topup_bbox",
   "capability": "Top-up policy: fill from the bounding box of the k-d cell",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _fill_chunk_to_target_bbox",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_budget.py"
   ]
  },
  {
   "id": "decompose.topup_morton",
   "capability": "Top-up policy: fill from neighbouring Morton ranks",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _fill_chunk_to_target_morton",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_budget.py"
   ]
  },
  {
   "id": "decompose.overlap_modes",
   "capability": "Overlap modes per chunker family",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → CHUNKER_SPECS",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_chunkers.py"
   ]
  },
  {
   "id": "decompose.point_budget",
   "capability": "Point budget as one control across every strategy",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/__init__.py → iter_chunks",
   "reason": "",
   "note": "Every strategy names its budget differently. `POINT_BUDGET_KEYS` maps the concept to the parameter the chosen strategy actually reads. `xy` refuses it, because it splits by extent — a deliberate error instead of a silent approximation.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_budget.py"
   ]
  },
  {
   "id": "decompose.numba_fastpath",
   "capability": "Numba fast path for the bisection, with a NumPy fallback",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _partition_axis_counting_numba",
   "reason": "The micro-benchmark for it exists as a script, but no measurement series was ever stored: it prints mean, spread and speedup to the console. Without stored numbers any figure shown here would be invented, so the path is described, not quantified.",
   "note": "Counts the points on each side of the split plane without an intermediate array; falls back to the same NumPy expression when Numba is absent.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "decompose.halo_margin",
   "capability": "Halo estimation across scene boundaries",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: pointcept/datasets/preprocessing/dales_ply/preprocess_dales_ply.py",
   "reason": "The estimation pulls context from the neighbouring files of a scene: it reads the bounding boxes of surrounding PLYs and estimates the required margin from a sample. This tool works on exactly one uploaded file and has no notion of neighbouring scenes, so a control for it would have nothing to point at. Explained, not executed.",
   "note": "Bounded by `halo_max_neighbor_files` and `halo_max_extra_points`, so the margin cannot pull half the neighbouring scene into memory.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "decompose.scene_parallel",
   "capability": "Scene-parallel execution with `gc_every_tiles`",
   "area": "performance",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "Thesis repository: pointcept/datasets/preprocessing/dales_ply/preprocess_dales_ply.py",
   "reason": "",
   "note": "One worker per scene, with a periodic garbage collection as a memory brake. The scaling pilot evidences both — including the limit.",
   "changed": "",
   "evidence": "parallel_scaling",
   "browser": false,
   "tests": []
  },
  {
   "id": "archive.source_id",
   "capability": "Stable `source_id` with a collision check",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → _append_source_ids",
   "reason": "",
   "note": "Without an identity that survives the decomposition, reconstruction is guesswork. 0 … N−1 per source file; where the field already exists it is checked, not overwritten.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "archive.zip_manifest",
   "capability": "Versioned ZIP archive with a manifest",
   "area": "export",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → chunk_point_cloud",
   "reason": "In the browser the ZIP is produced without Python, by a small deflate writer of its own — the same structure, a different implementation.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "archive.sha256",
   "capability": "SHA-256 per chunk in the manifest",
   "area": "export",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → chunk_point_cloud",
   "reason": "",
   "note": "It already ran on every click without anyone being told. Now reported in Export.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "archive.schema_version",
   "capability": "`ARCHIVE_SCHEMA_VERSION` as a format contract",
   "area": "export",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → ARCHIVE_SCHEMA_VERSION",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "archive.validation",
   "capability": "Archive check: paths, duplicates, unpacked size, hashes",
   "area": "validate",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → validate_chunk_archive",
   "reason": "",
   "note": "Prevents zip slip, zip bombs and silent bit rot. It used to run hidden inside the merge; now it is a step of its own with a finding of its own.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "archive.reconstruction",
   "capability": "Exact reconstruction through `source_id`",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → merge_chunk_archive",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "validate.coverage",
   "capability": "Coverage check: no point lost",
   "area": "validate",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → chunk_point_cloud",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "validate.redundancy",
   "capability": "Redundancy ratio",
   "area": "validate",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → chunk_point_cloud",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "validate.max_coverage",
   "capability": "Maximum coverage per point",
   "area": "validate",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → chunk_point_cloud",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "validate.contradiction",
   "capability": "Contradiction check across overlapping chunks (tolerance 1e-6)",
   "area": "validate",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → merge_chunk_archive",
   "reason": "",
   "note": "The same point in two chunks must carry the same coordinates. If it does not, either the decomposition or the archive is broken.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "validate.measured_overlap",
   "capability": "Measured overlap between the chunks of a scene",
   "area": "validate",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "CORE_UI",
   "canonical": "Thesis repository: scripts/check_bisect_scene_overlap.py",
   "reason": "",
   "note": "Not the requested overlap parameter but the one that actually materialised — the difference between intent and result.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "validate.coverage_vs_source",
   "capability": "Coverage checked against the source file",
   "area": "validate",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "CORE_UI",
   "canonical": "Thesis repository: scripts/check_chunk_point_coverage.py",
   "reason": "",
   "note": "Here the source is the uploaded file; the check compares the chunk sum and the point identities against it instead of against a dataset tree.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "validate.reconstruction_identity",
   "capability": "Reconstruction identity: output equals input",
   "area": "validate",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/archive.py → merge_chunk_archive",
   "reason": "",
   "note": "The only check that tests both halves of the research question together: decompose, put back together, compare with the input.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_archive.py"
   ]
  },
  {
   "id": "recompose.majority",
   "capability": "Merge rule `majority`",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_tile_predictions",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "results",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_merge.py",
    "tests/test_recompose.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "recompose.distance",
   "capability": "Merge rule `distance`",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_tile_predictions",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "results",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_merge.py",
    "tests/test_recompose.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "recompose.confidence",
   "capability": "Merge rule `confidence`",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_tile_predictions",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "results",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_merge.py",
    "tests/test_recompose.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "recompose.distance_confidence",
   "capability": "Merge rule `distance_confidence`",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_tile_predictions",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "results",
   "browser": true,
   "tests": [
    "libs/pointcloud-chunker/tests/test_merge.py",
    "tests/test_recompose.py",
    "presentation/tools/equivalence.mjs"
   ]
  },
  {
   "id": "lab.experimental_boundary_distance",
   "capability": "experimental_boundary_distance",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "reason": "",
   "note": "Centre distance mismodels box shaped chunks; unreliability lives at the seam.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_experimental_mergers.py"
   ]
  },
  {
   "id": "lab.experimental_logit_mean",
   "capability": "experimental_logit_mean",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "reason": "",
   "note": "Arithmetic means of softmax outputs understate confident disagreement.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_experimental_mergers.py"
   ]
  },
  {
   "id": "lab.experimental_entropy",
   "capability": "experimental_entropy",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "reason": "",
   "note": "max(prob) ignores the shape of the distribution below the top class.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_experimental_mergers.py"
   ]
  },
  {
   "id": "lab.experimental_borda",
   "capability": "experimental_borda",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "reason": "",
   "note": "Immune to miscalibration, which the confidence methods assume away.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_experimental_mergers.py"
   ]
  },
  {
   "id": "lab.experimental_boundary_entropy",
   "capability": "experimental_boundary_entropy",
   "area": "lab",
   "provenance": "EXPERIMENTAL",
   "maturity": "EXPERIMENTAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "reason": "",
   "note": "Geometry and certainty are independent reasons to distrust a vote.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_experimental_mergers.py"
   ]
  },
  {
   "id": "recompose.tile_prediction",
   "capability": "`TilePrediction`: save, load, scan a directory",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → TilePrediction",
   "reason": "",
   "note": "The data format between inference and recomposition: coordinates, the hard prediction, the probabilities, and optionally reference labels and support counts.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_merge.py",
    "tests/test_recompose.py"
   ]
  },
  {
   "id": "recompose.support_count",
   "capability": "Support count per point",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_tile_predictions",
   "reason": "",
   "note": "How many chunks held an opinion about this point. The number that makes recomposition visibly necessary in the first place.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_recompose.py"
   ]
  },
  {
   "id": "recompose.quantized_identity",
   "capability": "Point identity through quantized coordinates",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → _quantize_coords",
   "reason": "",
   "note": "Predictions come back from the model without a `source_id`, so the matching runs over rounded coordinates (`decimals`) or a voxel grid (`voxel_size`) — the reason recomposition needs a different notion of identity than reconstruction.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_recompose.py"
   ]
  },
  {
   "id": "recompose.graph_crf",
   "capability": "Graph CRF smoothing of the chunk borders",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → apply_graph_crf",
   "reason": "",
   "note": "Off by default, in the thesis too. Mean-field smoothing over a kNN neighbourhood; it can blur seams, and real edges with them.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "tests/test_recompose.py"
   ]
  },
  {
   "id": "recompose.gt_propagation",
   "capability": "Carry reference labels through the merge",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_tile_predictions",
   "reason": "",
   "note": "For a scene-level confusion to be computable at all, the reference labels must pass through the same merge as the predictions — with `ignore_index` for unlabelled points.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "tests/test_recompose.py"
   ]
  },
  {
   "id": "recompose.merge_cli",
   "capability": "Merge driver as a command-line tool",
   "area": "pipeline",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/merge.py → merge_from_paths",
   "reason": "",
   "note": "`merge_from_paths` is the core of the CLI: scan a directory, load the tiles, merge them. Shown here as a process rather than rebuilt as a command line.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "libs/pointcloud-chunker/tests/test_merge.py"
   ]
  },
  {
   "id": "recompose.synthetic_predictions",
   "capability": "Deterministic example predictions for the demonstration",
   "area": "recompose",
   "provenance": "ORIGINAL",
   "maturity": "INFRASTRUCTURE",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/recompose.py → synthesize_predictions",
   "reason": "",
   "note": "No PTv3 runs here to supply probabilities. Rather than fake real predictions, a named, seed-fixed generator derives them from the geometry — and the interface says so. The merge mathematics computing on them is the real one.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_recompose.py"
   ]
  },
  {
   "id": "analyze.density",
   "capability": "Density estimate in xy and 3D",
   "area": "analyze",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/analysis.py → density_estimate",
   "reason": "",
   "note": "Points per square metre and per cubic metre, from the bounding box and the point count. The basis of the parameter derivation.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_analysis.py"
   ]
  },
  {
   "id": "analyze.parameter_derivation",
   "capability": "Derive parameters from density and budget",
   "area": "analyze",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/analysis.py → derive_parameters",
   "reason": "",
   "note": "What separates a guessed grid size from one that follows reproducibly from a density statistic: density and point budget give the edge length that uses up the budget on average.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_analysis.py"
   ]
  },
  {
   "id": "analyze.class_histogram",
   "capability": "Class histogram",
   "area": "analyze",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "CORE_UI",
   "canonical": "Thesis repository: tools/compute_class_stats.py",
   "reason": "",
   "note": "Shown only when the loaded cloud carries a class field — otherwise the interface says what is missing instead of drawing an empty chart.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_analysis.py"
   ]
  },
  {
   "id": "analyze.confusion",
   "capability": "Confusion matrix",
   "area": "analyze",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "CORE_UI",
   "canonical": "Thesis repository: tools/compute_confusion.py",
   "reason": "",
   "note": "Needs a prediction and a reference. Computable out of the recomposition step; for the real scenes it ships as a measured result.",
   "changed": "",
   "evidence": "confusion",
   "browser": false,
   "tests": [
    "tests/test_analysis.py"
   ]
  },
  {
   "id": "analyze.point_budget_hint",
   "capability": "Point budget proposal for the loaded cloud",
   "area": "analyze",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/public/browser-core.js → proposePointBudget",
   "reason": "",
   "note": "Born in the toolkit itself: a budget that yields more than one chunk for the point count at hand — otherwise the demo shows decomposition without decomposition.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": []
  },
  {
   "id": "export.cloudcompare",
   "capability": "CloudCompare bundle: scene, prediction, error, support",
   "area": "export",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ADVANCED_UI",
   "canonical": "Thesis repository: scripts/export_cloudcompare_bundle.py",
   "reason": "",
   "note": "Four views of the same result as point clouds with a scalar field — the shape in which a segmentation result can actually be inspected.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "export.diagnostic_2d",
   "capability": "2D diagnostic views of the chunkers",
   "area": "diagnostics",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "CORE_UI",
   "canonical": "Thesis repository: scripts/visualize_chunkers_2d.py",
   "reason": "",
   "note": "The top-down view with coloured chunks is the normal case here, not a script: the viewer shows exactly this diagnostic, only interactively.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "export.chunker_gallery",
   "capability": "Chunker gallery on a real scene",
   "area": "diagnostics",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: scripts/visualize_chunkers_real_scene.py",
   "reason": "It needs a DALES scene of twelve million points. The resulting images ship with the presentation; offering the script interactively would be a button with nothing to compute on the target machine.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "export.charts",
   "capability": "Result figures reproducible from the raw measurements",
   "area": "pipeline",
   "provenance": "ORIGINAL",
   "maturity": "INFRASTRUCTURE",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "apps/point-cloud-toolkit/presentation/charts/build_charts.py",
   "reason": "",
   "note": "Every number in the presentation reaches it through `thesis_data.py` from the measurement files. The same source now feeds `public/evidence.json`.",
   "changed": "",
   "evidence": "results",
   "browser": false,
   "tests": []
  },
  {
   "id": "export.evidence_sanitized",
   "capability": "Sanitized evidence export from the thesis repository",
   "area": "pipeline",
   "provenance": "ORIGINAL",
   "maturity": "INFRASTRUCTURE",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "apps/point-cloud-toolkit/presentation/tools/export_evidence.py",
   "reason": "",
   "note": "Aggregated, without paths, command lines, logs or raw data — so measured results can be shown publicly without opening the private repository.",
   "changed": "",
   "evidence": "results",
   "browser": false,
   "tests": [
    "tests/test_capability_coverage.py"
   ]
  },
  {
   "id": "resources.ram_guard",
   "capability": "RAM guard that kills the whole process group",
   "area": "resources",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "Thesis repository: scripts/run_preprocess_methods_ram_guard.py",
   "reason": "",
   "note": "Measures the peak usage of the entire process tree and terminates it when the limit is crossed, instead of letting the machine run into swap.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": []
  },
  {
   "id": "resources.knn_comparison",
   "capability": "kNN backends compared under a memory limit",
   "area": "performance",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "Thesis repository: scripts/test_knn_backends.py",
   "reason": "",
   "note": "Eight backends, the same scene, the same limit. The evidence behind a decision that would otherwise look like taste.",
   "changed": "",
   "evidence": "knn_backends",
   "browser": false,
   "tests": []
  },
  {
   "id": "resources.parallel_scaling",
   "capability": "Parallel scaling measured for both halves",
   "area": "performance",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "Thesis repository: scripts/run_parallel_scaling_pilot.py",
   "reason": "",
   "note": "Decomposition and recomposition with 1, 2 and 4 workers, with speedup and efficiency.",
   "changed": "",
   "evidence": "parallel_scaling",
   "browser": false,
   "tests": []
  },
  {
   "id": "resources.numba_benchmark",
   "capability": "Micro-benchmark, NumPy against Numba",
   "area": "performance",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: scripts/benchmark_bisect_fastpath.py",
   "reason": "The script measures but stores nothing: it prints mean, spread and speedup to the console. No measurement series exists that I could show, and a figure without a measurement would be invented.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "resources.budget_search",
   "capability": "Automatic search for the largest point budget",
   "area": "performance",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "ABANDONED",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "Thesis repository: scripts/find_max_point_budget.py",
   "reason": "",
   "note": "It failed, and that is exactly why it is carried along: the attempt explains why the budget ultimately came from a density statistic and not from an automation.",
   "changed": "",
   "evidence": "budget_probe",
   "browser": false,
   "tests": []
  },
  {
   "id": "resources.optional_deps",
   "capability": "Load optional dependencies one by one, warn once",
   "area": "resources",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → _warn_once",
   "reason": "",
   "note": "FAISS, Numba, Annoy and pynndescent are each optional on their own. When one is missing the code falls back to a named substitute and says so exactly once, not per chunk.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "resources.upload_limits",
   "capability": "Bound the upload and spool it to disk",
   "area": "platform",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "ADVANCED_UI",
   "canonical": "apps/point-cloud-toolkit/backend.py → body_policy",
   "reason": "",
   "note": "Born in the toolkit: the body is not read into memory but spooled to disk under a hard upper bound.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "tests/test_pointcloud_app.py"
   ]
  },
  {
   "id": "resources.hard_caps",
   "capability": "Hard limits on points, bytes and chunks",
   "area": "platform",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/backend.py → MAX_POINT_COUNT",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "tests/test_pointcloud_app.py"
   ]
  },
  {
   "id": "resources.friendly_errors",
   "capability": "Readable error messages instead of stack traces",
   "area": "platform",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/backend.py → handle",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "tests/test_pointcloud_app.py"
   ]
  },
  {
   "id": "repro.metadata",
   "capability": "Immutable run metadata with a git commit stamp",
   "area": "reproducibility",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ADVANCED_UI",
   "canonical": "Thesis repository: experiment_utils.py",
   "reason": "",
   "note": "Configuration, dataset, strategy, parameters, result artifact, validation state and commit in one file per run. The tool shows the structure on a real, sanitized run.",
   "changed": "",
   "evidence": "results",
   "browser": false,
   "tests": []
  },
  {
   "id": "repro.control_center",
   "capability": "Experiment control centre: 64 methods, one process",
   "area": "reproducibility",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: pointcept_control_center_refactored.py",
   "reason": "10,088 lines of research operations: start runs, watch them, resume them, collect artifacts. Rebuilding that in a portfolio tool would be wrong — the concepts are described, not the interface.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "repro.metadata_repair",
   "capability": "Repair and backfill run metadata",
   "area": "reproducibility",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: tools/repair_training_metadata.py",
   "reason": "It presupposes runs whose metadata is incomplete — a state that does not exist in this tool. The procedure is described as part of the provenance story.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "repro.artifact_generation",
   "capability": "Generate every thesis artifact from `data/`",
   "area": "reproducibility",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "ENGINEERING_EVIDENCE",
   "canonical": "Thesis repository: scripts/generate_thesis_result_artifacts.py",
   "reason": "",
   "note": "The tables and figures of the thesis come out of the measurement files, not out of retyped numbers. `export_evidence.py` continues that same chain into this tool.",
   "changed": "",
   "evidence": "results",
   "browser": false,
   "tests": []
  },
  {
   "id": "repro.git_merge_driver",
   "capability": "`keep-ours` merge driver for notebooks",
   "area": "reproducibility",
   "provenance": "RESEARCH_INFRASTRUCTURE",
   "maturity": "INFRASTRUCTURE",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: tools/setup_git_merge.py",
   "reason": "A development-environment setting, not a feature of the tool. Named because it explains how a notebook-heavy research repository stayed versionable at all.",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "platform.viewer",
   "capability": "Canvas point-cloud viewer with gesture physics",
   "area": "inspect",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/public/app.js → drawPointCloud",
   "reason": "",
   "note": "Born in the toolkit, not taken from the thesis.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "platform.chunk_navigator",
   "capability": "Chunk navigator: single chunk and whole scene",
   "area": "decompose",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/public/app.js → showChunk",
   "reason": "",
   "note": "",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "tests/test_pointcloud_app.py"
   ]
  },
  {
   "id": "platform.browser_port",
   "capability": "Browser port of the library, checked against Python",
   "area": "platform",
   "provenance": "ORIGINAL",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "apps/point-cloud-toolkit/public/browser-core.js",
   "reason": "",
   "note": "Three decomposition strategies, the point identity, the metrics, the reconstruction and the four evaluated merge rules run without Python — compared against the library.",
   "changed": "",
   "evidence": "",
   "browser": true,
   "tests": [
    "presentation/tools/equivalence.mjs",
    "tests/test_distribution.py"
   ]
  },
  {
   "id": "platform.capability_registry",
   "capability": "This registry and the test that checks it",
   "area": "platform",
   "provenance": "ORIGINAL",
   "maturity": "INFRASTRUCTURE",
   "state": "ADVANCED_UI",
   "canonical": "apps/point-cloud-toolkit/presentation/tools/capability_registry.py",
   "reason": "",
   "note": "Every capability names its implementation, its state and its anchor. A test verifies that no row claims something the interface does not hold.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": [
    "tests/test_capability_coverage.py"
   ]
  },
  {
   "id": "training.lr_plateau",
   "capability": "`ReduceLROnPlateau` in Pointcept's scheduler registry",
   "area": "training",
   "provenance": "MODIFIED_UPSTREAM",
   "maturity": "FINAL",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: pointcept/engines/hooks/default.py",
   "reason": "Training side. A browser does not train PTv3; my share belongs in the provenance record, not in a control.",
   "note": "",
   "changed": "+441 / −5: scheduler registered, coupled to the validation metric, its state added to the checkpoint.",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "training.checkpoints",
   "capability": "Checkpoint policy, early stopping, peak-GPU hook",
   "area": "training",
   "provenance": "MODIFIED_UPSTREAM",
   "maturity": "FINAL",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: pointcept/engines/hooks/misc.py",
   "reason": "Training side. The peak usage this hook measured is what sits in the evidence data of this tool.",
   "note": "",
   "changed": "+413 / −43: keep the best model by mIoU, a stopping criterion, and a hook that records the peak GPU usage of each run.",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "training.holdout",
   "capability": "Holdout validation with auto-stop",
   "area": "training",
   "provenance": "MODIFIED_UPSTREAM",
   "maturity": "FINAL",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: pointcept/engines/test.py",
   "reason": "Training side.",
   "note": "",
   "changed": "+366 / −18: an own validation split carved out of the training scenes, so the test scenes stay untouched until the end.",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "training.class_weighting",
   "capability": "Inverse-frequency weighting, CE plus Lovász",
   "area": "training",
   "provenance": "MODIFIED_UPSTREAM",
   "maturity": "FINAL",
   "state": "DOCUMENTED_RESEARCH",
   "canonical": "Thesis repository: pointcept/models/losses/builder.py",
   "reason": "Training side.",
   "note": "",
   "changed": "+218 / −29 and +103 / −6: class weights from the frequency in the training split, and a combined loss.",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "training.tile_export",
   "capability": "Tile export of coordinates and probabilities",
   "area": "training",
   "provenance": "MODIFIED_UPSTREAM",
   "maturity": "FINAL",
   "state": "CORE_UI",
   "canonical": "Thesis repository: pointcept/engines/test.py",
   "reason": "",
   "note": "The feed for the whole recomposition. The format is represented in the tool now; the exporter itself stays on the training side.",
   "changed": "+101 / −16: writes `coord`, `pred`, `probs` and optionally `segment` per chunk as an `.npz` — exactly the format `TilePrediction` reads.",
   "evidence": "",
   "browser": false,
   "tests": []
  },
  {
   "id": "training.distance_weighting",
   "capability": "Border-distance weighting in the loss",
   "area": "lab",
   "provenance": "ORIGINAL",
   "maturity": "EXPERIMENTAL",
   "state": "EXPERIMENTAL_LAB",
   "canonical": "Thesis repository: pointcept/models/losses/distance_weighting.py",
   "reason": "",
   "note": "My own idea, my own code: weight points near the chunk border down in the loss because they lack context. Disabled in the main comparison, hence the lab and not the results.",
   "changed": "",
   "evidence": "",
   "browser": false,
   "tests": []
  }
 ],
 "experimental_catalog": [
  {
   "id": "decompose.rand_slope_cyl",
   "name": "rand_slope_cyl",
   "capability": "rand_slope_cyl — slope-adaptive cylinders, the seventh chunker",
   "purpose": "Fully implemented and registered in the library, but never admitted to the quantitative comparison — hence the lab, not the strategy list.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/chunkers.py → rand_slope_cyl_chunks_fn",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_diana",
   "name": "experimental_diana",
   "capability": "experimental_diana",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. Approximate DIANA-style divisive clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_birch",
   "name": "experimental_birch",
   "capability": "experimental_birch",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. BIRCH-style clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_cure",
   "name": "experimental_cure",
   "capability": "experimental_cure",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. CURE-inspired representative clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_kmedoids",
   "name": "experimental_kmedoids",
   "capability": "experimental_kmedoids",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. Approximate k-medoids clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_clarans",
   "name": "experimental_clarans",
   "capability": "experimental_clarans",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. Approximate CLARANS-style randomized medoid search.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_ward",
   "name": "experimental_ward",
   "capability": "experimental_ward",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. Ward-linkage agglomerative clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_dbscan",
   "name": "experimental_dbscan",
   "capability": "experimental_dbscan",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. DBSCAN density clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_optics",
   "name": "experimental_optics",
   "capability": "experimental_optics",
   "purpose": "OUTDATED experimental prototype; not part of thesis experiments. OPTICS density clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → _run_dense_cluster",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_hdbscan",
   "name": "experimental_hdbscan",
   "capability": "experimental_hdbscan",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. HDBSCAN density clustering for irregular shapes and variable density.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Strong candidate for irregular urban ALS geometry and variable density.",
    "Naturally robust to outliers and non-convex cluster shapes.",
    "Good serious baseline beyond centroid-based clustering."
   ],
   "cons": [
    "Requires an additional dependency and careful scaling strategy for very large scenes.",
    "Produces variable cluster sizes, so budget enforcement has to be added explicitly."
   ],
   "adaptation": [
    "Run HDBSCAN on a sampled or voxel-reduced support representation, then lift labels back to full points.",
    "Map cluster overlap to radius-based expansion around cluster cores, or to fill-to-budget top-up after core extraction.",
    "Split oversized clusters recursively or by secondary local partitioning until *_max_points is satisfied."
   ],
   "systems": [
    "Promising candidate for CPU parallel preprocessing at scene or subgraph level.",
    "Possible future GPU acceleration path if neighborhood graph construction is offloaded."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_dbscan_baseline",
   "name": "experimental_dbscan_baseline",
   "capability": "experimental_dbscan_baseline",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. DBSCAN baseline as a framework-aligned density chunker candidate.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Classical and easy-to-explain density baseline for point clouds.",
    "Good reference point relative to more elaborate density methods such as HDBSCAN."
   ],
   "cons": [
    "Single-scale density threshold is brittle under strong density variation.",
    "Noise handling and cluster size variance require extra logic to fit fixed chunk budgets."
   ],
   "adaptation": [
    "Prefer ALS-friendly XY or XY-plus-height preprocessing instead of naive full-scene XYZ clustering.",
    "Treat DBSCAN output as cluster cores, then apply overlap expansion or budget top-up in the same way as other bounded chunkers.",
    "Fallback handling is required for noise points and giant clusters."
   ],
   "systems": [
    "Neighborhood graph construction is the main scaling hotspot.",
    "Potentially parallel over tiles, voxels, or local graph partitions."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_euclidean_cluster",
   "name": "experimental_euclidean_cluster",
   "capability": "experimental_euclidean_cluster",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Euclidean cluster extraction via radius graph / flood fill.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Very natural point-cloud baseline with simple geometric interpretation.",
    "Close to practical radius-clustering implementations in PCL-style pipelines."
   ],
   "cons": [
    "Still sensitive to one fixed radius under density variation.",
    "Needs explicit handling for oversized components and isolated leftovers."
   ],
   "adaptation": [
    "Build local radius neighborhoods, then extract connected clusters as chunk cores.",
    "Apply overlap as radius inflation or halo growth around cluster boundaries.",
    "Introduce recursive fallback splitting for components above *_max_points."
   ],
   "systems": [
    "Good fit for KD-tree or voxel-hash backends.",
    "Likely parallelizable over spatial partitions or prebuilt neighborhood blocks."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_connected_components",
   "name": "experimental_connected_components",
   "capability": "experimental_connected_components",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Connected-components labeling on a prebuilt local neighborhood graph.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Deterministic and conceptually simple once adjacency is defined.",
    "Strong engineering candidate because component extraction is cheap after graph construction."
   ],
   "cons": [
    "Quality depends entirely on the preceding graph definition.",
    "Requires a separate decision about how the neighborhood graph is built and sparsified."
   ],
   "adaptation": [
    "Construct adjacency with radius, voxel-neighbor, or mutual-kNN criteria, then extract components as chunk cores.",
    "Implement overlap by adding a second shell around each component or by preserving shared frontier vertices.",
    "Oversized components still need secondary splitting under the budget constraint."
   ],
   "systems": [
    "Good CPU-parallel and map-reduce-friendly candidate after graph construction.",
    "Potentially attractive for GPU graph kernels later on."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_voxel_grid_cluster",
   "name": "experimental_voxel_grid_cluster",
   "capability": "experimental_voxel_grid_cluster",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Voxel-grid clustering after spatial quantization / densification.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Very attractive engineering approach for large scenes with millions of points.",
    "Natural path to memory reduction before more expensive grouping."
   ],
   "cons": [
    "Chunk geometry depends strongly on voxel resolution and aggregation policy.",
    "Needs a careful mapping back from voxel clusters to raw points."
   ],
   "adaptation": [
    "First aggregate points into voxels, then cluster voxels rather than raw points.",
    "Export raw-point chunks by back-projecting clustered voxels to their member points.",
    "Overlap can be implemented at voxel frontier level and then transferred back to raw points."
   ],
   "systems": [
    "Strong candidate for CPU scaling and future GPU acceleration because voxelization is structured.",
    "Likely one of the best options for large-scene throughput experiments."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_adaptive_cluster",
   "name": "experimental_adaptive_cluster",
   "capability": "experimental_adaptive_cluster",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Adaptive clustering with density-aware local scale changes.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Well motivated for ALS scenes with strong density changes across space.",
    "Could bridge the gap between simple radius methods and full variable-density clustering."
   ],
   "cons": [
    "Needs an explicit local density model before clustering even starts.",
    "Harder to make reproducible and interpretable than fixed-scale baselines."
   ],
   "adaptation": [
    "Derive local scale parameters from density estimates or local kNN spacing.",
    "Use those scales only for neighborhood construction while still enforcing one global *_max_points budget.",
    "Keep overlap semantics explicit, otherwise chunk boundaries become hard to interpret."
   ],
   "systems": [
    "Potentially expensive because adaptive neighborhoods reduce cache locality.",
    "Still a plausible target for staged CPU parallelism if density estimation is separated cleanly."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_optics_placeholder",
   "name": "experimental_optics_placeholder",
   "capability": "experimental_optics_placeholder",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. OPTICS placeholder with explicit framework-integration notes.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Handles variable density more gracefully than plain DBSCAN."
   ],
   "cons": [
    "Reachability ordering is less direct to convert into fixed-size chunks.",
    "Operational mapping to chunk export is less straightforward than for HDBSCAN."
   ],
   "adaptation": [
    "Interpret extracted clusters only as core supports, not as final chunk export units.",
    "Budget handling and overlap still need a second explicit stage."
   ],
   "systems": [
    "Potentially expensive because ordering and neighborhood queries dominate."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_region_growing",
   "name": "experimental_region_growing",
   "capability": "experimental_region_growing",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Region growing based on normals, curvature, or local smoothness.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Could exploit local geometric coherence rather than only proximity."
   ],
   "cons": [
    "Needs stable normals or curvature estimates, which are not always reliable in ALS.",
    "Adds a substantial preprocessing dependency before chunking proper."
   ],
   "adaptation": [
    "Use region growing as a pre-segmentation step, then merge or split regions to satisfy budgets.",
    "Overlap should be applied after region extraction, not during the growth rule itself."
   ],
   "systems": [
    "Normal estimation is the obvious extra bottleneck.",
    "Some substeps are parallelizable, but the full pipeline becomes more complex."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_supervoxel",
   "name": "experimental_supervoxel",
   "capability": "experimental_supervoxel",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Supervoxel / VCCS-style presegmentation.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Strong structured presegmentation idea with good geometric priors."
   ],
   "cons": [
    "Implementation cost is much higher than for simpler clustering baselines.",
    "More naturally a pre-stage than a final chunker on its own."
   ],
   "adaptation": [
    "Treat supervoxels as pre-segments and assemble export chunks from groups of adjacent supervoxels.",
    "Keep chunk budgets explicit; do not equate one supervoxel with one chunk."
   ],
   "systems": [
    "Potentially attractive for later GPU or sparse-voxel acceleration, but not a first implementation target."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_gmm",
   "name": "experimental_gmm",
   "capability": "experimental_gmm",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Gaussian-mixture chunker with EM used only as the optimizer.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Provides a probabilistic alternative with soft assignments and ellipsoidal supports."
   ],
   "cons": [
    "Poor fit for arbitrary city geometry and strongly non-elliptical supports.",
    "EM is part of the implementation method, not a separate chunker in its own right."
   ],
   "adaptation": [
    "Implement only one GMM chunker; document EM as its inner solver rather than as a standalone strategy.",
    "Convert soft assignments into hard export chunks only after budget-aware truncation or top-up."
   ],
   "systems": [
    "Matrix-heavy kernels may vectorize well, but scaling to huge point clouds remains nontrivial."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_bmm",
   "name": "experimental_bmm",
   "capability": "experimental_bmm",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Bayesian mixture model placeholder as a more expensive probabilistic extension of GMM.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Methodically elegant probabilistic extension with uncertainty-aware mixture behavior."
   ],
   "cons": [
    "For this project scope it is usually too expensive and too complex relative to plain GMM.",
    "Inference is heavier than standard GMM and does not solve the underlying mismatch to arbitrary urban geometry."
   ],
   "adaptation": [
    "If explored at all, it should be treated as a GMM-family variant rather than a fundamentally separate chunking line.",
    "Practical use would likely require reduced supports, approximate inference, or a strongly restricted local fitting regime.",
    "Chunk export would still need a second explicit budget-control stage after probabilistic assignment."
   ],
   "systems": [
    "Any realistic implementation would likely depend on approximation, variational inference, or strong subsampling.",
    "Not a first-choice engineering direction for large-scene ALS preprocessing."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_mean_shift",
   "name": "experimental_mean_shift",
   "capability": "experimental_mean_shift",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Mean-shift density-mode chunker.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Does not require a fixed cluster count and is conceptually density-driven."
   ],
   "cons": [
    "Usually too expensive for very large ALS scenes without strong approximation."
   ],
   "adaptation": [
    "Would almost certainly need voxel or sampled support points first.",
    "Chunk budgets would still need a second explicit control stage after mode assignment."
   ],
   "systems": [
    "Approximate or GPU-assisted variants would likely be required for practical runtime."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_bisecting_kmeans",
   "name": "experimental_bisecting_kmeans",
   "capability": "experimental_bisecting_kmeans",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Bisecting k-means as a balanced hierarchical partitioner.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "More hierarchical and budget-friendly than plain k-means."
   ],
   "cons": [
    "Still fundamentally centroid- and shape-biased for urban ALS geometry."
   ],
   "adaptation": [
    "Most natural role is balanced partitioning under fixed chunk budgets, not geometry-faithful clustering.",
    "Overlap can be added only after the hard partition, similar to the current tree-based chunkers."
   ],
   "systems": [
    "Parallelizable across recursive splits and likely easy to make CPU-efficient."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_auto_kmeans",
   "name": "experimental_auto_kmeans",
   "capability": "experimental_auto_kmeans",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Auto-k-means family placeholder covering X-means, G-means, and DP-means.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Automatic cluster-count selection is convenient on paper."
   ],
   "cons": [
    "Still inherits the centroid and spherical-support bias of the underlying family.",
    "For real city geometry, automatic k alone does not solve the representational mismatch."
   ],
   "adaptation": [
    "Treat these methods as k-selection wrappers around a centroid chunker, not as fundamentally new geometry models."
   ],
   "systems": [
    "Operationally straightforward, but unlikely to outperform stronger density or graph baselines."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_chameleon",
   "name": "experimental_chameleon",
   "capability": "experimental_chameleon",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. CHAMELEON-style graph clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Graph-based and flexible enough to model irregular shapes."
   ],
   "cons": [
    "Implementation complexity is high relative to likely thesis payoff."
   ],
   "adaptation": [
    "Would require an explicit graph-construction stage and a separate budget-aware export policy."
   ],
   "systems": [
    "Graph construction and graph partitioning are both heavy stages."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_snn",
   "name": "experimental_snn",
   "capability": "experimental_snn",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Shared-nearest-neighbor / Jarvis-Patrick style clustering.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Potentially robust to density variation through shared-neighbor structure."
   ],
   "cons": [
    "Neighborhood construction cost is high even before clustering begins."
   ],
   "adaptation": [
    "Requires a reusable kNN graph backend before chunk extraction.",
    "Chunk export still needs budget-aware splitting of oversized communities."
   ],
   "systems": [
    "Parallelism is plausible, but only after a serious graph-building layer exists."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_ransac_seeded",
   "name": "experimental_ransac_seeded",
   "capability": "experimental_ransac_seeded",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. RANSAC-seeded geometric presegmentation.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Good for extracting strong primitives such as ground or planar structures."
   ],
   "cons": [
    "Not a general-purpose chunker for arbitrary urban scenes."
   ],
   "adaptation": [
    "Best treated as a helper stage before another chunker, not as the final export policy.",
    "If kept as a chunker candidate at all, it should be documented as a seeded presegmentation approach."
   ],
   "systems": [
    "Could be parallelized over local windows or primitive proposals, but remains auxiliary rather than central."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_spectral",
   "name": "experimental_spectral",
   "capability": "experimental_spectral",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Spectral clustering placeholder requiring approximation before it becomes realistic.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Conceptually expressive because graph structure can encode nonlocal similarity."
   ],
   "cons": [
    "Affinity construction and eigendecomposition scale poorly for large ALS scenes."
   ],
   "adaptation": [
    "Would require aggressive approximation such as landmark graphs, voxel coarsening, or Nyström-style reduction.",
    "Without approximation, it should not be pursued for this pipeline."
   ],
   "systems": [
    "Any realistic version would have to be approximate and heavily engineered."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_affinity_propagation",
   "name": "experimental_affinity_propagation",
   "capability": "experimental_affinity_propagation",
   "purpose": "PLACEHOLDER candidate; intentionally not implemented and not part of thesis experiments. Affinity propagation placeholder requiring approximation before it becomes realistic.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental.py → EXPERIMENTAL_CHUNKER_SPECS",
   "status": "Started or earmarked and never finished.",
   "maturity": "ABANDONED",
   "implemented": false,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [
    "Interesting exemplar-based idea in small or medium settings."
   ],
   "cons": [
    "Pairwise similarity handling scales too poorly for the target scene sizes."
   ],
   "adaptation": [
    "Only sensible with approximate or reduced-support variants; otherwise not competitive for large-scene preprocessing."
   ],
   "systems": [
    "Not a practical first-choice engineering direction for this project."
   ],
   "reason": ""
  },
  {
   "id": "lab.experimental_boundary_distance",
   "name": "experimental_boundary_distance",
   "capability": "experimental_boundary_distance",
   "purpose": "Centre distance mismodels box shaped chunks; unreliability lives at the seam.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "ADVANCED_UI",
   "runnable_full_tool": true,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_logit_mean",
   "name": "experimental_logit_mean",
   "capability": "experimental_logit_mean",
   "purpose": "Arithmetic means of softmax outputs understate confident disagreement.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "ADVANCED_UI",
   "runnable_full_tool": true,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_entropy",
   "name": "experimental_entropy",
   "capability": "experimental_entropy",
   "purpose": "max(prob) ignores the shape of the distribution below the top class.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "ADVANCED_UI",
   "runnable_full_tool": true,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_borda",
   "name": "experimental_borda",
   "capability": "experimental_borda",
   "purpose": "Immune to miscalibration, which the confidence methods assume away.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "ADVANCED_UI",
   "runnable_full_tool": true,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "lab.experimental_boundary_entropy",
   "name": "experimental_boundary_entropy",
   "capability": "experimental_boundary_entropy",
   "purpose": "Geometry and certainty are independent reasons to distrust a vote.",
   "implementation": "libs/pointcloud-chunker/src/pointcloud_chunker/experimental_mergers.py → EXPERIMENTAL_MERGER_SPECS",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "ADVANCED_UI",
   "runnable_full_tool": true,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  },
  {
   "id": "training.distance_weighting",
   "name": "distance_weighting",
   "capability": "Border-distance weighting in the loss",
   "purpose": "My own idea, my own code: weight points near the chunk border down in the loss because they lack context. Disabled in the main comparison, hence the lab and not the results.",
   "implementation": "Thesis repository: pointcept/models/losses/distance_weighting.py",
   "status": "Implemented, deliberately outside the evaluation.",
   "maturity": "EXPERIMENTAL",
   "implemented": true,
   "state": "EXPERIMENTAL_LAB",
   "runnable_full_tool": false,
   "visible_in_browser": false,
   "pros": [],
   "cons": [],
   "adaptation": [],
   "systems": [],
   "reason": ""
  }
 ]
};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PointCloudCapabilities;
})(typeof globalThis !== 'undefined' ? globalThis : this);
