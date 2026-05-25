
//  VARIABLEN 
// API-Key von football-data.org
const apiSchluessel = '25d1021df1ca4a8cafe6c9b9e3088f24';

// Browser blockieren fetch()-Anfragen an externe Server .
// Ein CORS-Proxy leitet die Anfrage weiter und fügt die fehlenden
// CORS-Header hinzu, sodass der Browser sie akzeptiert.
// musste getan werden, da die API blockiert wird. 

const corsProxy = 'https://corsproxy.io/?url=';
const apiAdresse = `${corsProxy}https://api.football-data.org/v4/competitions/CL/teams`;

// 16 Vereine die bleibt sind, da sie oft in der Champions League sind
const vereinsIds = [57, 65, 66, 64, 81, 86, 5, 4, 108, 113, 109, 98, 1903, 503, 524, 516];
//                  Arsenal ManCity ManUtd LFC Barca  RM Bayern BVB Inter Napoli Juve Milan Benfica Porto PSG Marseille

// Index des aktuell angezeigten Vereins 
// let weil sich der Wert ändert (Cheatsheet 01)
let aktuellerVereinsIndex = 0;

// Hier werden die geladenen Vereine gespeichert 
let vereine = [];



// SCHRITT 2: DOM-ELEMENTE LADEN 
// Greift auf die HTML-Elemente zu, damit JavaScript sie steuern kann"


// Lädt das erste Element mit der ID player-name also das Name Eingabefeld
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
const knopfWeiter = document.querySelector('#btn-next');

// Start-Button
const startKnopf = document.querySelector('#btn-start');

// SCHRITT 3: FUNKTIONEN (Cheatsheet 03 – Funktionen)

/**
 * Zeigt den aktuellen Verein im Team-Selector an.
 * Liest vereine[aktuellerVereinsIndex] und setzt Logo + Name im DOM.
 

function zeigeAktuellenVerein() {
    // Sicherheits-Check: Wurden Vereine schon geladen?
    if (vereine.length === 0) {
        // Noch keine Daten: Zeige Lade-Text
        vereinsName.innerText = 'Laden...';
        return; // Funktion hier beenden


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
 */
function speichereAuswahl() {
    localStorage.setItem('spielerName', nameEingabe.value.trim());

    // Das aktuelle Vereins-Objekt als JSON-String speichern
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

// SCHRITT 4: API-DATEN LADEN (Cheatsheet 13 – API)

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

        vereine = daten.teams.filter(verein => vereinsIds.includes(verein.id));

        console.log(`${vereine.length} Vereine geladen`); // sollte 16 sein

        // Ersten Verein anzeigen
        zeigeAktuellenVerein();

        // Prüfen ob Button aktiviert werden kann
        aktualisiereStartKnopf();

    } catch (fehler) {
        // Fehler-Behandlung 
        console.error('Vereine konnten nicht geladen werden:', fehler);

        // Fallback: Zeige eine Fehlermeldung im Vereins-Selector
        vereinsName.innerText = 'Fehler beim Laden';
    }
}

// SCHRITT 5: EVENT-LISTENER (Cheatsheet 06 – Events)
// Reagiere auf Interaktionen des Users

/**
 * EVENT: Klick auf Pfeil LINKS (◀)
 * → Zeigt den vorherigen Verein
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
 */
knopfWeiter.addEventListener('click', function() {
    // Wenn wir beim letzten Verein sind, springe zum ersten (Endlos-Schleife)
    if (aktuellerVereinsIndex === vereine.length - 1) {
        aktuellerVereinsIndex = 0; // zurück zum Anfang
    } else {
        aktuellerVereinsIndex = aktuellerVereinsIndex + 1; // einen weiter
    }

    // Grüner Rahmen entfernen, weil neuer Verein ist noch nicht bestätigt
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
    aktualisiereStartKnopf(); // prüfe ob Button aktiviert werden soll
    speichereAuswahl();       // Name zwischenspeichern
});


/**
 * EVENT: Klick auf "Turnier starten →"
 * → Navigiert zur nächsten Seite (Turnierbaum)
 */
startKnopf.addEventListener('click', function() {
    // Sicherheits-Check: Button darf nur reagieren wenn aktiv
    if (startKnopf.disabled) {
        return; // Funktion beenden wenn noch disabled
    }

    // Auswahl ein letztes Mal speichern
    speichereAuswahl();

    // Zur nächsten Seite navigieren
    window.location.href = 'turnierbaum.html';
});

// SCHRITT 6: APP STARTEN 

/*
 * Diese Funktion startet alles wenn die Seite geladen ist.
 * → load wird ausgelöst wenn die ganze Seite fertig geladen ist
 */
window.addEventListener('load', async function() {
    console.log('Champions Quiz geladen!');

    // Gespeicherten Namen wiederherstellen 
    ladeGespeicherteAuswahl();

    // Vereine von der API laden 
    await ladeVereine();
});
