/**
 * 30_GeminiResearchParser.gs
 * Parse Interactions API responses into staging rows and QA reports.
 */

function FELIBREE_geminiQaStaging() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(FBR_GEMINI.SHEETS.STAGING);
  if (!sh) return FBR_geminiResult_(false, 'QA staging', 'Onglet 🧪 IA Staging absent.');

  var last = sh.getLastRow();
  if (last < 5) return FBR_geminiResult_(true, 'QA staging', 'Aucune ligne de staging à contrôler.');

  var values = sh.getRange(5, 1, last - 4, 17).getValues();
  var errors = [];
  var warnings = [];
  values.forEach(function(r, idx) {
    var rowNum = idx + 5;
    var tool = r[3];
    var url = r[9];
    var status = r[11];
    if (!url && String(tool).indexOf('google_search') >= 0) {
      errors.push('L' + rowNum + ' : citation URL manquante.');
    }
    if (String(status).indexOf('REJECT') >= 0) {
      warnings.push('L' + rowNum + ' : statut ' + status);
    }
    if (url && String(url).match(/sudouest|francebleu/i) && String(status).indexOf('PAYWALL') < 0) {
      warnings.push('L' + rowNum + ' : vérifier accès/presse/paywall ' + url);
    }
  });

  var message = [
    'QA Gemini staging',
    'Rows: ' + values.length,
    'Errors: ' + errors.length,
    'Warnings: ' + warnings.length,
    '',
    errors.concat(warnings).slice(0, 40).join('\n')
  ].join('\n');

  FBR_geminiLog_('FELIBREE_geminiQaStaging', 'QA', errors.length ? 'ERROR' : 'OK', message, 'GEMINI_QA');
  return FBR_geminiResult_(errors.length === 0, 'QA Gemini staging', message);
}

function FBR_geminiParseInteractionResponse_(response) {
  var out = {
    text: '',
    citations: [],
    searchQueries: [],
    rawStepTypes: []
  };

  var steps = response && response.steps ? response.steps : [];
  steps.forEach(function(step) {
    out.rawStepTypes.push(step.type || '');
    if (step.type === 'google_search_call' && step.arguments && step.arguments.queries) {
      out.searchQueries = out.searchQueries.concat(step.arguments.queries);
    }
    if (step.type === 'model_output' && step.content) {
      step.content.forEach(function(block) {
        if (block.type === 'text') {
          var text = block.text || '';
          if (text) out.text += (out.text ? '\n\n' : '') + text;
          var annotations = block.annotations || [];
          annotations.forEach(function(a) {
            if (a.type === 'url_citation') {
              var start = a.start_index !== undefined ? a.start_index : a.startIndex;
              var end = a.end_index !== undefined ? a.end_index : a.endIndex;
              var citedText = '';
              if (typeof start === 'number' && typeof end === 'number') {
                citedText = text.substring(start, end);
              }
              out.citations.push({
                title: a.title || '',
                url: a.url || '',
                start: start,
                end: end,
                citedText: citedText
              });
            }
          });
        }
      });
    }
  });

  if (!out.text && response.output_text) out.text = response.output_text;
  return out;
}

function FBR_geminiBuildStagingRows_(args) {
  var parsed = args.parsed || {text: '', citations: [], searchQueries: []};
  var rawDigest = FBR_geminiDigest_(args.raw || {});
  var now = FBR_geminiNow_();
  var base = [
    now,
    args.traceId,
    args.mode,
    args.tool,
    args.prompt,
    args.model,
    (parsed.searchQueries || []).join(' | '),
    parsed.text,
    '', '', '',
    '',
    args.targetSheet || FBR_GEMINI.SHEETS.SOURCES,
    args.action || 'Review',
    '',
    rawDigest,
    FBR_GEMINI_P0_VERSION
  ];

  if (!parsed.citations || !parsed.citations.length) {
    var r = base.slice();
    r[11] = 'REJECT_NO_CITATION';
    r[14] = 'Aucune citation URL retournée par Gemini. Ne pas injecter.';
    return [r];
  }

  return parsed.citations.map(function(c) {
    var r = base.slice();
    r[8] = c.title || '';
    r[9] = c.url || '';
    r[10] = c.citedText || '';
    r[11] = c.url ? 'CANDIDATE_TO_REVIEW' : 'REJECT_NO_URL';
    r[14] = 'Citation Gemini à qualifier avant usage métier.';
    return r;
  });
}
