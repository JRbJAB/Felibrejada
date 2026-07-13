/**
 * 11_AdminWeb.gs — compatibilité calendrier uniquement.
 * Version: v0.6.5-admin-web-sheet-retirement-current-20260713
 *
 * Le déploiement historique reste figé sur sa version publiée.
 * HEAD ne sert plus de Web App et ne crée plus l’onglet 🖥️ Admin Web.
 * Les futures applications FELIBREE_WEB_ADMIN et FELIBREE_WEB_USER
 * sont développées dans deux projets Apps Script autonomes.
 */

function FBR_calendarEmbedUrl_() {
  var calendarId = FBR_calendarConfigValue_(
    'Calendar ID',
    FBR_getScriptProperty_(FBR.PROP.CALENDAR_ID, FBR_ADMIN_WEB_DEFAULTS.CALENDAR_ID)
  );
  if (!calendarId) calendarId = FBR_ADMIN_WEB_DEFAULTS.CALENDAR_ID;
  return 'https://calendar.google.com/calendar/embed?src=' +
    encodeURIComponent(calendarId) +
    '&ctz=Europe%2FParis';
}

function FBR_legacyAdminWebDisabled_() {
  throw new Error(
    'Ancien Admin Web gelé. Utiliser 🌐 Web Admin & User et les futurs projets dédiés.'
  );
}
