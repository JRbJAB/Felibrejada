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
  FBR_ensureCoreSheets_();
  FBR_refreshCockpit_();
  return FBR_runQualityChecks_();
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

function doGet(e) {
  return FBR_doGetAdminWeb_(e);
}

function FELIBREE_openAdminWeb() {
  return FBR_showAdminWebDialog_();
}

function FELIBREE_getAdminWebState() {
  return FBR_getAdminWebState_();
}

function FELIBREE_setAdminWebUrl(url) {
  return FBR_setAdminWebUrl_(url);
}



function FELIBREE_openPlanCommunicationTimeline() {
  return FBR_PLAN_COMM_showTimelineDialog_();
}

function FELIBREE_getPlanCommunicationTimelineState() {
  return FBR_PLAN_COMM_getTimelineState_();
}

function FELIBREE_planCommunicationTimelineDryRun() {
  return FBR_PLAN_COMM_uiStrictDryRun_();
}

function FELIBREE_planCommunicationTimelineApply() {
  return FBR_PLAN_COMM_uiStrictApply_();
}

function FELIBREE_menuOpenInstallable(e) {
  return FBR_onOpen(e);
}

function FELIBREE_installMenuOpenTrigger() {
  return FBR_installMenuOpenTrigger_();
}

function FELIBREE_menuOpenTriggerStatus() {
  return FBR_menuOpenTriggerStatus_();
}

function FELIBREE_refreshCockpit() {
  return FBR_refreshCockpit_();
}

function FELIBREE_runQualityChecks() {
  return FBR_runQualityChecks_();
}

function FELIBREE_prepareDedicatedCalendarDryRun() {
  return FBR_prepareDedicatedCalendar_(true);
}

function FELIBREE_prepareDedicatedCalendarApply() {
  return FBR_prepareDedicatedCalendar_(false);
}

function FELIBREE_shareDedicatedCalendarDryRun() {
  return FBR_shareDedicatedCalendar_(true);
}

function FELIBREE_shareDedicatedCalendarApply() {
  return FBR_shareDedicatedCalendar_(false);
}


function FELIBREE_applyPlanningRulesDryRun() {
  return FBR_applyPlanningRules_(true);
}

function FELIBREE_applyPlanningRulesApply() {
  return FBR_applyPlanningRules_(false);
}

function FELIBREE_syncCalendarDryRun() {
  return FBR_syncCalendar_(true);
}

function FELIBREE_syncCalendarApply() {
  return FBR_syncCalendar_(false);
}

function FELIBREE_showPressDue() {
  return FBR_pressDue_(false);
}


function FELIBREE_backupSourceDryRun() {
  return FBR_backupSourceToDrive_(true);
}

function FELIBREE_backupSourceToDriveApply() {
  return FBR_backupSourceToDrive_(false);
}

function FELIBREE_backupSourceStatus() {
  return FBR_backupSourceStatus_();
}


function FELIBREE_backupDriveClaspGithubDryRun() {
  return FBR_backupDriveClaspGithub_(true);
}

function FELIBREE_backupDriveClaspGithubApply() {
  return FBR_backupDriveClaspGithub_(false);
}

function FELIBREE_syncGithubDryRun() {
  return FBR_syncGithubFromLiveSource_(true);
}

function FELIBREE_syncGithubApply() {
  return FBR_syncGithubFromLiveSource_(false);
}


function FELIBREE_installTriggers() {
  return FBR_installTriggers_();
}

function FELIBREE_removeTriggers() {
  return FBR_removeTriggers_();
}

function FELIBREE_getUiState() {
  return FBR_getUiState_();
}

function FELIBREE_sidebarAction(action) {
  return FBR_sidebarAction_(action);
}

function FELIBREE_triggerDailyRefresh() {
  FBR_refreshCockpit_();
  FBR_runQualityChecks_();
  FBR_applyPlanningRules_(true);
  FBR_syncCalendar_(true);
}

function FELIBREE_triggerWeeklyReview() {
  FBR_refreshCockpit_();
  FBR_runQualityChecks_();
  FBR_pressDue_(true);
}
