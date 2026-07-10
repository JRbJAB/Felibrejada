/**
 * 28_GeminiGroundedSearch.gs
 * Search-grounded Gemini calls using the Interactions API.
 */

function FELIBREE_geminiSearchDryRun(prompt) {
  return FBR_geminiRunSearch_(prompt, false);
}

function FELIBREE_geminiSearchToStagingApply(prompt) {
  return FBR_geminiRunSearch_(prompt, true);
}

function FBR_geminiRunSearch_(prompt, writeStaging) {
  var cfg = FBR_geminiRequireApiKey_();
  var traceId = FBR_geminiTraceId_();
  var input = String(prompt || cfg.defaultSearchPrompt || FBR_GEMINI.DEFAULT_SEARCH_PROMPT).trim();

  var response = FBR_geminiInteractionsCall_(cfg, input, [{type: 'google_search'}]);
  var parsed = FBR_geminiParseInteractionResponse_(response);

  var rows = FBR_geminiBuildStagingRows_({
    traceId: traceId,
    mode: writeStaging ? 'STAGING_APPLY' : 'DRY_RUN',
    tool: 'google_search',
    prompt: input,
    model: cfg.model,
    parsed: parsed,
    raw: response,
    targetSheet: FBR_GEMINI.SHEETS.SOURCES,
    action: 'Review citations, qualify sources, then route manually'
  });

  var wrote = 0;
  if (writeStaging) {
    if (!cfg.allowStagingWrite) {
      throw new Error('GEMINI_ALLOW_STAGING_WRITE=TRUE requis pour écrire dans 🧪 IA Staging.');
    }
    wrote = FBR_geminiAppendStagingRows_(rows);
  }

  var message = [
    'Gemini Search ' + (writeStaging ? 'staging APPLY' : 'dry-run') + ' OK',
    'Trace: ' + traceId,
    'Model: ' + cfg.model,
    'Citations: ' + parsed.citations.length,
    'Queries: ' + parsed.searchQueries.join(' | '),
    'Rows staged: ' + wrote,
    '',
    parsed.text.slice(0, 1800)
  ].join('\n');

  FBR_geminiLog_('FELIBREE_geminiSearch' + (writeStaging ? 'ToStagingApply' : 'DryRun'), writeStaging ? 'STAGING_APPLY' : 'DRY_RUN', 'OK', message, traceId);
  return FBR_geminiResult_(true, 'Gemini Search', message);
}

function FBR_geminiInteractionsCall_(cfg, input, tools) {
  var payload = {
    model: cfg.model,
    input: input,
    tools: tools || []
  };

  var res = UrlFetchApp.fetch(FBR_GEMINI.ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-goog-api-key': cfg.apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('Gemini API HTTP ' + code + ': ' + body.slice(0, 2000));
  }
  return JSON.parse(body);
}
