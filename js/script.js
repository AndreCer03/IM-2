




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

        // Spielstand zurücksetzen: jedes Mal wenn die Setup-Seite geöffnet wird,
        // beginnt das Turnier von vorne. Fortschritt bleibt nur erhalten wenn
        // man direkt auf spiel.html oder turnierbaum.html neu lädt.
        // Cheatsheet 08: localStorage.removeItem
        localStorage.removeItem('spielplan');
        localStorage.removeItem('spielplanTeamId');
        localStorage.removeItem('aktuellesSpiel');
        localStorage.removeItem('aktuelleRunde');
        localStorage.removeItem('gegnerGespielt');
        localStorage.removeItem('letzteErgebnis');
        localStorage.removeItem('gegnerGeschlagen');
        localStorage.removeItem('simMatches');

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
        // Gegner-Liste zurücksetzen (wird nach jedem Sieg erweitert)
        localStorage.setItem('gegnerGespielt', JSON.stringify([]));
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
     * Zeigt den Bracket an – passt sich je nach aktueller Runde an.
     * Achtelfinale:  af1 aktiv (grüner Rahmen)
     * Viertelfinale: af1 gespielt (gedimmt), vf1 aktiv
     * Halbfinale:    af1+vf1 gespielt, hf1 aktiv
     * Finale:        af1+vf1+hf1 gespielt, finale aktiv
     *
     * Cheatsheet 04: if/else
     * Cheatsheet 05: classList, querySelector
     */
    function zeigeBracket() {
        const aktuelleRunde    = localStorage.getItem('aktuelleRunde') || 'Achtelfinale';

        // Simulierte Ergebnisse für fiktive Mätche laden oder erstellen
        let simMatches = {};
        const simMatchesJson = localStorage.getItem('simMatches');
        if (simMatchesJson) {
            simMatches = JSON.parse(simMatchesJson);
        }
        // Neu generieren wenn leer oder alte Version ohne Bracket-Gegner
        if (!simMatches.vf1Gegner && spielplan.length >= 8) {
            const simGew = {};
            for (let k = 2; k <= 8; k++) {
                const m = spielplan.find(function(s) { return s.id === 'af' + k; });
                if (m) simGew['af' + k] = Math.random() < 0.5 ? m.heim : m.gast;
            }
            const vf2Gew = Math.random() < 0.5 ? simGew.af3 : simGew.af4;
            const vf3Gew = Math.random() < 0.5 ? simGew.af5 : simGew.af6;
            const vf4Gew = Math.random() < 0.5 ? simGew.af7 : simGew.af8;
            const hf2Gew = Math.random() < 0.5 ? vf3Gew : vf4Gew;
            simMatches = {
                vf1Gegner:   simGew.af2,  // Spieler trifft Gewinner AF2 im VF
                hf1Gegner:   vf2Gew,      // Spieler trifft Gewinner VF2 im HF
                finalGegner: hf2Gew,      // Spieler trifft Gewinner HF2 im Finale
                vf2: { heim: simGew.af3, gast: simGew.af4 },
                vf3: { heim: simGew.af5, gast: simGew.af6 },
                vf4: { heim: simGew.af7, gast: simGew.af8 },
                hf2: { heim: vf3Gew,     gast: vf4Gew     },
            };
            localStorage.setItem('simMatches', JSON.stringify(simMatches));
        }
        const aktSpielJson     = localStorage.getItem('aktuellesSpiel');
        const aktSpiel         = aktSpielJson ? JSON.parse(aktSpielJson) : (spielplan[0] || null);

        // Runden-Reihenfolge zum Berechnen des Fortschritts
        const rundenReihenfolge = ['Achtelfinale', 'Viertelfinale', 'Halbfinale', 'Finale'];
        const aktuellerIndex    = rundenReihenfolge.indexOf(aktuelleRunde);

        // Match-Karten-IDs auf dem Spielerpfad (immer links: af1 → vf1 → hf1 → finale)
        const spielerKartenIds  = ['af1', 'vf1', 'hf1', 'finale'];

        // 1. Alle AF-Karten mit Spielplan-Daten befüllen (Cheatsheet 10: forEach)
        spielplan.forEach(function(spiel) {
            befuelleKarte(spiel.id, spiel);
        });

        // 1b. Fiktive VF/HF-Karten mit simulierten Gewinnern befüllen
        ['vf2', 'vf3', 'vf4', 'hf2'].forEach(function(matchId) {
            if (simMatches[matchId]) {
                befuelleKarte(matchId, simMatches[matchId]);
                const karteEl = document.querySelector('#match-' + matchId);
                if (karteEl) karteEl.classList.remove('match-card--platzhalter');
            }
        });

        // 1c. Spieler-Pfad: nur befüllen wenn diese Runde bereits erreicht wurde
        if (aktuellerIndex >= 1 && simMatches.vf1Gegner) {
            befuelleKarte('vf1', { heim: spielerTeam, gast: simMatches.vf1Gegner });
            const vf1El = document.querySelector('#match-vf1');
            if (vf1El) vf1El.classList.remove('match-card--platzhalter');
        }
        if (aktuellerIndex >= 2 && simMatches.hf1Gegner) {
            befuelleKarte('hf1', { heim: spielerTeam, gast: simMatches.hf1Gegner });
            const hf1El = document.querySelector('#match-hf1');
            if (hf1El) hf1El.classList.remove('match-card--platzhalter');
        }
        if (aktuellerIndex >= 3 && simMatches.finalGegner) {
            befuelleKarte('finale', { heim: spielerTeam, gast: simMatches.finalGegner });
            const finalEl = document.querySelector('#match-finale');
            if (finalEl) finalEl.classList.remove('match-card--platzhalter');
        }

        // 2. Aktuelle Runden-Karte mit echtem Gegner befüllen und hervorheben
        const aktiveKarteId = spielerKartenIds[aktuellerIndex];
        if (aktiveKarteId && aktSpiel) {
            befuelleKarte(aktiveKarteId, aktSpiel);
            const aktiveKarteEl = document.querySelector('#match-' + aktiveKarteId);
            if (aktiveKarteEl) {
                aktiveKarteEl.classList.remove('match-card--platzhalter');
                aktiveKarteEl.classList.add('match-card--aktiv');
            }
        }

        // 3. Vergangene Spieler-Runden als "gespielt" markieren (Cheatsheet 10: for)
        const geSchlagen = JSON.parse(localStorage.getItem('gegnerGeschlagen') || '[]');
        const rundenNamen = ['Achtelfinale', 'Viertelfinale', 'Halbfinale', 'Finale'];
        for (let i = 0; i < aktuellerIndex; i++) {
            const karteId = spielerKartenIds[i];
            if (i > 0) {
                const eintrag = geSchlagen.find(function(e) { return e.runde === rundenNamen[i]; });
                const geschlagenerGegner = eintrag ? eintrag.team : { shortName: '?', name: '?' };
                befuelleKarte(karteId, {
                    heim: spielerTeam,
                    gast: geschlagenerGegner,
                });
            }
            const karteEl = document.querySelector('#match-' + karteId);
            if (karteEl) {
                karteEl.classList.remove('match-card--platzhalter');
                karteEl.classList.add('match-card--gespielt');
            }
        }
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
    const dot4         = document.querySelector('#dot-4');

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
     *   Finale        → 4 Punkte aktiv
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
        } else if (aktuelleRunde === 'Halbfinale') {
            dot1.classList.add('vorschau__dot--aktiv');      // 3 Punkte gelb
            dot2.classList.add('vorschau__dot--aktiv');
            dot3.classList.add('vorschau__dot--aktiv');
        } else if (aktuelleRunde === 'Finale') {
            dot1.classList.add('vorschau__dot--aktiv');      // 4 Punkte gelb
            dot2.classList.add('vorschau__dot--aktiv');
            dot3.classList.add('vorschau__dot--aktiv');
            dot4.classList.add('vorschau__dot--aktiv');
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
    const sbSeiteHeim    = document.querySelector('.scoreboard__seite--heim');
    const sbSeiteGast    = document.querySelector('.scoreboard__seite--gast');

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

    // Champion Screen
    const championEl         = document.querySelector('#champion');
    const championLogo       = document.querySelector('#champion-logo');
    const championTextHaupt  = document.querySelector('#champion-text-haupt');
    const championTextSub    = document.querySelector('#champion-text-sub');
    const championStripScore = document.querySelector('#champion-strip-score');
    const championHeimLogo   = document.querySelector('#champion-heim-logo');
    const championGastLogo   = document.querySelector('#champion-gast-logo');
    const championBtn        = document.querySelector('#champion-btn');

    // ----------------------------------------------------------
    // FRAGEN-GENERIERUNG (Cheatsheet 09, 10, 11)
    // Fragen werden aus den API-Daten der Teams generiert
    // ----------------------------------------------------------

    // Hilfsfunktion: prüft ob ein Teamname einen Schlüsselbegriff enthält (accent-tolerant)
    function matchTeamName(teamName, vereinKey) {
        const clean = function(s) {
            return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        };
        return clean(teamName).includes(clean(vereinKey));
    }

    // Bekannte Spieler mit ihrem aktuellen Verein (Schlüsselwort für matchTeamName)
    const SPIELER_FRAGEN = [
        { spieler: 'Kylian Mbappé',       vereinKey: 'real madrid' },
        { spieler: 'Erling Haaland',       vereinKey: 'manchester city' },
        { spieler: 'Jude Bellingham',      vereinKey: 'real madrid' },
        { spieler: 'Mohamed Salah',        vereinKey: 'liverpool' },
        { spieler: 'Harry Kane',           vereinKey: 'münchen' },
        { spieler: 'Vinicius Jr.',         vereinKey: 'real madrid' },
        { spieler: 'Lamine Yamal',         vereinKey: 'barcelona' },
        { spieler: 'Pedri',                vereinKey: 'barcelona' },
        { spieler: 'Bukayo Saka',          vereinKey: 'arsenal' },
        { spieler: 'Martin Ødegaard',      vereinKey: 'arsenal' },
        { spieler: 'Phil Foden',           vereinKey: 'manchester city' },
        { spieler: 'Kevin De Bruyne',      vereinKey: 'napoli' },
        { spieler: 'Bruno Fernandes',      vereinKey: 'manchester united' },
        { spieler: 'Cole Palmer',          vereinKey: 'chelsea' },
        { spieler: 'Virgil van Dijk',      vereinKey: 'liverpool' },
        { spieler: 'Joshua Kimmich',       vereinKey: 'münchen' },
        { spieler: 'Jamal Musiala',        vereinKey: 'münchen' },
        { spieler: 'Declan Rice',          vereinKey: 'arsenal' },
        { spieler: 'Rodri',                vereinKey: 'manchester city' },
        { spieler: 'Dominik Szoboszlai',   vereinKey: 'liverpool' },
        { spieler: 'Florian Wirtz',        vereinKey: 'liverpool' },
        { spieler: 'Granit Xhaka',         vereinKey: 'sunderland' },
        { spieler: 'Raphinha',             vereinKey: 'barcelona' },
        { spieler: 'Robert Lewandowski',   vereinKey: 'barcelona' },
        { spieler: 'Antoine Griezmann',    vereinKey: 'atletico' },
        { spieler: 'Lautaro Martinez',     vereinKey: 'inter' },
        { spieler: 'Dusan Vlahovic',       vereinKey: 'juventus' },
        { spieler: 'Federico Valverde',    vereinKey: 'real madrid' },
        { spieler: 'Leroy Sane',           vereinKey: 'galatasaray' },
    ];

    // Bekannte Trainer mit ihrem aktuellen Verein
    const TRAINER_FRAGEN = [
        { trainer: 'Pep Guardiola',    vereinKey: 'manchester city' },
        { trainer: 'Mikel Arteta',     vereinKey: 'arsenal' },
        { trainer: 'Jose Mourinho',    vereinKey: 'real madrid' },
        { trainer: 'Arne Slot',        vereinKey: 'liverpool' },
        { trainer: 'Hansi Flick',      vereinKey: 'barcelona' },
        { trainer: 'Vincent Kompany',  vereinKey: 'münchen' },
        { trainer: 'Enzo Maresca',     vereinKey: 'chelsea' },
        { trainer: 'Diego Simeone',    vereinKey: 'atletico' },
        { trainer: 'Thiago Motta',     vereinKey: 'juventus' },
        { trainer: 'Simone Inzaghi',   vereinKey: 'inter' },
    ];

    /**
     * Gibt den Fragetyp je nach Runde zurück.
     * Achtelfinale → einfache Typen
     * Finale → alle Typen gemischt
     *
     * Cheatsheet 04: if/else
     */
    function getFrageTypen() {
        if (aktuelleRunde === 'Achtelfinale') {
            // Leicht: fast nur Wappen erkennen
            return ['wappen', 'wappen', 'wappen', 'land'];
        } else if (aktuelleRunde === 'Viertelfinale') {
            // Mittel: Wappen + Spieler- und Fakten-Fragen
            return ['wappen', 'spieler', 'land', 'stadion'];
        } else if (aktuelleRunde === 'Halbfinale') {
            // Schwer: Trainer, Spieler, Fakten – kaum reines Wappen
            return ['trainer', 'stadion', 'spieler', 'gruendungsjahr'];
        } else {
            // Finale: kein reines Wappen – Logo-Auswahl + Trainer + Spieler
            return ['logoWahl', 'trainer', 'gruendungsjahr', 'spieler'];
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

        let frage = {
            typ: typ,
            richtigesTeam: richtigesTeam,
            bild: '',
            frageText: '',
            richtigeAntwort: '',
            optionen: [],
            optionenCrests: null,  // nur für logoWahl: Wappen-URLs der Optionen
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
            frage.bild = richtigesTeam.crest;
            frage.frageText = `Aus welchem Land kommt ${richtigesTeam.shortName || richtigesTeam.name}?`;
            frage.richtigeAntwort = richtigesTeam.area.name;

            // Nur Teams mit ANDEREM Land wählen – verhindert doppelte Ländernamen als Optionen
            // (z.B. Bayern + Dortmund wären beide "Germany" → würde doppelt erscheinen)
            let laenderGesehen = new Set([richtigesTeam.area.name]);
            let falscheLandTeams = [];
            for (let t of andereTeams) {
                if (t.area && !laenderGesehen.has(t.area.name)) {
                    laenderGesehen.add(t.area.name);
                    falscheLandTeams.push(t);
                    if (falscheLandTeams.length === 3) break;
                }
            }

            if (falscheLandTeams.length < 3) {
                // Fallback: zu wenige verschiedene Länder → Wappen-Frage stellen
                frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                frage.richtigeAntwort = richtigesTeam.name;
                let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            } else {
                let alleOptionen = [
                    richtigesTeam.area.name,
                    falscheLandTeams[0].area.name,
                    falscheLandTeams[1].area.name,
                    falscheLandTeams[2].area.name,
                ];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            }

        } else if (typ === 'kuerzel') {
            // TheSportsDB-Teams haben kein TLA → sofort Wappen-Frage
            if (!richtigesTeam.tla) {
                frage.bild = richtigesTeam.crest;
                frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                frage.richtigeAntwort = richtigesTeam.name;
                let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            } else {
                frage.bild = richtigesTeam.crest;
                frage.frageText = `Was ist die offizielle Abkürzung von ${richtigesTeam.name}?`;
                frage.richtigeAntwort = richtigesTeam.tla;

                // Eindeutige TLAs sicherstellen – kein Kürzel darf doppelt vorkommen
                let tlaGesehen = new Set([richtigesTeam.tla]);
                let falscheTlaTeams = [];
                for (let t of andereTeams) {
                    if (t.tla && !tlaGesehen.has(t.tla)) {
                        tlaGesehen.add(t.tla);
                        falscheTlaTeams.push(t);
                        if (falscheTlaTeams.length === 3) break;
                    }
                }

                if (falscheTlaTeams.length < 3) {
                    // Fallback: Wappen-Frage
                    frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                    frage.richtigeAntwort = richtigesTeam.name;
                    let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                } else {
                    let alleOptionen = [
                        richtigesTeam.tla,
                        falscheTlaTeams[0].tla,
                        falscheTlaTeams[1].tla,
                        falscheTlaTeams[2].tla,
                    ];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                }
            }

        } else if (typ === 'stadion') {
            // STADION-FRAGE: Wappen zeigen – Stadion des Teams wählen
            const richtigesStadion = richtigesTeam.venue;

            if (!richtigesStadion) {
                // Fallback: Wappen-Frage wenn kein Stadion bekannt
                frage.typ = 'wappen';
                frage.bild = richtigesTeam.crest;
                frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                frage.richtigeAntwort = richtigesTeam.name;
                let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            } else {
                frage.bild = richtigesTeam.crest;
                frage.frageText = `In welchem Stadion spielt ${richtigesTeam.shortName || richtigesTeam.name}?`;
                frage.richtigeAntwort = richtigesStadion;

                // Andere Teams mit einem anderen Stadion als falsche Antworten
                let stadionGesehen = new Set([richtigesStadion]);
                let falscheStadionTeams = [];
                for (let t of andereTeams) {
                    if (t.venue && !stadionGesehen.has(t.venue)) {
                        stadionGesehen.add(t.venue);
                        falscheStadionTeams.push(t);
                        if (falscheStadionTeams.length === 3) break;
                    }
                }

                if (falscheStadionTeams.length < 3) {
                    frage.typ = 'wappen';
                    frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                    frage.richtigeAntwort = richtigesTeam.name;
                    let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                } else {
                    let alleOptionen = [
                        richtigesStadion,
                        falscheStadionTeams[0].venue,
                        falscheStadionTeams[1].venue,
                        falscheStadionTeams[2].venue,
                    ];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                }
            }

        } else if (typ === 'gruendungsjahr') {
            // GRÜNDUNGSJAHR-FRAGE: Wappen zeigen – Gründungsjahr wählen
            const richtigesJahr = richtigesTeam.founded;

            if (!richtigesJahr) {
                frage.typ = 'wappen';
                frage.bild = richtigesTeam.crest;
                frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                frage.richtigeAntwort = richtigesTeam.name;
                let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            } else {
                frage.bild = richtigesTeam.crest;
                frage.frageText = `In welchem Jahr wurde ${richtigesTeam.shortName || richtigesTeam.name} gegründet?`;
                frage.richtigeAntwort = String(richtigesJahr);

                // Andere Teams mit anderem Gründungsjahr als falsche Antworten
                let jahreGesehen = new Set([richtigesJahr]);
                let falscheJahrTeams = [];
                for (let t of andereTeams) {
                    if (t.founded && !jahreGesehen.has(t.founded)) {
                        jahreGesehen.add(t.founded);
                        falscheJahrTeams.push(t);
                        if (falscheJahrTeams.length === 3) break;
                    }
                }

                if (falscheJahrTeams.length < 3) {
                    frage.typ = 'wappen';
                    frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                    frage.richtigeAntwort = richtigesTeam.name;
                    let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                } else {
                    let alleOptionen = [
                        String(richtigesJahr),
                        String(falscheJahrTeams[0].founded),
                        String(falscheJahrTeams[1].founded),
                        String(falscheJahrTeams[2].founded),
                    ];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                }
            }

        } else if (typ === 'logoWahl') {
            // LOGO-WAHL-FRAGE (umgekehrt / Finale): Team-Name zeigen – richtiges Wappen wählen
            // Kein Wappen in der Fragekarte – der Spieler muss das Logo aus 4 Optionen erkennen
            frage.bild = '';
            frage.frageText = `Welches Wappen gehört zu ${richtigesTeam.shortName || richtigesTeam.name}?`;
            frage.richtigeAntwort = richtigesTeam.name;

            const optionenTeams = [richtigesTeam, falsche3[0], falsche3[1], falsche3[2]]
                .sort(function() { return Math.random() - 0.5; });

            frage.optionen = optionenTeams.map(function(t) { return t.name; });
            frage.optionenCrests = optionenTeams.map(function(t) { return t.crest; });

        } else if (typ === 'spieler') {
            // SPIELER-FRAGE: Spieler nennen – in welchem Verein spielt er?
            // Zufälligen Spieler wählen, dann dessen Team in alleTeams suchen
            let gemischteEintraege = [...SPIELER_FRAGEN].sort(function() { return Math.random() - 0.5; });
            let gewaehlterEintrag = null;
            let spielerTeam = null;
            for (let eintrag of gemischteEintraege) {
                const gefunden = alleTeams.find(function(t) {
                    return matchTeamName(t.name, eintrag.vereinKey);
                });
                if (gefunden) {
                    gewaehlterEintrag = eintrag;
                    spielerTeam = gefunden;
                    break;
                }
            }

            if (!gewaehlterEintrag || !spielerTeam) {
                // Fallback: Wappen-Frage wenn kein passender Verein geladen
                frage.bild = richtigesTeam.crest;
                frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                frage.richtigeAntwort = richtigesTeam.name;
                let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            } else {
                // Die Frage dreht sich um den Spieler, nicht um richtigesTeam
                frage.richtigesTeam = spielerTeam;
                frage.bild = '';
                frage.frageText = `In welchem Verein spielt ${gewaehlterEintrag.spieler}?`;
                frage.richtigeAntwort = spielerTeam.name;

                // 3 andere Teams als falsche Antworten (darf nicht der Spielerverein sein)
                let andereNamen = new Set([spielerTeam.name]);
                let falscheOptionen = [];
                let gemischteAndere = [...alleTeams].sort(function() { return Math.random() - 0.5; });
                for (let t of gemischteAndere) {
                    if (!andereNamen.has(t.name)) {
                        andereNamen.add(t.name);
                        falscheOptionen.push(t.name);
                        if (falscheOptionen.length === 3) break;
                    }
                }
                let alleOptionen = [spielerTeam.name, ...falscheOptionen];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            }

        } else if (typ === 'trainer') {
            // TRAINER-FRAGE: Wappen zeigen – wer ist der Cheftrainer?
            const trainerEintrag = TRAINER_FRAGEN.find(function(t) {
                return matchTeamName(richtigesTeam.name, t.vereinKey);
            });

            if (!trainerEintrag) {
                // Fallback: Wappen-Frage wenn kein Trainer-Eintrag vorhanden
                frage.bild = richtigesTeam.crest;
                frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                frage.richtigeAntwort = richtigesTeam.name;
                let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                alleOptionen.sort(function() { return Math.random() - 0.5; });
                frage.optionen = alleOptionen;
            } else {
                frage.bild = richtigesTeam.crest;
                frage.frageText = `Wer ist der Cheftrainer von ${richtigesTeam.shortName || richtigesTeam.name}?`;
                frage.richtigeAntwort = trainerEintrag.trainer;

                // 3 andere Trainer aus der Liste als falsche Antworten
                let andereTrainer = TRAINER_FRAGEN
                    .filter(function(t) { return t.trainer !== trainerEintrag.trainer; })
                    .sort(function() { return Math.random() - 0.5; })
                    .slice(0, 3)
                    .map(function(t) { return t.trainer; });

                if (andereTrainer.length < 3) {
                    // Fallback
                    frage.frageText = 'Welchem Verein gehört dieses Wappen?';
                    frage.richtigeAntwort = richtigesTeam.name;
                    let alleOptionen = [richtigesTeam.name, falsche3[0].name, falsche3[1].name, falsche3[2].name];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                } else {
                    let alleOptionen = [trainerEintrag.trainer, ...andereTrainer];
                    alleOptionen.sort(function() { return Math.random() - 0.5; });
                    frage.optionen = alleOptionen;
                }
            }
        }

        return frage; // Cheatsheet 03: return-Wert
    }

    /**
     * Generiert 10 Fragen für das Spiel.
     * Cheatsheet 10: for-Schleife
     * Cheatsheet 09: .push() – Element zum Array hinzufügen
     */
    function generiereFragen() {
        fragen = [];

        let typen = getFrageTypen();

        // Teams mischen: so kommt jedes Team nur einmal vor bevor es sich wiederholt
        // ⚠️ Spread-Operator + .sort() nicht im Cheatsheet
        let gemischteTeams = [...alleTeams].sort(function() { return Math.random() - 0.5; });

        // 20 Fragen generieren – mehr als genug für 5+5-Abbruch
        // Cheatsheet 10: for-Schleife
        for (let i = 0; i < 20; i++) {
            // Modulo: nach einem Durchlauf aller Teams wieder von vorne (Cheatsheet ⚠️ %)
            let team = gemischteTeams[i % gemischteTeams.length];
            let typ = typen[i % typen.length];
            fragen.push(erstelleFrage(team, typ));
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

        // Wappen anzeigen oder verstecken (logoWahl hat kein Wappen in der Fragekarte)
        if (frage.bild) {
            frageBild.setAttribute('src', frage.bild);
            frageBild.setAttribute('alt', 'Vereinswappen');
            frageBild.parentElement.style.display = '';
        } else {
            frageBild.parentElement.style.display = 'none';
        }

        // Frage-Text setzen (Cheatsheet 05: innerText)
        frageText.innerText = frage.frageText;

        // Antwort-Buttons befüllen (Cheatsheet 10: forEach)
        const buchstaben = ['A', 'B', 'C', 'D'];
        antwortBtns.forEach(function(btn, index) {
            // logoWahl: Wappen-Bild im Button zeigen statt Text
            if (frage.typ === 'logoWahl' && frage.optionenCrests) {
                antwortTexte[index].innerHTML = '';
                const img = document.createElement('img');
                img.src = frage.optionenCrests[index];
                img.alt = frage.optionen[index];
                img.className = 'antwort-btn__crest';
                antwortTexte[index].appendChild(img);
            } else {
                antwortTexte[index].innerText = frage.optionen[index];
            }

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
            // Geschlagenen Gegner für Turnierbaum-Anzeige speichern
            const geSchlagen = JSON.parse(localStorage.getItem('gegnerGeschlagen') || '[]');
            geSchlagen.push({ runde: aktuelleRunde, team: aktuellesSpiel.gast });
            localStorage.setItem('gegnerGeschlagen', JSON.stringify(geSchlagen));

            localStorage.setItem('aktuelleRunde', naechsteRunde);

            // Nächsten Gegner aus dem Bracket bestimmen (nicht zufällig)
            if (naechsteRunde !== 'Champion!') {
                const simData = JSON.parse(localStorage.getItem('simMatches') || '{}');
                let neuerGegner = null;
                if (naechsteRunde === 'Viertelfinale') neuerGegner = simData.vf1Gegner;
                else if (naechsteRunde === 'Halbfinale') neuerGegner = simData.hf1Gegner;
                else if (naechsteRunde === 'Finale')     neuerGegner = simData.finalGegner;

                if (neuerGegner) {
                    localStorage.setItem('aktuellesSpiel', JSON.stringify({
                        heim: aktuellesSpiel.heim,
                        gast: neuerGegner,
                        istSpielerSpiel: true,
                    }));
                }
            }
        }
        // Sieg/Niederlage speichern
        localStorage.setItem('letzteErgebnis', JSON.stringify({
            istSieg: istSieg,
            spielerTore: spielerTore,
            gegnerTore: gegnerTore,
            runde: aktuelleRunde,
        }));

        // Champion- oder Abpfiff-Screen anzeigen
        if (naechsteRunde === 'Champion!' && istSieg) {
            const gastName = aktuellesSpiel.gast.shortName || aktuellesSpiel.gast.name;
            championLogo.setAttribute('src', aktuellesSpiel.heim.crest);
            championTextHaupt.innerText  = `${vereinName} gewinnt den Champions Quiz!`;
            championTextSub.innerText    = `${spielerName} führt seine Mannschaft zum Titel. Eine unvergessliche Saison!`;
            championStripScore.innerText = `${vereinName}  ${spielerTore} : ${gegnerTore}  ${gastName}`;
            championHeimLogo.setAttribute('src', aktuellesSpiel.heim.crest);
            championGastLogo.setAttribute('src', aktuellesSpiel.gast.crest);
            championEl.classList.remove('overlay--versteckt');
        } else {
            abpfiffEl.classList.remove('overlay--versteckt');
        }
    }

    // ----------------------------------------------------------
    // SCOREBOARD BEFÜLLEN (Cheatsheet 05)
    // ----------------------------------------------------------

    // Hauptfarben der CL-Teams (ID → Hex)
    const TEAM_FARBEN = {
        57:   '#DB0007',  // Arsenal
        65:   '#6CABDD',  // Man City
        66:   '#DA291C',  // Man United
        64:   '#C8102E',  // Liverpool
        81:   '#004D98',  // Barcelona
        86:   '#FEBE10',  // Real Madrid
        5:    '#DC052D',  // Bayern
        4:    '#FDE100',  // Dortmund
        108:  '#CB3524',  // Atletico Madrid
        113:  '#034694',  // Chelsea
        109:  '#1C1C1C',  // Juventus
        98:   '#0070B5',  // Inter Milan
        1903: '#12A0D7',  // Napoli
        503:  '#E4001B',  // Benfica
        524:  '#D2122E',  // Ajax
        516:  '#EF1818',  // PSV
    };

    function getTeamFarbe(team) {
        return TEAM_FARBEN[team.id] || '#FFFFFF';
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

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

        // Teamfarben dynamisch anwenden
        const heimFarbe = getTeamFarbe(heim);
        const gastFarbe = getTeamFarbe(gast);
        if (sbSeiteHeim) sbSeiteHeim.style.background = `linear-gradient(to right, ${hexToRgba(heimFarbe, 0.45)}, transparent)`;
        if (sbSeiteGast) sbSeiteGast.style.background = `linear-gradient(to left,  ${hexToRgba(gastFarbe, 0.30)}, transparent)`;
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
    // ERWEITERTE TEAMDATENBANK – TheSportsDB (kein API-Key nötig)
    // Lädt ~80 zusätzliche europäische Teams damit Fragen schwerer werden.
    // TheSportsDB-Felder werden auf das football-data.org Format gemappt.
    // ----------------------------------------------------------

    const TSDB_LIGEN = [
        'English Premier League',
        'German Bundesliga',
        'Spanish La Liga',
        'Italian Serie A',
        'French Ligue 1',
        'Dutch Eredivisie',
        'Portuguese Primeira Liga',
    ];

    function normalisiereTheSportsDBTeam(team) {
        return {
            id: 'tsdb_' + team.idTeam,
            name: team.strTeam,
            shortName: team.strTeam,
            crest: team.strBadge,
            tla: null,
            area: { name: team.strCountry || '' },
            founded: team.intFormedYear ? Number(team.intFormedYear) : null,
            venue: team.strStadium || null,
        };
    }

    async function ladeZusatzteams() {
        let gesamtTeams = [];
        for (const liga of TSDB_LIGEN) {
            try {
                const url = `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(liga)}`;
                const resp = await fetch(url);
                const data = await resp.json();
                if (data.teams) {
                    gesamtTeams.push(...data.teams.filter(function(t) { return t.strBadge; }));
                }
            } catch (e) {
                console.error('TheSportsDB Ladefehler:', liga);
            }
        }

        // Duplikate nach idTeam entfernen
        const gesehen = new Set();
        return gesamtTeams
            .filter(function(t) {
                if (gesehen.has(t.idTeam)) return false;
                gesehen.add(t.idTeam);
                return true;
            })
            .map(normalisiereTheSportsDBTeam);
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

    // Champion-Button: Neues Turnier starten
    championBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
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

    window.addEventListener('load', async function() {
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

        // Scoreboard und Anzeigetafel schon befüllen während Teams laden
        zeigeScoreboard();
        zeigeScore();
        zeigeZeit();

        // Lade-Hinweis in der Fragekarte
        frageLabel.innerText = 'Teams werden geladen...';
        frageText.innerText  = 'Erweiterte Teamdatenbank wird geladen...';
        frageBild.removeAttribute('src');
        antwortBtns.forEach(function(btn) { btn.disabled = true; });

        // Zusätzliche Teams von TheSportsDB laden (Cheatsheet 13: async/await)
        const zusatzTeams = await ladeZusatzteams();

        // CL-Teams und europäische Teams zusammenführen – Duplikate nach Name entfernen
        const clNamen = new Set(alleTeams.map(function(t) { return t.name.toLowerCase(); }));
        const neueTeams = zusatzTeams.filter(function(t) { return !clNamen.has(t.name.toLowerCase()); });
        alleTeams = alleTeams.concat(neueTeams);

        console.log('Teampool: ' + alleTeams.length + ' Teams (' + JSON.parse(teamsJson).length + ' CL + ' + neueTeams.length + ' weitere)');

        // Fragen generieren und Spiel starten
        generiereFragen();
        zeigeFrage();
        starteTimer();
    });

} // Ende if (aufSpielSeite)
