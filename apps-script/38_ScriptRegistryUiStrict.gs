/**
 * 38_ScriptRegistryUiStrict.gs
 * UI_STRICT_CANON_V1 — migration dédiée à 🧩 Script Registry.
 * Version v1.0.0-20260716.
 *
 * Règles :
 * - ne modifie aucun autre onglet ;
 * - conserve l'ordre A:AK et la compatibilité du gate 33 ;
 * - A1:C1 et A2:C2 fusionnées ; A:C figées ;
 * - emojis visibles, couleurs sémantiques, listes contrôlées ;
 * - copie complète + snapshot JSON avant APPLY ;
 * - ancien UI_FAMILY_REGISTRY_CORRECTIONS marqué déprécié.
 */

var FBR_SRUI = {
  VERSION: 'v1.0.0-20260716',
  TRACE: 'SCRIPT_REGISTRY_UI_STRICT_V2_20260716',
  SHEET: '🧩 Script Registry',
  HEADER_ROW: 4,
  DATA_ROW: 5,
  COLS: 37,
  TITLE: '🧩 Script Registry — cockpit canonique des scripts live, planifiés et archivés',
  RULE: '🔒 Une ligne = un fichier logique. A:AB conserve le contrat technique du gate 33 ; AC:AK porte le cockpit humain. Ne jamais exécuter l’ancien module UI déprécié.',
  CANONICAL_HEADERS: [
    'Fichier script', 'Fonction publique / interne', 'Type', 'Menu / appel',
    'Domaine', 'Statut', 'Criticité', 'Write action', 'Dépendances',
    'Scope requis', 'Dernier backup', 'GitHub path', 'Owner',
    'Action suivante', 'Notes', 'Version', 'Trace', 'Famille / rôle',
    'Live present', 'Live SHA256', 'Backup SHA256', 'Drift status',
    'Registry alert', 'Last checked', 'Latest backup', 'Missing in live',
    'Missing in backup', 'Diff summary', 'Présent menu', 'Présent sidebar',
    'Wrapper public', 'Mode MAJ', 'Vue cockpit', 'Audit UI source',
    'Décision UI', 'Risque UI', 'Remplacé par / cible'
  ],
  DISPLAY_HEADERS: [
    '📄 Fichier script', '⚙️ Fonction publique / interne', '🏷️ Type', '🧭 Menu / appel',
    '🗂️ Domaine', '🚦 Statut', '🔥 Criticité', '✍️ Write action', '🔗 Dépendances',
    '🔐 Scope requis', '💾 Dernier backup', '🐙 GitHub path', '👤 Owner',
    '➡️ Action suivante', '📝 Notes', '🔖 Version', '🧬 Trace', '🧩 Famille / rôle',
    '🟢 Live present', '🔐 Live SHA256', '🛡️ Backup SHA256', '📐 Drift status',
    '🚨 Registry alert', '🕒 Last checked', '💾 Latest backup', '❓ Missing in live',
    '❔ Missing in backup', '🧾 Diff summary', '🧭 Présent menu', '📌 Présent sidebar',
    '🌐 Wrapper public', '🔄 Mode MAJ', '🎛️ Vue cockpit', '🔍 Audit UI source',
    '✅ Décision UI', '⚠️ Risque UI', '♻️ Remplacé par / cible'
  ],
  STATUSES: [
    '✅ Actif live',
    '🛡️ Actif live protégé',
    '🔵 Auto-détecté live',
    '✅ Appliqué Sheet live',
    '🟡 Pack prêt — non live',
    '🟠 Patch prêt — non live',
    '⚪ Planifié — non live',
    '⛔ Déprécié — live compatibilité',
    '📦 Archivé',
    '🚨 À corriger'
  ],
  PRIORITIES: ['🔴 P0 critique', '🟠 P1 haute', '🔵 P2 normale', '⚪ P3 optionnelle'],
  LIVE_PRESENT: ['✅ YES', '❌ NO', '⚪ N/A', '🟡 À recalculer'],
  ALERTS: [
    '🟢 OK', '🟢 OK AUTO',
    '🟠 À vérifier', '🟠 DRIFT', '🟠 DRIFT AUTO', '🟠 BACKUP MANQUANT',
    '🔴 DRIFT', '🔴 DRIFT P0', '🔴 LIVE MANQUANT', '🔴 BACKUP MANQUANT P0',
    '⚪ NON LIVE', '⚪ N/A', '🟡 INSTALLATION REQUISE'
  ],
  MENU_CHOICES: [
    '✅ Oui', '✅ Oui — source menu', '✅ Oui — wrappers',
    '✅ Oui — via menu', '✅ Oui — aide', '❌ Non',
    '🔵 Futur', '🟡 À vérifier', '⚪ N/A'
  ],
  SIDEBAR_CHOICES: [
    '✅ Oui', '✅ Oui HTML', '✅ Oui — HTML sidebar',
    '✅ Oui — aide/sidebar', '✅ Oui — carte IA',
    '❌ Non', '🔵 Futur', '🟡 À vérifier', '⚪ N/A'
  ],
  WRAPPER_CHOICES: ['✅ Oui', '❌ Non', '🟡 À vérifier', '🔵 À créer', '⚪ N/A'],
  DECISIONS: [
    '✅ Garder', '✅ Garder UI privée', '🟡 Garder / classer',
    '🟡 À classer', '🔵 Installer', '📦 Archiver',
    '⛔ Ne pas exécuter'
  ]
};

function FELIBREE_scriptRegistryUiV2DryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_scriptRegistryUiV2DryRun',
    mode: 'UI_V2_DRY_RUN',
    sheetName: FBR_SRUI.SHEET,
    logStart: true
  }, function () {
    var audit = FBR_SRUI_audit_(false);
    if (!audit.ok) throw new Error(audit.details);
    return FBR_result_(true, 'Script Registry UI V2 — dry-run', audit.details);
  });
}

function FELIBREE_applyScriptRegistryStrictUiV2() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyScriptRegistryStrictUiV2',
    mode: 'UI_V2_APPLY_WITH_ROLLBACK',
    sheetName: FBR_SRUI.SHEET,
    logStart: true
  }, function (context) {
    var before = FBR_SRUI_audit_(false);
    if (!before.ok) throw new Error('APPLY refusé avant migration : ' + before.details);
    var rollback = FBR_SRUI_createRollback_(context.traceId);
    var applied = FBR_SRUI_apply_();
    SpreadsheetApp.flush();
    var verify = FBR_SRUI_audit_(true);
    if (!verify.ok) throw new Error('UI écrite mais vérification finale en échec : ' + verify.details);
    return FBR_result_(
      true,
      'Script Registry UI V2 appliquée',
      'Trace=' + context.traceId +
      ' ; lignes=' + applied.rowCount +
      ' ; statuts normalisés=' + applied.statusChanged +
      ' ; priorités normalisées=' + applied.priorityChanged +
      ' ; rollback JSON=' + rollback.jsonUrl +
      ' ; copie Sheet=' + rollback.copyUrl +
      ' ; ' + verify.details
    );
  });
}

function FELIBREE_verifyScriptRegistryStrictUiV2() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_verifyScriptRegistryStrictUiV2',
    mode: 'UI_V2_VERIFY_READ_ONLY',
    sheetName: FBR_SRUI.SHEET,
    logStart: true
  }, function () {
    var verify = FBR_SRUI_audit_(true);
    if (!verify.ok) throw new Error(verify.details);
    return FBR_result_(true, 'Script Registry UI V2 vérifiée', verify.details);
  });
}

function FBR_SRUI_sheet_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(FBR_SRUI.SHEET);
  if (!sheet) throw new Error('Onglet introuvable : ' + FBR_SRUI.SHEET);
  return sheet;
}

function FBR_SRUI_text_(value) {
  return String(value == null ? '' : value).trim();
}

function FBR_SRUI_lower_(value) {
  return FBR_SRUI_text_(value).toLowerCase()
    .replace(/[àáâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c');
}

function FBR_SRUI_canonicalHeader_(value) {
  var display = FBR_SRUI_text_(value);
  for (var i = 0; i < FBR_SRUI.CANONICAL_HEADERS.length; i++) {
    if (display === FBR_SRUI.CANONICAL_HEADERS[i] || display === FBR_SRUI.DISPLAY_HEADERS[i]) {
      return FBR_SRUI.CANONICAL_HEADERS[i];
    }
  }
  return display;
}

function FBR_SRUI_headerMap_(sheet) {
  var headers = sheet.getRange(FBR_SRUI.HEADER_ROW, 1, 1, FBR_SRUI.COLS).getDisplayValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var canonical = FBR_SRUI_canonicalHeader_(headers[i]);
    if (canonical) map[canonical] = i + 1;
  }
  return map;
}

function FBR_SRUI_normalizeStatus_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.STATUSES.indexOf(raw) >= 0) return raw;
  var s = FBR_SRUI_lower_(raw);
  if (s.indexOf('depreci') >= 0) return '⛔ Déprécié — live compatibilité';
  if (s.indexOf('applique') >= 0 && s.indexOf('sheet') >= 0) return '✅ Appliqué Sheet live';
  if (s.indexOf('actif live protege') >= 0) return '🛡️ Actif live protégé';
  if (s.indexOf('actif live') >= 0) return '✅ Actif live';
  if (s.indexOf('auto-discovered') >= 0 || s.indexOf('auto-detect') >= 0) return '🔵 Auto-détecté live';
  if (s.indexOf('pack') >= 0 && s.indexOf('non live') >= 0) return '🟡 Pack prêt — non live';
  if (s.indexOf('patch') >= 0 && s.indexOf('non live') >= 0) return '🟠 Patch prêt — non live';
  if (s.indexOf('planifie') >= 0 && s.indexOf('non live') >= 0) return '⚪ Planifié — non live';
  if (s.indexOf('archive') >= 0) return '📦 Archivé';
  if (s.indexOf('erreur') >= 0 || s.indexOf('corriger') >= 0) return '🚨 À corriger';
  return raw ? '🚨 À corriger' : '';
}

function FBR_SRUI_normalizePriority_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.PRIORITIES.indexOf(raw) >= 0) return raw;
  var s = raw.toUpperCase();
  if (s.indexOf('P0') >= 0) return '🔴 P0 critique';
  if (s.indexOf('P1') >= 0) return '🟠 P1 haute';
  if (s.indexOf('P2') >= 0) return '🔵 P2 normale';
  if (s.indexOf('P3') >= 0) return '⚪ P3 optionnelle';
  return raw ? '🟠 P1 haute' : '';
}

function FBR_SRUI_normalizeLive_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.LIVE_PRESENT.indexOf(raw) >= 0) return raw;
  var s = raw.toUpperCase();
  if (s.indexOf('YES') >= 0 || s.indexOf('OUI') >= 0) return '✅ YES';
  if (s.indexOf('NO') >= 0 || s.indexOf('NON') >= 0) return '❌ NO';
  if (s.indexOf('N/A') >= 0) return '⚪ N/A';
  return raw ? '🟡 À recalculer' : '';
}

function FBR_SRUI_normalizeMenu_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.MENU_CHOICES.indexOf(raw) >= 0) return raw;
  var s = FBR_SRUI_lower_(raw);
  if (!s) return '';
  if (s === 'oui') return '✅ Oui';
  if (s.indexOf('source menu') >= 0) return '✅ Oui — source menu';
  if (s.indexOf('wrapper') >= 0) return '✅ Oui — wrappers';
  if (s.indexOf('via menu') >= 0) return '✅ Oui — via menu';
  if (s.indexOf('aide') >= 0) return '✅ Oui — aide';
  if (s.indexOf('futur') >= 0 || s.indexOf('prevu') >= 0 || s.indexOf('apres installation') >= 0) return '🔵 Futur';
  if (s.indexOf('verifier') >= 0) return '🟡 À vérifier';
  if (s === 'non') return '❌ Non';
  if (s.indexOf('n/a') >= 0) return '⚪ N/A';
  return '🟡 À vérifier';
}

function FBR_SRUI_normalizeSidebar_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.SIDEBAR_CHOICES.indexOf(raw) >= 0) return raw;
  var s = FBR_SRUI_lower_(raw);
  if (!s) return '';
  if (s.indexOf('html sidebar') >= 0) return '✅ Oui — HTML sidebar';
  if (s.indexOf('aide/sidebar') >= 0) return '✅ Oui — aide/sidebar';
  if (s.indexOf('carte ia') >= 0) return '✅ Oui — carte IA';
  if (s.indexOf('oui html') >= 0) return '✅ Oui HTML';
  if (s === 'oui') return '✅ Oui';
  if (s.indexOf('futur') >= 0 || s.indexOf('prevu') >= 0 || s.indexOf('apres installation') >= 0) return '🔵 Futur';
  if (s.indexOf('verifier') >= 0) return '🟡 À vérifier';
  if (s === 'non') return '❌ Non';
  if (s.indexOf('n/a') >= 0) return '⚪ N/A';
  return '🟡 À vérifier';
}

function FBR_SRUI_normalizeWrapper_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.WRAPPER_CHOICES.indexOf(raw) >= 0) return raw;
  var s = FBR_SRUI_lower_(raw);
  if (!s) return '';
  if (s.indexOf('creer') >= 0) return '🔵 À créer';
  if (s.indexOf('verifier') >= 0) return '🟡 À vérifier';
  if (s === 'oui') return '✅ Oui';
  if (s === 'non') return '❌ Non';
  if (s.indexOf('n/a') >= 0) return '⚪ N/A';
  return '🟡 À vérifier';
}

function FBR_SRUI_normalizeDecision_(value) {
  var raw = FBR_SRUI_text_(value);
  if (FBR_SRUI.DECISIONS.indexOf(raw) >= 0) return raw;
  var s = FBR_SRUI_lower_(raw);
  if (!s) return '';
  if (s.indexOf('ne pas') >= 0) return '⛔ Ne pas exécuter';
  if (s.indexOf('garder ui privee') >= 0) return '✅ Garder UI privée';
  if (s.indexOf('garder / classer') >= 0) return '🟡 Garder / classer';
  if (s === 'garder') return '✅ Garder';
  if (s.indexOf('classer') >= 0) return '🟡 À classer';
  if (s.indexOf('installer') >= 0) return '🔵 Installer';
  if (s.indexOf('archive') >= 0) return '📦 Archiver';
  return '🟡 À classer';
}

function FBR_SRUI_allowed_(value, allowed) {
  if (!FBR_SRUI_text_(value)) return true;
  return allowed.indexOf(FBR_SRUI_text_(value)) >= 0;
}

function FBR_SRUI_audit_(requireUi) {
  var sheet = FBR_SRUI_sheet_();
  var map = FBR_SRUI_headerMap_(sheet);
  var missingHeaders = [];
  for (var h = 0; h < FBR_SRUI.CANONICAL_HEADERS.length; h++) {
    if (!map[FBR_SRUI.CANONICAL_HEADERS[h]]) missingHeaders.push(FBR_SRUI.CANONICAL_HEADERS[h]);
  }

  var lastRow = Math.max(sheet.getLastRow(), FBR_SRUI.DATA_ROW - 1);
  var rowCount = Math.max(0, lastRow - FBR_SRUI.DATA_ROW + 1);
  var rows = rowCount ? sheet.getRange(FBR_SRUI.DATA_ROW, 1, rowCount, FBR_SRUI.COLS).getDisplayValues() : [];
  var files = {};
  var duplicateFiles = [];
  var invalidStatus = [];
  var invalidPriority = [];
  var invalidLive = [];
  var formulaCount = 0;

  for (var i = 0; i < rows.length; i++) {
    var file = FBR_SRUI_text_(rows[i][0]);
    if (!file) continue;
    if (files[file]) duplicateFiles.push(file); else files[file] = true;
    if (requireUi && !FBR_SRUI_allowed_(rows[i][5], FBR_SRUI.STATUSES)) invalidStatus.push(i + FBR_SRUI.DATA_ROW);
    if (requireUi && !FBR_SRUI_allowed_(rows[i][6], FBR_SRUI.PRIORITIES)) invalidPriority.push(i + FBR_SRUI.DATA_ROW);
    if (requireUi && !FBR_SRUI_allowed_(rows[i][18], FBR_SRUI.LIVE_PRESENT)) invalidLive.push(i + FBR_SRUI.DATA_ROW);
  }

  if (rowCount) {
    var formulas = sheet.getRange(FBR_SRUI.DATA_ROW, 1, rowCount, FBR_SRUI.COLS).getFormulas();
    for (var r = 0; r < formulas.length; r++) {
      for (var c = 0; c < formulas[r].length; c++) if (formulas[r][c]) formulaCount++;
    }
  }

  var mergeA1 = false;
  var mergeA2 = false;
  var merged = sheet.getRange(1, 1, 2, FBR_SRUI.COLS).getMergedRanges();
  for (var m = 0; m < merged.length; m++) {
    if (merged[m].getA1Notation() === 'A1:C1') mergeA1 = true;
    if (merged[m].getA1Notation() === 'A2:C2') mergeA2 = true;
  }

  var uiOk = !requireUi || (
    mergeA1 &&
    mergeA2 &&
    sheet.getFrozenRows() >= 4 &&
    sheet.getFrozenColumns() >= 3 &&
    sheet.getRange(4, 1, 1, FBR_SRUI.COLS).getDisplayValues()[0].join('|') === FBR_SRUI.DISPLAY_HEADERS.join('|') &&
    sheet.getRange('F5').getDataValidation() &&
    sheet.getRange('G5').getDataValidation() &&
    sheet.getRange('S5').getDataValidation() &&
    sheet.getRange('W5').getDataValidation() &&
    sheet.getRange('AC5').getDataValidation() &&
    sheet.getRange('AD5').getDataValidation() &&
    sheet.getRange('AE5').getDataValidation() &&
    sheet.getRange('AI5').getDataValidation() &&
    sheet.isColumnHiddenByUser(20) &&
    sheet.isColumnHiddenByUser(24)
  );

  var gateHeadersOk = true;
  if (typeof FBR_registryHeaderMap_ === 'function') {
    var gateMap = FBR_registryHeaderMap_(sheet);
    var requiredGate = [
      'Live present', 'Live SHA256', 'Backup SHA256', 'Drift status',
      'Registry alert', 'Last checked', 'Latest backup',
      'Missing in live', 'Missing in backup', 'Diff summary'
    ];
    for (var g = 0; g < requiredGate.length; g++) {
      if (!gateMap[requiredGate[g]]) gateHeadersOk = false;
    }
  }

  var ok = missingHeaders.length === 0 &&
    duplicateFiles.length === 0 &&
    formulaCount === 0 &&
    invalidStatus.length === 0 &&
    invalidPriority.length === 0 &&
    invalidLive.length === 0 &&
    uiOk &&
    gateHeadersOk;

  return {
    ok: ok,
    rowCount: rowCount,
    details:
      'Lignes=' + rowCount +
      ' ; en-têtes manquants=' + missingHeaders.length +
      ' ; doublons fichier=' + duplicateFiles.length +
      ' ; formules corps=' + formulaCount +
      ' ; statuts invalides=' + invalidStatus.length +
      ' ; priorités invalides=' + invalidPriority.length +
      ' ; live invalides=' + invalidLive.length +
      ' ; gate 33 compatible=' + (gateHeadersOk ? 'OUI' : 'NON') +
      ' ; UI stricte=' + (uiOk ? 'OK' : (requireUi ? 'NON CONFORME' : 'À APPLIQUER'))
  };
}

function FBR_SRUI_createRollback_(traceId) {
  var ss = SpreadsheetApp.getActive();
  var sheet = FBR_SRUI_sheet_();
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var base = 'felibree_script_registry_pre_ui_v2_' + timestamp + '_' + traceId;
  var folder = null;

  if (typeof FBR_getArtifactPrivateVault_ === 'function') {
    try { folder = FBR_getArtifactPrivateVault_().folder; } catch (err) { folder = null; }
  }
  if (!folder) {
    var parents = DriveApp.getFileById(ss.getId()).getParents();
    folder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  }

  var payload = {
    createdAt: new Date().toISOString(),
    traceId: traceId,
    sheet: FBR_SRUI.SHEET,
    values: sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 4), FBR_SRUI.COLS).getValues(),
    formulas: sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 4), FBR_SRUI.COLS).getFormulas(),
    notes: sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 4), FBR_SRUI.COLS).getNotes()
  };
  var jsonFile = folder.createFile(
    Utilities.newBlob(JSON.stringify(payload, null, 2), 'application/json', base + '.json')
  );
  var copy = DriveApp.getFileById(ss.getId()).makeCopy(base + '_FULL_SHEET', folder);

  if (typeof FBR_forcePrivateArtifactFile_ === 'function') {
    try { FBR_forcePrivateArtifactFile_(jsonFile); } catch (jsonErr) { Logger.log(jsonErr); }
    try { FBR_forcePrivateArtifactFile_(copy); } catch (copyErr) { Logger.log(copyErr); }
  }
  return { jsonUrl: jsonFile.getUrl(), copyUrl: copy.getUrl() };
}

function FBR_SRUI_upsertSelfRows_(rows) {
  var indexByFile = {};
  for (var i = 0; i < rows.length; i++) {
    if (FBR_SRUI_text_(rows[i][0])) indexByFile[FBR_SRUI_text_(rows[i][0])] = i;
  }

  function blankRow() {
    var row = [];
    for (var c = 0; c < FBR_SRUI.COLS; c++) row.push('');
    return row;
  }

  var oldName = 'UI_FAMILY_REGISTRY_CORRECTIONS.gs';
  if (indexByFile[oldName] !== undefined) {
    var oldRow = rows[indexByFile[oldName]];
    oldRow[5] = '⛔ Déprécié — live compatibilité';
    oldRow[34] = '⛔ Ne pas exécuter';
    oldRow[35] = 'Élevé : ancien APPLY défusionne les bandeaux, fige moins de trois colonnes et reconstruit plusieurs onglets.';
    oldRow[36] = '38_ScriptRegistryUiStrict.gs';
  }

  var gateName = '33_ScriptRegistryIntegrity.gs';
  if (indexByFile[gateName] !== undefined) {
    var gateRow = rows[indexByFile[gateName]];
    gateRow[5] = '🛡️ Actif live protégé';
    gateRow[15] = 'v0.8.0';
    gateRow[16] = FBR_SRUI.TRACE;
    gateRow[13] = 'Lancer le gate après chaque backup source live.';
    gateRow[14] = 'Compatible avec les en-têtes emoji ; conserve les clés canoniques et les positions A/F/G.';
    gateRow[34] = '✅ Garder';
  }

  var selfName = '38_ScriptRegistryUiStrict.gs';
  var selfRow;
  if (indexByFile[selfName] !== undefined) {
    selfRow = rows[indexByFile[selfName]];
  } else {
    selfRow = blankRow();
    rows.push(selfRow);
  }
  selfRow[0] = selfName;
  selfRow[1] = 'FELIBREE_scriptRegistryUiV2DryRun / apply / verify';
  selfRow[2] = 'UI stricte / QA';
  selfRow[3] = 'Exécution manuelle protégée';
  selfRow[4] = '🧩 Script Registry';
  selfRow[5] = '✅ Actif live';
  selfRow[6] = '🟠 P1 haute';
  selfRow[7] = 'Oui Sheet protégé';
  selfRow[8] = '33_ScriptRegistryIntegrity.gs + 02_Utils.gs';
  selfRow[9] = 'spreadsheets.currentonly + drive';
  selfRow[10] = 'Backup post-installation requis';
  selfRow[11] = 'apps-script/38_ScriptRegistryUiStrict.gs';
  selfRow[12] = 'JRbIA';
  selfRow[13] = 'Conserver ; relancer uniquement après changement structurel du registry.';
  selfRow[14] = 'UI_STRICT_CANON_V1 ; cible unique Script Registry ; rollback avant APPLY.';
  selfRow[15] = FBR_SRUI.VERSION;
  selfRow[16] = FBR_SRUI.TRACE;
  selfRow[17] = 'Registry / UI / QA';
  selfRow[18] = '✅ YES';
  selfRow[21] = 'À recalculer';
  selfRow[22] = '🟠 À vérifier';
  selfRow[25] = 'NO';
  selfRow[26] = 'YES';
  selfRow[27] = 'Nouveau module live ; créer backup source puis lancer le gate 33.';
  selfRow[28] = '❌ Non';
  selfRow[29] = '❌ Non';
  selfRow[30] = '✅ Oui';
  selfRow[31] = 'Script contrôlé';
  selfRow[32] = 'Backup / registry';
  selfRow[33] = 'UI_STRICT_CANON_V1';
  selfRow[34] = '✅ Garder';
  selfRow[35] = 'Faible : UI et validations du seul Script Registry ; aucune donnée métier.';
  selfRow[36] = '';

  return rows;
}

function FBR_SRUI_apply_() {
  var sheet = FBR_SRUI_sheet_();
  var lastRow = Math.max(sheet.getLastRow(), FBR_SRUI.DATA_ROW - 1);
  var rowCount = Math.max(0, lastRow - FBR_SRUI.DATA_ROW + 1);
  var rows = rowCount
    ? sheet.getRange(FBR_SRUI.DATA_ROW, 1, rowCount, FBR_SRUI.COLS).getValues()
    : [];
  var statusChanged = 0;
  var priorityChanged = 0;

  for (var i = 0; i < rows.length; i++) {
    if (!FBR_SRUI_text_(rows[i][0])) continue;
    var status = FBR_SRUI_normalizeStatus_(rows[i][5]);
    var priority = FBR_SRUI_normalizePriority_(rows[i][6]);
    if (status !== FBR_SRUI_text_(rows[i][5])) statusChanged++;
    if (priority !== FBR_SRUI_text_(rows[i][6])) priorityChanged++;
    rows[i][5] = status;
    rows[i][6] = priority;
    rows[i][18] = FBR_SRUI_normalizeLive_(rows[i][18]);
    rows[i][28] = FBR_SRUI_normalizeMenu_(rows[i][28]);
    rows[i][29] = FBR_SRUI_normalizeSidebar_(rows[i][29]);
    rows[i][30] = FBR_SRUI_normalizeWrapper_(rows[i][30]);
    rows[i][34] = FBR_SRUI_normalizeDecision_(rows[i][34]);
  }

  rows = FBR_SRUI_upsertSelfRows_(rows);
  rows.sort(function (a, b) {
    return FBR_SRUI_text_(a[0]).toLowerCase().localeCompare(FBR_SRUI_text_(b[0]).toLowerCase());
  });

  var requiredRows = Math.max(80, rows.length + 20);
  if (sheet.getMaxRows() < requiredRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  }
  var clearRows = Math.max(1, sheet.getMaxRows() - FBR_SRUI.DATA_ROW + 1);
  sheet.getRange(FBR_SRUI.DATA_ROW, 1, clearRows, FBR_SRUI.COLS).clearContent().clearDataValidations();
  if (rows.length) sheet.getRange(FBR_SRUI.DATA_ROW, 1, rows.length, FBR_SRUI.COLS).setValues(rows);

  FBR_SRUI_applyStructure_(sheet, rows.length);
  FBR_SRUI_applyValidations_(sheet);
  FBR_SRUI_applyConditionalFormatting_(sheet);

  return {
    rowCount: rows.length,
    statusChanged: statusChanged,
    priorityChanged: priorityChanged
  };
}

function FBR_SRUI_unmergeTop_(sheet) {
  var merged = sheet.getRange(1, 1, 2, FBR_SRUI.COLS).getMergedRanges();
  for (var i = 0; i < merged.length; i++) merged[i].breakApart();
}

function FBR_SRUI_applyStructure_(sheet, dataRows) {
  FBR_SRUI_unmergeTop_(sheet);
  sheet.setFrozenRows(4);
  sheet.setFrozenColumns(3);
  sheet.setHiddenGridlines(true);
  sheet.getRange('A1:C1').merge();
  sheet.getRange('A2:C2').merge();

  sheet.getRange(1, 1).setValue(FBR_SRUI.TITLE);
  sheet.getRange(2, 1).setValue(FBR_SRUI.RULE);
  sheet.getRange(4, 1, 1, FBR_SRUI.COLS).setValues([FBR_SRUI.DISPLAY_HEADERS]);
  for (var h = 0; h < FBR_SRUI.CANONICAL_HEADERS.length; h++) {
    sheet.getRange(4, h + 1).setNote('Clé canonique : ' + FBR_SRUI.CANONICAL_HEADERS[h]);
  }

  sheet.getRange(3, 1, 1, FBR_SRUI.COLS).clearContent();
  var sep = typeof FBR_formulaSeparator_ === 'function' ? FBR_formulaSeparator_() : ';';
  sheet.getRange('A3').setValue('📊 Total');
  sheet.getRange('B3').setFormula('=MAX(0' + sep + 'COUNTA(A5:A))');
  sheet.getRange('C3').setValue('🟢 Actifs live');
  sheet.getRange('D3').setFormula('=COUNTIF(F5:F' + sep + '"*Actif live*")+COUNTIF(F5:F' + sep + '"*Auto-détecté live*")');
  sheet.getRange('E3').setValue('🔴 P0');
  sheet.getRange('F3').setFormula('=COUNTIF(G5:G' + sep + '"*P0*")');
  sheet.getRange('G3').setValue('🚨 Alertes');
  sheet.getRange('H3').setFormula('=COUNTIF(W5:W' + sep + '"🔴*")+COUNTIF(W5:W' + sep + '"🟠*")');
  sheet.getRange('I3').setValue('⚪ Non live');
  sheet.getRange('J3').setFormula('=COUNTIF(W5:W' + sep + '"⚪*")');
  sheet.getRange('K3').setValue('🕒 Dernier contrôle');
  sheet.getRange('L3').setFormula('=IFERROR(MAX(X5:X)' + sep + '"")');
  sheet.getRange('B3').setNumberFormat('0');
  sheet.getRange('D3').setNumberFormat('0');
  sheet.getRange('F3').setNumberFormat('0');
  sheet.getRange('H3').setNumberFormat('0');
  sheet.getRange('J3').setNumberFormat('0');
  sheet.getRange('L3').setNumberFormat('yyyy-MM-dd HH:mm');

  sheet.getRange(1, 1, 1, FBR_SRUI.COLS)
    .setBackground('#083F3D').setFontColor('#FFFFFF')
    .setFontFamily('Arial').setFontSize(16).setFontWeight('bold')
    .setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(2, 1, 1, FBR_SRUI.COLS)
    .setBackground('#E7F1F0').setFontColor('#334155')
    .setFontFamily('Arial').setFontSize(10).setFontStyle('italic')
    .setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(3, 1, 1, FBR_SRUI.COLS)
    .setBackground('#F8FAFC').setFontFamily('Arial')
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(4, 1, 1, FBR_SRUI.COLS)
    .setBackground('#145B59').setFontColor('#FFFFFF')
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);

  sheet.setRowHeight(1, 56);
  sheet.setRowHeight(2, 52);
  sheet.setRowHeight(3, 44);
  sheet.setRowHeight(4, 50);
  if (dataRows) sheet.setRowHeights(FBR_SRUI.DATA_ROW, dataRows, 48);

  var widths = [
    230, 250, 150, 190, 160, 180, 125, 165, 230, 210,
    175, 250, 150, 230, 300, 125, 165, 160, 120, 165,
    165, 165, 175, 145, 260, 130, 140, 300, 150, 160,
    150, 170, 165, 175, 185, 260, 240
  ];
  for (var w = 0; w < widths.length; w++) sheet.setColumnWidth(w + 1, widths[w]);

  var bodyRows = Math.max(1, sheet.getMaxRows() - FBR_SRUI.DATA_ROW + 1);
  sheet.getRange(FBR_SRUI.DATA_ROW, 1, bodyRows, FBR_SRUI.COLS)
    .setFontFamily('Arial').setFontSize(9)
    .setVerticalAlignment('top').setWrap(true);
  sheet.getRange(FBR_SRUI.DATA_ROW, 1, bodyRows, 1)
    .setFontWeight('bold').setFontColor('#0F4442');
  sheet.getRange(FBR_SRUI.DATA_ROW, 6, bodyRows, 2).setHorizontalAlignment('center');
  sheet.getRange(FBR_SRUI.DATA_ROW, 19, bodyRows, 1).setHorizontalAlignment('center');
  sheet.getRange(FBR_SRUI.DATA_ROW, 23, bodyRows, 1).setHorizontalAlignment('center');
  sheet.getRange(FBR_SRUI.DATA_ROW, 29, bodyRows, 3).setHorizontalAlignment('center');
  sheet.getRange(FBR_SRUI.DATA_ROW, 35, bodyRows, 1).setHorizontalAlignment('center');

  try { sheet.showColumns(1, FBR_SRUI.COLS); } catch (showErr) { Logger.log(showErr); }
  sheet.hideColumns(20, 3); // T:V hashes + drift technique
  sheet.hideColumns(24, 5); // X:AB contrôle détaillé
  if (sheet.getFilter()) sheet.getFilter().remove();
  var filterRows = Math.max(2, dataRows + 1);
  sheet.getRange(FBR_SRUI.HEADER_ROW, 1, filterRows, FBR_SRUI.COLS).createFilter();
}

function FBR_SRUI_validation_(values, strict) {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(strict !== true)
    .build();
}

function FBR_SRUI_applyValidations_(sheet) {
  var bodyRows = Math.max(1, sheet.getMaxRows() - FBR_SRUI.DATA_ROW + 1);
  sheet.getRange(FBR_SRUI.DATA_ROW, 6, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.STATUSES, true));
  sheet.getRange(FBR_SRUI.DATA_ROW, 7, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.PRIORITIES, true));
  sheet.getRange(FBR_SRUI.DATA_ROW, 19, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.LIVE_PRESENT, true));
  sheet.getRange(FBR_SRUI.DATA_ROW, 23, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.ALERTS, false));
  sheet.getRange(FBR_SRUI.DATA_ROW, 29, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.MENU_CHOICES, true));
  sheet.getRange(FBR_SRUI.DATA_ROW, 30, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.SIDEBAR_CHOICES, true));
  sheet.getRange(FBR_SRUI.DATA_ROW, 31, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.WRAPPER_CHOICES, true));
  sheet.getRange(FBR_SRUI.DATA_ROW, 35, bodyRows, 1).setDataValidation(FBR_SRUI_validation_(FBR_SRUI.DECISIONS, true));
}

function FBR_SRUI_ruleText_(range, text, bg, fg) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(text).setBackground(bg).setFontColor(fg).setBold(true)
    .setRanges([range]).build();
}

function FBR_SRUI_ruleContains_(range, text, bg, fg) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains(text).setBackground(bg).setFontColor(fg).setBold(true)
    .setRanges([range]).build();
}

function FBR_SRUI_applyConditionalFormatting_(sheet) {
  var endRow = sheet.getMaxRows();
  var status = sheet.getRange(FBR_SRUI.DATA_ROW, 6, endRow - 4, 1);
  var priority = sheet.getRange(FBR_SRUI.DATA_ROW, 7, endRow - 4, 1);
  var live = sheet.getRange(FBR_SRUI.DATA_ROW, 19, endRow - 4, 1);
  var alert = sheet.getRange(FBR_SRUI.DATA_ROW, 23, endRow - 4, 1);
  var decision = sheet.getRange(FBR_SRUI.DATA_ROW, 35, endRow - 4, 1);
  var rules = [];

  rules.push(FBR_SRUI_ruleText_(status, '✅ Actif live', '#DCFCE7', '#166534'));
  rules.push(FBR_SRUI_ruleText_(status, '🛡️ Actif live protégé', '#D1FAE5', '#065F46'));
  rules.push(FBR_SRUI_ruleText_(status, '🔵 Auto-détecté live', '#DBEAFE', '#1D4ED8'));
  rules.push(FBR_SRUI_ruleText_(status, '✅ Appliqué Sheet live', '#DCFCE7', '#166534'));
  rules.push(FBR_SRUI_ruleContains_(status, 'non live', '#F3F4F6', '#4B5563'));
  rules.push(FBR_SRUI_ruleContains_(status, 'Déprécié', '#FEE2E2', '#991B1B'));
  rules.push(FBR_SRUI_ruleContains_(status, 'corriger', '#FECACA', '#991B1B'));

  rules.push(FBR_SRUI_ruleContains_(priority, 'P0', '#FECACA', '#991B1B'));
  rules.push(FBR_SRUI_ruleContains_(priority, 'P1', '#FED7AA', '#9A3412'));
  rules.push(FBR_SRUI_ruleContains_(priority, 'P2', '#DBEAFE', '#1D4ED8'));
  rules.push(FBR_SRUI_ruleContains_(priority, 'P3', '#F3F4F6', '#4B5563'));

  rules.push(FBR_SRUI_ruleContains_(live, 'YES', '#DCFCE7', '#166534'));
  rules.push(FBR_SRUI_ruleContains_(live, 'NO', '#FEE2E2', '#991B1B'));
  rules.push(FBR_SRUI_ruleContains_(live, 'recalculer', '#FEF3C7', '#92400E'));

  rules.push(FBR_SRUI_ruleContains_(alert, '🟢', '#DCFCE7', '#166534'));
  rules.push(FBR_SRUI_ruleContains_(alert, '🟠', '#FFEDD5', '#9A3412'));
  rules.push(FBR_SRUI_ruleContains_(alert, '🔴', '#FECACA', '#991B1B'));
  rules.push(FBR_SRUI_ruleContains_(alert, '⚪', '#F3F4F6', '#4B5563'));

  rules.push(FBR_SRUI_ruleContains_(decision, 'Garder', '#DCFCE7', '#166534'));
  rules.push(FBR_SRUI_ruleContains_(decision, 'Installer', '#DBEAFE', '#1D4ED8'));
  rules.push(FBR_SRUI_ruleContains_(decision, 'classer', '#FEF3C7', '#92400E'));
  rules.push(FBR_SRUI_ruleContains_(decision, 'Archiver', '#F3F4F6', '#4B5563'));
  rules.push(FBR_SRUI_ruleContains_(decision, 'Ne pas', '#FECACA', '#991B1B'));

  var kpiAlerts = sheet.getRange('H3');
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberEqualTo(0).setBackground('#DCFCE7').setFontColor('#166534').setBold(true)
      .setRanges([kpiAlerts]).build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0).setBackground('#FECACA').setFontColor('#991B1B').setBold(true)
      .setRanges([kpiAlerts]).build()
  );

  sheet.setConditionalFormatRules(rules);
}
