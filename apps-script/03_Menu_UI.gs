/**
 * 03_Menu_UI.gs — menu métiers + sidebar router.
 * Version: v0.6.6-central-log-coverage-20260713
 * Base auditée: fichier utilisateur "Code collé.js".
 * Contraintes:
 * - aucun onOpen ajouté ici ; onOpen(e) reste dans 00_Code.gs et appelle FBR_onOpen(e)
 * - aucun doGet
 * - aucun FBR_MENU_MASTER
 * - routes carte mentale nettoyées vers les fonctions publiques propres
 */

function FBR_onOpen(e) {
  var ui = SpreadsheetApp.getUi();

  var aideMenu = ui.createMenu('📘 Aide & supports')
    .addItem('📘 Aide Notice — sidebar', 'FELIBREE_openAideNotice')
    .addItem('📘 Aide Notice — plein écran', 'FELIBREE_openAideNoticeFullscreen')
    .addSeparator()
    .addItem('🧠 Carte mentale COM — plein écran', 'FELIBREE_openCarteMentaleComFullscreen')
    .addItem('🎯 Plan communication — timeline HTML', 'FELIBREE_openPlanCommunicationTimeline');

  var pilotageMenu = ui.createMenu('🎛️ Pilotage & contrôles')
    .addItem('🔄 Actualiser cockpit', 'FELIBREE_refreshCockpit')
    .addItem('🔎 Contrôles qualité', 'FELIBREE_runQualityChecks')
    .addItem('📰 Relances presse dues', 'FELIBREE_showPressDue');

  var meetingMenu = ui.createMenu('📝 Réunions & registres')
    .addItem('📅 Ouvrir le registre des réunions', 'FELIBREE_openMeetingRegistry')
    .addItem('📌 Ouvrir Réunions & PV', 'FELIBREE_openMeetingReport')
    .addSeparator()
    .addItem('➕ Créer une réunion + son bloc PV', 'FELIBREE_createMeetingBlock')
    .addItem('🔗 Créer uniquement les décisions/actions manquantes', 'FELIBREE_integrateMeetingMissingRecords')
    .addSeparator()
    .addItem('🧩 Installer/réparer les types multiples', 'FELIBREE_installMeetingRegistry')
    .addItem('🔎 Auditer l’architecture complète', 'FELIBREE_auditMeetingArchitecture')
    .addItem('🔒 Sécuriser les colonnes AUTO', 'FELIBREE_secureMeetingAutoColumns');

  var communicationMenu = ui.createMenu('📣 Communication')
    .addItem('🎯 Plan communication — timeline HTML', 'FELIBREE_openPlanCommunicationTimeline')
    .addItem('🎯 Plan communication — UI dry-run', 'FELIBREE_planCommunicationTimelineDryRun')
    .addItem('🎯 Plan communication — APPLY protégé', 'FELIBREE_planCommunicationTimelineApply')
    .addSeparator()
    .addItem('🧠 Carte mentale COM — plein écran', 'FELIBREE_openCarteMentaleComFullscreen')
    .addItem('🧠 Carte mentale COM — diagnostic', 'FELIBREE_carteMentaleComDiagnostic')
    .addItem('🧠 Carte mentale COM — dry-run MAJ', 'FELIBREE_refreshCarteMentaleComDryRun')
    .addSeparator()
    .addItem('📰 Relances presse dues', 'FELIBREE_showPressDue');

  var iaMenu = ui.createMenu('🧪 IA Staging')
    .addItem('🧪 Ouvrir IA Staging', 'FELIBREE_openIaStaging')
    .addItem('📊 Résumé QA staging', 'FELIBREE_iaStagingSummary')
    .addSeparator()
    .addItem('🟢 Filtrer PRIORITY', 'FELIBREE_iaStagingFilterPriority')
    .addItem('🟠 Filtrer CONTEXT', 'FELIBREE_iaStagingFilterContext')
    .addItem('🔴 Filtrer REJECT', 'FELIBREE_iaStagingFilterReject')
    .addItem('↩️ Enlever filtre', 'FELIBREE_iaStagingClearFilter');

  var registryMenu = ui.createMenu('🧩 Registry & intégrité')
    .addItem('🧩 Registry gate — dry-run', 'FELIBREE_registryVerifyLiveVsBackupDryRun')
    .addItem('🧩 Registry gate — APPLY alertes', 'FELIBREE_registryVerifyLiveVsBackupApply')
    .addItem('🧩 Registry gate — ouvrir alertes', 'FELIBREE_registryOpenDriftAlerts');

  var backupMenu = ui.createMenu('💾 Backups & GitHub')
    .addItem('💾 Source backup Drive — dry-run', 'FELIBREE_backupSourceDryRun')
    .addItem('💾 Source backup Drive — APPLY protégé', 'FELIBREE_backupSourceToDriveApply')
    .addSeparator()
    .addItem('💾 Backup complet Drive + CLASP + GitHub — dry-run', 'FELIBREE_backupDriveClaspGithubDryRun')
    .addItem('💾 Backup complet Drive + CLASP + GitHub — APPLY protégé', 'FELIBREE_backupDriveClaspGithubApply')
    .addSeparator()
    .addItem('🐙 GitHub sync depuis source live — dry-run', 'FELIBREE_syncGithubDryRun')
    .addItem('🐙 GitHub sync depuis source live — APPLY protégé', 'FELIBREE_syncGithubApply');

  var planningMenu = ui.createMenu('⏱️ Planning & calendrier')
    .addItem('⏱️ Planning strict — dry-run', 'FELIBREE_applyPlanningRulesDryRun')
    .addItem('⏱️ Appliquer règles planning — APPLY', 'FELIBREE_applyPlanningRulesApply')
    .addSeparator()
    .addItem('📆 Calendrier dédié — dry-run', 'FELIBREE_prepareDedicatedCalendarDryRun')
    .addItem('📆 Créer calendrier — APPLY protégé', 'FELIBREE_prepareDedicatedCalendarApply')
    .addItem('👥 Partage calendrier — dry-run', 'FELIBREE_shareDedicatedCalendarDryRun')
    .addItem('👥 Partage calendrier — APPLY protégé', 'FELIBREE_shareDedicatedCalendarApply')
    .addItem('📆 Publications vers calendrier — dry-run', 'FELIBREE_syncCalendarDryRun')
    .addItem('📆 Publications vers calendrier — APPLY protégé', 'FELIBREE_syncCalendarApply');

  var adminMenu = ui.createMenu('⚙️ Admin technique')
    .addItem('🧭 Menu — statut déclencheur ouverture', 'FELIBREE_menuOpenTriggerStatus')
    .addItem('🧭 Menu — installer/réparer déclencheur', 'FELIBREE_installMenuOpenTrigger')
    .addSeparator()
    .addItem('⏱️ Installer triggers', 'FELIBREE_installTriggers')
    .addItem('🛑 Supprimer triggers', 'FELIBREE_removeTriggers')
    .addSeparator()
    .addItem('⚙️ Initialiser / réparer onglets techniques', 'FELIBREE_install');

  ui.createMenu('🎉 Félibrée Admin')
    .addItem('🎛️ Ouvrir la sidebar', 'FELIBREE_openSidebar')
    .addSubMenu(aideMenu)
    .addSubMenu(pilotageMenu)
    .addSubMenu(meetingMenu)
    .addSubMenu(communicationMenu)
    .addSubMenu(iaMenu)
    .addSubMenu(registryMenu)
    .addSubMenu(planningMenu)
    .addSubMenu(backupMenu)
    .addSubMenu(adminMenu)
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
      return FELIBREE_refreshCockpit();

    case 'quality-checks':
      return FELIBREE_runQualityChecks();

    case 'calendar-dedicated-dry-run':
      return FELIBREE_prepareDedicatedCalendarDryRun();

    case 'calendar-dedicated-apply':
      return FELIBREE_prepareDedicatedCalendarApply();

    case 'calendar-share-dry-run':
      return FELIBREE_shareDedicatedCalendarDryRun();

    case 'calendar-share-apply':
      return FELIBREE_shareDedicatedCalendarApply();

    case 'planning-dry-run':
      return FELIBREE_applyPlanningRulesDryRun();

    case 'planning-apply':
      return FELIBREE_applyPlanningRulesApply();

    case 'calendar-dry-run':
      return FELIBREE_syncCalendarDryRun();

    case 'calendar-apply':
      return FELIBREE_syncCalendarApply();

    case 'press-due':
      return FELIBREE_showPressDue(true);

    case 'ia-staging-open':
      return FELIBREE_openIaStaging();

    case 'ia-staging-summary':
      return FELIBREE_iaStagingSummary();

    case 'ia-staging-filter-priority':
      return FELIBREE_iaStagingFilterPriority();

    case 'ia-staging-filter-context':
      return FELIBREE_iaStagingFilterContext();

    case 'ia-staging-filter-reject':
      return FELIBREE_iaStagingFilterReject();

    case 'ia-staging-clear-filter':
      return FELIBREE_iaStagingClearFilter();

    case 'ia-staging-gemini-status':
      return FBR_iaStagingGeminiStatus_();

    case 'ia-staging-gemini-search-dry-run':
      return FBR_iaStagingGeminiSearchDryRun_();

    case 'ia-staging-gemini-search-apply':
      return FBR_iaStagingGeminiSearchApply_();

    case 'ia-staging-gemini-url-apply':
      return FBR_iaStagingGeminiUrlApply_();

    case 'ia-staging-safe-guard':
      return FELIBREE_iaStagingSafeGuard();

    case 'registry-verify-dry-run':
      return FELIBREE_registryVerifyLiveVsBackupDryRun();

    case 'registry-verify-apply':
      return FELIBREE_registryVerifyLiveVsBackupApply();

    case 'registry-open-alerts':
      return FELIBREE_registryOpenDriftAlerts();

    case 'registry-format-alerts':
      return FELIBREE_registryApplyConditionalFormatting();

    case 'source-backup-dry-run':
      return FELIBREE_backupSourceDryRun();

    case 'source-backup-apply':
      return FELIBREE_backupSourceToDriveApply();

    case 'full-backup-dry-run':
      return FELIBREE_backupDriveClaspGithubDryRun();

    case 'full-backup-apply':
      return FELIBREE_backupDriveClaspGithubApply();

    case 'github-sync-dry-run':
      return FELIBREE_syncGithubDryRun();

    case 'github-sync-apply':
      return FELIBREE_syncGithubApply();

    case 'open-aide-notice':
      return FBR_HELP_STATIC_showSidebar_();

    case 'open-aide-notice-fullscreen':
      return FBR_HELP_STATIC_showFullscreenDialog_();

    case 'open-carte-mentale-com-fullscreen':
      return FELIBREE_openCarteMentaleComFullscreen();

    case 'carte-mentale-com-diagnostic':
    case 'carte-mentale-com-v1-diagnostic':
      return FELIBREE_carteMentaleComDiagnostic();

    case 'carte-mentale-com-dry-run':
    case 'carte-mentale-com-v1-dry-run':
      return FELIBREE_refreshCarteMentaleComDryRun();

    case 'plan-communication-open':
      return FELIBREE_openPlanCommunicationTimeline();

    case 'plan-communication-dry-run':
      return FELIBREE_planCommunicationTimelineDryRun();

    case 'plan-communication-apply':
      return FELIBREE_planCommunicationTimelineApply();

    case 'install-triggers':
      return FELIBREE_installTriggers();

    case 'remove-triggers':
      return FELIBREE_removeTriggers();

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
        : 'not-installed',

    planCommunicationTimelineVersion:
      (typeof FBR_PLAN_COMM_TIMELINE_VERSION !== 'undefined')
        ? FBR_PLAN_COMM_TIMELINE_VERSION
        : 'not-installed'
  };
}
