function wait(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay);
    });
}

function setdetails(info) {
    wpintel_debug('Contenuto da content.js: ' + JSON.stringify(info));
    window.detailstate = true;
    try {
        let targetUrl = info[1] || window.location.href;
        
        if (targetUrl.endsWith('/')) {
            // rimuovi '/' dall'url
            window.targeturl = targetUrl.slice(0, -1);
        } else {
            window.targeturl = targetUrl;
        }
        
        window.sourcecode = info[2] || '';
        if (window.sourcecode) {
            window.parsedsrc = new DOMParser().parseFromString(window.sourcecode, 'text/html');
        }
        window.isWP = info[0] || 'no';
        
        if (window.sourcecode && window.targeturl) {
            detectHome(window.sourcecode, window.targeturl, window.parsedsrc);
        }
    } catch(err) {
        wpintel_debug('Errore con i dati da content.js: ' + err);
    }
}

function detectHome(source, url, parsed) {
    // Ottieni dominio e tutti i link
    let domain = url.split('//')[1].split('/')[0];
    let homeurl = '';
    let phrefs = [];
    
    let srcNodeList = parsed.querySelectorAll('[src],[href]');
    for (let i = 0; i < srcNodeList.length; ++i) {
        let item = srcNodeList[i];
        let testel = item.getAttribute('src') || item.getAttribute('href');
        if (testel) {
            phrefs.push(testel);
        } 
    }
    
    window.alllinks = phrefs;
    
    for (let i = 0; i < phrefs.length; i++) {
        let href_to_test = phrefs[i];
        if (!href_to_test) {
            wpintel_debug('Salto href nullo');
            continue;
        } 
        
        if (href_to_test.match(/wp-(content|include)/)) {
            try {
                // Regex corretta per rilevare WordPress
                let re = new RegExp('(https?://)?' + domain.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '(.*?)/wp-(content|include)');
                let match = href_to_test.match(re);
                if (match) {
                    homeurl = (match[1] || 'http://') + domain + (match[2] || '');
                    wpintel_debug('Home target da src: ' + homeurl);
                    break;
                }
            } catch(err) {
                wpintel_debug('Errore nel matching href: ' + href_to_test);
            }
        } else if (url.includes('?p=')) {
            // Controllo più semplice per permalink
            homeurl = url.split('?')[0];
            wpintel_debug('Home target da p: ' + homeurl);
            break;
        }
    }
    
    if (homeurl !== '' && homeurl.includes(domain)) {
        window.url = url;
        window.targeturl = homeurl;
        return true;
    }
    
    // Fallback: usa solo il dominio
    window.url = url;
    window.targeturl = url.split('//')[0] + '//' + domain;
    wpintel_debug('Home target fallback: ' + window.targeturl);
    return true;
}

async function getDetails() {
    try {
        // Comunicazione con background.js usando messaging API
        const response = await chrome.runtime.sendMessage({action: 'getDetails'});
        
        if (response) {
            window.tabID = response.tabId;
            window.isWP = response.isWP;
            window.http_headers = response.httpHeaders;
            
            // Se abbiamo sourceCode, processalo
            if (response.sourceCode) {
                window.sourcecode = response.sourceCode;
                window.targeturl = response.targetUrl;
                window.parsedsrc = new DOMParser().parseFromString(window.sourcecode, 'text/html');
                detectHome(window.sourcecode, window.targeturl, window.parsedsrc);
            }
            
            window.detailstate = true;
            wpintel_debug('Dati ricevuti da background: isWP=' + window.isWP);
        }
    } catch (error) {
        wpintel_debug('Errore nel recupero dettagli da background: ' + error);
    }
    
    // Comunicazione con content.js
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const response = await chrome.tabs.sendMessage(
            tab.id,
            {from: 'popup', subject: 'sendDetails'}
        );
        
        if (response) {
            window.isWP = response[0];
            window.targeturl = response[1];
            window.sourcecode = response[2];
            
            if (window.sourcecode) {
                window.parsedsrc = new DOMParser().parseFromString(window.sourcecode, 'text/html');
                detectHome(window.sourcecode, window.targeturl, window.parsedsrc);
            }
            
            window.detailstate = true;
            wpintel_debug('Dati ricevuti da content.js: isWP=' + window.isWP);
        }
    } catch (error) {
        wpintel_debug('Errore comunicazione content.js: ' + error);
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    // Ottieni tutte le informazioni
    getDetails();
    setTimeout(main, 1000); // Aumentato il timeout per dare più tempo

    // Inizia il programma principale
    function main() {
        wpintel_debug('Stato dettagli: ' + window.detailstate);
        wpintel_debug('isWP: ' + window.isWP);
        wpintel_debug('targeturl: ' + window.targeturl);
        
        // Imposta il valore placeholder del target
        if (window.targeturl) {
            document.getElementById('target').value = window.targeturl;
        } else {
            document.getElementById('target').value = "Ricarica o Inserisci Manualmente";
            show_reload();
            return;
        }
        
        // Controlla WordPress
        if (window.isWP === 'yes') {
            wpintel_debug('Installazione WordPress rilevata');
            wordpress_found();
        } else {
            wpintel_debug('Installazione WordPress non rilevata');
            wordpress_not_found();
        }

        // Event listeners per i pulsanti
        document.addEventListener('click', function(e) {
            if (!e.target) return;
            
            switch(e.target.id) {
                case 'path_scan':
                    wpintel_debug('Controllo divulgazione percorso');
                    check_path(window.targeturl);
                    break;
                case 'version_scan':
                    wpintel_debug('Cliccato su scansione versione');
                    check_version(window.sourcecode, window.parsedsrc, window.targeturl);
                    break;
                case 'theme_scan':
                    wpintel_debug('Controllo temi e plugin');
                    check_theme(window.alllinks, window.parsedsrc);
                    break;
                case 'reg_scan':
                    wpintel_debug('Controllo stato registrazione utente');
                    check_reg(window.targeturl);
                    break;
                case 'user_scan':
                    wpintel_debug('Enumerazione nomi utente');
                    check_users(window.targeturl);
                    break;
            }
        });
    }
});

// Event listeners globali
document.addEventListener('click', async function(e) {
    if (!e.target || !e.target.id) return;
    
    switch(e.target.id) {
        case 'change_target':
            wpintel_debug('Target cambiato');
            let rurl = document.getElementById('target').value;
            if (rurl !== "" && rurl !== "Ricarica o Inserisci Manualmente") {
                try {
                    await chrome.runtime.sendMessage({
                        action: 'redirectTo',
                        url: rurl
                    });
                    window.close();
                } catch (error) {
                    wpintel_debug('Errore redirect: ' + error);
                }
            }
            break;
        case 'ret_menu':
            wordpress_found();
            break;
        case 'donate_but':
            donate();
            break;
        case 'reload_but':
            wpintel_debug('Premuto pulsante ricarica');
            try {
                await chrome.runtime.sendMessage({action: 'reloadPage'});
                window.close();
            } catch (error) {
                wpintel_debug('Errore ricarica: ' + error);
            }
            break;
    }
});

// Gestione link esterni
$(document).ready(function() {
    $('body').on('click', 'a', function() {
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });
});

// Analytics (opzionale)
const version = chrome.runtime.getManifest().version;
function trackButtonClick(e) {
    wpintel_debug('Cliccato pulsante: ' + e.target.id);
    // Qui puoi aggiungere il tracking se necessario
}

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', trackButtonClick);
    }
});