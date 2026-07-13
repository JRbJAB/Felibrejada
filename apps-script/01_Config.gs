var FELIBREE_SCRIPT_VERSION = 'felibree-strict-ui-automation-v0.6.6-central-log-coverage-20260713';

var FBR = {
  SHEETS: {
    COCKPIT: '🎛️ Cockpit',
    PUBLICATIONS: '📅 Publications',
    PLANNING_RULES: '⏱️ Règles Planning',
    ACTIONS: '⚡ Actions',
    DEV: '🛠️ Planning Dev',
    PRESS: '📰 Presse',
    SITE: '🌐 Site Web',
    CHATBOT: '🤖 Chatbot',
    APIS: '🔌 APIs & Automations',
    IDEAS: '💡 Idées contenus',
    SETTINGS: '⚙️ Paramètres',
    CHECKS: '🔎 Contrôles',
    LOGS: '🧾 Logs',
    CALENDAR_CONFIG: '📆 Calendrier Comms',
    CALENDAR: '📆 Calendar Sync',
    EXPORTS: '📤 Exports'
  },
  HEADER_ROW: 4,
  DATA_START_ROW: 5,
  MAX_BODY_ROWS: 1000,
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  CALENDAR_LOOKAHEAD_DAYS: 120,
  PROP: {
    ALLOW_CALENDAR_WRITE: 'FELIBREE_ALLOW_CALENDAR_WRITE',
    ALLOW_CALENDAR_CREATE: 'FELIBREE_ALLOW_CALENDAR_CREATE',
    ALLOW_CALENDAR_SHARE: 'FELIBREE_ALLOW_CALENDAR_SHARE',
    CALENDAR_ID: 'FELIBREE_CALENDAR_ID',
    CALENDAR_NAME: 'FELIBREE_CALENDAR_NAME',
    ADMIN_WEB_URL: 'FELIBREE_ADMIN_WEB_URL',
    DRY_RUN_DEFAULT: 'FELIBREE_DRY_RUN_DEFAULT',
    ALLOW_PLANNING_WRITE: 'FELIBREE_ALLOW_PLANNING_WRITE',
    ALLOW_SOURCE_BACKUP_WRITE: 'FELIBREE_ALLOW_SOURCE_BACKUP_WRITE',
    SOURCE_BACKUP_FOLDER_ID: 'FELIBREE_SOURCE_BACKUP_FOLDER_ID',
    ALLOW_GITHUB_WRITE: 'FELIBREE_ALLOW_GITHUB_WRITE',
    GITHUB_TOKEN: 'FELIBREE_GITHUB_TOKEN',
    GITHUB_OWNER: 'FELIBREE_GITHUB_OWNER',
    GITHUB_REPO: 'FELIBREE_GITHUB_REPO',
    GITHUB_BRANCH: 'FELIBREE_GITHUB_BRANCH',
    GITHUB_PATH_PREFIX: 'FELIBREE_GITHUB_PATH_PREFIX',
    GITHUB_COMMITTER_NAME: 'FELIBREE_GITHUB_COMMITTER_NAME',
    GITHUB_COMMITTER_EMAIL: 'FELIBREE_GITHUB_COMMITTER_EMAIL'
  },
  MENU_OPEN_TRIGGER_HANDLER: 'FELIBREE_menuOpenInstallable',
  TRIGGER_HANDLERS: [
    'FELIBREE_triggerDailyRefresh',
    'FELIBREE_triggerWeeklyReview'
  ],
  REQUIRED_SHEETS: [
    '🎛️ Cockpit',
    '📅 Publications',
    '⏱️ Règles Planning',
    '⚡ Actions',
    '🛠️ Planning Dev',
    '📰 Presse',
    '🌐 Site Web',
    '🤖 Chatbot',
    '🔌 APIs & Automations',
    '💡 Idées contenus',
    '⚙️ Paramètres',
    '🔎 Contrôles',
    '🧾 Logs',
    '📆 Calendrier Comms',
    '📆 Calendar Sync',
    '📤 Exports'
  ],
  ADMIN_HEADERS: {
    CHECKS: ['Horodatage', 'Bloc', 'Niveau', 'Ligne source', 'Champ', 'Problème', 'Action corrective', 'Responsable', 'Statut', 'Notes'],
    LOGS: ['Horodatage', 'Utilisateur', 'Fonction', 'Mode', 'Statut', 'Onglet', 'Lignes lues', 'Lignes modifiées', 'Messages', 'Durée ms', 'Version script', 'Trace ID', 'Notes'],
    CALENDAR_CONFIG: ['Paramètre', 'Valeur', 'Notes'],
    CALENDAR: ['Horodatage', 'Mode', 'Date publication', 'Canal', 'Titre événement', 'Statut contenu', 'Calendar ID', 'Event ID', 'Action', 'Résultat', 'Ligne source', 'URL publiée', 'Notes'],
    EXPORTS: ['Horodatage', 'Type export', 'Période', 'Source', 'Format', 'Mode', 'Statut', 'Lien fichier', 'Responsable', 'Notes'],
    PLANNING_RULES: ['Canal', 'Type contenu', 'Jours autorisés', 'Jours interdits', 'Créneau principal', 'Créneau secours', 'Durée événement min', 'Règle stricte', 'Max / semaine', 'Délai validation avant envoi', 'Priorité', 'Source / logique', 'Notes']
  }
};


var FBR_CALENDAR_DEFAULTS = {
  NAME: '📆 Communication (🎉 Félibrée 2027)',
  TIME_ZONE: 'Europe/Paris',
  DESCRIPTION: 'Calendrier éditorial et opérationnel de la communication Félibrée 2027 : publications réseaux sociaux, presse, site web, chatbot, relances médias, actions de coordination et jalons de validation. Ce calendrier est réservé au pilotage interne de la communication.'
};


/** Constantes legacy calendrier/liens, sans création d’onglet ni Web App HEAD. */
var FBR_ADMIN_WEB_DEFAULTS = {
  CALENDAR_ID: 'c_5ded6172d45bbaaa6389eda318fce1893fb8f5f5e32df1eaa0af4a2cfd90aac9@group.calendar.google.com',
  CALENDAR_EMBED_URL: 'https://calendar.google.com/calendar/embed?src=c_5ded6172d45bbaaa6389eda318fce1893fb8f5f5e32df1eaa0af4a2cfd90aac9%40group.calendar.google.com&ctz=Europe%2FParis',
  CALENDAR_SETTINGS_URL: 'https://calendar.google.com/calendar/u/1/r/settings/calendar/Y181ZGVkNjE3MmQ0NWJiYWFhNjM4OWVkYTMxOGZjZTE4OTNmYjhmNWY1ZTMyZGYxZWFhMGFmNGEyY2ZkOTBhYWM5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20?pli=1',
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1TR1E3H7bp6dCv7QFEpPiFN44R4lJuVNlml2TgXnC4xo/edit',
  ADMIN_WEB_URL: 'https://script.google.com/a/macros/jaimebrantome.org/s/AKfycbxhLbwdhjcWBECVxfSPRYC7yDl-RR5u9focrJ6fOvZpcnvU5ZFSkEbvd78sSvJyRMU/exec'
};

var FBR_EVENT_COLOR_BY_STATUS = {
  'à valider': CalendarApp.EventColor.YELLOW,
  'a valider': CalendarApp.EventColor.YELLOW,
  'en cours': CalendarApp.EventColor.MAUVE,
  'à rédiger': CalendarApp.EventColor.PALE_BLUE,
  'a rediger': CalendarApp.EventColor.PALE_BLUE,
  'programmé': CalendarApp.EventColor.BLUE,
  'programme': CalendarApp.EventColor.BLUE,
  'publié': CalendarApp.EventColor.GREEN,
  'publie': CalendarApp.EventColor.GREEN,
  'terminé': CalendarApp.EventColor.GREEN,
  'termine': CalendarApp.EventColor.GREEN,
  'bloqué': CalendarApp.EventColor.RED,
  'bloque': CalendarApp.EventColor.RED,
  'annulé': CalendarApp.EventColor.GRAY,
  'annule': CalendarApp.EventColor.GRAY
};


var FBR_PLANNING_HEADERS = {
  TARGET_TIME: 'Heure cible',
  PLANNED_DATETIME: 'Date/heure planifiée',
  RULE: 'Règle planning',
  STRICT: 'Planning strict',
  OVERRIDE: 'Override planning ?',
  OVERRIDE_REASON: 'Raison override',
  CHANNEL_MASTER: 'Canal master',
  SLOT_SOURCE: 'Slot source'
};


var FBR_SOURCE_BACKUP_DEFAULTS = {
  FOLDER_ID: '1cOZszuqpv6vc0dPaud8L-anR0ewjmzTg',
  PREFIX: 'felibree_apps_script_live_source_backup',
  KEEP_LAST_N: 30
};


var FBR_GITHUB_DEFAULTS = {
  OWNER: 'JRbJAB',
  REPO: 'Felibrejada',
  BRANCH: 'main',
  PATH_PREFIX: 'apps-script',
  COMMITTER_NAME: 'Felibrejada Apps Script Backup',
  COMMITTER_EMAIL: 'julien@jaimebrantome.org'
};
