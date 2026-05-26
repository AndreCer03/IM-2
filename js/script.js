
// ============================================================
// CHAMPIONS QUIZ – script.js
// Enthält den Code für BEIDE Seiten:
//   • index.html  (Setup-Seite)
//   • turnierbaum.html (Turnierbaum-Seite)
//
// Verwendete Konzepte aus den Cheatsheets:
//  → 01-variablen.md    let / const / Template Literals
//  → 03-funktionen.md   Funktionen
//  → 04-bedingungen.md  if / else
//  → 05-dom.md          querySelector, innerText, classList
//  → 06-events.md       addEventListener
//  → 08-local-storage   localStorage.getItem / setItem
//  → 09-arrays.md       Arrays, .length, Zugriff per Index
//  → 10-loops.md        forEach
//  → 11-objekte.md      Objekt-Properties lesen
//  → 13-api.md          fetch, async/await
//
// ⚠️ NICHT im Cheatsheet (ich informiere dich):
//  → JSON.parse()       – wandelt Text aus localStorage zurück in ein Objekt
//  → JSON.stringify()   – wandelt ein Objekt in Text zum Speichern
//  → array.filter()     – filtert Elemente aus einem Array
//  → array.sort(fn)     – sortiert ein Array zufällig mit Math.random()
//  → Math.random()      – erzeugt eine Zufallszahl zwischen 0 und 1
// ============================================================


// ============================================================
// ════════════════════════════════════════════════════════════
//  INDEX.HTML – Setup-Seite
//  Wird nur ausgeführt wenn #player-name im DOM vorhanden ist
// ════════════════════════════════════════════════════════════
// ============================================================

if (document.querySelector('#player-name')) {

    // --------------------------------------------------------
    // SCHRITT 1: VARIABLEN (Cheatsheet 01)
    // --------------------------------------------------------

    // API-Key von football-data.org
    const apiSchluessel = '25d1021df1ca4a8cafe6c9b9e3088f24';

    // Browser blockieren fetch()-Anfragen an externe Server.
    // Ein CORS-Proxy leitet die Anfrage weiter und fügt die fehlenden
    // CORS-Header hinzu, sodass der Browser sie akzeptiert.
    const corsProxy = 'https://corsproxy.io/?url=';
    const apiAdresse = `${corsProxy}https://api.football-data.org/v4/competitions/CL/teams`;

    // Bevorzugte Vereine – oft in der Champions League.
    // Falls einige davon NICHT in der aktuellen CL-Saison sind,
    // wird die Liste automatisch mit echten CL-Teams aufgefüllt (siehe ladeVereine).
    const vereinsIds = [57, 65, 66, 64, 81, 86, 5, 4, 108, 113, 109, 98, 1903, 503, 524, 516];
    //                  Arsenal ManCity ManUtd LFC Barca  RM Bayern BVB Inter Napoli Juve Milan Benfica Porto PSG Marseille

    // Index des aktuell angezeigten Vereins
    // let weil sich der Wert ändert (Cheatsheet 01)
    let aktuellerVereinsIndex = 0;

    // Hier werden die geladenen Vereine gespeichert
    let vereine = [];


    // --------------------------------------------------------
    // SCHRITT 2: DOM-ELEMENTE LADEN (Cheatsheet 05)
    // --------------------------------------------------------

    // Name-Eingabefeld
    const nameEingabe = document.querySelector('#player-name');

    // Vereinslogo-Bild
    const vereinsLogo = document.querySelector('#team-logo');

    // Vereinsname-Text
    const vereinsName = document.querySelector('#team-name');

    // Klickbarer Bereich in der Mitte
    const vereinsAnzeige = document.querySelector('.team-selector__display');

    // Der äussere Rahmen des Vereins-Selectors
    const vereinsSelector = document.querySelector('.team-selector');

    // Pfeil-Buttons
    const knopfZurueck = document.querySelector('#btn-prev');
    const knopfWeiter  = document.querySelector('#btn-next');

    // Start-Button
    const startKnopf = document.querySelector('#btn-start');


    // --------------------------------------------------------
    // SCHRITT 3: FUNKTIONEN (Cheatsheet 03)
    // --------------------------------------------------------

    /**
     * Zeigt den aktuellen Verein im Team-Selector an.
     * Liest vereine[aktuellerVereinsIndex] und setzt Logo + Name im DOM.
     */
    function zeigeAktuellenVerein() {
        // Sicherheits-Check: Wurden Vereine schon geladen?
        if (vereine.length === 0) {
            vereinsName.innerText = 'Laden...';
            return; // Funktion hier beenden
        }

        // Aktuellen Verein aus dem Array holen (Cheatsheet 09: Array-Index)
        const verein = vereine[aktuellerVereinsIndex];

        // Logo und Name setzen (Cheatsheet 05: DOM-Manipulation)
        vereinsLogo.src = verein.crest;
        vereinsName.innerText = verein.shortName || verein.name;
    }


    /**
     * Prüft ob der Start-Button aktiviert werden soll.
     * Bedingung: Name-Feld ist nicht leer UND Vereine sind geladen.
     */
    function aktualisiereStartKnopf() {
        // .value gibt den aktuellen Text im Input-Feld zurück
        // .trim() entfernt Leerzeichen am Anfang/Ende
        const nameEingegeben = nameEingabe.value.trim().length > 0;
        const vereineGeladen = vereine.length > 0;

        if (nameEingegeben && vereineGeladen) {
            // Button aktivieren: disabled-Klasse entfernen, active-Klasse hinzufügen
            startKnopf.classList.remove('btn-start--disabled');
            startKnopf.classList.add('btn-start--active');
            startKnopf.disabled = false;
        } else {
            // Button deaktivieren
            startKnopf.classList.add('btn-start--disabled');
            startKnopf.classList.remove('btn-start--active');
            startKnopf.disabled = true;
        }
    }


    /**
     * Speichert die Auswahl im localStorage.
     * Damit bleibt der Name und der Verein auch nach einem Seiten-Reload erhalten.
     */
    function speichereAuswahl() {
        localStorage.setItem('spielerName', nameEingabe.value.trim());

        // Das aktuelle Vereins-Objekt als JSON-String speichern
        // ⚠️ JSON.stringify wandelt das Objekt in Text (NICHT im Cheatsheet)
        if (vereine.length > 0) {
            localStorage.setItem('ausgewaehlterVerein', JSON.stringify(vereine[aktuellerVereinsIndex]));
        }
    }


    /**
     * Lädt die gespeicherte Auswahl aus dem localStorage (beim Seitenstart).
     */
    function ladeGespeicherteAuswahl() {
        const gespeicherterName = localStorage.getItem('spielerName');

        if (gespeicherterName) {
            nameEingabe.value = gespeicherterName;
        }
    }


    // --------------------------------------------------------
    // SCHRITT 4: API-DATEN LADEN (Cheatsheet 13 – API)
    // --------------------------------------------------------

    /**
     * Lädt die 16 Champions League Vereine von football-data.org
     */
    async function ladeVereine() {
        try {
            const antwort = await fetch(apiAdresse, {
                headers: {
                    'X-Auth-Token': apiSchluessel
                }
            });

            // Die Antwort in ein JavaScript-Objekt umwandeln
            const daten = await antwort.json();

            // Erst bevorzugte Vereine filtern
            const bevorzugte = daten.teams.filter(verein => vereinsIds.includes(verein.id));

            if (bevorzugte.length >= 16) {
                // Genug bevorzugte Vereine gefunden → ersten 16 nehmen
                vereine = bevorzugte.slice(0, 16);
            } else {
                // Zu wenige bevorzugte Vereine (manche sind diese Saison nicht in der CL)
                // → mit anderen echten CL-Teams auffüllen bis wir 16 haben
                const restliche = daten.teams.filter(verein => !vereinsIds.includes(verein.id));
                vereine = bevorzugte.concat(restliche).slice(0, 16);
            }

            console.log(`${vereine.length} Vereine geladen (${bevorzugte.length} bevorzugte + ${vereine.length - bevorzugte.length} aufgefüllt)`);

            // Alle 16 Vereine in localStorage speichern
            // turnierbaum.html braucht diese Liste um den Bracket aufzubauen
            // ⚠️ JSON.stringify wandelt das Array in Text (NICHT im Cheatsheet)
            localStorage.setItem('alleVereine', JSON.stringify(vereine));

            // Ersten Verein anzeigen
            zeigeAktuellenVerein();

            // Prüfen ob Button aktiviert werden kann
            aktualisiereStartKnopf();

        } catch (fehler) {
            console.error('Vereine konnten nicht geladen werden:', fehler);
            vereinsName.innerText = 'Fehler beim Laden';
        }
    }


    // --------------------------------------------------------
    // SCHRITT 5: EVENT-LISTENER (Cheatsheet 06 – Events)
    // --------------------------------------------------------

    /**
     * EVENT: Klick auf Pfeil LINKS (◀)
     * → Zeigt den vorherigen Verein
     */
    knopfZurueck.addEventListener('click', function() {
        // Wenn wir beim ersten Verein sind, springe zum letzten (Endlos-Schleife)
        if (aktuellerVereinsIndex === 0) {
            aktuellerVereinsIndex = vereine.length - 1; // Cheatsheet 09: .length
        } else {
            aktuellerVereinsIndex = aktuellerVereinsIndex - 1;
        }

        // Grüner Rahmen entfernen – neuer Verein ist noch nicht bestätigt
        vereinsSelector.classList.remove('team-selector--ausgewaehlt');

        zeigeAktuellenVerein(); // aktualisiere die Anzeige
        speichereAuswahl();     // speichere die neue Auswahl
    });


    /**
     * EVENT: Klick auf Pfeil RECHTS (▶)
     * → Zeigt den nächsten Verein
     */
    knopfWeiter.addEventListener('click', function() {
        // Wenn wir beim letzten Verein sind, springe zum ersten (Endlos-Schleife)
        if (aktuellerVereinsIndex === vereine.length - 1) {
            aktuellerVereinsIndex = 0;
        } else {
            aktuellerVereinsIndex = aktuellerVereinsIndex + 1;
        }

        // Grüner Rahmen entfernen
        vereinsSelector.classList.remove('team-selector--ausgewaehlt');

        zeigeAktuellenVerein();
        speichereAuswahl();
    });


    /**
     * EVENT: Klick auf den Verein in der Mitte
     * → Fügt grünen Rahmen hinzu als visuelle Bestätigung
     */
    vereinsAnzeige.addEventListener('click', function() {
        vereinsSelector.classList.add('team-selector--ausgewaehlt');
    });


    /**
     * EVENT: Eingabe im Name-Feld
     * → Aktiviert/deaktiviert den Start-Button je nach Eingabe
     * 'input' wird ausgelöst bei jeder Tasteneingabe
     */
    nameEingabe.addEventListener('input', function() {
        aktualisiereStartKnopf();
        speichereAuswahl();
    });


    /**
     * EVENT: Klick auf "Turnier starten →"
     * → Navigiert zur nächsten Seite (Turnierbaum)
     */
    startKnopf.addEventListener('click', function() {
        // Sicherheits-Check: Button darf nur reagieren wenn aktiv
        if (startKnopf.disabled) {
            return;
        }

        speichereAuswahl();
        window.location.href = 'turnierbaum.html';
    });


    // --------------------------------------------------------
    // SCHRITT 6: APP STARTEN (Cheatsheet 06)
    // --------------------------------------------------------

    window.addEventListener('load', async function() {
        console.log('Champions Quiz geladen!');

        ladeGespeicherteAuswahl();
        await ladeVereine();
    });

} // Ende: index.html Block


// ============================================================
// ════════════════════════════════════════════════════════════
//  TURNIERBAUM.HTML – Turnierbaum-Seite
//  Wird nur ausgeführt wenn #match-af1 im DOM vorhanden ist
// ════════════════════════════════════════════════════════════
// ============================================================

if (document.querySelector('#match-af1')) {

    // --------------------------------------------------------
    // SCHRITT 1: VARIABLEN (Cheatsheet 01)
    // --------------------------------------------------------

    // Alle 16 Vereine – werden aus localStorage geladen
    // (wurden in der index.html gespeichert: localStorage.setItem('alleVereine', ...))
    let alleVereine = [];

    // Der Verein den der Spieler auf der Startseite ausgewählt hat
    let spielerVerein = null;

    // Name des Spielers
    let spielerName = '';

    // Der Turnierbaum: 8 Achtelfinal-Spiele als Array von Objekten
    // Cheatsheet 09: Arrays | Cheatsheet 11: Objekte
    let spielplan = [];


    // --------------------------------------------------------
    // SCHRITT 2: DOM-ELEMENTE LADEN (Cheatsheet 05)
    // --------------------------------------------------------

    // Bottom Buttons
    const btnZurueck = document.querySelector('#btn-zurueck');
    const btnWeiter  = document.querySelector('#btn-weiter');


    // --------------------------------------------------------
    // SCHRITT 3: FUNKTIONEN (Cheatsheet 03)
    // --------------------------------------------------------

    /**
     * Lädt die gespeicherten Daten aus localStorage.
     * Cheatsheet 08: localStorage.getItem
     * ⚠️ JSON.parse: wandelt den gespeicherten Text zurück in ein Objekt
     */
    function ladeDatenAusStorage() {
        spielerName = localStorage.getItem('spielerName') || 'Spieler';

        // Den gespeicherten Verein laden
        // ⚠️ JSON.parse ist NICHT im Cheatsheet, aber nötig für Objekte aus localStorage
        const vereinJson = localStorage.getItem('ausgewaehlterVerein');
        if (vereinJson) {
            spielerVerein = JSON.parse(vereinJson);
        }

        // Alle 16 Vereine laden (in index.html gespeichert)
        const alleJson = localStorage.getItem('alleVereine');
        if (alleJson) {
            alleVereine = JSON.parse(alleJson);
        }

        // Prüfen ob Daten vorhanden sind (Cheatsheet 04: Bedingungen)
        if (!spielerVerein || alleVereine.length === 0) {
            console.log('Keine Daten gefunden – zurück zur Startseite');
            window.location.href = 'index.html';
        }
    }


    /**
     * Baut den Turnierbaum-Spielplan auf.
     * Platziert den Spieler in Spiel AF1 und verteilt die anderen
     * Vereine zufällig auf die restlichen 7 Spiele.
     *
     * ⚠️ NICHT im Cheatsheet:
     *    array.filter()  → entfernt den Spieler-Verein aus der Liste
     *    array.sort(fn)  → mischt das Array zufällig
     *    Math.random()   → Zufallszahl
     */
    function baueTurnierbaum() {
        // Die anderen 15 Vereine (ohne den Spieler-Verein)
        // ⚠️ .filter() ist NICHT im Cheatsheet
        let andereVereine = alleVereine.filter(function(verein) {
            return verein.id !== spielerVerein.id;
        });

        // Array mischen (zufällige Reihenfolge)
        // ⚠️ .sort() mit Math.random() ist NICHT im Cheatsheet
        andereVereine.sort(function() {
            return Math.random() - 0.5;
        });

        // 8 Spiele aufbauen (Cheatsheet 11: Objekte)
        // Spiel 1: Spieler (Heim) vs. zufälliger Gegner (Gast)
        // Spiele 2–8: je 2 zufällige Vereine
        spielplan = [
            { id: 'af1', heim: spielerVerein,     gast: andereVereine[0],  istSpielerSpiel: true  },
            { id: 'af2', heim: andereVereine[1],  gast: andereVereine[2],  istSpielerSpiel: false },
            { id: 'af3', heim: andereVereine[3],  gast: andereVereine[4],  istSpielerSpiel: false },
            { id: 'af4', heim: andereVereine[5],  gast: andereVereine[6],  istSpielerSpiel: false },
            { id: 'af5', heim: andereVereine[7],  gast: andereVereine[8],  istSpielerSpiel: false },
            { id: 'af6', heim: andereVereine[9],  gast: andereVereine[10], istSpielerSpiel: false },
            { id: 'af7', heim: andereVereine[11], gast: andereVereine[12], istSpielerSpiel: false },
            { id: 'af8', heim: andereVereine[13], gast: andereVereine[14], istSpielerSpiel: false },
        ];

        // Spielplan in localStorage speichern (für spätere Seiten wie vorschau.html)
        // ⚠️ JSON.stringify wandelt das Array in Text (NICHT im Cheatsheet)
        localStorage.setItem('spielplan', JSON.stringify(spielplan));
    }


    /**
     * Füllt eine einzelne Match-Karte mit den Team-Namen.
     * Cheatsheet 05: innerText
     * Cheatsheet 11: Objekt-Properties (spiel.heim.shortName)
     */
    function befuelleKarte(spielId, spiel) {
        const heimElement = document.querySelector(`#${spielId}-heim`);
        const gastElement = document.querySelector(`#${spielId}-gast`);

        if (heimElement && gastElement) {
            // shortName ist der Kurzname z.B. "Bayern" statt "Bayern München"
            // Null-Check: falls ein Verein undefined ist (Sicherheitsnetz)
            heimElement.innerText = spiel.heim ? (spiel.heim.shortName || spiel.heim.name) : '---';
            gastElement.innerText = spiel.gast ? (spiel.gast.shortName || spiel.gast.name) : '---';
        }
    }


    /**
     * Zeigt den Spielplan im Bracket an.
     * Geht durch alle 8 Spiele und befüllt die Karten.
     *
     * Cheatsheet 10: forEach – geht durch jedes Element im Array
     * Cheatsheet 05: classList.add – fügt eine CSS-Klasse hinzu
     */
    function zeigeTurnierbaum() {
        // forEach: für jedes Spiel im spielplan-Array wird diese Funktion ausgeführt
        spielplan.forEach(function(spiel) {
            befuelleKarte(spiel.id, spiel);

            // Ist das das Spiel des Spielers? → grüner Rahmen!
            if (spiel.istSpielerSpiel) {
                const karte = document.querySelector(`#match-${spiel.id}`);
                if (karte) {
                    karte.classList.add('match-card--aktiv');
                }
            }
        });
    }


    // --------------------------------------------------------
    // SCHRITT 4: EVENT-LISTENER (Cheatsheet 06)
    // --------------------------------------------------------

    /**
     * EVENT: Klick auf "← Zurück"
     * → Navigiert zurück zur Startseite
     */
    btnZurueck.addEventListener('click', function() {
        window.location.href = 'index.html';
    });


    /**
     * EVENT: Klick auf "Zum nächsten Spiel →"
     * → Navigiert zur Vorschau-Seite für das erste Spiel
     */
    btnWeiter.addEventListener('click', function() {
        // Das Spieler-Spiel in localStorage speichern
        // damit vorschau.html weiss, wer gegen wen spielt
        localStorage.setItem('aktuellesSpiel', JSON.stringify(spielplan[0]));
        localStorage.setItem('aktuelleRunde', 'Achtelfinale');

        window.location.href = 'vorschau.html';
    });


    // --------------------------------------------------------
    // SCHRITT 5: APP STARTEN (Cheatsheet 06)
    // --------------------------------------------------------

    window.addEventListener('load', function() {
        console.log('Turnierbaum geladen!');

        ladeDatenAusStorage();  // 1. Daten aus localStorage laden
        baueTurnierbaum();      // 2. Turnierbaum aufbauen
        zeigeTurnierbaum();     // 3. Turnierbaum anzeigen
    });

} // Ende: turnierbaum.html Block
