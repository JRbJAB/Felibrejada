/**
 * FBR_UI_FAMILY_TECHNIQUE_20260711_v0_1.gs
 * UI family: régie technique, SIG, terrain, sécurité, équipements.
 */

function FBR_UI_FAMILY_applyTechniqueV01() {
  var ss = FBR_UIF_ss_();
  var out = [];
  var tabs = [
    ['📘 CDC Bornat', 18, 300],
    ['🗺️ Zones & Implantations', 20, 500],
    ['🧭 Scénarios & Arbitrages', 18, 300],
    ['📐 Contraintes & Jauges', 20, 400],
    ['🛠️ Régie Technique', 20, 500],
    ['📚 Docs Référence', 16, 300],
    ['📍 Repérages Terrain', 20, 500],
    ['🧬 Contrat Données SIG', 18, 300],
    ['🔧 Équipements & Réseaux', 22, 500],
    ['✅ Contrôles Terrain TECH', 20, 500],
    ['🎛️ Cockpit Technique', 18, 250],
    ['🤝 Consultations TECH', 20, 400],
    ['📱 AppSheet TECH Prep', 18, 300],
    ['🔐 Gate Ouverture TECH', 18, 300],
    ['👥 RACI Technique', 18, 300],
    ['🏛️ Lieux & Emprises', 24, 800],
    ['🔎 Vérifications Lieux', 18, 500],
    ['⚖️ Base Réglementaire', 20, 500],
    ['🧯 Dossier Sécurité Événement', 20, 500],
    ['📥 Archives PDF Sources', 18, 500]
  ];

  for (var i = 0; i < tabs.length; i++) {
    out.push(FBR_UIF_applyStandardTable_(ss, tabs[i][0], {
      cols: tabs[i][1],
      rows: tabs[i][2],
      titleBg: '#16355B',
      headerBg: '#1E4F77',
      noteBg: '#E8F2FA',
      noteFg: '#0D2B45',
      defaultWidth: 150,
      dataHeight: 58,
      statusList: ['À faire', 'En cours', 'À vérifier', 'À valider', 'Validé', 'Bloqué', 'Reporté'],
      priorityList: ['P0 critique', 'P1 haute', 'P2 normale', 'P3 optionnelle']
    }));
  }

  return FBR_UIF_result_('TECHNIQUE_V01', out);
}

function FBR_UI_FAMILY_applyTechnique() {
  return FBR_UI_FAMILY_applyTechniqueV01();
}
