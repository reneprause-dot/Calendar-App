# 📅 Familienkalender – Setup & Deployment

## Projektstruktur
```
familienkalender/
├── index.html        ← Haupt-App
├── style.css         ← Styles
├── manifest.json     ← PWA-Manifest
├── sw.js             ← Service Worker
├── icons/
│   ├── icon-192.png  ← App-Icon (192×192 px)
│   └── icon-512.png  ← App-Icon (512×512 px)
└── README.md
```

---

## 🔥 Schritt 1: Firebase-Projekt einrichten (ca. 10 Min.)

### 1.1 Projekt erstellen
1. Öffne https://console.firebase.google.com
2. Klicke **„Projekt hinzufügen"**
3. Name z.B. `familienkalender`
4. Google Analytics: optional (deaktivieren reicht)

### 1.2 Web-App registrieren
1. Im Firebase-Dashboard: **„Web" (</> Symbol)** klicken
2. App-Nickname: `Familienkalender`
3. **„Firebase Hosting"** NICHT aktivieren (wir nutzen GitHub Pages)
4. Du bekommst einen Code-Block mit `firebaseConfig` – kopiere diese Werte

### 1.3 Config eintragen
Öffne `index.html` und ersetze im `firebaseConfig`-Objekt:
```javascript
const firebaseConfig = {
  apiKey: "DEINE_API_KEY",           ← z.B. "AIzaSyD..."
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEINE_SENDER_ID",
  appId: "DEINE_APP_ID"
};
```

### 1.4 Authentication aktivieren
1. Firebase Console → **Authentication** → **Jetzt loslegen**
2. **Sign-in-Methode** → **E-Mail/Passwort** → Aktivieren → Speichern

### 1.5 Firestore einrichten
1. Firebase Console → **Firestore Database** → **Datenbank erstellen**
2. Starte im **Produktionsmodus**
3. Region: `europe-west3` (Frankfurt)

### 1.6 Security Rules setzen
Firestore → Regeln → Diese Regeln einfügen:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users können ihr eigenes Dokument lesen/schreiben
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Invite-Codes: jeder eingeloggte User kann lesen
    match /invites/{code} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Families: Mitglieder der Familie dürfen lesen/schreiben
    match /families/{familyId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId == familyId;

      match /events/{eventId} {
        allow read, write: if request.auth != null &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId == familyId;
      }

      match /profiles/{profileId} {
        allow read, write: if request.auth != null &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId == familyId;
      }
    }
  }
}
```

---

## 📦 Schritt 2: Icons erstellen

Erstelle zwei quadratische Icons (kann ein Emoji-Screenshot sein):
- `icons/icon-192.png` (192×192 Pixel)
- `icons/icon-512.png` (512×512 Pixel)

**Schnelle Option:** Nutze https://favicon.io/emoji-favicons/ → suche nach 📅 → Download

---

## 🚀 Schritt 3: GitHub Pages deployen

### 3.1 Repository erstellen
1. https://github.com → **New repository**
2. Name: `familienkalender` (oder beliebig)
3. **Public** (für kostenlose GitHub Pages)
4. Erstellen

### 3.2 Dateien hochladen
```bash
git init
git add .
git commit -m "Initial commit – Familienkalender"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/familienkalender.git
git push -u origin main
```

Oder: GitHub → **„uploading an existing file"** → alle Dateien ziehen

### 3.3 GitHub Pages aktivieren
1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. **Save**

Nach 1-2 Minuten ist die App live unter:
`https://DEIN-USERNAME.github.io/familienkalender/`

### 3.4 Firebase Domain freischalten
Firebase Console → **Authentication** → **Einstellungen** → **Autorisierte Domains**
→ `DEIN-USERNAME.github.io` hinzufügen

---

## 👨‍👩‍👧 Schritt 4: Erste Nutzung

1. Öffne die App
2. Tab **„Registrieren"** → Konto erstellen (OHNE Einladungscode = neue Familie)
3. Du bist Admin – dein Einladungscode erscheint unter **Profile**
4. Familienmitglieder teilen: Code schicken → Tab „Registrieren" → Code eingeben

---

## 📲 Als PWA installieren

**Android/Chrome:** Browser-Menü → „Zum Startbildschirm hinzufügen"
**iOS/Safari:** Teilen-Symbol → „Zum Home-Bildschirm"
**Desktop Chrome/Edge:** Adressleiste → Install-Symbol

---

## ✨ Features im Überblick

- 📅 **Kalender** in 4 Ansichten: Monat, Woche, Tag, Jahr
- 🎉 **NRW-Feiertage** (alle gesetzlichen + Rosenmontag, Heiligabend, Silvester)
- 🏫 **NRW-Schulferien** 2025–2027 (automatisch eingeblendet)
- 👨‍👩‍👧 **Familienprofile** mit Farben, Typ (Erwachsener/Kind), Geburtstag
- 🎁 **Wunschlisten** pro Kalendereintrag mit Abhak-Funktion und Links
- 📋 **Alle Einträge** chronologisch – bevorstehend + vergangen
- 🔄 **Echtzeit-Sync** über Firebase Firestore
- 🔐 **Einladungsbasierter Login** – nur Familienmitglieder kommen rein
- 📲 **PWA** – installierbar auf Handy und Desktop
- 🔍 **Suchfunktion** in Eintrags- und Wunschlisten-Übersicht

---

## 🛠 Häufige Probleme

**„Permission denied" in Firestore:**
→ Firestore Security Rules prüfen (Schritt 1.6)

**Auth funktioniert nicht:**
→ Firebase Domain muss unter Authentication → Einstellungen → Autorisierte Domains eingetragen sein

**PWA zeigt kein Icon:**
→ Icons müssen als PNG in `/icons/` liegen und die richtige Größe haben

**Schulferien fehlen/falsch:**
→ In `index.html` Funktion `getSchoolHolidays()` anpassen – Daten von: https://www.schulferien.org/NRW/
