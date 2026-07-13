/**
 * 🎉 Felibrejada dins Brantome en Perigor
 * Carte mentale Communication — moteur propre v1.4.1 HTML TEMPLATE NAME FIX.
 *
 * Objectif : nettoyer le menu Apps Script.
 * Fonctions publiques conservées :
 * - FELIBREE_openCarteMentaleComFullscreen
 * - FELIBREE_carteMentaleComDiagnostic
 * - FELIBREE_refreshCarteMentaleComDryRun
 *
 * Aucune fonction V1 legacy publique.
 * Aucun onOpen, aucun doGet, aucun FBR_MENU_MASTER.
 * Le rendu principal reste la carte pro figée base64.
 * Le moteur dynamique sert au diagnostic et au dry-run des données validées.
 *
 * Correctif v1.4.1 : aligne les noms HtmlService sur les deux fichiers HTML réellement
 * présents dans le projet live capturé par le backup 7e49bb77.
 */

var FBR_CARTE_MENTALE_DYNAMIC_VERSION = 'v1.4.1-html-template-name-fix-20260712';

var FBR_CARTE_MENTALE_COM_ENGINE = (function () {

/**
 * 🎉 Felibrejada dins Brantome en Perigor
 * Carte mentale dynamique — Configuration.
 * Version: v1.4.1
 *
 * Aucun onOpen, aucun FBR_MENU_MASTER, aucun doGet.
 * Source de vérité: onglets validés + registre assets.
 */


var FBR_CARTE_MENTALE_DYNAMIC = {
  VERSION: FBR_CARTE_MENTALE_DYNAMIC_VERSION,
  TEMPLATE_HTML: 'CARTE_MENTALE_DYNAMIC_HTML',
  STATIC_PRO_HTML: 'CARTE_MENTALE_COM_2027_HTML',
  MAP_ID_COM: 'MAP-COM-STRATEGIE',
  LOGO_ASSET_ID: 'ASSET-LOGO-BLAU-PERIGORD-OFFICIEL',

  PROP_ALLOW_WRITE: 'FELIBREE_ALLOW_CARTE_MENTALE_WRITE',
  PROP_EXPORT_FOLDER_ID: 'FELIBREE_CARTE_MENTALE_EXPORT_FOLDER_ID',

  PROFILES: {
    ADMIN_INTERNE: 'ADMIN_INTERNE',
    COM_INTERNE: 'COM_INTERNE',
    TECH: 'TECH',
    PUBLIC: 'PUBLIC'
  },

  SHEETS: {
    DECISIONS: '🗳️ Décisions',
    ACTIONS: '⚡ Actions',
    GATES_COM: '✅ Gate Publication COM',
    CDC_COM: '📣 CDC Communication',
    RETRO_COM: '🗓️ Rétroplanning COM CDC',
    LOGO_CHARTE: '🎨 Logo Charte',
    MEDIAS: '🖼️ Médias & droits',
    DOMAINE_RESEAUX: '🌐 Domaine & Réseaux',
    POSTS: '📱 Posts fondateurs',
    PRESSE: '📰 Presse',
    SITE: '🌐 Site Web',
    MAP_REGISTRY: '🧠 Cartes & Assets HTML',
    LOGS: '🧾 Logs',
    RELEASES: '📦 Releases & Backups',
    SCRIPT_REGISTRY: '🧩 Script Registry'
  },

  STATUS: {
    VALIDATED: 'Validé',
    GO: 'GO',
    NO_GO: 'NO GO',
    BLOCKED: 'BLOQUÉ',
    TODO: 'À FAIRE',
    TO_VALIDATE: 'À valider',
    TO_ARBITRATE: 'À arbitrer'
  },

  THEME: {
    name: 'THEME_BLAU_PERIGORD_COM_2027',
    bg1: '#18254a',
    bg2: '#0f1933',
    gold: '#f0c75e',
    blue: '#1f6f9f',
    cyan: '#43b8c7',
    green: '#2f8d5b',
    red: '#b94343',
    purple: '#4b2d6e',
    cream: '#fff6df',
    white: '#ffffff'
  },

  BLOCKS: [
    {
      id: 'identity',
      title: 'Identité publique',
      icon: '🎭',
      sourceDecisionIds: ['DEC-001', 'DEC-002'],
      fallback: 'Nom, signature, charte et logo à valider.'
    },
    {
      id: 'site',
      title: 'Site & domaine',
      icon: '🌐',
      sourceDecisionIds: ['DEC-003', 'DEC-004', 'DEC-007'],
      fallback: 'Domaine, propriété, accès et page publique v0.'
    },
    {
      id: 'social',
      title: 'Réseaux & posts',
      icon: '📱',
      sourceDecisionIds: ['DEC-005', 'DEC-006', 'DEC-011'],
      fallback: 'Handles, pages P0, calendrier et posts fondateurs.'
    },
    {
      id: 'press',
      title: 'Presse',
      icon: '📰',
      sourceDecisionIds: ['DEC-010'],
      fallback: 'CP v0, contacts presse, relances et kit visuel.'
    },
    {
      id: 'support',
      title: 'Soutien & partenaires',
      icon: '🤝',
      sourceDecisionIds: ['DEC-008', 'DEC-009'],
      fallback: 'HelloAsso, transparence collecte, pack partenaires.'
    },
    {
      id: 'cdc',
      title: 'CDC Bornat',
      icon: '📜',
      sourceGateIds: ['GATE-COM-001', 'GATE-COM-006', 'GATE-COM-008'],
      fallback: 'Exigences, mentions, validation Bornat et correcteur occitan.'
    },
    {
      id: 'actions',
      title: 'Actions P0',
      icon: '⚡',
      source: 'actions',
      fallback: 'Actions critiques ouvertes à suivre.'
    },
    {
      id: 'governance',
      title: 'Gouvernance',
      icon: '🔐',
      sourceDecisionIds: ['DEC-012'],
      fallback: '2 admins, droits, preuves, publication seulement si GO.'
    }
  ]
};

function FBR_CARTE_MENTALE_CFG_get_() {
  return FBR_CARTE_MENTALE_DYNAMIC;
}
/**
 * Carte mentale dynamique — Lecture des données validées.
 * Ne modifie aucun onglet.
 */

function FBR_CARTE_MENTALE_DATA_buildComState_(mode) {
  var cfg = FBR_CARTE_MENTALE_CFG_get_();
  var ss = FBR_CARTE_MENTALE_ss_();

  var decisions = FBR_CARTE_MENTALE_readDecisions_(ss, cfg);
  var gates = FBR_CARTE_MENTALE_readGates_(ss, cfg);
  var actions = FBR_CARTE_MENTALE_readActions_(ss, cfg);
  var cdc = FBR_CARTE_MENTALE_readCdcSummary_(ss, cfg);
  var logo = FBR_CARTE_MENTALE_readOfficialLogo_(ss, cfg);

  var blocks = [];
  for (var i = 0; i < cfg.BLOCKS.length; i++) {
    blocks.push(FBR_CARTE_MENTALE_buildBlock_(cfg.BLOCKS[i], decisions, gates, actions, cdc));
  }

  return {
    ok: true,
    mode: mode || 'DRY_RUN',
    version: cfg.VERSION,
    mapId: cfg.MAP_ID_COM,
    title: 'Communication Félibrée 2027',
    subtitle: 'Blau Périgord — carte mentale dynamique pilotée par décisions validées',
    generatedAt: new Date().toISOString(),
    profiles: [cfg.PROFILES.ADMIN_INTERNE, cfg.PROFILES.COM_INTERNE],
    access: {
      publicationStatus: 'INTERNE_NON_PUBLIC',
      resourceMode: 'HTML_SVG_DYNAMIC',
      externalCall: false,
      sheetWrite: false
    },
    logo: logo,
    stats: {
      validatedDecisions: FBR_CARTE_MENTALE_countByStatus_(decisions, 'Validé'),
      pendingDecisions: FBR_CARTE_MENTALE_countPendingDecisions_(decisions),
      gatesGo: FBR_CARTE_MENTALE_countGoGates_(gates),
      gatesNoGo: FBR_CARTE_MENTALE_countNoGoGates_(gates),
      p0ActionsOpen: actions.p0Open,
      cdcComRequirements: cdc.total
    },
    blocks: blocks,
    warnings: FBR_CARTE_MENTALE_collectWarnings_(decisions, gates, logo, actions, cdc)
  };
}

function FBR_CARTE_MENTALE_ss_() {
  if (typeof FBR_ss_ === 'function') return FBR_ss_();
  return SpreadsheetApp.getActiveSpreadsheet();
}

function FBR_CARTE_MENTALE_readSheetValues_(ss, sheetName, maxRows, maxCols) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  var rows = Math.min(maxRows || sh.getMaxRows(), sh.getMaxRows());
  var cols = Math.min(maxCols || sh.getMaxColumns(), sh.getMaxColumns());
  return sh.getRange(1, 1, rows, cols).getDisplayValues();
}

function FBR_CARTE_MENTALE_getMissingSheets_(ss, cfg) {
  var keys = ['DECISIONS', 'ACTIONS', 'GATES_COM', 'CDC_COM', 'MEDIAS', 'MAP_REGISTRY', 'LOGS'];
  var missing = [];
  for (var i = 0; i < keys.length; i++) {
    var name = cfg.SHEETS[keys[i]];
    if (name && !ss.getSheetByName(name)) missing.push(name);
  }
  return missing;
}

function FBR_CARTE_MENTALE_headerMap_(values, headerRowIndex) {
  var map = {};
  if (!values || values.length <= headerRowIndex) return map;
  var headers = values[headerRowIndex];
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) map[String(headers[i]).trim()] = i;
  }
  return map;
}

function FBR_CARTE_MENTALE_readDecisions_(ss, cfg) {
  var values = FBR_CARTE_MENTALE_readSheetValues_(ss, cfg.SHEETS.DECISIONS, 120, 17);
  var h = FBR_CARTE_MENTALE_headerMap_(values, 3);
  var out = {};
  for (var r = 4; r < values.length; r++) {
    var row = values[r];
    var id = row[h['ID']];
    if (!id) continue;
    out[id] = {
      id: id,
      theme: row[h['Thème']] || '',
      question: row[h['Question à trancher']] || '',
      recommendation: row[h['Recommandation']] || '',
      decision: row[h['Décision retenue']] || '',
      status: row[h['Statut décision']] || '',
      budget: row[h['Budget estimé €']] || '',
      owner: row[h['Bureau référent']] || '',
      operator: row[h['Responsable opérationnel']] || '',
      deadline: row[h['Échéance']] || '',
      next: row[h['Action suivante']] || '',
      risk: row[h['Risque si non décidé']] || ''
    };
  }
  return out;
}

function FBR_CARTE_MENTALE_readGates_(ss, cfg) {
  var values = FBR_CARTE_MENTALE_readSheetValues_(ss, cfg.SHEETS.GATES_COM, 80, 18);
  var h = FBR_CARTE_MENTALE_headerMap_(values, 3);
  var out = {};
  for (var r = 4; r < values.length; r++) {
    var row = values[r];
    var id = row[h['Gate ID']];
    if (!id) continue;
    out[id] = {
      id: id,
      support: row[h['Support / contenu']] || '',
      status: row[h['Statut gate']] || '',
      allowed: row[h['Publication autorisée ?']] || '',
      validator: row[h['Validateur métier']] || '',
      bornat: row[h['Validation Bornat']] || '',
      next: row[h['Action suivante']] || '',
      notes: row[h['Notes / limites']] || ''
    };
  }
  return out;
}

function FBR_CARTE_MENTALE_readActions_(ss, cfg) {
  var values = FBR_CARTE_MENTALE_readSheetValues_(ss, cfg.SHEETS.ACTIONS, 220, 18);
  var h = FBR_CARTE_MENTALE_headerMap_(values, 3);
  var p0Open = 0;
  var list = [];

  for (var r = 4; r < values.length; r++) {
    var row = values[r];
    var id = row[h['ID']];
    if (!id) continue;
    var priority = row[h['Priorité']] || '';
    var status = row[h['Statut']] || '';
    var action = row[h['Action']] || '';
    if (priority.indexOf('P0') !== -1 && status !== 'Terminé' && status !== 'Fait') {
      p0Open++;
      if (list.length < 5) list.push(id + ' — ' + action);
    }
  }

  return { p0Open: p0Open, top: list };
}

function FBR_CARTE_MENTALE_readCdcSummary_(ss, cfg) {
  var values = FBR_CARTE_MENTALE_readSheetValues_(ss, cfg.SHEETS.CDC_COM, 120, 18);
  var total = 0;
  var blockers = 0;
  for (var r = 4; r < values.length; r++) {
    if (values[r][0]) total++;
    if (String(values[r].join(' ')).indexOf('BLOQUANT') !== -1) blockers++;
  }
  return { total: total, blockers: blockers };
}

function FBR_CARTE_MENTALE_readOfficialLogo_(ss, cfg) {
  var values = FBR_CARTE_MENTALE_readSheetValues_(ss, cfg.SHEETS.MEDIAS, 500, 16);
  var h = FBR_CARTE_MENTALE_headerMap_(values, 3);
  var idCol = h['ID asset'];
  var nameCol = h['Nom / description'];
  var rightsCol = h['Droits / autorisation'];
  var sourceCol = h['Source Drive / URL'];
  var statusCol = h['Statut'];
  var notesCol = h['Notes'];

  for (var r = 4; r < values.length; r++) {
    var row = values[r];
    var rowText = row.join(' ');
    if (rowText.indexOf(cfg.LOGO_ASSET_ID) === -1 && rowText.indexOf('Logo officiel Blau Périgord') === -1) continue;

    var status = row[statusCol] || '';
    var rights = row[rightsCol] || '';
    var source = row[sourceCol] || '';
    var notes = row[notesCol] || '';

    var valid = status.indexOf('Validé') !== -1 && (rights.indexOf('OK') !== -1 || rights.indexOf('Valid') !== -1);
    return {
      id: row[idCol] || cfg.LOGO_ASSET_ID,
      name: row[nameCol] || 'Logo officiel Blau Périgord',
      status: status || 'À valider',
      rights: rights || 'À valider',
      source: source || '',
      notes: notes || '',
      valid: valid,
      dataUri: FBR_CARTE_MENTALE_extractDataUri_(row) || (valid ? FBR_CARTE_MENTALE_sourceImageToDataUri_(source) : '')
    };
  }

  return {
    id: cfg.LOGO_ASSET_ID,
    name: 'Logo officiel Blau Périgord',
    status: 'À créer / à valider',
    rights: 'À valider',
    source: '',
    notes: 'Le logo central reste un placeholder tant que l’asset officiel n’est pas validé dans 🖼️ Médias & droits.',
    valid: false,
    dataUri: ''
  };
}

function FBR_CARTE_MENTALE_extractDataUri_(row) {
  for (var i = 0; i < row.length; i++) {
    var v = String(row[i] || '');
    if (v.indexOf('data:image/') === 0) return v;
  }
  return '';
}

function FBR_CARTE_MENTALE_sourceImageToDataUri_(source) {
  // Convertit un asset Drive image en base64 uniquement si l'asset est déjà validé.
  // Aucun appel externe : DriveApp lit seulement les fichiers accessibles au script.
  try {
    var id = FBR_CARTE_MENTALE_extractDriveId_(source);
    if (!id) return '';
    var file = DriveApp.getFileById(id);
    var blob = file.getBlob();
    var mime = blob.getContentType() || '';
    if (mime.indexOf('image/') !== 0) return '';
    return 'data:' + mime + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (err) {
    Logger.log('Logo source non convertible en data URI : ' + err);
    return '';
  }
}

function FBR_CARTE_MENTALE_extractDriveId_(urlOrId) {
  var s = String(urlOrId || '').trim();
  if (!s) return '';
  if (/^[A-Za-z0-9_-]{20,}$/.test(s) && s.indexOf('/') === -1) return s;
  var m = s.match(/\/d\/([A-Za-z0-9_-]+)/) ||
          s.match(/[?&]id=([A-Za-z0-9_-]+)/) ||
          s.match(/fileId=([A-Za-z0-9_-]+)/);
  return m ? m[1] : '';
}

function FBR_CARTE_MENTALE_buildBlock_(cfgBlock, decisions, gates, actions, cdc) {
  var items = [];
  var status = 'À VALIDER';

  if (cfgBlock.sourceDecisionIds) {
    var allValidated = true;
    for (var i = 0; i < cfgBlock.sourceDecisionIds.length; i++) {
      var d = decisions[cfgBlock.sourceDecisionIds[i]];
      if (!d) {
        allValidated = false;
        items.push(cfgBlock.sourceDecisionIds[i] + ' — manquante');
        continue;
      }
      var text = d.status === 'Validé'
        ? (d.decision || d.recommendation || d.question)
        : (d.status + ' — ' + (d.question || d.recommendation));
      items.push(text);
      if (d.status !== 'Validé') allValidated = false;
    }
    status = allValidated ? 'VALIDÉ' : 'À VALIDER';
  } else if (cfgBlock.sourceGateIds) {
    var noGo = false;
    for (var g = 0; g < cfgBlock.sourceGateIds.length; g++) {
      var gate = gates[cfgBlock.sourceGateIds[g]];
      if (!gate) {
        noGo = true;
        items.push(cfgBlock.sourceGateIds[g] + ' — gate manquante');
        continue;
      }
      items.push(gate.support + ' — ' + gate.status);
      if (String(gate.allowed).toUpperCase() !== 'OUI') noGo = true;
    }
    status = noGo ? 'NO GO' : 'GO';
  } else if (cfgBlock.source === 'actions') {
    status = actions.p0Open > 0 ? 'P0 OUVERTES' : 'OK';
    items = actions.top.length ? actions.top : [cfgBlock.fallback];
  }

  if (!items.length) items = [cfgBlock.fallback];

  return {
    id: cfgBlock.id,
    title: cfgBlock.title,
    icon: cfgBlock.icon,
    status: status,
    items: items.slice(0, 4)
  };
}

function FBR_CARTE_MENTALE_collectWarnings_(decisions, gates, logo, actions, cdc) {
  var warnings = [];
  if (!logo.valid) warnings.push('Logo officiel Blau Périgord non encore validé : centre en placeholder.');
  if (FBR_CARTE_MENTALE_countNoGoGates_(gates) > 0) warnings.push('Des gates publication COM sont encore NO GO : publication publique bloquée.');
  if (actions.p0Open > 0) warnings.push(actions.p0Open + ' actions P0 ouvertes.');
  if (cdc.blockers > 0) warnings.push(cdc.blockers + ' exigences CDC bloquantes détectées.');
  return warnings;
}

function FBR_CARTE_MENTALE_countByStatus_(obj, status) {
  var c = 0;
  for (var k in obj) if (obj[k] && obj[k].status === status) c++;
  return c;
}

function FBR_CARTE_MENTALE_countPendingDecisions_(obj) {
  var c = 0;
  for (var k in obj) {
    if (obj[k] && obj[k].status && obj[k].status !== 'Validé' && obj[k].status !== 'Refusé') c++;
  }
  return c;
}

function FBR_CARTE_MENTALE_countGoGates_(obj) {
  var c = 0;
  for (var k in obj) {
    var g = obj[k];
    if (!g) continue;
    if (String(g.allowed).toUpperCase() === 'OUI') c++;
  }
  return c;
}

function FBR_CARTE_MENTALE_countGateContains_(obj, text) {
  var c = 0;
  for (var k in obj) {
    var g = obj[k];
    if (!g) continue;
    if (String(g.status).indexOf(text) !== -1 || String(g.allowed).indexOf(text) !== -1) c++;
  }
  return c;
}

function FBR_CARTE_MENTALE_countNoGoGates_(obj) {
  var c = 0;
  for (var k in obj) {
    var g = obj[k];
    if (!g) continue;
    if (String(g.allowed).toUpperCase() !== 'OUI') c++;
  }
  return c;
}
/**
 * Carte mentale dynamique — rendu HTML/SVG.
 */

function FBR_CARTE_MENTALE_RENDER_evaluateTemplate_(state) {
  var cfg = FBR_CARTE_MENTALE_CFG_get_();
  var template = HtmlService.createTemplateFromFile(cfg.TEMPLATE_HTML);
  template.stateJson = JSON.stringify(state || FBR_CARTE_MENTALE_DATA_buildComState_('VIEW'));
  return template.evaluate()
    .setTitle('🧠 Carte mentale COM dynamique — Félibrée 2027')
    .setWidth(1200)
    .setHeight(900);
}

function FBR_CARTE_MENTALE_RENDER_buildStandaloneHtml_(state) {
  var json = JSON.stringify(state || FBR_CARTE_MENTALE_DATA_buildComState_('EXPORT'));
  var escapedJson = json.replace(/</g, '\\u003c');
  var html = HtmlService.createTemplateFromFile(FBR_CARTE_MENTALE_CFG_get_().TEMPLATE_HTML).getRawContent();
  html = html.replace('<?!= stateJson ?>', escapedJson);
  html = html.replace('<?= stateJson ?>', escapedJson);
  return html;
}
/**
 * Carte mentale dynamique — traçabilité minimale.
 */

function FBR_CARTE_MENTALE_REGISTRY_log_(action, status, url, state) {
  try {
    var cfg = FBR_CARTE_MENTALE_CFG_get_();
    var ss = FBR_CARTE_MENTALE_ss_();
    var sh = ss.getSheetByName(cfg.SHEETS.LOGS);
    if (!sh) return false;

    sh.appendRow([
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
      'apps-script',
      action,
      'CARTE_MENTALE',
      status,
      state && state.mapId ? state.mapId : cfg.MAP_ID_COM,
      1,
      state && state.blocks ? state.blocks.length : 0,
      url || '',
      0,
      cfg.VERSION,
      'CARTE_MENTALE_DYNAMIC_V1',
      state && state.warnings ? state.warnings.join(' | ') : ''
    ]);
    return true;
  } catch (err) {
    Logger.log('FBR_CARTE_MENTALE_REGISTRY_log_ failed: ' + err);
    return false;
  }
}
function FBR_CARTE_MENTALE_REGISTRY_updateMapRegistry_(fileUrl, state) {
  // Mise à jour best-effort du registre 🧠 Cartes & Assets HTML en APPLY.
  // Le script tolère les variations d'en-têtes et n'écrit rien si l'onglet est absent.
  try {
    var cfg = FBR_CARTE_MENTALE_CFG_get_();
    var ss = FBR_CARTE_MENTALE_ss_();
    var sh = ss.getSheetByName(cfg.SHEETS.MAP_REGISTRY);
    if (!sh) return false;

    var lastCol = Math.min(sh.getLastColumn() || 18, 40);
    var headers = sh.getRange(4, 1, 1, lastCol).getDisplayValues()[0];
    var h = {};
    for (var c = 0; c < headers.length; c++) {
      if (headers[c]) h[String(headers[c]).trim()] = c + 1;
    }

    var mapIdHeader = h['Map ID'] || h['ID'] || h['Carte ID'] || h['Asset ID'];
    var targetRow = 0;
    if (mapIdHeader) {
      var ids = sh.getRange(5, mapIdHeader, Math.max(sh.getLastRow() - 4, 1), 1).getDisplayValues();
      for (var r = 0; r < ids.length; r++) {
        if (String(ids[r][0]) === String(state.mapId)) {
          targetRow = 5 + r;
          break;
        }
      }
    }

    if (!targetRow) targetRow = Math.max(sh.getLastRow() + 1, 5);

    function setByHeader(names, value) {
      for (var i = 0; i < names.length; i++) {
        var col = h[names[i]];
        if (col) {
          sh.getRange(targetRow, col).setValue(value);
          return true;
        }
      }
      return false;
    }

    setByHeader(['Map ID', 'ID', 'Carte ID', 'Asset ID'], state.mapId);
    setByHeader(['Nom carte', 'Nom / description', 'Titre'], state.title || 'Communication Félibrée 2027');
    setByHeader(['Profil accès', 'Profils accès', 'Accès'], (state.profiles || []).join(', '));
    setByHeader(['Source principale', 'Source'], '🗳️ Décisions + ✅ Gate Publication COM + 📣 CDC Communication');
    setByHeader(['Logo central', 'Logo'], state.logo && state.logo.valid ? state.logo.id : 'PLACEHOLDER — logo officiel non validé');
    setByHeader(['Statut', 'Status'], 'GÉNÉRÉ — INTERNE');
    setByHeader(['Dernière génération', 'Date MAJ', 'Dernière MAJ'], state.generatedAt || new Date().toISOString());
    setByHeader(['Version HTML', 'Version'], state.version || cfg.VERSION);
    setByHeader(['Dernier export URL', 'URL export', 'Lien export', 'Lien'], fileUrl || '');
    setByHeader(['Mode ressource', 'Resource mode'], 'HTML_SVG_DYNAMIC_VALIDATED_DATA');
    setByHeader(['Publication', 'Statut publication'], 'INTERNE_NON_PUBLIC');
    setByHeader(['Warnings', 'Alertes'], state.warnings ? state.warnings.join(' | ') : '');
    setByHeader(['Notes', 'Notes / limites'], 'Carte mentale dynamique mise à jour en APPLY ; données validées uniquement.');

    return true;
  } catch (err) {
    Logger.log('FBR_CARTE_MENTALE_REGISTRY_updateMapRegistry_ failed: ' + err);
    return false;
  }
}


  function openFullscreen() {
    return showProStaticFullscreen_();
  }

  function showProStaticFullscreen_() {
    try {
      var cfg = FBR_CARTE_MENTALE_CFG_get_();
      var html = HtmlService
        .createHtmlOutputFromFile(cfg.STATIC_PRO_HTML)
        .setTitle('🧠 Carte mentale COM — rendu pro')
        .setWidth(1200)
        .setHeight(900);

      SpreadsheetApp.getUi().showModelessDialog(html, '🧠 Carte mentale COM — rendu pro');

      return {
        ok: true,
        version: FBR_CARTE_MENTALE_DYNAMIC_VERSION,
        visualMode: 'PRO_STATIC_BASE64',
        htmlFile: cfg.STATIC_PRO_HTML,
        dynamicEngine: 'diagnostic_and_dry_run_only',
        message: 'Rendu pro figé ouvert. Les données dynamiques restent disponibles via diagnostic/dry-run.'
      };
    } catch (err) {
      return handleUiError_(err, 'carte mentale pro figée');
    }
  }

  function handleUiError_(err, contextLabel) {
    var message = String(err && err.message ? err.message : err);

    if (message.indexOf('Cannot call SpreadsheetApp.getUi() from this context') !== -1) {
      Logger.log('UI indisponible depuis l’éditeur Apps Script. Ouvrir le Google Sheet puis utiliser le menu : ' + contextLabel + '.');
      return {
        ok: false,
        reason: 'UI_CONTEXT_UNAVAILABLE',
        message: 'Fonction UI à lancer depuis le Google Sheet, pas depuis l’éditeur Apps Script.',
        action: 'Recharger le Sheet puis utiliser le menu 🎉 Félibrée Admin.'
      };
    }

    if (message.indexOf('No HTML file named') !== -1) {
      var cfg = FBR_CARTE_MENTALE_CFG_get_();
      Logger.log('HTML carte mentale introuvable pour ' + contextLabel + ' : ' + message);
      return {
        ok: false,
        reason: 'HTML_TEMPLATE_MISSING',
        message: message,
        expectedStaticHtml: cfg.STATIC_PRO_HTML,
        expectedDynamicHtml: cfg.TEMPLATE_HTML
      };
    }

    throw err;
  }

  function diagnostic() {
    var cfg = FBR_CARTE_MENTALE_CFG_get_();
    var result = {
      ok: true,
      version: FBR_CARTE_MENTALE_DYNAMIC_VERSION,
      publicFunctions: [
        'FELIBREE_openCarteMentaleComFullscreen',
        'FELIBREE_carteMentaleComDiagnostic',
        'FELIBREE_refreshCarteMentaleComDryRun'
      ],
      removedPublicFunctions: [
        'FELIBREE_openCarteMentaleComV1Fullscreen',
        'FELIBREE_openCarteMentaleComProFullscreen',
        'FELIBREE_openCarteMentaleComDynamicPreview',
        'FELIBREE_carteMentaleComV1Diagnostic',
        'FELIBREE_refreshCarteMentaleComV1DryRun',
        'FELIBREE_refreshCarteMentaleComV1Apply'
      ],
      template: cfg.TEMPLATE_HTML,
      templateFound: false,
      staticProTemplate: cfg.STATIC_PRO_HTML,
      staticProTemplateFound: false,
      visualMode: 'PRO_STATIC_BASE64_MAIN / DYNAMIC_ENGINE_DRY_RUN',
      missingSheets: [],
      canReadState: false,
      stateSummary: null
    };

    try {
      result.missingSheets = FBR_CARTE_MENTALE_getMissingSheets_(FBR_CARTE_MENTALE_ss_(), cfg);
      if (result.missingSheets.length) result.ok = false;
    } catch (errSheets) {
      result.ok = false;
      result.sheetDiagnosticError = String(errSheets && errSheets.message ? errSheets.message : errSheets);
    }

    try {
      HtmlService.createHtmlOutputFromFile(cfg.TEMPLATE_HTML);
      result.templateFound = true;
    } catch (errTpl) {
      result.ok = false;
      result.templateError = 'Fichier HTML Apps Script dynamique introuvable : ' + cfg.TEMPLATE_HTML;
    }

    try {
      HtmlService.createHtmlOutputFromFile(cfg.STATIC_PRO_HTML);
      result.staticProTemplateFound = true;
    } catch (errStaticTpl) {
      result.ok = false;
      result.staticTemplateError = 'Fichier HTML pro figé introuvable : ' + cfg.STATIC_PRO_HTML;
    }

    try {
      var state = FBR_CARTE_MENTALE_DATA_buildComState_('DIAGNOSTIC');
      result.canReadState = true;
      result.stateSummary = {
        blocks: state.blocks.length,
        warnings: state.warnings,
        stats: state.stats,
        logo: state.logo
      };
    } catch (err) {
      result.ok = false;
      result.error = String(err && err.message ? err.message : err);
    }

    Logger.log(JSON.stringify(result, null, 2));
    return result;
  }

  function dryRun() {
    var state = FBR_CARTE_MENTALE_DATA_buildComState_('DRY_RUN');
    return {
      ok: true,
      dryRun: true,
      version: FBR_CARTE_MENTALE_DYNAMIC_VERSION,
      mapId: state.mapId,
      stats: state.stats,
      warnings: state.warnings,
      changedBlocksPreview: state.blocks,
      note: 'Dry-run seulement : aucune écriture, aucun export, aucune publication.'
    };
  }

  return {
    openFullscreen: openFullscreen,
    diagnostic: diagnostic,
    dryRun: dryRun
  };
})();

/**
 * Fonction réelle n°1 — ouverture du rendu PRO figé.
 * À appeler depuis le menu Google Sheet ou la sidebar, pas depuis l’éditeur Apps Script.
 */
function FELIBREE_openCarteMentaleComFullscreen() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_openCarteMentaleComFullscreen',
    mode: 'UI_READ_ONLY',
    sheetName: '🧠 Cartes & Assets HTML',
    rowsRead: 1,
    rowsChanged: 0,
    successMessage: function (result) {
      return result && result.message ? result.message : 'Carte mentale ouverte.';
    }
  }, function () {
    return FBR_CARTE_MENTALE_COM_ENGINE.openFullscreen();
  });
}

/**
 * Fonction réelle n°2 — diagnostic lançable depuis l’éditeur Apps Script.
 */
function FELIBREE_carteMentaleComDiagnostic() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_carteMentaleComDiagnostic',
    mode: 'DIAGNOSTIC',
    sheetName: '🧠 Cartes & Assets HTML',
    rowsRead: function (result) {
      return result && result.stateSummary && result.stateSummary.blocks ?
        result.stateSummary.blocks : 0;
    },
    rowsChanged: 0,
    successMessage: function (result) {
      return 'Diagnostic carte mentale : ok=' + Boolean(result && result.ok) +
        ', template=' + Boolean(result && result.templateFound) +
        ', static=' + Boolean(result && result.staticProTemplateFound) + '.';
    }
  }, function () {
    return FBR_CARTE_MENTALE_COM_ENGINE.diagnostic();
  });
}

/**
 * Fonction réelle n°3 — dry-run de mise à jour des blocs depuis les données validées.
 */
function FELIBREE_refreshCarteMentaleComDryRun() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_refreshCarteMentaleComDryRun',
    mode: 'DRY_RUN',
    sheetName: '🧠 Cartes & Assets HTML',
    rowsRead: function (result) {
      return result && result.changedBlocksPreview ? result.changedBlocksPreview.length : 0;
    },
    rowsChanged: 0,
    successMessage: function (result) {
      return 'Carte mentale dry-run : ' +
        (result && result.changedBlocksPreview ? result.changedBlocksPreview.length : 0) +
        ' bloc(s), aucune écriture.';
    }
  }, function () {
    return FBR_CARTE_MENTALE_COM_ENGINE.dryRun();
  });
}
