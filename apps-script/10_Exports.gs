function FELIBREE_logSnapshotOnly() {
  return FBR_logSnapshotOnly_('MANUAL');
}

function FBR_logSnapshotOnly_(mode) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  var rows = [[new Date(), 'SNAPSHOT_LOG', 'Courante', 'Google Sheet', 'LOG_ONLY', mode || 'MANUAL', 'OK', FBR_ss_().getUrl(), FBR_user_(), 'Snapshot logique sans création fichier. Trace ' + traceId]];
  FBR_appendRows_(FBR.SHEETS.EXPORTS, rows);
  FBR_log_({ functionName: 'FBR_logSnapshotOnly_', mode: mode || 'MANUAL', status: 'OK', sheetName: FBR.SHEETS.EXPORTS, rowsRead: 0, rowsChanged: 1, message: 'Snapshot log-only', startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Snapshot tracé', 'Ajout dans 📤 Exports. Trace ' + traceId);
}
