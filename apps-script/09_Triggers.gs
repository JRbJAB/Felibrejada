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
  FBR_log_({ functionName: 'FBR_removeTriggers_', mode: 'APPLY', status: 'OK', sheetName: FBR.SHEETS.LOGS, rowsRead: triggers.length, rowsChanged: removed, message: removed + ' trigger(s) quotidiens/hebdo supprimé(s) ; déclencheur menu conservé', startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Triggers supprimés', removed + ' trigger(s) quotidiens/hebdo supprimé(s). Le déclencheur menu est conservé. Trace ' + traceId);
}

function FBR_removeMenuOpenTriggers_() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === FBR.MENU_OPEN_TRIGGER_HANDLER) {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    }
  });
  return removed;
}

function FBR_installTriggers_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_removeTriggers_();
  var removedMenu = FBR_removeMenuOpenTriggers_();

  ScriptApp.newTrigger(FBR.MENU_OPEN_TRIGGER_HANDLER)
    .forSpreadsheet(FBR_ss_())
    .onOpen()
    .create();

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

  FBR_log_({ functionName: 'FBR_installTriggers_', mode: 'APPLY', status: 'OK', sheetName: FBR.SHEETS.LOGS, rowsRead: 0, rowsChanged: 3, message: 'Déclencheur ouverture menu + triggers quotidiens/hebdo installés ; ancien(s) menu supprimé(s)=' + removedMenu, startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Triggers installés', 'Menu à l’ouverture + daily refresh 07:00 + weekly review lundi 08:00. Ancien(s) menu supprimé(s) : ' + removedMenu + '. Trace ' + traceId);
}

function FBR_menuOpenTriggerStatus_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  var triggers = ScriptApp.getProjectTriggers();
  var matches = triggers.filter(function (trigger) {
    return trigger.getHandlerFunction() === FBR.MENU_OPEN_TRIGGER_HANDLER;
  });
  var details = 'Déclencheur ouverture menu : ' + (matches.length === 1 ? 'INSTALLÉ' : (matches.length ? 'DOUBLON' : 'ABSENT')) +
    '\nNombre : ' + matches.length +
    '\nProjet : ' + ScriptApp.getScriptId() +
    '\nVersion : ' + FELIBREE_SCRIPT_VERSION +
    '\nTrace ' + traceId;
  var status = matches.length === 1 ? 'OK' : (matches.length ? 'DUPLICATE' : 'MISSING');
  FBR_log_({ functionName: 'FBR_menuOpenTriggerStatus_', mode: 'READ_ONLY', status: status, sheetName: FBR.SHEETS.LOGS, rowsRead: triggers.length, rowsChanged: 0, message: details, startMs: startMs, traceId: traceId });
  console.log(details);
  return FBR_result_(matches.length === 1, 'Statut déclencheur ouverture menu', details);
}

function FBR_installMenuOpenTrigger_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  var triggersBefore = ScriptApp.getProjectTriggers();
  var removed = FBR_removeMenuOpenTriggers_();

  var created = ScriptApp.newTrigger(FBR.MENU_OPEN_TRIGGER_HANDLER)
    .forSpreadsheet(FBR_ss_())
    .onOpen()
    .create();

  var details = 'Déclencheur ouverture menu installé.' +
    '\nAnciens supprimés : ' + removed +
    '\nTrigger ID : ' + created.getUniqueId() +
    '\nProjet : ' + ScriptApp.getScriptId() +
    '\nVersion : ' + FELIBREE_SCRIPT_VERSION +
    '\nTrace ' + traceId;

  FBR_log_({ functionName: 'FBR_installMenuOpenTrigger_', mode: 'APPLY', status: 'OK', sheetName: FBR.SHEETS.LOGS, rowsRead: triggersBefore.length, rowsChanged: removed + 1, message: details, startMs: startMs, traceId: traceId });
  console.log(details);
  return FBR_result_(true, 'Déclencheur ouverture menu installé', details);
}
