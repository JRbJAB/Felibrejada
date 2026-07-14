/**
 * Registre canonique Releases / Backups / Exports.
 * Une ligne = un objet logique unique.
 * Aucun onglet temporaire n'est créé.
 */

var FBR_ARTIFACT = {
  VERSION: 'v1.0.5-20260714-PRIVATE-VAULT-REST-PERMISSIONS',
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

function FELIBREE_verifyLastArtifactReportAccess() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_verifyLastArtifactReportAccess',
    mode: 'READ_ONLY_REPORT_ACCESS',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true
  }, function () {
    var id = FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, '') || FBR_findLatestArtifactReportIdFromLogs_();
    if (!id) throw new Error('Aucun rapport Artifact Registry trouvé dans les propriétés ou dans 🧾 Logs.');
    var access = FBR_probeArtifactReportById_(id);
    if (!access.ok) throw new Error('Rapport introuvable ou illisible : ' + access.details);
    return FBR_result_(true, 'Rapport Artifact Registry accessible', access.details);
  });
}

function FELIBREE_hardenArtifactRegistryStorageDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_hardenArtifactRegistryStorageDryRun',
    mode: 'SECURITY_HARDENING_DRY_RUN',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true
  }, function () {
    var preview = FBR_previewArtifactRegistryStorageHardening_();
    return FBR_result_(true, 'Prévisualisation coffre Artifact Registry', preview.details);
  });
}

function FELIBREE_hardenArtifactRegistryStorageApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_hardenArtifactRegistryStorageApply',
    mode: 'SECURITY_HARDENING',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true
  }, function (context) {
    var hardened = FBR_hardenArtifactRegistryStorage_(context.traceId);
    return FBR_result_(true, 'Coffre Artifact Registry sécurisé', hardened.details);
  });
}

function FELIBREE_verifyArtifactRegistryStorageSecurity() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_verifyArtifactRegistryStorageSecurity',
    mode: 'READ_ONLY_SECURITY_VERIFY',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true
  }, function () {
    var verify = FBR_verifyArtifactRegistryStorageSecurity_();
    if (!verify.ok) throw new Error(verify.details);
    return FBR_result_(true, 'Stockage Artifact Registry privé vérifié', verify.details);
  });
}

function FELIBREE_republishLatestArtifactReportToLogs() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_republishLatestArtifactReportToLogs',
    mode: 'REPORT_RECOVERY',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true
  }, function (context) {
    var id = FBR_findLatestArtifactReportIdFromLogs_() || FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, '');
    if (!id) throw new Error('Aucun rapport Artifact Registry trouvé dans les propriétés ou dans 🧾 Logs.');
    return FBR_republishArtifactReportToAccessibleLocation_(id, context.traceId);
  });
}

function FELIBREE_restoreLegacyReleasesViewAfterDryRunDamage() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_restoreLegacyReleasesViewAfterDryRunDamage',
    mode: 'UI_REPAIR_ONLY',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function (context) {
    return FBR_restoreLegacyReleasesView_(context.traceId);
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
    // Le registre doit être valide pendant que l'onglet legacy est encore présent.
    var verifyBefore = FBR_verifyArtifactRegistry_(true);
    if (!verifyBefore.ok) throw new Error('Retraite refusée : ' + verifyBefore.details);
    var legacy = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
    if (!legacy) return FBR_result_(true, 'Exports déjà retiré', 'Aucun onglet legacy présent.');
    FBR_ss_().deleteSheet(legacy);
    var verifyAfter = FBR_verifyArtifactRegistry_(false);
    if (!verifyAfter.ok) throw new Error('Onglet supprimé mais contrôle final en échec : ' + verifyAfter.details);
    return FBR_result_(true, 'Exports retiré', 'Onglet legacy supprimé après gates avant/après OK.');
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

function FBR_ensureArtifactRegistryContainer_() {
  return FBR_sheet_(FBR.SHEETS.RELEASES, true);
}

function FBR_ensureArtifactRegistrySheet_(applyUi) {
  var sheet = FBR_ensureArtifactRegistryContainer_();
  // Par défaut, cette fonction est non destructive. L'UI cible ne doit être
  // appliquée qu'après écriture du dataset normalisé et snapshot préalable.
  if (applyUi !== true) return sheet;
  var headers = FBR.ADMIN_HEADERS.RELEASES;
  sheet.getRange(1, 1).setValue(FBR_ARTIFACT.TITLE);
  sheet.getRange(2, 1).setValue(FBR_ARTIFACT.RULE);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers]);
  FBR_applyArtifactRegistryUi_(sheet);
  return sheet;
}

function FBR_applyArtifactRegistryUi_(sheet) {
  sheet = sheet || FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var maxCols = FBR.ADMIN_HEADERS.RELEASES.length;
  var lastRow = Math.max(sheet.getLastRow(), 5);

  // Dimensionner avant les validations pour ne jamais viser hors grille.
  FBR_compactArtifactGrid_(sheet, Math.max(200, lastRow + 20), maxCols);
  var endRow = sheet.getMaxRows();

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

  var body = sheet.getRange(5, 1, Math.max(1, endRow - 4), maxCols);
  body.setVerticalAlignment('top').setWrap(true);
  sheet.getRange(5, 2, Math.max(1, endRow - 4), 1).setNumberFormat('yyyy-MM-dd HH:mm:ss');

  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(4, 1, Math.max(2, lastRow - 3), maxCols).createFilter();

  FBR_setArtifactValidations_(sheet, endRow);
  FBR_setArtifactConditionalFormatting_(sheet, endRow);
}

function FBR_refreshArtifactKpis_(sheet) {
  sheet.getRange('A3:T3').clearContent();
  var sep = FBR_formulaSeparator_();
  var kpis = [
    ['Total', '=MAX(0' + sep + 'COUNTA(A5:A))'],
    ['Canoniques', '=COUNTIF(O5:O' + sep + '"OUI")'],
    ['À revoir', '=COUNTIF(F5:F' + sep + '"À_REVOIR")'],
    ['À purger', '=COUNTIF(F5:F' + sep + '"À_PURGER")'],
    ['Doublons ID', '=SUMPRODUCT((A5:A<>"")*(COUNTIF(A5:A' + sep + 'A5:A)>1))'],
    ['Doublons clé', '=SUMPRODUCT((T5:T<>"")*(COUNTIF(T5:T' + sep + 'T5:T)>1))'],
    ['Dernier backup script', '=IFERROR(MAX(FILTER(B5:B' + sep + 'C5:C="BACKUP_SCRIPT"))' + sep + '"")']
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
  var sep = FBR_formulaSeparator_();
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F5="CANONIQUE"').setBackground('#D7F3E3').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F5="VALIDÉ_LIVE"').setBackground('#E4F6EA').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F5="PRÊT_NON_LIVE"').setBackground('#E8F1FB').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($F5="PARTIEL"' + sep + '$F5="À_REVOIR")').setBackground('#FFF0D5').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($F5="REMPLACÉ"' + sep + '$F5="ARCHIVÉ")').setBackground('#EEF0F2').setFontColor('#64748B').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($F5="À_PURGER"' + sep + '$F5="ERREUR")').setBackground('#FDE2E2').setFontColor('#991B1B').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($A5<>""' + sep + 'COUNTIF($A$5:$A' + sep + '$A5)>1)').setBackground('#B91C1C').setFontColor('#FFFFFF').setRanges([sheet.getRange(5, 1, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($T5<>""' + sep + 'COUNTIF($T$5:$T' + sep + '$T5)>1)').setBackground('#B91C1C').setFontColor('#FFFFFF').setRanges([sheet.getRange(5, 20, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($O5="OUI"' + sep + '$P5="")').setBackground('#FFF0D5').setRanges([sheet.getRange(5, 16, endRow - 4, 1)]).build()
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
  // Ne jamais appeler FBR_ensureCoreSheets_ ici : le dry-run doit laisser
  // 📦 Releases & Backups strictement intact.
  FBR_ensureArtifactRegistryContainer_();
  var releases = FBR_readReleaseArtifacts_();
  var legacy = FBR_readLegacyExports_();
  var plan = FBR_buildArtifactMergePlan_(releases, legacy);
  var report = FBR_writeArtifactReport_(plan, dryRun, traceId);

  if (dryRun) {
    return FBR_result_(true, 'Fusion Exports → Releases — dry-run', FBR_artifactPlanSummary_(plan) + '\n' + FBR_artifactReportReference_(report));
  }

  // Snapshot impérativement AVANT le premier changement de cellule, format,
  // validation, filtre, masquage ou dimension de grille.
  var snapshot = FBR_createArtifactSnapshot_(traceId);
  FBR_writeArtifactDataset_(plan.finalRows);
  SpreadsheetApp.flush();
  var legacySheet = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  if (legacySheet) legacySheet.hideSheet();
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, snapshot.id);
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, report.id);

  // L'onglet legacy est volontairement conservé et masqué après fusion.
  var verify = FBR_verifyArtifactRegistry_(true);
  if (!verify.ok) throw new Error('Fusion écrite mais gates en échec. Utiliser rollback. ' + verify.details);
  return FBR_result_(true, 'Fusion Exports → Releases — APPLY', FBR_artifactPlanSummary_(plan) + '\nSnapshot JSON: ' + snapshot.url + '\nCopie Sheet complète: ' + snapshot.spreadsheetCopyUrl + '\n' + FBR_artifactReportReference_(report));
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
  if (FBR_isLegacyReleaseRow_(row)) {
    var legacy = row.slice();
    var legacyPriority = FBR_safeText_(legacy[12]);
    var legacyRegistryVersion = FBR_safeText_(legacy[13]);
    var legacyConservation = FBR_safeText_(legacy[16]);
    var legacyCanonicalText = FBR_safeText_(legacy[17]);
    var notes = FBR_safeText_(legacy[11]);
    var preserved = [];
    if (legacyPriority) preserved.push('Priorité legacy=' + legacyPriority);
    if (legacyRegistryVersion) preserved.push('Version registry legacy=' + legacyRegistryVersion);
    if (legacyConservation) preserved.push('Conservation legacy=' + legacyConservation);
    if (legacyCanonicalText && !FBR_isReplacementText_(legacyCanonicalText)) preserved.push('État canonique legacy=' + legacyCanonicalText);
    if (preserved.length) notes = FBR_joinUniqueText_(notes, '[Migration] ' + preserved.join(' ; '));

    var rollback = FBR_safeText_(legacy[10]);
    if (FBR_isReplacementText_(legacyCanonicalText)) rollback = FBR_joinUniqueText_(rollback, legacyCanonicalText);

    row = [
      legacy[0],
      legacy[1],
      FBR_classifyArtifact_(legacy[3], legacy[5], legacy[6]),
      legacy[3],
      legacy[2],
      FBR_normalizeArtifactStatus_(legacy[4]),
      legacy[5],
      legacy[6],
      legacy[7],
      legacy[8],
      legacy[9],
      notes,
      rollback,
      FBR_normalizeConservation_(legacyConservation),
      FBR_inferCanonical_(legacyCanonicalText, legacy[4]),
      legacy[18] || '',
      legacy[19] || 'REVUE REQUISE',
      legacy[14] || FBR_extractDriveId_(legacy[5]),
      legacy[15] || '',
      ''
    ];
  }
  row[13] = FBR_normalizeConservation_(row[13]);
  row[14] = FBR_normalizeCanonical_(row[14]);
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
    else {
      byKey[key] = FBR_mergeArtifactRows_(byKey[key], row);
      actions.push({ action: 'DUPLICATE_EXISTING_COLLAPSED', source: 'RELEASES', index: index + 5, key: key });
    }
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
    var oldKey = old.toUpperCase();
    if (!old || seen[oldKey]) {
      var prefix = r[2] === 'RELEASE' ? 'REL' : (r[2].indexOf('BACKUP') === 0 ? 'BKP' : 'ART');
      max[prefix] = (max[prefix] || 0) + 1;
      r[0] = prefix + '-' + ('0000' + max[prefix]).slice(-4);
      if (old) r[11] = [r[11], 'ID legacy dupliqué remplacé : ' + old].filter(Boolean).join(' | ');
      actions.push({ action: old ? 'REPAIR_DUPLICATE_ID' : 'ASSIGN_ID', oldId: old, newId: r[0], key: r[19] });
    }
    seen[FBR_safeText_(r[0]).toUpperCase()] = true;
  });
}

function FBR_registerLegacyExportRows_(rows) {
  FBR_assertArtifactRegistryMigrated_();
  var artifacts = rows.map(FBR_legacyExportRowToArtifact_);
  var count = 0;
  artifacts.forEach(function (artifact) {
    FBR_upsertArtifactByKey_(artifact);
    count++;
  });
  return count;
}

function FBR_upsertArtifactByKey_(artifact) {
  FBR_assertArtifactRegistryMigrated_();
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
  var targetRow = Math.max(sheet.getLastRow() + 1, 5);
  if (targetRow > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), targetRow - sheet.getMaxRows());
  sheet.getRange(targetRow, 1, 1, 20).setValues([artifact]);
  FBR_refreshArtifactKpis_(sheet);
  return { action: 'CREATE', row: targetRow, key: key };
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
  var requiredRows = Math.max(200, rows.length + 24);
  FBR_compactArtifactGrid_(sheet, requiredRows, 20);
  var clearRows = Math.max(1, sheet.getMaxRows() - 4);
  sheet.getRange(5, 1, clearRows, 20).clearContent().clearDataValidations();
  if (rows.length) sheet.getRange(5, 1, rows.length, 20).setValues(rows);
  FBR_ensureArtifactRegistrySheet_(true);
}

function FBR_verifyArtifactRegistry_(allowLegacyPresent) {
  SpreadsheetApp.flush();
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var lastRow = sheet.getLastRow();
  var rows = lastRow >= 5 ? sheet.getRange(5, 1, lastRow - 4, 20).getValues().filter(function (r) { return FBR_safeText_(r[0]) !== ''; }) : [];
  var ids = {};
  var keys = {};
  var duplicateIds = [];
  var duplicateKeys = [];
  var missingKeys = [];
  var invalidClasses = [];
  var invalidStatuses = [];
  var invalidConservation = [];
  var invalidCanonical = [];
  rows.forEach(function (r, i) {
    var rowNumber = i + 5;
    var id = FBR_safeText_(r[0]);
    var idKey = id.toUpperCase();
    var key = FBR_safeText_(r[19]);
    if (ids[idKey]) duplicateIds.push(id); else ids[idKey] = true;
    if (!key) missingKeys.push(rowNumber);
    else if (keys[key]) duplicateKeys.push(key); else keys[key] = true;
    if (FBR_ARTIFACT.CLASSES.indexOf(FBR_safeText_(r[2])) < 0) invalidClasses.push(rowNumber);
    if (FBR_ARTIFACT.STATUSES.indexOf(FBR_safeText_(r[5])) < 0) invalidStatuses.push(rowNumber);
    if (FBR_ARTIFACT.CONSERVATION.indexOf(FBR_safeText_(r[13])) < 0) invalidConservation.push(rowNumber);
    if (FBR_ARTIFACT.CANONICAL.indexOf(FBR_safeText_(r[14])) < 0) invalidCanonical.push(rowNumber);
  });
  var legacy = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  var legacyIssue = !allowLegacyPresent && legacy ? ['Onglet legacy encore présent'] : [];
  var kpiDisplays = sheet.getRange('B3:N3').getDisplayValues()[0];
  var formulaErrors = kpiDisplays.filter(function (v) { return /^#/.test(FBR_safeText_(v)); });
  var issues = [].concat(duplicateIds.length ? ['IDs dupliqués=' + duplicateIds.length] : [])
    .concat(duplicateKeys.length ? ['Clés dupliquées=' + duplicateKeys.length] : [])
    .concat(missingKeys.length ? ['Clés manquantes=' + missingKeys.length] : [])
    .concat(invalidClasses.length ? ['Classes invalides=' + invalidClasses.length] : [])
    .concat(invalidStatuses.length ? ['Statuts invalides=' + invalidStatuses.length] : [])
    .concat(invalidConservation.length ? ['Conservation invalide=' + invalidConservation.length] : [])
    .concat(invalidCanonical.length ? ['Canonique invalide=' + invalidCanonical.length] : [])
    .concat(formulaErrors.length ? ['KPI en erreur=' + formulaErrors.length] : [])
    .concat(legacyIssue);
  return FBR_result_(issues.length === 0, issues.length ? 'Registry en échec' : 'Registry OK', issues.length ? issues.join(' ; ') : 'Lignes=' + rows.length + ' ; schéma, IDs, clés et KPI valides.');
}

function FBR_restoreLegacyReleasesView_(traceId) {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var sample = sheet.getRange(5, 1, 1, 20).getValues()[0];
  if (!FBR_isLegacyReleaseRow_(sample)) {
    throw new Error('Réparation UI refusée : le registre ne présente pas la signature legacy attendue en ligne 5.');
  }
  var snapshot = FBR_createArtifactSnapshot_(traceId);
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, snapshot.id);
  var legacyHeaders = [
    'ID release', 'Date', 'Version / trace', 'Type', 'Statut', 'Drive backup / pack',
    'GitHub commit / repo', 'Scripts concernés', 'Owner', 'Résultat', 'Rollback', 'Notes',
    'Priorité', 'Version registry', 'Drive ID', 'Chemin Drive', 'Conservation',
    'Remplacé par / canonique', 'Intégrité / hash', 'Revue / purge'
  ];
  sheet.getRange('A1:T4').clearContent();
  sheet.getRange(1, 1).setValue('📦 Releases & Backups — versions, packs, Drive, GitHub, rollback');
  sheet.getRange(2, 1).setValue('Source : meilleur JRbIA. Centralise les releases et preuves de sauvegarde.');
  sheet.getRange(3, 1, 1, 4).setValues([['Dernière mise à jour', Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyy-MM-dd'), 'Statut', 'Vue legacy restaurée après dry-run — aucune donnée métier modifiée']]);
  sheet.getRange(4, 1, 1, 20).setValues([legacyHeaders]);
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.setConditionalFormatRules([]);
  sheet.getRange(5, 1, Math.max(1, sheet.getMaxRows() - 4), 20).clearDataValidations();
  sheet.showColumns(18, 3);
  sheet.setFrozenRows(4);
  sheet.setFrozenColumns(0);
  var widths = [490, 75, 135, 235, 90, 565, 570, 280, 70, 265, 145, 205, 70, 110, 190, 190, 190, 190, 190, 190];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.getRange(1, 1, 1, 20).setBackground('#174F4A').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(14);
  sheet.getRange(4, 1, 1, 20).setBackground('#2F766F').setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
  return FBR_result_(true, 'Vue legacy restaurée', 'Aucune ligne métier modifiée. Snapshot JSON=' + snapshot.url + ' ; copie Sheet complète=' + snapshot.spreadsheetCopyUrl + '. Relancer ensuite le dry-run.');
}

function FBR_isArtifactRegistryMigrated_() {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, false);
  if (!sheet) return false;
  var header = FBR_safeText_(sheet.getRange(4, 3).getValue());
  if (header !== 'Classe') return false;
  var sample = sheet.getLastRow() >= 5 ? sheet.getRange(5, 1, 1, 20).getValues()[0] : [];
  return !(sample.length && FBR_isLegacyReleaseRow_(sample));
}

function FBR_assertArtifactRegistryMigrated_() {
  if (!FBR_isArtifactRegistryMigrated_()) {
    throw new Error('Registre non migré : écriture directe dans 📦 Releases & Backups bloquée. Les sauvegardes préalables restent autorisées et sont enregistrées temporairement dans 📤 Exports.');
  }
}

function FBR_isLegacyReleaseRow_(row) {
  if (!row || !row.length) return false;
  var cls = FBR_safeText_(row[2]);
  if (FBR_ARTIFACT.CLASSES.indexOf(cls) >= 0) return false;
  return FBR_safeText_(row[0]) !== '' && FBR_safeText_(row[3]) !== '';
}

function FBR_formulaSeparator_() {
  var locale = '';
  try { locale = FBR_ss_().getSpreadsheetLocale() || ''; } catch (err) { locale = ''; }
  return /^(fr|de|es|it|pt|nl|pl|ru|tr|cs|da|fi|sv|no|hu|ro|sk|sl)/i.test(locale) ? ';' : ',';
}

function FBR_joinUniqueText_(base, extra) {
  base = FBR_safeText_(base);
  extra = FBR_safeText_(extra);
  if (!extra) return base;
  if (!base) return extra;
  if (base.indexOf(extra) >= 0) return base;
  return base + ' | ' + extra;
}

function FBR_isReplacementText_(value) {
  var s = FBR_norm_(value);
  return /remplac|supplant|obsol|ne plus utiliser|archive|rollback/.test(s);
}

function FBR_normalizeConservation_(value) {
  var raw = FBR_safeText_(value);
  if (FBR_ARTIFACT.CONSERVATION.indexOf(raw) >= 0) return raw;
  var s = FBR_norm_(raw);
  if (/30|trente|rotation/.test(s)) return '30_DERNIERS';
  if (/jalon/.test(s)) return 'JALON';
  if (/purge|supprim/.test(s)) return 'PURGE_APRÈS_REVUE';
  if (/permanent|conserver définitivement|canonique/.test(s)) return 'PERMANENTE';
  return 'LEGACY_À_REVOIR';
}

function FBR_normalizeCanonical_(value) {
  var raw = FBR_safeText_(value);
  if (FBR_ARTIFACT.CANONICAL.indexOf(raw) >= 0) return raw;
  return FBR_inferCanonical_(raw, '');
}

function FBR_inferCanonical_(canonicalText, statusText) {
  var s = FBR_norm_([canonicalText, statusText].join(' '));
  if (/remplac|supplant|obsol|ne plus utiliser|à purger|a purger|do not use/.test(s)) return 'NON';
  if (/canonique|baseline stable|architecture canonique|sheet actif|source de vérité|source de verite/.test(s)) return 'OUI';
  return 'À DÉTERMINER';
}

function FBR_createArtifactSnapshot_(traceId) {
  var spreadsheetId = FBR_ss_().getId();
  var stamp = Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyyMMdd_HHmmss');
  var vault = FBR_getArtifactPrivateVault_();
  var folder = vault.folder;
  var sourceFile = DriveApp.getFileById(spreadsheetId);
  var copyName = 'felibree_sheet_pre_artifact_change_' + stamp + '_' + traceId;
  var spreadsheetCopy = sourceFile.makeCopy(copyName, folder);
  FBR_forcePrivateArtifactFile_(spreadsheetCopy);
  var payload = {
    version: FBR_ARTIFACT.VERSION,
    createdAt: new Date().toISOString(),
    traceId: traceId,
    spreadsheetId: spreadsheetId,
    privateVaultId: folder.getId(),
    fullSpreadsheetCopy: {
      id: spreadsheetCopy.getId(),
      url: spreadsheetCopy.getUrl(),
      name: copyName
    },
    releases: FBR_snapshotSheet_(FBR.SHEETS.RELEASES),
    exports: FBR_snapshotSheet_(FBR.SHEETS.EXPORTS)
  };
  var name = 'felibree_artifact_registry_premerge_snapshot_' + stamp + '_' + traceId + '.json';
  var file = folder.createFile(name, JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);
  FBR_forcePrivateArtifactFile_(file);
  return {
    id: file.getId(),
    url: file.getUrl(),
    name: name,
    folderId: folder.getId(),
    folderUrl: 'https://drive.google.com/drive/folders/' + folder.getId(),
    privateVerified: true,
    spreadsheetCopyId: spreadsheetCopy.getId(),
    spreadsheetCopyUrl: spreadsheetCopy.getUrl(),
    spreadsheetCopyName: copyName
  };
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
  var jsonText = JSON.stringify(payload, null, 2);
  var created = FBR_createAccessibleArtifactReportFile_(name, jsonText);
  var mirror = FBR_writeArtifactReportMirrorToLogs_(jsonText, {
    mode: prefix,
    traceId: traceId,
    reportId: created.id,
    reportUrl: created.url,
    reportName: created.name,
    reportFolderId: created.folderId,
    sha256: created.sha256,
    byteLength: created.byteLength,
    sourceReleaseCount: plan.sourceReleaseCount,
    sourceExportCount: plan.sourceExportCount,
    finalCount: plan.finalRows.length,
    summary: payload.summary
  });
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, created.id);
  created.mirrorRows = mirror.rows;
  created.mirrorOk = mirror.ok;
  created.mirrorError = mirror.error || '';
  return created;
}

function FBR_getArtifactReportFolder_() {
  return FBR_getArtifactPrivateVault_();
}

function FBR_getArtifactPrivateVault_() {
  var props = PropertiesService.getScriptProperties();
  var propertyName = 'FELIBREE_ARTIFACT_PRIVATE_FOLDER_ID';
  var existingId = FBR_safeText_(props.getProperty(propertyName));
  if (existingId) {
    try {
      var existing = DriveApp.getFolderById(existingId);
      FBR_forcePrivateArtifactFolder_(existing);
      props.setProperty('FELIBREE_ARTIFACT_REPORT_FOLDER_ID', existing.getId());
      return { folder: existing, source: 'PRIVATE_ROOT_VAULT' };
    } catch (existingErr) {
      console.log('FBR private vault property invalid: ' + existingErr.message);
      props.deleteProperty(propertyName);
    }
  }

  var root = DriveApp.getRootFolder();
  var name = '🔒 FELIBREE 2027 — Artifact Registry privé';
  var matches = root.getFoldersByName(name);
  var folder = matches.hasNext() ? matches.next() : root.createFolder(name);
  if (matches.hasNext()) {
    throw new Error('Plusieurs coffres Artifact Registry privés portent le même nom. Renseigner ' + propertyName + ' avec l’ID canonique.');
  }
  FBR_forcePrivateArtifactFolder_(folder);
  props.setProperty(propertyName, folder.getId());
  props.setProperty('FELIBREE_ARTIFACT_REPORT_FOLDER_ID', folder.getId());
  return { folder: folder, source: 'PRIVATE_ROOT_VAULT' };
}

function FBR_driveApiJson_(method, url, payload) {
  var options = {
    method: method,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      Accept: 'application/json'
    }
  };
  if (payload !== undefined && payload !== null) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var text = response.getContentText() || '';
  if (code < 200 || code >= 300) {
    throw new Error('Drive API ' + method + ' HTTP ' + code + ' : ' + text.slice(0, 800));
  }
  return text ? JSON.parse(text) : {};
}

function FBR_driveApiFileSecurity_(fileId) {
  fileId = FBR_safeText_(fileId);
  if (!fileId) throw new Error('Drive file ID vide pour audit de sécurité.');
  var fields = 'id,name,mimeType,parents,permissions(id,type,role,emailAddress,domain,allowFileDiscovery,permissionDetails)';
  var url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '?supportsAllDrives=true&fields=' + encodeURIComponent(fields);
  var data = FBR_driveApiJson_('get', url, null);
  var permissions = data.permissions || [];
  var nonOwner = [];
  permissions.forEach(function (permission) {
    if (FBR_safeText_(permission.role).toLowerCase() === 'owner') return;
    var details = permission.permissionDetails || [];
    var inherited = false;
    details.forEach(function (detail) {
      if (detail && detail.inherited === true) inherited = true;
    });
    nonOwner.push({
      id: FBR_safeText_(permission.id),
      type: FBR_safeText_(permission.type),
      role: FBR_safeText_(permission.role),
      emailAddress: FBR_safeText_(permission.emailAddress),
      domain: FBR_safeText_(permission.domain),
      inherited: inherited,
      allowFileDiscovery: permission.allowFileDiscovery === true
    });
  });
  var publicPermissions = nonOwner.filter(function (permission) {
    return permission.type === 'anyone' || permission.type === 'domain';
  });
  return {
    id: fileId,
    name: FBR_safeText_(data.name),
    mimeType: FBR_safeText_(data.mimeType),
    parents: data.parents || [],
    permissions: permissions,
    nonOwner: nonOwner,
    publicPermissions: publicPermissions,
    ownerOnly: nonOwner.length === 0,
    summary: nonOwner.length === 0 ? 'OWNER_ONLY' : nonOwner.map(function (permission) {
      var principal = permission.emailAddress || permission.domain || permission.type || 'inconnu';
      return principal + ':' + permission.role + (permission.inherited ? ':HERITE' : ':EXPLICITE');
    }).join(', ')
  };
}

function FBR_driveApiDeletePermission_(fileId, permissionId) {
  var url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '/permissions/' + encodeURIComponent(permissionId) + '?supportsAllDrives=true';
  FBR_driveApiJson_('delete', url, null);
}

function FBR_hardenArtifactPermissionsById_(fileId) {
  var before = FBR_driveApiFileSecurity_(fileId);
  var failures = [];
  before.nonOwner.forEach(function (permission) {
    if (permission.inherited) return;
    if (!permission.id) {
      failures.push('permission sans ID : ' + (permission.emailAddress || permission.domain || permission.type));
      return;
    }
    try {
      FBR_driveApiDeletePermission_(fileId, permission.id);
    } catch (err) {
      failures.push(permission.id + ': ' + (err && err.message ? err.message : String(err)));
    }
  });
  var after = FBR_driveApiFileSecurity_(fileId);
  if (failures.length || !after.ownerOnly) {
    throw new Error('Durcissement permissions incomplet pour ' + fileId +
      ' ; suppressions=' + (failures.length ? failures.join(' | ') : 'OK') +
      ' ; droits restants=' + after.summary);
  }
  return after;
}

function FBR_forcePrivateArtifactFolder_(folder) {
  var audit = FBR_hardenArtifactPermissionsById_(folder.getId());
  if (!audit.ownerOnly) {
    throw new Error('Le coffre Artifact Registry n’est pas propriétaire-seul : ' + audit.summary + ' ; dossier=' + folder.getId());
  }
  return true;
}

function FBR_forcePrivateArtifactFile_(file) {
  var audit = FBR_hardenArtifactPermissionsById_(file.getId());
  if (!audit.ownerOnly) {
    throw new Error('Le fichier Artifact Registry n’est pas propriétaire-seul : ' + audit.summary + ' ; fichier=' + file.getId());
  }
  return true;
}

function FBR_isArtifactTechnicalFileName_(name) {
  return /^(felibree_artifact_merge_|felibree_artifact_report_REPUBLISHED_|felibree_artifact_registry_premerge_snapshot_|felibree_sheet_pre_artifact_change_)/i.test(FBR_safeText_(name));
}

function FBR_fileHasParent_(file, folderId) {
  var parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === folderId) return true;
  }
  return false;
}

function FBR_moveArtifactFileToVault_(file, vaultFolder) {
  var moved = false;
  if (!FBR_fileHasParent_(file, vaultFolder.getId())) {
    file.moveTo(vaultFolder);
    moved = true;
  }
  FBR_forcePrivateArtifactFile_(file);
  if (!FBR_fileHasParent_(file, vaultFolder.getId())) {
    throw new Error('Déplacement vers le coffre non confirmé pour ' + file.getId());
  }
  return moved;
}

function FBR_collectArtifactFilesFromFolder_(folder, byId) {
  if (!folder) return;
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (FBR_isArtifactTechnicalFileName_(file.getName())) byId[file.getId()] = file;
  }
}

function FBR_previewArtifactRegistryStorageHardening_() {
  var privateFolderId = FBR_getScriptProperty_('FELIBREE_ARTIFACT_PRIVATE_FOLDER_ID', '');
  var byId = {};
  var folders = {};

  function addFolder(folder) {
    if (folder) folders[folder.getId()] = folder;
  }
  function addFileId(id) {
    id = FBR_safeText_(id);
    if (!id || byId[id]) return;
    try { byId[id] = DriveApp.getFileById(id); } catch (err) { console.log('FBR hardening preview lookup failed ' + id + ': ' + err.message); }
  }

  try {
    var parents = DriveApp.getFileById(FBR_ss_().getId()).getParents();
    while (parents.hasNext()) addFolder(parents.next());
  } catch (parentErr) {
    console.log('FBR hardening preview spreadsheet parents failed: ' + parentErr.message);
  }
  try {
    addFolder(DriveApp.getFolderById(FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, FBR_SOURCE_BACKUP_DEFAULTS.FOLDER_ID)));
  } catch (backupFolderErr) {
    console.log('FBR hardening preview source backup folder failed: ' + backupFolderErr.message);
  }
  var legacyReportFolderId = FBR_getScriptProperty_('FELIBREE_ARTIFACT_REPORT_FOLDER_ID', '');
  if (legacyReportFolderId) {
    try { addFolder(DriveApp.getFolderById(legacyReportFolderId)); } catch (legacyFolderErr) { console.log('FBR hardening preview legacy folder failed: ' + legacyFolderErr.message); }
  }
  Object.keys(folders).forEach(function (id) { FBR_collectArtifactFilesFromFolder_(folders[id], byId); });
  addFileId(FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, ''));
  addFileId(FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, ''));
  addFileId(FBR_findLatestArtifactReportIdFromLogs_());

  var targets = [];
  Object.keys(byId).forEach(function (id) {
    var file = byId[id];
    if (!FBR_isArtifactTechnicalFileName_(file.getName())) return;
    var audit;
    var auditError = '';
    try {
      audit = FBR_driveApiFileSecurity_(id);
    } catch (err) {
      auditError = err && err.message ? err.message : String(err);
      audit = { ownerOnly: false, summary: 'AUDIT_INDISPONIBLE' };
    }
    var inPrivateFolder = privateFolderId ? FBR_fileHasParent_(file, privateFolderId) : false;
    targets.push({
      id: id,
      name: file.getName(),
      access: audit.summary,
      moveRequired: !inPrivateFolder,
      sharingRequired: !audit.ownerOnly,
      auditError: auditError
    });
  });
  targets.sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); });
  var previewLines = targets.slice(0, 20).map(function (target) {
    return target.name + ' [' + target.id + '] droits=' + target.access +
      ' déplacement=' + (target.moveRequired ? 'OUI' : 'NON') +
      (target.auditError ? ' audit=' + target.auditError : '');
  });
  return {
    ok: true,
    details: 'Coffre privé existant=' + (privateFolderId || 'NON — sera créé à la racine Drive') +
      ' ; fichiers techniques détectés=' + targets.length +
      ' ; à déplacer=' + targets.filter(function (target) { return target.moveRequired; }).length +
      ' ; partage à durcir=' + targets.filter(function (target) { return target.sharingRequired; }).length +
      ' ; audits indisponibles=' + targets.filter(function (target) { return !!target.auditError; }).length +
      (previewLines.length ? '\n' + previewLines.join('\n') : '') +
      (targets.length > 20 ? '\n… ' + (targets.length - 20) + ' fichier(s) supplémentaire(s).' : '')
  };
}

function FBR_hardenArtifactRegistryStorage_(traceId) {
  // Capturer l’ancien dossier avant que le coffre privé ne devienne la propriété canonique.
  var legacyReportFolderId = FBR_getScriptProperty_('FELIBREE_ARTIFACT_REPORT_FOLDER_ID', '');
  var vault = FBR_getArtifactPrivateVault_();
  var vaultFolder = vault.folder;
  var byId = {};
  var folders = {};

  function addFolder(folder) {
    if (folder) folders[folder.getId()] = folder;
  }
  function addFileId(id) {
    id = FBR_safeText_(id);
    if (!id || byId[id]) return;
    try { byId[id] = DriveApp.getFileById(id); } catch (err) { console.log('FBR hardening file lookup failed ' + id + ': ' + err.message); }
  }

  try {
    var parents = DriveApp.getFileById(FBR_ss_().getId()).getParents();
    while (parents.hasNext()) addFolder(parents.next());
  } catch (parentErr) {
    console.log('FBR hardening spreadsheet parents failed: ' + parentErr.message);
  }

  try {
    addFolder(DriveApp.getFolderById(FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, FBR_SOURCE_BACKUP_DEFAULTS.FOLDER_ID)));
  } catch (backupFolderErr) {
    console.log('FBR hardening source backup folder failed: ' + backupFolderErr.message);
  }

  if (legacyReportFolderId && legacyReportFolderId !== vaultFolder.getId()) {
    try { addFolder(DriveApp.getFolderById(legacyReportFolderId)); } catch (legacyFolderErr) { console.log('FBR hardening legacy report folder failed: ' + legacyFolderErr.message); }
  }

  Object.keys(folders).forEach(function (id) { FBR_collectArtifactFilesFromFolder_(folders[id], byId); });
  addFileId(FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, ''));
  addFileId(FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, ''));
  addFileId(FBR_findLatestArtifactReportIdFromLogs_());

  var ids = Object.keys(byId);
  var moved = 0;
  var alreadyPrivate = 0;
  var failures = [];
  ids.forEach(function (id) {
    var file = byId[id];
    if (!FBR_isArtifactTechnicalFileName_(file.getName())) return;
    try {
      if (FBR_moveArtifactFileToVault_(file, vaultFolder)) moved++; else alreadyPrivate++;
    } catch (err) {
      failures.push(id + ': ' + (err && err.message ? err.message : String(err)));
    }
  });
  if (failures.length) throw new Error('Durcissement partiel : ' + failures.join(' | '));

  var verify = FBR_verifyArtifactRegistryStorageSecurity_();
  if (!verify.ok) throw new Error(verify.details);
  return {
    ok: true,
    details: 'Trace=' + traceId + ' ; coffre=' + vaultFolder.getId() + ' ; déplacés=' + moved + ' ; déjà privés=' + alreadyPrivate + ' ; fichiers contrôlés=' + ids.length + ' ; ' + verify.details
  };
}

function FBR_verifyArtifactRegistryStorageSecurity_() {
  var vault = FBR_getArtifactPrivateVault_();
  var folder = vault.folder;
  var folderAudit;
  try {
    folderAudit = FBR_driveApiFileSecurity_(folder.getId());
  } catch (folderErr) {
    return { ok: false, details: 'Audit Drive API du coffre impossible : ' + (folderErr && folderErr.message ? folderErr.message : String(folderErr)) };
  }
  if (!folderAudit.ownerOnly) {
    return { ok: false, details: 'Coffre non privé : ' + folderAudit.summary + ' ; ID=' + folder.getId() };
  }

  var files = folder.getFiles();
  var checked = 0;
  var nonPrivateFiles = [];
  while (files.hasNext()) {
    var file = files.next();
    if (!FBR_isArtifactTechnicalFileName_(file.getName())) continue;
    checked++;
    try {
      var audit = FBR_driveApiFileSecurity_(file.getId());
      if (!audit.ownerOnly) nonPrivateFiles.push(file.getId() + ':' + audit.summary);
    } catch (err) {
      nonPrivateFiles.push(file.getId() + ':AUDIT_ERROR:' + (err && err.message ? err.message : String(err)));
    }
  }
  if (nonPrivateFiles.length) {
    return { ok: false, details: 'Fichiers Artifact non privés : ' + nonPrivateFiles.join(', ') };
  }

  var latestReport = FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, '');
  if (latestReport) {
    var reportFile = DriveApp.getFileById(latestReport);
    if (!FBR_fileHasParent_(reportFile, folder.getId())) {
      return { ok: false, details: 'Dernier rapport hors coffre privé : ' + latestReport };
    }
    var reportAudit = FBR_driveApiFileSecurity_(latestReport);
    if (!reportAudit.ownerOnly) {
      return { ok: false, details: 'Dernier rapport non privé : ' + latestReport + ' ; ' + reportAudit.summary };
    }
  }

  var latestSnapshot = FBR_getScriptProperty_(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, '');
  if (latestSnapshot) {
    var snapshotFile = DriveApp.getFileById(latestSnapshot);
    if (!FBR_fileHasParent_(snapshotFile, folder.getId())) {
      return { ok: false, details: 'Dernier snapshot hors coffre privé : ' + latestSnapshot };
    }
    var snapshotAudit = FBR_driveApiFileSecurity_(latestSnapshot);
    if (!snapshotAudit.ownerOnly) {
      return { ok: false, details: 'Dernier snapshot non privé : ' + latestSnapshot + ' ; ' + snapshotAudit.summary };
    }
  }

  return {
    ok: true,
    details: 'Coffre privé=' + folder.getId() + ' ; fichiers techniques privés=' + checked + ' ; dernier rapport=' + (latestReport || 'AUCUN') + ' ; dernier snapshot=' + (latestSnapshot || 'AUCUN')
  };
}

function FBR_createAccessibleArtifactReportFile_(name, jsonText) {
  var target = FBR_getArtifactReportFolder_();
  var file = target.folder.createFile(name, jsonText, MimeType.PLAIN_TEXT);
  try {
    file.setDescription('Félibrée 2027 — rapport Artifact Registry privé. Miroir complet disponible dans 🧾 Logs.');
  } catch (descriptionErr) {
    console.log('FBR report description failed: ' + descriptionErr.message);
  }
  FBR_forcePrivateArtifactFile_(file);

  var probe = FBR_probeArtifactReportFile_(file, jsonText);
  if (!probe.ok) throw new Error('Rapport créé mais contrôle privé/lecture immédiat en échec : ' + probe.details);
  return {
    id: file.getId(),
    url: file.getUrl(),
    name: name,
    folderId: target.folder.getId(),
    folderSource: target.source,
    folderUrl: 'https://drive.google.com/drive/folders/' + target.folder.getId(),
    sha256: FBR_sha256Hex_(jsonText),
    byteLength: Utilities.newBlob(jsonText, MimeType.PLAIN_TEXT).getBytes().length,
    accessVerified: true,
    privateVerified: true
  };
}

function FBR_probeArtifactReportFile_(file, expectedText) {
  try {
    var reopened = DriveApp.getFileById(file.getId());
    var text = reopened.getBlob().getDataAsString('UTF-8');
    var same = text === expectedText;
    var audit = FBR_driveApiFileSecurity_(reopened.getId());
    var isPrivate = audit.ownerOnly;
    return {
      ok: same && isPrivate,
      details: 'ID=' + reopened.getId() + ' ; nom=' + reopened.getName() + ' ; taille=' + reopened.getSize() + ' ; contenu_identique=' + same + ' ; droits=' + audit.summary + ' ; privé=' + isPrivate
    };
  } catch (err) {
    return { ok: false, details: err && err.message ? err.message : String(err) };
  }
}

function FBR_probeArtifactReportById_(id) {
  try {
    var file = DriveApp.getFileById(id);
    var text = file.getBlob().getDataAsString('UTF-8');
    JSON.parse(text);
    var audit = FBR_driveApiFileSecurity_(id);
    var isPrivate = audit.ownerOnly;
    return {
      ok: isPrivate,
      details: 'ID=' + id + ' ; nom=' + file.getName() + ' ; taille=' + file.getSize() + ' ; URL=' + file.getUrl() + ' ; JSON lisible=OUI ; droits=' + audit.summary + ' ; privé=' + isPrivate
    };
  } catch (err) {
    return { ok: false, details: err && err.message ? err.message : String(err) };
  }
}

function FBR_sha256Hex_(text) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return digest.map(function (b) {
    var value = b < 0 ? b + 256 : b;
    return ('0' + value.toString(16)).slice(-2);
  }).join('');
}

function FBR_writeArtifactReportMirrorToLogs_(jsonText, meta) {
  try {
    var chunkSize = 30000;
    var chunks = [];
    for (var offset = 0; offset < jsonText.length; offset += chunkSize) {
      chunks.push(jsonText.slice(offset, offset + chunkSize));
    }
    if (!chunks.length) chunks.push('{}');

    FBR_log_({
      functionName: 'FELIBREE_ARTIFACT_REPORT_INDEX',
      mode: meta.mode + '_REPORT',
      status: 'REPORT_PRIVATE_ACCESSIBLE',
      sheetName: FBR.SHEETS.RELEASES,
      rowsRead: Number(meta.sourceReleaseCount || 0) + Number(meta.sourceExportCount || 0),
      rowsChanged: meta.mode === 'APPLY' ? Number(meta.finalCount || 0) : 0,
      message: 'Rapport Artifact Registry accessible dans coffre Drive privé et miroir 🧾 Logs. Trace=' + meta.traceId + ' ; parties=' + chunks.length + ' ; Drive=' + meta.reportUrl,
      traceId: meta.traceId,
      notes: 'REPORT_ID=' + meta.reportId + ' ; REPORT_FOLDER_ID=' + meta.reportFolderId + ' ; PRIVATE=OUI ; SHA256=' + meta.sha256 + ' ; BYTES=' + meta.byteLength + ' ; ' + meta.summary
    });

    chunks.forEach(function (chunk, index) {
      FBR_log_({
        functionName: 'FELIBREE_ARTIFACT_REPORT_CHUNK',
        mode: meta.mode + '_REPORT',
        status: 'PART_' + (index + 1) + '_OF_' + chunks.length,
        sheetName: FBR.SHEETS.RELEASES,
        rowsRead: Number(meta.sourceReleaseCount || 0) + Number(meta.sourceExportCount || 0),
        rowsChanged: meta.mode === 'APPLY' ? Number(meta.finalCount || 0) : 0,
        message: 'Rapport JSON miroir — Trace=' + meta.traceId + ' — partie ' + (index + 1) + '/' + chunks.length,
        traceId: meta.traceId,
        notes: chunk
      });
    });
    return { ok: true, rows: chunks.length + 1 };
  } catch (err) {
    console.log('FBR_writeArtifactReportMirrorToLogs_ failed: ' + err.message);
    return { ok: false, rows: 0, error: err && err.message ? err.message : String(err) };
  }
}

function FBR_artifactReportReference_(report) {
  var lines = [
    'Rapport Drive: ' + report.url,
    'Rapport ID: ' + report.id,
    'Coffre rapport: ' + report.folderUrl + ' (' + report.folderSource + ')',
    'Partage Drive: ' + (report.privateVerified ? 'PRIVÉ' : 'NON VÉRIFIÉ'),
    'SHA256: ' + report.sha256,
    'Lecture immédiate Apps Script: ' + (report.accessVerified ? 'OK' : 'ÉCHEC'),
    'Miroir complet 🧾 Logs: ' + (report.mirrorOk ? (report.mirrorRows + ' ligne(s)') : ('ÉCHEC — ' + report.mirrorError))
  ];
  return lines.join('\n');
}

function FBR_findLatestArtifactReportIdFromLogs_() {
  var sheet = FBR_sheet_(FBR.SHEETS.LOGS, false);
  if (!sheet || sheet.getLastRow() < 5) return '';
  var values = sheet.getRange(5, 3, sheet.getLastRow() - 4, 11).getDisplayValues();
  for (var i = values.length - 1; i >= 0; i--) {
    var functionName = FBR_safeText_(values[i][0]);
    var message = FBR_safeText_(values[i][6]);
    var notes = FBR_safeText_(values[i][10]);
    if (!/ArtifactReport|ARTIFACT_REPORT|mergeExportsIntoReleases/i.test(functionName)) continue;
    var text = message + ' ' + notes;
    var explicit = text.match(/REPORT_ID=([A-Za-z0-9_-]{20,})/i);
    if (explicit) return explicit[1];
    var url = text.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{20,})/i);
    if (url) return url[1];
  }
  return '';
}

function FBR_republishArtifactReportToAccessibleLocation_(sourceId, traceId) {
  var source = DriveApp.getFileById(sourceId);
  var jsonText = source.getBlob().getDataAsString('UTF-8');
  var payload = JSON.parse(jsonText);
  var stamp = Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyyMMdd_HHmmss');
  var name = 'felibree_artifact_report_REPUBLISHED_' + stamp + '_' + traceId + '.json';
  var created = FBR_createAccessibleArtifactReportFile_(name, jsonText);
  var mirror = FBR_writeArtifactReportMirrorToLogs_(jsonText, {
    mode: FBR_safeText_(payload.mode) || 'REPUBLISH',
    traceId: FBR_safeText_(payload.traceId) || traceId,
    reportId: created.id,
    reportUrl: created.url,
    reportName: created.name,
    reportFolderId: created.folderId,
    sha256: created.sha256,
    byteLength: created.byteLength,
    sourceReleaseCount: Number(payload.sourceReleaseCount || 0),
    sourceExportCount: Number(payload.sourceExportCount || 0),
    finalCount: Number(payload.finalCount || 0),
    summary: FBR_safeText_(payload.summary) || 'Rapport republié depuis ' + sourceId
  });
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, created.id);
  created.mirrorRows = mirror.rows;
  created.mirrorOk = mirror.ok;
  created.mirrorError = mirror.error || '';
  return FBR_result_(true, 'Rapport Artifact Registry republié', 'Source=' + sourceId + '\n' + FBR_artifactReportReference_(created));
}

function FBR_artifactPlanSummary_(plan) {
  var counts = {};
  plan.actions.forEach(function (a) { counts[a.action] = (counts[a.action] || 0) + 1; });
  return 'Releases source=' + plan.sourceReleaseCount +
    ' ; Exports source=' + plan.sourceExportCount +
    ' ; Final=' + plan.finalRows.length +
    ' ; MERGE_EXISTING=' + (counts.MERGE_EXISTING || 0) +
    ' ; CREATE_NEW=' + (counts.CREATE_NEW || 0) +
    ' ; DUPLICATES_COLLAPSED=' + ((counts.DUPLICATE_EXISTING_COLLAPSED || 0)) +
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
