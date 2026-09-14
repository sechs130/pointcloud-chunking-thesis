# Veröffentlichen

Dieser Ordner ist ein **Build-Ergebnis**. Nichts hier wird von Hand bearbeitet;
Quelle ist das private Repository `portfolio-app-hub`, Befehl
`node tools/dist.mjs` im Ordner `apps/point-cloud-toolkit/presentation`.

## Warum ein eigenes öffentliches Repository

Eine GitHub-Pages-Seite ist **immer öffentlich im Internet**, auch wenn ihr
Repository privat ist — und im Free-Plan kann Pages ohnehin nur aus einem
öffentlichen Repository veröffentlichen. Deshalb wandert nicht das
Entwicklungs-Repository nach draussen, sondern nur dieser gesäuberte Auszug.

Was hier liegt: Präsentation, Grafiken, Browser-Demo, Basis-Stylesheet.
Was nicht: Rohdaten, Modellgewichte, Trainingslogs, Thesis-Quelltext,
Audit-Dokumente, Pointcept-Quellcode, das Flask-Backend, andere Apps, `data/`,
Git-Historie.

## Einmalige Einrichtung (braucht Kontorechte)

1. Auf GitHub ein **öffentliches**, leeres Repository anlegen:
   `pointcloud-chunking-thesis`. Keine README, kein .gitignore, keine Lizenz —
   dieser Ordner bringt alles mit.
2. In diesem Ordner:

   ```bash
   git init -b main
   git add .
   git commit -m "Statische Präsentation und Browser-Demo"
   git remote add origin https://github.com/sechs130/pointcloud-chunking-thesis.git
   git push -u origin main
   ```

3. Im Repository **Settings → Pages**: Source `Deploy from a branch`,
   Branch `main`, Ordner `/ (root)`. Speichern.
4. Nach einer bis zwei Minuten ist die Seite erreichbar:
   `https://sechs130.github.io/pointcloud-chunking-thesis/`
5. Im Repository oben rechts **About** ausfüllen und dort die Pages-URL als
   Website eintragen. Danach auf dem Profil unter **Customize your pins** das
   Repository anpinnen.

## Aktualisieren

```bash
# im privaten Repository
cd apps/point-cloud-toolkit/presentation
node tools/build.mjs && node tools/dist.mjs && node tools/verify_dist.mjs

# im öffentlichen Klon: Inhalt durch dist/web/ ersetzen, dann
git add -A && git commit -m "Build aktualisiert" && git push
```

Pages baut selbst nichts (`.nojekyll` liegt bei) und liefert die Dateien
unverändert aus.

## Grenzen, die GitHub setzt

| | |
|---|---|
| Seitengrösse | max. 1 GB — hier 11.5 MB |
| Bandbreite | 100 GB/Monat (weiches Limit) |
| Builds | 10 pro Stunde (weiches Limit) |
| Sichtbarkeit | immer öffentlich, nicht einschränkbar |

## Optional: Hugging Face Static Space

`dist/space/` ist derselbe Inhalt plus YAML-Vorwort. Neuen Space mit
`sdk: static` anlegen, klonen, Inhalt hineinkopieren, pushen. Static Spaces
sind kostenlos und schlafen nicht ein. **Kein** Docker-Space: der verlangt
inzwischen einen bezahlten Plan und müsste die Bibliothek mitveröffentlichen.
