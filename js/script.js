/*
 * ============================================================
 * CHAMPIONS QUIZ – script.js
 * Eine Datei für ALLE Seiten:
 *   index.html      → Setup-Seite
 *   turnierbaum.html → Turnierbaum
 *   vorschau.html   → Match-Vorschau
 *
 * Die Seiten-Erkennung läuft über querySelector:
 * Wenn ein Element existiert → richtige Seite → Code ausführen
 * ============================================================
 */


// ============================================================
// GLOBALE VARIABLEN – werden auf allen Seiten gebraucht
// (Cheatsheet 01 – Variablen)
// ============================================================

// API-Schlüssel von football-data.org
const apiSchluessel = '25d1021df1ca4a8cafe6c9b9e3088f24';

// CORS-Proxy: Browser blockieren direkte externe Anfragen.
// Dieser Proxy leitet die Anfrage weiter.
// ⚠️ NICHT im Cheatsheet: CORS (Cross-Origin Resource Sharing)
const corsProxy = 'https://corsproxy.io/?url=';
const apiAdresse = `${corsProxy}https://api.football-data.org/v4/competitions/CL/teams`;

// Die 16 Verein-IDs die wir im Bracket haben wollen
const vereinsIds = [57, 65, 66, 64, 81, 86, 5, 4, 108, 113, 109, 98, 1903, 503, 524, 516];

// Index des aktuell angezeigten Vereins (index.html)
// let weil sich der Wert ändert (Cheatsheet 01)
let aktuellerVereinsIndex = 0;

// Alle geladenen Vereine aus der API
let vereine = [];


// ============================================================
// SEITEN-ERKENNUNG (Cheatsheet 05 – DOM)
// querySelector gibt NULL zurück wenn ein Element nicht existiert.
// So wissen wir welche Seite gerade geladen ist.
// ============================================================

// Jede Seite hat ein einzigartiges Element mit einer bestimmten Klasse:
// index.html       → hat <main class="landing">
// turnierbaum.html → hat <main class="turnierbaum-page">
// vorschau.html    → hat <main class="vorschau-page">

const aufIndexSeite    = document.querySelector('.landing')         !== null;
const aufTurnierbaum   = document.querySelector('.turnierbaum-page') !== null;
const aufVorschauSeite = document.querySelector('.vorschau-page')   !== null;

console.log('Aktuelle Seite:', aufIndexSeite ? 'index' : aufTurnierbaum ? 'turnierbaum' : aufVorschauSeite ? 'vorschau' : 'unbekannt');


// ============================================================
//  SEITE 1: INDEX.HTML (Setup-Seite)
// ============================================================

if (aufIndexSeite) {

    // ----------------------------------------------------------
    // DOM-Elemente (Cheatsheet 05)
    // Nur laden wenn wir auf der Index-Seite sind!
    // ----------------------------------------------------------
    const nameEingabe    = document.querySelector('#player-name');
    const vereinsLogo    = document.querySelector('#team-logo');
    const vereinsName    = document.querySelector('#team-name');
    const vereinsAnzeige = document.querySelector('.team-selector__display');
    const vereinsSelector = document.querySelector('.team-selector');
    const knopfZurueck   = document.querySelector('#btn-prev');
    const knopfWeiter    = document.querySelector('#btn-next');
    const startKnopf     = document.querySelector('#btn-start');

    // ----------------------------------------------------------
    // FUNKTIONEN (Cheatsheet 03)
    // ----------------------------------------------------------

    /**
     * Zeigt den aktuell ausgewählten Verein im Team-Selector an.
     * ✅ BUG-FIX: Die Funktion war in der alten Version unvollständig!
     *    Die schliessende Klammer und der else-Teil fehlten.
     *
     * Cheatsheet 05: setAttribute, innerText
     * Cheatsheet 11: Objekt-Properties (verein.crest, verein.name)
     */
    function zeigeAktuellenVerein() {
        // Sicherheits-Check: Wurden Vereine schon geladen?
        if (vereine.length === 0) {
            // Noch keine Daten: Lade-Text anzeigen
            vereinsName.innerText = 'Laden...';
            return; // Funktion hier beenden
        }

        // Cheatsheet 11: Objekt aus Array lesen
        const verein = vereine[aktuellerVereinsIndex];

        // Cheatsheet 05: setAttribute – Bild-Quelle setzen
        vereinsLogo.setAttribute('src', verein.crest);
        vereinsLogo.setAttribute('alt', verein.name);

        // Cheatsheet 05: innerText – Text im Element ändern
        // shortName = Kurzname (z.B. "Bayern"), name = Vollname
        vereinsName.innerText = verein.shortName || verein.name;
    }

    /**
     * Aktiviert/deaktiviert den Start-Button.
     * Bedingung: Name eingegeben UND Vereine geladen.
     *
     * Cheatsheet 04: if/else
     * Cheatsheet 05: classList.add, classList.remove
     */
    function aktualisiereStartKnopf() {
        // .trim() entfernt Leerzeichen am Anfang/Ende (⚠️ nicht im Cheatsheet)
        const nameEingegeben = nameEingabe.value.trim().length > 0;
        const vereineGeladen = vereine.length > 0;

        if (nameEingegeben && vereineGeladen) {
            // Cheatsheet 05: classList
            startKnopf.classList.remove('btn-start--disabled');
            startKnopf.classList.add('btn-start--active');
            startKnopf.disabled = false;
        } else {
            startKnopf.classList.add('btn-start--disabled');
            startKnopf.classList.remove('btn-start--active');
            startKnopf.disabled = true;
        }
    }

    /**
     * Speichert den aktuellen Spielernamen und Verein in localStorage.
     * Cheatsheet 08: localStorage.setItem / removeItem
     */
    function speichereAuswahl() {
        localStorage.setItem('spielerName', nameEingabe.value.trim());

        if (vereine.length > 0) {
            const neuesTeam = vereine[aktuellerVereinsIndex];

            // Prüfen ob das Team gewechselt hat
            // Cheatsheet 08: localStorage.getItem
            const altesTeamJson = localStorage.getItem('ausgewaehlterVerein');
            if (altesTeamJson) {
                // ⚠️ JSON.parse nicht im Cheatsheet
                const altesTeam = JSON.parse(altesTeamJson);

                // Cheatsheet 04: if-Bedingung
                if (altesTeam.id !== neuesTeam.id) {
                    // Team hat sich geändert → alten Spielplan löschen
                    // ⚠️ localStorage.removeItem nicht im Cheatsheet
                    localStorage.removeItem('spielplan');
                    localStorage.removeItem('spielplanTeamId');
                    console.log('Team gewechselt – Spielplan wird beim nächsten Turnierbaum neu gebaut');
                }
            }

            // ⚠️ JSON.stringify nicht im Cheatsheet – wandelt Objekt → Text
            localStorage.setItem('ausgewaehlterVerein', JSON.stringify(neuesTeam));
        }
    }

    /**
     * Lädt den gespeicherten Namen beim Seitenstart.
     * Cheatsheet 08: localStorage.getItem
     */
    function ladeGespeicherteAuswahl() {
        const gespeicherterName = localStorage.getItem('spielerName');
        if (gespeicherterName) {
            nameEingabe.value = gespeicherterName;
        }
    }

    /**
     * Lädt die 16 Champions League Vereine von der API.
     * Cheatsheet 13: async function, await, fetch, try/catch
     *
     * ⚠️ NICHT im Cheatsheet:
     *    fetch() mit { headers: {...} } – zweites Argument mit API-Key
     */
    async function ladeVereine() {
        try {
            // ⚠️ headers-Option nicht im Cheatsheet 13
            const antwort = await fetch(apiAdresse, {
                headers: { 'X-Auth-Token': apiSchluessel }
            });

            const daten = await antwort.json();

            // ⚠️ .filter() nicht im Cheatsheet – filtert das Array
            // Erst bevorzugte Vereine (aus vereinsIds) holen
            const bevorzugte = daten.teams.filter(function(verein) {
                return vereinsIds.includes(verein.id);
            });

            if (bevorzugte.length >= 16) {
                // Genug bevorzugte Vereine → ersten 16 nehmen
                vereine = bevorzugte.slice(0, 16);
            } else {
                // Zu wenige (manche nicht mehr in der CL diese Saison)
                // → mit anderen echten CL-Teams auffüllen bis wir 16 haben
                const restliche = daten.teams.filter(function(verein) {
                    return !vereinsIds.includes(verein.id);
                });
                vereine = bevorzugte.concat(restliche).slice(0, 16);
            }

            console.log(`${vereine.length} Vereine geladen`);

            // ✅ NEU: Alle Vereine in localStorage speichern
            // turnierbaum.html braucht diese Liste für den Bracket
            // Cheatsheet 08: localStorage.setItem
            // ⚠️ JSON.stringify nicht im Cheatsheet
            localStorage.setItem('alleVereine', JSON.stringify(vereine));

            // Ersten Verein anzeigen
            zeigeAktuellenVerein();
            aktualisiereStartKnopf();

        } catch (fehler) {
            // Fehler-Behandlung (Cheatsheet 13: catch)
            console.error('Vereine konnten nicht geladen werden:', fehler);
            vereinsName.innerText = 'Fehler beim Laden';
        }
    }

    // ----------------------------------------------------------
    // EVENT-LISTENER (Cheatsheet 06)
    // ----------------------------------------------------------

    // Pfeil LINKS ◀ – vorheriger Verein
    knopfZurueck.addEventListener('click', function() {
        if (aktuellerVereinsIndex === 0) {
            aktuellerVereinsIndex = vereine.length - 1;
        } else {
            aktuellerVereinsIndex = aktuellerVereinsIndex - 1;
        }
        vereinsSelector.classList.remove('team-selector--ausgewaehlt');
        zeigeAktuellenVerein();
        speichereAuswahl();
    });

    // Pfeil RECHTS ▶ – nächster Verein
    knopfWeiter.addEventListener('click', function() {
        if (aktuellerVereinsIndex === vereine.length - 1) {
            aktuellerVereinsIndex = 0;
        } else {
            aktuellerVereinsIndex = aktuellerVereinsIndex + 1;
        }
        vereinsSelector.classList.remove('team-selector--ausgewaehlt');
        zeigeAktuellenVerein();
        speichereAuswahl();
    });

    // Klick auf Verein in der Mitte → grüner Rahmen als Bestätigung
    vereinsAnzeige.addEventListener('click', function() {
        vereinsSelector.classList.add('team-selector--ausgewaehlt');
    });

    // Eingabe im Name-Feld
    // Cheatsheet 06: 'input' Event
    nameEingabe.addEventListener('input', function() {
        aktualisiereStartKnopf();
        speichereAuswahl();
    });

    // Start-Button: Turnier starten
    startKnopf.addEventListener('click', function() {
        if (startKnopf.disabled) return;
        speichereAuswahl();
        // ⚠️ window.location.href nicht im Cheatsheet – navigiert zur nächsten Seite
        window.location.href = 'turnierbaum.html';
    });

    // Seite geladen → alles starten
    // Cheatsheet 06: window.addEventListener('load', ...)
    window.addEventListener('load', async function() {
        console.log('Index-Seite geladen');
        ladeGespeicherteAuswahl();
        await ladeVereine();
    });

} // Ende if (aufIndexSeite)


// ============================================================
//  SEITE 2: TURNIERBAUM.HTML
// ============================================================

if (aufTurnierbaum) {

    // ----------------------------------------------------------
    // VARIABLEN (Cheatsheet 01)
    // ----------------------------------------------------------
    let alleTeams    = [];  // Alle 16 Vereine aus localStorage
    let spielerTeam  = null;
    let spielplan    = [];  // Array mit 8 Match-Objekten

    // ----------------------------------------------------------
    // DOM-ELEMENTE (Cheatsheet 05)
    // ----------------------------------------------------------
    const btnZurueck = document.querySelector('#btn-zurueck');
    const btnWeiter  = document.querySelector('#btn-weiter');

    // ----------------------------------------------------------
    // FUNKTIONEN (Cheatsheet 03)
    // ----------------------------------------------------------

    /**
     * Lädt alle gespeicherten Daten aus localStorage.
     * Cheatsheet 08: localStorage.getItem
     * ⚠️ JSON.parse nicht im Cheatsheet – Text → Objekt
     */
    function ladeDaten() {
        const vereinJson = localStorage.getItem('ausgewaehlterVerein');
        const alleJson   = localStorage.getItem('alleVereine');

        if (vereinJson) spielerTeam = JSON.parse(vereinJson);
        if (alleJson)   alleTeams   = JSON.parse(alleJson);

        // Falls keine Daten: zurück zur Startseite
        // Cheatsheet 04: if-Bedingung
        if (!spielerTeam || alleTeams.length === 0) {
            console.log('Keine Daten – zurück zur Startseite');
            window.location.href = 'index.html';
        }
    }

    /**
     * Baut den Spielplan: 8 Spiele, Spieler immer in Spiel 1.
     *
     * Wichtig: Der Spielplan wird NUR neu gebaut wenn sich das Team geändert hat.
     * Sonst wird der gespeicherte Plan aus localStorage geladen.
     * So bleiben die Paarungen gleich wenn man von der Vorschau zurückkommt.
     *
     * Cheatsheet 08: localStorage.getItem / setItem
     * ⚠️ NICHT im Cheatsheet:
     *    array.filter() → filtert Elemente heraus
     *    array.sort(fn) + Math.random() → Array zufällig mischen
     */
    function baueSpieiplan() {
        // Prüfen ob schon ein gespeicherter Plan für dieses Team existiert
        // Cheatsheet 08: localStorage.getItem
        const gespeicherterPlan   = localStorage.getItem('spielplan');
        const gespeichertesTeamId = localStorage.getItem('spielplanTeamId');

        // Cheatsheet 04: if-Bedingung
        // Wenn ein Plan existiert UND er für dasselbe Team gebaut wurde → wiederverwenden
        if (gespeicherterPlan && gespeichertesTeamId === String(spielerTeam.id)) {
            // ⚠️ JSON.parse nicht im Cheatsheet – Text → Objekt
            spielplan = JSON.parse(gespeicherterPlan);
            console.log('Gespeicherten Spielplan geladen – Paarungen bleiben gleich');
            return; // Funktion hier beenden, nichts neu bauen
        }

        // Kein gespeicherter Plan oder anderes Team gewählt → neu bauen
        console.log('Neuen Spielplan bauen – Team hat sich geändert oder erster Aufruf');

        // Alle Teams AUSSER dem Spieler-Team
        // ⚠️ .filter() nicht im Cheatsheet
        let andereTeams = alleTeams.filter(function(team) {
            return team.id !== spielerTeam.id;
        });

        // Zufällige Reihenfolge (Cheatsheet-Trick für Mischen)
        // ⚠️ .sort() + Math.random() nicht im Cheatsheet
        andereTeams.sort(function() {
            return Math.random() - 0.5;
        });

        // 8 Spiele aufbauen (Cheatsheet 11: Objekte, Cheatsheet 09: Arrays)
        spielplan = [
            { id: 'af1', heim: spielerTeam,   gast: andereTeams[0],  istSpielerSpiel: true  },
            { id: 'af2', heim: andereTeams[1], gast: andereTeams[2],  istSpielerSpiel: false },
            { id: 'af3', heim: andereTeams[3], gast: andereTeams[4],  istSpielerSpiel: false },
            { id: 'af4', heim: andereTeams[5], gast: andereTeams[6],  istSpielerSpiel: false },
            { id: 'af5', heim: andereTeams[7], gast: andereTeams[8],  istSpielerSpiel: false },
            { id: 'af6', heim: andereTeams[9], gast: andereTeams[10], istSpielerSpiel: false },
            { id: 'af7', heim: andereTeams[11],gast: andereTeams[12], istSpielerSpiel: false },
            { id: 'af8', heim: andereTeams[13],gast: andereTeams[14], istSpielerSpiel: false },
        ];

        // Spielplan UND Team-ID zusammen speichern
        // Cheatsheet 08: localStorage.setItem
        // → beim nächsten Laden wissen wir: dieser Plan gehört zu diesem Team
        localStorage.setItem('spielplan',      JSON.stringify(spielplan));
        localStorage.setItem('spielplanTeamId', String(spielerTeam.id));
        localStorage.setItem('aktuellesSpiel', JSON.stringify(spielplan[0]));
        localStorage.setItem('aktuelleRunde',  'Achtelfinale');
    }

    /**
     * Füllt eine Match-Karte mit den Team-Namen.
     * Cheatsheet 05: querySelector, innerText
     */
    function befuelleKarte(spielId, spiel) {
        // Template Literal für die ID (Cheatsheet 01: Template Literals)
        const heimElement = document.querySelector(`#${spielId}-heim`);
        const gastElement = document.querySelector(`#${spielId}-gast`);

        if (heimElement && gastElement) {
            // Cheatsheet 11: Objekt-Property lesen
            // Null-Check: verhindert Fehler wenn ein Team fehlt
            heimElement.innerText = spiel.heim ? (spiel.heim.shortName || spiel.heim.name) : '---';
            gastElement.innerText = spiel.gast ? (spiel.gast.shortName || spiel.gast.name) : '---';
        }
    }

    /**
     * Zeigt alle 8 Spiele im Bracket an.
     * Cheatsheet 10: forEach – geht durch jedes Element
     * Cheatsheet 05: classList.add
     */
    function zeigeBracket() {
        // forEach: für jedes Spiel im spielplan
        // Cheatsheet 10: forEach-Schleife
        spielplan.forEach(function(spiel) {
            befuelleKarte(spiel.id, spiel);

            // Spieler-Spiel: grüner Rahmen
            // Cheatsheet 04: if-Bedingung
            if (spiel.istSpielerSpiel) {
                const karte = document.querySelector(`#match-${spiel.id}`);
                if (karte) {
                    karte.classList.add('match-card--aktiv');
                }
            }
        });
    }

    // ----------------------------------------------------------
    // EVENT-LISTENER (Cheatsheet 06)
    // ----------------------------------------------------------

    // "← Zurück" → zurück zur Startseite
    btnZurueck.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // "Zum nächsten Spiel →" → zur Vorschau-Seite
    btnWeiter.addEventListener('click', function() {
        window.location.href = 'vorschau.html';
    });

    // Seite geladen
    window.addEventListener('load', function() {
        console.log('Turnierbaum geladen');
        ladeDaten();
        baueSpieiplan();
        zeigeBracket();
    });

} // Ende if (aufTurnierbaum)


// ============================================================
//  SEITE 3: VORSCHAU.HTML (Match-Vorschau)
// ============================================================

if (aufVorschauSeite) {

    // ----------------------------------------------------------
    // VARIABLEN (Cheatsheet 01)
    // ----------------------------------------------------------
    let aktuellesSpiel = null;  // Das aktuelle Match-Objekt
    let aktuelleRunde  = '';    // z.B. "Achtelfinale"

    // ----------------------------------------------------------
    // DOM-ELEMENTE (Cheatsheet 05)
    // ----------------------------------------------------------
    const spielerLogo  = document.querySelector('#spieler-logo');
    const spielerName  = document.querySelector('#spieler-name');
    const spielerLiga  = document.querySelector('#spieler-liga');

    const gegnerLogo   = document.querySelector('#gegner-logo');
    const gegnerName   = document.querySelector('#gegner-name');
    const gegnerLiga   = document.querySelector('#gegner-liga');

    const rundenLabel  = document.querySelector('#runden-name');

    // Schwierigkeits-Punkte
    const dot1         = document.querySelector('#dot-1');
    const dot2         = document.querySelector('#dot-2');
    const dot3         = document.querySelector('#dot-3');

    // Buttons
    const btnAnpfiff   = document.querySelector('#btn-anpfiff');
    const btnZurueck   = document.querySelector('#btn-zurueck-vorschau');

    // ----------------------------------------------------------
    // FUNKTIONEN (Cheatsheet 03)
    // ----------------------------------------------------------

    /**
     * Lädt das aktuelle Spiel aus localStorage
     */
    function ladeAktuellesSpiel() {
        const spielJson  = localStorage.getItem('aktuellesSpiel');
        const rundeText  = localStorage.getItem('aktuelleRunde');

        // Cheatsheet 04: if-Bedingung
        if (!spielJson) {
            console.log('Kein Spiel gefunden – zurück zum Turnierbaum');
            window.location.href = 'turnierbaum.html';
            return;
        }

        // ⚠️ JSON.parse nicht im Cheatsheet – Text → Objekt
        aktuellesSpiel = JSON.parse(spielJson);
        aktuelleRunde  = rundeText || 'Achtelfinale';
    }

    /**
     * Zeigt die Spieler-Team-Informationen an.
     * Cheatsheet 05: setAttribute, innerText
     * Cheatsheet 11: Objekt-Properties
     */
    function zeigeSpielerdaten() {
        const heim = aktuellesSpiel.heim; // Spieler-Team (Heim)

        // Logo setzen (Cheatsheet 05: setAttribute)
        spielerLogo.setAttribute('src', heim.crest);
        spielerLogo.setAttribute('alt', heim.name);

        // Namen setzen (Cheatsheet 05: innerText)
        spielerName.innerText = heim.name;

        // Liga-Info: area.name kommt von der API (Cheatsheet 11: verschachteltes Objekt)
        // Cheatsheet 04: ternary (kurzform von if/else)
        // ⚠️ Ternary-Operator ist NICHT explizit im Cheatsheet
        spielerLiga.innerText = heim.area ? heim.area.name : '';
    }

    /**
     * Zeigt den Gegner an.
     * Cheatsheet 05: setAttribute, innerText
     */
    function zeigeGegnerdaten() {
        const gast = aktuellesSpiel.gast; // Gegner-Team (Gast)

        gegnerLogo.setAttribute('src', gast.crest);
        gegnerLogo.setAttribute('alt', gast.name);
        gegnerName.innerText = gast.name;
        gegnerLiga.innerText = gast.area ? gast.area.name : '';
    }

    /**
     * Zeigt den Runden-Namen und die Schwierigkeitspunkte.
     *
     * Schwierigkeit steigt mit jeder Runde:
     *   Achtelfinale  → 1 Punkt aktiv
     *   Viertelfinale → 2 Punkte aktiv
     *   Halbfinale    → 3 Punkte aktiv
     *   Finale        → 3 Punkte aktiv
     *
     * Cheatsheet 04: if/else (Bedingungen)
     * Cheatsheet 05: innerText, classList
     */
    function zeigeRundenInfo() {
        // Runden-Name in Grossbuchstaben anzeigen
        // ⚠️ .toUpperCase() nicht im Cheatsheet – wandelt Text in Grossbuchstaben
        rundenLabel.innerText = aktuelleRunde.toUpperCase();

        // Schwierigkeitspunkte aktivieren je nach Runde
        // Cheatsheet 04: if/else Bedingungen
        if (aktuelleRunde === 'Achtelfinale') {
            dot1.classList.add('vorschau__dot--aktiv');      // 1 Punkt gelb
        } else if (aktuelleRunde === 'Viertelfinale') {
            dot1.classList.add('vorschau__dot--aktiv');      // 2 Punkte gelb
            dot2.classList.add('vorschau__dot--aktiv');
        } else if (aktuelleRunde === 'Halbfinale' || aktuelleRunde === 'Finale') {
            dot1.classList.add('vorschau__dot--aktiv');      // 3 Punkte gelb
            dot2.classList.add('vorschau__dot--aktiv');
            dot3.classList.add('vorschau__dot--aktiv');
        }
    }

    // ----------------------------------------------------------
    // EVENT-LISTENER (Cheatsheet 06)
    // ----------------------------------------------------------

    // "Anpfiff →" → zum Quiz/Spiel
    // (spiel.html kommt in der nächsten Iteration)
    btnAnpfiff.addEventListener('click', function() {
        window.location.href = 'spiel.html';
    });

    // "← Zurück" → zurück zum Turnierbaum
    btnZurueck.addEventListener('click', function() {
        window.location.href = 'turnierbaum.html';
    });

    // Seite geladen → alles aufbauen
    // Cheatsheet 06: window.addEventListener('load', ...)
    window.addEventListener('load', function() {
        console.log('Vorschau-Seite geladen');

        // 1. Spiel-Daten aus localStorage laden
        ladeAktuellesSpiel();

        // 2. Nur anzeigen wenn Daten vorhanden (ladeAktuellesSpiel macht Redirect falls nicht)
        if (aktuellesSpiel) {
            zeigeSpielerdaten();
            zeigeGegnerdaten();
            zeigeRundenInfo();
        }
    });

} // Ende if (aufVorschauSeite)


// ============================================================
//  SEITE 4: SPIEL.HTML (Das Quiz-Spiel)
// ============================================================

if (document.querySelector('.spiel-page') !== null) {

    // ----------------------------------------------------------
    // VARIABLEN (Cheatsheet 01)
    // ----------------------------------------------------------

    // Spielstand
    let spielerTore  = 0;    // Richtige Antworten = Tore des Spielers
    let gegnerTore   = 0;    // Falsche Antworten = Gegentore
    let frageNummer  = 0;    // Welche Frage ist aktuell? (0 = erste)
    let spielZeit    = 60;   // Echte Sekunden (60 Sek = 90 Spielminuten)
    let spielLaeuft  = true; // false wenn Spiel beendet
    let richtigeAntworten = 0; // Für die Abpfiff-Stats

    // Daten aus localStorage
    let aktuellesSpiel = null;
    let aktuelleRunde  = '';
    let alleTeams      = [];

    // Das Array mit allen generierten Fragen
    let fragen = [];

    // Der Interval-Timer
    // ⚠️ NICHT im Cheatsheet: setInterval() – wiederholt eine Funktion jede X Millisekunden
    let timerInterval = null;

    // ----------------------------------------------------------
    // DOM-ELEMENTE (Cheatsheet 05)
    // ----------------------------------------------------------

    // Scoreboard
    const sbSpielerLogo  = document.querySelector('#sb-spieler-logo');
    const sbSpielerKuerz = document.querySelector('#sb-spieler-kuerzel');
    const sbSpielerName  = document.querySelector('#sb-spieler-name');
    const sbGegnerLogo   = document.querySelector('#sb-gegner-logo');
    const sbGegnerKuerz  = document.querySelector('#sb-gegner-kuerzel');
    const sbGegnerName   = document.querySelector('#sb-gegner-name');
    const spielZeitEl    = document.querySelector('#spiel-zeit');
    const spielScoreEl   = document.querySelector('#spiel-score');

    // Frage-Karte
    const frageLabel    = document.querySelector('#frage-label');
    const frageBild     = document.querySelector('#frage-bild');
    const frageText     = document.querySelector('#frage-text');
    const antwortBtns   = [
        document.querySelector('#antwort-a'),
        document.querySelector('#antwort-b'),
        document.querySelector('#antwort-c'),
        document.querySelector('#antwort-d'),
    ];
    const antwortTexte  = [
        document.querySelector('#text-a'),
        document.querySelector('#text-b'),
        document.querySelector('#text-c'),
        document.querySelector('#text-d'),
    ];

    // Overlays
    const torOverlay     = document.querySelector('#tor-overlay');
    const gegentorOverlay = document.querySelector('#gegentor-overlay');
    const abpfiffEl      = document.querySelector('#abpfiff');

    // Abpfiff-Elemente
    const abpfiffErgebnis    = document.querySelector('#abpfiff-ergebnis');
    const abpfiffSpielerLogo = document.querySelector('#abpfiff-spieler-logo');
    const abpfiffGegnerLogo  = document.querySelector('#abpfiff-gegner-logo');
    const abpfiffScore       = document.querySelector('#abpfiff-score');
    const abpfiffSpielerName = document.querySelector('#abpfiff-spieler-name');
    const abpfiffGegnerName  = document.querySelector('#abpfiff-gegner-name');
    const abpfiffRunde       = document.querySelector('#abpfiff-runde');
    const abpfiffRichtig     = document.querySelector('#abpfiff-richtig');
    const abpfiffWeiter      = document.querySelector('#abpfiff-weiter');
    const abpfiffMeldung     = document.querySelector('#abpfiff-meldung');
    const abpfiffBtn         = document.querySelector('#abpfiff-btn');

    // ----------------------------------------------------------
    // FRAGEN-GENERIERUNG (Cheatsheet 09, 10, 11)
    // Fragen werden aus den API-Daten der Teams generiert
    // ----------------------------------------------------------

    /**
     * Gibt den Fragetyp je nach Runde zurück.
     * Achtelfinale → einfache Typen
     * Finale → alle Typen gemischt
     *
     * Cheatsheet 04: if/else
     */
    function getFrageTypen() {
        // Cheatsheet 04: Bedingungen
        if (aktuelleRunde === 'Achtelfinale') {
            // Nur Wappen- und Land-Fragen (einfach)
            return ['wappen', 'land', 'wappen', 'land'];
        } else if (aktuelleRunde === 'Viertelfinale') {
            return ['wappen', 'land', 'kuerzel', 'wappen'];
        } else if (aktuelleRunde === 'Halbfinale') {
            return ['wappen', 'kuerzel', 'land', 'kuerzel'];
        } else {
            // Finale: alle Typen
            return ['wappen', 'kuerzel', 'land', 'wappen'];
        }
    }

    /**
     * Erstellt ein Frage-Objekt für ein bestimmtes Team und einen Typ.
     *
     * Cheatsheet 11: Objekte erstellen und lesen
     * Cheatsheet 01: Template Literals
     *
     * ⚠️ NICHT im Cheatsheet: .slice(), Array-Destrukturierung
     */
    function erstelleFrage(richtigesTeam, typ) {
        // 3 andere Teams für falsche Antworten wählen
        // ⚠️ .filter() und .sort() nicht im Cheatsheet
        let andereTeams = alleTeams.filter(function(t) {
            return t.id !== richtigesTeam.id;
        });
        andereTeams.sort(function() { return Math.random() - 0.5; });
        // ⚠️ .slice() nicht im Cheatsheet – gibt Teil eines Arrays zurück
        let falsche3 = andereTeams.slice(0, 3);

        // Cheatsheet 11: Objekte – wir bauen ein Frage-Objekt
        let frage = {
            typ: typ,
            richtigesTeam: richtigesTeam,
            bild: '',          // URL des Bildes (bei Wappen-Fragen)
            frageText: '',     // Der Frage-Text
            richtigeAntwort: '', // Die korrekte Antwort
            optionen: [],      // Array mit 4 Antwort-Optionen
        };

        // Frage je nach Typ befüllen (Cheatsheet 04: if/else)
        if (typ === 'wappen') {
            // WAPPEN-FRAGE: Zeige Wappen, frage nach Vereinsname
            frage.bild = richtigesTeam.crest;
            frage.frageText = 'Welchem Verein gehört dieses Wappen?';
            frage.richtigeAntwort = richtigesTeam.name;

            // 4 Optionen: Richtiger Name + 3 falsche Namen
            // ⚠️ Spread-Operator ... nicht im Cheatsheet
            let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
            alleOptionen.sort(function() { return Math.random() - 0.5; });
            frage.optionen = alleOptionen;

        } else if (typ === 'land') {
            // LAND-FRAGE: Zeige Vereinsname, frage nach Land
            frage.bild = richtigesTeam.crest;
            // Cheatsheet 01: Template Literal
            frage.frageText = `Aus welchem Land kommt ${richtigesTeam.shortName || richtigesTeam.name}?`;
            frage.richtigeAntwort = richtigesTeam.area.name;

            let alleOptionen = [
                richtigesTeam.area.name,
                falsche3[0].area.name,
                falsche3[1].area.name,
                falsche3[2].area.name,
            ];
            alleOptionen.sort(function() { return Math.random() - 0.5; });
            frage.optionen = alleOptionen;

        } else if (typ === 'kuerzel') {
            // KÜRZEL-FRAGE: Zeige Vereinsname, frage nach TLA (z.B. "FCB")
            frage.bild = richtigesTeam.crest;
            frage.frageText = `Was ist die offizielle Abkürzung von ${richtigesTeam.name}?`;
            frage.richtigeAntwort = richtigesTeam.tla;

            let alleOptionen = [
                richtigesTeam.tla,
                falsche3[0].tla,
                falsche3[1].tla,
                falsche3[2].tla,
            ];
            alleOptionen.sort(function() { return Math.random() - 0.5; });
            frage.optionen = alleOptionen;
        }

        return frage; // Cheatsheet 03: return-Wert
    }

    /**
     * Generiert 10 Fragen für das Spiel.
     * Cheatsheet 10: for-Schleife
     * Cheatsheet 09: .push() – Element zum Array hinzufügen
     */
    function generiereFragen() {
        fragen = []; // Array leeren (Cheatsheet 09)

        // Fragetypen je nach Runde
        let typen = getFrageTypen();

        // 10 Fragen generieren (mehr als für Sieg/Niederlage nötig)
        // Cheatsheet 10: for-Schleife
        for (let i = 0; i < 10; i++) {
            // Zufälliges Team aus allen Teams wählen
            // ⚠️ Math.floor + Math.random nicht im Cheatsheet
            let zufallsIndex = Math.floor(Math.random() * alleTeams.length);
            let team = alleTeams[zufallsIndex];

            // Fragetyp: wechselt durch die Typen-Liste
            // ⚠️ Modulo-Operator % nicht im Cheatsheet
            let typ = typen[i % typen.length];

            let frage = erstelleFrage(team, typ);
            fragen.push(frage); // Cheatsheet 09: .push()
        }
    }

    // ----------------------------------------------------------
    // ANZEIGE-FUNKTIONEN (Cheatsheet 05)
    // ----------------------------------------------------------

    /**
     * Zeigt die aktuelle Frage an.
     * Cheatsheet 05: innerText, setAttribute, classList
     * Cheatsheet 09: Array-Zugriff per Index
     * Cheatsheet 11: Objekt-Properties lesen
     */
    function zeigeFrage() {
        // Sicherheits-Check: Gibt es noch Fragen?
        if (frageNummer >= fragen.length) {
            // Keine Fragen mehr → Spiel beenden
            spielEnde();
            return;
        }

        // Aktuelle Frage aus dem Array laden (Cheatsheet 09)
        let frage = fragen[frageNummer];

        // Frage-Label aktualisieren (Cheatsheet 01: Template Literal)
        frageLabel.innerText = `Frage ${frageNummer + 1} · ${aktuelleRunde}`;

        // Bild setzen (Cheatsheet 05: setAttribute)
        frageBild.setAttribute('src', frage.bild);
        frageBild.setAttribute('alt', 'Vereinswappen');

        // Frage-Text setzen (Cheatsheet 05: innerText)
        frageText.innerText = frage.frageText;

        // Antwort-Buttons befüllen (Cheatsheet 10: forEach)
        const buchstaben = ['A', 'B', 'C', 'D'];
        antwortBtns.forEach(function(btn, index) {
            // Text setzen
            antwortTexte[index].innerText = frage.optionen[index];

            // Klassen zurücksetzen (Cheatsheet 05: classList)
            btn.classList.remove('antwort-btn--richtig', 'antwort-btn--falsch', 'antwort-btn--deaktiviert');
            btn.disabled = false;

            // Badge-Buchstabe setzen
            btn.querySelector('.antwort-btn__badge').innerText = buchstaben[index];
        });
    }

    /**
     * Zeigt die aktuelle Spielzeit formatiert an.
     * 60 echte Sekunden = 90 Spielminuten
     *
     * ⚠️ NICHT im Cheatsheet: Math.floor(), String.padStart()
     */
    function zeigeZeit() {
        // Vergangene echte Zeit in Spielminuten umrechnen
        // 60 Sek real → 90 Spielminuten → 1 Sek real = 1.5 Spielminuten
        const vergangen = 60 - spielZeit;  // Wie viele echte Sekunden sind vergangen?
        const spielMinuten = Math.floor(vergangen * 1.5);
        const spielSekundenRest = Math.floor((vergangen * 1.5 - spielMinuten) * 60);

        // Mit führenden Nullen formatieren (z.B. "04:08")
        // ⚠️ .padStart() nicht im Cheatsheet – fügt Nullen vorne ein
        const minStr = String(spielMinuten).padStart(2, '0');
        const sekStr = String(spielSekundenRest).padStart(2, '0');

        // Cheatsheet 05: innerText + Cheatsheet 01: Template Literal
        spielZeitEl.innerText = `${minStr}:${sekStr}`;
    }

    /**
     * Aktualisiert den Spielstand im Scoreboard.
     * Cheatsheet 05: innerText
     * Cheatsheet 01: Template Literal
     */
    function zeigeScore() {
        spielScoreEl.innerText = `${spielerTore} : ${gegnerTore}`;
    }

    // ----------------------------------------------------------
    // SPIEL-LOGIK
    // ----------------------------------------------------------

    /**
     * Wird aufgerufen wenn ein Antwort-Button geklickt wird.
     * Cheatsheet 04: if/else
     * Cheatsheet 05: classList
     *
     * @param {number} index - 0=A, 1=B, 2=C, 3=D
     */
    function antwortKlick(index) {
        // Nur reagieren wenn Spiel läuft (Cheatsheet 04)
        if (!spielLaeuft) return;

        let frage = fragen[frageNummer];
        let gewaehlteAntwort = frage.optionen[index];

        // ALLE Buttons deaktivieren (damit nicht nochmal geklickt werden kann)
        // Cheatsheet 10: forEach
        antwortBtns.forEach(function(btn) {
            btn.classList.add('antwort-btn--deaktiviert');
            btn.disabled = true;
        });

        // Richtige Antwort grün markieren
        // Cheatsheet 09: indexOf – findet Position im Array
        // ⚠️ .indexOf() nicht im Cheatsheet
        let richtigePosition = frage.optionen.indexOf(frage.richtigeAntwort);
        antwortBtns[richtigePosition].classList.add('antwort-btn--richtig');

        // War die Antwort richtig oder falsch?
        if (gewaehlteAntwort === frage.richtigeAntwort) {
            // ✅ RICHTIG → TOR!
            antwortBtns[index].classList.add('antwort-btn--richtig');
            spielerTore = spielerTore + 1;
            richtigeAntworten = richtigeAntworten + 1;
            zeigeScore();
            zeigeTorOverlay(true);

        } else {
            // ❌ FALSCH → GEGENTOR!
            antwortBtns[index].classList.add('antwort-btn--falsch');
            gegnerTore = gegnerTore + 1;
            zeigeScore();
            zeigeTorOverlay(false);
        }

        // Nach 1.5 Sekunden: prüfen ob Spiel weitergeht
        // ⚠️ setTimeout nicht im Cheatsheet – führt Funktion nach X Millisekunden aus
        setTimeout(function() {
            versteckeOverlays();

            // Gewonnen: 5 Tore des Spielers
            if (spielerTore >= 5) {
                spielEnde();
                return;
            }
            // Verloren: 5 Gegentore
            if (gegnerTore >= 5) {
                spielEnde();
                return;
            }

            // Weiter zur nächsten Frage
            frageNummer = frageNummer + 1;
            zeigeFrage();
        }, 1500); // 1500ms = 1.5 Sekunden
    }

    /**
     * Zeigt TOR! oder GEGENTOR! Overlay für 1.5 Sekunden.
     * Cheatsheet 05: classList.remove (Overlay zeigen)
     */
    function zeigeTorOverlay(istTor) {
        // Cheatsheet 04: if/else
        if (istTor) {
            // Cheatsheet 05: classList.remove = Element sichtbar machen
            torOverlay.classList.remove('overlay--versteckt');
        } else {
            gegentorOverlay.classList.remove('overlay--versteckt');
        }
    }

    /**
     * Versteckt beide Overlays.
     * Cheatsheet 05: classList.add
     */
    function versteckeOverlays() {
        // Cheatsheet 05: classList.add = Element wieder verstecken
        torOverlay.classList.add('overlay--versteckt');
        gegentorOverlay.classList.add('overlay--versteckt');
    }

    /**
     * Beendet das Spiel und zeigt den Abpfiff-Screen.
     * Cheatsheet 04: if/else (Sieg oder Niederlage)
     * Cheatsheet 08: localStorage (Spielstand speichern)
     */
    function spielEnde() {
        spielLaeuft = false;

        // Timer stoppen
        // ⚠️ clearInterval nicht im Cheatsheet – stoppt einen setInterval
        clearInterval(timerInterval);

        // Sieg oder Niederlage? (Cheatsheet 04: Bedingungen)
        // Sieg wenn: mehr Spielertore ODER genau 5 Spielertore (auch bei Gleichstand gewinnt Spieler)
        const istSieg = spielerTore > gegnerTore || spielerTore >= 5;

        // Nächste Runde bestimmen (Cheatsheet 04: if/else)
        let naechsteRunde = '';
        if (aktuelleRunde === 'Achtelfinale')  naechsteRunde = 'Viertelfinale';
        if (aktuelleRunde === 'Viertelfinale') naechsteRunde = 'Halbfinale';
        if (aktuelleRunde === 'Halbfinale')    naechsteRunde = 'Finale';
        if (aktuelleRunde === 'Finale')        naechsteRunde = 'Champion!';

        // Abpfiff-Screen befüllen (Cheatsheet 05: innerText, setAttribute)
        abpfiffErgebnis.innerText   = istSieg ? 'SIEG!' : 'NIEDERLAGE';
        abpfiffScore.innerText      = `${spielerTore} : ${gegnerTore}`;
        abpfiffRunde.innerText      = aktuelleRunde;
        abpfiffRichtig.innerText    = `${richtigeAntworten} / ${frageNummer + 1}`;
        abpfiffWeiter.innerText     = istSieg ? naechsteRunde : '-';

        // Logos (Cheatsheet 05: setAttribute)
        abpfiffSpielerLogo.setAttribute('src', aktuellesSpiel.heim.crest);
        abpfiffGegnerLogo.setAttribute('src',  aktuellesSpiel.gast.crest);

        // Team-Namen (Cheatsheet 05: innerText)
        abpfiffSpielerName.innerText = aktuellesSpiel.heim.shortName || aktuellesSpiel.heim.name;
        abpfiffGegnerName.innerText  = aktuellesSpiel.gast.shortName || aktuellesSpiel.gast.name;

        // Glückwunsch-Meldung (Cheatsheet 01: Template Literal)
        const spielerName = localStorage.getItem('spielerName') || 'Spieler';
        const vereinName  = aktuellesSpiel.heim.shortName || aktuellesSpiel.heim.name;
        if (istSieg) {
            if (naechsteRunde === 'Champion!') {
                abpfiffMeldung.innerText = `Glückwunsch ${spielerName}! ${vereinName} ist CHAMPION!`;
            } else {
                abpfiffMeldung.innerText = `Glückwunsch ${spielerName}! ${vereinName} steht im ${naechsteRunde}!`;
            }
        } else {
            abpfiffMeldung.innerText = `Schade ${spielerName}! Nächste Saison wieder angreifen!`;
        }

        // Niederlage → roter Text und Button
        // Cheatsheet 05: classList
        if (!istSieg) {
            abpfiffErgebnis.classList.add('abpfiff__ergebnis--niederlage');
            abpfiffBtn.classList.add('abpfiff__btn--niederlage');
            abpfiffBtn.innerText = 'Nochmal spielen';
        } else if (naechsteRunde === 'Champion!') {
            abpfiffBtn.innerText = '🏆 Zum Abschluss';
        } else {
            // Cheatsheet 01: Template Literal
            abpfiffBtn.innerText = `Weiter zum ${naechsteRunde} →`;
        }

        // Nächste Runde in localStorage speichern (für den nächsten Spielzug)
        // Cheatsheet 08: localStorage.setItem
        if (istSieg) {
            localStorage.setItem('aktuelleRunde', naechsteRunde);
        }
        // Sieg/Niederlage speichern
        localStorage.setItem('letzteErgebnis', JSON.stringify({
            istSieg: istSieg,
            spielerTore: spielerTore,
            gegnerTore: gegnerTore,
            runde: aktuelleRunde,
        }));

        // Abpfiff-Screen anzeigen (Cheatsheet 05: classList.remove)
        abpfiffEl.classList.remove('overlay--versteckt');
    }

    // ----------------------------------------------------------
    // SCOREBOARD BEFÜLLEN (Cheatsheet 05)
    // ----------------------------------------------------------

    /**
     * Füllt das Scoreboard mit den Teamdaten.
     * Cheatsheet 05: setAttribute, innerText
     * Cheatsheet 11: Objekt-Properties lesen
     */
    function zeigeScoreboard() {
        const heim = aktuellesSpiel.heim;
        const gast = aktuellesSpiel.gast;

        // Spieler-Team (Heim)
        sbSpielerLogo.setAttribute('src', heim.crest);
        sbSpielerLogo.setAttribute('alt', heim.name);
        sbSpielerKuerz.innerText = heim.tla  || heim.shortName || 'FCB';
        sbSpielerName.innerText  = (heim.shortName || heim.name).toUpperCase();

        // Gegner-Team (Gast)
        sbGegnerLogo.setAttribute('src', gast.crest);
        sbGegnerLogo.setAttribute('alt', gast.name);
        sbGegnerKuerz.innerText = gast.tla  || gast.shortName || 'BVB';
        sbGegnerName.innerText  = (gast.shortName || gast.name).toUpperCase();
    }

    // ----------------------------------------------------------
    // TIMER (Cheatsheet 06: window.addEventListener für load)
    // ⚠️ setInterval NICHT im Cheatsheet
    // ----------------------------------------------------------

    /**
     * Startet den Spieltimer.
     * ⚠️ setInterval() nicht im Cheatsheet – ruft Funktion jede Sekunde auf.
     */
    function starteTimer() {
        // ⚠️ NICHT im Cheatsheet: setInterval(funktion, millisekunden)
        timerInterval = setInterval(function() {
            spielZeit = spielZeit - 1;  // Eine Sekunde weniger
            zeigeZeit();               // Anzeige aktualisieren

            // Zeit abgelaufen?
            if (spielZeit <= 0) {
                spielEnde();
            }
        }, 1000); // 1000ms = 1 Sekunde
    }

    // ----------------------------------------------------------
    // EVENT-LISTENER für Antwort-Buttons (Cheatsheet 06)
    // ----------------------------------------------------------

    // Für jeden der 4 Buttons einen Click-Listener setzen
    // Cheatsheet 10: forEach
    antwortBtns.forEach(function(btn, index) {
        // Cheatsheet 06: addEventListener('click', function)
        btn.addEventListener('click', function() {
            antwortKlick(index);
        });
    });

    // Abpfiff-Button: Weiter oder Nochmal
    abpfiffBtn.addEventListener('click', function() {
        const ergebnis = JSON.parse(localStorage.getItem('letzteErgebnis') || '{}');

        if (ergebnis.istSieg) {
            const naechsteRunde = localStorage.getItem('aktuelleRunde');
            if (naechsteRunde === 'Champion!') {
                // Spiel komplett gewonnen → zurück zur Startseite
                window.location.href = 'index.html';
            } else {
                // Turnierbaum zeigen für nächste Runde
                window.location.href = 'turnierbaum.html';
            }
        } else {
            // Niederlage → Nochmal von vorne
            window.location.href = 'index.html';
        }
    });

    // ----------------------------------------------------------
    // SEITE STARTEN (Cheatsheet 06: window.addEventListener)
    // ----------------------------------------------------------

    window.addEventListener('load', function() {
        console.log('Spiel-Seite geladen');

        // Daten aus localStorage laden (Cheatsheet 08)
        const spielJson  = localStorage.getItem('aktuellesSpiel');
        const rundeText  = localStorage.getItem('aktuelleRunde');
        const teamsJson  = localStorage.getItem('alleVereine');

        // Falls keine Daten: zurück zur Startseite (Cheatsheet 04)
        if (!spielJson || !teamsJson) {
            console.log('Keine Spieldaten – zurück zur Startseite');
            window.location.href = 'index.html';
            return;
        }

        // ⚠️ JSON.parse nicht im Cheatsheet
        aktuellesSpiel = JSON.parse(spielJson);
        aktuelleRunde  = rundeText || 'Achtelfinale';
        alleTeams      = JSON.parse(teamsJson);

        // 1. Scoreboard befüllen
        zeigeScoreboard();

        // 2. Fragen generieren (aus Team-Daten)
        generiereFragen();

        // 3. Erste Frage anzeigen
        zeigeFrage();

        // 4. Timer starten
        starteTimer();

        // 5. Initiale Zeitanzeige
        zeigeZeit();
        zeigeScore();
    });

} // Ende if (aufSpielSeite)
