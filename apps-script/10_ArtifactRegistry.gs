/**
 * Registre canonique Releases / Backups / Exports.
 * Une ligne = un objet logique unique.
 * Aucun onglet temporaire n'est créé.
 */

var FBR_ARTIFACT = {
  VERSION: 'v1.0.0-20260714',
  CLASSES: ['RELEASE', 'BACKUP_SCRIPT', 'BACKUP_SHEET', 'PACK', 'LIVRABLE', 'DOCUMENTATION', 'EXPORT', 'MIRROR_GITHUB_SEUL', 'SNAPSHOT', 'ARCHIVE'],
  STATUSES: ['CANONIQUE', 'VALIDÉ_LIVE', 'PRÊT_NON_LIVE', 'PARTIEL', 'À_REVOIR', 'REMPLACÉ', 'ARCHIVÉ', 'À_PURGER', 'ERREUR'],
  CONSERVATION: ['PERMANENTE', '30_DERNIERS', 'JALON', 'LEGACY_À_REVOIR', 'PURGE_APRÈS_REVUE'],
  CANONICAL: ['OUI', 'NON', 'À DÉTERMINER'],
  TITLE: '📦 Releases & Backups — registre unique des releases, sauvegardes, exports et livrables',
  RULE: 'Une ligne = un objet logique unique. Drive et GitHub d’une même sauvegarde restent sur la même ligne. Aucun lien local temporaire n’est canonique.'
};

function FELIBREE_mergeExportsIntoReleasesDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_mergeExportsIntoReleasesDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function (context) {
    return FBR_mergeExportsIntoReleases_(true, context.traceId);
  });
}

function FELIBREE_mergeExportsIntoReleasesApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_mergeExportsIntoReleasesApply',
    mode: 'APPLY_PROTECTED',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function (context) {
    if (!FBR_getScriptBool_(FBR.PROP.ALLOW_ARTIFACT_MERGE_WRITE, false)) {
      throw new Error('Fusion bloquée : ajouter propriété script ' + FBR.PROP.ALLOW_ARTIFACT_MERGE_WRITE + '=TRUE.');
    }
    return FBR_mergeExportsIntoReleases_(false, context.traceId);
  });
}

function FELIBREE_verifyExportsRetirement() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_verifyExportsRetirement',
    mode: 'READ_ONLY',
    sheetName: FBR.SHEETS.RELEASES,
    logSuccess: false
  }, function () {
    return FBR_verifyArtifactRegistry_(true);
  });
}

function FELIBREE_retireExportsApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_retireExportsApply',
    mode: 'DELETE_PROTECTED',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function () {
    if (!FBR_getScriptBool_(FBR.PROP.ALLOW_EXPORTS_RETIREMENT, false)) {
      throw new Error('Suppression bloquée : ajouter propriété script ' + FBR.PROP.ALLOW_EXPORTS_RETIREMENT + '=TRUE.');
    }
    var verify = FBR_verifyArtifactRegistry_(false);
    if (!verify.ok) throw new Error('Retraite refusée : ' + verify.details);
    var legacy = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
    if (!legacy) return FBR_result_(true, 'Exports déjà retiré', 'Aucun onglet legacy présent.');
    FBR_ss_().deleteSheet(legacy);
    return FBR_result_(true, 'Exports retiré', 'Onglet legacy supprimé après gates OK.');
  });
}

function FELIBREE_restoreArtifactMergeSnapshot() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_restoreArtifactMergeSnapshot',
    mode: 'ROLLBACK_PROTECTED',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function () {
    if (!FBR_getScriptBool_(FBR.PROP.ALLOW_ARTIFACT_MERGE_WRITE, false)) {
      throw new Error('Rollback bloqué : ajouter propriété script ' + FBR.PROP.ALLOW_ARTIFACT_MERGE_WRITE + '=TRUE.');
    }
    return FBR_restoreArtifactSnapshot_();
  });
}

function FBR_ensureArtifactRegistrySheet_() {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var headers = FBR.ADMIN_HEADERS.RELEASES;
  sheet.getRange(1, 1).setValue(FBR_ARTIFACT.TITLE);
  sheet.getRange(2, 1).setValue(FBR_ARTIFACT.RULE);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers]);
  FBR_applyArtifactRegistryUi_(sheet);
}

function FBR_applyArtifactRegistryUi_(sheet) {
  sheet = sheet || FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var maxCols = FBR.ADMIN_HEADERS.RELEASES.length;
  var lastRow = Math.max(sheet.getLastRow(), 5);

  sheet.getRange(1, 1, 1, maxCols)
    .setBackground('#174F4A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(15)
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 34);

  sheet.getRange(2, 1, 1, maxCols)
    .setBackground('#E8F0EF')
    .setFontColor('#334155')
    .setFontStyle('italic')
    .setWrap(true);
  sheet.setRowHeight(2, 34);

  sheet.getRange(3, 1, 1, maxCols).setBackground('#F8FAFC').setFontWeight('bold');
  FBR_refreshArtifactKpis_(sheet);

  sheet.getRange(4, 1, 1, maxCols)
    .setBackground('#2F766F')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(4, 38);
  sheet.setFrozenRows(4);
  sheet.setFrozenColumns(2);

  var widths = [135, 135, 145, 300, 180, 145, 300, 300, 230, 140, 260, 320, 220, 155, 145, 190, 170, 160, 230, 270];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.hideColumns(18, 3);

  var body = sheet.getRange(5, 1, Math.max(1, lastRow - 4), maxCols);
  body.setVerticalAlignment('top').setWrap(true);
  sheet.getRange(5, 2, Math.max(1, lastRow - 4), 1).setNumberFormat('yyyy-MM-dd HH:mm:ss');

  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(4, 1, Math.max(2, lastRow - 3), maxCols).createFilter();

  FBR_setArtifactValidations_(sheet, Math.max(lastRow + 100, 200));
  FBR_setArtifactConditionalFormatting_(sheet, Math.max(lastRow + 100, 200));
  FBR_compactArtifactGrid_(sheet, 200, maxCols);
}

function FBR_refreshArtifactKpis_(sheet) {
  sheet.getRange('A3:T3').clearContent();
  var kpis = [
    ['Total', '=MAX(0,COUNTA(A5:A))'],
    ['Canoniques', '=COUNTIF(O5:O,"OUI")'],
    ['À revoir', '=COUNTIF(F5:F,"À_REVOIR")'],
    ['À purger', '=COUNTIF(F5:F,"À_PURGER")'],
    ['Doublons ID', '=SUMPRODUCT((A5:A<>"")*(COUNTIF(A5:A,A5:A)>1))'],
    ['Doublons clé', '=SUMPRODUCT((T5:T<>"")*(COUNTIF(T5:T,T5:T)>1))'],
    ['Dernier backup script', '=IFERROR(MAX(FILTER(B5:B,C5:C="BACKUP_SCRIPT")),"")']
  ];
  var col = 1;
  kpis.forEach(function (k) {
    sheet.getRange(3, col).setValue(k[0]);
    sheet.getRange(3, col + 1).setFormula(k[1]);
    col += 2;
  });
  sheet.getRange('N3').setNumberFormat('yyyy-MM-dd HH:mm');
}

function FBR_setArtifactValidations_(sheet, endRow) {
  var classRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.CLASSES, true).setAllowInvalid(false).build();
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.STATUSES, true).setAllowInvalid(false).build();
  var retentionRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.CONSERVATION, true).setAllowInvalid(false).build();
  var canonicalRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.CANONICAL, true).setAllowInvalid(false).build();
  sheet.getRange(5, 3, endRow - 4, 1).setDataValidation(classRule);
  sheet.getRange(5, 6, endRow - 4, 1).setDataValidation(statusRule);
  sheet.getRange(5, 14, endRow - 4, 1).setDataValidation(retentionRule);
  sheet.getRange(5, 15, endRow - 4, 1).setDataValidation(canonicalRule);
}

function FBR_setArtifactConditionalFormatting_(sheet, endRow) {
  var range = sheet.getRange(5, 1, endRow - 4, 20);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F5="CANONIQUE"').setBackground('#D7F3E3').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F5="VALIDÉ_LIVE"').setBackground('#E4F6EA').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F5="PRÊT_NON_LIVE"').setBackground('#E8F1FB').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($F5="PARTIEL",$F5="À_REVOIR")').setBackground('#FFF0D5').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($F5="REMPLACÉ",$F5="ARCHIVÉ")').setBackground('#EEF0F2').setFontColor('#64748B').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($F5="À_PURGER",$F5="ERREUR")').setBackground('#FDE2E2').setFontColor('#991B1B').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($A5<>"",COUNTIF($A$5:$A,$A5)>1)').setBackground('#B91C1C').setFontColor('#FFFFFF').setRanges([sheet.getRange(5, 1, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($T5<>"",COUNTIF($T$5:$T,$T5)>1)').setBackground('#B91C1C').setFontColor('#FFFFFF').setRanges([sheet.getRange(5, 20, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($O5="OUI",$P5="")').setBackground('#FFF0D5').setRanges([sheet.getRange(5, 16, endRow - 4, 1)]).build()
  ];
  sheet.setConditionalFormatRules(rules);
}

function FBR_compactArtifactGrid_(sheet, targetRows, targetCols) {
  targetRows = Math.max(targetRows || 200, sheet.getLastRow() + 20);
  targetCols = targetCols || 20;
  if (sheet.getMaxRows() > targetRows) sheet.deleteRows(targetRows + 1, sheet.getMaxRows() - targetRows);
  if (sheet.getMaxRows() < targetRows) sheet.insertRowsAfter(sheet.getMaxRows(), targetRows - sheet.getMaxRows());
  if (sheet.getMaxColumns() > targetCols) sheet.deleteColumns(targetCols + 1, sheet.getMaxColumns() - targetCols);
  if (sheet.getMaxColumns() < targetCols) sheet.insertColumnsAfter(sheet.getMaxColumns(), targetCols - sheet.getMaxColumns());
}

function FBR_mergeExportsIntoReleases_(dryRun, traceId) {
  FBR_ensureCoreSheets_();
  var releases = FBR_readReleaseArtifacts_();
  var legacy = FBR_readLegacyExports_();
  var plan = FBR_buildArtifactMergePlan_(releases, legacy);
  var report = FBR_writeArtifactReport_(plan, dryRun, traceId);

  if (dryRun) {
    return FBR_result_(true, 'Fusion Exports → Releases — dry-run', FBR_artifactPlanSummary_(plan) + '\nRapport: ' + report.url);
  }

  var snapshot = FBR_createArtifactSnapshot_(traceId);
  FBR_writeArtifactDataset_(plan.finalRows);
  var legacySheet = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  if (legacySheet) legacySheet.hideSheet();
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, snapshot.id);
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, report.id);

  var verify = FBR_verifyArtifactRegistry_(false);
  if (!verify.ok) throw new Error('Fusion écrite mais gates en échec. Utiliser rollback. ' + verify.details);
  return FBR_result_(true, 'Fusion Exports → Releases — APPLY', FBR_artifactPlanSummary_(plan) + '\nSnapshot: ' + snapshot.url + '\nRapport: ' + report.url);
}

function FBR_readReleaseArtifacts_() {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return [];
  var raw = sheet.getRange(5, 1, lastRow - 4, 20).getValues();
  return raw.filter(function (r) { return r.some(function (v) { return FBR_safeText_(v) !== ''; }); }).map(FBR_normalizeExistingReleaseRow_);
}

function FBR_readLegacyExports_() {
  var sheet = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  if (!sheet || sheet.getLastRow() < 5) return [];
  return sheet.getRange(5, 1, sheet.getLastRow() - 4, 10).getValues()
    .filter(function (r) { return r.some(function (v) { return FBR_safeText_(v) !== ''; }); })
    .map(FBR_legacyExportRowToArtifact_);
}

function FBR_normalizeExistingReleaseRow_(r) {
  var row = r.slice(0, 20);
  while (row.length < 20) row.push('');
  // Ancien schéma détecté par les en-têtes historiques : ID, Date, Version, Type...
  if (!FBR_ARTIFACT.CLASSES.includes(FBR_safeText_(row[2]))) {
    var legacy = row.slice();
    row = [
      legacy[0], legacy[1], FBR_classifyArtifact_(legacy[3], legacy[5], legacy[6]), legacy[3], legacy[2],
      FBR_normalizeArtifactStatus_(legacy[4]), legacy[5], legacy[6], legacy[7], legacy[8], legacy[9], legacy[11],
      legacy[10] || legacy[17], legacy[16] || 'LEGACY_À_REVOIR', legacy[17] ? 'NON' : 'À DÉTERMINER',
      legacy[18] || '', legacy[19] || 'REVUE REQUISE', legacy[14] || FBR_extractDriveId_(legacy[5]), legacy[15] || '', ''
    ];
  }
  row[19] = row[19] || FBR_buildArtifactKeyFromRow_(row);
  return row;
}

function FBR_legacyExportRowToArtifact_(r) {
  var when = r[0] || r[2] || new Date();
  var type = FBR_safeText_(r[1]);
  var source = FBR_safeText_(r[3]);
  var format = FBR_safeText_(r[4]);
  var mode = FBR_safeText_(r[5]);
  var rawStatus = FBR_safeText_(r[6]);
  var link = FBR_safeText_(r[7]);
  var owner = FBR_safeText_(r[8]);
  var notes = FBR_safeText_(r[9]);
  var trace = FBR_extractTrace_(notes) || FBR_extractTrace_(type);
  var sha = FBR_extractGithubSha_(notes + ' ' + link);
  var driveId = FBR_extractDriveId_(link);
  var cls = FBR_classifyArtifact_(type, format, mode);
  var status = FBR_normalizeArtifactStatus_(rawStatus);
  var canonical = status === 'CANONIQUE' || status === 'VALIDÉ_LIVE' ? 'OUI' : 'À DÉTERMINER';
  if (/ignorer|do_not_use|à ignorer/i.test(type + ' ' + rawStatus + ' ' + notes)) {
    status = 'À_PURGER';
    canonical = 'NON';
  }
  var row = ['', when, cls, type || source, trace || FBR_safeText_(r[2]), status, '', '', source, owner, rawStatus, notes, '', 'LEGACY_À_REVOIR', canonical, '', 'REVUE REQUISE', driveId, '', ''];
  if (/github|git_tree/i.test(type + ' ' + format + ' ' + mode)) row[7] = link;
  else row[6] = link;
  if (sha && !row[7]) row[7] = 'https://github.com/' + FBR_GITHUB_DEFAULTS.OWNER + '/' + FBR_GITHUB_DEFAULTS.REPO + '/commit/' + sha;
  row[19] = FBR_buildArtifactKeyFromRow_(row);
  return row;
}

function FBR_buildArtifactMergePlan_(existing, legacy) {
  var byKey = {};
  var actions = [];
  existing.forEach(function (row, index) {
    var key = row[19] || FBR_buildArtifactKeyFromRow_(row);
    row[19] = key;
    if (!byKey[key]) byKey[key] = row;
    else actions.push({ action: 'DUPLICATE_EXISTING', source: 'RELEASES', index: index + 5, key: key });
  });

  // Fusionne d'abord les deux lignes Drive/GitHub d'un même trace.
  var grouped = {};
  legacy.forEach(function (row, index) {
    var trace = FBR_safeText_(row[4]);
    var groupKey = trace ? 'TRACE|' + trace : row[19];
    if (!grouped[groupKey]) grouped[groupKey] = row;
    else grouped[groupKey] = FBR_mergeArtifactRows_(grouped[groupKey], row);
    actions.push({ action: 'SOURCE_READ', source: 'EXPORTS', index: index + 5, key: groupKey });
  });

  Object.keys(grouped).forEach(function (groupKey) {
    var incoming = grouped[groupKey];
    var key = incoming[19] || FBR_buildArtifactKeyFromRow_(incoming);
    incoming[19] = key;
    var matchKey = FBR_findCompatibleArtifactKey_(byKey, incoming);
    if (matchKey) {
      byKey[matchKey] = FBR_mergeArtifactRows_(byKey[matchKey], incoming);
      byKey[matchKey][19] = FBR_buildArtifactKeyFromRow_(byKey[matchKey]);
      actions.push({ action: 'MERGE_EXISTING', source: 'EXPORTS', key: key, target: matchKey });
    } else {
      byKey[key] = incoming;
      actions.push({ action: incoming[5] === 'À_PURGER' ? 'PURGE' : 'CREATE_NEW', source: 'EXPORTS', key: key });
    }
  });

  var rows = Object.keys(byKey).map(function (key) { return byKey[key]; });
  FBR_repairArtifactIds_(rows, actions);
  rows.sort(function (a, b) {
    var da = FBR_dateSortValue_(a[1]);
    var db = FBR_dateSortValue_(b[1]);
    return db - da;
  });
  return { finalRows: rows, actions: actions, sourceReleaseCount: existing.length, sourceExportCount: legacy.length };
}

function FBR_findCompatibleArtifactKey_(byKey, incoming) {
  if (byKey[incoming[19]]) return incoming[19];
  var incomingDrive = FBR_safeText_(incoming[17]) || FBR_extractDriveId_(incoming[6]);
  var incomingSha = FBR_extractGithubSha_(incoming[7] + ' ' + incoming[11]);
  var incomingTrace = FBR_safeText_(incoming[4]);
  var keys = Object.keys(byKey);
  for (var i = 0; i < keys.length; i++) {
    var row = byKey[keys[i]];
    if (incomingDrive && (FBR_safeText_(row[17]) === incomingDrive || FBR_extractDriveId_(row[6]) === incomingDrive)) return keys[i];
    if (incomingSha && FBR_extractGithubSha_(row[7] + ' ' + row[11]) === incomingSha) return keys[i];
    if (incomingTrace && FBR_safeText_(row[4]).indexOf(incomingTrace) >= 0) return keys[i];
  }
  return '';
}

function FBR_mergeArtifactRows_(base, incoming) {
  var out = base.slice(0, 20);
  for (var i = 0; i < 20; i++) {
    if (FBR_safeText_(out[i]) === '' && FBR_safeText_(incoming[i]) !== '') out[i] = incoming[i];
  }
  if (!out[6] && incoming[6]) out[6] = incoming[6];
  if (!out[7] && incoming[7]) out[7] = incoming[7];
  if (incoming[11] && out[11].indexOf(incoming[11]) < 0) out[11] = [out[11], incoming[11]].filter(Boolean).join(' | ');
  if (incoming[10] && out[10].indexOf(incoming[10]) < 0) out[10] = [out[10], incoming[10]].filter(Boolean).join(' | ');
  if (out[2] === 'MIRROR_GITHUB_SEUL' && out[6]) out[2] = 'BACKUP_SCRIPT';
  if (incoming[2] === 'BACKUP_SCRIPT') out[2] = 'BACKUP_SCRIPT';
  if (out[6] && out[7] && out[5] !== 'À_PURGER') out[5] = 'VALIDÉ_LIVE';
  out[17] = out[17] || FBR_extractDriveId_(out[6]);
  out[19] = FBR_buildArtifactKeyFromRow_(out);
  return out;
}

function FBR_repairArtifactIds_(rows, actions) {
  var seen = {};
  var max = { REL: 0, BKP: 0, ART: 0 };
  rows.forEach(function (r) {
    var id = FBR_safeText_(r[0]);
    var m = id.match(/^(REL|BKP(?:-SH)?|ART)-(\d+)$/i);
    if (m) {
      var family = m[1].toUpperCase().indexOf('BKP') === 0 ? 'BKP' : m[1].toUpperCase();
      max[family] = Math.max(max[family] || 0, Number(m[2]));
    }
  });
  rows.forEach(function (r) {
    var old = FBR_safeText_(r[0]);
    if (!old || seen[old]) {
      var prefix = r[2] === 'RELEASE' ? 'REL' : (r[2].indexOf('BACKUP') === 0 ? 'BKP' : 'ART');
      max[prefix] = (max[prefix] || 0) + 1;
      r[0] = prefix + '-' + ('0000' + max[prefix]).slice(-4);
      if (old) r[11] = [r[11], 'ID legacy dupliqué remplacé : ' + old].filter(Boolean).join(' | ');
      actions.push({ action: old ? 'REPAIR_DUPLICATE_ID' : 'ASSIGN_ID', oldId: old, newId: r[0], key: r[19] });
    }
    seen[r[0]] = true;
  });
}

function FBR_registerLegacyExportRows_(rows) {
  FBR_ensureArtifactRegistrySheet_();
  var artifacts = rows.map(FBR_legacyExportRowToArtifact_);
  var count = 0;
  artifacts.forEach(function (artifact) {
    FBR_upsertArtifactByKey_(artifact);
    count++;
  });
  return count;
}

function FBR_upsertArtifactByKey_(artifact) {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  artifact = FBR_normalizeExistingReleaseRow_(artifact);
  var key = artifact[19];
  var lastRow = sheet.getLastRow();
  if (lastRow >= 5) {
    var keys = sheet.getRange(5, 20, lastRow - 4, 1).getValues();
    for (var i = 0; i < keys.length; i++) {
      if (FBR_safeText_(keys[i][0]) === key) {
        var current = sheet.getRange(5 + i, 1, 1, 20).getValues()[0];
        var merged = FBR_mergeArtifactRows_(current, artifact);
        if (!merged[0]) merged[0] = FBR_nextArtifactId_(merged[2]);
        sheet.getRange(5 + i, 1, 1, 20).setValues([merged]);
        FBR_refreshArtifactKpis_(sheet);
        return { action: 'UPDATE', row: 5 + i, key: key };
      }
    }
  }
  if (!artifact[0]) artifact[0] = FBR_nextArtifactId_(artifact[2]);
  sheet.getRange(Math.max(sheet.getLastRow() + 1, 5), 1, 1, 20).setValues([artifact]);
  FBR_refreshArtifactKpis_(sheet);
  return { action: 'CREATE', row: sheet.getLastRow(), key: key };
}

function FBR_nextArtifactId_(cls) {
  var prefix = cls === 'RELEASE' ? 'REL' : (String(cls).indexOf('BACKUP') === 0 ? 'BKP' : 'ART');
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var ids = sheet.getLastRow() >= 5 ? sheet.getRange(5, 1, sheet.getLastRow() - 4, 1).getValues() : [];
  var max = 0;
  ids.forEach(function (r) {
    var m = FBR_safeText_(r[0]).match(new RegExp('^' + prefix + '-(\\d+)$', 'i'));
    if (m) max = Math.max(max, Number(m[1]));
  });
  return prefix + '-' + ('0000' + (max + 1)).slice(-4);
}

function FBR_writeArtifactDataset_(rows) {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  FBR_ensureArtifactRegistrySheet_();
  var oldRows = Math.max(1, sheet.getLastRow() - 4);
  sheet.getRange(5, 1, oldRows, 20).clearContent();
  if (rows.length) sheet.getRange(5, 1, rows.length, 20).setValues(rows);
  FBR_applyArtifactRegistryUi_(sheet);
}

function FBR_verifyArtifactRegistry_(allowLegacyPresent) {
  FBR_ensureArtifactRegistrySheet_();
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var lastRow = sheet.getLastRow();
  var rows = lastRow >= 5 ? sheet.getRange(5, 1, lastRow - 4, 20).getValues().filter(function (r) { return FBR_safeText_(r[0]) !== ''; }) : [];
  var ids = {};
  var keys = {};
  var duplicateIds = [];
  var duplicateKeys = [];
  var missingKeys = [];
  rows.forEach(function (r, i) {
    var id = FBR_safeText_(r[0]);
    var key = FBR_safeText_(r[19]);
    if (ids[id]) duplicateIds.push(id); else ids[id] = true;
    if (!key) missingKeys.push(i + 5);
    else if (keys[key]) duplicateKeys.push(key); else keys[key] = true;
  });
  var legacy = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  var legacyIssue = !allowLegacyPresent && legacy ? ['Onglet legacy encore présent'] : [];
  var issues = [].concat(duplicateIds.length ? ['IDs dupliqués=' + duplicateIds.length] : [])
    .concat(duplicateKeys.length ? ['Clés dupliquées=' + duplicateKeys.length] : [])
    .concat(missingKeys.length ? ['Clés manquantes=' + missingKeys.length] : [])
    .concat(legacyIssue);
  return FBR_result_(issues.length === 0, issues.length ? 'Registry en échec' : 'Registry OK', issues.length ? issues.join(' ; ') : 'Lignes=' + rows.length + ' ; IDs et clés uniques.');
}

function FBR_createArtifactSnapshot_(traceId) {
  var payload = {
    version: FBR_ARTIFACT.VERSION,
    createdAt: new Date().toISOString(),
    traceId: traceId,
    spreadsheetId: FBR_ss_().getId(),
    releases: FBR_snapshotSheet_(FBR.SHEETS.RELEASES),
    exports: FBR_snapshotSheet_(FBR.SHEETS.EXPORTS)
  };
  var folder = DriveApp.getFolderById(FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, FBR_SOURCE_BACKUP_DEFAULTS.FOLDER_ID));
  var name = 'felibree_artifact_registry_premerge_snapshot_' + Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyyMMdd_HHmmss') + '_' + traceId + '.json';
  var file = folder.createFile(name, JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);
  return { id: file.getId(), url: file.getUrl(), name: name };
}

function FBR_snapshotSheet_(sheetName) {
  var sheet = FBR_sheet_(sheetName, false);
  if (!sheet) return null;
  var rows = Math.max(1, sheet.getLastRow());
  var cols = Math.max(1, sheet.getLastColumn());
  return { name: sheetName, values: sheet.getRange(1, 1, rows, cols).getValues(), hidden: sheet.isSheetHidden() };
}

function FBR_restoreArtifactSnapshot_() {
  var id = FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, '');
  if (!id) throw new Error('Aucun snapshot de fusion enregistré.');
  var payload = JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8'));
  FBR_restoreSnapshotSheet_(payload.releases);
  FBR_restoreSnapshotSheet_(payload.exports);
  return FBR_result_(true, 'Rollback fusion restauré', 'Snapshot ' + id + ' restauré.');
}

function FBR_restoreSnapshotSheet_(snap) {
  if (!snap) return;
  var ss = FBR_ss_();
  var sheet = ss.getSheetByName(snap.name) || ss.insertSheet(snap.name);
  sheet.clear();
  var values = snap.values || [[]];
  if (sheet.getMaxRows() < values.length) sheet.insertRowsAfter(sheet.getMaxRows(), values.length - sheet.getMaxRows());
  if (sheet.getMaxColumns() < values[0].length) sheet.insertColumnsAfter(sheet.getMaxColumns(), values[0].length - sheet.getMaxColumns());
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  if (snap.hidden) sheet.hideSheet(); else sheet.showSheet();
}

function FBR_writeArtifactReport_(plan, dryRun, traceId) {
  var folder = DriveApp.getFolderById(FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, FBR_SOURCE_BACKUP_DEFAULTS.FOLDER_ID));
  var stamp = Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyyMMdd_HHmmss');
  var prefix = dryRun ? 'DRYRUN' : 'APPLY';
  var name = 'felibree_artifact_merge_' + prefix + '_' + stamp + '_' + traceId + '.json';
  var payload = {
    mode: prefix,
    version: FBR_ARTIFACT.VERSION,
    traceId: traceId,
    createdAt: new Date().toISOString(),
    summary: FBR_artifactPlanSummary_(plan),
    sourceReleaseCount: plan.sourceReleaseCount,
    sourceExportCount: plan.sourceExportCount,
    finalCount: plan.finalRows.length,
    actions: plan.actions,
    finalRows: plan.finalRows
  };
  var file = folder.createFile(name, JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);
  return { id: file.getId(), url: file.getUrl(), name: name };
}

function FBR_artifactPlanSummary_(plan) {
  var counts = {};
  plan.actions.forEach(function (a) { counts[a.action] = (counts[a.action] || 0) + 1; });
  return 'Releases source=' + plan.sourceReleaseCount +
    ' ; Exports source=' + plan.sourceExportCount +
    ' ; Final=' + plan.finalRows.length +
    ' ; MERGE_EXISTING=' + (counts.MERGE_EXISTING || 0) +
    ' ; CREATE_NEW=' + (counts.CREATE_NEW || 0) +
    ' ; PURGE=' + (counts.PURGE || 0) +
    ' ; ID_REPAIRS=' + ((counts.REPAIR_DUPLICATE_ID || 0) + (counts.ASSIGN_ID || 0));
}

function FBR_classifyArtifact_(type, format, mode) {
  var s = FBR_norm_([type, format, mode].join(' '));
  if (/backup.*sheet|archive.*sheet|copie.*sheet/.test(s)) return 'BACKUP_SHEET';
  if (/backup.*source|apps script live source|zip apps script/.test(s)) return 'BACKUP_SCRIPT';
  if (/github|git_tree|mirror/.test(s)) return 'MIRROR_GITHUB_SEUL';
  if (/release|version|correctif|scope fix/.test(s)) return 'RELEASE';
  if (/memo|mémo|documentation|markdown|google doc/.test(s)) return 'DOCUMENTATION';
  if (/pack|zip/.test(s)) return 'PACK';
  if (/snapshot|audit live|réparation/.test(s)) return 'SNAPSHOT';
  if (/archive/.test(s)) return 'ARCHIVE';
  if (/export/.test(s)) return 'EXPORT';
  return 'LIVRABLE';
}

function FBR_normalizeArtifactStatus_(value) {
  var s = FBR_norm_(value);
  if (/ignorer|purger|do not use|do_not_use/.test(s)) return 'À_PURGER';
  if (/erreur|échec|bloqué/.test(s)) return 'ERREUR';
  if (/remplac|supplant/.test(s)) return 'REMPLACÉ';
  if (/archive/.test(s)) return 'ARCHIVÉ';
  if (/non live|prêt|pret|généré local|genere local/.test(s)) return 'PRÊT_NON_LIVE';
  if (/partiel/.test(s)) return 'PARTIEL';
  if (/validé|valide|rangé drive ok|poussé github ok|ok$/.test(s)) return 'VALIDÉ_LIVE';
  if (/canonique/.test(s)) return 'CANONIQUE';
  return 'À_REVOIR';
}

function FBR_buildArtifactKeyFromRow_(row) {
  var cls = FBR_safeText_(row[2]) || 'LIVRABLE';
  var trace = FBR_safeText_(row[4]);
  var drive = FBR_safeText_(row[17]) || FBR_extractDriveId_(row[6]);
  var sha = FBR_extractGithubSha_(row[7] + ' ' + row[11]);
  if (cls === 'BACKUP_SCRIPT' && trace) return ['BACKUP_SCRIPT', trace, drive, sha].join('|');
  if (cls === 'BACKUP_SHEET' && drive) return ['BACKUP_SHEET', drive].join('|');
  if (drive) return [cls, drive, trace].join('|');
  if (sha) return [cls, sha, trace].join('|');
  return [cls, FBR_digestShort_([row[3], trace, row[1], row[6], row[7]].join('|'))].join('|');
}

function FBR_extractDriveId_(value) {
  var s = FBR_safeText_(value);
  var m = s.match(/(?:\/d\/|id=)([-\w]{20,})/);
  return m ? m[1] : '';
}

function FBR_extractGithubSha_(value) {
  var s = FBR_safeText_(value);
  var m = s.match(/(?:commit[\/\s]+|commit\s+)([0-9a-f]{7,40})/i);
  return m ? m[1] : '';
}

function FBR_extractTrace_(value) {
  var s = FBR_safeText_(value);
  var m = s.match(/trace\s+([A-Za-z0-9_-]{6,64})/i);
  return m ? m[1] : '';
}

function FBR_digestShort_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
  return bytes.slice(0, 8).map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function FBR_dateSortValue_(value) {
  if (FBR_isDate_(value)) return value.getTime();
  var d = new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}
