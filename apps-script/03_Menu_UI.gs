function FBR_onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🎉 Félibrée Admin')
    .addItem('🎛️ Ouvrir la sidebar', 'FELIBREE_openSidebar')
    .addItem('🖥️ Admin web / calendrier intégré', 'FELIBREE_openAdminWeb')
    .addSeparator()
    .addItem('🔄 Actualiser cockpit', 'FELIBREE_refreshCockpit')
    .addItem('🔎 Contrôles qualité', 'FELIBREE_runQualityChecks')
    .addItem('📰 Relances presse dues', 'FELIBREE_showPressDue')
    .addSeparator()
    .addItem('💾 Source backup Drive — dry-run', 'FELIBREE_backupSourceDryRun')
    .addItem('💾 Source backup Drive — APPLY protégé', 'FELIBREE_backupSourceToDriveApply')
    .addItem('💾 Backup complet Drive + CLASP + GitHub — dry-run', 'FELIBREE_backupDriveClaspGithubDryRun')
    .addItem('💾 Backup complet Drive + CLASP + GitHub — APPLY protégé', 'FELIBREE_backupDriveClaspGithubApply')
    .addItem('🐙 GitHub sync depuis source live — dry-run', 'FELIBREE_syncGithubDryRun')
    .addItem('🐙 GitHub sync depuis source live — APPLY protégé', 'FELIBREE_syncGithubApply')
    .addSeparator()
    .addItem('⏱️ Planning strict — dry-run', 'FELIBREE_applyPlanningRulesDryRun')
    .addItem('⏱️ Appliquer règles planning — APPLY', 'FELIBREE_applyPlanningRulesApply')
    .addSeparator()
    .addItem('📆 Calendrier dédié — dry-run', 'FELIBREE_prepareDedicatedCalendarDryRun')
    .addItem('📆 Créer calendrier — APPLY protégé', 'FELIBREE_prepareDedicatedCalendarApply')
    .addItem('👥 Partage calendrier — dry-run', 'FELIBREE_shareDedicatedCalendarDryRun')
    .addItem('👥 Partage calendrier — APPLY protégé', 'FELIBREE_shareDedicatedCalendarApply')
    .addItem('📆 Publications vers calendrier — dry-run', 'FELIBREE_syncCalendarDryRun')
    .addItem('📆 Publications vers calendrier — APPLY protégé', 'FELIBREE_syncCalendarApply')
    .addSeparator()
    .addItem('⏱️ Installer triggers', 'FELIBREE_installTriggers')
    .addItem('🛑 Supprimer triggers', 'FELIBREE_removeTriggers')
    .addSeparator()
    .addItem('⚙️ Initialiser / réparer onglets techniques', 'FELIBREE_install')
    .addToUi();
}

function FBR_showSidebar_() {
  var html = HtmlService.createHtmlOutputFromFile('04_Sidebar')
    .setTitle('Félibrée Admin')
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

function FBR_sidebarAction_(action) {
  switch (action) {
    case 'refresh-cockpit': return FBR_refreshCockpit_();
    case 'quality-checks': return FBR_runQualityChecks_();
    case 'calendar-dedicated-dry-run': return FBR_prepareDedicatedCalendar_(true);
    case 'calendar-dedicated-apply': return FBR_prepareDedicatedCalendar_(false);
    case 'calendar-share-dry-run': return FBR_shareDedicatedCalendar_(true);
    case 'calendar-share-apply': return FBR_shareDedicatedCalendar_(false);
    case 'planning-dry-run': return FBR_applyPlanningRules_(true);
    case 'planning-apply': return FBR_applyPlanningRules_(false);
    case 'calendar-dry-run': return FBR_syncCalendar_(true);
    case 'calendar-apply': return FBR_syncCalendar_(false);
    case 'press-due': return FBR_pressDue_(true);
    case 'source-backup-dry-run': return FBR_backupSourceToDrive_(true);
    case 'source-backup-apply': return FBR_backupSourceToDrive_(false);
    case 'full-backup-dry-run': return FBR_backupDriveClaspGithub_(true);
    case 'full-backup-apply': return FBR_backupDriveClaspGithub_(false);
    case 'github-sync-dry-run': return FBR_syncGithubFromLiveSource_(true);
    case 'github-sync-apply': return FBR_syncGithubFromLiveSource_(false);
    case 'open-admin-web': return FBR_showAdminWebDialog_();
    case 'install-triggers': return FBR_installTriggers_();
    case 'remove-triggers': return FBR_removeTriggers_();
    case 'install': return FELIBREE_install();
    default: throw new Error('Action inconnue sidebar : ' + action);
  }
}

function FBR_getUiState_() {
  FBR_ensureCoreSheets_();
  var props = PropertiesService.getScriptProperties();
  var calendarWrite = FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_WRITE, false);
  var calendarCreate = FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_CREATE, false);
  var calendarShare = FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_SHARE, false);
  var calendarId = props.getProperty(FBR.PROP.CALENDAR_ID) || FBR_calendarConfigValue_('Calendar ID', 'NO_DEDICATED_CALENDAR_YET');
  return {
    version: FELIBREE_SCRIPT_VERSION,
    user: FBR_user_(),
    calendarWriteEnabled: calendarWrite,
    calendarCreateEnabled: calendarCreate,
    calendarShareEnabled: calendarShare,
    planningWriteEnabled: FBR_getScriptBool_(FBR.PROP.ALLOW_PLANNING_WRITE, false),
    sourceBackupEnabled: FBR_getScriptBool_(FBR.PROP.ALLOW_SOURCE_BACKUP_WRITE, false),
    githubWriteEnabled: FBR_getScriptBool_(FBR.PROP.ALLOW_GITHUB_WRITE, false),
    githubOwner: FBR_getScriptProperty_(FBR.PROP.GITHUB_OWNER, FBR_GITHUB_DEFAULTS.OWNER),
    githubRepo: FBR_getScriptProperty_(FBR.PROP.GITHUB_REPO, FBR_GITHUB_DEFAULTS.REPO),
    githubBranch: FBR_getScriptProperty_(FBR.PROP.GITHUB_BRANCH, FBR_GITHUB_DEFAULTS.BRANCH),
    githubPathPrefix: FBR_getScriptProperty_(FBR.PROP.GITHUB_PATH_PREFIX, FBR_GITHUB_DEFAULTS.PATH_PREFIX),
    calendarId: calendarId,
    dryRunDefault: true,
    spreadsheetUrl: FBR_ss_().getUrl(),
    adminWebUrl: FBR_getScriptProperty_(FBR.PROP.ADMIN_WEB_URL, ''),
    calendarEmbedUrl: FBR_calendarEmbedUrl_(),
    calendarSettingsUrl: FBR_ADMIN_WEB_DEFAULTS.CALENDAR_SETTINGS_URL
  };
}
