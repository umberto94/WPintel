async function check_path(url) {
    show_scanning('../images/gathering.svg', 'Ricerca Divulgazione Percorso...', '8');
    const rss_url = url + '/wp-includes/rss.php';
    
    try {
        const response = await fetch(rss_url);
        const content = await response.text();
        
        try {
            const pathMatch = content.match(/<b>\/(.+?)wp-includes\/rss\.php<\/b/);
            if (pathMatch) {
                const path = '/' + pathMatch[1];
                wpintel_debug('Percorso rilevato: ' + path);
                show_success(path);
                return true;
            } else {
                throw new Error('Pattern non trovato');
            }
        } catch (err) {
            wpintel_debug('Errore nel recupero percorso: ' + err);
            show_error('Percorso non rilevato!');
            return false;
        }
    } catch (fetchError) {
        show_error('Percorso non rilevato!');
        wpintel_debug('Errore fetch: ' + fetchError);
        return false;
    }
}

async function check_users(url) {
    show_scanning('../images/users.svg', 'Acquisizione Nomi Utente...', '7');
    const json_url = url + '/wp-json/wp/v2/users';
    window.wordpress_users = [];
    
    try {
        const json_response = await fetch(json_url);
        const content = await json_response.text();
        
        if (/slug/.test(content)) {
            const json_content = JSON.parse(content);
            
            for (let i = 0; i < json_content.length; i++) {
                try {
                    const user = json_content[i]['slug'];
                    wpintel_debug('Nome utente enumerato: ' + user);
                    const userInfo = user + '||' + json_content[i]['name'];
                    window.wordpress_users.push(userInfo);
                } catch (err) {
                    wpintel_debug('Errore nel recupero slug utente: ' + err);
                }
            }
            
            if (window.wordpress_users.length > 0) {
                show_users(window.wordpress_users);
                return true;
            } else {
                show_error('Nessun nome utente è stato enumerato!');
                return false;
            }
        } else {
            wpintel_debug('Nessun "slug" nel contenuto json');
            show_error('Nessun nome utente è stato enumerato!');
            return false;
        }
    } catch (error) {
        wpintel_debug('Errore nella richiesta utenti: ' + error);
        show_error('Nessun nome utente è stato enumerato!');
        return false;
    }
}

async function check_reg(url) {
    show_scanning('../images/reg.svg', 'Controllo Registrazione Utente...', '5');
    const reg_url = url + '/wp-login.php?action=register';
    wpintel_debug('URL registrazione: ' + reg_url);
    
    try {
        const reg_fetch = await fetch(reg_url);
        const source = await reg_fetch.text();
        wpintel_debug('Ottenuto sorgente registrazione');
        
        if (/<form/.test(source)) {
            if (/Registration confirmation will be emailed to you/.test(source) || 
                /value="Register"/.test(source) || 
                /id="user_email"/.test(source)) {
                
                const reg_ahref = '<a href="' + reg_url + '" class="reg_button">REGISTRATI QUI</a>';
                show_success('La registrazione utente è <b>abilitata</b> in questo sito.<br><br>' + reg_ahref);
                return true;
            } else {
                show_error('Registrazione utente disabilitata!');
                wpintel_debug('Nessun elemento di registrazione valido trovato');
                return false;
            }
        } else {
            show_error('Registrazione utente disabilitata!');
            return false;
        }
    } catch (error) {
        wpintel_debug('Errore controllo registrazione: ' + error);
        show_error('Registrazione utente disabilitata!');
        return false;
    }
}

async function check_theme(alllinks, parsed_source) {
    show_scanning('../images/themes.svg', 'Recupero Informazioni Tema...', '2');
    
    window.wordpress_themes = [];
    window.wordpress_plugins = [];
    window.theme_detected = false;
    window.plugins_detected = false;
    
    await checkLinks(alllinks);
    await showResult();

    async function checkLinks(alllinks) {
        for (let i = 0; i < alllinks.length; i++) {
            const href = alllinks[i];
            wpintel_debug('Test link: ' + href);
            
            if (/wp-content\/themes/.test(href)) {
                try {
                    const themeMatch = href.match(/wp-content\/themes\/(.+?)\//);
                    if (themeMatch) {
                        const theme = themeMatch[1];
                        
                        // Controlla se il tema è già stato rilevato
                        if (window.wordpress_themes.indexOf(theme) === -1) {
                            window.wordpress_themes.push(theme);
                            wpintel_debug('Tema rilevato: ' + theme);
                            window.theme_detected = true;
                        }
                    }
                } catch (err) {
                    wpintel_debug('Errore: ' + err + ' nel rilevamento tema dall\'url: ' + href);
                }
            } else if (/wp-content\/plugins/.test(href)) {
                try {
                    const pluginMatch = href.match(/wp-content\/plugins\/(.+?)\//);
                    if (pluginMatch) {
                        const plugin = pluginMatch[1];
                        
                        if (window.wordpress_plugins.indexOf(plugin) === -1) {
                            wpintel_debug('Plugin rilevato: ' + plugin);
                            window.wordpress_plugins.push(plugin);
                            window.plugins_detected = true;
                        }
                    }
                } catch (err) {
                    wpintel_debug('Errore: ' + err + ' nel rilevamento plugin dall\'url: ' + href);
                }
            }
        }
    }
    
    async function showResult() {
        if (window.theme_detected || window.plugins_detected) {
            show_themes_and_plugins(window.targeturl, window.wordpress_themes, window.wordpress_plugins);
        } else {
            show_error('WPintel non è riuscito a rilevare temi o plugin');
            return false;
        }
    }
}

function fetch_version_from_generator(parsed_source) {
    wpintel_debug('Controllo versione tramite meta tag generator');
    try {
        const generatorElement = parsed_source.querySelector("meta[name='generator']");
        if (generatorElement) {
            const generator_version = generatorElement.getAttribute("content");
            if (/WordPress/.test(generator_version)) {
                const versionMatch = generator_version.match(/WordPress (.*)/);
                if (versionMatch) {
                    return versionMatch[1];
                }
            }
        }
        wpintel_debug('Rilevamento versione tramite generator fallito');
        return undefined;
    } catch(err) {
        wpintel_debug('Errore generator: ' + err);
        return undefined;
    }
}

function fetch_version_from_emoji(source_string) {
    if (/wp-emoji-release\.min\.js\?ver/.test(source_string)) {
        const versionMatch = source_string.match(/wp-emoji-release\.min\.js\?ver=(.+?)"/);
        if (versionMatch) {
            return versionMatch[1];
        }
    }
    return undefined;
}

async function fetch_version_from_feed(url) {
    try {
        const feed_url = url + '/feed/';
        const response = await fetch(feed_url);
        const source = await response.text();
        
        const versionMatch = source.match(/<generator>https:\/\/wordpress\.org\/\?v=(.+?)<\/generator>/);
        if (versionMatch) {
            return versionMatch[1];
        }
    } catch(err) {
        wpintel_debug('Rilevamento versione tramite feed fallito: ' + err);
    }
    return undefined;
}

async function fetch_version_from_atom(url) {
    wpintel_debug('Funzione atom_version attivata: ' + url);
    try {
        const atom_url = url + '/feed/atom';
        const response = await fetch(atom_url);
        const source = await response.text();
        
        const versionMatch = source.match(/version="(.*?)">WordPress/);
        if (versionMatch) {
            return versionMatch[1];
        }
    } catch(err) {
        wpintel_debug('Errore rilevamento versione tramite atom feed: ' + err);
    }
    return undefined;
}

async function fetch_version_from_opml(url) {
    wpintel_debug('Funzione opml_version attivata: ' + url);
    try {
        const opml_url = url + '/wp-links-opml.php';
        const response = await fetch(opml_url);
        const source = await response.text();
        
        const versionMatch = source.match(/generator="WordPress\/(.+?)"/);
        if (versionMatch) {
            return versionMatch[1];
        }
    } catch(err) {
        wpintel_debug('Errore rilevamento versione da sorgente opml: ' + err);
    }
    return undefined;
}

async function check_version(source_string, parsed_source, url) {
    show_scanning('../images/version.svg', 'Recupero Versione WordPress...', '1');
    window.wordpress_version = '0';
    
    let version = fetch_version_from_generator(parsed_source);
    if (!version) {
        version = fetch_version_from_emoji(source_string);
    }
    if (!version) {
        version = await fetch_version_from_feed(url);
    }
    if (!version) {
        version = await fetch_version_from_atom(url);
    }
    if (!version) {
        version = await fetch_version_from_opml(url);
    }

    if (!version) {
        show_error('<b>Ops!!!</b><br>La versione di WordPress non è stata rilevata!');
        return;
    }

    window.wordpress_version = version;
    await check_vuln(window.wordpress_version);
    wpintel_debug('Versione: ' + wordpress_version + ' rilevata');
}

async function check_vuln(version) {
    show_scanning('../images/crawl_vuln.svg', 'Controllo Vulnerabilità Versione...', '4');
    
    // Usa un servizio alternativo per le vulnerabilità
    const vuln_url = `https://api.wordpress.org/core/version-check/1.7/`;
    wpintel_debug('URL vulnerabilità: ' + vuln_url);
    
    try {
        const response = await fetch(vuln_url);
        
        if (response.status === 200) {
            wpintel_debug('Ottenute informazioni versione con successo');
            const source = await response.text();
            show_version(version, source);
            return;
        }
    } catch (error) {
        wpintel_debug('Errore nel recupero informazioni vulnerabilità: ' + error);
    }
    
    show_version(version, false);
}