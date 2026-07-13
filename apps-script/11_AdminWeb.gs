function FBR_calendarEmbedUrl_() {
  var calendarId = FBR_calendarConfigValue_('Calendar ID', FBR_getScriptProperty_(FBR.PROP.CALENDAR_ID, FBR_ADMIN_WEB_DEFAULTS.CALENDAR_ID));
  if (!calendarId) calendarId = FBR_ADMIN_WEB_DEFAULTS.CALENDAR_ID;
  return 'https://calendar.google.com/calendar/embed?src=' + encodeURIComponent(calendarId) + '&ctz=Europe%2FParis';
}

function FBR_getAdminWebState_() {
  FBR_ensureCoreSheets_();
  var props = PropertiesService.getScriptProperties();
  return {
    version: FELIBREE_SCRIPT_VERSION,
    user: FBR_user_(),
    spreadsheetUrl: FBR_ss_().getUrl(),
    calendarId: FBR_calendarConfigValue_('Calendar ID', FBR_getScriptProperty_(FBR.PROP.CALENDAR_ID, FBR_ADMIN_WEB_DEFAULTS.CALENDAR_ID)),
    calendarEmbedUrl: FBR_calendarEmbedUrl_(),
    calendarSettingsUrl: FBR_ADMIN_WEB_DEFAULTS.CALENDAR_SETTINGS_URL,
    adminWebUrl: props.getProperty(FBR.PROP.ADMIN_WEB_URL) || '',
    calendarWriteEnabled: FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_WRITE, false),
    calendarShareEnabled: FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_SHARE, false)
  };
}

function FBR_doGetAdminWeb_(e) {
  var view = e && e.parameter ? String(e.parameter.view || '').toLowerCase() : '';
  if (view === 'plan-communication' || view === 'plan-com') {
    return FBR_PLAN_COMM_getStandaloneWebOutput_();
  }

  var tpl = HtmlService.createTemplateFromFile('12_AdminWeb');
  tpl.stateJson = JSON.stringify(FBR_getAdminWebState_());
  return tpl.evaluate()
    .setTitle('Félibrée Admin Web')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function FBR_showAdminWebDialog_() {
  var state = FBR_getAdminWebState_();
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:14px;line-height:1.45">' +
    '<h2>🖥️ Admin Web Félibrée</h2>' +
    '<p><b>Admin web déployé :</b> ' + (state.adminWebUrl ? 'oui' : 'non') + '</p>' +
    '<p><a target="_blank" href="' + (state.adminWebUrl || state.spreadsheetUrl) + '">Ouvrir Admin Web / Sheet</a></p>' +
    '<p><a target="_blank" href="' + state.calendarEmbedUrl + '">Ouvrir calendrier intégré</a></p>' +
    '<p><a target="_blank" href="' + state.calendarSettingsUrl + '">Paramètres Google Calendar</a></p>' +
    '<p style="color:#7a3b00"><b>Rappel :</b> l’iframe calendrier reste admin privé, pas site public.</p>' +
    '</div>'
  ).setWidth(520).setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(html, '🖥️ Admin Web / Calendrier');
  FBR_log_({ functionName: 'FBR_showAdminWebDialog_', mode: 'SAFE_UI', status: 'OK', sheetName: FBR.SHEETS.ADMIN_WEB, rowsRead: 0, rowsChanged: 0, message: 'Panneau Admin Web affiché', startMs: Date.now(), traceId: FBR_traceId_() });
  return FBR_result_(true, 'Admin Web', 'Panneau affiché.');
}

function FBR_setAdminWebUrl_(url) {
  if (!url) throw new Error('URL admin web manquante.');
  PropertiesService.getScriptProperties().setProperty(FBR.PROP.ADMIN_WEB_URL, url);
  var sheet = FBR_sheet_(FBR.SHEETS.ADMIN_WEB, true);
  sheet.getRange(5, 3).setValue(url);
  return FBR_result_(true, 'Admin web URL', 'URL enregistrée.');
}
