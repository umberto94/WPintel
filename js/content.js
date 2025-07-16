function DOMtoString(document_root) {
    let html = '';
    let node = document_root.firstChild;
    
    while (node) {
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                html += node.outerHTML;
                break;
            case Node.TEXT_NODE:
                html += node.nodeValue;
                break;
            case Node.CDATA_SECTION_NODE:
                html += '<![CDATA[' + node.nodeValue + ']]>';
                break;
            case Node.COMMENT_NODE:
                html += '<!--' + node.nodeValue + '-->';
                break;
            case Node.DOCUMENT_TYPE_NODE:
                html += "<!DOCTYPE " + node.name + 
                       (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + 
                       (!node.publicId && node.systemId ? ' SYSTEM' : '') + 
                       (node.systemId ? ' "' + node.systemId + '"' : '') + '>\\n';
                break;
        }
        node = node.nextSibling;
    }
    return html;
}

// Esegui il controllo WordPress quando la pagina è caricata
function checkWordPress() {
    const domain = window.location.hostname;
    wpintel_debug("Pagina caricata! dominio: " + domain);
    
    let wpdetected = false;
    
    // Controlla se WordPress è rilevato tramite src/href
    const srcNodeList = document.querySelectorAll('[src],[href]');
    
    for (let i = 0; i < srcNodeList.length; ++i) {
        const item = srcNodeList[i];
        const testel = item.getAttribute(item.getAttribute('src') ? 'src' : 'href');
        
        if (testel) {
            const re = new RegExp('(http://|https://|)(' + domain + '|/|)(.*?)wp-(content|include)');
            if (testel.match(re)) {
                wpdetected = true;
                break;
            }
        }
    }
    
    // Controlli aggiuntivi per WordPress
    if (!wpdetected) {
        // Controlla meta generator
        const generator = document.querySelector('meta[name="generator"]');
        if (generator && generator.content.includes('WordPress')) {
            wpdetected = true;
        }
        
        // Controlla body class
        const body = document.body;
        if (body && (body.className.includes('wp-') || body.className.includes('wordpress'))) {
            wpdetected = true;
        }
        
        // Controlla script WordPress
        const scripts = document.querySelectorAll('script');
        for (let script of scripts) {
            const src = script.src || script.innerHTML;
            if (src && (src.includes('wp-includes') || src.includes('wp-content'))) {
                wpdetected = true;
                break;
            }
        }
    }
    
    wpintel_debug(wpdetected ? 'WordPress Rilevato' : 'WordPress NON Rilevato');
    
    // Salva i dati globali
    window.iswp = wpdetected ? 'yes' : 'no';
    window.sourcecode = new XMLSerializer().serializeToString(document);
    window.targeturl = window.location.href;
    
    // Invia messaggio al background script
    chrome.runtime.sendMessage({
        action: wpdetected ? 'yes' : 'no',
        site_url: window.location.href,
        site_html: window.sourcecode
    }).catch(error => {
        wpintel_debug('Errore invio messaggio: ' + error);
    });
}

// Esegui il controllo quando la pagina è caricata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkWordPress);
} else {
    checkWordPress();
}

// Anche al caricamento completo della finestra
window.addEventListener('load', checkWordPress);

// Ascolta i messaggi dal popup
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.from === 'popup' && msg.subject === 'sendDetails') {
        wpintel_debug('Connessione da popup.js');
        
        const responsep = [
            window.iswp || 'no',
            window.targeturl || window.location.href,
            window.sourcecode || new XMLSerializer().serializeToString(document)
        ];
        
        sendResponse(responsep);
        return true;
    }
});