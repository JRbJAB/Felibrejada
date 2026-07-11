  /**
 * FBR_UI_FAMILY_REGISTRY_CORRECTIONS_20260710_v0_1_1.gs
 *
 * Replacement for FBR_UI_FAMILY_REGISTRY_CORRECTIONS_20260710_v0_1.gs.
 * Fixes:
 * - freeze error caused by merged cells in title rows
 * - row minimum heights
 * - compact width mode
 * - title row 1/2 formatting propagated to the right WITHOUT merges
 * - smart essential column order for Script Registry
 * - essential colors + editable color rule
 * - closed lists vs connected lists
 * - invalid choices report
 * - blank rows hidden, not deleted
 * - warning-only protections
 */

var FBR_UI_REGISTRY_CORRECTIONS_VERSION = 'v0.1.2';
var FBR_UI_REGISTRY_CORRECTIONS_TRACE = 'UI_FAMILY_REGISTRY_CORRECTIONS_03';

function FELIBREE_uiRegistryCorrectionsDryRun() {
  return FBR_UI_FAMILY_REGISTRY_CORRECTIONS_dryRun();
}

function FELIBREE_uiRegistryCorrectionsApply() {
  return FBR_UI_FAMILY_REGISTRY_CORRECTIONS_apply();
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_dryRun() {
  return FBR_UI_FAMILY_REGISTRY_CORRECTIONS_run_(false);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_apply() {
  return FBR_UI_FAMILY_REGISTRY_CORRECTIONS_run_(true);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_run_(apply) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  var report = {
    version: FBR_UI_REGISTRY_CORRECTIONS_VERSION,
    trace: FBR_UI_REGISTRY_CORRECTIONS_TRACE,
    apply: !!apply,
    sheets: [],
    missing: [],
    blankRowsDetected: {},
    mergedCellsTopRows: {},
    invalidChoices: {},
    duplicateKeys: {},
    timestamp: new Date()
  };

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.SCRIPT_REGISTRY, 'script_registry', apply, report);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.UI_SCRIPTS_AUDIT, 'ui_scripts_audit', apply, report);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.CONTROLES, 'controles', apply, report);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.QA_RULES, 'qa_rules', apply, report);

  if (apply) {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_log_(ss, 'UI_FAMILY_REGISTRY_CORRECTIONS_APPLY', 'OK', JSON.stringify({
      sheets: report.sheets,
      blankRowsDetected: report.blankRowsDetected,
      invalidChoices: report.invalidChoices,
      duplicateKeys: report.duplicateKeys
    }));
  }

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, sheetName, kind, apply, report) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) {
    report.missing.push(sheetName);
    return;
  }

  var lastRow = Math.max(sh.getLastRow(), 4);
  var lastCol = Math.max(sh.getLastColumn(), kind === 'script_registry' ? 30 : 14);
  report.sheets.push(sheetName);
  report.mergedCellsTopRows[sheetName] = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_countMergedCells_(sh, 1, 1, Math.min(4, lastRow), lastCol);

  if (kind === 'script_registry') {
    var dup = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_findDuplicateKeys_(sh, 5, lastRow, 1);
    report.duplicateKeys[sheetName] = dup;
  }

  var blanks = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_findBlankRows_(sh, 5, lastRow, Math.min(lastCol, 12));
  report.blankRowsDetected[sheetName] = blanks.length;

  report.invalidChoices[sheetName] = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_auditInvalidChoices_(ss, sh, kind, lastRow);

  if (!apply) return;

  // Critical: unmerge title/header rows BEFORE setting frozen columns.
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_unmergeTopRows_(sh, lastCol);
  sh.setFrozenRows(4);
  sh.setFrozenColumns(kind === 'script_registry' ? 1 : 1);
  sh.setHiddenGridlines(true);

  if (kind === 'script_registry') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_rebuildScriptRegistryEssential_(sh);
    lastRow = Math.max(sh.getLastRow(), 4);
    lastCol = Math.max(sh.getLastColumn(), 30);
  } else if (kind === 'controles') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_ensureControlesSchema_(sh);
    lastRow = Math.max(sh.getLastRow(), 4);
    lastCol = Math.max(sh.getLastColumn(), 17);
  }

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseHeader_(sh, lastCol);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseBody_(sh, lastRow, lastCol);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setMinRowHeights_(sh, lastRow);

  if (kind === 'script_registry') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatScriptRegistry_(ss, sh);
  } else if (kind === 'ui_scripts_audit') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatUiScriptsAudit_(ss, sh);
  } else if (kind === 'controles') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatControles_(ss, sh);
  } else if (kind === 'qa_rules') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatQaRules_(ss, sh);
  }

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_hideBlankRowsSafe_(sh, blanks);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_protectCommon_(sh, lastRow, lastCol);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_() {
  return {
    SCRIPT_REGISTRY: String.fromCodePoint(0x1F9E9) + ' Script Registry',
    UI_SCRIPTS_AUDIT: String.fromCodePoint(0x1F9E9) + ' UI Scripts Audit',
    CONTROLES: String.fromCodePoint(0x1F50E) + ' Contrôles',
    QA_RULES: String.fromCodePoint(0x2705) + ' QA Data Rules',
    PARAMS: String.fromCodePoint(0x2699) + String.fromCodePoint(0xFE0F) + ' Paramètres',
    SHEET_REGISTRY: String.fromCodePoint(0x1F5C2) + String.fromCodePoint(0xFE0F) + ' Sheet Registry',
    LOGS: String.fromCodePoint(0x1F9FE) + ' Logs',
    COLORS: {
      titleBg: '#17365D',
      subBg: '#D9EAF7',
      metaBg: '#EEF3F8',
      headerBg: '#1F4E79',
      readOnlyBg: '#F3F4F6',
      editableBg: '#FFF7CC',
      white: '#FFFFFF',
      line: '#D0D7DE',
      greenBg: '#DFF2BF',
      greenText: '#1F5E20',
      orangeBg: '#FFE0B2',
      orangeText: '#6B3A00',
      redBg: '#F8D7DA',
      redText: '#842029',
      blueBg: '#DDEBFF',
      blueText: '#063B7A'
    }
  };
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_desiredRegistryHeaders_() {
  return [
    'Fichier script', 'Famille / rôle', 'Fonction principale', 'Type', 'Statut', 'Criticité',
    'Live present', 'À jour sauvegarde', 'Dernier backup', 'Registry alert', 'Présent menu', 'Présent sidebar',
    'Wrapper public', 'Mode MAJ', 'Write action', 'Onglets touchés', 'Scope requis', 'Dépendances',
    'GitHub path', 'Owner', 'Action suivante', 'Notes', 'Version', 'Trace', 'Live SHA256', 'Backup SHA256',
    'Drift status', 'Last checked', 'Diff summary', 'Source / preuve'
  ];
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_rebuildScriptRegistryEssential_(sh) {
  // v0.1.2: stale validations can block setValues during schema rebuild.
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_clearValidationsSafe_(sh);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_clearConditionalFormatsSafe_(sh);
  var oldLastRow = Math.max(sh.getLastRow(), 4);
  var oldLastCol = Math.max(sh.getLastColumn(), 28);
  var oldValues = sh.getRange(1, 1, oldLastRow, oldLastCol).getDisplayValues();
  var oldHeaders = oldValues.length >= 4 ? oldValues[3] : [];
  var hmap = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_headerMap_(oldHeaders);
  var desired = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_desiredRegistryHeaders_();
  var rows = [];

  for (var r = 4; r < oldValues.length; r++) {
    var row = oldValues[r];
    var file = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Fichier script']);
    if (!file) continue;
    if (file.indexOf('SECTION') === 0) continue;
    var status = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Statut']);
    var trace = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Trace']);
    var backup = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Dernier backup']);
    var isOldGeminiBlock = (file.indexOf('Gemini') >= 0 || file === '27_GeminiConfig.gs' || file === '28_GeminiGroundedSearch.gs' || file === '29_GeminiUrlContext.gs' || file === '30_GeminiResearchParser.gs' || file === '31_GeminiDeepResearchDocImport.gs' || file === '32_IaStagingUi.gs') && (String(status).indexOf('ddfb2995') >= 0 || String(trace) === 'ddfb2995' || String(backup) === 'ddfb2995');
    if (isOldGeminiBlock) continue;
    var obsolete = String(status).indexOf('OBSOLETE') >= 0 || String(status).indexOf('NE PAS INSTALLER') >= 0;
    if (obsolete) continue;

    var out = [];
    for (var c = 0; c < desired.length; c++) out.push('');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Fichier script', file);
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Famille / rôle', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessFamily_(file, row, hmap));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Fonction principale', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Fonction publique / interne', 'Fonction principale']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Type', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Type']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Statut', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Statut']) || 'Actif live');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Criticité', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Criticité']) || 'P1');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Live present', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Live present']) || (String(status).indexOf('NON LIVE') >= 0 ? 'NO' : 'YES'));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'À jour sauvegarde', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessBackupFresh_(row, hmap));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Dernier backup', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Dernier backup']) || 'e74f0caf');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Registry alert', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Registry alert']) || String.fromCodePoint(0x1F7E0) + ' À vérifier');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Présent menu', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessMenu_(file));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Présent sidebar', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessSidebar_(file));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Wrapper public', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessWrapper_(file, row, hmap));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Mode MAJ', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessModeMaj_(file));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Write action', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Write action']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Onglets touchés', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Domaine', 'Onglets touchés']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Scope requis', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Scope requis']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Dépendances', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Dépendances']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'GitHub path', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['GitHub path']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Owner', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Owner']) || 'JRbIA');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Action suivante', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Action suivante']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Notes', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Notes']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Version', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Version']) || 'v0.7.3-live');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Trace', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Trace']) || 'e74f0caf');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Live SHA256', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Live SHA256']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Backup SHA256', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Backup SHA256']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Drift status', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Drift status']) || 'À recalculer');
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Last checked', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Last checked']));
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(out, desired, 'Diff summary', FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Diff summary']));
    rows.push(out);
  }

  rows = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_dedupeRows_(rows, 0);

  var title = '🧩 Script Registry — cockpit scripts live / planifiés';
  var notice = 'Référence : état live, sauvegarde, fonction, menu/sidebar, rôle UI/données/QA/backup, et scripts planifiés. Historique dans 🧩 UI Scripts Audit.';
  var meta = ['Dernière mise à jour', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), 'Statut', 'Registre essentiel reconstruit', 'Baseline', 'e74f0caf', 'Règle', 'Pas de ligne vide / pas de ligne orpheline'];

  sh.clear();
  sh.getRange(1, 1).setValue(title);
  sh.getRange(2, 1).setValue(notice);
  sh.getRange(3, 1, 1, meta.length).setValues([meta]);
  sh.getRange(4, 1, 1, desired.length).setValues([desired]);
  if (rows.length) sh.getRange(5, 1, rows.length, desired.length).setValues(rows);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_headerMap_(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[String(headers[i] || '').trim()] = i;
  }
  return map;
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, map, names) {
  for (var i = 0; i < names.length; i++) {
    var idx = map[names[i]];
    if (idx !== undefined) return row[idx];
  }
  return '';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setByDesired_(row, desired, name, value) {
  var idx = desired.indexOf(name);
  if (idx >= 0) row[idx] = value || '';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_dedupeRows_(rows, keyIndex) {
  var seen = {};
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var k = String(rows[i][keyIndex] || '').trim();
    if (!k) continue;
    if (seen[k]) continue;
    seen[k] = true;
    out.push(rows[i]);
  }
  return out;
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessFamily_(file, row, hmap) {
  var f = String(file || '');
  if (f.indexOf('Gemini') >= 0 || f.indexOf('IaStaging') >= 0) return 'IA / staging';
  if (f.indexOf('AIDE') >= 0 || f.indexOf('Aide') >= 0) return 'Aide / notice';
  if (f.indexOf('Registry') >= 0) return 'Registry / integrity';
  if (f.indexOf('Backup') >= 0 || f.indexOf('GitHub') >= 0) return 'Backup / GitHub';
  if (f.indexOf('Calendar') >= 0) return 'Calendrier';
  if (f.indexOf('Planning') >= 0) return 'Planning';
  if (f.indexOf('Press') >= 0) return 'Presse';
  if (f.indexOf('Dashboard') >= 0) return 'Cockpit';
  return FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Famille / rôle', 'Domaine']) || 'Core';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessMenu_(file) {
  var f = String(file || '');
  if (f === '03_Menu_UI.gs') return 'OUI - source menu';
  if (f === '00_Code.gs') return 'OUI - wrappers';
  if (f.indexOf('IaStaging') >= 0 || f.indexOf('RegistryIntegrity') >= 0 || f.indexOf('Backup') >= 0 || f.indexOf('GitHub') >= 0 || f.indexOf('Calendar') >= 0 || f.indexOf('Planning') >= 0) return 'OUI - via menu';
  if (f.indexOf('AIDE') >= 0 || f.indexOf('Aide') >= 0) return 'OUI - aide';
  return 'NON / interne';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessSidebar_(file) {
  var f = String(file || '');
  if (f === '04_Sidebar.html') return 'OUI - HTML sidebar';
  if (f.indexOf('AIDE') >= 0 || f.indexOf('Aide') >= 0) return 'OUI - aide/sidebar';
  if (f.indexOf('IaStaging') >= 0) return 'OUI - carte IA';
  return 'NON';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessWrapper_(file, row, hmap) {
  var fn = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Fonction publique / interne', 'Fonction principale']);
  if (String(fn).indexOf('FELIBREE_') >= 0) return 'OUI';
  var f = String(file || '');
  if (f === '00_Code.gs') return 'OUI';
  return 'À vérifier';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessModeMaj_(file) {
  var f = String(file || '');
  if (f.indexOf('Backup') >= 0 || f.indexOf('GitHub') >= 0) return 'Auto protégé';
  if (f.indexOf('Gemini') >= 0 || f.indexOf('IaStaging') >= 0) return 'Staging puis validation';
  if (f.indexOf('Calendar') >= 0 || f.indexOf('Planning') >= 0) return 'Flag + apply contrôlé';
  if (f.indexOf('Data') >= 0) return 'Planifié';
  return 'Manuel / script';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_guessBackupFresh_(row, hmap) {
  var drift = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_readByHeader_(row, hmap, ['Drift status']);
  if (String(drift).indexOf('OK') >= 0) return 'OUI';
  return 'À recalculer';
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_ensureControlesSchema_(sh) {
  var headers = ['Type suivi', 'Mode alimentation', 'Onglet cible', 'Script lié', 'Modifiable ?', 'Liste choix', 'Protection'];
  sh.getRange(4, 11, 1, headers.length).setValues([headers]);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_unmergeTopRows_(sh, lastCol) {
  var range = sh.getRange(1, 1, 4, lastCol);
  try {
    range.breakApart();
  } catch (err) {
    Logger.log('Unmerge skipped for ' + sh.getName() + ': ' + err);
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_countMergedCells_(sh, row, col, numRows, numCols) {
  try {
    return sh.getRange(row, col, numRows, numCols).getMergedRanges().length;
  } catch (err) {
    return -1;
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseHeader_(sh, lastCol) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  sh.getRange(1, 1, 1, lastCol).setBackground(cfg.COLORS.titleBg).setFontColor(cfg.COLORS.white).setFontWeight('bold').setFontSize(13).setWrap(true);
  sh.getRange(2, 1, 1, lastCol).setBackground(cfg.COLORS.subBg).setFontColor('#17365D').setFontWeight('bold').setWrap(true);
  sh.getRange(3, 1, 1, lastCol).setBackground(cfg.COLORS.metaBg).setFontColor('#17365D').setFontWeight('bold').setWrap(true);
  sh.getRange(4, 1, 1, lastCol).setBackground(cfg.COLORS.headerBg).setFontColor(cfg.COLORS.white).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  sh.setRowHeightsForced(1, 1, 34);
  sh.setRowHeightsForced(2, 1, 48);
  sh.setRowHeightsForced(3, 1, 30);
  sh.setRowHeightsForced(4, 1, 54);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseBody_(sh, lastRow, lastCol) {
  if (lastRow < 5) return;
  sh.getRange(5, 1, lastRow - 4, lastCol).setWrap(true).setVerticalAlignment('top').setBorder(true, true, true, true, true, true, '#D0D7DE', SpreadsheetApp.BorderStyle.SOLID);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_setMinRowHeights_(sh, lastRow) {
  if (lastRow >= 5) sh.setRowHeightsForced(5, lastRow - 4, 34);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatScriptRegistry_(ss, sh) {
  // Header order v0.1.2:
  // A File, B Family, C Function, D Type, E Status, F Criticality, G Live, H Backup fresh, I Backup, J Alert, K Menu, L Sidebar, M Wrapper, N Update mode...
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_compactWidths_(sh, [190, 140, 230, 130, 150, 80, 95, 120, 120, 125, 135, 135, 120, 140, 130, 180, 190, 180, 260, 120, 220, 260, 130, 120, 220, 220, 130, 120, 260, 180]);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'E5:E500', ['Actif live', 'Actif live protégé', 'Planifié - NON LIVE', 'Actif', 'Planifié', 'À produire', 'PATCH PRÊT', 'Archivé', 'APPLIQUÉ SHEET LIVE']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'F5:F500', ['P0', 'P1', 'P2', 'P3']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'G5:G500', ['YES', 'NO', 'À recalculer']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'H5:H500', ['OUI', 'NON', 'À recalculer']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'J5:J500', [String.fromCodePoint(0x1F7E2) + ' OK', String.fromCodePoint(0x1F7E0) + ' À vérifier', String.fromCodePoint(0x1F534) + ' DRIFT', String.fromCodePoint(0x26AA) + ' NON LIVE', String.fromCodePoint(0x26AA) + ' N/A']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'K5:K500', ['OUI - source menu', 'OUI - wrappers', 'OUI - via menu', 'OUI - aide', 'NON / interne', 'À vérifier']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'L5:L500', ['OUI - HTML sidebar', 'OUI - aide/sidebar', 'OUI - carte IA', 'NON', 'À vérifier']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'M5:M500', ['OUI', 'NON', 'À vérifier']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'N5:N500', ['Manuel / script', 'Auto protégé', 'Staging puis validation', 'Flag + apply contrôlé', 'Planifié']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyConnectedList_(ss, sh, 'T5:T500', 'owners');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:D500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'E5:N500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'U5:V500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'W5:AD500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condPriority_(sh, 'F5:F500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condRegistryAlert_(sh, 'J5:J500');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatUiScriptsAudit_(ss, sh) {
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_compactWidths_(sh, [160, 260, 140, 220, 150, 150, 240, 80, 70, 200, 240, 220, 300]);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'H5:H220', ['Non', 'Oui, après archive', 'Parking']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'I5:I220', ['P0', 'P1', 'P2', 'P3']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:D220');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'E5:K220');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condPriority_(sh, 'I5:I220');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatControles_(ss, sh) {
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_compactWidths_(sh, [135, 150, 90, 90, 130, 260, 260, 140, 110, 220, 120, 140, 160, 180, 120, 130, 130]);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'C5:C1000', ['INFO', 'DÉCISION', 'ATTENTION', 'BLOQUANT', 'ERREUR']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'I5:I1000', ['Ouvert', 'À faire', 'En cours', 'Corrigé', 'Validé', 'Refusé', 'Archivé']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'K5:K1000', ['Correction', 'Blocage', 'Alerte', 'Historique', 'Décision', 'Contrôle']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'L5:L1000', ['Manuel', 'Script lié', 'Automatique lié', 'Historique']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyConnectedList_(ss, sh, 'M5:M1000', 'sheets');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyConnectedList_(ss, sh, 'N5:N1000', 'scripts');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'O5:O1000', ['Oui', 'Non', 'Notes/statut seulement']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'P5:P1000', ['LISTE_CONNECTÉE', 'LISTE_FERMÉE', 'LIBRE', 'N/A']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'Q5:Q1000', ['Protégé', 'Warning only', 'Non protégé volontaire', 'À faire']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:F1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'G5:J1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'K5:Q1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condStatus_(sh, 'I5:I1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condSeverity_(sh, 'C5:C1000');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatQaRules_(ss, sh) {
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_compactWidths_(sh, [120, 130, 360, 220, 180, 90, 110, 110, 260, 130, 150, 260, 100, 120]);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'F5:F500', ['Info', 'Alerte', 'Erreur', 'Bloquant']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'G5:G500', ['Oui', 'Non', 'TRUE', 'FALSE']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'H5:H500', ['Actif', 'À créer', 'Archivé', 'À revoir']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyConnectedList_(ss, sh, 'J5:J500', 'owners');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:E500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'F5:I500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'J5:N500');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_compactWidths_(sh, widths) {
  for (var i = 0; i < widths.length; i++) sh.setColumnWidth(i + 1, widths[i]);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_clearValidationsSafe_(sh) {
  try {
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).clearDataValidations();
  } catch (err) {
    Logger.log('clearDataValidations skipped for ' + sh.getName() + ': ' + err);
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_clearConditionalFormatsSafe_(sh) {
  try {
    sh.setConditionalFormatRules([]);
  } catch (err) {
    Logger.log('clearConditionalFormats skipped for ' + sh.getName() + ': ' + err);
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, a1, values) {
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sh.getRange(a1).setDataValidation(rule);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyConnectedList_(ss, sh, a1, kind) {
  var range = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_refRange_(ss, kind);
  if (!range) return;
  var rule = SpreadsheetApp.newDataValidation().requireValueInRange(range, true).setAllowInvalid(false).build();
  sh.getRange(a1).setDataValidation(rule);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_refRange_(ss, kind) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  if (kind === 'owners') {
    var p = ss.getSheetByName(cfg.PARAMS);
    if (p) return p.getRange('L3:L20');
  }
  if (kind === 'sheets') {
    var sr = ss.getSheetByName(cfg.SHEET_REGISTRY);
    if (sr) return sr.getRange('A5:A160');
  }
  if (kind === 'scripts') {
    var sc = ss.getSheetByName(cfg.SCRIPT_REGISTRY);
    if (sc) return sc.getRange('A5:A160');
  }
  return null;
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, a1) {
  sh.getRange(a1).setBackground(FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_().COLORS.editableBg);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, a1) {
  sh.getRange(a1).setBackground(FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_().COLORS.readOnlyBg);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_findBlankRows_(sh, startRow, endRow, scanCols) {
  var blanks = [];
  if (endRow < startRow) return blanks;
  var values = sh.getRange(startRow, 1, endRow - startRow + 1, scanCols).getDisplayValues();
  for (var i = 0; i < values.length; i++) {
    var row = values[i].join('').replace(/\s+/g, '');
    if (!row) blanks.push(startRow + i);
  }
  return blanks;
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_findDuplicateKeys_(sh, startRow, endRow, keyCol) {
  var out = [];
  if (endRow < startRow) return out;
  var vals = sh.getRange(startRow, keyCol, endRow - startRow + 1, 1).getDisplayValues();
  var seen = {};
  for (var i = 0; i < vals.length; i++) {
    var k = String(vals[i][0] || '').trim();
    if (!k) continue;
    if (seen[k]) out.push(k + ' @ row ' + (startRow + i));
    seen[k] = true;
  }
  return out;
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_hideBlankRowsSafe_(sh, rows) {
  for (var i = 0; i < rows.length; i++) {
    try { sh.hideRows(rows[i]); } catch (err) {}
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_auditInvalidChoices_(ss, sh, kind, lastRow) {
  // Dry-run report only. Apply does not erase invalid existing values.
  var checks = [];
  if (kind === 'script_registry') {
    checks.push({a1:'E5:E' + lastRow, values:['Actif live','Actif live protégé','Planifié - NON LIVE','Actif','Planifié','À produire','PATCH PRÊT','Archivé','APPLIQUÉ SHEET LIVE'], name:'Statut'});
    checks.push({a1:'F5:F' + lastRow, values:['P0','P1','P2','P3'], name:'Criticité'});
    checks.push({a1:'G5:G' + lastRow, values:['YES','NO','À recalculer'], name:'Live present'});
    checks.push({a1:'H5:H' + lastRow, values:['OUI','NON','À recalculer'], name:'À jour sauvegarde'});
  } else if (kind === 'controles') {
    checks.push({a1:'C5:C' + lastRow, values:['INFO','DÉCISION','ATTENTION','BLOQUANT','ERREUR'], name:'Niveau'});
    checks.push({a1:'I5:I' + lastRow, values:['Ouvert','À faire','En cours','Corrigé','Validé','Refusé','Archivé'], name:'Statut'});
    checks.push({a1:'L5:L' + lastRow, values:['Manuel','Script lié','Automatique lié','Historique'], name:'Mode alimentation'});
  } else if (kind === 'qa_rules') {
    checks.push({a1:'F5:F' + lastRow, values:['Info','Alerte','Erreur','Bloquant'], name:'Niveau'});
    checks.push({a1:'H5:H' + lastRow, values:['Actif','À créer','Archivé','À revoir'], name:'Statut'});
  }
  var bad = [];
  for (var i = 0; i < checks.length; i++) {
    var c = checks[i];
    var rg = sh.getRange(c.a1);
    var vals = rg.getDisplayValues();
    for (var r = 0; r < vals.length; r++) {
      var v = String(vals[r][0] || '').trim();
      if (!v) continue;
      if (c.values.indexOf(v) < 0) bad.push(c.name + ' row ' + (5 + r) + ': ' + v);
    }
  }
  return bad.slice(0, 50);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_protectCommon_(sh, lastRow, lastCol) {
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_warnProtect_(sh, sh.getRange(1, 1, 4, lastCol), 'UI strict headers protected warning-only');
  if (lastRow >= 5) FBR_UI_FAMILY_REGISTRY_CORRECTIONS_warnProtect_(sh, sh.getRange(5, 1, lastRow - 4, 1), 'UI strict first column protected warning-only');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_warnProtect_(sh, range, desc) {
  try {
    var p = range.protect();
    p.setDescription(desc + ' — ' + sh.getName());
    p.setWarningOnly(true);
  } catch (err) {
    Logger.log('Protection skipped for ' + sh.getName() + ': ' + err);
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condPriority_(sh, a1) {
  var range = sh.getRange(a1);
  var rules = sh.getConditionalFormatRules();
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('P0').setBackground(cfg.COLORS.redBg).setFontColor(cfg.COLORS.redText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('P1').setBackground(cfg.COLORS.orangeBg).setFontColor(cfg.COLORS.orangeText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('P2').setBackground(cfg.COLORS.blueBg).setFontColor(cfg.COLORS.blueText).setBold(true).setRanges([range]).build());
  sh.setConditionalFormatRules(rules);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condStatus_(sh, a1) {
  var range = sh.getRange(a1);
  var rules = sh.getConditionalFormatRules();
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('Validé').setBackground(cfg.COLORS.greenBg).setFontColor(cfg.COLORS.greenText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('Corrigé').setBackground(cfg.COLORS.blueBg).setFontColor(cfg.COLORS.blueText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('Ouvert').setBackground(cfg.COLORS.orangeBg).setFontColor(cfg.COLORS.orangeText).setBold(true).setRanges([range]).build());
  sh.setConditionalFormatRules(rules);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condSeverity_(sh, a1) {
  var range = sh.getRange(a1);
  var rules = sh.getConditionalFormatRules();
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('BLOQUANT').setBackground(cfg.COLORS.redBg).setFontColor(cfg.COLORS.redText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('ATTENTION').setBackground(cfg.COLORS.orangeBg).setFontColor(cfg.COLORS.orangeText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('DÉCISION').setBackground(cfg.COLORS.blueBg).setFontColor(cfg.COLORS.blueText).setBold(true).setRanges([range]).build());
  sh.setConditionalFormatRules(rules);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condRegistryAlert_(sh, a1) {
  var range = sh.getRange(a1);
  var rules = sh.getConditionalFormatRules();
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains(String.fromCodePoint(0x1F7E2)).setBackground(cfg.COLORS.greenBg).setFontColor(cfg.COLORS.greenText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains(String.fromCodePoint(0x1F7E0)).setBackground(cfg.COLORS.orangeBg).setFontColor(cfg.COLORS.orangeText).setBold(true).setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains(String.fromCodePoint(0x1F534)).setBackground(cfg.COLORS.redBg).setFontColor(cfg.COLORS.redText).setBold(true).setRanges([range]).build());
  sh.setConditionalFormatRules(rules);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_log_(ss, eventName, status, notes) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  var sh = ss.getSheetByName(cfg.LOGS);
  if (!sh) return;
  sh.appendRow([
    new Date(),
    'FBR_UI_FAMILY_REGISTRY_CORRECTIONS',
    eventName,
    'UI_STRICT',
    status,
    'registry_corrections_family',
    '',
    '',
    notes,
    0,
    FBR_UI_REGISTRY_CORRECTIONS_TRACE,
    'DONE',
    'UI rules applied to registry/corrections family.'
  ]);
}
