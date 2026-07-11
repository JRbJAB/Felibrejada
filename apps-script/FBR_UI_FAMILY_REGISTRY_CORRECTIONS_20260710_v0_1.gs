/**
 * FBR_UI_FAMILY_REGISTRY_CORRECTIONS_20260710_v0_1.gs
 *
 * UI family script for registry / corrections / QA tabs.
 *
 * Scope:
 * - Formats and governs:
 *   - 🧩 Script Registry
 *   - 🧩 UI Scripts Audit
 *   - 🔎 Contrôles
 *   - ✅ QA Data Rules
 * - Adds strict UI conventions:
 *   - connected vs closed validation lists
 *   - no visible blank rows in operational tables
 *   - editable cells identified in pale yellow unless status/priority color applies
 *   - read-only/system cells protected in warning-only safe mode
 *   - correction tracking mode: Manual / Linked Script / Automatic Linked / Historical
 *
 * Safety:
 * - No external API
 * - No trigger
 * - No email/calendar/publication
 * - Sheet UI only
 */

var FBR_UI_REGISTRY_CORRECTIONS_VERSION = 'v0.1.0';
var FBR_UI_REGISTRY_CORRECTIONS_TRACE = 'UI_FAMILY_REGISTRY_CORRECTIONS_01';

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
    timestamp: new Date()
  };

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.SCRIPT_REGISTRY, 'script_registry', apply, report);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.UI_SCRIPTS_AUDIT, 'ui_scripts_audit', apply, report);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.CONTROLES, 'controles', apply, report);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_processSheet_(ss, cfg.QA_RULES, 'qa_rules', apply, report);

  if (apply) {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_log_(ss, 'UI_FAMILY_REGISTRY_CORRECTIONS_APPLY', 'OK', JSON.stringify({
      sheets: report.sheets,
      missing: report.missing,
      blankRowsDetected: report.blankRowsDetected
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
  var lastCol = Math.max(sh.getLastColumn(), 10);
  var blankRows = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_findBlankRows_(sh, 5, lastRow, Math.min(lastCol, 12));
  report.blankRowsDetected[sheetName] = blankRows.length;
  report.sheets.push(sheetName);

  if (!apply) return;

  sh.setFrozenRows(4);
  sh.setFrozenColumns(kind === 'script_registry' ? 2 : 1);
  sh.setHiddenGridlines(true);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseHeader_(sh, lastCol);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseBody_(sh, lastRow, lastCol);

  if (kind === 'script_registry') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatScriptRegistry_(sh);
  } else if (kind === 'ui_scripts_audit') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatUiScriptsAudit_(sh);
  } else if (kind === 'controles') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatControles_(sh);
  } else if (kind === 'qa_rules') {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatQaRules_(sh);
  }

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_hideBlankRowsSafe_(sh, blankRows);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_protectCommon_(sh, lastRow, lastCol);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_() {
  return {
    SCRIPT_REGISTRY: String.fromCodePoint(0x1F9E9) + ' Script Registry',
    UI_SCRIPTS_AUDIT: String.fromCodePoint(0x1F9E9) + ' UI Scripts Audit',
    CONTROLES: String.fromCodePoint(0x1F50E) + ' Contrôles',
    QA_RULES: String.fromCodePoint(0x2705) + ' QA Data Rules',
    LOGS: String.fromCodePoint(0x1F9FE) + ' Logs',
    COLORS: {
      titleBg: '#17365D',
      subBg: '#D9EAF7',
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

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseHeader_(sh, lastCol) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  sh.getRange(1, 1, 1, lastCol)
    .setBackground(cfg.COLORS.titleBg)
    .setFontColor(cfg.COLORS.white)
    .setFontWeight('bold')
    .setFontSize(13)
    .setWrap(true);
  sh.getRange(2, 1, 1, lastCol)
    .setBackground(cfg.COLORS.subBg)
    .setFontColor('#17365D')
    .setFontWeight('bold')
    .setWrap(true);
  sh.getRange(3, 1, 1, lastCol)
    .setBackground('#EEF3F8')
    .setFontColor('#17365D')
    .setFontWeight('bold')
    .setWrap(true);
  sh.getRange(4, 1, 1, lastCol)
    .setBackground(cfg.COLORS.headerBg)
    .setFontColor(cfg.COLORS.white)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sh.setRowHeights(1, 1, 30);
  sh.setRowHeights(2, 1, 42);
  sh.setRowHeights(3, 1, 28);
  sh.setRowHeights(4, 1, 48);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_baseBody_(sh, lastRow, lastCol) {
  if (lastRow < 5) return;
  sh.getRange(5, 1, lastRow - 4, lastCol)
    .setWrap(true)
    .setVerticalAlignment('top')
    .setBorder(true, true, true, true, true, true, '#D0D7DE', SpreadsheetApp.BorderStyle.SOLID);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatScriptRegistry_(sh) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  sh.setColumnWidths(1, 1, 280);
  sh.setColumnWidths(2, 1, 320);
  sh.setColumnWidths(3, 1, 180);
  sh.setColumnWidths(4, 1, 210);
  sh.setColumnWidths(5, 1, 220);
  sh.setColumnWidths(6, 1, 190);
  sh.setColumnWidths(7, 1, 90);
  sh.setColumnWidths(8, 1, 140);
  sh.setColumnWidths(9, 1, 280);
  sh.setColumnWidths(10, 1, 260);
  sh.setColumnWidths(14, 1, 320);
  sh.setColumnWidths(15, 1, 360);
  sh.setColumnWidths(19, 10, 180);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'G5:G500', ['P0', 'P1', 'P2', 'P3']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'F5:F500', ['Actif', 'À produire', 'Planifié', 'PATCH PRÊT', 'OBSOLETE / supprimé — NE PAS INSTALLER', 'DÉCISION FUSION / NE PAS INSTALLER TEL QUEL', 'APPLIQUÉ SHEET LIVE']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'W5:W500', [
    String.fromCodePoint(0x1F7E2) + ' OK',
    String.fromCodePoint(0x1F7E0) + ' À vérifier',
    String.fromCodePoint(0x1F534) + ' DRIFT',
    String.fromCodePoint(0x26AA) + ' NON LIVE',
    String.fromCodePoint(0x26AA) + ' N/A',
    String.fromCodePoint(0x1F7E2) + ' APPLIQUÉ SHEET'
  ]);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:E500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'F5:H500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'S5:AB500');

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condPriority_(sh, 'G5:G500');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condRegistryAlert_(sh, 'W5:W500');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatUiScriptsAudit_(sh) {
  sh.setColumnWidths(1, 1, 220);
  sh.setColumnWidths(2, 1, 320);
  sh.setColumnWidths(3, 1, 180);
  sh.setColumnWidths(4, 1, 260);
  sh.setColumnWidths(5, 1, 180);
  sh.setColumnWidths(6, 1, 180);
  sh.setColumnWidths(7, 1, 260);
  sh.setColumnWidths(8, 1, 110);
  sh.setColumnWidths(9, 1, 90);
  sh.setColumnWidths(10, 1, 260);
  sh.setColumnWidths(11, 1, 280);
  sh.setColumnWidths(12, 1, 260);
  sh.setColumnWidths(13, 1, 380);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'H5:H220', ['Non', 'Oui, après archive', 'Parking']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'I5:I220', ['P0', 'P1', 'P2', 'P3']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'E5:G220');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'J5:K220');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condPriority_(sh, 'I5:I220');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatControles_(sh) {
  // Extend schema only if not already present.
  var headers = ['Type suivi', 'Mode alimentation', 'Onglet cible', 'Script lié', 'Modifiable ?', 'Liste choix', 'Protection'];
  var startCol = 11;
  var current = sh.getRange(4, startCol, 1, headers.length).getValues()[0];
  var needsHeaders = false;
  for (var i = 0; i < headers.length; i++) {
    if (String(current[i] || '') !== headers[i]) needsHeaders = true;
  }
  if (needsHeaders) {
    sh.getRange(4, startCol, 1, headers.length).setValues([headers]);
  }

  sh.setColumnWidths(1, 1, 150);
  sh.setColumnWidths(2, 1, 180);
  sh.setColumnWidths(3, 1, 110);
  sh.setColumnWidths(4, 1, 120);
  sh.setColumnWidths(5, 1, 170);
  sh.setColumnWidths(6, 1, 320);
  sh.setColumnWidths(7, 1, 320);
  sh.setColumnWidths(8, 1, 170);
  sh.setColumnWidths(9, 1, 140);
  sh.setColumnWidths(10, 1, 260);
  sh.setColumnWidths(11, 7, 180);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'C5:C1000', ['INFO', 'DÉCISION', 'ATTENTION', 'BLOQUANT', 'ERREUR']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'I5:I1000', ['Ouvert', 'À faire', 'En cours', 'Corrigé', 'Validé', 'Refusé', 'Archivé']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'K5:K1000', ['Correction', 'Blocage', 'Alerte', 'Historique', 'Décision', 'Contrôle']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'L5:L1000', ['Manuel', 'Script lié', 'Automatique lié', 'Historique']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'O5:O1000', ['Oui', 'Non', 'Notes/statut seulement']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'P5:P1000', ['LISTE_CONNECTÉE', 'LISTE_FERMÉE', 'LIBRE', 'N/A']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'Q5:Q1000', ['Protégé', 'Warning only', 'Non protégé volontaire', 'À faire']);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:F1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'G5:J1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'K5:Q1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condStatus_(sh, 'I5:I1000');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_condSeverity_(sh, 'C5:C1000');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_formatQaRules_(sh) {
  sh.setColumnWidths(1, 1, 130);
  sh.setColumnWidths(2, 1, 160);
  sh.setColumnWidths(3, 1, 420);
  sh.setColumnWidths(4, 1, 260);
  sh.setColumnWidths(5, 1, 220);
  sh.setColumnWidths(6, 1, 100);
  sh.setColumnWidths(7, 1, 130);
  sh.setColumnWidths(8, 1, 120);
  sh.setColumnWidths(9, 1, 320);
  sh.setColumnWidths(10, 1, 150);
  sh.setColumnWidths(11, 1, 160);
  sh.setColumnWidths(12, 1, 300);

  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'F5:F400', ['Info', 'Alerte', 'Erreur', 'Bloquant']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'G5:G400', ['Oui', 'Non', 'TRUE', 'FALSE']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, 'H5:H400', ['Actif', 'À créer', 'Archivé', 'À revoir']);
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'A5:E400');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, 'F5:I400');
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, 'J5:N400');
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_applyClosedList_(sh, a1, values) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sh.getRange(a1).setDataValidation(rule);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorEditable_(sh, a1) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  sh.getRange(a1).setBackground(cfg.COLORS.editableBg);
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_colorReadOnly_(sh, a1) {
  var cfg = FBR_UI_FAMILY_REGISTRY_CORRECTIONS_cfg_();
  sh.getRange(a1).setBackground(cfg.COLORS.readOnlyBg);
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

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_hideBlankRowsSafe_(sh, rows) {
  for (var i = 0; i < rows.length; i++) {
    try {
      sh.hideRows(rows[i]);
    } catch (err) {
      // Non blocking.
    }
  }
}

function FBR_UI_FAMILY_REGISTRY_CORRECTIONS_protectCommon_(sh, lastRow, lastCol) {
  // Warning-only safe protection to avoid locking operators out.
  FBR_UI_FAMILY_REGISTRY_CORRECTIONS_warnProtect_(sh, sh.getRange(1, 1, 4, lastCol), 'UI strict headers protected warning-only');
  if (lastRow >= 5) {
    FBR_UI_FAMILY_REGISTRY_CORRECTIONS_warnProtect_(sh, sh.getRange(5, 1, lastRow - 4, 1), 'UI strict IDs/first column protected warning-only');
  }
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
