# ⏳ Zeitreise - VS Unken Lernapp

Eine moderne, interaktive Lern-App für die Volksschule Unken in Salzburg. Speziell entwickelt für Kinder im Alter von 6-10 Jahren.

## 🎯 Was kann die App?

- **Zeitreise**: 140 verifizierte historische Ereignisse vom Urknall (vor 13,8 Mrd. Jahren) bis zur heutigen KI-Ära, aufgeteilt in 11 Epochen
- **Unser Unken**: Dedizierte Sektion über die Geschichte des Dorfes Unken und der Volksschule
- **Quiz**: 40+ altersgerechte Quizfragen in 8 Kategorien
- **Responsive**: Funktioniert auf Smartphone, Tablet und Computer
- **Audio-Support**: Vorlesefunktion (mp3-Dateien können ergänzt werden)
- **Kindgerecht**: Einfache Sprache, bunte Farben, motivierendes Feedback
- **KI-Aufklärung**: Verantwortungsvolle, kindgerechte Erklärung künstlicher Intelligenz

## 📁 Projektstruktur

```
VS Unken Lernapp/
├── index.html              ← App-Einstiegspunkt (diese Datei öffnen!)
├── css/
│   └── styles.css          ← Komplettes Design
├── js/
│   ├── app.js              ← Haupt-App-Logik
│   ├── timeline.js         ← Zeitreise-Modul
│   ├── unken.js            ← Unken-Modul
│   └── quiz.js             ← Quiz-Engine
├── data/
│   ├── timeline.json       ← 140 historische Ereignisse
│   ├── unken.json          ← Unken-Lokalgeschichte
│   └── quiz.json           ← Quizfragen
├── assets/
│   ├── audio/              ← (hier mp3-Dateien einfügen)
│   └── images/             ← (hier Bilder einfügen)
└── README.md
```

## 🚀 App starten

**Option 1: Direkt öffnen** (einfachste Variante)
1. Doppelklick auf `index.html`
2. Die App öffnet sich im Browser

> **Hinweis**: Wenn der Browser wegen Sicherheit keine lokalen JSON-Dateien laden will, nutze Option 2 oder 3.

**Option 2: Mit Python-Server** (empfohlen beim Testen)
```bash
cd "VS Unken Lernapp"
python -m http.server 8000
```
Dann im Browser öffnen: `http://localhost:8000`

**Option 3: Mit VS Code**
1. Extension "Live Server" installieren
2. Rechtsklick auf `index.html` → "Open with Live Server"

## 🔊 Audio-Dateien hinzufügen (ElevenLabs)

Die App ist bereit, Audiodateien abzuspielen. So fügst du sie hinzu:

1. Öffne `data/timeline.json` und `data/unken.json`
2. Jedes Ereignis hat eine `id` wie z.B. `evt-001`, `unk-007`, `sch-003`
3. Erstelle für jedes Ereignis eine mp3-Datei mit exakt dieser ID als Dateinamen:
   - `assets/audio/evt-001.mp3` für den Urknall
   - `assets/audio/unk-007.mp3` für "Die Festung Kniepass"
   - `assets/audio/sch-001.mp3` für die ersten Schulstunden
4. Die App erkennt die Dateien automatisch - der Vorlesen-Knopf funktioniert dann

**Tipp für ElevenLabs**: Nutze eine freundliche, kinderfreundliche Stimme. Der `description`-Text im JSON ist das, was vorgelesen werden soll.

## 🖼️ Bilder hinzufügen (Google Nano Banana Pro)

Gleiche Logik wie beim Audio:

1. Erstelle Bilder mit der Event-ID als Dateinamen:
   - `assets/images/evt-001.jpg` oder `.png`
   - `assets/images/unk-007.jpg`
2. Die App kann später um Bilder erweitert werden (der Platz ist im Modal bereits vorgesehen)

## 📝 Inhalte anpassen

Alle Texte liegen in den JSON-Dateien im Ordner `data/`:
- `timeline.json` - Welt- und Österreichgeschichte
- `unken.json` - Lokalgeschichte Unken und Schule
- `quiz.json` - Quizfragen

Einfach mit einem Editor (z.B. VS Code) öffnen und bearbeiten. Nach dem Speichern die Seite neu laden.

### Neues Event hinzufügen

Füge zu `timeline.json` im `events`-Array hinzu:
```json
{
  "id": "evt-141",
  "epoch": "digital",
  "date": "2030",
  "dateNumeric": 2030,
  "title": "Dein Titel",
  "short": "Kurzer Einleitungstext",
  "description": "Längere, kindgerechte Erklärung.",
  "funFact": "Ein spannender Fakt!",
  "keywords": ["Stichwort1", "Stichwort2"],
  "sources": [{"title": "Quelle", "url": "https://..."}]
}
```

## 🎨 Design anpassen

Die Farben und Abstände werden in `css/styles.css` ganz oben im `:root`-Block definiert. Dort kannst du z.B. die Hauptfarbe ändern:
```css
--color-primary: #F57C00;  /* Orange - ändere hier */
```

## 📚 Quellen

Die Inhalte basieren auf:
- Österreichischer Volksschul-Lehrplan (BMBWF 2023)
- Wikipedia (Deutsch)
- Salzburgwiki / Salzburger Nachrichten Wiki
- Gemeinde Unken (www.unken.at)

## 🔒 Datenschutz

Die App speichert KEINE Daten, verschickt NICHTS ins Internet und nutzt KEINE Tracker. Sie läuft komplett offline im Browser, sobald sie geladen ist.

## 💻 Technik

- Reines HTML5, CSS3, Vanilla JavaScript (kein Build, kein Framework)
- Responsive Design (Mobile First)
- Barrierefrei (Tastatur, Screenreader)
- Funktioniert in allen modernen Browsern

## ❤️ Credit

Entwickelt mit Liebe für die Volksschule Unken. Viel Freude beim Entdecken der Geschichte!
