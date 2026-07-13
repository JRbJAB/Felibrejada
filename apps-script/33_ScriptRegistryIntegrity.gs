/*
 * 33_ScriptRegistryIntegrity.gs
 * Registry integrity gate for Felibrejada Apps Script.
 * v0.7.3 — compares live Apps Script source vs latest Drive live backup ZIP.
 *
 * Writes only to the Script Registry sheet when APPLY is explicitly launched.
 * No public publication, no business-sheet injection, no secret export.
 */

var FBR_SCRIPT_REGISTRY_GATE = {
  VERSION: 'felibree-script-registry-integrity-gate-v0.7.3-20260710',
  HEADER_ROW: 4,
  FIRST_DATA_ROW: 5,
  FILE_COL: 1,
  STATUS_COL: 6,
  CRITICALITY_COL: 7,
  BASE_HEADER_COUNT: 17,
  BACKUP_PREFIX: 'felibree_apps_script_live_source_backup',
  HEADERS: [
    'Live present',
    'Live SHA256',
    'Backup SHA256',
    'Drift status',
    'Registry alert',
    'Last checked',
    'Latest backup',
    'Missing in live',
    'Missing in backup',
    'Diff summary'
  ],
  COLOR_OK: '#d9ead3',
  COLOR_WARN: '#fff2cc',
  COLOR_BAD: '#f4cccc',
  COLOR_NA: '#eeeeee'
};

function FBR_registrySheetName_() {
  return String.fromCodePoint(0x1F9E9) + ' Script Registry';
}

function FBR_registrySheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(FBR_registrySheetName_());
  if (!sh) throw new Error('Onglet introuvable : ' + FBR_registrySheetName_());
  return sh;
}

function FBR_registryIsComparableFile_(fileName) {
  fileName = String(fileName || '');
  return /\.(gs|html|json)$/i.test(fileName) && fileName.charAt(0) !== '_';
}

function FBR_registryAlertText_(level, label) {
  if (level === 'OK') return String.fromCodePoint(0x1F7E2) + ' ' + label;       // green circle
  if (level === 'WARN') return String.fromCodePoint(0x1F7E0) + ' ' + label;     // orange circle
  if (level === 'BAD') return String.fromCodePoint(0x1F534) + ' ' + label;      // red circle
  return String.fromCodePoint(0x26AA) + ' ' + label;                            // white circle
}

function FBR_registryAlertColor_(alertText) {
  alertText = String(alertText || '');
  if (alertText.indexOf(String.fromCodePoint(0x1F7E2)) === 0) return FBR_SCRIPT_REGISTRY_GATE.COLOR_OK;
  if (alertText.indexOf(String.fromCodePoint(0x1F7E0)) === 0) return FBR_SCRIPT_REGISTRY_GATE.COLOR_WARN;
  if (alertText.indexOf(String.fromCodePoint(0x1F534)) === 0) return FBR_SCRIPT_REGISTRY_GATE.COLOR_BAD;
  return FBR_SCRIPT_REGISTRY_GATE.COLOR_NA;
}

function FBR_registryNormalizeText_(value) {
  return String(value == null ? '' : value).trim();
}

function FBR_registryFindLatestBackupZip_() {
  var folderId = FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, FBR_SOURCE_BACKUP_DEFAULTS.FOLDER_ID);
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var latest = null;

  while (files.hasNext()) {
    var f = files.next();
    var name = f.getName();
    if (name.indexOf(FBR_SCRIPT_REGISTRY_GATE.BACKUP_PREFIX) !== 0) continue;
    if (!/\.zip$/i.test(name)) continue;
    if (!latest || f.getDateCreated().getTime() > latest.created.getTime()) {
      latest = {
        file: f,
        id: f.getId(),
        name: name,
        url: f.getUrl(),
        created: f.getDateCreated(),
        updated: f.getLastUpdated()
      };
    }
  }

  if (!latest) throw new Error('Aucun backup ZIP live source trouvé dans le dossier : ' + folderId);
  return latest;
}

function FBR_registryLiveSourceMap_() {
  var content = FBR_getAppsScriptProjectContent_();
  var files = content.files || [];
  var map = {};
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var ext = FBR_sourceFileExtension_(f.type, f.name);
    var fileName = f.name + ext;
    var source = f.source || '';
    map[fileName] = {
      fileName: fileName,
      type: f.type,
      bytes: source.length,
      sha256: FBR_sha256Hex_(source)
    };
  }
  return map;
}

function FBR_registryBackupSourceMap_(backup) {
  var blobs = Utilities.unzip(backup.file.getBlob());
  var map = {};
  for (var i = 0; i < blobs.length; i++) {
    var b = blobs[i];
    var name = b.getName();
    if (!FBR_registryIsComparableFile_(name)) continue;
    var source = b.getDataAsString('UTF-8') || '';
    map[name] = {
      fileName: name,
      bytes: source.length,
      sha256: FBR_sha256Hex_(source)
    };
  }
  return map;
}

function FBR_registryHeaderMap_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), FBR_SCRIPT_REGISTRY_GATE.BASE_HEADER_COUNT);
  var headers = sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW, 1, 1, lastCol).getDisplayValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var h = FBR_registryNormalizeText_(headers[i]);
    if (h) map[h] = i + 1;
  }
  return map;
}

function FBR_registryEnsureColumns_(sheet) {
  var map = FBR_registryHeaderMap_(sheet);
  for (var i = 0; i < FBR_SCRIPT_REGISTRY_GATE.HEADERS.length; i++) {
    var h = FBR_SCRIPT_REGISTRY_GATE.HEADERS[i];
    if (!map[h]) {
      var col = sheet.getLastColumn() + 1;
      sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW, col).setValue(h);
      try {
        sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW, Math.max(1, col - 1)).copyTo(sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW, col), { formatOnly: true });
      } catch (err) {
        // Formatting copy is optional.
      }
      map[h] = col;
    }
  }
  return FBR_registryHeaderMap_(sheet);
}

function FBR_registryExpectedLive_(status, fileName, liveMap) {
  status = FBR_registryNormalizeText_(status).toLowerCase();
  if (status.indexOf('actif') >= 0) return true;
  if (liveMap[fileName]) return true;
  return false;
}

function FBR_registryRowStatus_(fileName, rowStatus, criticality, liveMap, backupMap) {
  var comparable = FBR_registryIsComparableFile_(fileName);
  var live = liveMap[fileName] || null;
  var backup = backupMap[fileName] || null;
  var expectedLive = comparable && FBR_registryExpectedLive_(rowStatus, fileName, liveMap);
  var isP0 = String(criticality || '').toUpperCase().indexOf('P0') >= 0;
  var alertLevel = 'NA';
  var alert = FBR_registryAlertText_('NA', 'N/A');
  var drift = 'NOT_COMPARABLE';
  var summary = 'Ligne registry non comparable fichier exact.';
  var missingLive = 'N/A';
  var missingBackup = 'N/A';

  if (!comparable) {
    return {
      fileName: fileName,
      comparable: false,
      livePresent: '',
      liveSha: '',
      backupSha: '',
      drift: drift,
      alert: alert,
      alertLevel: alertLevel,
      missingLive: missingLive,
      missingBackup: missingBackup,
      summary: summary
    };
  }

  missingLive = live ? 'NO' : 'YES';
  missingBackup = backup ? 'NO' : 'YES';

  if (!expectedLive && !live) {
    alertLevel = 'NA';
    alert = FBR_registryAlertText_('NA', 'NON LIVE');
    drift = 'NOT_INSTALLED_EXPECTED';
    summary = 'Script non-live selon registry; absence live normale.';
  } else if (expectedLive && !live) {
    alertLevel = 'BAD';
    alert = FBR_registryAlertText_('BAD', 'LIVE MANQUANT');
    drift = 'LIVE_MISSING';
    summary = 'Script attendu actif mais absent du live Apps Script.';
  } else if (live && !backup) {
    alertLevel = isP0 ? 'BAD' : 'WARN';
    alert = FBR_registryAlertText_(alertLevel, isP0 ? 'BACKUP MANQUANT P0' : 'BACKUP MANQUANT');
    drift = 'BACKUP_MISSING';
    summary = 'Script live absent du dernier backup de référence.';
  } else if (live.sha256 === backup.sha256) {
    alertLevel = 'OK';
    alert = FBR_registryAlertText_('OK', 'OK');
    drift = 'OK_SAME_HASH';
    summary = 'Live Apps Script identique au dernier backup.';
  } else {
    alertLevel = isP0 ? 'BAD' : 'WARN';
    alert = FBR_registryAlertText_(alertLevel, isP0 ? 'DRIFT P0' : 'DRIFT');
    drift = 'HASH_MISMATCH';
    summary = 'Hash live différent du dernier backup.';
  }

  return {
    fileName: fileName,
    comparable: true,
    livePresent: live ? 'YES' : 'NO',
    liveSha: live ? live.sha256 : '',
    backupSha: backup ? backup.sha256 : '',
    drift: drift,
    alert: alert,
    alertLevel: alertLevel,
    missingLive: missingLive,
    missingBackup: missingBackup,
    summary: summary
  };
}

function FBR_registryWriteResultToRow_(sheet, rowNumber, colMap, result, backup, checkedAt) {
  sheet.getRange(rowNumber, colMap['Live present']).setValue(result.livePresent);
  sheet.getRange(rowNumber, colMap['Live SHA256']).setValue(result.liveSha);
  sheet.getRange(rowNumber, colMap['Backup SHA256']).setValue(result.backupSha);
  sheet.getRange(rowNumber, colMap['Drift status']).setValue(result.drift);
  sheet.getRange(rowNumber, colMap['Registry alert']).setValue(result.alert).setBackground(FBR_registryAlertColor_(result.alert));
  sheet.getRange(rowNumber, colMap['Last checked']).setValue(checkedAt);
  sheet.getRange(rowNumber, colMap['Latest backup']).setValue(backup.name + ' / ' + backup.id);
  sheet.getRange(rowNumber, colMap['Missing in live']).setValue(result.missingLive);
  sheet.getRange(rowNumber, colMap['Missing in backup']).setValue(result.missingBackup);
  sheet.getRange(rowNumber, colMap['Diff summary']).setValue(result.summary);
}

function FBR_registryAppendMissingLiveRows_(sheet, colMap, liveMap, backupMap, registered, backup, checkedAt, traceId) {
  var names = Object.keys(liveMap).sort();
  var appended = 0;
  var lastCol = sheet.getLastColumn();

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    if (!FBR_registryIsComparableFile_(name)) continue;
    if (registered[name]) continue;

    var row = [];
    for (var c = 0; c < lastCol; c++) row.push('');

    row[0] = name;
    row[1] = 'Auto-discovered by integrity gate';
    row[2] = 'Live Apps Script';
    row[3] = 'Registry gate';
    row[4] = 'Script Registry';
    row[5] = 'Auto-discovered live';
    row[6] = 'P1';
    row[7] = 'Non direct';
    row[10] = backup.name;
    row[11] = 'apps-script/' + name;
    row[12] = 'JRbIA';
    row[13] = 'Classer dans registry';
    row[14] = 'Fichier live absent du registry avant gate; vérifier criticité/statut.';
    row[15] = 'v0.7.3';
    row[16] = traceId;

    var live = liveMap[name];
    var bkp = backupMap[name] || null;
    var alertLevel = bkp ? (live.sha256 === bkp.sha256 ? 'OK' : 'WARN') : 'WARN';
    var alert = FBR_registryAlertText_(alertLevel, bkp ? (live.sha256 === bkp.sha256 ? 'OK AUTO' : 'DRIFT AUTO') : 'BACKUP MANQUANT AUTO');

    row[colMap['Live present'] - 1] = 'YES';
    row[colMap['Live SHA256'] - 1] = live.sha256;
    row[colMap['Backup SHA256'] - 1] = bkp ? bkp.sha256 : '';
    row[colMap['Drift status'] - 1] = 'LIVE_NOT_IN_REGISTRY';
    row[colMap['Registry alert'] - 1] = alert;
    row[colMap['Last checked'] - 1] = checkedAt;
    row[colMap['Latest backup'] - 1] = backup.name + ' / ' + backup.id;
    row[colMap['Missing in live'] - 1] = 'NO';
    row[colMap['Missing in backup'] - 1] = bkp ? 'NO' : 'YES';
    row[colMap['Diff summary'] - 1] = 'Fichier live non listé dans Script Registry avant vérification.';

    var rowNumber = Math.max(sheet.getLastRow() + 1, FBR_SCRIPT_REGISTRY_GATE.FIRST_DATA_ROW);
    sheet.getRange(rowNumber, 1, 1, lastCol).setValues([row]);
    sheet.getRange(rowNumber, colMap['Registry alert']).setBackground(FBR_registryAlertColor_(alert));
    appended++;
  }

  return appended;
}

function FBR_registryVerifyLiveVsBackup_(dryRun) {
  dryRun = dryRun !== false;
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  var sheet = FBR_registrySheet_();
  var checkedAt = new Date();

  var backup = FBR_registryFindLatestBackupZip_();
  var liveMap = FBR_registryLiveSourceMap_();
  var backupMap = FBR_registryBackupSourceMap_(backup);

  var colMap = dryRun ? FBR_registryHeaderMap_(sheet) : FBR_registryEnsureColumns_(sheet);
  var lastRow = sheet.getLastRow();
  var rowsCount = Math.max(0, lastRow - FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW);
  var values = rowsCount > 0 ? sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.FIRST_DATA_ROW, 1, rowsCount, Math.max(sheet.getLastColumn(), FBR_SCRIPT_REGISTRY_GATE.BASE_HEADER_COUNT)).getDisplayValues() : [];
  var registered = {};
  var counts = { ok: 0, warn: 0, bad: 0, na: 0, rows: 0, comparable: 0 };
  var samples = [];
  var writeResults = [];

  for (var i = 0; i < values.length; i++) {
    var rowNumber = FBR_SCRIPT_REGISTRY_GATE.FIRST_DATA_ROW + i;
    var fileName = FBR_registryNormalizeText_(values[i][FBR_SCRIPT_REGISTRY_GATE.FILE_COL - 1]);
    if (!fileName) continue;
    if (FBR_registryIsComparableFile_(fileName)) registered[fileName] = true;

    var rowStatus = values[i][FBR_SCRIPT_REGISTRY_GATE.STATUS_COL - 1];
    var criticality = values[i][FBR_SCRIPT_REGISTRY_GATE.CRITICALITY_COL - 1];
    var r = FBR_registryRowStatus_(fileName, rowStatus, criticality, liveMap, backupMap);
    counts.rows++;
    if (r.comparable) counts.comparable++;
    if (r.alertLevel === 'OK') counts.ok++;
    else if (r.alertLevel === 'WARN') counts.warn++;
    else if (r.alertLevel === 'BAD') counts.bad++;
    else counts.na++;

    if (r.alertLevel === 'WARN' || r.alertLevel === 'BAD') {
      if (samples.length < 12) samples.push(fileName + ' => ' + r.alert + ' / ' + r.drift);
    }

    if (!dryRun) writeResults.push({ rowNumber: rowNumber, result: r });
  }

  var appendMissing = 0;
  if (!dryRun) {
    for (var w = 0; w < writeResults.length; w++) {
      FBR_registryWriteResultToRow_(sheet, writeResults[w].rowNumber, colMap, writeResults[w].result, backup, checkedAt);
    }
    appendMissing = FBR_registryAppendMissingLiveRows_(sheet, colMap, liveMap, backupMap, registered, backup, checkedAt, traceId);
    FBR_registryApplyConditionalFormatting_();
    SpreadsheetApp.flush();
  }

  var message = [
    'Registry integrity gate ' + (dryRun ? 'DRY_RUN' : 'APPLY') + ' OK',
    'Trace: ' + traceId,
    'Version: ' + FBR_SCRIPT_REGISTRY_GATE.VERSION,
    'Latest backup: ' + backup.name,
    'Backup ID: ' + backup.id,
    'Live files: ' + Object.keys(liveMap).length,
    'Backup files: ' + Object.keys(backupMap).length,
    'Registry rows read: ' + counts.rows,
    'Comparable rows: ' + counts.comparable,
    'Green OK: ' + counts.ok,
    'Orange WARN: ' + counts.warn,
    'Red BAD: ' + counts.bad,
    'Neutral NA: ' + counts.na,
    'Auto-discovered rows appended: ' + appendMissing,
    samples.length ? ('Samples:\n- ' + samples.join('\n- ')) : 'Samples: none',
    dryRun ? 'No sheet write.' : 'Registry alerts written.'
  ].join('\n');

  FBR_log_({
    functionName: 'FBR_registryVerifyLiveVsBackup_',
    mode: dryRun ? 'DRY_RUN' : 'APPLY',
    status: counts.bad > 0 ? 'WARN' : 'OK',
    sheetName: FBR_registrySheetName_(),
    rowsRead: counts.rows,
    rowsChanged: dryRun ? 0 : counts.rows + appendMissing,
    message: message,
    startMs: startMs,
    traceId: traceId
  });

  return FBR_result_(true, dryRun ? 'Registry integrity — dry-run' : 'Registry integrity — APPLY', message);
}

function FBR_registryApplyConditionalFormatting_() {
  var sheet = FBR_registrySheet_();
  var colMap = FBR_registryHeaderMap_(sheet);
  var alertCol = colMap['Registry alert'];
  if (!alertCol) return FBR_result_(false, 'Registry formatting', 'Colonne Registry alert absente.');

  var lastRow = sheet.getLastRow();
  if (lastRow < FBR_SCRIPT_REGISTRY_GATE.FIRST_DATA_ROW) {
    return FBR_result_(true, 'Registry formatting', 'Aucune ligne à colorer.');
  }

  var range = sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.FIRST_DATA_ROW, alertCol, lastRow - FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW, 1);
  var values = range.getDisplayValues();
  var backgrounds = [];
  for (var i = 0; i < values.length; i++) {
    backgrounds.push([FBR_registryAlertColor_(values[i][0])]);
  }
  range.setBackgrounds(backgrounds);
  SpreadsheetApp.flush();

  var result = FBR_result_(true, 'Registry formatting', 'Alertes recolorées : ' + values.length + ' ligne(s).');
  result.rowsAffected = values.length;
  return result;
}

function FBR_registryOpenDriftAlerts_() {
  var sheet = FBR_registrySheet_();
  var colMap = FBR_registryHeaderMap_(sheet);
  var alertCol = colMap['Registry alert'];
  if (!alertCol) throw new Error('Colonne Registry alert absente. Lancer verify APPLY avant.');

  SpreadsheetApp.getActive().setActiveSheet(sheet);
  var lastRow = Math.max(sheet.getLastRow(), FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW);
  var filter = sheet.getFilter();
  if (!filter) {
    sheet.getRange(FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW, 1, lastRow - FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW + 1, sheet.getLastColumn()).createFilter();
    filter = sheet.getFilter();
  }

  var green = String.fromCodePoint(0x1F7E2);
  try {
    var criteria = SpreadsheetApp.newFilterCriteria().whenTextDoesNotContain(green).build();
    filter.setColumnFilterCriteria(alertCol, criteria);
  } catch (err) {
    // Older filter states can throw. The sheet is still opened; user can filter manually.
  }

  var result = FBR_result_(true, 'Registry alertes ouvertes', 'Onglet Script Registry ouvert. Filtre alertes appliqué si possible.');
  result.rowsAffected = Math.max(0, lastRow - FBR_SCRIPT_REGISTRY_GATE.HEADER_ROW);
  return result;
}

/* Public wrappers for menu and manual runs */
function FELIBREE_registryVerifyLiveVsBackupDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_registryVerifyLiveVsBackupDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR_registrySheetName_(),
    logSuccess: false
  }, function () {
    return FBR_registryVerifyLiveVsBackup_(true);
  });
}
function FELIBREE_registryVerifyLiveVsBackupApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_registryVerifyLiveVsBackupApply',
    mode: 'APPLY',
    sheetName: FBR_registrySheetName_(),
    logSuccess: false
  }, function () {
    return FBR_registryVerifyLiveVsBackup_(false);
  });
}
function FELIBREE_registryApplyConditionalFormatting() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_registryApplyConditionalFormatting',
    mode: 'UI_ACTION',
    sheetName: FBR_registrySheetName_(),
    rowsRead: function (result) { return result && result.rowsAffected ? result.rowsAffected : 0; },
    rowsChanged: function (result) { return result && result.rowsAffected ? result.rowsAffected : 0; },
    successMessage: function (result) {
      return result && result.details ? result.details : 'Alertes Registry recolorées.';
    }
  }, function () {
    return FBR_registryApplyConditionalFormatting_();
  });
}
function FELIBREE_registryOpenDriftAlerts() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_registryOpenDriftAlerts',
    mode: 'UI_ACTION',
    sheetName: FBR_registrySheetName_(),
    rowsRead: function (result) { return result && result.rowsAffected ? result.rowsAffected : 0; },
    rowsChanged: 0,
    successMessage: function (result) {
      return result && result.details ? result.details : 'Alertes Registry ouvertes.';
    }
  }, function () {
    return FBR_registryOpenDriftAlerts_();
  });
}
