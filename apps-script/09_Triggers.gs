function FBR_removeTriggers_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  var removed = 0;
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger) {
    if (FBR.TRIGGER_HANDLERS.indexOf(trigger.getHandlerFunction()) >= 0) {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    }
  });
  FBR_log_({ functionName: 'FBR_removeTriggers_', mode: 'APPLY', status: 'OK', sheetName: FBR.SHEETS.LOGS, rowsRead: triggers.length, rowsChanged: removed, message: removed + ' trigger(s) supprimé(s)', startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Triggers supprimés', removed + ' trigger(s) supprimé(s). Trace ' + traceId);
}

function FBR_installTriggers_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_removeTriggers_();

  ScriptApp.newTrigger('FELIBREE_triggerDailyRefresh')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();

  ScriptApp.newTrigger('FELIBREE_triggerWeeklyReview')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();

  FBR_log_({ functionName: 'FBR_installTriggers_', mode: 'APPLY', status: 'OK', sheetName: FBR.SHEETS.LOGS, rowsRead: 0, rowsChanged: 2, message: 'Triggers quotidiens/hebdo installés', startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Triggers installés', 'Daily refresh 07:00 + weekly review lundi 08:00. Trace ' + traceId);
}
