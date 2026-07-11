/**
 * FBR_UI_FAMILY_GOVERNANCE_ADMIN_20260711_v0_1.gs
 * UI family: governance, references, registries, logs, parameters.
 */

function FBR_UI_FAMILY_applyGovernanceAdminV01() {
  var ss = FBR_UIF_ss_();
  var out = [];
  var tabs = [
    ['🌐 Domaine & Réseaux', 15, 160],
    ['🔐 Accès & Admins', 16, 160],
    ['👥 CRM contacts', 16, 500],
    ['🔌 APIs & Automations', 22, 200],
    ['⚙️ Paramètres', 20, 300],
    ['📚 Sources & preuves', 16, 500],
    ['🧩 Script Registry', 18, 501],
    ['🗂️ Sheet Registry', 16, 500],
    ['✅ QA Data Rules', 16, 400],
    ['📦 Releases & Backups', 16, 400],
    ['🧱 Architecture Scripts', 18, 500],
    ['🤖 IA optionnelle', 18, 500],
    ['🧾 Logs', 16, 1000],
    ['📤 Exports', 16, 300],
    ['🔎 Contrôles', 18, 300]
  ];

  for (var i = 0; i < tabs.length; i++) {
    out.push(FBR_UIF_applyStandardTable_(ss, tabs[i][0], {
      cols: tabs[i][1],
      rows: tabs[i][2],
      titleBg: '#243447',
      headerBg: '#3F5C78',
      noteBg: '#EEF3F8',
      noteFg: '#1B2A3A',
      defaultWidth: 145,
      dataHeight: tabs[i][0] === '🧾 Logs' ? 38 : 52
    }));
  }

  return FBR_UIF_result_('GOVERNANCE_ADMIN_V01', out);
}

function FBR_UI_FAMILY_applyGovernanceAdmin() {
  return FBR_UI_FAMILY_applyGovernanceAdminV01();
}
