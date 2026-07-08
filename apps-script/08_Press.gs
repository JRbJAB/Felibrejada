function FBR_pressDue_(silent) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  var data = FBR_getRows_(FBR.SHEETS.PRESS, 17);
  var today = FBR_todayStart_();
  var due = [];

  data.rows.forEach(function (row) {
    var relance = FBR_get_(row, data.map, 'Date relance');
    var status = FBR_norm_(FBR_get_(row, data.map, 'Statut'));
    if (FBR_isDate_(relance) && relance <= today && status !== 'retombée obtenue') {
      due.push({
        rowNumber: row.rowNumber,
        media: FBR_safeText_(FBR_get_(row, data.map, 'Média / organisme')),
        type: FBR_safeText_(FBR_get_(row, data.map, 'Type')),
        action: FBR_safeText_(FBR_get_(row, data.map, 'Prochaine action')),
        owner: FBR_safeText_(FBR_get_(row, data.map, 'Responsable')),
        dateRelance: relance
      });
    }
  });

  var message = due.length ? due.map(function (d) {
    return 'Ligne ' + d.rowNumber + ' — ' + d.media + ' — ' + d.action + ' — ' + d.owner;
  }).join('\n') : 'Aucune relance presse due aujourd\'hui.';

  FBR_log_({ functionName: 'FBR_pressDue_', mode: 'READ_ONLY', status: 'OK', sheetName: FBR.SHEETS.PRESS, rowsRead: data.rows.length, rowsChanged: 0, message: due.length + ' relance(s) due(s)', startMs: startMs, traceId: traceId });

  if (!silent) {
    SpreadsheetApp.getUi().alert('Relances presse dues', message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return FBR_result_(true, 'Relances presse dues', message + '\nTrace ' + traceId);
}
