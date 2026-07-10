/**
 * FBR_AIDE_NOTICE_STATIC_FIRST_MODULE_v0_4.gs
 * Module-only Aide Notice static-first.
 * IMPORTANT: no onOpen(), no master menu, no FBR_onOpen(), no FBR_showSidebar_ override.
 * Intended integration: call FBR_HELP_STATIC_showSidebar_() from the existing live menu/controller.
 * Gemini remains optional and OFF by default.
 */

var FBR_HELP_STATIC_MODULE_VERSION = 'v0.4.0-module-only-20260711';

function FBR_HELP_STATIC_showSidebar_() {
  var ui = FBR_HELP_STATIC_safeUi_();
  if (!ui) {
    Logger.log('UI unavailable. Open the bound Google Sheet and use the existing Felibree menu.');
    return { ok: false, reason: 'UI_UNAVAILABLE' };
  }
  var html = HtmlService.createTemplateFromFile('FBR_AIDE_NOTICE_STATIC_FIRST_MODULE_v0_4_HTML')
    .evaluate()
    .setTitle('Aide Notice — statique d’abord')
    .setWidth(420);
  ui.showSidebar(html);
  return { ok: true, opened: true, version: FBR_HELP_STATIC_MODULE_VERSION };
}

function FBR_HELP_STATIC_getState_() {
  var status = FBR_HELP_STATIC_getGeminiStatus_();
  return {
    ok: true,
    version: FBR_HELP_STATIC_MODULE_VERSION,
    policy: 'Aide statique et FAQ d’abord. Gemini optionnel, désactivé par défaut.',
    integration: 'MODULE_ONLY_NO_MENU_NO_ONOPEN',
    gemini: status,
    usage: [
      'Le PV capte.',
      'Décisions arbitre.',
      'Actions exécute.',
      'CRM référence.',
      'Accès sécurise.',
      'Cockpit pilote.'
    ],
    forbidden: [
      'Ne pas définir onOpen dans ce module.',
      'Ne pas créer de menu maître parallèle.',
      'Ne pas écraser FBR_onOpen / FBR_showSidebar_ existants.',
      'Ne pas écrire dans le Sheet automatiquement.',
      'Ne pas publier, envoyer, acheter, créer ou appeler une API externe sans validation.'
    ]
  };
}

function FBR_HELP_STATIC_diagnosticLogOnly_() {
  var state = FBR_HELP_STATIC_getState_();
  Logger.log(JSON.stringify(state, null, 2));
  return state;
}

function FBR_HELP_STATIC_safeUi_() {
  try {
    return SpreadsheetApp.getUi();
  } catch (err) {
    Logger.log('Spreadsheet UI unavailable in this context: ' + err);
    return null;
  }
}

function FBR_HELP_STATIC_getGeminiStatus_() {
  var props = PropertiesService.getScriptProperties();
  var enabled = String(props.getProperty('FBR_GEMINI_HELP_ENABLED') || 'FALSE').toUpperCase() === 'TRUE';
  var apiKey = props.getProperty('FBR_GEMINI_API_KEY') || '';
  var model = props.getProperty('FBR_GEMINI_MODEL') || 'gemini-2.5-flash';
  return {
    enabled: enabled,
    hasKey: apiKey.length > 0,
    model: model,
    canCallGemini: enabled && apiKey.length > 0,
    mode: enabled && apiKey.length > 0 ? 'OPTIONAL_ENABLED' : 'STATIC_ONLY_DEFAULT'
  };
}

function FBR_HELP_STATIC_dryRunGemini_(question) {
  return {
    ok: true,
    mode: 'DRY_RUN',
    calledGemini: false,
    prompt: FBR_HELP_STATIC_buildPrompt_(question || '')
  };
}

function FBR_HELP_STATIC_askGeminiOptional_(question) {
  var status = FBR_HELP_STATIC_getGeminiStatus_();
  if (!status.canCallGemini) {
    return {
      ok: false,
      mode: 'STATIC_ONLY_DEFAULT',
      calledGemini: false,
      answer: 'Gemini est désactivé par défaut. Utiliser d’abord la notice statique / FAQ.'
    };
  }

  var props = PropertiesService.getScriptProperties();
  var endpoint = props.getProperty('FBR_GEMINI_ENDPOINT') || FBR_HELP_STATIC_defaultGeminiEndpoint_(status.model);
  var apiKey = props.getProperty('FBR_GEMINI_API_KEY');
  var payload = {
    contents: [{ role: 'user', parts: [{ text: FBR_HELP_STATIC_buildPrompt_(question || '') }] }],
    generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 700 }
  };

  var response = UrlFetchApp.fetch(endpoint + '?key=' + encodeURIComponent(apiKey), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var code = response.getResponseCode();
  var text = response.getContentText();
  if (code < 200 || code >= 300) {
    return { ok: false, calledGemini: true, statusCode: code, answer: 'Erreur Gemini API.', raw: text.slice(0, 1200) };
  }
  var json = JSON.parse(text);
  var answer = '';
  try {
    answer = json.candidates[0].content.parts[0].text || '';
  } catch (err) {
    answer = 'Réponse Gemini reçue mais format inattendu.';
  }
  return { ok: true, calledGemini: true, statusCode: code, answer: answer };
}

function FBR_HELP_STATIC_defaultGeminiEndpoint_(model) {
  return 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
}

function FBR_HELP_STATIC_buildPrompt_(question) {
  return [
    'Tu es l’aide interne du pilotage Félibrée 2027.',
    'Politique stricte : aide statique et FAQ d’abord ; Gemini est optionnel.',
    'Tu réponds uniquement sur le fonctionnement du Sheet, des onglets, de la propagation, du lexique et du process validé.',
    'Tu ne modifies rien, tu ne publies rien, tu ne crées aucun domaine/page/email, tu ne déclenches aucune API externe.',
    'Si l’information manque ou n’est pas validée, réponds : "Information non validée — vérifier dans les onglets sources ou auprès du bureau."',
    '',
    'Règle projet : Le PV capte, Décisions arbitre, Actions exécute, CRM référence, Accès sécurise, Cockpit pilote.',
    'Décision validée => propagation obligatoire vers les onglets concernés.',
    'Dry run = simulation sans action réelle.',
    '',
    'Question utilisateur :',
    String(question || '').trim()
  ].join('\n');
}
