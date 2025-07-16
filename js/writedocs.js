function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

function show_error(msg) {
    const error_html = `
    <div id="error" class="error">
        <div class="error_head">
          <img src="../images/error.svg" class="error_img">
          <span id="error_header" class="error_header">ERRORE</span>
        </div>
        <div class="error_body" id="error_body">
          <span id="error_bodytxt" class="error_bodytxt">` + msg + `</span>
        </div>
    </div>
    `;
    wpintel_debug('Funzione show_error attivata');
    document.getElementById('container').innerHTML = error_html;
}

function show_success(msg) {
    const success_html = `
    <div id="success" class="success">
        <div class="success_head">
            <img src="../images/success_img.svg" class="success_img">
            <span id="success_header" class="success_header">SUCCESSO</span>
        </div>
        <div class="success_body" id="success_body">
            <span id="success_bodytxt" class="success_bodytxt">` + msg + `</span>
        </div>
    </div>
    `;
    wpintel_debug('Funzione show_success attivata');
    document.getElementById('container').innerHTML = success_html;
}

function show_scanning(simage, sname, sstage) {
    const prepared = '<div class="wp_check"><img class="wp_chk_stat" src="' + simage + '"><h1>' + sname + '</h1></div>';
    wpintel_debug('Scansione WP: ' + sname);
    document.getElementById('container').innerHTML = prepared;
}

function donate() {
    wpintel_debug('Attivata donazione');
    const dhtml = `
    <div class="donate_div">
        <h2>DONAZIONE!</h2>
        <h4>Creare strumenti utili come questo richiede tempo e impegno! Se questo strumento ti è stato utile e vuoi supportare lo sviluppo, ecco come puoi aiutarci:</h4>
        <p><strong>Versione originale:</strong> Tuhinshubhra<br>
        <strong>Adattamento v3:</strong> Umberto94</p>
        <p>Contattaci su GitHub per metodi di donazione alternativi!</p>
    </div>
    `;
    document.getElementById('container').innerHTML = dhtml;
}

function wordpress_not_found() {
    const cnt = `
    <div class="wpnf">
        <center>
            <img src="../images/wordpress_fail.svg" style="width: 156px; filter: drop-shadow(3px 4px 1px #ff3b00)">
        </center>
        <div class="inline_error">Impossibile rilevare un'installazione WordPress su questo sito web!</div>
    </div>
    `;
    document.getElementById('container').innerHTML = cnt;
}

function wordpress_found() {
    const content = `
    <div id="wordpress_found">
        <div style="text-align: center;">
            <div class="wordpress_found">
                <h1 class="wp_found_h1">WordPress Rilevato!</h1>
            </div>
            <button id="version_scan" class="reg_scan">Versione e Vulnerabilità</button>
            <button id="theme_scan" class="reg_scan">Informazioni Temi e Plugin</button>
            <button id="user_scan" class="reg_scan">Enumera Nomi Utente</button>
            <button id="reg_scan" class="reg_scan">Controlla Registrazione Utente</button>
            <button id="path_scan" class="reg_scan">Controlla Divulgazione Percorso</button>
        </div>
    </div>
    `;
    document.getElementById('ret_menu').style.display = 'block';
    document.getElementById('container').innerHTML = content;
    
    // Aggiungi event listener per i pulsanti
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', trackButtonClick);
    }
}

function show_themes_and_plugins(url, themes, plugins) {
    const theme_count = themes.length;
    const plugin_count = plugins.length;
    
    let contents = `
    <div class="tp_head">
        <div class="tp_theme">Temi: <span class="theme_count" id="theme_count">` + theme_count + `</span></div>
        <div class="tp_plugin">Plugin: <span class="plugin_count" id="plugin_count">` + plugin_count + `</span></div>
    </div>
    `;
    
    if (themes.length > 0) {
        let themes_table = `
        <table class="themes_table">
            <tr>
                <th>Tema</th>
                <th>Link</th>
            </tr>
        `;
        
        for (let i = 0; i < themes.length; i++) {
            const theme = sanitize(themes[i]);
            const theme_url = '<a href="' + url + '/wp-content/themes/' + theme + '">' + theme + "</a>";
            themes_table += `
            <tr>
                <td>` + theme + `</td>
                <td>` + theme_url + `</td>
            </tr>`;
        }
        themes_table += '</table>';
        contents += themes_table;
    } else {
        contents += '<div class="inline_error">Nessun tema rilevato</div>';
    }

    if (plugins.length > 0) {
        let plugins_table = `
        <table class="plugins_table">
            <tr>
                <th>Plugin</th>
                <th>Link</th>
            </tr>
        `;
        
        for (let i = 0; i < plugins.length; i++) {
            const plugin = sanitize(plugins[i]);
            const plugin_url = '<a href="' + url + '/wp-content/plugins/' + plugin + '">' + plugin + "</a>";
            plugins_table += `
            <tr>
                <td>` + plugin + `</td>
                <td>` + plugin_url + `</td>
            </tr>`;
        }
        plugins_table += '</table>';
        contents += plugins_table;
    } else {
        contents += '<div class="inline_error">Nessun plugin rilevato</div>';
    }

    document.getElementById('container').innerHTML = contents;
}

function show_users(userarray) {
    let contents = '<div class="users_detected">Nomi Utente Enumerati: ' + userarray.length + '</div>';
    contents += `
    <table class="plugins_table">
        <tr>
            <th>Nome Visualizzato</th>
            <th>Nome Utente</th>
        </tr>
    `;
    
    for (let i = 0; i < userarray.length; i++) {
        if (userarray[i] !== '||') {
            const parts = userarray[i].split('||');
            const slug = sanitize(parts[0] || '');
            const display = sanitize(parts[1] || '');
            
            contents += `
            <tr>
                <td>` + display + `</td>
                <td>` + slug + `</td>
            </tr>
            `;
        }
    }

    contents += '</table>';
    document.getElementById('container').innerHTML = contents;
}

async function show_version(version, vulns) {
    wpintel_debug('Versione: ' + version);
    
    let content = `
    <div class="wp_ver_info">
        <div class="cur_ver">Versione: ` + version + `</div>
    `;
    
    try {
        const lurl = 'https://api.wordpress.org/core/version-check/1.7/';
        const response = await fetch(lurl);
        const source = await response.text();
        const jsons = JSON.parse(source);
        const latest_version = jsons['offers'][0]['version'];
        
        if (version === latest_version) {
            content += '<div class="latest_ver ver_badge">✔ Ultima</div>';
        } else {
            content += '<div class="outdated_ver ver_badge">✖ Obsoleta</div>';
        }
        
        content += '<div class="latest_ver ver_badge">Info OK</div>';
        content += '</div>';
        content += '<div class="inline_error">Versione WordPress: ' + version + '<br>Ultima versione disponibile: ' + latest_version + '</div>';
        
        if (version !== latest_version) {
            content += '<div class="inline_error">Si consiglia di aggiornare WordPress all\'ultima versione per motivi di sicurezza!</div>';
        }
        
    } catch (error) {
        wpintel_debug('Errore nel recupero informazioni versione: ' + error);
        content += '<div class="outdated_ver ver_badge">! ERR</div>';
        content += '</div>';
        content += '<div class="inline_error">Errore nel recupero delle informazioni sulla versione!</div>';
    }
    
    document.getElementById('container').innerHTML = content;
}

function show_reload() {
    const content = `
    <div class="reload_div">
        <img src="../images/broken-heart.svg" class="broken-heart">
        <h1 style="margin-top: 0px;">Ops!</h1>
        <h4>Qualcosa è andato storto, ricarica la pagina per risolvere!</h4>
        <button class="reload_but" id="reload_but">
            <img src="../images/refresh.png" class="reload_img"> Ricarica
        </button>
    </div>
    `;
    document.getElementById('container').innerHTML = content;
}