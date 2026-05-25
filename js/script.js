
// ============================================================
// SCHRITT 1: VARIABLEN (Cheatsheet 01 – Variablen)
// ============================================================

// API-Key von football-data.org
const apiSchluessel = '25d1021df1ca4a8cafe6c9b9e3088f24';

// ⚠️ NICHT im Cheatsheet: CORS-Proxy
// Browser blockieren fetch()-Anfragen an externe Server (CORS-Problem).
// Ein CORS-Proxy leitet die Anfrage weiter und fügt die fehlenden
// CORS-Header hinzu, sodass der Browser sie akzeptiert.
const corsProxy = 'https://corsproxy.io/?url=';
const apiAdresse = `${corsProxy}https://api.football-data.org/v4/competitions/CL/teams`;

// IDs der 16 gewünschten Vereine (football-data.org Team-IDs)
// Cheatsheet 09: Array mit fixen Werten
const vereinsIds = [57, 65, 66, 64, 81, 86, 5, 4, 108, 113, 109, 98, 1903, 503, 524, 516];
//                  Arsenal ManCity ManUtd LFC Barca  RM Bayern BVB Inter Napoli Juve Milan Benfica Porto PSG Marseille

// Index des aktuell angezeigten Vereins (startet bei 0 = erstes Team)
// let weil sich der Wert ändert (Cheatsheet 01)
let aktuellerVereinsIndex = 0;

// Hier werden die geladenen Vereine gespeichert (leeres Array am Anfang)
// Cheatsheet 09: Arrays sind Listen
let vereine = [];


// ============================================================
// SCHRITT 2: DOM-ELEMENTE LADEN (Cheatsheet 05 – DOM)
// "Greife auf HTML-Elemente zu, damit JavaScript sie steuern kann"
// ============================================================

// Lädt das erste Element mit der ID 'player-name' → das Eingabefeld
const nameEingabe = document.querySelector('#player-name');

// Vereinslogo-Bild
const vereinsLogo = document.querySelector('#team-logo');

// Vereinsname-Text
const vereinsName = document.querySelector('#team-name');

// Klickbarer Bereich in der Mitte (Logo + Name)
const vereinsAnzeige = document.querySelector('.team-selector__display');

// Der äussere Rahmen des Vereins-Selectors
const vereinsSelector = document.querySelector('.team-selector');

// Pfeil-Buttons
const knopfZurueck = document.querySelector('#btn-prev');
const knopfWeiter = document.querySelector('#btn-next');

// Start-Button
const startKnopf = document.querySelector('#btn-start');


// ============================================================
// SCHRITT 3: FUNKTIONEN (Cheatsheet 03 – Funktionen)
// ============================================================

/**
 * Zeigt den aktuellen Verein im Team-Selector an.
 * Liest vereine[aktuellerVereinsIndex] und setzt Logo + Name im DOM.
 *
 * Cheatsheet 05: setAttribute, innerText
 * Cheatsheet 11: Objekt-Properties lesen (verein.name, verein.crest)
 */
function zeigeAktuellenVerein() {
    // Sicherheits-Check: Wurden Vereine schon geladen?
    if (vereine.length === 0) {
        // Noch keine Daten: Zeige Lade-Text
        vereinsName.innerText = 'Laden...';
        return; // Funktion hier beenden
    }

    // Cheatsheet 11: Objekt-Properties auslesen
    // vereine ist ein Array; aktuellerVereinsIndex ist die Position
    const verein = vereine[aktuellerVereinsIndex]; // z.B. { name: "Bayern München", crest: "..." }

    // Cheatsheet 05: setAttribute – setzt das src-Attribut des Bildes
    vereinsLogo.setAttribute('src', verein.crest);
    vereinsLogo.setAttribute('alt', verein.name);

    // Cheatsheet 05: innerText – ändert den Text im HTML-Element
    vereinsName.innerText = verein.shortName || verein.name;
}


/**
 * Prüft ob der Start-Button aktiviert werden soll.
 * Bedingung: Name-Feld ist nicht leer UND Vereine sind geladen.
 *
 * Cheatsheet 04: Bedingungen (if/else)
 * Cheatsheet 05: classList.add / classList.remove
 */
function aktualisiereStartKnopf() {
    // .value gibt den aktuellen Text im Input-Feld zurück (Cheatsheet 05)
    // .trim() entfernt Leerzeichen am Anfang/Ende (⚠️ nicht im Cheatsheet, aber wichtig!)
    const nameEingegeben = nameEingabe.value.trim().length > 0;
    const vereineGeladen = vereine.length > 0;

    if (nameEingegeben && vereineGeladen) {
        // Button aktivieren: disabled-Klasse entfernen, active-Klasse hinzufügen
        // Cheatsheet 05: classList.remove / classList.add
        startKnopf.classList.remove('btn-start--disabled');
        startKnopf.classList.add('btn-start--active');
        startKnopf.disabled = false; // HTML disabled-Attribut entfernen
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
 *
 * Cheatsheet 08: localStorage.setItem
 */
function speichereAuswahl() {
    // Cheatsheet 08: localStorage.setItem('schlüssel', wert)
    localStorage.setItem('spielerName', nameEingabe.value.trim());

    // Das aktuelle Vereins-Objekt als JSON-String speichern
    // ⚠️ JSON.stringify ist NICHT im Cheatsheet – wandelt ein JS-Objekt in einen Text um
    // Das brauchen wir, weil localStorage nur Strings speichern kann
    if (vereine.length > 0) {
        localStorage.setItem('ausgewaehlterVerein', JSON.stringify(vereine[aktuellerVereinsIndex]));
    }
}


/**
 * Lädt die gespeicherte Auswahl aus dem localStorage (beim Seitenstart).
 *
 * Cheatsheet 08: localStorage.getItem
 */
function ladeGespeicherteAuswahl() {
    // Cheatsheet 08: localStorage.getItem('schlüssel')
    const gespeicherterName = localStorage.getItem('spielerName');

    if (gespeicherterName) {
        // Cheatsheet 05: .value – setzt den Text im Input-Feld
        nameEingabe.value = gespeicherterName;
    }
}


// ============================================================
// SCHRITT 4: API-DATEN LADEN (Cheatsheet 13 – API)
// ============================================================

/**
 * Lädt die 16 Champions League Vereine von football-data.org
 *
 * Cheatsheet 13: async function, await, fetch, try/catch
 *
 * ⚠️ NICHT im Cheatsheet:
 *    fetch(url, { headers: {...} }) – API-Key als HTTP-Header mitschicken.
 *    CORS-Proxy in der URL – damit der Browser die Anfrage erlaubt.
 */
async function ladeVereine() {
    try {
        const antwort = await fetch(apiAdresse, {
            headers: {
                'X-Auth-Token': apiSchluessel
            }
        });

        // Die Antwort in ein JavaScript-Objekt umwandeln (Cheatsheet 13)
        const daten = await antwort.json();

        // Cheatsheet 09: filter – nur die 16 gewünschten Vereine behalten
        vereine = daten.teams.filter(verein => vereinsIds.includes(verein.id));

        console.log(`${vereine.length} Vereine geladen`); // sollte 16 sein

        // Ersten Verein anzeigen
        zeigeAktuellenVerein();

        // Prüfen ob Button aktiviert werden kann
        aktualisiereStartKnopf();

    } catch (fehler) {
        // Fehler-Behandlung (Cheatsheet 13: catch)
        console.error('Vereine konnten nicht geladen werden:', fehler);

        // Fallback: Zeige eine Fehlermeldung im Vereins-Selector
        vereinsName.innerText = 'Fehler beim Laden';
    }
}


// ============================================================
// SCHRITT 5: EVENT-LISTENER (Cheatsheet 06 – Events)
// "Reagiere auf Interaktionen des Users"
// ============================================================

/**
 * EVENT: Klick auf Pfeil LINKS (◀)
 * → Zeigt den vorherigen Verein
 *
 * Cheatsheet 06: addEventListener('click', function)
 */
knopfZurueck.addEventListener('click', function() {
    // Wenn wir beim ersten Verein sind, springe zum letzten (Endlos-Schleife)
    if (aktuellerVereinsIndex === 0) {
        aktuellerVereinsIndex = vereine.length - 1; // Cheatsheet 09: .length
    } else {
        aktuellerVereinsIndex = aktuellerVereinsIndex - 1; // einen zurück
    }

    // Grüner Rahmen entfernen – neuer Verein ist noch nicht bestätigt
    vereinsSelector.classList.remove('team-selector--ausgewaehlt');

    zeigeAktuellenVerein(); // aktualisiere die Anzeige
    speichereAuswahl();     // speichere die neue Auswahl
});


/**
 * EVENT: Klick auf Pfeil RECHTS (▶)
 * → Zeigt den nächsten Verein
 *
 * Cheatsheet 06: addEventListener('click', function)
 */
knopfWeiter.addEventListener('click', function() {
    // Wenn wir beim letzten Verein sind, springe zum ersten (Endlos-Schleife)
    if (aktuellerVereinsIndex === vereine.length - 1) {
        aktuellerVereinsIndex = 0; // zurück zum Anfang
    } else {
        aktuellerVereinsIndex = aktuellerVereinsIndex + 1; // einen weiter
    }

    // Grüner Rahmen entfernen – neuer Verein ist noch nicht bestätigt
    vereinsSelector.classList.remove('team-selector--ausgewaehlt');

    zeigeAktuellenVerein();
    speichereAuswahl();
});


/**
 * EVENT: Klick auf den Verein in der Mitte
 * → Fügt grünen Rahmen hinzu als visuelle Bestätigung
 *
 * Cheatsheet 05: classList.add
 * Cheatsheet 06: addEventListener('click', function)
 */
vereinsAnzeige.addEventListener('click', function() {
    vereinsSelector.classList.add('team-selector--ausgewaehlt');
});


/**
 * EVENT: Eingabe im Name-Feld
 * → Aktiviert/deaktiviert den Start-Button je nach Eingabe
 *
 * Cheatsheet 06: addEventListener('input', function)
 * 'input' wird ausgelöst bei jeder Tasteneingabe
 */
nameEingabe.addEventListener('input', function() {
    aktualisiereStartKnopf(); // prüfe ob Button aktiviert werden soll
    speichereAuswahl();       // Name zwischenspeichern
});


/**
 * EVENT: Klick auf "Turnier starten →"
 * → Navigiert zur nächsten Seite (Turnierbaum)
 *
 * Cheatsheet 06: addEventListener('click', function)
 */
startKnopf.addEventListener('click', function() {
    // Sicherheits-Check: Button darf nur reagieren wenn aktiv
    if (startKnopf.disabled) {
        return; // Funktion beenden wenn noch disabled
    }

    // Auswahl ein letztes Mal speichern
    speichereAuswahl();

    // Zur nächsten Seite navigieren
    // ⚠️ NICHT im Cheatsheet: window.location.href – wechselt die URL
    // Das ist Standard-Browser-JavaScript für die Navigation
    window.location.href = 'turnierbaum.html';
});


// ============================================================
// SCHRITT 6: APP STARTEN (beim Laden der Seite)
// ============================================================

/*
 * Diese Funktion startet alles wenn die Seite geladen ist.
 * Cheatsheet 06: window.addEventListener('load', function)
 * → 'load' wird ausgelöst wenn die ganze Seite fertig geladen ist
 */
window.addEventListener('load', async function() {
    console.log('Champions Quiz geladen!');

    // Gespeicherten Namen wiederherstellen (falls vorhanden)
    ladeGespeicherteAuswahl();

    // Vereine von der API laden (async, warten auf Ergebnis)
    await ladeVereine();
});
