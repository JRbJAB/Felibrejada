function FBR_refreshCockpit_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  var sheet = FBR_sheet_(FBR.SHEETS.COCKPIT, true);
  SpreadsheetApp.flush();
  sheet.getRange('H1').setValue('MAJ script');
  sheet.getRange('I1').setValue(new Date()).setNumberFormat(FBR.DATE_FORMAT);
  sheet.getRange('H2').setValue('Version');
  sheet.getRange('I2').setValue(FELIBREE_SCRIPT_VERSION);
  FBR_log_({ functionName: 'FBR_refreshCockpit_', mode: 'SAFE', status: 'OK', sheetName: FBR.SHEETS.COCKPIT, rowsRead: 0, rowsChanged: 2, message: 'Cockpit actualisé', startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Cockpit actualisé', 'Horodatage mis à jour. Trace ' + traceId);
}
