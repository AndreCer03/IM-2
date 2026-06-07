Champions Quiz

Ein interaktives Fussballquiz-Turnierspiel im Browser. Der Spieler wählt einen Verein, tritt in einem simulierten Turnierformat gegen 15 weitere "Champions"-League-Teams an und kämpft sich durch 4 Runden zum "Titel".

Link Webseite:

[im2.riwubifu.myhostpoint.ch/html/index.html](https://im2.riwubifu.myhostpoint.ch/html/index.html)

- 16 echte Vereine aus der football-data.org API laden
- Verein und Spielername frei wählen
- Automatisch generierter Turnierbaum mit 4 Runden (Achtelfinale bis Finale)
- Spielvorschau vor jedem Match
- Quizfragen: Treffe 5 Tore bevor du 5 kassierst damit du eine Runde weiter stehst
- Abschlusskarte nach dem Turnier (Sieg oder Niederlage)
- Responsive Layout Web first dann mobile

Verwendete API

`https://api.football-data.org/v4/competitions/CL/teams`  
 Zugriff via eigenem PHP-Proxy auf dem Server (CORS-Umgehung):  
 `https://im2.riwubifu.myhostpoint.ch/html/teams.php`

- HTML
- CSS
- JavaScript
- PHP (serverseitiger API-Proxy)
- Google Fonts (Anton, Montserrat)

Tools im Entwicklungsprozess

- Visual Studio Code
- Claude Code
- Claude(KI-Assistenz beim Debugging, CORS-Lösung und Deployment)
- Github
- Cheatsheets aus dem Unterricht

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
Studiengang: Multimedia Production, 2. Semester  
Fachhochschule Graubünden (FHGR), Chur  
Frühlingssemester 2026

Repository

[github.com/AndreCer03/IM-2](https://github.com/AndreCer03/IM-2)
