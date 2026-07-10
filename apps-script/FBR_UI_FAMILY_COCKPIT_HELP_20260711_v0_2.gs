/**
 * FBR_UI_FAMILY_COCKPIT_HELP_20260711_v0_2.gs
 * UI family: Cockpit + Aide Notice.
 * Scope: formatting and validations only. No external API, no Gemini call, no write outside UI ranges.
 * Important: readiness block in Cockpit is the full 13-column mirror of former "✅ Readiness 11/07".
 */

function FBR_UI_FAMILY_applyCockpitHelpV02() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  FBR_UI_FAMILY_applyCockpitReadinessFullV02_(ss);
  FBR_UI_FAMILY_applyAideNoticeV02_(ss);
}

function FBR_UI_FAMILY_applyCockpitHelpV01() {
  // Backward compatible alias: old master menu can call V01 safely.
  FBR_UI_FAMILY_applyCockpitHelpV02();
}

function FBR_UI_FAMILY_applyCockpitHelp() {
  FBR_UI_FAMILY_applyCockpitHelpV02();
}

function FBR_UI_FAMILY_applyCockpitReadinessFullV02_(ss) {
  var sh = ss.getSheetByName('🎛️ Cockpit');
  if (!sh) throw new Error('Missing sheet: 🎛️ Cockpit');

  // Full readiness block: A37:M54.
  var block = sh.getRange('A37:M54');
  block.setWrap(true).setVerticalAlignment('middle').setFontFamily('Arial').setFontSize(10);

  sh.getRange('A37:M37')
    .merge()
    .setBackground('#0A3D1E')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  sh.getRange('A38:M38')
    .merge()
    .setBackground('#E5F9ED')
    .setFontColor('#073814')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  sh.getRange('B39:M39')
    .merge()
    .setBackground('#E5F9ED')
    .setFontColor('#073814')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sh.getRange('A39')
    .setBackground('#E5F9ED')
    .setFontColor('#073814')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  sh.getRange('A40:M40')
    .setBackground('#1C7A3A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sh.getRange('A41:A54')
    .setBackground('#EFF2F7')
    .setFontColor('#283342')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  sh.getRange('E41:E54')
    .setBackground('#FFF2B7')
    .setFontColor('#6B3A05')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  sh.getRange('G41:G54')
    .setBackground('#E5F7E5')
    .setFontColor('#0A4414')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  sh.getRange('H41:I54')
    .setBackground('#EAE8FC')
    .setFontColor('#281660')
    .setFontWeight('bold');

  var priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['P0 critique', 'P1 haute', 'P2 normale'], true)
    .setAllowInvalid(false)
    .build();

  var readinessRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Prêt', 'À valider', 'À trancher', 'À vérifier', 'À faire', 'À préparer', 'Bloqué'], true)
    .setAllowInvalid(false)
    .build();

  var bureauRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Étienne DUBUISSON', 'Chantal REY', 'Pascal DAUBIGNEY'], true)
    .setAllowInvalid(false)
    .build();

  sh.getRange('D41:D54').setDataValidation(priorityRule);
  sh.getRange('E41:E54').setDataValidation(readinessRule);
  sh.getRange('H41:H54').setDataValidation(bureauRule);

  sh.setColumnWidth(1, 85);
  sh.setColumnWidth(2, 130);
  sh.setColumnWidth(3, 270);
  sh.setColumnWidth(4, 105);
  sh.setColumnWidth(5, 105);
  sh.setColumnWidth(6, 120);
  sh.setColumnWidth(7, 120);
  sh.setColumnWidth(8, 155);
  sh.setColumnWidth(9, 155);
  sh.setColumnWidth(10, 105);
  sh.setColumnWidth(11, 210);
  sh.setColumnWidth(12, 270);
  sh.setColumnWidth(13, 270);

  sh.setRowHeights(37, 4, 36);
  sh.setRowHeights(41, 14, 58);
}

function FBR_UI_FAMILY_applyAideNoticeV02_(ss) {
  var sh = ss.getSheetByName('📘 Aide Notice');
  if (!sh) return;
  sh.hideGridlines();
  sh.setFrozenRows(4);
  sh.getRange('A1:H1')
    .setBackground('#193F99')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(14)
    .setWrap(true);
  sh.getRange('A4:H4')
    .setBackground('#193F99')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setWrap(true);
  sh.autoResizeColumns(1, 8);
}
