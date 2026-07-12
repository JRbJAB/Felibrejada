/**
 * FBR_UI_FAMILY_CONTENTS_COM_20260711_v0_1.gs
 * UI family: communication, contents, press, site, media.
 */

function FBR_UI_FAMILY_applyContentsComV01() {
  var ss = FBR_UIF_ss_();
  var out = [];
  var tabs = [
    ['🎨 Logo Charte', 10, 181],
    ['📱 Posts fondateurs', 14, 160],
    ['📅 Publications', 32, 300],
    ['📰 Presse', 22, 200],
    ['🌐 Site Web', 22, 200],
    ['🤖 Chatbot', 22, 200],
    ['💡 Idées contenus', 20, 200],
    ['🖼️ Médias & droits', 16, 500],
    ['📆 Calendrier Comms', 12, 300]
  ];

  for (var i = 0; i < tabs.length; i++) {
    out.push(FBR_UIF_applyStandardTable_(ss, tabs[i][0], {
      cols: tabs[i][1],
      rows: tabs[i][2],
      titleBg: '#0F3A5F',
      headerBg: '#1B6B7A',
      noteBg: '#E8F5F8',
      noteFg: '#083344',
      defaultWidth: 145
    }));
  }

  return FBR_UIF_result_('CONTENTS_COM_V01', out);
}

function FBR_UI_FAMILY_applyContentsCom() {
  return FBR_UI_FAMILY_applyContentsComV01();
}
