// Service Worker per Manifest V3
let curtabid = null;
let targeturl = null;
let iswp = null;
let sourcecode = null;
let http_headers = null;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        tabUpdated(tab);
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab) {
            tabUpdated(tab);
        }
    });
});

function tabUpdated(tab) {
    if (!tab) return;
    wpintel_debug('tabUpdated: ' + tab.id);
    curtabid = tab.id;
    
    // Mostra l'icona dell'action
    chrome.action.setTitle({
        tabId: tab.id,
        title: "Scansiona per WordPress"
    });
    
    // Listener per le richieste HTTP
    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            if (details.tabId === tab.id) {
                let hhs = details.responseHeaders;
                let headers_array = '';
                for (let index = 0; index < hhs.length; index++) {
                    let name = hhs[index]['name'];
                    let value = hhs[index]['value'];
                    let ta = name + "[wival]" + value + "[winew]";
                    headers_array += ta;
                }
                http_headers = headers_array;
                wpintel_debug('Headers catturati per tab: ' + tab.id);
            }
        },
        {urls: ['https://*/*', 'http://*/*'], types: ["main_frame"]},
        ['responseHeaders']
    );
}

function activateIcon(typ, thetab) {
    if (!thetab) return;
    wpintel_debug('Triggered activateIcon with type: ' + typ + ' tabid: ' + thetab);
    
    if (typ === '1') {
        // WordPress rilevato: icona verde
        chrome.action.setIcon({
            tabId: thetab,
            path: {
                "16": "images/active.png",
                "32": "images/active.png",
                "48": "images/active.png",
                "128": "images/active.png"
            }
        }).catch(error => {
            wpintel_debug('Errore impostazione icona active: ' + error);
            // Fallback: usa le icone logo
            chrome.action.setIcon({
                tabId: thetab,
                path: {
                    "16": "images/logo_16.png",
                    "32": "images/logo_32.png",
                    "48": "images/logo_48.png",
                    "128": "images/logo_128.png"
                }
            });
        });
        
        chrome.action.setTitle({
            tabId: thetab,
            title: "WordPress Rilevato! Puoi scansionare il sito."
        });
        return;
    }

    // WordPress NON rilevato: icona rossa
    chrome.action.setIcon({
        tabId: thetab,
        path: {
            "16": "images/error.png",
            "32": "images/error.png",
            "48": "images/error.png",
            "128": "images/error.png"
        }
    }).catch(error => {
        wpintel_debug('Errore impostazione icona error: ' + error);
        // Fallback: usa le icone logo
        chrome.action.setIcon({
            tabId: thetab,
            path: {
                "16": "images/logo_16.png",
                "32": "images/logo_32.png",
                "48": "images/logo_48.png",
                "128": "images/logo_128.png"
            }
        });
    });
    
    chrome.action.setTitle({
        tabId: thetab,
        title: "Il sito non sembra utilizzare WordPress!"
    });
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    wpintel_debug('Ricevuta risposta da content.js: ' + JSON.stringify(msg));
    
    // Preparazione delle variabili
    sourcecode = msg.site_html;
    targeturl = msg.site_url;
    iswp = msg.action;
    let senderid = sender.tab ? sender.tab.id : null;
    
    wpintel_debug('runtime onmsg sender: ' + senderid + ', action: ' + msg.action);
    
    switch (msg.action) {
        case 'yes':
            wpintel_debug('WordPress rilevato - aggiornamento icona');
            if (senderid) {
                activateIcon('1', senderid);
            }
            sendResponse({success: true});
            break;
        case 'no':
            wpintel_debug('WordPress non rilevato - controllo headers');
            // Controlla WordPress tramite headers
            if (http_headers && /wp-json/.test(http_headers)) {
                wpintel_debug('WordPress rilevato tramite headers');
                iswp = 'yes';
                if (senderid) {
                    activateIcon('1', senderid);
                }
            } else {
                wpintel_debug('WordPress non rilevato nemmeno tramite headers');
                if (senderid) {
                    activateIcon('0', senderid);
                }
            }
            sendResponse({success: true});
            break;
        case 'getDetails':
            wpintel_debug('Richiesta dettagli - invio dati');
            sendResponse({
                tabId: curtabid,
                targetUrl: targeturl,
                isWP: iswp,
                sourceCode: sourcecode,
                httpHeaders: http_headers
            });
            break;
        case 'reloadPage':
            wpintel_debug('Ricaricamento pagina');
            if (curtabid) {
                chrome.tabs.reload(curtabid);
            }
            sendResponse({success: true});
            break;
        case 'redirectTo':
            wpintel_debug('Redirect a: ' + msg.url);
            let rurl = msg.url;
            if (!/^https?:\/\//.test(rurl)) {
                rurl = 'http://' + rurl;
            }
            if (rurl !== "" && curtabid) {
                chrome.tabs.update(curtabid, {url: rurl});
            }
            sendResponse({success: true});
            break;
        default:
            wpintel_debug('Azione non riconosciuta: ' + msg.action);
            sendResponse({success: false});
            break;
    }
    return true; // Mantiene il canale di risposta aperto
});

// Funzione di debug
function wpintel_debug(msg) {
    const DEBUG = true;
    if (DEBUG) {
        console.log('%c[WPintel DEBUG]%c ' + msg, 'background: #222; color: #bada55', 'background: white; color: black');
    }
}