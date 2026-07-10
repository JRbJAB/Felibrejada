/**
 * FBR_AIDE_NOTICE_FULL_MODULE_v0_5_2_EXPANDED_SAFE.gs
 * Aide Notice complète static-first — version SAFE.
 * Aucun onOpen, aucun menu maître, aucun appel externe, aucune écriture Sheet.
 * Compatible avec le menu existant via FELIBREE_openAideNotice -> FBR_HELP_STATIC_showSidebar_().
 */

var FBR_HELP_STATIC_MODULE_VERSION = 'v0.5.2-full-html-expanded-safe-20260710';

function FBR_HELP_STATIC_showSidebar_() {
  var html = HtmlService.createHtmlOutputFromFile('FBR_AIDE_NOTICE_FULL_HTML_v0_5_2_EXPANDED_SAFE')
    .setTitle('📘 Aide Notice complète')
    .setWidth(720);
  SpreadsheetApp.getUi().showSidebar(html);
  return FBR_HELP_STATIC_getState_();
}

function FBR_HELP_STATIC_getState_() {
  return {
    ok: true,
    version: FBR_HELP_STATIC_MODULE_VERSION,
    mode: 'FULL_HTML_STATIC_FIRST_SAFE',
    externalCall: false,
    sheetWrite: false,
    menuMaster: false,
    onOpenDefinedHere: false,
    htmlFile: 'FBR_AIDE_NOTICE_FULL_HTML_v0_5_2_EXPANDED_SAFE'
  };
}

function FBR_HELP_STATIC_diagnosticLogOnly_() {
  var state = FBR_HELP_STATIC_getState_();
  Logger.log(JSON.stringify(state, null, 2));
  return state;
}

function FBR_HELP_STATIC_buildPrompt_(question) {
  return [
    'Aide Notice Felibrejada — mode dry-run uniquement.',
    'Répondre uniquement depuis la notice, les règles projet et les onglets documentés.',
    'Ne jamais proposer de création externe, achat, publication, email ou écriture automatique.',
    'Question : ' + (question || '')
  ].join('\n');
}

function FBR_HELP_STATIC_dryRunGemini_(question) {
  return {
    ok: true,
    mode: 'DRY_RUN_ONLY_NO_EXTERNAL_CALL',
    version: FBR_HELP_STATIC_MODULE_VERSION,
    prompt: FBR_HELP_STATIC_buildPrompt_(question || '')
  };
}

function FBR_HELP_STATIC_askGeminiOptional_(question) {
  return {
    ok: false,
    mode: 'DISABLED_IN_V0_5_2_EXPANDED_SAFE',
    version: FBR_HELP_STATIC_MODULE_VERSION,
    message: 'Gemini est documenté mais désactivé dans cette aide complète. Utiliser dry-run uniquement.',
    dryRun: FBR_HELP_STATIC_dryRunGemini_(question || '')
  };
}
