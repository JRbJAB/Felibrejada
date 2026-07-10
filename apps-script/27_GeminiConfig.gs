/**
 * 27_GeminiConfig.gs
 * FÃƒÆ’Ã‚Â©librÃƒÆ’Ã‚Â©e / Felibrejada ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Gemini P0 dry-run configuration.
 * Version: felibree-gemini-p0-dryrun-20260709
 *
 * No secret must be stored in the Sheet or repository.
 * GEMINI_API_KEY must live only in Apps Script Project Properties.
 */

var FBR_GEMINI_P0_VERSION = 'felibree-gemini-p0-dryrun-20260709';

var FBR_GEMINI = {
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/interactions',
  DEFAULT_MODEL: 'gemini-3.5-flash',
  SHEETS: {
    STAGING: String.fromCodePoint(0x1F9EA) + ' IA Staging',
    SOURCES: String.fromCodePoint(0x1F4DA) + ' Sources & preuves',
    CHECKS: String.fromCodePoint(0x1F50E) + ' Contr' + String.fromCharCode(0x00F4) + 'les',
    LOGS: String.fromCodePoint(0x1F9FE) + ' Logs',
    EXPORTS: String.fromCodePoint(0x1F4E4) + ' Exports',
    GEMINI: String.fromCodePoint(0x1F916) + ' IA Recherche Gemini'
  },
  PROP: {
    API_KEY: 'GEMINI_API_KEY',
    MODEL: 'GEMINI_MODEL',
    ALLOW_STAGING_WRITE: 'GEMINI_ALLOW_STAGING_WRITE',
    ALLOW_SOURCE_APPLY: 'GEMINI_ALLOW_SOURCE_APPLY',
    DEFAULT_SEARCH_PROMPT: 'GEMINI_DEFAULT_SEARCH_PROMPT',
    DEEP_RESEARCH_DOC_ID: 'GEMINI_DEEP_RESEARCH_DOC_ID'
  },
  DEFAULT_SEARCH_PROMPT: [
    'Recherche approfondie et sourcÃƒÆ’Ã‚Â©e pour le pilotage communication de la FÃƒÆ’Ã‚Â©librÃƒÆ’Ã‚Â©e / Felibrejada ÃƒÆ’Ã‚Â  BrantÃƒÆ’Ã‚Â´me-en-PÃƒÆ’Ã‚Â©rigord.',
    'PrioritÃƒÆ’Ã‚Â© : confirmer les sources primaires ou presse fiables sur BrantÃƒÆ’Ã‚Â´me 2027, Sud Ouest, Lo Bornat dau Perigord, mairie, office de tourisme, rÃƒÆ’Ã‚Â©seaux officiels.',
    'Retourne uniquement des informations avec citations URL ou rÃƒÆ’Ã‚Â©fÃƒÆ’Ã‚Â©rences vÃƒÆ’Ã‚Â©rifiables.'
  ].join(' '),
  DEFAULT_URLS: [
    'https://brantomeenperigord.fr/fr/',
    'https://brantomeenperigord.fr/fr/ev/259274/agenda-231',
    'https://brantomeenperigord.fr/fr/as/260210/annuaire-des-associations-74',
    'https://brantomeenperigord.fr/fr/rb/179558/office-de-tourisme-9',
    'https://perigord-dronne-belle.fr/',
    'https://perigord-dronne-belle.fr/sortir/agenda/',
    'https://fr.wikipedia.org/wiki/F%C3%A9libr%C3%A9e_du_P%C3%A9rigord'
  ]
};

function FELIBREE_geminiStatus() {
  var cfg = FBR_geminiGetConfig_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var staging = FBR_geminiEnsureStagingSheet_(ss);
  var message = [
    'Gemini P0 status',
    'Model: ' + cfg.model,
    'API key present: ' + (cfg.apiKey ? 'YES' : 'NO'),
    'Staging write allowed: ' + cfg.allowStagingWrite,
    'Source APPLY allowed: ' + cfg.allowSourceApply,
    'Staging sheet: ' + staging.getName(),
    'Version: ' + FBR_GEMINI_P0_VERSION
  ].join('\n');

  FBR_geminiLog_('FELIBREE_geminiStatus', 'STATUS', 'OK', message, 'GEMINI_STATUS');
  return FBR_geminiResult_(true, 'Gemini status', message);
}

function FBR_geminiGetConfig_() {
  var props = PropertiesService.getScriptProperties();
  var apiKey = String(props.getProperty(FBR_GEMINI.PROP.API_KEY) || '').trim();
  var model = String(props.getProperty(FBR_GEMINI.PROP.MODEL) || FBR_GEMINI.DEFAULT_MODEL).trim();
  var allowStagingWrite = FBR_geminiBool_(props.getProperty(FBR_GEMINI.PROP.ALLOW_STAGING_WRITE), false);
  var allowSourceApply = FBR_geminiBool_(props.getProperty(FBR_GEMINI.PROP.ALLOW_SOURCE_APPLY), false);
  var defaultSearchPrompt = String(props.getProperty(FBR_GEMINI.PROP.DEFAULT_SEARCH_PROMPT) || FBR_GEMINI.DEFAULT_SEARCH_PROMPT).trim();
  var deepResearchDocId = String(props.getProperty(FBR_GEMINI.PROP.DEEP_RESEARCH_DOC_ID) || '').trim();

  return {
    apiKey: apiKey,
    model: model,
    allowStagingWrite: allowStagingWrite,
    allowSourceApply: allowSourceApply,
    defaultSearchPrompt: defaultSearchPrompt,
    deepResearchDocId: deepResearchDocId
  };
}

function FBR_geminiRequireApiKey_() {
  var cfg = FBR_geminiGetConfig_();
  if (!cfg.apiKey) {
    throw new Error('GEMINI_API_KEY manquant dans les propriÃƒÆ’Ã‚Â©tÃƒÆ’Ã‚Â©s script. Ne jamais coller la clÃƒÆ’Ã‚Â© dans le Sheet, GitHub ou le chat.');
  }
  return cfg;
}

function FBR_geminiBool_(value, defaultValue) {
  if (value === null || value === undefined || value === '') return defaultValue;
  var s = String(value).trim().toUpperCase();
  return s === 'TRUE' || s === 'YES' || s === '1' || s === 'OUI';
}

function FBR_geminiTraceId_() {
  return 'GEM-' + Utilities.getUuid().slice(0, 8);
}

function FBR_geminiNow_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Paris', 'yyyy-MM-dd HH:mm:ss');
}

function FBR_geminiGetSheet_(ss, name) {
  return ss.getSheetByName(name);
}

function FBR_geminiEnsureStagingSheet_(ss) {
  var name = FBR_GEMINI.SHEETS.STAGING;
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.setFrozenRows(4);
    sh.getRange(1, 1).setValue('ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Âª ðŸ§ª IA Staging ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rÃƒÆ’Ã‚Â©ponses Gemini en attente de validation');
    sh.getRange(2, 1).setValue('Aucune ligne de staging ne doit ÃƒÆ’Ã‚Âªtre injectÃƒÆ’Ã‚Â©e en mÃƒÆ’Ã‚Â©tier sans QA et validation humaine.');
    sh.getRange(3, 1, 1, 4).setValues([['DerniÃƒÆ’Ã‚Â¨re mise ÃƒÆ’Ã‚Â  jour', FBR_geminiNow_(), 'Statut', 'CrÃƒÆ’Ã‚Â©ÃƒÆ’Ã‚Â© par Gemini P0']]);
    sh.getRange(4, 1, 1, 17).setValues([FBR_geminiStagingHeaders_()]);
    sh.getRange(1, 1).setFontWeight('bold').setFontSize(13).setBackground('#17575f').setFontColor('#ffffff');
    sh.getRange(4, 1, 1, 17).setFontWeight('bold').setBackground('#d1e9e6').setWrap(true);
    sh.autoResizeColumns(1, 17);
  }
  return sh;
}

function FBR_geminiStagingHeaders_() {
  return [
    'Timestamp',
    'Trace ID',
    'Mode',
    'Tool',
    'Prompt',
    'Model',
    'Search Queries',
    'Output Text',
    'Citation Title',
    'Citation URL',
    'Cited Text',
    'Candidate Status',
    'Target Sheet',
    'Action',
    'Notes',
    'Raw Digest',
    'Version'
  ];
}

function FBR_geminiAppendStagingRows_(rows) {
  if (!rows || !rows.length) return 0;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = FBR_geminiEnsureStagingSheet_(ss);
  var startRow = Math.max(sh.getLastRow() + 1, 5);
  sh.getRange(startRow, 1, rows.length, FBR_geminiStagingHeaders_().length).setValues(rows);
  sh.autoResizeColumns(1, 17);
  return rows.length;
}

function FBR_geminiDigest_(obj) {
  var text = typeof obj === 'string' ? obj : JSON.stringify(obj);
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
  return bytes.map(function(b) {
    var v = (b + 256) % 256;
    return ('0' + v.toString(16)).slice(-2);
  }).join('').slice(0, 16);
}

function FBR_geminiLog_(functionName, mode, status, message, traceId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(FBR_GEMINI.SHEETS.LOGS);
  if (!logSheet) return;
  var row = [
    FBR_geminiNow_(),
    Session.getActiveUser().getEmail() || 'unknown',
    functionName,
    mode,
    status,
    FBR_GEMINI.SHEETS.STAGING,
    '',
    '',
    message,
    '',
    FBR_GEMINI_P0_VERSION,
    traceId || '',
    'Gemini P0 dry-run'
  ];
  logSheet.appendRow(row);
}

function FBR_geminiResult_(ok, title, message) {
  var payload = {
    ok: !!ok,
    title: title,
    message: message,
    version: FBR_GEMINI_P0_VERSION
  };
  Logger.log(title + "\n" + message);
  return payload;
}
