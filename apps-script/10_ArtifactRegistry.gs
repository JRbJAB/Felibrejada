/**
 * Registre canonique Releases / Backups / Exports.
 * UI_STRICT_CANON_V2 : ordre métier, emojis visibles, couleurs sémantiques,
 * listes ergonomiques et clés techniques préservées.
 * Une ligne = un objet logique unique.
 * Aucun onglet temporaire n'est créé.
 */

var FBR_ARTIFACT = {
  VERSION: 'v2.0.1-20260716-RANGE-FIX',
  SCHEMA_V1: 'V1_TECHNICAL',
  SCHEMA_V2: 'V2_UI_STRICT',
  SCHEMA_LEGACY: 'LEGACY_PREMERGE',
  IDX: {
    ID: 0,
    OBJECT: 1,
    STATUS: 2,
    CLASS: 3,
    TIMESTAMP: 4,
    VERSION: 5,
    OWNER: 6,
    RESULT: 7,
    DRIVE: 8,
    GITHUB: 9,
    SCOPE: 10,
    NOTES: 11,
    ROLLBACK: 12,
    CONSERVATION: 13,
    CANONICAL: 14,
    INTEGRITY: 15,
    REVIEW: 16,
    DRIVE_ID: 17,
    PATH: 18,
    KEY: 19
  },
  HEADERS: [
    '🆔 Registre ID',
    '📦 Objet / livrable',
    '🚦 Statut',
    '🏷️ Classe',
    '🕒 Horodatage',
    '🔖 Version / Trace ID',
    '👤 Responsable',
    '✅ Résultat',
    '🔗 Drive / fichier canonique',
    '🐙 GitHub / commit',
    '🧩 Périmètre / scripts',
    '📝 Notes',
    '↩️ Rollback / remplacé par',
    '🗄️ Conservation',
    '⭐ Canonique ?',
    '🔐 Intégrité / hash',
    '🔎 Revue / purge',
    '🆔 Drive ID',
    '📂 Chemin Drive',
    '🔑 Clé technique'
  ],
  CLASS_LABELS: {
    RELEASE: '🚀 Release',
    BACKUP_SCRIPT: '💾 Backup Apps Script',
    BACKUP_SHEET: '🗄️ Backup du Sheet',
    PACK: '📦 Pack',
    LIVRABLE: '📄 Livrable',
    DOCUMENTATION: '📚 Documentation',
    EXPORT: '📤 Export',
    MIRROR_GITHUB_SEUL: '🐙 Miroir GitHub',
    SNAPSHOT: '📸 Snapshot',
    ARCHIVE: '🗃️ Archive'
  },
  STATUS_LABELS: {
    CANONIQUE: '⭐ Canonique',
    'VALIDÉ_LIVE': '✅ Validé live',
    'PRÊT_NON_LIVE': '🔵 Prêt non live',
    PARTIEL: '🟠 Partiel',
    'À_REVOIR': '🟡 À revoir',
    'REMPLACÉ': '♻️ Remplacé',
    'ARCHIVÉ': '📦 Archivé',
    'À_PURGER': '🗑️ À purger',
    ERREUR: '🚨 Erreur'
  },
  CONSERVATION_LABELS: {
    PERMANENTE: '♾️ Permanente',
    '30_DERNIERS': '🔄 30 derniers',
    JALON: '📍 Jalon',
    'LEGACY_À_REVOIR': '🟡 Legacy à revoir',
    'PURGE_APRÈS_REVUE': '🗑️ Purge après revue'
  },
  CANONICAL_LABELS: {
    OUI: '✅ Oui',
    NON: '❌ Non',
    'À DÉTERMINER': '🟡 À déterminer'
  },
  TITLE: '📦 Releases & Backups — registre unique des releases, sauvegardes, exports et livrables',
  RULE: '🔒 Une ligne = un objet logique unique. Les preuves Drive et GitHub restent regroupées. Les clés techniques sont conservées et masquées.'
};

FBR_ARTIFACT.CLASSES = Object.keys(FBR_ARTIFACT.CLASS_LABELS).map(function (key) {
  return FBR_ARTIFACT.CLASS_LABELS[key];
});
FBR_ARTIFACT.STATUSES = Object.keys(FBR_ARTIFACT.STATUS_LABELS).map(function (key) {
  return FBR_ARTIFACT.STATUS_LABELS[key];
});
FBR_ARTIFACT.CONSERVATION = Object.keys(FBR_ARTIFACT.CONSERVATION_LABELS).map(function (key) {
  return FBR_ARTIFACT.CONSERVATION_LABELS[key];
});
FBR_ARTIFACT.CANONICAL = Object.keys(FBR_ARTIFACT.CANONICAL_LABELS).map(function (key) {
  return FBR_ARTIFACT.CANONICAL_LABELS[key];
});

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


function FELIBREE_artifactRegistryStrictUiV2DryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_artifactRegistryStrictUiV2DryRun',
    mode: 'UI_V2_DRY_RUN',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function () {
    var preview = FBR_previewArtifactRegistryUiV2_();
    if (!preview.ok) throw new Error(preview.details);
    return FBR_result_(true, 'Prévisualisation UI stricte V2', preview.details);
  });
}

function FELIBREE_applyArtifactRegistryStrictUiV2() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyArtifactRegistryStrictUiV2',
    mode: 'UI_V2_APPLY_WITH_PRIVATE_ROLLBACK',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function (context) {
    return FBR_applyArtifactRegistryUiV2Migration_(context.traceId);
  });
}

function FELIBREE_verifyArtifactRegistryStrictUiV2() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_verifyArtifactRegistryStrictUiV2',
    mode: 'UI_V2_VERIFY_READ_ONLY',
    sheetName: FBR.SHEETS.RELEASES,
    logStart: true
  }, function () {
    var verify = FBR_verifyArtifactRegistryUiV2_();
    if (!verify.ok) throw new Error(verify.details);
    return FBR_result_(true, 'UI stricte V2 vérifiée', verify.details);
  });
}


function FBR_ensureArtifactRegistryContainer_() {
  return FBR_sheet_(FBR.SHEETS.RELEASES, true);
}

function FBR_artifactHeaders_() {
  return FBR_ARTIFACT.HEADERS.slice();
}

function FBR_artifactSchemaVersion_(sheet) {
  sheet = sheet || FBR_sheet_(FBR.SHEETS.RELEASES, false);
  if (!sheet) return '';
  var c = FBR_safeText_(sheet.getRange(4, 3).getValue()).toLowerCase();
  var d = FBR_safeText_(sheet.getRange(4, 4).getValue()).toLowerCase();
  if (c.indexOf('statut') >= 0 && d.indexOf('classe') >= 0) return FBR_ARTIFACT.SCHEMA_V2;
  if (c.indexOf('classe') >= 0 && d.indexOf('objet') >= 0) return FBR_ARTIFACT.SCHEMA_V1;
  if (c.indexOf('version') >= 0 || c.indexOf('trace') >= 0) return FBR_ARTIFACT.SCHEMA_LEGACY;
  return '';
}

function FBR_artifactEnumKey_(value, labels) {
  var raw = FBR_safeText_(value);
  if (!raw) return '';
  if (Object.prototype.hasOwnProperty.call(labels, raw)) return raw;
  var keys = Object.keys(labels);
  for (var i = 0; i < keys.length; i++) {
    if (raw === labels[keys[i]]) return keys[i];
  }
  return raw;
}

function FBR_artifactEnumLabel_(value, labels, fallbackKey) {
  var key = FBR_artifactEnumKey_(value, labels);
  if (labels[key]) return labels[key];
  if (fallbackKey && labels[fallbackKey]) return labels[fallbackKey];
  return FBR_safeText_(value);
}

function FBR_artifactClassKey_(value) {
  return FBR_artifactEnumKey_(value, FBR_ARTIFACT.CLASS_LABELS);
}

function FBR_artifactStatusKey_(value) {
  return FBR_artifactEnumKey_(value, FBR_ARTIFACT.STATUS_LABELS);
}

function FBR_artifactConservationKey_(value) {
  return FBR_artifactEnumKey_(value, FBR_ARTIFACT.CONSERVATION_LABELS);
}

function FBR_artifactCanonicalKey_(value) {
  return FBR_artifactEnumKey_(value, FBR_ARTIFACT.CANONICAL_LABELS);
}

function FBR_artifactClassLabel_(value) {
  return FBR_artifactEnumLabel_(value, FBR_ARTIFACT.CLASS_LABELS, 'LIVRABLE');
}

function FBR_artifactStatusLabel_(value) {
  return FBR_artifactEnumLabel_(value, FBR_ARTIFACT.STATUS_LABELS, 'À_REVOIR');
}

function FBR_artifactConservationLabel_(value) {
  return FBR_artifactEnumLabel_(value, FBR_ARTIFACT.CONSERVATION_LABELS, 'LEGACY_À_REVOIR');
}

function FBR_artifactCanonicalLabel_(value) {
  return FBR_artifactEnumLabel_(value, FBR_ARTIFACT.CANONICAL_LABELS, 'À DÉTERMINER');
}

function FBR_artifactV1ToV2Row_(source) {
  var r = source.slice(0, 20);
  while (r.length < 20) r.push('');
  return [
    r[0], r[3], r[5], r[2], r[1], r[4], r[9], r[10], r[6], r[7],
    r[8], r[11], r[12], r[13], r[14], r[15], r[16], r[17], r[18], r[19]
  ];
}

function FBR_artifactV2ToV1Row_(source) {
  var I = FBR_ARTIFACT.IDX;
  var r = source.slice(0, 20);
  while (r.length < 20) r.push('');
  return [
    r[I.ID],
    r[I.TIMESTAMP],
    FBR_artifactClassKey_(r[I.CLASS]),
    r[I.OBJECT],
    r[I.VERSION],
    FBR_artifactStatusKey_(r[I.STATUS]),
    r[I.DRIVE],
    r[I.GITHUB],
    r[I.SCOPE],
    r[I.OWNER],
    r[I.RESULT],
    r[I.NOTES],
    r[I.ROLLBACK],
    FBR_artifactConservationKey_(r[I.CONSERVATION]),
    FBR_artifactCanonicalKey_(r[I.CANONICAL]),
    r[I.INTEGRITY],
    r[I.REVIEW],
    r[I.DRIVE_ID],
    r[I.PATH],
    r[I.KEY]
  ];
}

function FBR_artifactNormalizeV2Row_(source) {
  var I = FBR_ARTIFACT.IDX;
  var row = source.slice(0, 20);
  while (row.length < 20) row.push('');
  row[I.CLASS] = FBR_artifactClassLabel_(row[I.CLASS]);
  row[I.STATUS] = FBR_artifactStatusLabel_(row[I.STATUS]);
  row[I.CONSERVATION] = FBR_normalizeConservation_(row[I.CONSERVATION]);
  row[I.CANONICAL] = FBR_normalizeCanonical_(row[I.CANONICAL]);
  row[I.DRIVE_ID] = row[I.DRIVE_ID] || FBR_extractDriveId_(row[I.DRIVE]);
  row[I.KEY] = row[I.KEY] || FBR_buildArtifactKeyFromRow_(row);
  return row;
}

function FBR_artifactRowForSheetSchema_(row, schema) {
  row = FBR_artifactNormalizeV2Row_(row);
  return schema === FBR_ARTIFACT.SCHEMA_V1 ? FBR_artifactV2ToV1Row_(row) : row;
}


function FBR_readArtifactMigrationPayload_(sheet) {
  sheet = sheet || FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var schema = FBR_artifactSchemaVersion_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return { schema: schema, rows: [], notes: [], formulaCount: 0 };
  var rowCount = lastRow - 4;
  var range = sheet.getRange(5, 1, rowCount, 20);
  var values = range.getValues();
  var notes = range.getNotes();
  var formulas = range.getFormulas();
  var rowsOut = [];
  var notesOut = [];
  var formulaCount = 0;

  values.forEach(function (row, i) {
    var hasValue = row.some(function (value) { return FBR_safeText_(value) !== ''; });
    if (!hasValue) return;
    formulas[i].forEach(function (formula) {
      if (FBR_safeText_(formula) !== '') formulaCount++;
    });
    rowsOut.push(FBR_normalizeExistingReleaseRow_(row, schema));
    notesOut.push(schema === FBR_ARTIFACT.SCHEMA_V1 ? FBR_artifactV1ToV2Row_(notes[i]) : notes[i].slice(0, 20));
  });
  return { schema: schema, rows: rowsOut, notes: notesOut, formulaCount: formulaCount };
}

function FBR_ensureArtifactRegistrySheet_(applyUi) {
  var sheet = FBR_ensureArtifactRegistryContainer_();
  if (applyUi !== true) return sheet;
  var headers = FBR_artifactHeaders_();
  sheet.getRange(1, 1, 2, headers.length).breakApart();
  sheet.getRange('A1:C1').merge();
  sheet.getRange('A2:C2').merge();
  sheet.getRange(1, 1).setValue(FBR_ARTIFACT.TITLE);
  sheet.getRange(2, 1).setValue(FBR_ARTIFACT.RULE);
  sheet.getRange(4, 1, 1, headers.length).setValues([headers]);
  FBR_applyArtifactRegistryUi_(sheet);
  return sheet;
}

function FBR_applyArtifactRegistryUi_(sheet) {
  sheet = sheet || FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var maxCols = FBR_artifactHeaders_().length;
  var lastRow = Math.max(sheet.getLastRow(), 5);

  FBR_compactArtifactGrid_(sheet, Math.max(200, lastRow + 20), maxCols);
  var endRow = sheet.getMaxRows();
  sheet.setHiddenGridlines(true);
  sheet.setFrozenRows(4);
  sheet.setFrozenColumns(3);

  sheet.getRange(1, 1, 1, maxCols)
    .setBackground('#083F3C')
    .setFontColor('#FFFFFF')
    .setFontFamily('Arial')
    .setFontWeight('bold')
    .setFontSize(16)
    .setVerticalAlignment('middle');
  sheet.getRange('A1:C1').setHorizontalAlignment('left').setWrap(true);
  sheet.setRowHeight(1, 62);

  sheet.getRange(2, 1, 1, maxCols)
    .setBackground('#E7F2F1')
    .setFontColor('#334155')
    .setFontFamily('Arial')
    .setFontStyle('italic')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.getRange('A2:C2').setHorizontalAlignment('left');
  sheet.setRowHeight(2, 58);

  sheet.getRange(3, 1, 1, maxCols)
    .setBackground('#F8FAFC')
    .setFontFamily('Arial')
    .setFontWeight('bold')
    .setVerticalAlignment('middle')
    .setWrap(true);
  FBR_refreshArtifactKpis_(sheet);
  sheet.setRowHeight(3, 42);

  sheet.getRange(4, 1, 1, maxCols)
    .setBackground('#145B59')
    .setFontColor('#FFFFFF')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(4, 48);

  var widths = [120, 300, 155, 175, 145, 165, 150, 250, 285, 285, 220, 270, 240, 165, 150, 175, 185, 170, 230, 285];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });

  sheet.showColumns(1, maxCols);
  sheet.hideColumns(18, 3);

  var bodyRows = Math.max(1, endRow - 4);
  var body = sheet.getRange(5, 1, bodyRows, maxCols);
  body.setFontFamily('Arial').setFontSize(9).setVerticalAlignment('top').setWrap(true);
  sheet.getRange(5, 1, bodyRows, 1).setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#0F4442');
  sheet.getRange(5, 3, bodyRows, 2).setHorizontalAlignment('center').setBackground('#F2F9F9');
  sheet.getRange(5, 5, bodyRows, 1).setNumberFormat('yyyy-MM-dd HH:mm:ss').setHorizontalAlignment('center');
  sheet.getRange(5, 6, bodyRows, 1).setHorizontalAlignment('center');
  sheet.getRange(5, 7, bodyRows, 1).setHorizontalAlignment('center');
  sheet.getRange(5, 9, bodyRows, 2).setFontColor('#124A91').setFontLine('underline');
  sheet.getRange(5, 14, bodyRows, 4).setBackground('#FFFCF2');
  sheet.getRange(5, 18, bodyRows, 3).setBackground('#F1F5F9');

  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(4, 1, Math.max(2, lastRow - 3), maxCols).createFilter();

  FBR_setArtifactValidations_(sheet, endRow);
  FBR_setArtifactConditionalFormatting_(sheet, endRow);
}

function FBR_refreshArtifactKpis_(sheet) {
  sheet.getRange('A3:T3').clearContent();
  var sep = FBR_formulaSeparator_();
  var schema = FBR_artifactSchemaVersion_(sheet);
  var kpis;

  if (schema === FBR_ARTIFACT.SCHEMA_V1) {
    kpis = [
      ['📊 Total', '=MAX(0' + sep + 'COUNTA(A5:A))'],
      ['⭐ Canoniques', '=COUNTIF(O5:O' + sep + '"OUI")'],
      ['🟡 À revoir', '=COUNTIF(F5:F' + sep + '"À_REVOIR")'],
      ['🗑️ À purger', '=COUNTIF(F5:F' + sep + '"À_PURGER")'],
      ['⚠️ Doublons ID', '=SUMPRODUCT((A5:A<>"")*(COUNTIF(A5:A' + sep + 'A5:A)>1))'],
      ['🔑 Doublons clé', '=SUMPRODUCT((T5:T<>"")*(COUNTIF(T5:T' + sep + 'T5:T)>1))'],
      ['💾 Dernier backup script', '=IFERROR(MAX(FILTER(B5:B' + sep + 'C5:C="BACKUP_SCRIPT"))' + sep + '"")']
    ];
  } else {
    var yes = FBR_ARTIFACT.CANONICAL_LABELS.OUI;
    var review = FBR_ARTIFACT.STATUS_LABELS['À_REVOIR'];
    var purge = FBR_ARTIFACT.STATUS_LABELS['À_PURGER'];
    var backup = FBR_ARTIFACT.CLASS_LABELS.BACKUP_SCRIPT;
    kpis = [
      ['📊 Total', '=MAX(0' + sep + 'COUNTA(A5:A))'],
      ['⭐ Canoniques', '=COUNTIF(O5:O' + sep + '"' + yes + '")'],
      ['🟡 À revoir', '=COUNTIF(C5:C' + sep + '"' + review + '")'],
      ['🗑️ À purger', '=COUNTIF(C5:C' + sep + '"' + purge + '")'],
      ['⚠️ Doublons ID', '=SUMPRODUCT((A5:A<>"")*(COUNTIF(A5:A' + sep + 'A5:A)>1))'],
      ['🔑 Doublons clé', '=SUMPRODUCT((T5:T<>"")*(COUNTIF(T5:T' + sep + 'T5:T)>1))'],
      ['💾 Dernier backup script', '=IFERROR(MAX(FILTER(E5:E' + sep + 'D5:D="' + backup + '"))' + sep + '"")']
    ];
  }

  var col = 1;
  kpis.forEach(function (k) {
    sheet.getRange(3, col).setValue(k[0]);
    sheet.getRange(3, col + 1).setFormula(k[1]);
    col += 2;
  });
  ['B3', 'D3', 'F3', 'H3', 'J3', 'L3'].forEach(function (a1) {
    sheet.getRange(a1).setNumberFormat('0');
  });
  sheet.getRange('N3').setNumberFormat('yyyy-MM-dd HH:mm');
  sheet.getRange('B3').setBackground('#DDF3F1').setFontColor('#0F4442').setFontSize(12);
  sheet.getRange('D3').setBackground('#D9F5E2').setFontColor('#166534').setFontSize(12);
  ['F3', 'H3', 'J3', 'L3'].forEach(function (a1) {
    sheet.getRange(a1).setBackground('#F1F5F9').setFontColor('#334155').setFontSize(12);
  });
  sheet.getRange('N3').setBackground('#DBEAFE').setFontColor('#1D4ED8');
}

function FBR_setArtifactValidations_(sheet, endRow) {
  var classRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.CLASSES, true).setAllowInvalid(false).build();
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.STATUSES, true).setAllowInvalid(false).build();
  var retentionRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.CONSERVATION, true).setAllowInvalid(false).build();
  var canonicalRule = SpreadsheetApp.newDataValidation().requireValueInList(FBR_ARTIFACT.CANONICAL, true).setAllowInvalid(false).build();
  sheet.getRange(5, 4, endRow - 4, 1).setDataValidation(classRule);
  sheet.getRange(5, 3, endRow - 4, 1).setDataValidation(statusRule);
  sheet.getRange(5, 14, endRow - 4, 1).setDataValidation(retentionRule);
  sheet.getRange(5, 15, endRow - 4, 1).setDataValidation(canonicalRule);
}

function FBR_setArtifactConditionalFormatting_(sheet, endRow) {
  var statusRange = sheet.getRange(5, 3, endRow - 4, 1);
  var canonicalRange = sheet.getRange(5, 15, endRow - 4, 1);
  var reviewRange = sheet.getRange(5, 17, endRow - 4, 1);
  var fullRange = sheet.getRange(5, 1, endRow - 4, 17);
  var sep = FBR_formulaSeparator_();
  var S = FBR_ARTIFACT.STATUS_LABELS;
  var C = FBR_ARTIFACT.CANONICAL_LABELS;
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenNumberEqualTo(0).setBackground('#DCFCE7').setFontColor('#166534').setBold(true).setRanges([sheet.getRange('F3'), sheet.getRange('H3'), sheet.getRange('J3'), sheet.getRange('L3')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#FEF3C7').setFontColor('#92400E').setBold(true).setRanges([sheet.getRange('F3')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#FECACA').setFontColor('#991B1B').setBold(true).setRanges([sheet.getRange('H3'), sheet.getRange('J3'), sheet.getRange('L3')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S.CANONIQUE).setBackground('#B7E4C7').setFontColor('#14532D').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S['VALIDÉ_LIVE']).setBackground('#DCFCE7').setFontColor('#166534').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S['PRÊT_NON_LIVE']).setBackground('#DBEAFE').setFontColor('#1D4ED8').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S.PARTIEL).setBackground('#FFEDD5').setFontColor('#9A3412').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S['À_REVOIR']).setBackground('#FEF3C7').setFontColor('#92400E').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S['REMPLACÉ']).setBackground('#E5E7EB').setFontColor('#4B5563').setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S['ARCHIVÉ']).setBackground('#E5E7EB').setFontColor('#64748B').setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S['À_PURGER']).setBackground('#FECACA').setFontColor('#991B1B').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S.ERREUR).setBackground('#B91C1C').setFontColor('#FFFFFF').setBold(true).setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(C.OUI).setBackground('#DCFCE7').setFontColor('#166534').setBold(true).setRanges([canonicalRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(C.NON).setBackground('#FEE2E2').setFontColor('#991B1B').setBold(true).setRanges([canonicalRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(C['À DÉTERMINER']).setBackground('#FEF3C7').setFontColor('#92400E').setBold(true).setRanges([canonicalRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR($C5="' + S['À_PURGER'] + '"' + sep + '$C5="' + S.ERREUR + '")').setBackground('#FFF1F2').setRanges([fullRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($A5<>""' + sep + 'COUNTIF($A$5:$A' + sep + '$A5)>1)').setBackground('#B91C1C').setFontColor('#FFFFFF').setRanges([sheet.getRange(5, 1, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($T5<>""' + sep + 'COUNTIF($T$5:$T' + sep + '$T5)>1)').setBackground('#B91C1C').setFontColor('#FFFFFF').setRanges([sheet.getRange(5, 20, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($O5="' + C.OUI + '"' + sep + '$P5="")').setBackground('#FEF3C7').setRanges([sheet.getRange(5, 16, endRow - 4, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('REVUE').setBackground('#FEF3C7').setFontColor('#92400E').setRanges([reviewRange]).build()
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

function FBR_previewArtifactRegistryUiV2_() {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var payload = FBR_readArtifactMigrationPayload_(sheet);
  var schema = payload.schema;
  if (schema !== FBR_ARTIFACT.SCHEMA_V1 && schema !== FBR_ARTIFACT.SCHEMA_V2) {
    return { ok: false, details: 'Schéma non compatible avec la migration UI V2 : ' + (schema || 'INCONNU') };
  }
  if (payload.formulaCount > 0) {
    return { ok: false, details: 'Migration bloquée : ' + payload.formulaCount + ' formule(s) détectée(s) dans le corps du registre. Revue obligatoire avant réordonnancement.' };
  }
  var verify = FBR_verifyArtifactRegistry_(false);
  if (!verify.ok) return { ok: false, details: 'Registry invalide avant migration : ' + verify.details };
  return {
    ok: true,
    details: 'Schéma actuel=' + schema +
      ' ; lignes=' + payload.rows.length +
      ' ; formules corps=0' +
      ' ; notes cellule préservées=' + payload.notes.reduce(function (total, row) {
        return total + row.filter(function (note) { return FBR_safeText_(note) !== ''; }).length;
      }, 0) +
      ' ; cible=' + FBR_ARTIFACT.SCHEMA_V2 +
      ' ; ordre cible=ID → objet → statut → classe → date/version → responsable/résultat → preuves → gouvernance → technique' +
      ' ; emojis listes=' + (FBR_ARTIFACT.CLASSES.length + FBR_ARTIFACT.STATUSES.length + FBR_ARTIFACT.CONSERVATION.length + FBR_ARTIFACT.CANONICAL.length) +
      ' ; purge=0 ; snapshot privé et copie complète créés avant écriture.'
  };
}

function FBR_applyArtifactRegistryUiV2Migration_(traceId) {
  var preview = FBR_previewArtifactRegistryUiV2_();
  if (!preview.ok) throw new Error(preview.details);
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var payload = FBR_readArtifactMigrationPayload_(sheet);
  var schema = payload.schema;
  var snapshot = FBR_createArtifactSnapshot_(traceId);

  FBR_writeArtifactDataset_(payload.rows);
  if (payload.notes.length) {
    sheet.getRange(5, 1, payload.notes.length, 20).setNotes(payload.notes);
  }
  SpreadsheetApp.flush();

  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, snapshot.id);
  var verify = FBR_verifyArtifactRegistryUiV2_();
  if (!verify.ok) {
    throw new Error('UI V2 écrite mais contrôle final en échec. Rollback disponible : ' + verify.details);
  }
  return FBR_result_(
    true,
    schema === FBR_ARTIFACT.SCHEMA_V2 ? 'UI stricte V2 réappliquée' : 'UI stricte V2 migrée',
    'Trace=' + traceId +
      ' ; ancien schéma=' + schema +
      ' ; lignes=' + payload.rows.length +
      ' ; snapshot JSON=' + snapshot.url +
      ' ; copie Sheet=' + snapshot.spreadsheetCopyUrl +
      ' ; ' + verify.details
  );
}

function FBR_hasExactMergedRange_(sheet, a1Notation) {
  var target = sheet.getRange(a1Notation);
  var merges = target.getMergedRanges();
  for (var i = 0; i < merges.length; i++) {
    if (merges[i].getA1Notation() === a1Notation) return true;
  }
  return false;
}

function FBR_verifyArtifactRegistryUiV2_() {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var schema = FBR_artifactSchemaVersion_(sheet);
  var registry = FBR_verifyArtifactRegistry_(false);
  var headers = sheet.getRange(4, 1, 1, 20).getDisplayValues()[0];
  var headerIssues = [];
  FBR_artifactHeaders_().forEach(function (header, i) {
    if (headers[i] !== header) headerIssues.push((i + 1) + ':' + headers[i]);
  });
  var issues = [];
  if (schema !== FBR_ARTIFACT.SCHEMA_V2) issues.push('schéma=' + schema);
  if (!FBR_hasExactMergedRange_(sheet, 'A1:C1')) issues.push('fusion A1:C1 absente ou incorrecte');
  if (!FBR_hasExactMergedRange_(sheet, 'A2:C2')) issues.push('fusion A2:C2 absente ou incorrecte');
  if (sheet.getFrozenRows() < 4) issues.push('lignes figées=' + sheet.getFrozenRows());
  if (sheet.getFrozenColumns() < 3) issues.push('colonnes figées=' + sheet.getFrozenColumns());
  if (headerIssues.length) issues.push('en-têtes non conformes=' + headerIssues.length);
  if (!registry.ok) issues.push(registry.details);
  return {
    ok: issues.length === 0,
    details: issues.length
      ? issues.join(' ; ')
      : 'Schéma V2 OK ; A1:C1 et A2:C2 fusionnées ; A:C figées ; 20 en-têtes emoji ; listes emoji actives ; couleurs sémantiques actives ; ' + registry.details
  };
}

function FBR_mergeExportsIntoReleases_(dryRun, traceId) {
  FBR_ensureArtifactRegistryContainer_();
  var releases = FBR_readReleaseArtifacts_();
  var legacy = FBR_readLegacyExports_();
  var plan = FBR_buildArtifactMergePlan_(releases, legacy);
  var report = FBR_writeArtifactReport_(plan, dryRun, traceId);

  if (dryRun) {
    return FBR_result_(true, 'Fusion Exports → Releases — dry-run', FBR_artifactPlanSummary_(plan) + '\n' + FBR_artifactReportReference_(report));
  }

  var snapshot = FBR_createArtifactSnapshot_(traceId);
  FBR_writeArtifactDataset_(plan.finalRows);
  SpreadsheetApp.flush();
  var legacySheet = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  if (legacySheet) legacySheet.hideSheet();
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, snapshot.id);
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_REPORT_ID, report.id);

  var verify = FBR_verifyArtifactRegistry_(true);
  if (!verify.ok) throw new Error('Fusion écrite mais gates en échec. Utiliser rollback. ' + verify.details);
  return FBR_result_(true, 'Fusion Exports → Releases — APPLY', FBR_artifactPlanSummary_(plan) + '\nSnapshot JSON: ' + snapshot.url + '\nCopie Sheet complète: ' + snapshot.spreadsheetCopyUrl + '\n' + FBR_artifactReportReference_(report));
}

function FBR_readReleaseArtifacts_() {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return [];
  var schema = FBR_artifactSchemaVersion_(sheet);
  var raw = sheet.getRange(5, 1, lastRow - 4, 20).getValues();
  return raw
    .filter(function (r) { return r.some(function (v) { return FBR_safeText_(v) !== ''; }); })
    .map(function (r) { return FBR_normalizeExistingReleaseRow_(r, schema); });
}

function FBR_readLegacyExports_() {
  var sheet = FBR_sheet_(FBR.SHEETS.EXPORTS, false);
  if (!sheet || sheet.getLastRow() < 5) return [];
  return sheet.getRange(5, 1, sheet.getLastRow() - 4, 10).getValues()
    .filter(function (r) { return r.some(function (v) { return FBR_safeText_(v) !== ''; }); })
    .map(FBR_legacyExportRowToArtifact_);
}

function FBR_normalizeExistingReleaseRow_(r, schema) {
  var I = FBR_ARTIFACT.IDX;
  var raw = r.slice(0, 20);
  while (raw.length < 20) raw.push('');

  if (schema === FBR_ARTIFACT.SCHEMA_LEGACY || FBR_isLegacyReleaseRow_(raw, schema)) {
    var legacy = raw.slice();
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

    raw = [
      legacy[0],
      legacy[3],
      FBR_normalizeArtifactStatus_(legacy[4]),
      FBR_classifyArtifact_(legacy[3], legacy[5], legacy[6]),
      legacy[1],
      legacy[2],
      legacy[8],
      legacy[9],
      legacy[5],
      legacy[6],
      legacy[7],
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
  } else if (schema === FBR_ARTIFACT.SCHEMA_V1) {
    raw = FBR_artifactV1ToV2Row_(raw);
  }

  raw = FBR_artifactNormalizeV2Row_(raw);
  raw[I.KEY] = raw[I.KEY] || FBR_buildArtifactKeyFromRow_(raw);
  return raw;
}

function FBR_legacyExportRowToArtifact_(r) {
  var I = FBR_ARTIFACT.IDX;
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
  var statusKey = FBR_artifactStatusKey_(status);
  var canonical = statusKey === 'CANONIQUE' || statusKey === 'VALIDÉ_LIVE'
    ? FBR_artifactCanonicalLabel_('OUI')
    : FBR_artifactCanonicalLabel_('À DÉTERMINER');
  if (/ignorer|do_not_use|à ignorer/i.test(type + ' ' + rawStatus + ' ' + notes)) {
    status = FBR_artifactStatusLabel_('À_PURGER');
    canonical = FBR_artifactCanonicalLabel_('NON');
  }
  var row = [
    '',
    type || source,
    status,
    cls,
    when,
    trace || FBR_safeText_(r[2]),
    owner,
    rawStatus,
    '',
    '',
    source,
    notes,
    '',
    FBR_artifactConservationLabel_('LEGACY_À_REVOIR'),
    canonical,
    '',
    'REVUE REQUISE',
    driveId,
    '',
    ''
  ];
  if (/github|git_tree/i.test(type + ' ' + format + ' ' + mode)) row[I.GITHUB] = link;
  else row[I.DRIVE] = link;
  if (sha && !row[I.GITHUB]) row[I.GITHUB] = 'https://github.com/' + FBR_GITHUB_DEFAULTS.OWNER + '/' + FBR_GITHUB_DEFAULTS.REPO + '/commit/' + sha;
  row[I.KEY] = FBR_buildArtifactKeyFromRow_(row);
  return row;
}

function FBR_buildArtifactMergePlan_(existing, legacy) {
  var I = FBR_ARTIFACT.IDX;
  var byKey = {};
  var actions = [];
  existing.forEach(function (row, index) {
    var key = row[I.KEY] || FBR_buildArtifactKeyFromRow_(row);
    row[I.KEY] = key;
    if (!byKey[key]) byKey[key] = row;
    else {
      byKey[key] = FBR_mergeArtifactRows_(byKey[key], row);
      actions.push({ action: 'DUPLICATE_EXISTING_COLLAPSED', source: 'RELEASES', index: index + 5, key: key });
    }
  });

  var grouped = {};
  legacy.forEach(function (row, index) {
    var trace = FBR_safeText_(row[I.VERSION]);
    var groupKey = trace ? 'TRACE|' + trace : row[I.KEY];
    if (!grouped[groupKey]) grouped[groupKey] = row;
    else grouped[groupKey] = FBR_mergeArtifactRows_(grouped[groupKey], row);
    actions.push({ action: 'SOURCE_READ', source: 'EXPORTS', index: index + 5, key: groupKey });
  });

  Object.keys(grouped).forEach(function (groupKey) {
    var incoming = grouped[groupKey];
    var key = incoming[I.KEY] || FBR_buildArtifactKeyFromRow_(incoming);
    incoming[I.KEY] = key;
    var matchKey = FBR_findCompatibleArtifactKey_(byKey, incoming);
    if (matchKey) {
      byKey[matchKey] = FBR_mergeArtifactRows_(byKey[matchKey], incoming);
      byKey[matchKey][I.KEY] = FBR_buildArtifactKeyFromRow_(byKey[matchKey]);
      actions.push({ action: 'MERGE_EXISTING', source: 'EXPORTS', key: key, target: matchKey });
    } else {
      byKey[key] = incoming;
      actions.push({ action: FBR_artifactStatusKey_(incoming[I.STATUS]) === 'À_PURGER' ? 'PURGE' : 'CREATE_NEW', source: 'EXPORTS', key: key });
    }
  });

  var rows = Object.keys(byKey).map(function (key) { return byKey[key]; });
  FBR_repairArtifactIds_(rows, actions);
  rows.sort(function (a, b) {
    var da = FBR_dateSortValue_(a[I.TIMESTAMP]);
    var db = FBR_dateSortValue_(b[I.TIMESTAMP]);
    return db - da;
  });
  return { finalRows: rows, actions: actions, sourceReleaseCount: existing.length, sourceExportCount: legacy.length };
}

function FBR_findCompatibleArtifactKey_(byKey, incoming) {
  var I = FBR_ARTIFACT.IDX;
  if (byKey[incoming[I.KEY]]) return incoming[I.KEY];
  var incomingDrive = FBR_safeText_(incoming[I.DRIVE_ID]) || FBR_extractDriveId_(incoming[I.DRIVE]);
  var incomingSha = FBR_extractGithubSha_(incoming[I.GITHUB] + ' ' + incoming[I.NOTES]);
  var incomingTrace = FBR_safeText_(incoming[I.VERSION]);
  var keys = Object.keys(byKey);
  for (var i = 0; i < keys.length; i++) {
    var row = byKey[keys[i]];
    if (incomingDrive && (FBR_safeText_(row[I.DRIVE_ID]) === incomingDrive || FBR_extractDriveId_(row[I.DRIVE]) === incomingDrive)) return keys[i];
    if (incomingSha && FBR_extractGithubSha_(row[I.GITHUB] + ' ' + row[I.NOTES]) === incomingSha) return keys[i];
    if (incomingTrace && FBR_safeText_(row[I.VERSION]).indexOf(incomingTrace) >= 0) return keys[i];
  }
  return '';
}

function FBR_mergeArtifactRows_(base, incoming) {
  var I = FBR_ARTIFACT.IDX;
  var out = FBR_artifactNormalizeV2Row_(base);
  incoming = FBR_artifactNormalizeV2Row_(incoming);
  for (var i = 0; i < 20; i++) {
    if (FBR_safeText_(out[i]) === '' && FBR_safeText_(incoming[i]) !== '') out[i] = incoming[i];
  }
  if (!out[I.DRIVE] && incoming[I.DRIVE]) out[I.DRIVE] = incoming[I.DRIVE];
  if (!out[I.GITHUB] && incoming[I.GITHUB]) out[I.GITHUB] = incoming[I.GITHUB];
  if (incoming[I.NOTES] && FBR_safeText_(out[I.NOTES]).indexOf(incoming[I.NOTES]) < 0) {
    out[I.NOTES] = [out[I.NOTES], incoming[I.NOTES]].filter(Boolean).join(' | ');
  }
  if (incoming[I.RESULT] && FBR_safeText_(out[I.RESULT]).indexOf(incoming[I.RESULT]) < 0) {
    out[I.RESULT] = [out[I.RESULT], incoming[I.RESULT]].filter(Boolean).join(' | ');
  }
  if (FBR_artifactClassKey_(out[I.CLASS]) === 'MIRROR_GITHUB_SEUL' && out[I.DRIVE]) {
    out[I.CLASS] = FBR_artifactClassLabel_('BACKUP_SCRIPT');
  }
  if (FBR_artifactClassKey_(incoming[I.CLASS]) === 'BACKUP_SCRIPT') {
    out[I.CLASS] = FBR_artifactClassLabel_('BACKUP_SCRIPT');
  }
  if (out[I.DRIVE] && out[I.GITHUB] && FBR_artifactStatusKey_(out[I.STATUS]) !== 'À_PURGER') {
    out[I.STATUS] = FBR_artifactStatusLabel_('VALIDÉ_LIVE');
  }
  out[I.DRIVE_ID] = out[I.DRIVE_ID] || FBR_extractDriveId_(out[I.DRIVE]);
  out[I.KEY] = FBR_buildArtifactKeyFromRow_(out);
  return out;
}

function FBR_repairArtifactIds_(rows, actions) {
  var I = FBR_ARTIFACT.IDX;
  var seen = {};
  var max = { REL: 0, BKP: 0, ART: 0 };
  rows.forEach(function (r) {
    var id = FBR_safeText_(r[I.ID]);
    var m = id.match(/^(REL|BKP(?:-SH)?|ART)-(\d+)$/i);
    if (m) {
      var family = m[1].toUpperCase().indexOf('BKP') === 0 ? 'BKP' : m[1].toUpperCase();
      max[family] = Math.max(max[family] || 0, Number(m[2]));
    }
  });
  rows.forEach(function (r) {
    var old = FBR_safeText_(r[I.ID]);
    var oldKey = old.toUpperCase();
    if (!old || seen[oldKey]) {
      var classKey = FBR_artifactClassKey_(r[I.CLASS]);
      var prefix = classKey === 'RELEASE' ? 'REL' : (classKey.indexOf('BACKUP') === 0 ? 'BKP' : 'ART');
      max[prefix] = (max[prefix] || 0) + 1;
      r[I.ID] = prefix + '-' + ('0000' + max[prefix]).slice(-4);
      if (old) r[I.NOTES] = [r[I.NOTES], 'ID legacy dupliqué remplacé : ' + old].filter(Boolean).join(' | ');
      actions.push({ action: old ? 'REPAIR_DUPLICATE_ID' : 'ASSIGN_ID', oldId: old, newId: r[I.ID], key: r[I.KEY] });
    }
    seen[FBR_safeText_(r[I.ID]).toUpperCase()] = true;
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
  var I = FBR_ARTIFACT.IDX;
  FBR_assertArtifactRegistryMigrated_();
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var schema = FBR_artifactSchemaVersion_(sheet);
  artifact = FBR_artifactNormalizeV2Row_(artifact);
  var key = artifact[I.KEY];
  var lastRow = sheet.getLastRow();
  if (lastRow >= 5) {
    var keys = sheet.getRange(5, 20, lastRow - 4, 1).getValues();
    for (var i = 0; i < keys.length; i++) {
      if (FBR_safeText_(keys[i][0]) === key) {
        var currentRaw = sheet.getRange(5 + i, 1, 1, 20).getValues()[0];
        var current = FBR_normalizeExistingReleaseRow_(currentRaw, schema);
        var merged = FBR_mergeArtifactRows_(current, artifact);
        if (!merged[I.ID]) merged[I.ID] = FBR_nextArtifactId_(merged[I.CLASS]);
        sheet.getRange(5 + i, 1, 1, 20).setValues([FBR_artifactRowForSheetSchema_(merged, schema)]);
        FBR_refreshArtifactKpis_(sheet);
        return { action: 'UPDATE', row: 5 + i, key: key };
      }
    }
  }
  if (!artifact[I.ID]) artifact[I.ID] = FBR_nextArtifactId_(artifact[I.CLASS]);
  var targetRow = Math.max(sheet.getLastRow() + 1, 5);
  if (targetRow > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), targetRow - sheet.getMaxRows());
  sheet.getRange(targetRow, 1, 1, 20).setValues([FBR_artifactRowForSheetSchema_(artifact, schema)]);
  FBR_refreshArtifactKpis_(sheet);
  return { action: 'CREATE', row: targetRow, key: key };
}

function FBR_nextArtifactId_(cls) {
  var key = FBR_artifactClassKey_(cls);
  var prefix = key === 'RELEASE' ? 'REL' : (key.indexOf('BACKUP') === 0 ? 'BKP' : 'ART');
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
  var normalized = rows.map(FBR_artifactNormalizeV2Row_);
  var requiredRows = Math.max(200, normalized.length + 24);
  FBR_compactArtifactGrid_(sheet, requiredRows, 20);
  var clearRows = Math.max(1, sheet.getMaxRows() - 4);
  sheet.getRange(5, 1, clearRows, 20).clearContent().clearDataValidations().clearNote();
  if (normalized.length) sheet.getRange(5, 1, normalized.length, 20).setValues(normalized);
  FBR_ensureArtifactRegistrySheet_(true);
}

function FBR_verifyArtifactRegistry_(allowLegacyPresent) {
  var I = FBR_ARTIFACT.IDX;
  SpreadsheetApp.flush();
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var schema = FBR_artifactSchemaVersion_(sheet);
  var lastRow = sheet.getLastRow();
  var rawRows = lastRow >= 5
    ? sheet.getRange(5, 1, lastRow - 4, 20).getValues().filter(function (r) { return FBR_safeText_(r[0]) !== ''; })
    : [];
  var rows = rawRows.map(function (r) { return FBR_normalizeExistingReleaseRow_(r, schema); });
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
    var id = FBR_safeText_(r[I.ID]);
    var idKey = id.toUpperCase();
    var key = FBR_safeText_(r[I.KEY]);
    if (ids[idKey]) duplicateIds.push(id); else ids[idKey] = true;
    if (!key) missingKeys.push(rowNumber);
    else if (keys[key]) duplicateKeys.push(key); else keys[key] = true;
    if (!FBR_ARTIFACT.CLASS_LABELS[FBR_artifactClassKey_(r[I.CLASS])]) invalidClasses.push(rowNumber);
    if (!FBR_ARTIFACT.STATUS_LABELS[FBR_artifactStatusKey_(r[I.STATUS])]) invalidStatuses.push(rowNumber);
    if (!FBR_ARTIFACT.CONSERVATION_LABELS[FBR_artifactConservationKey_(r[I.CONSERVATION])]) invalidConservation.push(rowNumber);
    if (!FBR_ARTIFACT.CANONICAL_LABELS[FBR_artifactCanonicalKey_(r[I.CANONICAL])]) invalidCanonical.push(rowNumber);
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
  return FBR_result_(
    issues.length === 0,
    issues.length ? 'Registry en échec' : 'Registry OK',
    issues.length ? issues.join(' ; ') : 'Lignes=' + rows.length + ' ; schéma=' + schema + ' ; IDs, clés, enums et KPI valides.'
  );
}

function FBR_restoreLegacyReleasesView_(traceId) {
  var sheet = FBR_sheet_(FBR.SHEETS.RELEASES, true);
  var schema = FBR_artifactSchemaVersion_(sheet);
  if (schema !== FBR_ARTIFACT.SCHEMA_LEGACY) {
    throw new Error('Réparation legacy refusée : schéma actuel=' + schema + '.');
  }
  var snapshot = FBR_createArtifactSnapshot_(traceId);
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ARTIFACT_MERGE_LAST_SNAPSHOT_ID, snapshot.id);
  return FBR_result_(true, 'Vue legacy déjà détectée', 'Aucune donnée modifiée. Snapshot=' + snapshot.url);
}

function FBR_isArtifactRegistryMigrated_() {
  var schema = FBR_artifactSchemaVersion_();
  return schema === FBR_ARTIFACT.SCHEMA_V1 || schema === FBR_ARTIFACT.SCHEMA_V2;
}

function FBR_assertArtifactRegistryMigrated_() {
  if (!FBR_isArtifactRegistryMigrated_()) {
    throw new Error('Registre non migré : écriture directe dans 📦 Releases & Backups bloquée.');
  }
}

function FBR_isLegacyReleaseRow_(row, schema) {
  if (!row || !row.length) return false;
  if (schema === FBR_ARTIFACT.SCHEMA_LEGACY) return true;
  if (schema === FBR_ARTIFACT.SCHEMA_V1 || schema === FBR_ARTIFACT.SCHEMA_V2) return false;
  var classCandidate = FBR_artifactClassKey_(row[2]);
  return !FBR_ARTIFACT.CLASS_LABELS[classCandidate] && FBR_safeText_(row[0]) !== '' && FBR_safeText_(row[3]) !== '';
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
  var key = FBR_artifactConservationKey_(value);
  if (FBR_ARTIFACT.CONSERVATION_LABELS[key]) return FBR_artifactConservationLabel_(key);
  var s = FBR_norm_(value);
  if (/30|trente|rotation/.test(s)) return FBR_artifactConservationLabel_('30_DERNIERS');
  if (/jalon/.test(s)) return FBR_artifactConservationLabel_('JALON');
  if (/purge|supprim/.test(s)) return FBR_artifactConservationLabel_('PURGE_APRÈS_REVUE');
  if (/permanent|conserver définitivement|canonique/.test(s)) return FBR_artifactConservationLabel_('PERMANENTE');
  return FBR_artifactConservationLabel_('LEGACY_À_REVOIR');
}

function FBR_normalizeCanonical_(value) {
  var key = FBR_artifactCanonicalKey_(value);
  if (FBR_ARTIFACT.CANONICAL_LABELS[key]) return FBR_artifactCanonicalLabel_(key);
  return FBR_inferCanonical_(value, '');
}

function FBR_inferCanonical_(canonicalText, statusText) {
  var s = FBR_norm_([canonicalText, statusText].join(' '));
  if (/remplac|supplant|obsol|ne plus utiliser|à purger|a purger|do not use/.test(s)) {
    return FBR_artifactCanonicalLabel_('NON');
  }
  if (/canonique|baseline stable|architecture canonique|sheet actif|source de vérité|source de verite/.test(s)) {
    return FBR_artifactCanonicalLabel_('OUI');
  }
  return FBR_artifactCanonicalLabel_('À DÉTERMINER');
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
  if (/release|version publiée|version publiee/.test(s)) return FBR_artifactClassLabel_('RELEASE');
  if (/backup.*sheet|archive.*sheet|copie.*sheet/.test(s)) return FBR_artifactClassLabel_('BACKUP_SHEET');
  if (/backup.*source|apps script live source|zip apps script/.test(s)) return FBR_artifactClassLabel_('BACKUP_SCRIPT');
  if (/github|git_tree|mirror/.test(s)) return FBR_artifactClassLabel_('MIRROR_GITHUB_SEUL');
  if (/snapshot/.test(s)) return FBR_artifactClassLabel_('SNAPSHOT');
  if (/archive/.test(s)) return FBR_artifactClassLabel_('ARCHIVE');
  if (/documentation|readme|guide|procédure|procedure/.test(s)) return FBR_artifactClassLabel_('DOCUMENTATION');
  if (/pack|zip/.test(s)) return FBR_artifactClassLabel_('PACK');
  if (/export|csv|json|pdf|xlsx/.test(s)) return FBR_artifactClassLabel_('EXPORT');
  return FBR_artifactClassLabel_('LIVRABLE');
}

function FBR_normalizeArtifactStatus_(value) {
  var key = FBR_artifactStatusKey_(value);
  if (FBR_ARTIFACT.STATUS_LABELS[key]) return FBR_artifactStatusLabel_(key);
  var s = FBR_norm_(value);
  if (/ignorer|purger|do not use|do_not_use/.test(s)) return FBR_artifactStatusLabel_('À_PURGER');
  if (/erreur|échec|echec|bloqué|bloque/.test(s)) return FBR_artifactStatusLabel_('ERREUR');
  if (/remplac|supplant/.test(s)) return FBR_artifactStatusLabel_('REMPLACÉ');
  if (/archive/.test(s)) return FBR_artifactStatusLabel_('ARCHIVÉ');
  if (/non live|prêt|pret|généré local|genere local/.test(s)) return FBR_artifactStatusLabel_('PRÊT_NON_LIVE');
  if (/partiel/.test(s)) return FBR_artifactStatusLabel_('PARTIEL');
  if (/validé|valide|rangé drive ok|range drive ok|poussé github ok|pousse github ok|ok$/.test(s)) {
    return FBR_artifactStatusLabel_('VALIDÉ_LIVE');
  }
  if (/canonique/.test(s)) return FBR_artifactStatusLabel_('CANONIQUE');
  return FBR_artifactStatusLabel_('À_REVOIR');
}

function FBR_buildArtifactKeyFromRow_(row) {
  var I = FBR_ARTIFACT.IDX;
  var cls = FBR_artifactClassKey_(row[I.CLASS]) || 'LIVRABLE';
  var trace = FBR_safeText_(row[I.VERSION]);
  var drive = FBR_safeText_(row[I.DRIVE_ID]) || FBR_extractDriveId_(row[I.DRIVE]);
  var sha = FBR_extractGithubSha_(row[I.GITHUB] + ' ' + row[I.NOTES]);
  if (cls === 'BACKUP_SCRIPT' && trace) return ['BACKUP_SCRIPT', trace, drive, sha].join('|');
  if (cls === 'BACKUP_SHEET' && drive) return ['BACKUP_SHEET', drive].join('|');
  if (sha) return ['GITHUB', sha].join('|');
  if (drive) return ['DRIVE', drive].join('|');
  if (trace) return [cls, trace].join('|');
  return [cls, FBR_digestShort_([row[I.OBJECT], trace, row[I.TIMESTAMP], row[I.DRIVE], row[I.GITHUB]].join('|'))].join('|');
}

function FBR_extractDriveId_(value) {
  var s = FBR_safeText_(value);
  var m = s.match(/(?:\/d\/|\/folders\/|[?&]id=)([A-Za-z0-9_-]{20,})/);
  return m ? m[1] : '';
}

function FBR_extractGithubSha_(value) {
  var s = FBR_safeText_(value);
  var m = s.match(/\b[0-9a-f]{7,40}\b/i);
  return m ? m[0] : '';
}

function FBR_extractTrace_(value) {
  var s = FBR_safeText_(value);
  var m = s.match(/\b(?:trace\s*)?([0-9a-f]{8})\b/i);
  return m ? m[1] : '';
}

function FBR_digestShort_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
  return bytes.slice(0, 6).map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function FBR_dateSortValue_(value) {
  if (FBR_isDate_(value)) return value.getTime();
  var d = new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}
