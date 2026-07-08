function FBR_ss_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Aucun tableur actif. Ce script doit être lié au Google Sheet Félibrée.');
  return ss;
}

function FBR_sheet_(name, required) {
  var sheet = FBR_ss_().getSheetByName(name);
  if (!sheet && required !== false) throw new Error('Onglet manquant : ' + name);
  return sheet;
}

function FBR_user_() {
  try {
    return Session.getActiveUser().getEmail() || 'unknown-user';
  } catch (err) {
    return 'unknown-user';
  }
}

function FBR_traceId_() {
  return Utilities.getUuid().slice(0, 8);
}

function FBR_safeText_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function FBR_norm_(value) {
  return FBR_safeText_(value).toLowerCase();
}

function FBR_isBlank_(value) {
  return FBR_safeText_(value) === '';
}

function FBR_isDate_(value) {
  return Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime());
}

function FBR_todayStart_() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function FBR_daysFromNow_(days) {
  var d = FBR_todayStart_();
  d.setDate(d.getDate() + days);
  return d;
}

function FBR_getScriptBool_(key, defaultValue) {
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  if (raw === null || raw === undefined || raw === '') return !!defaultValue;
  return String(raw).toUpperCase() === 'TRUE';
}

function FBR_getHeaders_(sheetName) {
  var sheet = FBR_sheet_(sheetName, true);
  var lastCol = Math.max(1, sheet.getLastColumn());
  var headers = sheet.getRange(FBR.HEADER_ROW, 1, 1, lastCol).getValues()[0];
  return headers.map(function (h) { return FBR_safeText_(h); });
}

function FBR_headerMap_(headers) {
  var map = {};
  headers.forEach(function (h, i) {
    if (h) map[h] = i;
  });
  return map;
}

function FBR_getRows_(sheetName, minCols) {
  var sheet = FBR_sheet_(sheetName, true);
  var lastRow = sheet.getLastRow();
  var lastCol = Math.max(sheet.getLastColumn(), minCols || 1);
  var headers = sheet.getRange(FBR.HEADER_ROW, 1, 1, lastCol).getValues()[0].map(function (h) { return FBR_safeText_(h); });
  var map = FBR_headerMap_(headers);
  if (lastRow < FBR.DATA_START_ROW) {
    return { sheet: sheet, headers: headers, map: map, rows: [], lastCol: lastCol };
  }
  var values = sheet.getRange(FBR.DATA_START_ROW, 1, lastRow - FBR.DATA_START_ROW + 1, lastCol).getValues();
  var rows = values.map(function (cells, i) {
    return {
      rowNumber: FBR.DATA_START_ROW + i,
      cells: cells,
      empty: cells.every(function (cell) { return FBR_isBlank_(cell); })
    };
  }).filter(function (row) { return !row.empty; });
  return { sheet: sheet, headers: headers, map: map, rows: rows, lastCol: lastCol };
}

function FBR_get_(row, map, header) {
  if (map[header] === undefined) return '';
  return row.cells[map[header]];
}

function FBR_set_(sheet, rowNumber, map, header, value) {
  if (map[header] === undefined) return false;
  sheet.getRange(rowNumber, map[header] + 1).setValue(value);
  return true;
}

function FBR_ensureHeader_(sheetName, headerName) {
  var sheet = FBR_sheet_(sheetName, true);
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(FBR.HEADER_ROW, 1, 1, lastCol).getValues()[0].map(function (h) { return FBR_safeText_(h); });
  var index = headers.indexOf(headerName);
  if (index >= 0) return index + 1;
  sheet.getRange(FBR.HEADER_ROW, lastCol + 1).setValue(headerName);
  sheet.getRange(FBR.HEADER_ROW, lastCol).copyTo(sheet.getRange(FBR.HEADER_ROW, lastCol + 1), { formatOnly: true });
  return lastCol + 1;
}

function FBR_clearBody_(sheetName, maxCols) {
  var sheet = FBR_sheet_(sheetName, true);
  var lastRow = Math.max(sheet.getLastRow(), FBR.DATA_START_ROW);
  var rows = Math.max(1, lastRow - FBR.DATA_START_ROW + 1);
  sheet.getRange(FBR.DATA_START_ROW, 1, rows, maxCols).clearContent();
}

function FBR_appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return 0;
  var sheet = FBR_sheet_(sheetName, true);
  var start = Math.max(sheet.getLastRow() + 1, FBR.DATA_START_ROW);
  sheet.getRange(start, 1, rows.length, rows[0].length).setValues(rows);
  return rows.length;
}

function FBR_writeBody_(sheetName, rows, width) {
  FBR_clearBody_(sheetName, width);
  if (!rows || rows.length === 0) return 0;
  var sheet = FBR_sheet_(sheetName, true);
  sheet.getRange(FBR.DATA_START_ROW, 1, rows.length, width).setValues(rows);
  return rows.length;
}

function FBR_log_(entry) {
  try {
    var now = new Date();
    var row = [
      now,
      FBR_user_(),
      entry.functionName || '',
      entry.mode || '',
      entry.status || '',
      entry.sheetName || '',
      entry.rowsRead || 0,
      entry.rowsChanged || 0,
      entry.message || '',
      entry.startMs ? Date.now() - entry.startMs : '',
      FELIBREE_SCRIPT_VERSION,
      entry.traceId || FBR_traceId_(),
      entry.notes || ''
    ];
    FBR_appendRows_(FBR.SHEETS.LOGS, [row]);
  } catch (err) {
    console.log('FBR_log_ failed: ' + err.message);
  }
}

function FBR_ensureCoreSheets_() {
  var ss = FBR_ss_();
  var existing = ss.getSheets().map(function (s) { return s.getName(); });
  FBR.REQUIRED_SHEETS.forEach(function (name) {
    if (existing.indexOf(name) < 0) ss.insertSheet(name);
  });
  FBR_ensureAdminSheetHeaders_(FBR.SHEETS.CHECKS, '🔎 Contrôles — qualité données et blocages scripts', FBR.ADMIN_HEADERS.CHECKS);
  FBR_ensurePlanningRulesSheet_();
  FBR_ensureAdminSheetHeaders_(FBR.SHEETS.LOGS, '🧾 Logs — journal d\'exécution Apps Script', FBR.ADMIN_HEADERS.LOGS);
  FBR_ensureCalendarConfigSheet_();
  FBR_ensureAdminSheetHeaders_(FBR.SHEETS.CALENDAR, '📆 Calendar Sync — publication vers Google Calendar', FBR.ADMIN_HEADERS.CALENDAR);
  FBR_ensureAdminSheetHeaders_(FBR.SHEETS.EXPORTS, '📤 Exports — packs, snapshots, livrables', FBR.ADMIN_HEADERS.EXPORTS);
  FBR_ensureAdminWebSheet_();
}


function FBR_ensureCalendarConfigSheet_() {
  var sheet = FBR_sheet_(FBR.SHEETS.CALENDAR_CONFIG, true);
  if (FBR_isBlank_(sheet.getRange(1, 1).getValue())) {
    sheet.getRange(1, 1).setValue('📆 Calendrier communication — configuration et partage');
  }
  if (FBR_isBlank_(sheet.getRange(2, 1).getValue())) {
    sheet.getRange(2, 1).setValue('Créer un calendrier dédié, stocker son ID, puis partager avec les collaborateurs listés. APPLY est bloqué par propriétés script.');
  }
  sheet.getRange(4, 1, 1, 3).setValues([['Paramètre', 'Valeur', 'Notes']]);
  var defaults = [
    ['Nom calendrier', FBR_getScriptProperty_(FBR.PROP.CALENDAR_NAME, FBR_CALENDAR_DEFAULTS.NAME), 'Nom visible dans Google Calendar.'],
    ['Calendar ID', FBR_getScriptProperty_(FBR.PROP.CALENDAR_ID, ''), 'Écrit par le script après création ou détection.'],
    ['Time zone', FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'Europe/Paris recommandé.'],
    ['Autoriser création APPLY', 'Propriété script ' + FBR.PROP.ALLOW_CALENDAR_CREATE + '=TRUE', 'Sinon création réelle bloquée.'],
    ['Autoriser partage APPLY', 'Propriété script ' + FBR.PROP.ALLOW_CALENDAR_SHARE + '=TRUE', 'Sinon partage réel bloqué.']
  ];
  var existing = sheet.getRange(5, 1, defaults.length, 3).getValues();
  for (var i = 0; i < defaults.length; i++) {
    if (FBR_isBlank_(existing[i][0])) sheet.getRange(5 + i, 1, 1, 3).setValues([defaults[i]]);
  }
  sheet.getRange(12, 1, 1, 6).setValues([['Email collaborateur', 'Rôle', 'Appliquer ?', 'Statut', 'Dernier sync', 'Notes']]);
  sheet.setFrozenRows(4);
}



function FBR_ensurePlanningRulesSheet_() {
  var sheet = FBR_sheet_(FBR.SHEETS.PLANNING_RULES, true);
  if (FBR_isBlank_(sheet.getRange(1, 1).getValue())) {
    sheet.getRange(1, 1).setValue('⏱️ Règles Planning — jours et horaires stricts par canal');
  }
  if (FBR_isBlank_(sheet.getRange(2, 1).getValue())) {
    sheet.getRange(2, 1).setValue('Source de vérité des créneaux recommandés pour transformer une date brute en date/heure planifiée.');
  }
  sheet.getRange(FBR.HEADER_ROW, 1, 1, FBR.ADMIN_HEADERS.PLANNING_RULES.length).setValues([FBR.ADMIN_HEADERS.PLANNING_RULES]);
  sheet.setFrozenRows(FBR.HEADER_ROW);
}

function FBR_parseDateTimeValue_(value) {
  if (FBR_isDate_(value)) return value;
  var s = FBR_safeText_(value);
  if (!s) return null;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0, 0);
}

function FBR_formatDateTime_(date) {
  if (!FBR_isDate_(date)) return '';
  return Utilities.formatDate(date, FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyy-MM-dd HH:mm');
}

function FBR_copyDateOnly_(date) {
  var d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

function FBR_addMinutes_(date, minutes) {
  var d = new Date(date.getTime());
  d.setMinutes(d.getMinutes() + Number(minutes || 30));
  return d;
}

function FBR_ensureAdminWebSheet_() {
  var sheet = FBR_sheet_(FBR.SHEETS.ADMIN_WEB, true);
  if (FBR_isBlank_(sheet.getRange(1, 1).getValue())) {
    sheet.getRange(1, 1).setValue('🖥️ Admin Web — version privée à créer / développer');
  }
  if (FBR_isBlank_(sheet.getRange(2, 1).getValue())) {
    sheet.getRange(2, 1).setValue('Page admin privée : cockpit, liens Sheet/Drive, iframe Google Calendar, logs et actions sécurisées.');
  }
  sheet.getRange(4, 1, 1, FBR.ADMIN_HEADERS.ADMIN_WEB.length).setValues([FBR.ADMIN_HEADERS.ADMIN_WEB]);
  var defaults = [
    ['URL admin web Apps Script', FBR_getScriptProperty_(FBR.PROP.ADMIN_WEB_URL, FBR_ADMIN_WEB_DEFAULTS.ADMIN_WEB_URL), 'À renseigner après déploiement Web App', 'Accès admin privé depuis menu/sidebar', 'P0', 'Déploiement restreint, jamais public.'],
    ['URL embed calendrier', 'Prêt', FBR_ADMIN_WEB_DEFAULTS.CALENDAR_EMBED_URL, 'Iframe calendrier communication', 'P0', 'Admin privé seulement.'],
    ['Iframe calendrier', 'Prêt', '<iframe src="https://calendar.google.com/calendar/embed?src=c_5ded6172d45bbaaa6389eda318fce1893fb8f5f5e32df1eaa0af4a2cfd90aac9%40group.calendar.google.com&ctz=Europe%2FParis" style="border:0" width="100%" height="720" frameborder="0" scrolling="no"></iframe>', 'À intégrer dans page admin', 'P0', 'Ne pas intégrer sur site public.'],
    ['Google Sheet cockpit', 'OK', FBR_ADMIN_WEB_DEFAULTS.SPREADSHEET_URL, 'Lien pilotage principal', 'P0', ''],
    ['Paramètres calendrier', 'OK', FBR_ADMIN_WEB_DEFAULTS.CALENDAR_SETTINGS_URL, 'Réglages calendrier', 'P0', 'Lien admin propriétaire.']
  ];
  var existing = sheet.getRange(5, 1, defaults.length, 6).getValues();
  for (var i = 0; i < defaults.length; i++) {
    if (FBR_isBlank_(existing[i][0])) sheet.getRange(5 + i, 1, 1, 6).setValues([defaults[i]]);
  }
  sheet.setFrozenRows(FBR.HEADER_ROW);
}

function FBR_getScriptProperty_(key, defaultValue) {
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  return (raw === null || raw === undefined || raw === '') ? defaultValue : raw;
}

function FBR_calendarConfigValue_(label, defaultValue) {
  var sheet = FBR_sheet_(FBR.SHEETS.CALENDAR_CONFIG, true);
  var values = sheet.getRange(5, 1, 20, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (FBR_safeText_(values[i][0]) === label) return FBR_safeText_(values[i][1]) || defaultValue;
  }
  return defaultValue;
}

function FBR_setCalendarConfigValue_(label, value) {
  var sheet = FBR_sheet_(FBR.SHEETS.CALENDAR_CONFIG, true);
  var values = sheet.getRange(5, 1, 20, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (FBR_safeText_(values[i][0]) === label) {
      sheet.getRange(5 + i, 2).setValue(value);
      return;
    }
  }
}

function FBR_isTruthy_(value) {
  var v = FBR_norm_(value);
  return ['true', 'oui', 'yes', '1', 'x', 'à appliquer', 'a appliquer'].indexOf(v) >= 0;
}

function FBR_ensureAdminSheetHeaders_(sheetName, title, headers) {
  var sheet = FBR_sheet_(sheetName, true);
  if (FBR_isBlank_(sheet.getRange(1, 1).getValue())) sheet.getRange(1, 1).setValue(title);
  sheet.getRange(FBR.HEADER_ROW, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(FBR.HEADER_ROW);
}

function FBR_result_(ok, title, details) {
  return {
    ok: ok,
    title: title,
    details: details || '',
    timestamp: new Date(),
    version: FELIBREE_SCRIPT_VERSION
  };
}
