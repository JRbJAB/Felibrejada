function FBR_applyPlanningRules_(dryRun) {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  dryRun = dryRun !== false;
  FBR_ensureCoreSheets_();

  if (!dryRun && !FBR_getScriptBool_(FBR.PROP.ALLOW_PLANNING_WRITE, false)) {
    var blocked = 'Écriture planning bloquée. Ajouter la propriété script ' + FBR.PROP.ALLOW_PLANNING_WRITE + '=TRUE pour autoriser la mise à jour des colonnes planning.';
    FBR_log_({ functionName: 'FBR_applyPlanningRules_', mode: 'APPLY_BLOCKED', status: 'BLOCKED', sheetName: FBR.SHEETS.PUBLICATIONS, rowsRead: 0, rowsChanged: 0, message: blocked, startMs: startMs, traceId: traceId });
    return FBR_result_(false, 'Planning APPLY bloqué', blocked + ' Trace ' + traceId);
  }

  Object.keys(FBR_PLANNING_HEADERS).forEach(function (k) {
    FBR_ensureHeader_(FBR.SHEETS.PUBLICATIONS, FBR_PLANNING_HEADERS[k]);
  });

  var data = FBR_getRows_(FBR.SHEETS.PUBLICATIONS, 32);
  var rules = FBR_loadPlanningRules_();
  var logs = [];
  var changed = 0;
  var read = 0;

  data.rows.forEach(function (row) {
    var baseDate = FBR_get_(row, data.map, 'Date prévue');
    var channel = FBR_safeText_(FBR_get_(row, data.map, 'Canal'));
    var format = FBR_safeText_(FBR_get_(row, data.map, 'Format'));
    var status = FBR_safeText_(FBR_get_(row, data.map, 'Statut'));
    if (!FBR_isDate_(baseDate) || !channel || FBR_norm_(status) === 'annulé') return;
    read += 1;

    var override = FBR_norm_(FBR_get_(row, data.map, FBR_PLANNING_HEADERS.OVERRIDE));
    var reason = FBR_safeText_(FBR_get_(row, data.map, FBR_PLANNING_HEADERS.OVERRIDE_REASON));
    if (override === 'oui' || override === 'yes' || override === 'true') {
      if (!reason) {
        logs.push([new Date(), 'PLANNING', 'ERROR', row.rowNumber, 'Raison override', 'Override sans raison', 'Renseigner une raison obligatoire', FBR_safeText_(FBR_get_(row, data.map, 'Responsable')), 'À corriger', traceId]);
      }
      return;
    }

    var rule = FBR_findPlanningRule_(rules, channel, format);
    if (!rule) {
      logs.push([new Date(), 'PLANNING', 'BLOCKING', row.rowNumber, 'Canal', 'Aucune règle planning pour ' + channel, 'Ajouter le canal dans ⏱️ Règles Planning', FBR_safeText_(FBR_get_(row, data.map, 'Responsable')), 'À corriger', traceId]);
      return;
    }

    var planned = FBR_computePlannedDateTime_(baseDate, rule);
    var strictState = planned.shifted ? 'DÉCALÉ' : 'OK';
    var ruleText = rule.channel + ' — ' + rule.allowedRaw + ', ' + rule.primary + (rule.secondary ? ' ou ' + rule.secondary : '');

    if (!dryRun) {
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.TARGET_TIME, rule.primary);
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.PLANNED_DATETIME, FBR_formatDateTime_(planned.date));
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.RULE, ruleText);
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.STRICT, strictState);
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.OVERRIDE, 'NON');
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.CHANNEL_MASTER, rule.channel);
      FBR_set_(data.sheet, row.rowNumber, data.map, FBR_PLANNING_HEADERS.SLOT_SOURCE, FBR.SHEETS.PLANNING_RULES);
      changed += 1;
    }

    logs.push([new Date(), 'PLANNING_' + (dryRun ? 'DRY_RUN' : 'APPLY'), FBR_formatDateTime_(planned.date), channel, '[' + channel + '] ' + FBR_safeText_(FBR_get_(row, data.map, 'Message / angle')).slice(0, 120), status, FBR_calendarConfigValue_('Calendar ID', ''), '', planned.shifted ? 'WOULD_SHIFT' : 'KEEP_SLOT', strictState + ' — ' + ruleText, row.rowNumber, FBR_safeText_(FBR_get_(row, data.map, 'URL publiée')), traceId]);
  });

  if (logs.length) FBR_appendRows_(FBR.SHEETS.CALENDAR, logs);
  FBR_log_({ functionName: 'FBR_applyPlanningRules_', mode: dryRun ? 'DRY_RUN' : 'APPLY', status: 'OK', sheetName: FBR.SHEETS.PUBLICATIONS, rowsRead: read, rowsChanged: changed, message: logs.length + ' ligne(s) planning contrôlée(s)', startMs: startMs, traceId: traceId });
  return FBR_result_(true, dryRun ? 'Planning strict — dry-run' : 'Planning strict — APPLY', logs.length + ' ligne(s) contrôlée(s), ' + changed + ' ligne(s) modifiée(s). Trace ' + traceId);
}

function FBR_loadPlanningRules_() {
  var data = FBR_getRows_(FBR.SHEETS.PLANNING_RULES, 13);
  return data.rows.map(function (row) {
    return {
      channel: FBR_safeText_(FBR_get_(row, data.map, 'Canal')),
      type: FBR_safeText_(FBR_get_(row, data.map, 'Type contenu')),
      allowedRaw: FBR_safeText_(FBR_get_(row, data.map, 'Jours autorisés')),
      forbiddenRaw: FBR_safeText_(FBR_get_(row, data.map, 'Jours interdits')),
      primary: FBR_timeToHHmm_(FBR_get_(row, data.map, 'Créneau principal')),
      secondary: FBR_timeToHHmm_(FBR_get_(row, data.map, 'Créneau secours')),
      duration: Number(FBR_get_(row, data.map, 'Durée événement min') || 30),
      strict: FBR_isTruthy_(FBR_get_(row, data.map, 'Règle stricte'))
    };
  }).filter(function (r) { return r.channel && r.primary; });
}

function FBR_findPlanningRule_(rules, channel, format) {
  var c = FBR_norm_(channel);
  var f = FBR_norm_(format);
  var candidates = rules.filter(function (r) { return FBR_norm_(r.channel) === c; });
  if (!candidates.length && c.indexOf('x') >= 0) candidates = rules.filter(function (r) { return FBR_norm_(r.channel).indexOf('x') >= 0; });
  if (!candidates.length) return null;
  var exact = candidates.filter(function (r) {
    var t = FBR_norm_(r.type);
    return t && (f.indexOf(t) >= 0 || t.indexOf(f) >= 0);
  });
  if (exact.length) return exact[0];
  if (c === 'instagram' && f.indexOf('story') >= 0) {
    var story = candidates.filter(function (r) { return FBR_norm_(r.type).indexOf('story') >= 0; });
    if (story.length) return story[0];
  }
  return candidates[0];
}

function FBR_computePlannedDateTime_(baseDate, rule) {
  var d = FBR_copyDateOnly_(baseDate);
  var allowed = FBR_parseDayList_(rule.allowedRaw);
  var forbiddenRaw = FBR_norm_(rule.forbiddenRaw);
  var shifted = false;
  for (var i = 0; i < 21; i++) {
    if (i > 0) shifted = true;
    if (FBR_isAllowedPlanningDay_(d, allowed, forbiddenRaw)) {
      return { date: FBR_applyTimeToDate_(d, rule.primary), shifted: shifted };
    }
    d.setDate(d.getDate() + 1);
  }
  return { date: FBR_applyTimeToDate_(baseDate, rule.secondary || rule.primary), shifted: true };
}


function FBR_timeToHHmm_(value) {
  if (FBR_isDate_(value)) {
    return Utilities.formatDate(value, FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'HH:mm');
  }
  var s = FBR_safeText_(value);
  if (!s) return '';
  var m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return ('0' + Number(m[1])).slice(-2) + ':' + m[2];
  return s;
}

function FBR_applyTimeToDate_(date, hhmm) {
  var d = FBR_copyDateOnly_(date);
  var parts = String(hhmm || '09:00').split(':');
  d.setHours(Number(parts[0] || 9), Number(parts[1] || 0), 0, 0);
  return d;
}

function FBR_parseDayList_(raw) {
  var map = { 'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6 };
  var s = FBR_norm_(raw).replace(/;/g, ',');
  var out = [];
  Object.keys(map).forEach(function (name) {
    if (s.indexOf(name) >= 0) out.push(map[name]);
  });
  return out;
}

function FBR_isAllowedPlanningDay_(date, allowed, forbiddenRaw) {
  var day = date.getDay();
  if (allowed.length && allowed.indexOf(day) < 0) return false;
  if (forbiddenRaw.indexOf(FBR_dayName_(day)) >= 0) return false;
  if (forbiddenRaw.indexOf('week-end') >= 0 && (day === 0 || day === 6)) return false;
  if (forbiddenRaw.indexOf('jours fériés') >= 0 && FBR_isFrenchFixedHoliday_(date)) return false;
  if (forbiddenRaw.indexOf('jour férié') >= 0 && FBR_isFrenchFixedHoliday_(date)) return false;
  return true;
}

function FBR_dayName_(day) {
  return ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][day];
}

function FBR_isFrenchFixedHoliday_(date) {
  var md = Utilities.formatDate(date, FBR_CALENDAR_DEFAULTS.TIME_ZONE, 'MM-dd');
  return ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'].indexOf(md) >= 0;
}
