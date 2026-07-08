function FBR_syncGithubFromLiveSource_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  dryRun = dryRun !== false;
  FBR_ensureCoreSheets_();

  var content = FBR_getAppsScriptProjectContent_();
  var result = FBR_syncGithubFromContent_(content, dryRun, traceId, '');

  FBR_log_({
    functionName: 'FBR_syncGithubFromLiveSource_',
    mode: dryRun ? 'DRY_RUN' : 'APPLY',
    status: 'OK',
    sheetName: FBR.SHEETS.EXPORTS,
    rowsRead: result.fileCount,
    rowsChanged: dryRun ? 0 : result.fileCount,
    message: result.message,
    startMs: startMs,
    traceId: traceId
  });

  return FBR_result_(true, dryRun ? 'GitHub sync — dry-run' : 'GitHub sync — APPLY', result.message + '\nTrace ' + traceId);
}

function FBR_backupDriveClaspGithub_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  dryRun = dryRun !== false;
  FBR_ensureCoreSheets_();

  var sourceWrite = FBR_getScriptBool_(FBR.PROP.ALLOW_SOURCE_BACKUP_WRITE, false);
  var githubWrite = FBR_getScriptBool_(FBR.PROP.ALLOW_GITHUB_WRITE, false);

  if (!dryRun && !sourceWrite) {
    return FBR_blockedFullBackup_(startMs, traceId, 'FELIBREE_ALLOW_SOURCE_BACKUP_WRITE=TRUE manquant.');
  }
  if (!dryRun && !githubWrite) {
    return FBR_blockedFullBackup_(startMs, traceId, 'FELIBREE_ALLOW_GITHUB_WRITE=TRUE manquant.');
  }

  var content = FBR_getAppsScriptProjectContent_();
  var driveUrl = '';
  if (!dryRun) {
    driveUrl = FBR_createDriveSourceBackupFromContent_(content, traceId, 'FULL_APPLY');
  }

  var github = FBR_syncGithubFromContent_(content, dryRun, traceId, driveUrl);

  FBR_log_({
    functionName: 'FBR_backupDriveClaspGithub_',
    mode: dryRun ? 'DRY_RUN' : 'APPLY',
    status: 'OK',
    sheetName: FBR.SHEETS.EXPORTS,
    rowsRead: github.fileCount,
    rowsChanged: dryRun ? 0 : github.fileCount + 1,
    message: dryRun
      ? 'Dry-run complet OK : Drive ZIP + GitHub CLASP-compatible seraient créés. ' + github.message
      : 'Backup complet créé. Drive=' + driveUrl + ' / GitHub=' + github.url,
    startMs: startMs,
    traceId: traceId
  });

  return FBR_result_(
    true,
    dryRun ? 'Backup complet — dry-run' : 'Backup complet — APPLY',
    (dryRun ? 'Prêt : ' : 'Créé : ') + 'Drive + CLASP + GitHub\n' +
    'Drive: ' + (driveUrl || 'DRY_RUN') + '\n' +
    'GitHub: ' + github.url + '\n' +
    'Fichiers: ' + github.fileCount + '\n' +
    'Trace ' + traceId
  );
}

function FBR_blockedFullBackup_(startMs, traceId, msg) {
  FBR_log_({
    functionName: 'FBR_backupDriveClaspGithub_',
    mode: 'APPLY_BLOCKED',
    status: 'BLOCKED',
    sheetName: FBR.SHEETS.EXPORTS,
    rowsRead: 0,
    rowsChanged: 0,
    message: msg,
    startMs: startMs,
    traceId: traceId
  });
  return FBR_result_(false, 'Backup complet bloqué', msg + '\nTrace ' + traceId);
}

function FBR_createDriveSourceBackupFromContent_(content, traceId, modeLabel) {
  var status = FBR_backupSourceStatus_();
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

  var manifest = FBR_makeBackupManifest_(content, traceId, modeLabel, status.folderId);
  blobs.push(Utilities.newBlob(JSON.stringify(manifest, null, 2), 'application/json', '_backup_manifest.json'));
  blobs.push(Utilities.newBlob(indexRows.map(function (r) { return r.map(FBR_csvCell_).join(','); }).join('\n'), 'text/csv', '_file_index.csv'));
  blobs.push(Utilities.newBlob(FBR_claspReadme_(manifest), 'text/markdown', 'CLASP_GITHUB_HANDOFF.md'));

  var folder = DriveApp.getFolderById(status.folderId);
  var zipBlob = Utilities.zip(blobs, zipName);
  var file = folder.createFile(zipBlob);
  var resultUrl = file.getUrl();

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
    'Trace ' + traceId + ' / fichiers ' + files.length + ' / base CLASP-GitHub / mode ' + modeLabel
  ]]);

  return resultUrl;
}

function FBR_makeBackupManifest_(content, traceId, modeLabel, folderId) {
  return {
    project: 'Felibrejada dins Brantome en Perigor',
    createdAt: new Date().toISOString(),
    createdBy: FBR_user_(),
    traceId: traceId,
    scriptId: content.scriptId || ScriptApp.getScriptId(),
    version: FELIBREE_SCRIPT_VERSION,
    fileCount: (content.files || []).length,
    backupMode: modeLabel || 'APPLY',
    backupFolderId: folderId || '',
    github: FBR_githubRepoLabel_(),
    rule: 'Live Apps Script source captured via Apps Script API projects.getContent. Drive backup and GitHub CLASP mirror are produced from the same live source.'
  };
}

function FBR_syncGithubFromContent_(content, dryRun, traceId, driveUrl) {
  var cfg = FBR_githubConfig_();
  var files = FBR_buildGithubMirrorFiles_(content, traceId, driveUrl, cfg);
  var repoUrl = 'https://github.com/' + cfg.owner + '/' + cfg.repo;

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      fileCount: files.length,
      url: repoUrl,
      message: 'GitHub dry-run OK : pousserait ' + files.length + ' fichier(s) vers ' + cfg.owner + '/' + cfg.repo + ' branche ' + cfg.branch + ' préfixe ' + cfg.pathPrefix + '.'
    };
  }

  if (!cfg.allowWrite) throw new Error('GitHub write bloqué. Ajouter ' + FBR.PROP.ALLOW_GITHUB_WRITE + '=TRUE.');
  if (!cfg.token) throw new Error('GitHub token manquant. Ajouter propriété script ' + FBR.PROP.GITHUB_TOKEN + ' avec un PAT GitHub limité au repo.');

  var commit = FBR_githubCommitFiles_(cfg, files, 'Felibrejada Apps Script live mirror ' + traceId);
  FBR_appendRows_(FBR.SHEETS.EXPORTS, [[
    new Date(),
    'GitHub CLASP mirror',
    Utilities.formatDate(new Date(), FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'yyyy-MM-dd HH:mm:ss'),
    'Apps Script live source',
    'GIT_TREE',
    'GITHUB_API',
    'Poussé GitHub OK',
    repoUrl,
    FBR_user_(),
    'Trace ' + traceId + ' / commit ' + commit.sha + ' / fichiers ' + files.length + ' / Drive backup ' + (driveUrl || '')
  ]]);

  return {
    ok: true,
    dryRun: false,
    fileCount: files.length,
    url: repoUrl + '/commit/' + commit.sha,
    sha: commit.sha,
    message: 'GitHub push OK : ' + files.length + ' fichier(s), commit ' + commit.sha
  };
}

function FBR_githubConfig_() {
  return {
    owner: FBR_getScriptProperty_(FBR.PROP.GITHUB_OWNER, FBR_GITHUB_DEFAULTS.OWNER),
    repo: FBR_getScriptProperty_(FBR.PROP.GITHUB_REPO, FBR_GITHUB_DEFAULTS.REPO),
    branch: FBR_getScriptProperty_(FBR.PROP.GITHUB_BRANCH, FBR_GITHUB_DEFAULTS.BRANCH),
    pathPrefix: FBR_cleanPathPrefix_(FBR_getScriptProperty_(FBR.PROP.GITHUB_PATH_PREFIX, FBR_GITHUB_DEFAULTS.PATH_PREFIX)),
    token: FBR_getScriptProperty_(FBR.PROP.GITHUB_TOKEN, ''),
    allowWrite: FBR_getScriptBool_(FBR.PROP.ALLOW_GITHUB_WRITE, false),
    committerName: FBR_getScriptProperty_(FBR.PROP.GITHUB_COMMITTER_NAME, FBR_GITHUB_DEFAULTS.COMMITTER_NAME),
    committerEmail: FBR_getScriptProperty_(FBR.PROP.GITHUB_COMMITTER_EMAIL, FBR_GITHUB_DEFAULTS.COMMITTER_EMAIL)
  };
}

function FBR_githubRepoLabel_() {
  var cfg = FBR_githubConfig_();
  return cfg.owner + '/' + cfg.repo + '#' + cfg.branch + '/' + cfg.pathPrefix;
}

function FBR_cleanPathPrefix_(prefix) {
  prefix = String(prefix || '').replace(/^\/+|\/+$/g, '');
  return prefix;
}

function FBR_joinRepoPath_(prefix, fileName) {
  prefix = FBR_cleanPathPrefix_(prefix);
  fileName = String(fileName || '').replace(/^\/+/, '');
  return prefix ? prefix + '/' + fileName : fileName;
}

function FBR_buildGithubMirrorFiles_(content, traceId, driveUrl, cfg) {
  var files = [];
  var sourceFiles = content.files || [];

  sourceFiles.forEach(function (file) {
    var ext = FBR_sourceFileExtension_(file.type, file.name);
    files.push({
      path: FBR_joinRepoPath_(cfg.pathPrefix, file.name + ext),
      content: file.source || ''
    });
  });

  var rootDir = cfg.pathPrefix || '.';
  files.push({
    path: '.clasp.json',
    content: JSON.stringify({ scriptId: content.scriptId || ScriptApp.getScriptId(), rootDir: rootDir }, null, 2)
  });

  files.push({
    path: FBR_joinRepoPath_(cfg.pathPrefix, '_backup_manifest.json'),
    content: JSON.stringify(FBR_makeBackupManifest_(content, traceId, 'GITHUB_MIRROR', FBR_getScriptProperty_(FBR.PROP.SOURCE_BACKUP_FOLDER_ID, '')), null, 2)
  });

  files.push({
    path: 'CLASP_GITHUB_HANDOFF.md',
    content: FBR_githubHandoffMarkdown_(content, traceId, driveUrl, cfg)
  });

  files.push({
    path: 'README.md',
    content: FBR_githubReadme_(content, traceId, driveUrl, cfg)
  });

  return files;
}

function FBR_githubHandoffMarkdown_(content, traceId, driveUrl, cfg) {
  return [
    '# Felibrejada — Apps Script live mirror',
    '',
    'Trace: `' + traceId + '`',
    'Script ID: `' + (content.scriptId || ScriptApp.getScriptId()) + '`',
    'Version: `' + FELIBREE_SCRIPT_VERSION + '`',
    'Drive backup: ' + (driveUrl || 'DRY_RUN / non créé'),
    '',
    '## Règle',
    '',
    '- Source de vérité : Apps Script live capturé par `projects.getContent`.',
    '- Backup Drive et miroir GitHub sont produits depuis la même source live.',
    '- `.clasp.json` pointe vers `rootDir: "' + (cfg.pathPrefix || '.') + '"`.',
    '- Aucun `clasp push` automatique.',
    '',
    '## Usage local',
    '',
    '```powershell',
    'git clone https://github.com/' + cfg.owner + '/' + cfg.repo + '.git',
    'cd ' + cfg.repo,
    'clasp status',
    '```',
    '',
    'Interdit par défaut : `clasp push` sans validation humaine.'
  ].join('\\n');
}

function FBR_githubReadme_(content, traceId, driveUrl, cfg) {
  return [
    '# Felibrejada',
    '',
    'Miroir Apps Script live pour la Felibrejada dins Brantome en Perigor.',
    '',
    '- Trace backup : `' + traceId + '`',
    '- Version script : `' + FELIBREE_SCRIPT_VERSION + '`',
    '- Script ID : `' + (content.scriptId || ScriptApp.getScriptId()) + '`',
    '- Source Drive : ' + (driveUrl || 'dry-run'),
    '- Dossier CLASP : `' + (cfg.pathPrefix || '.') + '`',
    '',
    'Le dépôt est alimenté par le menu Apps Script :',
    '',
    '`💾 Backup complet Drive + CLASP + GitHub — APPLY protégé`'
  ].join('\\n');
}

function FBR_githubCommitFiles_(cfg, files, message) {
  var ref = FBR_githubGetRef_(cfg);

  if (!ref || !ref.object || !ref.object.sha) {
    FBR_githubInitializeEmptyRepo_(cfg);
    Utilities.sleep(1000);
    ref = FBR_githubGetRef_(cfg);
    if (!ref || !ref.object || !ref.object.sha) {
      throw new Error(
        'Initialisation GitHub impossible : la branche ' + cfg.branch +
        ' est introuvable après création README. Créer manuellement un README sur la branche ' +
        cfg.branch + ', puis relancer Backup complet APPLY.'
      );
    }
  }

  var parentSha = ref.object.sha;
  var parentCommit = FBR_githubRequest_(cfg, 'GET', '/git/commits/' + parentSha, null, false);
  var baseTreeSha = parentCommit.tree && parentCommit.tree.sha ? parentCommit.tree.sha : '';

  var treeEntries = files.map(function (f) {
    var blob = FBR_githubRequest_(cfg, 'POST', '/git/blobs', {
      content: Utilities.base64Encode(Utilities.newBlob(f.content || '', 'text/plain').getBytes()),
      encoding: 'base64'
    }, false);
    return {
      path: f.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    };
  });

  var treePayload = { tree: treeEntries };
  if (baseTreeSha) treePayload.base_tree = baseTreeSha;
  var tree = FBR_githubRequest_(cfg, 'POST', '/git/trees', treePayload, false);

  var commitPayload = {
    message: message,
    tree: tree.sha,
    parents: [parentSha],
    committer: { name: cfg.committerName, email: cfg.committerEmail }
  };
  var commit = FBR_githubRequest_(cfg, 'POST', '/git/commits', commitPayload, false);

  FBR_githubRequest_(cfg, 'PATCH', '/git/refs/heads/' + encodeURIComponent(cfg.branch), { sha: commit.sha, force: false }, false);

  return commit;
}

function FBR_githubInitializeEmptyRepo_(cfg) {
  var initMarkdown = [
    '# Felibrejada',
    '',
    'Initialisation automatique du dépôt vide pour le miroir Apps Script / CLASP / GitHub.',
    '',
    '- Repo : ' + cfg.owner + '/' + cfg.repo,
    '- Branche cible : ' + cfg.branch,
    '- Dossier CLASP : ' + (cfg.pathPrefix || '.'),
    '- Créé par Apps Script avant le commit complet.',
    '',
    'Ce fichier peut être remplacé par le commit de miroir complet.'
  ].join('\n');

  var payload = {
    message: 'Initialize Felibrejada repository before Apps Script mirror',
    content: Utilities.base64Encode(Utilities.newBlob(initMarkdown, 'text/plain').getBytes()),
    branch: cfg.branch,
    committer: { name: cfg.committerName, email: cfg.committerEmail }
  };

  try {
    return FBR_githubRequest_(cfg, 'PUT', '/contents/README.md', payload, false);
  } catch (firstErr) {
    var fallbackPayload = {
      message: 'Initialize Felibrejada repository before Apps Script mirror',
      content: payload.content,
      committer: payload.committer
    };
    try {
      return FBR_githubRequest_(cfg, 'PUT', '/contents/README.md', fallbackPayload, false);
    } catch (secondErr) {
      throw new Error(
        'Repo GitHub vide : initialisation README impossible. ' +
        'Erreur avec branche=' + cfg.branch + ' : ' + firstErr.message + ' / ' +
        'Erreur sans branche : ' + secondErr.message
      );
    }
  }
}

function FBR_githubGetRef_(cfg) {
  var result = FBR_githubRequest_(cfg, 'GET', '/git/ref/heads/' + encodeURIComponent(cfg.branch), null, true);
  if (result && result.__httpCode && (result.__httpCode === 404 || result.__httpCode === 409)) return null;
  return result;
}

function FBR_githubRequest_(cfg, method, path, payload, allowMissing) {
  var url = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) + path;
  var options = {
    method: method.toLowerCase(),
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + cfg.token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  if (payload !== null && payload !== undefined) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }

  var res = UrlFetchApp.fetch(url, options);
  var code = res.getResponseCode();
  var text = res.getContentText();

  if (allowMissing && (code === 404 || code === 409)) {
    return { __httpCode: code, __body: text };
  }
  if (code < 200 || code >= 300) {
    throw new Error('GitHub API ' + method + ' ' + path + ' failed HTTP ' + code + ': ' + text.slice(0, 1000));
  }
  return text ? JSON.parse(text) : {};
}
