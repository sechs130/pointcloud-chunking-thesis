/*
 * ERZEUGT von presentation/tools/dist.mjs — nicht von Hand ändern.
 *
 * Im Verteilungsbuild gibt es kein Python-Backend. "browser" statt "auto"
 * ist deshalb keine Kosmetik: es verhindert, dass die Seite überhaupt
 * versucht, eine API anzusprechen: kein fetch, keine abgelehnte
 * Verbindung, keine Fehlermeldung in der Konsole.
 */
window.PCT_CONFIG = { mode: "browser" };
