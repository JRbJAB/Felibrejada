function FBR_onOpen(e) {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('🎉 Félibrée Admin')
    .addItem('🎛️ Ouvrir la sidebar', 'FELIBREE_openSidebar')
    .addItem('📘 Aide Notice', 'FELIBREE_openAideNotice')
    .addItem('📘 Aide Notice — plein écran', 'FELIBREE_openAideNoticeFullscreen')
    .addItem('🧠 Carte mentale COM — plein écran', 'FELIBREE_openCarteMentaleComFullscreen')
    .addItem('🖥️ Admin web / calendrier intégré', 'FELIBREE_openAdminWeb')
    .addItem('🎯 Plan communication — timeline HTML', 'FELIBREE_openPlanCommunicationTimeline')

    .addSeparator()
    .addItem('🔄 Actualiser cockpit', 'FELIBREE_refreshCockpit')
    .addItem('🔎 Contrôles qualité', 'FELIBREE_runQualityChecks')
    .addItem('📰 Relances presse dues', 'FELIBREE_showPressDue')

    .addSeparator()
    .addItem('🧪 IA Staging — ouvrir', 'FELIBREE_openIaStaging')
    .addItem('🧪 IA Staging — résumé QA', 'FELIBREE_iaStagingSummary')
    .addItem('🧪 IA Staging — filtre PRIORITY', 'FELIBREE_iaStagingFilterPriority')
    .addItem('🧪 IA Staging — filtre CONTEXT', 'FELIBREE_iaStagingFilterContext')
    .addItem('🧪 IA Staging — filtre REJECT', 'FELIBREE_iaStagingFilterReject')
    .addItem('🧪 IA Staging — enlever filtre', 'FELIBREE_iaStagingClearFilter')

    .addSeparator()
    .addItem('🧩 Registry gate — dry-run', 'FELIBREE_registryVerifyLiveVsBackupDryRun')
    .addItem('🧩 Registry gate — APPLY alertes', 'FELIBREE_registryVerifyLiveVsBackupApply')
    .addItem('🧩 Registry gate — ouvrir alertes', 'FELIBREE_registryOpenDriftAlerts')

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
    .addItem('🎯 Plan communication — UI dry-run', 'FELIBREE_planCommunicationTimelineDryRun')
    .addItem('🎯 Plan communication — APPLY protégé', 'FELIBREE_planCommunicationTimelineApply')

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
    case 'refresh-cockpit':
      return FBR_refreshCockpit_();

    case 'quality-checks':
      return FBR_runQualityChecks_();

    case 'calendar-dedicated-dry-run':
      return FBR_prepareDedicatedCalendar_(true);

    case 'calendar-dedicated-apply':
      return FBR_prepareDedicatedCalendar_(false);

    case 'calendar-share-dry-run':
      return FBR_shareDedicatedCalendar_(true);

    case 'calendar-share-apply':
      return FBR_shareDedicatedCalendar_(false);

    case 'planning-dry-run':
      return FBR_applyPlanningRules_(true);

    case 'planning-apply':
      return FBR_applyPlanningRules_(false);

    case 'calendar-dry-run':
      return FBR_syncCalendar_(true);

    case 'calendar-apply':
      return FBR_syncCalendar_(false);

    case 'press-due':
      return FBR_pressDue_(true);

    case 'ia-staging-open':
      return FBR_iaStagingOpen_();

    case 'ia-staging-summary':
      return FBR_iaStagingSummary_();

    case 'ia-staging-filter-priority':
      return FBR_iaStagingFilterByStatus_(FBR_IA_STAGING_UI.STATUS_PRIORITY);

    case 'ia-staging-filter-context':
      return FBR_iaStagingFilterByStatus_(FBR_IA_STAGING_UI.STATUS_CONTEXT);

    case 'ia-staging-filter-reject':
      return FBR_iaStagingFilterByStatus_(FBR_IA_STAGING_UI.STATUS_REJECT);

    case 'ia-staging-clear-filter':
      return FBR_iaStagingClearFilter_();

    case 'ia-staging-gemini-status':
      return FBR_iaStagingGeminiStatus_();

    case 'ia-staging-gemini-search-dry-run':
      return FBR_iaStagingGeminiSearchDryRun_();

    case 'ia-staging-gemini-search-apply':
      return FBR_iaStagingGeminiSearchApply_();

    case 'ia-staging-gemini-url-apply':
      return FBR_iaStagingGeminiUrlApply_();

    case 'ia-staging-safe-guard':
      return FBR_iaStagingAssertNoBusinessApply_();

    case 'registry-verify-dry-run':
      return FBR_registryVerifyLiveVsBackup_(true);

    case 'registry-verify-apply':
      return FBR_registryVerifyLiveVsBackup_(false);

    case 'registry-open-alerts':
      return FBR_registryOpenDriftAlerts_();

    case 'registry-format-alerts':
      return FBR_registryApplyConditionalFormatting_();

    case 'source-backup-dry-run':
      return FBR_backupSourceToDrive_(true);

    case 'source-backup-apply':
      return FBR_backupSourceToDrive_(false);

    case 'full-backup-dry-run':
      return FBR_backupDriveClaspGithub_(true);

    case 'full-backup-apply':
      return FBR_backupDriveClaspGithub_(false);

    case 'github-sync-dry-run':
      return FBR_syncGithubFromLiveSource_(true);

    case 'github-sync-apply':
      return FBR_syncGithubFromLiveSource_(false);

    case 'open-aide-notice':
      return FBR_HELP_STATIC_showSidebar_();

    case 'open-aide-notice-fullscreen':
      return FBR_HELP_STATIC_showFullscreenDialog_();

    case 'open-carte-mentale-com-fullscreen':
      return FELIBREE_openCarteMentaleComFullscreen();

    case 'carte-mentale-com-v1-diagnostic':
      return FELIBREE_carteMentaleComV1Diagnostic();

    case 'carte-mentale-com-v1-dry-run':
      return FELIBREE_refreshCarteMentaleComV1DryRun();

    case 'open-admin-web':
      return FBR_showAdminWebDialog_();

    case 'plan-communication-open':
      return FBR_PLAN_COMM_showTimelineDialog_();

    case 'plan-communication-dry-run':
      return FBR_PLAN_COMM_uiStrictDryRun_();

    case 'plan-communication-apply':
      return FBR_PLAN_COMM_uiStrictApply_();

    case 'install-triggers':
      return FBR_installTriggers_();

    case 'remove-triggers':
      return FBR_removeTriggers_();

    case 'install':
      return FELIBREE_install();

    default:
      throw new Error('Action inconnue sidebar : ' + action);
  }
}


function FBR_getUiState_() {
  FBR_ensureCoreSheets_();

  var props = PropertiesService.getScriptProperties();

  var calendarWrite = FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_WRITE, false);
  var calendarCreate = FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_CREATE, false);
  var calendarShare = FBR_getScriptBool_(FBR.PROP.ALLOW_CALENDAR_SHARE, false);

  var calendarId =
    props.getProperty(FBR.PROP.CALENDAR_ID) ||
    FBR_calendarConfigValue_('Calendar ID', 'NO_DEDICATED_CALENDAR_YET');

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
    calendarSettingsUrl: FBR_ADMIN_WEB_DEFAULTS.CALENDAR_SETTINGS_URL,

    iaStagingUiVersion:
      (typeof FBR_IA_STAGING_UI !== 'undefined' && FBR_IA_STAGING_UI.VERSION)
        ? FBR_IA_STAGING_UI.VERSION
        : 'not-installed',

    registryGateVersion:
      (typeof FBR_SCRIPT_REGISTRY_GATE !== 'undefined' && FBR_SCRIPT_REGISTRY_GATE.VERSION)
        ? FBR_SCRIPT_REGISTRY_GATE.VERSION
        : 'not-installed',

    aideNoticeVersion:
      (typeof FBR_HELP_STATIC_MODULE_VERSION !== 'undefined')
        ? FBR_HELP_STATIC_MODULE_VERSION
        : 'not-installed',

    aideNoticeFullscreenVersion:
      (typeof FBR_HELP_STATIC_FULLSCREEN_VERSION !== 'undefined')
        ? FBR_HELP_STATIC_FULLSCREEN_VERSION
        : 'not-installed',

    carteMentaleComVersion:
      (typeof FBR_CARTE_MENTALE_DYNAMIC_VERSION !== 'undefined')
        ? FBR_CARTE_MENTALE_DYNAMIC_VERSION
        : ((typeof FBR_CARTE_MENTALE_COM_VERSION !== 'undefined')
            ? FBR_CARTE_MENTALE_COM_VERSION
            : 'not-installed'),

    planCommunicationTimelineVersion:
      (typeof FBR_PLAN_COMM_TIMELINE_VERSION !== 'undefined')
        ? FBR_PLAN_COMM_TIMELINE_VERSION
        : 'not-installed'
  };
}
