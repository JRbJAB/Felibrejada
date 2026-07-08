function FBR_issue_(issues, block, level, rowNumber, field, problem, action, owner, notes) {
  issues.push([new Date(), block, level, rowNumber || '', field || '', problem || '', action || '', owner || '', 'Ouvert', notes || '']);
}

function FBR_missingRequired_(issues, block, row, map, requiredHeaders, ownerHeader) {
  requiredHeaders.forEach(function (header) {
    if (map[header] === undefined) {
      FBR_issue_(issues, block, 'ERREUR', row.rowNumber, header, 'Colonne absente', 'Réparer les en-têtes de l\'onglet', '', 'Script/structure');
      return;
    }
    if (FBR_isBlank_(FBR_get_(row, map, header))) {
      FBR_issue_(issues, block, 'BLOQUANT', row.rowNumber, header, 'Champ obligatoire vide', 'Compléter la cellule avant validation', FBR_safeText_(FBR_get_(row, map, ownerHeader || 'Responsable')), 'Contrôle automatique');
    }
  });
}

function FBR_runQualityChecks_() {
  var startMs = Date.now();
  var traceId = FBR_traceId_();
  FBR_ensureCoreSheets_();
  var issues = [];
  var rowsRead = 0;

  var publications = FBR_getRows_(FBR.SHEETS.PUBLICATIONS, 24);
  rowsRead += publications.rows.length;
  publications.rows.forEach(function (row) {
    FBR_missingRequired_(issues, 'Publications', row, publications.map, ['Date prévue', 'Canal', 'Format', 'Pilier', 'Audience', 'Message / angle', 'CTA', 'Responsable', 'Statut', 'Mode/API'], 'Responsable');
    var status = FBR_norm_(FBR_get_(row, publications.map, 'Statut'));
    var url = FBR_safeText_(FBR_get_(row, publications.map, 'URL publiée'));
    if (status === 'publié' && !url) {
      FBR_issue_(issues, 'Publications', 'BLOQUANT', row.rowNumber, 'URL publiée', 'Contenu marqué publié sans URL', 'Coller le lien publié ou changer le statut', FBR_safeText_(FBR_get_(row, publications.map, 'Responsable')), 'Publication non traçable');
    }
    var mode = FBR_safeText_(FBR_get_(row, publications.map, 'Mode/API'));
    if (mode.toLowerCase().indexOf('api') >= 0 && status !== 'publié') {
      FBR_issue_(issues, 'Publications', 'ATTENTION', row.rowNumber, 'Mode/API', 'Mode API mentionné : vérifier accès, permissions et dry-run', 'Valider dans 🔌 APIs & Automations avant toute écriture réelle', FBR_safeText_(FBR_get_(row, publications.map, 'Responsable')), mode);
    }
  });

  var actions = FBR_getRows_(FBR.SHEETS.ACTIONS, 14);
  rowsRead += actions.rows.length;
  var today = FBR_todayStart_();
  actions.rows.forEach(function (row) {
    var priority = FBR_safeText_(FBR_get_(row, actions.map, 'Priorité'));
    var status = FBR_norm_(FBR_get_(row, actions.map, 'Statut'));
    var due = FBR_get_(row, actions.map, 'Date fin');
    if (priority.indexOf('P0') === 0 && status !== 'terminé') {
      FBR_issue_(issues, 'Actions', 'BLOQUANT', row.rowNumber, 'Priorité', 'Action P0 non terminée', 'Bloquer 30 min pour décision / responsable / livrable', FBR_safeText_(FBR_get_(row, actions.map, 'Responsable')), 'P0 actif');
    }
    if (FBR_isDate_(due) && due < today && status !== 'terminé') {
      FBR_issue_(issues, 'Actions', 'RETARD', row.rowNumber, 'Date fin', 'Action en retard', 'Replanifier ou clôturer', FBR_safeText_(FBR_get_(row, actions.map, 'Responsable')), 'Date dépassée');
    }
  });

  var press = FBR_getRows_(FBR.SHEETS.PRESS, 17);
  rowsRead += press.rows.length;
  press.rows.forEach(function (row) {
    FBR_missingRequired_(issues, 'Presse', row, press.map, ['Média / organisme', 'Type', 'Zone', 'Angle prioritaire', 'Statut', 'Prochaine action', 'Date relance', 'Responsable'], 'Responsable');
    var relance = FBR_get_(row, press.map, 'Date relance');
    var status = FBR_norm_(FBR_get_(row, press.map, 'Statut'));
    if (FBR_isDate_(relance) && relance <= today && status !== 'retombée obtenue') {
      FBR_issue_(issues, 'Presse', 'RELANCE', row.rowNumber, 'Date relance', 'Relance presse due', 'Appeler / relancer / tracer le retour', FBR_safeText_(FBR_get_(row, press.map, 'Responsable')), FBR_safeText_(FBR_get_(row, press.map, 'Média / organisme')));
    }
  });

  var chatbot = FBR_getRows_(FBR.SHEETS.CHATBOT, 13);
  rowsRead += chatbot.rows.length;
  chatbot.rows.forEach(function (row) {
    var prio = FBR_safeText_(FBR_get_(row, chatbot.map, 'Priorité'));
    var sourceStatus = FBR_norm_(FBR_get_(row, chatbot.map, 'Statut source'));
    if ((prio.indexOf('P0') === 0 || prio.indexOf('P1') === 0) && sourceStatus !== 'validé') {
      FBR_issue_(issues, 'Chatbot', 'BLOQUANT', row.rowNumber, 'Statut source', 'Réponse prioritaire sans source validée', 'Valider la source ou garder la réponse privée', FBR_safeText_(FBR_get_(row, chatbot.map, 'Fallback humain')), 'Garde-fou chatbot');
    }
  });

  var site = FBR_getRows_(FBR.SHEETS.SITE, 13);
  rowsRead += site.rows.length;
  site.rows.forEach(function (row) {
    var priority = FBR_safeText_(FBR_get_(row, site.map, 'Priorité'));
    var status = FBR_norm_(FBR_get_(row, site.map, 'Statut'));
    var target = FBR_get_(row, site.map, 'Date cible');
    if ((priority.indexOf('P0') === 0 || priority.indexOf('P1') === 0) && status !== 'terminé') {
      FBR_issue_(issues, 'Site Web', 'ATTENTION', row.rowNumber, 'Statut', 'Page prioritaire non terminée', 'Publier une v0 utile puis améliorer', FBR_safeText_(FBR_get_(row, site.map, 'Responsable')), FBR_safeText_(FBR_get_(row, site.map, 'Page / module')));
    }
    if (FBR_isDate_(target) && target < today && status !== 'terminé') {
      FBR_issue_(issues, 'Site Web', 'RETARD', row.rowNumber, 'Date cible', 'Page en retard', 'Arbitrer contenu minimal et publier', FBR_safeText_(FBR_get_(row, site.map, 'Responsable')), 'Date cible dépassée');
    }
  });

  var apis = FBR_getRows_(FBR.SHEETS.APIS, 14);
  rowsRead += apis.rows.length;
  apis.rows.forEach(function (row) {
    var status = FBR_norm_(FBR_get_(row, apis.map, 'Statut'));
    var decision = FBR_safeText_(FBR_get_(row, apis.map, 'Décision recommandée'));
    if (status === 'à valider') {
      FBR_issue_(issues, 'APIs', 'DÉCISION', row.rowNumber, 'Statut', 'API à valider avant tout développement', 'Choisir manuel / semi-auto / auto / bloqué', FBR_safeText_(FBR_get_(row, apis.map, 'Responsable')), decision);
    }
  });

  if (issues.length === 0) {
    issues.push([new Date(), 'Global', 'OK', '', '', 'Aucun blocage détecté', 'Continuer la routine', 'Équipe', 'Clos', 'Contrôle automatique']);
  }
  var rowsChanged = FBR_writeBody_(FBR.SHEETS.CHECKS, issues, FBR.ADMIN_HEADERS.CHECKS.length);
  FBR_log_({ functionName: 'FBR_runQualityChecks_', mode: 'DRY_RUN_SAFE', status: 'OK', sheetName: FBR.SHEETS.CHECKS, rowsRead: rowsRead, rowsChanged: rowsChanged, message: issues.length + ' contrôle(s) écrit(s)', startMs: startMs, traceId: traceId });
  return FBR_result_(true, 'Contrôles qualité terminés', issues.length + ' ligne(s) dans 🔎 Contrôles. Trace ' + traceId);
}
