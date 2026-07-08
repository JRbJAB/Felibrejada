
function FBR_eventColorForStatus_(status, channel) {
  var key = FBR_norm_(status);
  if (FBR_EVENT_COLOR_BY_STATUS[key]) return FBR_EVENT_COLOR_BY_STATUS[key];
  var c = FBR_norm_(channel);
  if (c.indexOf('presse') >= 0) return CalendarApp.EventColor.ORANGE;
  if (c.indexOf('site') >= 0 || c.indexOf('chatbot') >= 0) return CalendarApp.EventColor.GRAY;
  if (c.indexOf('newsletter') >= 0) return CalendarApp.EventColor.CYAN;
  return CalendarApp.EventColor.PALE_BLUE;
}

function FBR_applyEventColorSafe_(event, status, channel) {
  try {
    if (event && event.setColor) event.setColor(FBR_eventColorForStatus_(status, channel));
  } catch (err) {
    // Non bloquant : les libellés/couleurs sont une aide visuelle, pas la source de vérité.
  }
}

function FBR_prepareDedicatedCalendar_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  dryRun = dryRun !== false;

  var props = PropertiesService.getScriptProperties();
  var name = FBR_calendarConfigValue_('Nom calendrier', FBR_getScriptProperty_(FBR.PROP.CALENDAR_NAME, FBR_CALENDAR_DEFAULTS.NAME));
  var timeZone = FBR_calendarConfigValue_('Time zone', FBR_CALENDAR_DEFAULTS.TIME_ZONE) || FBR_CALENDAR_DEFAULTS.TIME_ZONE;
  var calendarId = FBR_calendarConfigValue_('Calendar ID', FBR_getScriptProperty_(FBR.PROP.CALENDAR_ID, ''));
  var calendar = calendarId ? CalendarApp.getCalendarById(calendarId) : null;
  var action = 'NONE';
  var status = 'OK';
  var message = '';

  if (!calendar) {
    var matches = CalendarApp.getCalendarsByName(name);
    calendar = matches && matches.length ? matches[0] : null;
    if (calendar) {
      calendarId = calendar.getId();
      action = 'FOUND_BY_NAME';
      message = 'Calendrier existant trouvé par nom.';
    }
  }

  if (calendar) {
    calendarId = calendar.getId();
    props.setProperty(FBR.PROP.CALENDAR_ID, calendarId);
    props.setProperty(FBR.PROP.CALENDAR_NAME, name);
    FBR_setCalendarConfigValue_('Calendar ID', calendarId);
    action = action || 'EXISTS';
    message = message || 'Calendrier dédié déjà disponible.';
  } else if (dryRun) {
    action = 'WOULD_CREATE';
    status = 'DRY_RUN';
    message = 'Créerait le calendrier dédié : ' + name + ' / timezone ' + timeZone;
  } else {
    if (!FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_CREATE, false)) {
      status = 'BLOCKED';
      action = 'CREATE_BLOCKED';
      message = 'Création Calendar bloquée. Ajouter la propriété script ' + FBR.PROP.ALLOW_CALENDAR_CREATE + '=TRUE pour autoriser la création.';
      FBR_appendRows_(FBR.SHEETS.CALENDAR, [[new Date(), 'APPLY_BLOCKED', '', '', name, '', calendarId || '', '', action, message, '', '', traceId]]);
      FBR_log_({ functionName: 'FBR_prepareDedicatedCalendar_', mode: 'APPLY_BLOCKED', status: 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR_CONFIG, rowsRead: 1, rowsChanged: 0, message: message, startMs: startMs, traceId: traceId });
      return FBR_result_(false, 'Création calendrier bloquée', message + ' Trace ' + traceId);
    }
    calendar = CalendarApp.createCalendar(name, {
      description: FBR_CALENDAR_DEFAULTS.DESCRIPTION,
      timeZone: timeZone,
      selected: true,
      hidden: false
    });
    calendarId = calendar.getId();
    props.setProperty(FBR.PROP.CALENDAR_ID, calendarId);
    props.setProperty(FBR.PROP.CALENDAR_NAME, name);
    FBR_setCalendarConfigValue_('Calendar ID', calendarId);
    action = 'CREATED';
    message = 'Calendrier dédié créé : ' + calendarId;
  }

  FBR_appendRows_(FBR.SHEETS.CALENDAR, [[new Date(), dryRun ? 'DRY_RUN' : 'APPLY', '', '', name, '', calendarId || 'NO_DEDICATED_CALENDAR_YET', '', action, status + ' — ' + message, '', '', traceId]]);
  FBR_log_({ functionName: 'FBR_prepareDedicatedCalendar_', mode: dryRun ? 'DRY_RUN' : 'APPLY', status: status, sheetName: FBR.SHEETS.CALENDAR_CONFIG, rowsRead: 1, rowsChanged: dryRun ? 0 : 1, message: message, startMs: startMs, traceId: traceId });
  return FBR_result_(status !== 'BLOCKED', dryRun ? 'Calendrier dédié — dry-run' : 'Calendrier dédié — APPLY', message + ' Trace ' + traceId);
}

function FBR_shareDedicatedCalendar_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  dryRun = dryRun !== false;

  var calendarId = FBR_calendarConfigValue_('Calendar ID', FBR_getScriptProperty_(FBR.PROP.CALENDAR_ID, ''));
  if (!calendarId) {
    var msgNoCal = 'Aucun Calendar ID. Lancer d’abord “Calendrier dédié — dry-run”, puis “Créer calendrier — APPLY protégé”.';
    FBR_log_({ functionName: 'FBR_shareDedicatedCalendar_', mode: dryRun ? 'DRY_RUN' : 'APPLY', status: 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR_CONFIG, rowsRead: 0, rowsChanged: 0, message: msgNoCal, startMs: startMs, traceId: traceId });
    return FBR_result_(false, 'Partage impossible', msgNoCal + ' Trace ' + traceId);
  }
  if (!dryRun && !FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_SHARE, false)) {
    var msgShareBlocked = 'Partage Calendar bloqué. Ajouter la propriété script ' + FBR.PROP.ALLOW_CALENDAR_SHARE + '=TRUE pour autoriser le partage.';
    FBR_log_({ functionName: 'FBR_shareDedicatedCalendar_', mode: 'APPLY_BLOCKED', status: 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR_CONFIG, rowsRead: 0, rowsChanged: 0, message: msgShareBlocked, startMs: startMs, traceId: traceId });
    return FBR_result_(false, 'Partage calendrier bloqué', msgShareBlocked + ' Trace ' + traceId);
  }
  if (!dryRun && (typeof Calendar === 'undefined' || !Calendar.Acl || !Calendar.Acl.insert)) {
    var msgService = 'Service avancé Calendar API non disponible. Activer le service avancé “Calendar API” ou partager le calendrier manuellement depuis l’interface Google Calendar.';
    FBR_log_({ functionName: 'FBR_shareDedicatedCalendar_', mode: 'APPLY_BLOCKED', status: 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR_CONFIG, rowsRead: 0, rowsChanged: 0, message: msgService, startMs: startMs, traceId: traceId });
    return FBR_result_(false, 'Service Calendar API manquant', msgService + ' Trace ' + traceId);
  }

  var sheet = FBR_sheet_(FBR.SHEETS.CALENDAR_CONFIG, true);
  var lastRow = sheet.getLastRow();
  var rows = lastRow >= 13 ? sheet.getRange(13, 1, lastRow - 12, 6).getValues() : [];
  var logs = [];
  var read = 0;
  var changed = 0;
  rows.forEach(function (row, i) {
    var rowNumber = 13 + i;
    var email = FBR_safeText_(row[0]);
    var role = FBR_norm_(row[1] || 'reader');
    var apply = FBR_isTruthy_(row[2]);
    if (!email) return;
    read += 1;
    if (['reader', 'writer', 'owner', 'freeBusyReader'].indexOf(role) < 0) role = 'reader';
    var result = dryRun ? 'WOULD_SHARE' : 'SKIPPED';
    var note = '';
    if (!apply) {
      result = 'SKIPPED_NOT_MARKED';
      note = 'Mettre “OUI” dans Appliquer ? pour partager.';
    } else if (!dryRun) {
      try {
        Calendar.Acl.insert({ role: role, scope: { type: 'user', value: email } }, calendarId, { sendNotifications: true });
        result = 'SHARED';
        note = 'Partage appliqué.';
        sheet.getRange(rowNumber, 4).setValue(result);
        sheet.getRange(rowNumber, 5).setValue(new Date()).setNumberFormat(FBR.DATE_FORMAT);
        sheet.getRange(rowNumber, 6).setValue(note);
        changed += 1;
      } catch (err) {
        result = 'ERROR_OR_EXISTS';
        note = err && err.message ? err.message : String(err);
        sheet.getRange(rowNumber, 4).setValue(result);
        sheet.getRange(rowNumber, 6).setValue(note);
      }
    }
    logs.push([new Date(), dryRun ? 'DRY_RUN' : 'APPLY', '', '', email, role, calendarId, '', 'SHARE', result + ' — ' + note, rowNumber, '', traceId]);
  });
  if (logs.length === 0) {
    logs.push([new Date(), dryRun ? 'DRY_RUN' : 'APPLY', '', '', '', '', calendarId, '', 'SHARE', 'Aucun collaborateur listé', '', '', traceId]);
  }
  FBR_appendRows_(FBR.SHEETS.CALENDAR, logs);
  FBR_log_({ functionName: 'FBR_shareDedicatedCalendar_', mode: dryRun ? 'DRY_RUN' : 'APPLY', status: 'OK', sheetName: FBR.SHEETS.CALENDAR_CONFIG, rowsRead: read, rowsChanged: changed, message: logs.length + ' ligne(s) partage Calendar Sync', startMs: startMs, traceId: traceId });
  return FBR_result_(true, dryRun ? 'Partage calendrier — dry-run' : 'Partage calendrier — APPLY', logs.length + ' ligne(s) tracée(s), ' + changed + ' partage(s) appliqué(s). Trace ' + traceId);
}

function FBR_syncCalendar_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  dryRun = dryRun !== false;

  var props = PropertiesService.getScriptProperties();
  var calendarId = FBR_calendarConfigValue_('Calendar ID', props.getProperty(FBR.PROP.CALENDAR_ID) || '');
  var calendar = calendarId ? CalendarApp.getCalendarById(calendarId) : null;

  if (!calendarId) {
    var msgNoDedicated = 'Aucun calendrier dédié configuré. Lancer “Calendrier dédié — dry-run”, puis créer le calendrier avant tout APPLY.';
    FBR_appendRows_(FBR.SHEETS.CALENDAR, [[new Date(), dryRun ? 'DRY_RUN' : 'APPLY_BLOCKED', '', '', '', '', 'NO_DEDICATED_CALENDAR_YET', '', 'BLOCKED', msgNoDedicated, '', '', traceId]]);
    FBR_log_({ functionName: 'FBR_syncCalendar_', mode: dryRun ? 'DRY_RUN' : 'APPLY_BLOCKED', status: dryRun ? 'WARNING' : 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR, rowsRead: 0, rowsChanged: 0, message: msgNoDedicated, startMs: startMs, traceId: traceId });
    return FBR_result_(dryRun, dryRun ? 'Calendar dry-run sans calendrier dédié' : 'Calendar APPLY bloqué', msgNoDedicated + ' Trace ' + traceId);
  }

  if (!calendar) {
    var msgMissing = 'Calendrier introuvable avec FELIBREE_CALENDAR_ID=' + calendarId + '. Vérifier les droits ou recréer le calendrier dédié.';
    FBR_log_({ functionName: 'FBR_syncCalendar_', mode: dryRun ? 'DRY_RUN' : 'APPLY_BLOCKED', status: 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR, rowsRead: 0, rowsChanged: 0, message: msgMissing, startMs: startMs, traceId: traceId });
    return FBR_result_(false, 'Calendrier dédié introuvable', msgMissing + ' Trace ' + traceId);
  }

  if (!dryRun && !FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_WRITE, false)) {
    var msg = 'Écriture Calendar bloquée. Ajouter la propriété script ' + FBR.PROP.ALLOW_CALENDAR_WRITE + '=TRUE pour autoriser APPLY.';
    FBR_log_({ functionName: 'FBR_syncCalendar_', mode: 'APPLY_BLOCKED', status: 'BLOCKED', sheetName: FBR.SHEETS.CALENDAR, rowsRead: 0, rowsChanged: 0, message: msg, startMs: startMs, traceId: traceId });
    return FBR_result_(false, 'Calendar APPLY bloqué', msg + ' Trace ' + traceId);
  }

  var eventIdCol = FBR_ensureHeader_(FBR.SHEETS.PUBLICATIONS, 'Calendar Event ID');
  var lastSyncCol = FBR_ensureHeader_(FBR.SHEETS.PUBLICATIONS, 'Last Sync');
  FBR_ensureHeader_(FBR.SHEETS.PUBLICATIONS, 'Script Notes');

  var data = FBR_getRows_(FBR.SHEETS.PUBLICATIONS, Math.max(32, lastSyncCol));
  var today = FBR_todayStart_();
  var horizon = FBR_daysFromNow_(FBR.CALENDAR_LOOKAHEAD_DAYS);
  var logs = [];
  var changed = 0;
  var read = 0;

  data.rows.forEach(function (row) {
    var rawDate = FBR_get_(row, data.map, 'Date prévue');
    var plannedValue = FBR_get_(row, data.map, FBR_PLANNING_HEADERS.PLANNED_DATETIME);
    var date = FBR_parseDateTimeValue_(plannedValue) || (FBR_isDate_(rawDate) ? rawDate : null);
    var status = FBR_safeText_(FBR_get_(row, data.map, 'Statut'));
    var planningStrict = FBR_safeText_(FBR_get_(row, data.map, FBR_PLANNING_HEADERS.STRICT));
    if (!FBR_isDate_(date)) return;
    if (date < today || date > horizon) return;
    if (FBR_norm_(status) === 'annulé') return;
    if (!planningStrict) {
      logs.push([new Date(), dryRun ? 'DRY_RUN_BLOCKED' : 'APPLY_BLOCKED', rawDate, FBR_safeText_(FBR_get_(row, data.map, 'Canal')), '', status, calendarId, '', 'BLOCKED_NO_PLANNING', 'Planning strict manquant : lancer ⏱️ Planning strict avant Calendar Sync', row.rowNumber, FBR_safeText_(FBR_get_(row, data.map, 'URL publiée')), traceId]);
      return;
    }
    read += 1;

    var channel = FBR_safeText_(FBR_get_(row, data.map, 'Canal')) || 'Canal';
    var message = FBR_safeText_(FBR_get_(row, data.map, 'Message / angle')) || 'Publication Félibrée';
    var title = '[' + channel + '] ' + message.slice(0, 120);
    var description = [
      'Félibrée — calendrier éditorial',
      'Ligne source: ' + row.rowNumber,
      'Statut: ' + status,
      'Format: ' + FBR_safeText_(FBR_get_(row, data.map, 'Format')),
      'Pilier: ' + FBR_safeText_(FBR_get_(row, data.map, 'Pilier')),
      'Audience: ' + FBR_safeText_(FBR_get_(row, data.map, 'Audience')),
      'CTA: ' + FBR_safeText_(FBR_get_(row, data.map, 'CTA')),
      'Responsable: ' + FBR_safeText_(FBR_get_(row, data.map, 'Responsable')),
      'Mode/API: ' + FBR_safeText_(FBR_get_(row, data.map, 'Mode/API')),
      'URL publiée: ' + FBR_safeText_(FBR_get_(row, data.map, 'URL publiée')),
      'Date/heure planifiée: ' + FBR_formatDateTime_(date),
      'Règle planning: ' + FBR_safeText_(FBR_get_(row, data.map, FBR_PLANNING_HEADERS.RULE)),
      'Planning strict: ' + FBR_safeText_(FBR_get_(row, data.map, FBR_PLANNING_HEADERS.STRICT))
    ].join('\n');

    var existingEventId = FBR_safeText_(row.cells[eventIdCol - 1]);
    var action = existingEventId ? 'UPDATE' : 'CREATE';
    var result = 'DRY_RUN';
    var eventId = existingEventId;

    if (!dryRun) {
      var event = null;
      if (existingEventId) {
        try { event = calendar.getEventById(existingEventId); } catch (err) { event = null; }
      }
      if (event) {
        event.setTitle(title);
        event.setDescription(description);
        event.setTime(date, FBR_addMinutes_(date, Number(FBR_safeText_(FBR_get_(row, data.map, 'Durée événement min')) || 30)));
        FBR_applyEventColorSafe_(event, status, channel);
        action = 'UPDATE';
        result = 'UPDATED';
      } else {
        event = calendar.createEvent(title, date, FBR_addMinutes_(date, 30), { description: description });
        FBR_applyEventColorSafe_(event, status, channel);
        eventId = event.getId();
        action = 'CREATE';
        result = 'CREATED';
      }
      data.sheet.getRange(row.rowNumber, eventIdCol).setValue(eventId);
      data.sheet.getRange(row.rowNumber, lastSyncCol).setValue(new Date()).setNumberFormat(FBR.DATE_FORMAT);
      changed += 1;
    }

    logs.push([new Date(), dryRun ? 'DRY_RUN' : 'APPLY', FBR_formatDateTime_(date), channel, title, status, calendarId, eventId, action, result, row.rowNumber, FBR_safeText_(FBR_get_(row, data.map, 'URL publiée')), traceId]);
  });

  if (logs.length === 0) {
    logs.push([new Date(), dryRun ? 'DRY_RUN' : 'APPLY', '', '', '', '', calendarId, '', 'NONE', 'Aucun contenu dans la fenêtre de synchronisation', '', '', traceId]);
  }
  FBR_appendRows_(FBR.SHEETS.CALENDAR, logs);
  FBR_log_({ functionName: 'FBR_syncCalendar_', mode: dryRun ? 'DRY_RUN' : 'APPLY', status: 'OK', sheetName: FBR.SHEETS.CALENDAR, rowsRead: read, rowsChanged: changed, message: logs.length + ' ligne(s) Calendar Sync', startMs: startMs, traceId: traceId });
  return FBR_result_(true, dryRun ? 'Calendar dry-run terminé' : 'Calendar APPLY terminé', logs.length + ' ligne(s) tracée(s), ' + changed + ' événement(s) modifié(s). Trace ' + traceId);
}
