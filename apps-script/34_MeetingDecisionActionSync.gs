/**
 * 34_MeetingDecisionActionSync.gs
 * Architecture Réunions / Décisions / Actions — version propre additive.
 *
 * Règles de sécurité :
 * - aucun onOpen ; le menu reste dans 03_Menu_UI.gs ;
 * - aucune réécriture des formules AUTO ;
 * - aucune modification de 00_Code.gs ;
 * - créations limitées aux colonnes MANUEL ;
 * - audit lecture seule ;
 * - protections appliquées uniquement sur demande explicite.
 */
var FBR_MEETING_V100 = {
  VERSION: 'v1.0.0-clean-3ebd799a-20260713',
  TRACE: 'MEETING_CLEAN_V100_3EBD799A_20260713',
  MEETING_SHEET: '📌 Réunions & PV',
  DECISION_SHEET: '🗳️ Décisions',
  ACTION_SHEET: '⚡ Actions',
  READINESS_SHEET: '✅ Readiness',
  HEADER_ROW: 4,
  FIRST_DATA_ROW: 5,
  MEETING_LAST_ROW: 180,
  DECISION_LAST_ROW: 160,
  ACTION_LAST_ROW: 200,
  MEETING_BLOCK_SIZE: 12,
  MANUAL_FILL: '#FFF4CC',
  AUTO_FILL: '#E6F2FF',
  PROTECTION_PREFIX: 'AUTO — RÉUNIONS V1.0.0'
};

function FBR_MEETING_ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function FBR_MEETING_sheet_(name) {
  var sheet = FBR_MEETING_ss_().getSheetByName(name);
  if (!sheet) {
    throw new Error('Onglet requis absent : ' + name + '. Aucune création automatique d’onglet vide.');
  }
  return sheet;
}

function FBR_MEETING_trim_(value) {
  return String(value === null || value === undefined ? '' : value).trim();
}

function FBR_MEETING_isBlank_(value) {
  return FBR_MEETING_trim_(value) === '';
}

function FBR_MEETING_splitIds_(value) {
  var raw = FBR_MEETING_trim_(value);
  if (!raw) return [];
  var parts = raw.split(/\s*\/\s*/);
  var seen = {};
  var out = [];
  parts.forEach(function (part) {
    var id = FBR_MEETING_trim_(part);
    if (id && !seen[id]) {
      seen[id] = true;
      out.push(id);
    }
  });
  return out;
}

function FBR_MEETING_joinIds_(values) {
  var seen = {};
  var out = [];
  (values || []).forEach(function (value) {
    FBR_MEETING_splitIds_(value).forEach(function (id) {
      if (!seen[id]) {
        seen[id] = true;
        out.push(id);
      }
    });
  });
  return out.join(' / ');
}

function FBR_MEETING_pad_(number, width) {
  var text = String(number);
  while (text.length < width) text = '0' + text;
  return text;
}

function FBR_MEETING_parseDate_(text) {
  var value = FBR_MEETING_trim_(text);
  var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error('Date invalide : utiliser strictement AAAA-MM-JJ.');
  }
  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  var date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error('Date civile invalide : ' + value + '.');
  }
  return date;
}

function FBR_MEETING_formatDate_(date) {
  return Utilities.formatDate(date, FBR_MEETING_ss_().getSpreadsheetTimeZone() || 'Europe/Paris', 'yyyy-MM-dd');
}

function FBR_MEETING_nextPvNumber_(values) {
  var max = 0;
  (values || []).forEach(function (row) {
    var match = /^PV-(\d+)$/.exec(FBR_MEETING_trim_(row[0]));
    if (match) max = Math.max(max, Number(match[1]));
  });
  return max + 1;
}

function FBR_MEETING_nextMeetingId_(dateText, existingValues) {
  var base = 'MEET-' + dateText;
  var existing = {};
  (existingValues || []).forEach(function (row) {
    var value = FBR_MEETING_trim_(row[0]);
    if (value) existing[value] = true;
  });
  if (!existing[base]) return base;
  var index = 2;
  while (existing[base + '-' + FBR_MEETING_pad_(index, 2)]) index++;
  return base + '-' + FBR_MEETING_pad_(index, 2);
}

function FBR_MEETING_rowIsBlank_(leftRow, rightRow) {
  var values = (leftRow || []).concat(rightRow || []);
  for (var i = 0; i < values.length; i++) {
    if (!FBR_MEETING_isBlank_(values[i])) return false;
  }
  return true;
}

function FBR_MEETING_findContiguousMeetingRows_(sheet, requiredCount) {
  var first = FBR_MEETING_V100.FIRST_DATA_ROW;
  var last = FBR_MEETING_V100.MEETING_LAST_ROW;
  var count = last - first + 1;
  var left = sheet.getRange(first, 1, count, 13).getDisplayValues();       // A:M MANUEL
  var right = sheet.getRange(first, 15, count, 6).getDisplayValues();      // O:T MANUEL
  var runStart = -1;
  var runLength = 0;
  for (var i = 0; i < count; i++) {
    if (FBR_MEETING_rowIsBlank_(left[i], right[i])) {
      if (runStart < 0) runStart = first + i;
      runLength++;
      if (runLength >= requiredCount) return runStart;
    } else {
      runStart = -1;
      runLength = 0;
    }
  }
  throw new Error('Aucun bloc contigu de ' + requiredCount + ' lignes MANUEL entièrement vides dans ' + FBR_MEETING_V100.MEETING_SHEET + '.');
}

function FBR_MEETING_findFreeRows_(sheet, lastRow, leftStartCol, leftWidth, rightStartCol, rightWidth, requiredCount) {
  var first = FBR_MEETING_V100.FIRST_DATA_ROW;
  var count = lastRow - first + 1;
  var left = sheet.getRange(first, leftStartCol, count, leftWidth).getDisplayValues();
  var right = sheet.getRange(first, rightStartCol, count, rightWidth).getDisplayValues();
  var rows = [];
  for (var i = 0; i < count && rows.length < requiredCount; i++) {
    if (FBR_MEETING_rowIsBlank_(left[i], right[i])) rows.push(first + i);
  }
  if (rows.length < requiredCount) {
    throw new Error('Capacité insuffisante dans ' + sheet.getName() + ' : ' + requiredCount + ' ligne(s) MANUEL vide(s) requise(s), ' + rows.length + ' disponible(s).');
  }
  return rows;
}

function FBR_MEETING_manualFormulaCount_(sheet, a1Ranges) {
  var count = 0;
  (a1Ranges || []).forEach(function (a1) {
    var formulas = sheet.getRange(a1).getFormulas();
    formulas.forEach(function (row) {
      row.forEach(function (formula) {
        if (formula) count++;
      });
    });
  });
  return count;
}

function FBR_MEETING_duplicateIds_(values) {
  var counts = {};
  var duplicates = [];
  (values || []).forEach(function (row) {
    var id = FBR_MEETING_trim_(row[0]);
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
  });
  Object.keys(counts).sort().forEach(function (id) {
    if (counts[id] > 1) duplicates.push(id + ' ×' + counts[id]);
  });
  return duplicates;
}

function FBR_MEETING_existingIdMap_(sheet, lastRow) {
  var count = lastRow - FBR_MEETING_V100.FIRST_DATA_ROW + 1;
  var values = sheet.getRange(FBR_MEETING_V100.FIRST_DATA_ROW, 1, count, 1).getDisplayValues();
  var map = {};
  values.forEach(function (row) {
    var id = FBR_MEETING_trim_(row[0]);
    if (id) map[id] = true;
  });
  return map;
}

function FBR_MEETING_collectMissingRecords_() {
  var meeting = FBR_MEETING_sheet_(FBR_MEETING_V100.MEETING_SHEET);
  var decisions = FBR_MEETING_sheet_(FBR_MEETING_V100.DECISION_SHEET);
  var actions = FBR_MEETING_sheet_(FBR_MEETING_V100.ACTION_SHEET);
  var rows = meeting.getRange(5, 1, FBR_MEETING_V100.MEETING_LAST_ROW - 4, 20).getValues(); // A:T seulement
  var decisionExisting = FBR_MEETING_existingIdMap_(decisions, FBR_MEETING_V100.DECISION_LAST_ROW);
  var actionExisting = FBR_MEETING_existingIdMap_(actions, FBR_MEETING_V100.ACTION_LAST_ROW);
  var decisionMap = {};
  var actionMap = {};

  rows.forEach(function (row) {
    var pvId = FBR_MEETING_trim_(row[0]);
    var decisionIds = FBR_MEETING_splitIds_(row[15]); // P
    var actionIds = FBR_MEETING_splitIds_(row[16]);   // Q
    var meetingId = FBR_MEETING_trim_(row[18]);       // S
    if (!pvId && !meetingId && decisionIds.length === 0 && actionIds.length === 0) return;

    decisionIds.forEach(function (id) {
      if (decisionExisting[id]) return;
      if (!decisionMap[id]) {
        decisionMap[id] = {
          id: id,
          row: row,
          pvIds: [],
          meetingIds: [],
          actionIds: []
        };
      }
      decisionMap[id].pvIds.push(pvId);
      decisionMap[id].meetingIds.push(meetingId);
      decisionMap[id].actionIds = decisionMap[id].actionIds.concat(actionIds);
    });

    actionIds.forEach(function (id) {
      if (actionExisting[id]) return;
      if (!actionMap[id]) {
        actionMap[id] = {
          id: id,
          row: row,
          pvIds: [],
          meetingIds: [],
          decisionIds: []
        };
      }
      actionMap[id].pvIds.push(pvId);
      actionMap[id].meetingIds.push(meetingId);
      actionMap[id].decisionIds = actionMap[id].decisionIds.concat(decisionIds);
    });
  });

  return {
    decisions: Object.keys(decisionMap).sort().map(function (id) { return decisionMap[id]; }),
    actions: Object.keys(actionMap).sort().map(function (id) { return actionMap[id]; })
  };
}

function FBR_MEETING_writeDecision_(sheet, targetRow, record) {
  var source = record.row;
  var left = [
    record.id,                              // A ID
    FBR_MEETING_trim_(source[3]),           // B Thème <- Sujet
    FBR_MEETING_trim_(source[4]),           // C Question <- Synthèse
    '',                                     // D Options
    FBR_MEETING_trim_(source[10]),          // E Recommandation <- Action suivante
    FBR_MEETING_trim_(source[5]),           // F Décision historique
    FBR_MEETING_trim_(source[6]),           // G Statut historique
    FBR_MEETING_trim_(source[7]),           // H Budget
    FBR_MEETING_trim_(source[9]),           // I Bureau référent
    FBR_MEETING_trim_(source[8]),           // J Responsable
    source[11] || '',                       // K Échéance
    FBR_MEETING_trim_(source[12])           // L Onglets
  ];
  var right = [
    '',                                     // N Risque
    FBR_MEETING_trim_(source[10]),           // O Action suivante
    'Créé depuis ' + FBR_MEETING_joinIds_(record.pvIds), // P PV / notes
    FBR_MEETING_trim_(source[17]),           // Q Trace / release
    FBR_MEETING_joinIds_(record.meetingIds), // R Meeting IDs
    FBR_MEETING_joinIds_(record.actionIds)   // S Action IDs
  ];
  sheet.getRange(targetRow, 1, 1, 12).setValues([left]);   // A:L MANUEL
  sheet.getRange(targetRow, 14, 1, 6).setValues([right]);  // N:S MANUEL
}

function FBR_MEETING_actionStatusFromMeeting_(value) {
  var status = FBR_MEETING_trim_(value);
  if (/^(Terminé|Validé|Fait|Annulé|Bloqué|Reporté|En cours|À valider|À faire)$/.test(status)) return status;
  return 'À faire';
}

function FBR_MEETING_writeAction_(sheet, targetRow, record) {
  var source = record.row;
  var startDate = source[19] || '';          // T Date réunion
  var endDate = source[11] || '';            // L Échéance
  var left = [
    record.id,                               // A ID
    startDate,                               // B Date début
    endDate,                                 // C Date fin
    FBR_MEETING_trim_(source[3]),            // D Lot
    FBR_MEETING_trim_(source[10]) || FBR_MEETING_trim_(source[4]), // E Action
    FBR_MEETING_trim_(source[4]),            // F Livrable
    FBR_MEETING_trim_(source[8]),            // G Responsable
    'P1 importante',                        // H Priorité
    FBR_MEETING_actionStatusFromMeeting_(source[6]), // I Statut
    '',                                      // J Dépendance
    ''                                       // K Effort
  ];
  var right = [
    '',                                      // M Prochaine relance
    'Créé depuis ' + FBR_MEETING_joinIds_(record.pvIds) + (FBR_MEETING_trim_(source[14]) ? ' — ' + FBR_MEETING_trim_(source[14]) : ''), // N Notes
    FBR_MEETING_trim_(source[7]),            // O Budget
    FBR_MEETING_joinIds_(record.decisionIds),// P Decision IDs
    FBR_MEETING_joinIds_(record.meetingIds)  // Q Meeting IDs
  ];
  sheet.getRange(targetRow, 1, 1, 11).setValues([left]);   // A:K MANUEL
  sheet.getRange(targetRow, 13, 1, 5).setValues([right]);  // M:Q MANUEL
}

function FBR_MEETING_protectionForExactRange_(sheet, a1) {
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    if (protections[i].getRange().getA1Notation() === a1) return protections[i];
  }
  return null;
}

function FBR_MEETING_secureRange_(sheet, a1) {
  var protection = FBR_MEETING_protectionForExactRange_(sheet, a1);
  if (!protection) protection = sheet.getRange(a1).protect();
  protection.setDescription(FBR_MEETING_V100.PROTECTION_PREFIX + ' — modifier le registre MANUEL, jamais la cellule AUTO.');
  protection.setWarningOnly(false);
  try {
    if (protection.canDomainEdit()) protection.setDomainEdit(false);
  } catch (ignoreDomain) {}
  var currentEmail = '';
  try { currentEmail = FBR_MEETING_trim_(Session.getEffectiveUser().getEmail()).toLowerCase(); } catch (ignoreEmail) {}
  try {
    var editors = protection.getEditors();
    var removable = editors.filter(function (editor) {
      return !currentEmail || FBR_MEETING_trim_(editor.getEmail()).toLowerCase() !== currentEmail;
    });
    if (removable.length) protection.removeEditors(removable);
    if (currentEmail) protection.addEditor(currentEmail);
  } catch (ignoreEditors) {}
  return protection;
}

function FBR_MEETING_protectionAudit_(sheet, expectedRanges) {
  var existing = {};
  sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (protection) {
    existing[protection.getRange().getA1Notation()] = protection;
  });
  return expectedRanges.map(function (a1) {
    var protection = existing[a1];
    return {
      range: a1,
      ok: !!protection && !protection.isWarningOnly(),
      warningOnly: protection ? protection.isWarningOnly() : null
    };
  });
}

function FBR_MEETING_expectedHeaders_() {
  return [
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'A4', expected: 'PV_ID — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'N4', expected: 'Propagation — AUTO' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'P4', expected: 'Decision_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'Q4', expected: 'Action_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'S4', expected: 'Meeting_ID — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'T4', expected: 'Date réunion — MANUEL' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'A4', expected: 'ID — MANUEL' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'M4', expected: 'Propagation — AUTO actions' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'R4', expected: 'Meeting_ID(s) source — MANUEL' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'S4', expected: 'Action_ID(s) source — MANUEL' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'A4', expected: 'ID' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'L4', expected: 'Retard ? — AUTO' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'P4', expected: 'Decision_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'Q4', expected: 'Meeting_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'R4', expected: 'Trace calculée — AUTO' }
  ];
}

function FBR_MEETING_audit_() {
  var issues = [];
  var infos = [];
  var requiredSheets = [
    FBR_MEETING_V100.MEETING_SHEET,
    FBR_MEETING_V100.DECISION_SHEET,
    FBR_MEETING_V100.ACTION_SHEET,
    FBR_MEETING_V100.READINESS_SHEET
  ];
  requiredSheets.forEach(function (name) {
    if (!FBR_MEETING_ss_().getSheetByName(name)) issues.push('Onglet absent : ' + name);
  });
  if (issues.length) return { ok: false, issues: issues, infos: infos };

  FBR_MEETING_expectedHeaders_().forEach(function (check) {
    var actual = FBR_MEETING_sheet_(check.sheet).getRange(check.cell).getDisplayValue();
    if (actual !== check.expected) {
      issues.push(check.sheet + '!' + check.cell + ' : en-tête inattendu « ' + actual + ' » au lieu de « ' + check.expected + ' ».');
    }
  });

  var meeting = FBR_MEETING_sheet_(FBR_MEETING_V100.MEETING_SHEET);
  var decisions = FBR_MEETING_sheet_(FBR_MEETING_V100.DECISION_SHEET);
  var actions = FBR_MEETING_sheet_(FBR_MEETING_V100.ACTION_SHEET);
  var readiness = FBR_MEETING_sheet_(FBR_MEETING_V100.READINESS_SHEET);

  var decisionIds = decisions.getRange('A5:A160').getDisplayValues();
  var actionIds = actions.getRange('A5:A200').getDisplayValues();
  var duplicateDecisionIds = FBR_MEETING_duplicateIds_(decisionIds);
  var duplicateActionIds = FBR_MEETING_duplicateIds_(actionIds);
  if (duplicateDecisionIds.length) issues.push('Decision_ID dupliqués : ' + duplicateDecisionIds.join(', '));
  if (duplicateActionIds.length) issues.push('Action_ID dupliqués : ' + duplicateActionIds.join(', '));

  var meetingRows = meeting.getRange('P5:T180').getDisplayValues();
  var decisionMap = {};
  decisionIds.forEach(function (row) { var id = FBR_MEETING_trim_(row[0]); if (id) decisionMap[id] = true; });
  var actionMap = {};
  actionIds.forEach(function (row) { var id = FBR_MEETING_trim_(row[0]); if (id) actionMap[id] = true; });
  var missingDecisions = {};
  var missingActions = {};
  var meetingDates = {};
  meetingRows.forEach(function (row) {
    FBR_MEETING_splitIds_(row[0]).forEach(function (id) { if (!decisionMap[id]) missingDecisions[id] = true; });
    FBR_MEETING_splitIds_(row[1]).forEach(function (id) { if (!actionMap[id]) missingActions[id] = true; });
    var meetingId = FBR_MEETING_trim_(row[3]);
    var date = FBR_MEETING_trim_(row[4]);
    if (meetingId && date) {
      if (!meetingDates[meetingId]) meetingDates[meetingId] = {};
      meetingDates[meetingId][date] = true;
    }
  });
  var missingDecisionList = Object.keys(missingDecisions).sort();
  var missingActionList = Object.keys(missingActions).sort();
  if (missingDecisionList.length) issues.push('Décisions référencées mais absentes : ' + missingDecisionList.join(', '));
  if (missingActionList.length) issues.push('Actions référencées mais absentes : ' + missingActionList.join(', '));
  Object.keys(meetingDates).sort().forEach(function (meetingId) {
    var dates = Object.keys(meetingDates[meetingId]);
    if (dates.length > 1) issues.push('Meeting_ID associé à plusieurs dates : ' + meetingId + ' → ' + dates.join(', '));
  });

  var manualFormulaCounts = [
    { sheet: meeting, ranges: ['A5:M180', 'O5:T180'] },
    { sheet: decisions, ranges: ['A5:L160', 'N5:S160'] },
    { sheet: actions, ranges: ['A5:K200', 'M5:Q200'] },
    { sheet: readiness, ranges: ['A5:D160', 'F5:F160', 'L5:L160'] }
  ];
  manualFormulaCounts.forEach(function (spec) {
    var count = FBR_MEETING_manualFormulaCount_(spec.sheet, spec.ranges);
    if (count) issues.push(spec.sheet.getName() + ' : ' + count + ' formule(s) détectée(s) dans les colonnes MANUEL.');
  });

  var formulaAnchors = [
    ['📌 Réunions & PV', 'N5'], ['📌 Réunions & PV', 'U5'], ['📌 Réunions & PV', 'V5'],
    ['📌 Réunions & PV', 'W5'], ['📌 Réunions & PV', 'X5'], ['📌 Réunions & PV', 'Y5'],
    ['🗳️ Décisions', 'M5'], ['🗳️ Décisions', 'T5'], ['🗳️ Décisions', 'U5'],
    ['🗳️ Décisions', 'V5'], ['🗳️ Décisions', 'W5'], ['⚡ Actions', 'L5'], ['⚡ Actions', 'R5'],
    ['✅ Readiness', 'E5'], ['✅ Readiness', 'G5'], ['✅ Readiness', 'H5'], ['✅ Readiness', 'I5'],
    ['✅ Readiness', 'J5'], ['✅ Readiness', 'K5'], ['✅ Readiness', 'M5'], ['✅ Readiness', 'N5'],
    ['✅ Readiness', 'O5'], ['✅ Readiness', 'P5']
  ];
  formulaAnchors.forEach(function (anchor) {
    if (!FBR_MEETING_sheet_(anchor[0]).getRange(anchor[1]).getFormula()) {
      issues.push('Formule AUTO absente : ' + anchor[0] + '!' + anchor[1]);
    }
  });

  var protectionSpecs = [
    { sheet: meeting, ranges: ['N5:N180', 'U5:Y180'] },
    { sheet: decisions, ranges: ['M5:M160', 'T5:W160'] },
    { sheet: actions, ranges: ['L5:L200', 'R5:R200'] },
    { sheet: readiness, ranges: ['E5:E160', 'G5:K160', 'M5:P160'] }
  ];
  protectionSpecs.forEach(function (spec) {
    FBR_MEETING_protectionAudit_(spec.sheet, spec.ranges).forEach(function (result) {
      if (!result.ok) issues.push('Protection AUTO absente ou seulement en avertissement : ' + spec.sheet.getName() + '!' + result.range);
    });
  });

  infos.push('Version module : ' + FBR_MEETING_V100.VERSION);
  infos.push('Décisions : ' + Object.keys(decisionMap).length + ' ID ; Actions : ' + Object.keys(actionMap).length + ' ID.');
  infos.push('Références manquantes : ' + missingDecisionList.length + ' décision(s), ' + missingActionList.length + ' action(s).');
  return { ok: issues.length === 0, issues: issues, infos: infos };
}

function FBR_MEETING_showAudit_(result) {
  var ui = SpreadsheetApp.getUi();
  var lines = [];
  lines.push(result.ok ? '✅ AUDIT OK' : '❌ AUDIT À CORRIGER');
  lines.push('Version : ' + FBR_MEETING_V100.VERSION);
  lines.push('');
  (result.infos || []).forEach(function (info) { lines.push('• ' + info); });
  if (result.issues && result.issues.length) {
    lines.push('');
    lines.push('Anomalies (' + result.issues.length + ') :');
    result.issues.slice(0, 25).forEach(function (issue) { lines.push('• ' + issue); });
    if (result.issues.length > 25) lines.push('• … ' + (result.issues.length - 25) + ' autre(s) anomalie(s).');
  }
  ui.alert('Réunions / Décisions / Actions', lines.join('\n'), ui.ButtonSet.OK);
  return result;
}

function FELIBREE_openMeetingReport() {
  var sheet = FBR_MEETING_sheet_(FBR_MEETING_V100.MEETING_SHEET);
  FBR_MEETING_ss_().setActiveSheet(sheet);
  sheet.activate();
  return { ok: true, sheet: sheet.getName() };
}

function FELIBREE_createMeetingBlock() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    'Créer un bloc de réunion',
    'Saisir : AAAA-MM-JJ | intitulé de la réunion',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return { ok: false, cancelled: true };
  var raw = response.getResponseText();
  var parts = raw.split('|');
  var date = FBR_MEETING_parseDate_(parts[0]);
  var dateText = FBR_MEETING_formatDate_(date);
  var title = FBR_MEETING_trim_(parts.slice(1).join('|')) || 'Réunion ' + dateText;
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) throw new Error('Le document est occupé. Réessayer dans quelques secondes.');
  try {
    var sheet = FBR_MEETING_sheet_(FBR_MEETING_V100.MEETING_SHEET);
    var startRow = FBR_MEETING_findContiguousMeetingRows_(sheet, FBR_MEETING_V100.MEETING_BLOCK_SIZE);
    var pvValues = sheet.getRange('A5:A180').getDisplayValues();
    var meetingValues = sheet.getRange('S5:S180').getDisplayValues();
    var nextPv = FBR_MEETING_nextPvNumber_(pvValues);
    var meetingId = FBR_MEETING_nextMeetingId_(dateText, meetingValues);
    var leftRows = [];
    var rightRows = [];
    for (var i = 0; i < FBR_MEETING_V100.MEETING_BLOCK_SIZE; i++) {
      var sequence = i === 0 ? 'Ouverture' : 'Point ' + FBR_MEETING_pad_(i + 1, 2);
      leftRows.push([
        'PV-' + FBR_MEETING_pad_(nextPv + i, 3), // A
        '',                                       // B Heure
        sequence,                                 // C Séquence
        i === 0 ? title : '',                     // D Sujet
        '', '', '', '', '', '', '', '', ''        // E:M
      ]);
      rightRows.push([
        '',                                       // O Notes
        '',                                       // P Decision IDs
        '',                                       // Q Action IDs
        'Créé par ' + FBR_MEETING_V100.TRACE,     // R Source
        meetingId,                                // S Meeting ID
        date                                      // T Date
      ]);
    }
    sheet.getRange(startRow, 1, leftRows.length, 13).setValues(leftRows);  // A:M uniquement
    sheet.getRange(startRow, 15, rightRows.length, 6).setValues(rightRows); // O:T uniquement
    sheet.getRange(startRow, 20, rightRows.length, 1).setNumberFormat('yyyy-mm-dd');
    SpreadsheetApp.flush();
    FBR_MEETING_ss_().setActiveSheet(sheet);
    sheet.setActiveRange(sheet.getRange(startRow, 1));
    ui.alert('Bloc créé', meetingId + '\nLignes ' + startRow + ' à ' + (startRow + leftRows.length - 1) + '\nAucune colonne AUTO modifiée.', ui.ButtonSet.OK);
    return { ok: true, meetingId: meetingId, startRow: startRow, rowCount: leftRows.length };
  } finally {
    lock.releaseLock();
  }
}

function FELIBREE_integrateMeetingMissingRecords() {
  var ui = SpreadsheetApp.getUi();
  var missing = FBR_MEETING_collectMissingRecords_();
  if (!missing.decisions.length && !missing.actions.length) {
    ui.alert('Intégration', 'Aucune Décision ni Action manquante.', ui.ButtonSet.OK);
    return { ok: true, decisionsCreated: 0, actionsCreated: 0 };
  }
  var confirm = ui.alert(
    'Créer les enregistrements manquants ?',
    missing.decisions.length + ' décision(s) et ' + missing.actions.length + ' action(s) seront créées uniquement dans les colonnes MANUEL.\n\nAucune formule AUTO ne sera écrasée.',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return { ok: false, cancelled: true };

  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) throw new Error('Le document est occupé. Réessayer dans quelques secondes.');
  try {
    // Recalcul sous verrou pour éviter les doubles créations.
    missing = FBR_MEETING_collectMissingRecords_();
    var decisionSheet = FBR_MEETING_sheet_(FBR_MEETING_V100.DECISION_SHEET);
    var actionSheet = FBR_MEETING_sheet_(FBR_MEETING_V100.ACTION_SHEET);
    var decisionRows = FBR_MEETING_findFreeRows_(decisionSheet, 160, 1, 12, 14, 6, missing.decisions.length);
    var actionRows = FBR_MEETING_findFreeRows_(actionSheet, 200, 1, 11, 13, 5, missing.actions.length);
    missing.decisions.forEach(function (record, index) {
      FBR_MEETING_writeDecision_(decisionSheet, decisionRows[index], record);
    });
    missing.actions.forEach(function (record, index) {
      FBR_MEETING_writeAction_(actionSheet, actionRows[index], record);
    });
    SpreadsheetApp.flush();
    ui.alert('Intégration terminée', missing.decisions.length + ' décision(s) et ' + missing.actions.length + ' action(s) créées.\nColonnes AUTO intactes.', ui.ButtonSet.OK);
    return { ok: true, decisionsCreated: missing.decisions.length, actionsCreated: missing.actions.length };
  } finally {
    lock.releaseLock();
  }
}

function FELIBREE_auditMeetingArchitecture() {
  return FBR_MEETING_showAudit_(FBR_MEETING_audit_());
}

function FELIBREE_secureMeetingAutoColumns() {
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    'Sécuriser les colonnes AUTO ?',
    'Cette action colore les colonnes MANUEL en jaune, les colonnes AUTO en bleu et protège strictement uniquement les plages AUTO validées.\n\nAucune donnée ni formule ne sera modifiée.',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return { ok: false, cancelled: true };

  var specs = [
    { sheet: FBR_MEETING_V100.MEETING_SHEET, manual: ['A5:M180', 'O5:T180'], auto: ['N5:N180', 'U5:Y180'] },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, manual: ['A5:L160', 'N5:S160'], auto: ['M5:M160', 'T5:W160'] },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, manual: ['A5:K200', 'M5:Q200'], auto: ['L5:L200', 'R5:R200'] },
    { sheet: FBR_MEETING_V100.READINESS_SHEET, manual: ['A5:D160', 'F5:F160', 'L5:L160'], auto: ['E5:E160', 'G5:K160', 'M5:P160'] }
  ];
  var protectedRanges = [];
  specs.forEach(function (spec) {
    var sheet = FBR_MEETING_sheet_(spec.sheet);
    spec.manual.forEach(function (a1) {
      sheet.getRange(a1).setBackground(FBR_MEETING_V100.MANUAL_FILL).setFontStyle('normal');
    });
    spec.auto.forEach(function (a1) {
      sheet.getRange(a1).setBackground(FBR_MEETING_V100.AUTO_FILL).setFontStyle('italic');
      FBR_MEETING_secureRange_(sheet, a1);
      protectedRanges.push(spec.sheet + '!' + a1);
    });
  });
  SpreadsheetApp.flush();
  ui.alert('Sécurisation terminée', protectedRanges.length + ' plages AUTO protégées. Aucune donnée ni formule modifiée.', ui.ButtonSet.OK);
  return { ok: true, protectedRanges: protectedRanges };
}
