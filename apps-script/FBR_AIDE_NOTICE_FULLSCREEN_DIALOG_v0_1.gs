/**
 * FBR_AIDE_NOTICE_FULLSCREEN_DIALOG_v0_1.gs
 * Felibrejada — Aide Notice plein écran en fenêtre Google Sheets.
 *
 * Règles :
 * - Aucun onOpen.
 * - Aucun doGet.
 * - Aucun FBR_MENU_MASTER.
 * - Aucun appel externe.
 * - Aucune écriture Sheet.
 * - Ouvre uniquement le HTML d'aide en boîte modeless 1200x900.
 */

var FBR_HELP_STATIC_FULLSCREEN_VERSION = 'v0.1.0-20260710';
var FBR_HELP_STATIC_FULLSCREEN_HTML_FILE = 'FBR_AIDE_NOTICE_FULL_HTML_v0_5_2_EXPANDED_SAFE';

function FBR_HELP_STATIC_showFullscreenDialog_() {
  var html = HtmlService
    .createHtmlOutputFromFile(FBR_HELP_STATIC_FULLSCREEN_HTML_FILE)
    .setTitle('📘 Aide Notice — plein écran')
    .setWidth(1200)
    .setHeight(900);

  SpreadsheetApp.getUi().showModelessDialog(html, '📘 Aide Notice — plein écran');

  return {
    ok: true,
    mode: 'MODELESS_DIALOG',
    version: FBR_HELP_STATIC_FULLSCREEN_VERSION,
    htmlFile: FBR_HELP_STATIC_FULLSCREEN_HTML_FILE,
    width: 1200,
    height: 900,
    externalCall: false,
    sheetWrite: false
  };
}

function FBR_HELP_STATIC_fullscreenDiagnostic_() {
  var result = {
    ok: true,
    mode: 'DIAGNOSTIC_ONLY',
    version: FBR_HELP_STATIC_FULLSCREEN_VERSION,
    htmlFile: FBR_HELP_STATIC_FULLSCREEN_HTML_FILE,
    expectedPublicWrapper: 'FELIBREE_openAideNoticeFullscreen',
    expectedSidebarAction: 'open-aide-notice-fullscreen',
    externalCall: false,
    sheetWrite: false
  };
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
