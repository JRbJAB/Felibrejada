/**
 * Carte mentale Communication Félibrée 2027 — plein écran.
 * Aucun onOpen, aucun menu maître, aucun appel externe, aucune écriture Sheet.
 */

var FBR_CARTE_MENTALE_COM_VERSION = 'v0.1.1-safe-20260711';

var FBR_CARTE_MENTALE_COM_HTML_CANDIDATES = [
  'FBR_CARTE_MENTALE_COM_2027_HTML',
  'carte_mentale_communication_felibree_2027_FORMAT_FIGE',
  'CARTE_MENTALE_COM_2027_FORMAT_FIGE'
];

function FELIBREE_openCarteMentaleComFullscreen() {
  return FBR_CARTE_MENTALE_COM_showFullscreenDialog_();
}

function FBR_CARTE_MENTALE_COM_showFullscreenDialog_() {
  var htmlFile = FBR_CARTE_MENTALE_COM_resolveHtmlFile_();

  var html = HtmlService
    .createHtmlOutputFromFile(htmlFile)
    .setTitle('🧠 Carte mentale COM — Félibrée 2027')
    .setWidth(1200)
    .setHeight(900);

  SpreadsheetApp.getUi().showModelessDialog(
    html,
    '🧠 Carte mentale COM — Félibrée 2027'
  );

  return {
    ok: true,
    version: FBR_CARTE_MENTALE_COM_VERSION,
    htmlFile: htmlFile,
    mode: 'MODELLESS_DIALOG',
    externalCall: false,
    sheetWrite: false
  };
}

function FELIBREE_carteMentaleComDiagnostic() {
  var result = {
    ok: true,
    version: FBR_CARTE_MENTALE_COM_VERSION,
    candidates: FBR_CARTE_MENTALE_COM_HTML_CANDIDATES,
    found: null,
    missing: []
  };

  for (var i = 0; i < FBR_CARTE_MENTALE_COM_HTML_CANDIDATES.length; i++) {
    var name = FBR_CARTE_MENTALE_COM_HTML_CANDIDATES[i];
    try {
      HtmlService.createHtmlOutputFromFile(name);
      result.found = name;
      Logger.log(JSON.stringify(result, null, 2));
      return result;
    } catch (err) {
      result.missing.push(name);
    }
  }

  result.ok = false;
  result.error =
    'Aucun fichier HTML Apps Script trouvé. Créer un fichier HTML nommé exactement FBR_CARTE_MENTALE_COM_2027_HTML, sans .html, puis coller le HTML figé.';
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function FBR_CARTE_MENTALE_COM_resolveHtmlFile_() {
  for (var i = 0; i < FBR_CARTE_MENTALE_COM_HTML_CANDIDATES.length; i++) {
    var name = FBR_CARTE_MENTALE_COM_HTML_CANDIDATES[i];
    try {
      HtmlService.createHtmlOutputFromFile(name);
      return name;
    } catch (err) {
      // continue
    }
  }

  throw new Error(
    'Aucun fichier HTML Apps Script trouvé. Créer un fichier HTML nommé exactement FBR_CARTE_MENTALE_COM_2027_HTML, sans .html.'
  );
}