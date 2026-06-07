Champions Quiz

Ein interaktives Fussballquiz-Turnierspiel im Browser. Der Spieler wählt einen Verein, tritt in einem simulierten Turnierformat gegen 15 weitere "Champions-League"-Teams an und kämpft sich durch 4 Runden zum Titel. Es kommen verschiedene Fragen zu Vereine. Vereine am Wappen erkennen, Wo spielt der Spieler oder welches Gründungsjahr. Das Quiz wird von Runde zu Runde schwieriger. Die Wappen und Fragen werden von der API abgeleitet und herabgerufen. 

Link Webseite

[im2.riwubifu.myhostpoint.ch/html/index.html](https://im2.riwubifu.myhostpoint.ch/html/index.html)

Funktionen

- 16 echte Champions-League-Vereine (Saison 25/26) aus der football-data.org API laden
- Verein und Spielername frei wählen
- Automatisch generierter Turnierbaum mit 4 Runden (Achtelfinale bis Final)
- Spielvorschau vor jedem Match
- Quizfragen: Treffe 5 Tore, ehe du 5 kassierst – und du stehst eine Runde weiter
- Abschlusskarte nach dem Turnier (Sieg oder Niederlage)
- Responsive Layout Web first, dann mobile

Verwendete API

- football-data.o\* – Offizielle Champions-League-Teamdaten  
  `https://api.football-data.org/v4/competitions/CL/teams`  
  Zugriff via eigenem PHP-Proxy auf dem Server (CORS-Umgehung):  
  `https://im2.riwubifu.myhostpoint.ch/html/teams.php`

Verwendete Technologien

- HTML
- CSS
- JavaScript
- PHP (serverseitiger API-Proxy)
- Google Fonts (Anton, Montserrat)

Tools im Entwicklungsprozess

- Visual Studio Code
- GitHub Actions (automatisches Deployment via FTP auf Hostpoint)
- Claude (KI-Assistenz beim Debugging, CORS-Lösung und Deployment)
- Claude Code

Projektstruktur

```
/
├── index.html              ← Redirect zur Startseite
├── html/
│   ├── index.html          ← Setup / Vereinsauswahl
│   ├── turnierbaum.html    ← Turnierbaum-Übersicht
│   ├── vorschau.html       ← Spielvorschau
│   ├── spiel.html          ← Quizspiel
│   └── teams.php           ← PHP-Proxy für die API
├── css/
│   └── style.css
├── js/
│   └── script.js
└── img/
    ├── celebrate.gif
    ├── party.gif
    └── tor.gif
```

Autor

André Cerqueira  
Modul: Interaktive Medien 2  
Studiengang: Multimedia Production (BSc), 2. Semester  
Fachhochschule Graubünden (FHGR), Chur  
Frühlingssemester 2026

Repository

[github.com/AndreCer03/IM-2](https://github.com/AndreCer03/IM-2)
