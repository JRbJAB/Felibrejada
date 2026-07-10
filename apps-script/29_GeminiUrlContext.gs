/**
 * 29_GeminiUrlContext.gs
 * URL Context calls for public URLs already validated or to qualify.
 */

function FELIBREE_geminiUrlContextDryRun(urls, instruction) {
  return FBR_geminiRunUrlContext_(urls, instruction, false);
}

function FELIBREE_geminiUrlContextToStagingApply(urls, instruction) {
  return FBR_geminiRunUrlContext_(urls, instruction, true);
}

function FBR_geminiRunUrlContext_(urls, instruction, writeStaging) {
  var cfg = FBR_geminiRequireApiKey_();
  var traceId = FBR_geminiTraceId_();
  var urlList = FBR_geminiNormalizeUrlInput_(urls);
  if (!urlList.length) urlList = FBR_GEMINI.DEFAULT_URLS.slice(0, 7);
  if (urlList.length > 20) throw new Error('URL Context limite : 20 URLs maximum par appel.');

  var input = [
    instruction || 'Analyse ces URL publiques pour le projet Felibrejada/Félibrée. Extrais les informations utiles, contacts, agendas, preuves, risques, et citations. Ne conclus rien sans source.',
    '',
    'URLs:',
    urlList.join('\n')
  ].join('\n');

  var response = FBR_geminiInteractionsCall_(cfg, input, [{type: 'url_context'}]);
  var parsed = FBR_geminiParseInteractionResponse_(response);

  var rows = FBR_geminiBuildStagingRows_({
    traceId: traceId,
    mode: writeStaging ? 'STAGING_APPLY' : 'DRY_RUN',
    tool: 'url_context',
    prompt: input,
    model: cfg.model,
    parsed: parsed,
    raw: response,
    targetSheet: FBR_GEMINI.SHEETS.SOURCES,
    action: 'Review extracted facts and route to Sources/Presse/Site/CRM'
  });

  var wrote = 0;
  if (writeStaging) {
    if (!cfg.allowStagingWrite) {
      throw new Error('GEMINI_ALLOW_STAGING_WRITE=TRUE requis pour écrire dans 🧪 IA Staging.');
    }
    wrote = FBR_geminiAppendStagingRows_(rows);
  }

  var message = [
    'Gemini URL Context ' + (writeStaging ? 'staging APPLY' : 'dry-run') + ' OK',
    'Trace: ' + traceId,
    'Model: ' + cfg.model,
    'URLs: ' + urlList.length,
    'Citations: ' + parsed.citations.length,
    'Rows staged: ' + wrote,
    '',
    parsed.text.slice(0, 1800)
  ].join('\n');

  FBR_geminiLog_('FELIBREE_geminiUrlContext' + (writeStaging ? 'ToStagingApply' : 'DryRun'), writeStaging ? 'STAGING_APPLY' : 'DRY_RUN', 'OK', message, traceId);
  return FBR_geminiResult_(true, 'Gemini URL Context', message);
}

function FBR_geminiNormalizeUrlInput_(urls) {
  if (!urls) return [];
  if (Array.isArray(urls)) return urls.map(String).map(function(s) { return s.trim(); }).filter(Boolean);
  return String(urls).split(/[\n,;]+/).map(function(s) { return s.trim(); }).filter(Boolean);
}
