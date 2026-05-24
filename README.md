# NRW Kalender (PWA)

Kalender‑PWA mit:
- **christlichen gesetzlichen Feiertagen in NRW** (Karfreitag, Ostermontag, Himmelfahrt, Pfingstmontag, Fronleichnam, Allerheiligen, 25./26.12.)
- **Profilen** (3 Standardprofile + beliebig viele weitere)
- **Wunschliste pro Tag** (Einträge anlegen/bearbeiten/löschen)
- **separater Menüpunkt „Wunschliste“** (Gesamtliste aller Einträge je Profil)
- **Cloud‑Sync** via Firebase (E‑Mail/Passwort + Firestore)

## 1) Lokal starten

```bash
npm install
npm run dev
```

## 2) Firebase einrichten

1. In der Firebase Console ein Projekt erstellen.
2. **Authentication** → Sign‑in method → **E‑Mail/Passwort aktivieren**.
3. **Firestore Database** aktivieren (Production oder Test; für produktiv bitte Rules nutzen).
4. **Project settings** → **Your apps** → Web‑App hinzufügen → Konfig‑Werte kopieren.

### Environment Variablen

Lege eine Datei `.env` an (Vorlage: `.env.example`) und trage die Werte ein:

```bash
cp .env.example .env
```

## 3) Firestore Datenmodell

Alles wird pro Benutzerkonto gespeichert:

```
users/{uid}
  activeProfileId: string|null

users/{uid}/profiles/{profileId}
  name: string

users/{uid}/profiles/{profileId}/wishlistEntries/{entryId}
  date: "YYYY-MM-DD"
  title: string
  notes?: string
  createdAt, updatedAt: serverTimestamp
```

## 4) Security Rules (Beispiel)

Die Datei `firestore.rules` enthält Rules, die **nur Zugriff auf die eigenen Daten** erlauben.
In der Firebase Console unter **Firestore → Rules** einfügen und veröffentlichen.

## 5) PWA

Im Dev‑Modus ist die PWA‑Funktion aktiviert (Service Worker). Für ein Production‑Build:

```bash
npm run build
npm run preview
```

