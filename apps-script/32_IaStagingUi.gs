/*
 * 32_IaStagingUi.js
 * UI safe layer for 🧪 IA Staging / Gemini review workflow.
 * v0.7.3 — staging only, no business-sheet injection.
 */

var FBR_IA_STAGING_UI = {
  VERSION: 'felibree-ui-ia-staging-v0.7.3-20260710',
  HEADER_ROW: 4,
  FIRST_DATA_ROW: 5,
  LAST_COL: 17,
  COL_TIMESTAMP: 1,
  COL_TRACE: 2,
  COL_MODE: 3,
  COL_TOOL: 4,
  COL_MODEL: 6,
  COL_CITATION_TITLE: 9,
  COL_CITATION_URL: 10,
  COL_CANDIDATE_STATUS: 12,
  COL_TARGET_SHEET: 13,
  COL_ACTION: 14,
  COL_NOTES: 15,
  COL_VERSION: 17,
  STATUS_PRIORITY: 'QA_PRIORITY_REVIEW',
  STATUS_CONTEXT: 'QA_CONTEXT_ONLY',
  STATUS_REJECT: 'QA_REJECT_WEAK_SOURCE'
};

function FBR_iaStagingSheetName_() {
  return String.fromCodePoint(0x1F9EA) + ' IA Staging';
}

function FBR_iaStagingSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(FBR_iaStagingSheetName_());
  if (!sh) throw new Error('Onglet introuvable : ' + FBR_iaStagingSheetName_());
  return sh;
}

function FBR_iaStagingOpen_() {
  var ss = SpreadsheetApp.getActive();
  var sh = FBR_iaStagingSheet_();
  ss.setActiveSheet(sh);
  sh.setFrozenRows(FBR_IA_STAGING_UI.HEADER_ROW);
  return FBR_iaStagingSummary_();
}

function FBR_iaStagingSummary_() {
  var sh = FBR_iaStagingSheet_();
  var lastRow = sh.getLastRow();
  var dataRows = Math.max(0, lastRow - FBR_IA_STAGING_UI.HEADER_ROW);
  var statusCounts = {};
  var toolCounts = {};
  var targetCounts = {};
  var traceCounts = {};
  var urlCount = 0;
  var emptyUrlCount = 0;
  var lastTimestamp = '';

  if (dataRows > 0) {
    var meta = sh.getRange(FBR_IA_STAGING_UI.FIRST_DATA_ROW, 1, dataRows, 7).getDisplayValues();
    var qa = sh.getRange(FBR_IA_STAGING_UI.FIRST_DATA_ROW, 9, dataRows, 9).getDisplayValues();
    for (var i = 0; i < dataRows; i++) {
      var timestamp = meta[i][0] || '';
      var trace = meta[i][1] || 'NO_TRACE';
      var tool = meta[i][3] || 'NO_TOOL';
      var citationUrl = qa[i][1] || '';
      var candidateStatus = qa[i][3] || 'UNCLASSIFIED';
      var targetSheet = qa[i][4] || 'NO_TARGET';

      if (timestamp) lastTimestamp = timestamp;
      if (citationUrl) urlCount++; else emptyUrlCount++;
      statusCounts[candidateStatus] = (statusCounts[candidateStatus] || 0) + 1;
      toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      targetCounts[targetSheet] = (targetCounts[targetSheet] || 0) + 1;
      traceCounts[trace] = (traceCounts[trace] || 0) + 1;
    }
  }

  return {
    status: 'OK',
    uiVersion: FBR_IA_STAGING_UI.VERSION,
    sheet: FBR_iaStagingSheetName_(),
    lastRow: lastRow,
    dataRows: dataRows,
    urlCount: urlCount,
    emptyUrlCount: emptyUrlCount,
    lastTimestamp: lastTimestamp,
    statusCounts: statusCounts,
    toolCounts: toolCounts,
    targetCounts: targetCounts,
    traceCounts: traceCounts,
    warning: 'Staging review only: aucune injection métier depuis cette UI.'
  };
}

function FBR_iaStagingEnsureFilter_() {
  var sh = FBR_iaStagingSheet_();
  var lastRow = Math.max(sh.getLastRow(), FBR_IA_STAGING_UI.HEADER_ROW);
  var filter = sh.getFilter();
  if (!filter) {
    sh.getRange(FBR_IA_STAGING_UI.HEADER_ROW, 1, lastRow - FBR_IA_STAGING_UI.HEADER_ROW + 1, FBR_IA_STAGING_UI.LAST_COL).createFilter();
    filter = sh.getFilter();
  }
  return filter;
}

function FBR_iaStagingFilterByStatus_(status) {
  var sh = FBR_iaStagingSheet_();
  SpreadsheetApp.getActive().setActiveSheet(sh);
  var filter = FBR_iaStagingEnsureFilter_();
  var criteria = SpreadsheetApp.newFilterCriteria().whenTextEqualTo(status).build();
  filter.setColumnFilterCriteria(FBR_IA_STAGING_UI.COL_CANDIDATE_STATUS, criteria);
  SpreadsheetApp.flush();
  var summary = FBR_iaStagingSummary_();
  summary.appliedFilter = status;
  return summary;
}

function FBR_iaStagingClearFilter_() {
  var sh = FBR_iaStagingSheet_();
  SpreadsheetApp.getActive().setActiveSheet(sh);
  var filter = sh.getFilter();
  if (filter) {
    try {
      filter.removeColumnFilterCriteria(FBR_IA_STAGING_UI.COL_CANDIDATE_STATUS);
    } catch (err) {
      // Removing a non-existing criterion can throw in some Sheets states; keep UI resilient.
    }
  }
  SpreadsheetApp.flush();
  var summary = FBR_iaStagingSummary_();
  summary.appliedFilter = 'CLEARED';
  return summary;
}

function FBR_iaStagingCallIfExists_(functionName) {
  var fn = globalThis[functionName];
  if (typeof fn !== 'function') {
    throw new Error('Fonction absente ou non installée : ' + functionName);
  }
  return fn();
}

function FBR_iaStagingGeminiStatus_() {
  return FBR_iaStagingCallIfExists_('FELIBREE_geminiStatus');
}

function FBR_iaStagingGeminiSearchDryRun_() {
  return FBR_iaStagingCallIfExists_('FELIBREE_geminiSearchDryRun');
}

function FBR_iaStagingGeminiSearchApply_() {
  return FBR_iaStagingCallIfExists_('FELIBREE_geminiSearchToStagingApply');
}

function FBR_iaStagingGeminiUrlApply_() {
  return FBR_iaStagingCallIfExists_('FELIBREE_geminiUrlToStagingApply');
}

function FBR_iaStagingAssertNoBusinessApply_() {
  return {
    status: 'OK_SAFE_GUARD',
    message: 'Cette UI ne route pas vers les onglets métier. Elle ouvre, filtre, résume et lance Gemini uniquement vers staging.',
    sheet: FBR_iaStagingSheetName_(),
    sourceApplyAllowed: false,
    uiVersion: FBR_IA_STAGING_UI.VERSION
  };
}

/* Public wrappers for menu items */
function FELIBREE_openIaStaging() { return FBR_iaStagingOpen_(); }
function FELIBREE_iaStagingSummary() { return FBR_iaStagingSummary_(); }
function FELIBREE_iaStagingFilterPriority() { return FBR_iaStagingFilterByStatus_(FBR_IA_STAGING_UI.STATUS_PRIORITY); }
function FELIBREE_iaStagingFilterContext() { return FBR_iaStagingFilterByStatus_(FBR_IA_STAGING_UI.STATUS_CONTEXT); }
function FELIBREE_iaStagingFilterReject() { return FBR_iaStagingFilterByStatus_(FBR_IA_STAGING_UI.STATUS_REJECT); }
function FELIBREE_iaStagingClearFilter() { return FBR_iaStagingClearFilter_(); }
function FELIBREE_iaStagingSafeGuard() { return FBR_iaStagingAssertNoBusinessApply_(); }
