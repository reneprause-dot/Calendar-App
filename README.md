# PWA Kalenderapp mit Wunschlisten

Eine moderne Progressive Web App für Kalenderplanung mit NRW-Feiertagen, Profilverwaltung und Wunschlisten.

## Features

### 📅 Kalender
- Übersichtliche Monatsansicht
- Alle christlichen Feiertage in NRW (automatisch berechnet)
- Markierung aktueller Tag
- Schnellzugriff auf Wunschlisten pro Tag
- Navigation zwischen Monaten

### 💝 Wunschlisten
- Wunschlisten pro Tag erstellen
- Schnelles Hinzufügen direkt im Kalender-Modal
- Separate Wunschlisten-Verwaltung
- Wünsche abhaken und löschen
- Filterung nach Profilen

### 👥 Profile
- 3 vordefinierte Profile (Anna, Max, Emma)
- Unbegrenzt neue Profile hinzufügbar
- Farbcodierung pro Profil
- Profile bearbeiten und löschen
- Profilauswahl für Wunschlisten

### 📱 PWA Features
- Vollständig offline funktionsfähig
- Installierbar auf Homescreen
- Service Worker für Caching
- Responsive Design für alle Geräte
- Lokale Datenspeicherung

## Installation & Zugriff

### Online verfügbar unter:
**https://reneprause-dot.github.io/calendar-app/**

### Als PWA installieren:
1. App im Browser öffnen
2. Auf "Installieren" klicken oder zum Homescreen hinzufügen
3. App startet dann als eigenständige Anwendung

## Datenspeicherung

Alle Daten werden lokal im Browser gespeichert:
- `localStorage` für Profil- und Wunschlisten-Daten
- Keine Cloud-Synchronisation erforderlich
- Daten bleiben nach App-Deinstallation in Browser-Cache erhalten

## Feiertage in NRW

Die App berechnet automatisch folgende christliche Feiertage:

**Fixe Feiertage:**
- 1. Januar: Neujahrstag
- 6. Januar: Heilige Drei Könige
- 1. Mai: Tag der Arbeit
- 25. Dezember: Weihnachtstag
- 26. Dezember: 2. Weihnachtstag

**Variable Feiertage (basierend auf Ostern):**
- Karfreitag (2 Tage vor Ostern)
- Ostermontag (1 Tag nach Ostern)
- Christi Himmelfahrt (39 Tage nach Ostern)
- Pfingstmontag (50 Tage nach Ostern)
- Fronleichnam (60 Tage nach Ostern)

## Dateistruktur

```
.
├── index.html       # HTML Struktur
├── styles.css       # Styling und Responsive Design
├── app.js          # Hauptanwendungslogik
├── sw.js           # Service Worker für Offline-Support
├── manifest.json   # PWA Manifest
└── README.md       # Diese Datei
```

## Browser-Kompatibilität

- Chrome/Edge: vollständig unterstützt
- Firefox: vollständig unterstützt
- Safari: teilweise unterstützt (PWA-Installation begrenzt)
- Mobile Browser: vollständig unterstützt

## Tipps zur Nutzung

1. **Profil auswählen**: Klicken Sie auf ein Profil, um es auszuwählen
2. **Schnell Wünsche hinzufügen**: Klicken Sie auf einen Tag im Kalender
3. **Wünsche verwalten**: Nutzen Sie die Wunschlisten-Ansicht für Übersicht
4. **Offline-Nutzung**: Die App funktioniert auch ohne Internetverbindung

## Lizenz

MIT License