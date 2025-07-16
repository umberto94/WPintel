# WPintel v3.0 - Scanner Vulnerabilità WordPress

<p align='center'>
  <img src="https://i.imgur.com/pG4RQKE.png" alt="WPintel Logo"> <br>
</p>

<p align='center'>
	<a href="#caratteristiche">Caratteristiche</a> • <a href="#installazione">Installazione</a> • <a href="#come-usare">Utilizzo</a> • <a href="#licenza">Licenza</a> • <a href="#crediti">Crediti</a>
</p>

## Novità della Versione 3.0

✅ **Aggiornato a Manifest V3** - Compatibile con le ultime versioni di Chrome  
✅ **Interfaccia completamente in Italiano** - Traduzione completa dell'interfaccia  
✅ **Codice ottimizzato** - Migliorate prestazioni e stabilità  
✅ **Nuovi controlli di sicurezza** - Rilevamento vulnerabilità migliorato  

## Caratteristiche

- 🔍 **Rileva versione WordPress** - Identifica la versione installata
- 🛡️ **Controllo vulnerabilità** - Verifica vulnerabilità note della versione
- 👥 **Enumerazione utenti** - Enumera gli utenti del sistema
- 🎨 **Rilevamento temi** - Identifica i temi installati
- 🔌 **Rilevamento plugin** - Scopre i plugin attivi
- 📁 **Divulgazione percorsi** - Trova percorsi di sistema esposti
- 📝 **Stato registrazione** - Controlla se la registrazione è abilitata

## Installazione

### Installazione Manuale (Consigliata)

1. **Scarica il progetto**:
   ```bash
   git clone https://github.com/tuhinshubhra/WPintel.git
   cd WPintel
   ```

2. **Apri Chrome e vai a** `chrome://extensions/`

3. **Attiva la "Modalità sviluppatore"** (toggle in alto a destra)

4. **Clicca su "Carica estensione non pacchettizzata"**

5. **Seleziona la cartella** del progetto WPintel

6. **L'estensione sarà ora installata e pronta all'uso!**

### Installazione da Chrome Web Store

> **Nota**: La versione 3.0 non è ancora disponibile sul Chrome Web Store. Al momento è necessaria l'installazione manuale.

## Come Usare

### Comprensione dei Colori delle Icone

WPintel cambia il colore dell'icona per indicare lo stato:

- 🟢 **Verde**: WordPress rilevato - Puoi procedere con la scansione
- 🔴 **Rosso**: WordPress non rilevato o errore nel rilevamento
- ⚪ **Grigio**: Scansione in corso o sito non ancora analizzato

### Menu di Scansione

Una volta rilevato WordPress (icona verde), clicca sull'estensione per accedere al menu:

- **Versione e Vulnerabilità**: Rileva la versione e controlla vulnerabilità note
- **Informazioni Temi e Plugin**: Enumera temi e plugin installati
- **Enumera Nomi Utente**: Raccoglie i nomi utente del sistema
- **Controlla Registrazione Utente**: Verifica se la registrazione è abilitata
- **Controlla Divulgazione Percorso**: Cerca percorsi di sistema esposti

### Cambiare Target

Puoi cambiare il sito target direttamente dall'estensione:
1. Modifica l'URL nel campo di testo
2. Clicca su "Imposta Target"
3. Verrai reindirizzato al nuovo sito

## Sicurezza e Responsabilità

⚠️ **IMPORTANTE**: Questo strumento è destinato esclusivamente a:
- Test di sicurezza su sistemi di proprietà
- Audit di sicurezza autorizzati
- Ricerca educativa e formativa

**NON utilizzare questo strumento su siti web senza autorizzazione esplicita del proprietario.**

## Risoluzione Problemi

### Errore "WordPress non rilevato"
- Ricarica la pagina e riprova
- Controlla se il sito utilizza effettivamente WordPress
- Verifica la connessione internet

### Errore "Impossibile caricare l'estensione"
- Assicurati di aver attivato la "Modalità sviluppatore"
- Verifica che tutti i file siano presenti nella cartella
- Controlla la console per errori specifici

### Scansioni che non funzionano
- Alcuni siti potrebbero bloccare le richieste
- Controlla se sono attivi firewall o sistemi di protezione
- Riprova dopo qualche minuto

## Changelog v3.0

### Novità
- ✅ Aggiornamento completo a Manifest V3
- ✅ Interfaccia completamente tradotta in italiano
- ✅ Migliorate le prestazioni e la stabilità
- ✅ Nuovo sistema di comunicazione service worker
- ✅ Gestione errori migliorata

### Correzioni
- 🔧 Risolti problemi di compatibilità con Chrome moderno
- 🔧 Corretti errori di comunicazione tra componenti
- 🔧 Migliorata la gestione delle richieste HTTP
- 🔧 Ottimizzata l'interfaccia utente

## Tecnologie Utilizzate

- **Manifest V3** - Ultima versione dell'API Chrome Extensions
- **JavaScript ES6+** - Codice moderno e performante
- **Service Workers** - Gestione background ottimizzata
- **Fetch API** - Richieste HTTP moderne
- **CSS3** - Interfaccia responsive e moderna

## Crediti

### Autore Originale
- **Tuhinshubhra** - Sviluppatore originale di WPintel
- GitHub: [@Tuhinshubhra](https://github.com/Tuhinshubhra)
- Twitter: [@r3dhax0r](https://twitter.com/r3dhax0r)

### Adattamento v3
- **Umberto94** - Aggiornamento a Manifest V3 e traduzione italiana
- Contributi: Manifest V3, traduzione italiana, ottimizzazioni codice

## Licenza

WPintel è rilasciato sotto [GNU General Public License v3.0](https://github.com/Tuhinshubhra/WPintel/blob/master/LICENSE).

## Supporto

Per supporto, bug report o suggerimenti:
- Apri una [issue su GitHub](https://github.com/Tuhinshubhra/WPintel/issues)
- Contatta gli sviluppatori sui social media

---

<h4 align="center">Copyright (c) 2019-2024 Tuhinshubhra • Adattamento v3 (c) 2024 Umberto94</h4>