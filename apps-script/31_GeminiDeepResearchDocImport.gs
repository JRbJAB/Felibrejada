/**
 * 31_GeminiDeepResearchDocImport.gs
 * Import a manually exported Gemini Deep Research Google Doc.
 * This does NOT automate the Gemini App. It imports a human-created/exported report.
 */

function FELIBREE_importGeminiResearchDocDryRun(docId) {
  return FBR_geminiImportDeepResearchDoc_(docId, false);
}

function FELIBREE_importGeminiResearchDocToStagingApply(docId) {
  return FBR_geminiImportDeepResearchDoc_(docId, true);
}

function FBR_geminiImportDeepResearchDoc_(docId, writeStaging) {
  var cfg = FBR_geminiGetConfig_();
  var id = String(docId || cfg.deepResearchDocId || '').trim();
  if (!id) throw new Error('DOC_ID manquant. Passer FELIBREE_importGeminiResearchDocDryRun("<DOC_ID>") ou définir GEMINI_DEEP_RESEARCH_DOC_ID.');

  var traceId = FBR_geminiTraceId_();
  var doc = DocumentApp.openById(id);
  var text = doc.getBody().getText();
  var urls = FBR_geminiExtractUrlsFromText_(text);
  var rows = [];

  if (!urls.length) {
    rows.push([
      FBR_geminiNow_(), traceId, writeStaging ? 'STAGING_APPLY' : 'DRY_RUN',
      'deep_research_doc_import', 'Google Doc ' + id, 'Gemini App / manual export',
      '', text.slice(0, 2000), '', '', '', 'REJECT_NO_URL',
      FBR_GEMINI.SHEETS.SOURCES, 'Review exported report manually',
      'Aucune URL détectée dans le Doc exporté.', FBR_geminiDigest_(text), FBR_GEMINI_P0_VERSION
    ]);
  } else {
    urls.slice(0, 80).forEach(function(url) {
      rows.push([
        FBR_geminiNow_(), traceId, writeStaging ? 'STAGING_APPLY' : 'DRY_RUN',
        'deep_research_doc_import', 'Google Doc ' + id, 'Gemini App / manual export',
        '', text.slice(0, 2000), 'URL from exported Deep Research Doc', url, '',
        'CANDIDATE_DOC_SOURCE_TO_REVIEW', FBR_GEMINI.SHEETS.SOURCES,
        'Qualify extracted URL before routing',
        'Imported from human-exported Gemini Deep Research Doc.', FBR_geminiDigest_(url), FBR_GEMINI_P0_VERSION
      ]);
    });
  }

  var wrote = 0;
  if (writeStaging) {
    if (!cfg.allowStagingWrite) {
      throw new Error('GEMINI_ALLOW_STAGING_WRITE=TRUE requis pour écrire dans 🧪 IA Staging.');
    }
    wrote = FBR_geminiAppendStagingRows_(rows);
  }

  var message = [
    'Deep Research Doc import ' + (writeStaging ? 'staging APPLY' : 'dry-run') + ' OK',
    'Trace: ' + traceId,
    'Doc ID: ' + id,
    'URLs found: ' + urls.length,
    'Rows staged: ' + wrote
  ].join('\n');

  FBR_geminiLog_('FELIBREE_importGeminiResearchDoc' + (writeStaging ? 'ToStagingApply' : 'DryRun'), writeStaging ? 'STAGING_APPLY' : 'DRY_RUN', 'OK', message, traceId);
  return FBR_geminiResult_(true, 'Gemini Deep Research Doc import', message);
}

function FBR_geminiExtractUrlsFromText_(text) {
  var matches = String(text || '').match(/https?:\/\/[^\s<>)"']+/g) || [];
  var seen = {};
  var out = [];
  matches.forEach(function(u) {
    var clean = u.replace(/[.,;:]+$/, '');
    if (!seen[clean]) {
      seen[clean] = true;
      out.push(clean);
    }
  });
  return out;
}
