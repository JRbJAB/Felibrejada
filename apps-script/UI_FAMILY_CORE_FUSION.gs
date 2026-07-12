/**
 * FBR_UI_FAMILY_CORE_FUSION_20260711_v0_1.gs
 * UI family: fused core tabs.
 * Targets active fused tabs only: Cockpit, Réunion fusionnée, Décisions, Actions.
 * Legacy source tabs are hidden, never deleted.
 */

function FBR_UI_FAMILY_applyCoreFusionV01() {
  var ss = FBR_UIF_ss_();
  var out = [];

  out.push(FBR_UIF_applyStandardTable_(ss, '📌 Réunion 11/07', {
    cols: 15,
    rows: 180,
    titleBg: '#112D66',
    headerBg: '#274FAE',
    noteBg: '#EAF1FF',
    noteFg: '#102653',
    widths: [85, 70, 115, 180, 320, 280, 120, 120, 150, 155, 260, 110, 270, 130, 260],
    statusList: ['À compléter', 'À arbitrer', 'À préparer', 'À valider', 'Validé', 'Corrigé', 'Refusé', 'Reporté']
  }));

  out.push(FBR_UIF_applyStandardTable_(ss, '⚡ Actions', {
    cols: 18,
    rows: 200,
    titleBg: '#4B2464',
    headerBg: '#5D3478',
    noteBg: '#F1E8F7',
    noteFg: '#2D1739',
    widths: [90, 105, 105, 130, 320, 270, 160, 110, 120, 230, 85, 85, 120, 250, 130, 130, 120, 260],
    statusList: ['À faire', 'En cours', 'À valider', 'Validé', 'Terminé', 'Bloqué', 'Reporté', 'Annulé']
  }));

  out.push(FBR_UIF_applyStandardTable_(ss, '🗳️ Décisions', {
    cols: 17,
    rows: 160,
    titleBg: '#6B3807',
    headerBg: '#AD6310',
    noteBg: '#FFF4DF',
    noteFg: '#5A2802',
    widths: [90, 130, 260, 260, 260, 220, 120, 120, 155, 170, 110, 270, 135, 260, 250, 220, 170],
    statusList: ['Validé', 'Corrigé', 'Refusé', 'À valider', 'À arbitrer', 'Reporté'],
    decisionStatusList: ['Validé', 'Corrigé', 'Refusé', 'À valider', 'À arbitrer', 'Reporté']
  }));

  out.push(FBR_UIF_applyStandardTable_(ss, '🎛️ Cockpit', {
    cols: 20,
    rows: 200,
    frozenRows: 3,
    titleBg: '#2D1947',
    headerBg: '#5D3478',
    noteBg: '#F1E8F7',
    noteFg: '#2D1739',
    defaultWidth: 145,
    dataHeight: 34
  }));

  out = out.concat(FBR_UIF_hideSheets_(ss, [
    '✅ Readiness 11/07',
    '📝 PV 11/07',
    '🚀 Sprint 72h',
    '🧭 Priorités Com'
  ]));

  return FBR_UIF_result_('CORE_FUSION_V01', out);
}

function FBR_UI_FAMILY_applyCoreFusion() {
  return FBR_UI_FAMILY_applyCoreFusionV01();
}
