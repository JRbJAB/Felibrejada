/**
 * 🎉 Felibrejada dins Brantome en Perigor — Apps Script strict UI + automations.
 * Version: FELIBREE_SCRIPT_VERSION in 01_Config.gs
 * Bound script expected on the Google Sheet:
 * 📣 Félibrée 2027 — Pilotage réseaux, presse, chatbot, site admin
 */

function onOpen(e) {
  FBR_onOpen(e);
}

function FELIBREE_install() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_install',
    mode: 'INSTALL_APPLY',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true,
    startMessage: 'Initialisation / réparation des onglets techniques.',
    rowsRead: FBR.REQUIRED_SHEETS.length,
    rowsChanged: 0,
    successMessage: 'Installation terminée : onglets requis vérifiés, cockpit actualisé et contrôles qualité exécutés.',
    notes: 'Les sous-actions Cockpit et QA conservent leurs propres traces.'
  }, function () {
    FBR_ensureCoreSheets_();
    var cockpit = FBR_refreshCockpit_();
    var quality = FBR_runQualityChecks_();
    return {
      ok: true,
      title: 'Installation Félibrée terminée',
      details: 'Onglets requis vérifiés ; cockpit et contrôles qualité actualisés.',
      cockpit: cockpit,
      quality: quality
    };
  });
}

function FELIBREE_openSidebar() {
  FBR_showSidebar_();
}



function FELIBREE_openAideNotice() {
  return FBR_HELP_STATIC_showSidebar_();
}

function FELIBREE_aideNoticeDiagnostic() {
  return FBR_HELP_STATIC_diagnosticLogOnly_();
}


function FELIBREE_openAideNoticeFullscreen() {
  return FBR_HELP_STATIC_showFullscreenDialog_();
}

function FELIBREE_aideNoticeFullscreenDiagnostic() {
  return FBR_HELP_STATIC_fullscreenDiagnostic_();
}

/**
 * Web Apps séparées :
 * - l’ancien déploiement Admin/calendrier reste figé sur sa version publiée ;
 * - HEAD n’expose plus de doGet ni de wrappers Admin Web ;
 * - les futurs Web Admin et Web User vivent dans deux projets autonomes.
 */

function FELIBREE_openPlanCommunicationTimeline() {
  return FBR_PLAN_COMM_showTimelineDialog_();
}

function FELIBREE_getPlanCommunicationTimelineState() {
  return FBR_PLAN_COMM_getTimelineState_();
}

function FELIBREE_planCommunicationTimelineDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_planCommunicationTimelineDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR_PLAN_COMM_TIMELINE_CFG.SHEET_NAME,
    logStart: true,
    rowsRead: function (result) { return result && result.itemCount ? result.itemCount : 0; },
    rowsChanged: 0,
    successMessage: function (result) {
      return 'Plan Communication dry-run : ' + (result && result.itemCount ? result.itemCount : 0) + ' axe(s), aucune écriture.';
    }
  }, function () {
    return FBR_PLAN_COMM_uiStrictDryRun_();
  });
}

function FELIBREE_planCommunicationTimelineApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_planCommunicationTimelineApply',
    mode: 'APPLY',
    sheetName: FBR_PLAN_COMM_TIMELINE_CFG.SHEET_NAME,
    logStart: true,
    rowsRead: function (result) { return result && result.itemCount ? result.itemCount : 0; },
    rowsChanged: function (result) { return result && result.applied ? 25 : 0; },
    successMessage: function (result) {
      return 'Plan Communication APPLY : timeline reconstruite dans ' +
        FBR_PLAN_COMM_TIMELINE_CFG.UI_RANGE + ' ; axes=' +
        (result && result.itemCount ? result.itemCount : 0) + '.';
    },
    notes: 'Écriture limitée à la zone UI/timeline ; aucune donnée métier source modifiée.'
  }, function () {
    return FBR_PLAN_COMM_uiStrictApply_();
  });
}

function FELIBREE_menuOpenInstallable(e) {
  return FBR_onOpen(e);
}

function FELIBREE_installMenuOpenTrigger() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_installMenuOpenTrigger',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.LOGS,
    logSuccess: false
  }, function () {
    return FBR_installMenuOpenTrigger_();
  });
}

function FELIBREE_menuOpenTriggerStatus() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_menuOpenTriggerStatus',
    mode: 'READ_ONLY',
    sheetName: FBR.SHEETS.LOGS,
    logSuccess: false
  }, function () {
    return FBR_menuOpenTriggerStatus_();
  });
}

function FELIBREE_refreshCockpit() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_refreshCockpit',
    mode: 'SAFE',
    sheetName: FBR.SHEETS.COCKPIT,
    logSuccess: false
  }, function () {
    return FBR_refreshCockpit_();
  });
}

function FELIBREE_runQualityChecks() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_runQualityChecks',
    mode: 'DRY_RUN_SAFE',
    sheetName: FBR.SHEETS.CHECKS,
    logSuccess: false
  }, function () {
    return FBR_runQualityChecks_();
  });
}

function FELIBREE_prepareDedicatedCalendarDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_prepareDedicatedCalendarDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.CALENDAR_CONFIG,
    logSuccess: false
  }, function () {
    return FBR_prepareDedicatedCalendar_(true);
  });
}

function FELIBREE_prepareDedicatedCalendarApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_prepareDedicatedCalendarApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.CALENDAR_CONFIG,
    logSuccess: false
  }, function () {
    return FBR_prepareDedicatedCalendar_(false);
  });
}

function FELIBREE_shareDedicatedCalendarDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_shareDedicatedCalendarDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.CALENDAR_CONFIG,
    logSuccess: false
  }, function () {
    return FBR_shareDedicatedCalendar_(true);
  });
}

function FELIBREE_shareDedicatedCalendarApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_shareDedicatedCalendarApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.CALENDAR_CONFIG,
    logSuccess: false
  }, function () {
    return FBR_shareDedicatedCalendar_(false);
  });
}


function FELIBREE_applyPlanningRulesDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyPlanningRulesDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.PUBLICATIONS,
    logSuccess: false
  }, function () {
    return FBR_applyPlanningRules_(true);
  });
}

function FELIBREE_applyPlanningRulesApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyPlanningRulesApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.PUBLICATIONS,
    logSuccess: false
  }, function () {
    return FBR_applyPlanningRules_(false);
  });
}

function FELIBREE_syncCalendarDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_syncCalendarDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.CALENDAR,
    logSuccess: false
  }, function () {
    return FBR_syncCalendar_(true);
  });
}

function FELIBREE_syncCalendarApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_syncCalendarApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.CALENDAR,
    logSuccess: false
  }, function () {
    return FBR_syncCalendar_(false);
  });
}

function FELIBREE_showPressDue(silent) {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_showPressDue',
    mode: 'READ_ONLY',
    sheetName: FBR.SHEETS.PRESS,
    logSuccess: false
  }, function () {
    return FBR_pressDue_(silent === true);
  });
}


function FELIBREE_backupSourceDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_backupSourceDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_backupSourceToDrive_(true);
  });
}

function FELIBREE_backupSourceToDriveApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_backupSourceToDriveApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_backupSourceToDrive_(false);
  });
}

function FELIBREE_backupSourceStatus() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_backupSourceStatus',
    mode: 'READ_ONLY',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_backupSourceStatus_();
  });
}


function FELIBREE_backupDriveClaspGithubDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_backupDriveClaspGithubDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_backupDriveClaspGithub_(true);
  });
}

function FELIBREE_backupDriveClaspGithubApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_backupDriveClaspGithubApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_backupDriveClaspGithub_(false);
  });
}

function FELIBREE_syncGithubDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_syncGithubDryRun',
    mode: 'DRY_RUN',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_syncGithubFromLiveSource_(true);
  });
}

function FELIBREE_syncGithubApply() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_syncGithubApply',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.EXPORTS,
    logSuccess: false
  }, function () {
    return FBR_syncGithubFromLiveSource_(false);
  });
}


function FELIBREE_installTriggers() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_installTriggers',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.LOGS,
    logSuccess: false
  }, function () {
    return FBR_installTriggers_();
  });
}

function FELIBREE_removeTriggers() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_removeTriggers',
    mode: 'APPLY',
    sheetName: FBR.SHEETS.LOGS,
    logSuccess: false
  }, function () {
    return FBR_removeTriggers_();
  });
}

function FELIBREE_getUiState() {
  return FBR_getUiState_();
}

function FELIBREE_sidebarAction(action) {
  return FBR_sidebarAction_(action);
}

function FELIBREE_triggerDailyRefresh() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_triggerDailyRefresh',
    mode: 'TRIGGER_DAILY',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true,
    rowsRead: 4,
    rowsChanged: 4,
    successMessage: 'Trigger quotidien terminé : cockpit, QA, planning dry-run et calendrier dry-run.',
    notes: 'Chaque sous-action conserve également sa propre trace.'
  }, function () {
    var results = [];
    results.push(FBR_refreshCockpit_());
    results.push(FBR_runQualityChecks_());
    results.push(FBR_applyPlanningRules_(true));
    results.push(FBR_syncCalendar_(true));
    return { ok: true, title: 'Trigger quotidien terminé', results: results };
  });
}

function FELIBREE_triggerWeeklyReview() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_triggerWeeklyReview',
    mode: 'TRIGGER_WEEKLY',
    sheetName: FBR.SHEETS.LOGS,
    logStart: true,
    rowsRead: 3,
    rowsChanged: 3,
    successMessage: 'Trigger hebdomadaire terminé : cockpit, QA et revue presse.',
    notes: 'Chaque sous-action conserve également sa propre trace.'
  }, function () {
    var results = [];
    results.push(FBR_refreshCockpit_());
    results.push(FBR_runQualityChecks_());
    results.push(FBR_pressDue_(true));
    return { ok: true, title: 'Trigger hebdomadaire terminé', results: results };
  });
}
