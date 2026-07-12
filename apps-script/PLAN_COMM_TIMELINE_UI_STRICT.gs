/**
 * FBR_PLAN_COMM_TIMELINE_UI_STRICT_20260711_v0_1.gs
 * Module-only: timeline native + vue HTML privée du plan de communication.
 * NO onOpen. NO doGet. NO menu maître. NO external API. NO Gmail. NO Calendar.
 * Source data is read-only: '🎯 Plan Communication 2027'!A5:T25.
 * Only APPLY scope: '🎯 Plan Communication 2027'!A28:T52 (UI/timeline only).
 */

var FBR_PLAN_COMM_TIMELINE_VERSION = 'v0.2.0-html-state-bridge-20260711';
var FBR_PLAN_COMM_TIMELINE_CFG = {
  SHEET_NAME: '🎯 Plan Communication 2027',
  SOURCE_RANGE: 'A5:T25',
  UI_RANGE: 'A28:T52',
  PROPERTY_ALLOW_WRITE: 'FELIBREE_ALLOW_PLAN_COM_UI_WRITE',
  HTML_FILE: 'FBR_PLAN_COMM_TIMELINE_HTML_20260711_v0_1',
  MONTHS: ['Juil. 26','Août 26','Sept. 26','Oct. 26','Nov. 26','Déc. 26','Janv. 27','Fév. 27','Mars 27','Avr. 27','Mai 27','Juin 27','Juil. 27'],
  MAP: {
  "PLAN-COM-001": {
    "start": 0,
    "end": 12
  },
  "PLAN-COM-002": {
    "start": 2,
    "end": 2
  },
  "PLAN-COM-003": {
    "start": 2,
    "end": 5
  },
  "PLAN-COM-004": {
    "start": 3,
    "end": 9
  },
  "PLAN-COM-005": {
    "start": 3,
    "end": 4
  },
  "PLAN-COM-006": {
    "start": 4,
    "end": 4
  },
  "PLAN-COM-007": {
    "start": 4,
    "end": 12
  },
  "PLAN-COM-008": {
    "start": 5,
    "end": 6
  },
  "PLAN-COM-009": {
    "start": 5,
    "end": 11
  },
  "PLAN-COM-010": {
    "start": 6,
    "end": 11
  },
  "PLAN-COM-011": {
    "start": 4,
    "end": 7
  },
  "PLAN-COM-012": {
    "start": 7,
    "end": 8
  },
  "PLAN-COM-013": {
    "start": 8,
    "end": 8
  },
  "PLAN-COM-014": {
    "start": 7,
    "end": 11
  },
  "PLAN-COM-015": {
    "start": 9,
    "end": 9
  },
  "PLAN-COM-016": {
    "start": 9,
    "end": 10
  },
  "PLAN-COM-017": {
    "start": 6,
    "end": 11
  },
  "PLAN-COM-018": {
    "start": 10,
    "end": 11
  },
  "PLAN-COM-019": {
    "start": 11,
    "end": 11
  },
  "PLAN-COM-020": {
    "start": 12,
    "end": 12
  },
  "PLAN-COM-021": {
    "start": 12,
    "end": 12
  }
}
};

function FBR_PLAN_COMM_showTimelineSidebar_() {
  var ui = SpreadsheetApp.getUi();
  var html = HtmlService.createTemplateFromFile(FBR_PLAN_COMM_TIMELINE_CFG.HTML_FILE)
    .evaluate()
    .setTitle('Plan communication — timeline')
    .setWidth(480);
  ui.showSidebar(html);
  return {ok:true, opened:true, version:FBR_PLAN_COMM_TIMELINE_VERSION, mode:'READ_ONLY'};
}

function FBR_PLAN_COMM_showTimelineDialog_() {
  var ui = SpreadsheetApp.getUi();
  var html = HtmlService.createTemplateFromFile(FBR_PLAN_COMM_TIMELINE_CFG.HTML_FILE)
    .evaluate()
    .setWidth(1280)
    .setHeight(760);
  ui.showModelessDialog(html, '🎯 Plan Communication 2027 — timeline');
  return {ok:true, opened:true, version:FBR_PLAN_COMM_TIMELINE_VERSION, mode:'READ_ONLY'};
}

function FBR_PLAN_COMM_getTimelineState_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(FBR_PLAN_COMM_TIMELINE_CFG.SHEET_NAME);
  if (!sh) throw new Error('Onglet introuvable : ' + FBR_PLAN_COMM_TIMELINE_CFG.SHEET_NAME);
  var values = sh.getRange(FBR_PLAN_COMM_TIMELINE_CFG.SOURCE_RANGE).getDisplayValues();
  if (values.length !== 21) throw new Error('Le plan doit contenir exactement 21 axes dans A5:T25. Reçu : ' + values.length);

  var seen = {};
  var items = values.map(function(row, idx) {
    var id = String(row[0] || '').trim();
    if (!FBR_PLAN_COMM_TIMELINE_CFG.MAP[id]) throw new Error('Plan ID non mappé : ' + id + ' (ligne ' + (idx + 5) + ')');
    if (seen[id]) throw new Error('Plan ID dupliqué : ' + id);
    seen[id] = true;
    return {
      id: id,
      phase: row[1],
      period: row[2],
      axis: row[3],
      objective: row[4],
      audience: row[5],
      insight: row[6],
      message: row[7],
      evidence: row[8],
      channels: row[9],
      deliverables: row[10],
      cta: row[11],
      cadence: row[12],
      owner: row[13],
      kpi: row[14],
      source: row[15],
      gate: row[16],
      publication: row[17],
      status: row[18],
      next: row[19],
      start: FBR_PLAN_COMM_TIMELINE_CFG.MAP[id].start,
      end: FBR_PLAN_COMM_TIMELINE_CFG.MAP[id].end
    };
  });

  var counts = {total:items.length, internal:0, readyAfterValidation:0, noGo:0, blockedBornat:0, blockedTechnical:0};
  items.forEach(function(item) {
    if (item.publication === 'NON — INTERNE') counts.internal++;
    if (item.publication === 'OUI APRÈS VALIDATION') counts.readyAfterValidation++;
    if (item.publication === 'NO GO') counts.noGo++;
    if (item.publication === 'BLOQUÉ BORNAT') counts.blockedBornat++;
    if (item.publication === 'BLOQUÉ TECHNIQUE') counts.blockedTechnical++;
  });

  return {
    ok: true,
    version: FBR_PLAN_COMM_TIMELINE_VERSION,
    mode: 'READ_ONLY',
    sheetName: sh.getName(),
    sheetId: sh.getSheetId(),
    spreadsheetUrl: ss.getUrl() + '#gid=' + sh.getSheetId(),
    months: FBR_PLAN_COMM_TIMELINE_CFG.MONTHS,
    counts: counts,
    items: items,
    strict: {
      sourceRange: FBR_PLAN_COMM_TIMELINE_CFG.SOURCE_RANGE,
      applyRange: FBR_PLAN_COMM_TIMELINE_CFG.UI_RANGE,
      property: FBR_PLAN_COMM_TIMELINE_CFG.PROPERTY_ALLOW_WRITE,
      noExternalApi: true,
      noBusinessDataWrite: true,
      noMenuOverride: true,
      noOnOpen: true,
      noDoGet: true
    }
  };
}

function FBR_PLAN_COMM_getTimelineStateJson_() {
  return JSON.stringify(FBR_PLAN_COMM_getTimelineState_()).replace(/</g, '\\u003c');
}

function FBR_PLAN_COMM_uiStrictDryRun_() {
  return FBR_PLAN_COMM_applyUiStrict_(true);
}

function FBR_PLAN_COMM_uiStrictApply_() {
  return FBR_PLAN_COMM_applyUiStrict_(false);
}

function FBR_PLAN_COMM_applyUiStrict_(dryRun) {
  dryRun = dryRun !== false;
  var state = FBR_PLAN_COMM_getTimelineState_();
  var plan = {
    ok: true,
    mode: dryRun ? 'DRY_RUN' : 'APPLY',
    version: FBR_PLAN_COMM_TIMELINE_VERSION,
    sheet: state.sheetName,
    sourceRange: FBR_PLAN_COMM_TIMELINE_CFG.SOURCE_RANGE,
    applyRange: FBR_PLAN_COMM_TIMELINE_CFG.UI_RANGE,
    itemCount: state.items.length,
    externalCalls: 0,
    businessDataWrites: 0
  };
  if (dryRun) return plan;

  var allowed = String(PropertiesService.getScriptProperties().getProperty(FBR_PLAN_COMM_TIMELINE_CFG.PROPERTY_ALLOW_WRITE) || 'FALSE').toUpperCase() === 'TRUE';
  if (!allowed) throw new Error('APPLY refusé. Définir explicitement la propriété ' + FBR_PLAN_COMM_TIMELINE_CFG.PROPERTY_ALLOW_WRITE + '=TRUE, exécuter, puis la remettre à FALSE.');

  var lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    FBR_PLAN_COMM_rebuildTimeline_(state);
    SpreadsheetApp.flush();
    plan.applied = true;
    return plan;
  } finally {
    lock.releaseLock();
  }
}

function FBR_PLAN_COMM_rebuildTimeline_(state) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FBR_PLAN_COMM_TIMELINE_CFG.SHEET_NAME);
  var scope = sh.getRange(FBR_PLAN_COMM_TIMELINE_CFG.UI_RANGE);
  scope.breakApart();
  scope.clearContent();
  scope.clearFormat();

  sh.getRange('A28:T28').merge().setValue('🗓️ TIMELINE INTÉGRÉE — JUILLET 2026 À JUILLET 2027');
  sh.getRange('A29:T29').merge().setValue('La timeline reflète les 21 axes stratégiques. Les marqueurs sont fixes par période ; les couleurs suivent l’autorisation de publication et les blocages.');
  sh.getRange('A30').setValue('Légende');
  sh.getRange('B30:T30').merge().setValue('■ Gris : interne  |  ■ Bleu : publiable après validation  |  ■ Jaune : accord/validation requis  |  ■ Rouge : NO GO ou blocage Bornat  |  ■ Orange : blocage technique');

  var headers = ['Plan ID','Axe / campagne'].concat(state.months).concat(['Publication','Statut','Responsable','Gate / dépendances','Prochaine action']);
  sh.getRange(31, 1, 1, 20).setValues([headers]);

  var rows = state.items.map(function(item) {
    var timeline = state.months.map(function(_, i) { return i >= item.start && i <= item.end ? '■' : ''; });
    return [item.id, item.axis].concat(timeline).concat([item.publication, item.status, item.owner, item.gate, item.next]);
  });
  sh.getRange(32, 1, rows.length, 20).setValues(rows);

  var navy = '#153957', blue = '#1E6FB5', gray = '#7B8797', yellow = '#E0B02D', red = '#B92229', orange = '#E96B14';
  sh.getRange('A28:T28').setBackground(navy).setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(14).setVerticalAlignment('middle');
  sh.getRange('A29:T29').setBackground('#EDF4FA').setFontColor('#142E49').setFontStyle('italic').setWrap(true);
  sh.getRange('A30:T30').setBackground('#FAF7E8').setFontColor('#443B1E').setFontWeight('bold').setWrap(true);
  sh.getRange('A31:T31').setBackground('#27618E').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  sh.getRange('C31:O31').setTextRotation(90);
  sh.getRange('A32:T52').setFontFamily('Arial').setFontSize(9).setVerticalAlignment('middle').setWrap(true);
  sh.getRange('A32:A52').setBackground('#EFF4F8').setFontColor('#193A57').setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange('B32:B52').setFontWeight('bold');
  sh.getRange('C32:O52').setBackground('#F2F4F7').setHorizontalAlignment('center').setFontWeight('bold').setFontSize(12).setFontColor('#FFFFFF');
  sh.getRange('P32:Q52').setFontWeight('bold').setHorizontalAlignment('center');

  state.items.forEach(function(item, idx) {
    var row = 32 + idx;
    var color = blue;
    var font = '#FFFFFF';
    if (item.publication === 'NON — INTERNE') color = gray;
    if (item.publication === 'NO GO' || item.publication === 'BLOQUÉ BORNAT') color = red;
    if (item.publication === 'BLOQUÉ TECHNIQUE') color = orange;
    if (item.publication === 'NON AVANT ACCORD' || item.publication === 'NON AVANT VALIDATION' || item.publication === 'NON AVANT VALIDATION OPÉRATIONNELLE') { color = yellow; font = '#2D2404'; }
    sh.getRange(row, 3 + item.start, 1, item.end - item.start + 1).setBackground(color).setFontColor(font);
  });

  sh.setRowHeight(28, 36);
  sh.setRowHeights(29, 2, 34);
  sh.setRowHeight(31, 78);
  sh.setRowHeights(32, 21, 54);
  sh.getRange('A28').setNote('Généré par ' + FBR_PLAN_COMM_TIMELINE_VERSION + '. APPLY limité à ' + FBR_PLAN_COMM_TIMELINE_CFG.UI_RANGE + '.');
}

function FBR_PLAN_COMM_colorForPublication_(publication) {
  if (publication === 'NON — INTERNE') return 'internal';
  if (publication === 'OUI APRÈS VALIDATION') return 'ready';
  if (publication === 'NO GO' || publication === 'BLOQUÉ BORNAT') return 'danger';
  if (publication === 'BLOQUÉ TECHNIQUE') return 'technical';
  return 'warning';
}
