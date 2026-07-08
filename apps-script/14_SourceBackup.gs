function FBR_backupSourceStatus_() {
  return {
    scriptId: ScriptApp.getScriptId(),
    folderId: FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, FBR_SOURCE_BACKUP_DEFAULTS.FOLDER_ID),
    allowWrite: FBR_getScriptBool_(FBR.PROP.ALLOW_SOURCE_BACKUP_WRITE, false),
    version: FELIBREE_SCRIPT_VERSION
  };
}

function FBR_backupSourceToDrive_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  dryRun = dryRun !== false;
  FBR_ensureCoreSheets_();

  var status = FBR_backupSourceStatus_();
  if (!dryRun && !status.allowWrite) {
    var blocked = 'Écriture backup bloquée. Ajouter propriété script ' + FBR.PROP.ALLOW_SOURCE_BACKUP_WRITE + '=TRUE.';
    FBR_log_({
      functionName: 'FBR_backupSourceToDrive_',
      mode: 'APPLY_BLOCKED',
      status: 'BLOCKED',
      sheetName: FBR.SHEETS.EXPORTS,
      rowsRead: 0,
      rowsChanged: 0,
      message: blocked,
      startMs: startMs,
      traceId: traceId
    });
    return FBR_result_(false, 'Source backup bloqué', blocked + ' Trace ' + traceId);
  }

  var content = FBR_getAppsScriptProjectContent_();
  var files = content.files || [];
  var timestamp = Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyyMMdd_HHmmss');
  var baseName = FBR_SOURCE_BACKUP_DEFAULTS.PREFIX + '_' + timestamp + '_' + traceId;
  var zipName = baseName + '.zip';

  var indexRows = [['name', 'type', 'extension', 'bytes', 'sha256']];
  var blobs = [];

  files.forEach(function (file) {
    var ext = FBR_sourceFileExtension_(file.type, file.name);
    var fileName = file.name + ext;
    var source = file.source || '';
    var sha = FBR_sha256Hex_(source);
    indexRows.push([file.name, file.type, ext, source.length, sha]);
    blobs.push(Utilities.newBlob(source, FBR_sourceMime_(ext), fileName));
  });

  var manifest = {
    project: 'Felibrejada dins Brantome en Perigor',
    createdAt: new Date().toISOString(),
    createdBy: FBR_user_(),
    traceId: traceId,
    scriptId: content.scriptId || ScriptApp.getScriptId(),
    version: FELIBREE_SCRIPT_VERSION,
    fileCount: files.length,
    backupMode: dryRun ? 'DRY_RUN' : 'APPLY',
    backupFolderId: status.folderId,
    rule: 'Live Apps Script source captured via Apps Script API projects.getContent. Drive backup is the handoff source for CLASP/GitHub mirrors.'
  };

  blobs.push(Utilities.newBlob(JSON.stringify(manifest, null, 2), 'application/json', '_backup_manifest.json'));
  blobs.push(Utilities.newBlob(indexRows.map(function (r) { return r.map(FBR_csvCell_).join(','); }).join('\n'), 'text/csv', '_file_index.csv'));
  blobs.push(Utilities.newBlob(FBR_claspReadme_(manifest), 'text/markdown', 'CLASP_GITHUB_HANDOFF.md'));

  var resultUrl = '';
  if (!dryRun) {
    var folder = DriveApp.getFolderById(status.folderId);
    var zipBlob = Utilities.zip(blobs, zipName);
    var file = folder.createFile(zipBlob);
    resultUrl = file.getUrl();
    FBR_appendRows_(FBR.SHEETS.EXPORTS, [[
      new Date(),
      'ZIP Apps Script live source backup',
      Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyy-MM-dd HH:mm:ss'),
      'Apps Script API projects.getContent',
      'ZIP',
      'DRIVE',
      'Rangé Drive OK',
      resultUrl,
      FBR_user_(),
      'Trace ' + traceId + ' / fichiers ' + files.length + ' / base CLASP-GitHub'
    ]]);
  }

  FBR_log_({
    functionName: 'FBR_backupSourceToDrive_',
    mode: dryRun ? 'DRY_RUN' : 'APPLY',
    status: 'OK',
    sheetName: FBR.SHEETS.EXPORTS,
    rowsRead: files.length,
    rowsChanged: dryRun ? 0 : 1,
    message: (dryRun ? 'Sauvegarderait' : 'Sauvegarde créée') + ' ' + files.length + ' fichier(s) source live. ' + (resultUrl || zipName),
    startMs: startMs,
    traceId: traceId
  });

  return FBR_result_(true, dryRun ? 'Source backup — dry-run' : 'Source backup — APPLY', (dryRun ? 'Prêt à créer : ' : 'Créé : ') + zipName + (resultUrl ? '\n' + resultUrl : '') + '\nTrace ' + traceId);
}

function FBR_getAppsScriptProjectContent_() {
  var scriptId = ScriptApp.getScriptId();
  var url = 'https://script.googleapis.com/v1/projects/' + encodeURIComponent(scriptId) + '/content';
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('Apps Script API getContent failed HTTP ' + code + ': ' + body.slice(0, 600));
  }
  return JSON.parse(body);
}

function FBR_sourceFileExtension_(type, name) {
  if (type === 'SERVER_JS') return '.gs';
  if (type === 'HTML') return '.html';
  if (type === 'JSON') return '.json';
  return '.txt';
}

function FBR_sourceMime_(ext) {
  if (ext === '.gs') return 'text/plain';
  if (ext === '.html') return 'text/html';
  if (ext === '.json') return 'application/json';
  return 'text/plain';
}

function FBR_sha256Hex_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text || '', Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function FBR_csvCell_(v) {
  var s = String(v == null ? '' : v);
  if (s.indexOf('"') >= 0 || s.indexOf(',') >= 0 || s.indexOf('\n') >= 0) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function FBR_claspReadme_(manifest) {
  return [
    '# CLASP / GitHub handoff',
    '',
    'Backup trace: `' + manifest.traceId + '`',
    'Script ID: `' + manifest.scriptId + '`',
    'Version: `' + manifest.version + '`',
    '',
    '## Règle',
    '',
    '- Ce ZIP vient du live Apps Script via `projects.getContent`.',
    '- Il doit être considéré comme source de vérité de reprise.',
    '- CLASP/GitHub doivent refléter ce ZIP, pas un ancien pack généré hors live.',
    '',
    '## Local recommandé',
    '',
    '1. Télécharger ce ZIP depuis Drive.',
    '2. Extraire les fichiers `.gs`, `.html`, `.json` dans un repo local dédié.',
    '3. Mettre/contrôler `.clasp.json` avec le scriptId ci-dessus.',
    '4. `git status`.',
    '5. `git add .`.',
    '6. `git commit -m "Felibree Apps Script live backup ' + manifest.traceId + '"`.',
    '7. `git push`.',
    '',
    'Interdit par défaut : `clasp push` vers le live sans validation humaine.'
  ].join('\n');
}
