/**
 * 34_MeetingDecisionActionSync.gs
 * Architecture fusionnée Réunions / Registre maître / PV / Décisions / Actions.
 * Base source : dernier miroir CLASP/GitHub 1b22a2b5 — commit 6d602cd43b9c769124902a7a7ccb20bf8a51442d.
 *
 * Règles de sécurité :
 * - aucun onOpen ; le menu reste dans 03_Menu_UI.gs ;
 * - aucune modification de 00_Code.gs ;
 * - aucune réécriture des formules AUTO existantes ;
 * - créations limitées aux colonnes MANUEL ;
 * - audit lecture seule ;
 * - protections appliquées uniquement sur demande explicite ;
 * - le choix multiple des types est fusionné ici ; aucun fichier 35 séparé.
 */
var FBR_MEETING_V100 = {
  VERSION: 'v1.1.0-fused-1b22a2b5-20260714',
  TRACE: 'MEETING_REGISTRY_FUSED_V110_1B22A2B5_20260714',
  REGISTRY_SHEET: '📅 Réunions',
  MEETING_SHEET: '📌 Réunions & PV',
  DECISION_SHEET: '🗳️ Décisions',
  ACTION_SHEET: '⚡ Actions',
  READINESS_SHEET: '✅ Readiness',
  HEADER_ROW: 4,
  FIRST_DATA_ROW: 5,
  REGISTRY_LAST_ROW: 200,
  MEETING_LAST_ROW: 180,
  DECISION_LAST_ROW: 160,
  ACTION_LAST_ROW: 200,
  MEETING_BLOCK_SIZE: 12,
  MANUAL_FILL: '#FFF4CC',
  AUTO_FILL: '#E6F2FF',
  PROTECTION_PREFIX: 'AUTO — RÉUNIONS V1.1.0',
  TYPE_COLUMN: 2,
  TYPE_SEPARATOR: ' / ',
  TYPE_EDIT_HANDLER: 'FELIBREE_MEETING_TYPES_onEdit',
  ALLOWED_TYPES: [
    'Réunion de bureau',
    'Réunion de pilotage',
    'Commission communication',
    'Commission bénévoles',
    'Commission décoration',
    'Commission finances',
    'Réunion partenaires',
    'Réunion technique',
    'Assemblée générale',
    'Point opérationnel',
    'Autre'
  ]
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

function FBR_MEETING_parseTime_(text, required) {
  var value = FBR_MEETING_trim_(text);
  if (!value) {
    if (required) throw new Error('Heure de début obligatoire : utiliser HH:MM.');
    return null;
  }
  var match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Heure invalide « ' + value + ' » : utiliser HH:MM.');
  var hour = Number(match[1]);
  var minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Heure civile invalide « ' + value + ' ».');
  }
  return {
    value: new Date(1899, 11, 30, hour, minute, 0, 0),
    text: FBR_MEETING_pad_(hour, 2) + ':' + FBR_MEETING_pad_(minute, 2)
  };
}

function FBR_MEETING_splitTypes_(value) {
  var raw = FBR_MEETING_trim_(value);
  if (!raw) return [];
  var seen = {};
  var out = [];
  raw.split(/\s*\/\s*/).forEach(function (part) {
    var typeValue = FBR_MEETING_trim_(part);
    if (typeValue && !seen[typeValue]) {
      seen[typeValue] = true;
      out.push(typeValue);
    }
  });
  return out;
}

function FBR_MEETING_normalizeTypes_(value, required) {
  var types = FBR_MEETING_splitTypes_(value);
  if (required && !types.length) throw new Error('Au moins un type de réunion est obligatoire.');
  var invalid = types.filter(function (typeValue) {
    return FBR_MEETING_V100.ALLOWED_TYPES.indexOf(typeValue) < 0;
  });
  if (invalid.length) {
    throw new Error('Type(s) hors liste : ' + invalid.join(', ') + '.');
  }
  return types.join(FBR_MEETING_V100.TYPE_SEPARATOR);
}

function FBR_MEETING_findFreeRegistryRow_(sheet) {
  var first = FBR_MEETING_V100.FIRST_DATA_ROW;
  var count = FBR_MEETING_V100.REGISTRY_LAST_ROW - first + 1;
  var values = sheet.getRange(first, 1, count, 12).getDisplayValues();
  for (var i = 0; i < values.length; i++) {
    var blank = true;
    for (var j = 0; j < values[i].length; j++) {
      if (!FBR_MEETING_isBlank_(values[i][j])) { blank = false; break; }
    }
    if (blank) return first + i;
  }
  throw new Error('Aucune ligne MANUEL vide disponible dans ' + FBR_MEETING_V100.REGISTRY_SHEET + '.');
}

function FBR_MEETING_registryMap_(sheet) {
  var values = sheet.getRange(
    FBR_MEETING_V100.FIRST_DATA_ROW,
    1,
    FBR_MEETING_V100.REGISTRY_LAST_ROW - FBR_MEETING_V100.FIRST_DATA_ROW + 1,
    12
  ).getDisplayValues();
  var map = {};
  values.forEach(function (row, index) {
    var id = FBR_MEETING_trim_(row[0]);
    if (!id) return;
    map[id] = {
      row: FBR_MEETING_V100.FIRST_DATA_ROW + index,
      types: FBR_MEETING_trim_(row[1]),
      title: FBR_MEETING_trim_(row[2]),
      date: FBR_MEETING_trim_(row[3]),
      start: FBR_MEETING_trim_(row[4]),
      end: FBR_MEETING_trim_(row[5]),
      place: FBR_MEETING_trim_(row[6]),
      organizer: FBR_MEETING_trim_(row[7]),
      status: FBR_MEETING_trim_(row[8])
    };
  });
  return map;
}

function FBR_MEETING_writeRegistryRow_(sheet, row, data) {
  sheet.getRange(row, 1, 1, 12).setValues([[
    data.meetingId,
    data.types,
    data.title,
    data.date,
    data.startTime.value,
    data.endTime ? data.endTime.value : '',
    data.place || 'À compléter',
    data.organizer || 'À compléter',
    data.status || 'Planifiée',
    data.participants || 'À compléter',
    data.pvReference || '',
    'Créé par ' + FBR_MEETING_V100.TRACE
  ]]);
  sheet.getRange(row, 4).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(row, 5, 1, 2).setNumberFormat('hh:mm');
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
    'P1 haute',                             // H Priorité
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
  var target = sheet.getRange(a1);
  var targetFirstRow = target.getRow();
  var targetLastRow = targetFirstRow + target.getNumRows() - 1;
  var targetFirstCol = target.getColumn();
  var targetLastCol = targetFirstCol + target.getNumColumns() - 1;
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    var protectedRange = protections[i].getRange();
    var protectedLastRow = protectedRange.getRow() + protectedRange.getNumRows() - 1;
    var protectedLastCol = protectedRange.getColumn() + protectedRange.getNumColumns() - 1;
    if (
      protectedRange.getSheet().getSheetId() === sheet.getSheetId() &&
      protectedRange.getRow() <= targetFirstRow && protectedLastRow >= targetLastRow &&
      protectedRange.getColumn() <= targetFirstCol && protectedLastCol >= targetLastCol
    ) {
      return protections[i];
    }
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
  return expectedRanges.map(function (a1) {
    var protection = FBR_MEETING_protectionForExactRange_(sheet, a1);
    return {
      range: a1,
      ok: !!protection && !protection.isWarningOnly(),
      warningOnly: protection ? protection.isWarningOnly() : null,
      coveringRange: protection ? protection.getRange().getA1Notation() : ''
    };
  });
}

function FBR_MEETING_expectedHeaders_() {
  return [
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'A4', expected: 'Meeting_ID — MANUEL' },
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'B4', expected: 'Type(s) de réunion — MANUEL MULTI' },
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'C4', expected: 'Intitulé — MANUEL' },
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'D4', expected: 'Date — MANUEL' },
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'E4', expected: 'Heure début — MANUEL' },
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'M4', expected: 'Decision_ID(s) — AUTO' },
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, cell: 'Q4', expected: 'Contrôle métadonnées — AUTO' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'A4', expected: 'PV_ID — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'N4', expected: 'Propagation — AUTO' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'P4', expected: 'Decision_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'Q4', expected: 'Action_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'S4', expected: 'Meeting_ID — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'T4', expected: 'Date réunion — MANUEL' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'Z4', expected: 'Type(s) réunion — AUTO' },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, cell: 'AE4', expected: 'Statut réunion — AUTO' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'A4', expected: 'ID — MANUEL' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'M4', expected: 'Propagation — AUTO actions' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'R4', expected: 'Meeting_ID(s) source — MANUEL' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'S4', expected: 'Action_ID(s) source — MANUEL' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'X4', expected: 'Type(s) réunion — AUTO' },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, cell: 'AB4', expected: 'Réunion lisible — AUTO' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'A4', expected: 'ID' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'L4', expected: 'Retard ? — AUTO' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'P4', expected: 'Decision_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'Q4', expected: 'Meeting_ID(s) — MANUEL' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'R4', expected: 'Trace calculée — AUTO' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'S4', expected: 'Type(s) réunion — AUTO' },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, cell: 'W4', expected: 'Réunion lisible — AUTO' }
  ];
}

function FBR_MEETING_audit_() {
  var issues = [];
  var warnings = [];
  var infos = [];
  var requiredSheets = [
    FBR_MEETING_V100.REGISTRY_SHEET,
    FBR_MEETING_V100.MEETING_SHEET,
    FBR_MEETING_V100.DECISION_SHEET,
    FBR_MEETING_V100.ACTION_SHEET,
    FBR_MEETING_V100.READINESS_SHEET
  ];
  requiredSheets.forEach(function (name) {
    if (!FBR_MEETING_ss_().getSheetByName(name)) issues.push('Onglet absent : ' + name);
  });
  if (issues.length) return { ok: false, issues: issues, warnings: warnings, infos: infos };

  FBR_MEETING_expectedHeaders_().forEach(function (check) {
    var actual = FBR_MEETING_sheet_(check.sheet).getRange(check.cell).getDisplayValue();
    if (actual !== check.expected) {
      issues.push(check.sheet + '!' + check.cell + ' : en-tête inattendu « ' + actual + ' » au lieu de « ' + check.expected + ' ».');
    }
  });

  var registry = FBR_MEETING_sheet_(FBR_MEETING_V100.REGISTRY_SHEET);
  var meeting = FBR_MEETING_sheet_(FBR_MEETING_V100.MEETING_SHEET);
  var decisions = FBR_MEETING_sheet_(FBR_MEETING_V100.DECISION_SHEET);
  var actions = FBR_MEETING_sheet_(FBR_MEETING_V100.ACTION_SHEET);
  var readiness = FBR_MEETING_sheet_(FBR_MEETING_V100.READINESS_SHEET);

  var registryRows = registry.getRange('A5:L200').getDisplayValues();
  var registryIds = registryRows.map(function (row) { return [row[0]]; });
  var duplicateMeetingIds = FBR_MEETING_duplicateIds_(registryIds);
  if (duplicateMeetingIds.length) issues.push('Meeting_ID dupliqués dans le registre maître : ' + duplicateMeetingIds.join(', '));

  var registryMap = {};
  var meetingCount = 0;
  registryRows.forEach(function (row, index) {
    var rowNumber = FBR_MEETING_V100.FIRST_DATA_ROW + index;
    var meetingId = FBR_MEETING_trim_(row[0]);
    if (!meetingId) return;
    meetingCount++;
    registryMap[meetingId] = {
      date: FBR_MEETING_trim_(row[3]),
      types: FBR_MEETING_trim_(row[1]),
      title: FBR_MEETING_trim_(row[2]),
      start: FBR_MEETING_trim_(row[4])
    };
    if (!FBR_MEETING_trim_(row[1])) issues.push(FBR_MEETING_V100.REGISTRY_SHEET + '!B' + rowNumber + ' : type(s) manquant(s).');
    if (!FBR_MEETING_trim_(row[2])) issues.push(FBR_MEETING_V100.REGISTRY_SHEET + '!C' + rowNumber + ' : intitulé manquant.');
    if (!FBR_MEETING_trim_(row[3])) issues.push(FBR_MEETING_V100.REGISTRY_SHEET + '!D' + rowNumber + ' : date manquante.');
    if (!FBR_MEETING_trim_(row[4])) issues.push(FBR_MEETING_V100.REGISTRY_SHEET + '!E' + rowNumber + ' : heure de début manquante.');
    FBR_MEETING_splitTypes_(row[1]).forEach(function (typeValue) {
      if (FBR_MEETING_V100.ALLOWED_TYPES.indexOf(typeValue) < 0) {
        issues.push(FBR_MEETING_V100.REGISTRY_SHEET + '!B' + rowNumber + ' : type hors liste « ' + typeValue + ' ».');
      }
    });
  });

  var decisionIds = decisions.getRange('A5:A160').getDisplayValues();
  var actionIds = actions.getRange('A5:A200').getDisplayValues();
  var duplicateDecisionIds = FBR_MEETING_duplicateIds_(decisionIds);
  var duplicateActionIds = FBR_MEETING_duplicateIds_(actionIds);
  if (duplicateDecisionIds.length) issues.push('Decision_ID dupliqués : ' + duplicateDecisionIds.join(', '));
  if (duplicateActionIds.length) issues.push('Action_ID dupliqués : ' + duplicateActionIds.join(', '));

  var decisionMap = {};
  decisionIds.forEach(function (row) { var id = FBR_MEETING_trim_(row[0]); if (id) decisionMap[id] = true; });
  var actionMap = {};
  actionIds.forEach(function (row) { var id = FBR_MEETING_trim_(row[0]); if (id) actionMap[id] = true; });
  var missingDecisions = {};
  var missingActions = {};
  var missingMeetings = {};
  var dateMismatches = [];
  var meetingDates = {};

  meeting.getRange('P5:T180').getDisplayValues().forEach(function (row, index) {
    FBR_MEETING_splitIds_(row[0]).forEach(function (id) { if (!decisionMap[id]) missingDecisions[id] = true; });
    FBR_MEETING_splitIds_(row[1]).forEach(function (id) { if (!actionMap[id]) missingActions[id] = true; });
    var meetingId = FBR_MEETING_trim_(row[3]);
    var date = FBR_MEETING_trim_(row[4]);
    if (meetingId) {
      if (!registryMap[meetingId]) missingMeetings[meetingId] = true;
      if (!meetingDates[meetingId]) meetingDates[meetingId] = {};
      if (date) meetingDates[meetingId][date] = true;
      if (registryMap[meetingId] && date && registryMap[meetingId].date && date !== registryMap[meetingId].date) {
        dateMismatches.push(FBR_MEETING_V100.MEETING_SHEET + '!T' + (FBR_MEETING_V100.FIRST_DATA_ROW + index) + ' : ' + meetingId + ' → PV ' + date + ' / registre ' + registryMap[meetingId].date);
      }
    }
  });

  decisions.getRange('R5:R160').getDisplayValues().forEach(function (row) {
    FBR_MEETING_splitIds_(row[0]).forEach(function (id) { if (!registryMap[id]) missingMeetings[id] = true; });
  });
  actions.getRange('Q5:Q200').getDisplayValues().forEach(function (row) {
    FBR_MEETING_splitIds_(row[0]).forEach(function (id) { if (!registryMap[id]) missingMeetings[id] = true; });
  });

  var missingDecisionList = Object.keys(missingDecisions).sort();
  var missingActionList = Object.keys(missingActions).sort();
  var missingMeetingList = Object.keys(missingMeetings).sort();
  if (missingDecisionList.length) issues.push('Décisions référencées mais absentes : ' + missingDecisionList.join(', '));
  if (missingActionList.length) issues.push('Actions référencées mais absentes : ' + missingActionList.join(', '));
  if (missingMeetingList.length) issues.push('Meeting_ID référencés mais absents du registre maître : ' + missingMeetingList.join(', '));
  dateMismatches.forEach(function (message) { issues.push('Date incohérente : ' + message); });
  Object.keys(meetingDates).sort().forEach(function (meetingId) {
    var dates = Object.keys(meetingDates[meetingId]);
    if (dates.length > 1) issues.push('Meeting_ID associé à plusieurs dates dans le PV : ' + meetingId + ' → ' + dates.join(', '));
  });

  var manualFormulaCounts = [
    { sheet: registry, ranges: ['A5:L200'] },
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
    ['📅 Réunions', 'M5'], ['📅 Réunions', 'N5'], ['📅 Réunions', 'O5'], ['📅 Réunions', 'P5'], ['📅 Réunions', 'Q5'],
    ['📌 Réunions & PV', 'N5'], ['📌 Réunions & PV', 'U5'], ['📌 Réunions & PV', 'V5'],
    ['📌 Réunions & PV', 'W5'], ['📌 Réunions & PV', 'X5'], ['📌 Réunions & PV', 'Y5'],
    ['📌 Réunions & PV', 'Z5'], ['📌 Réunions & PV', 'AA5'], ['📌 Réunions & PV', 'AB5'],
    ['📌 Réunions & PV', 'AC5'], ['📌 Réunions & PV', 'AD5'], ['📌 Réunions & PV', 'AE5'],
    ['🗳️ Décisions', 'M5'], ['🗳️ Décisions', 'T5'], ['🗳️ Décisions', 'U5'],
    ['🗳️ Décisions', 'V5'], ['🗳️ Décisions', 'W5'], ['🗳️ Décisions', 'X5'],
    ['🗳️ Décisions', 'Y5'], ['🗳️ Décisions', 'Z5'], ['🗳️ Décisions', 'AA5'], ['🗳️ Décisions', 'AB5'],
    ['⚡ Actions', 'L5'], ['⚡ Actions', 'R5'], ['⚡ Actions', 'S5'], ['⚡ Actions', 'T5'],
    ['⚡ Actions', 'U5'], ['⚡ Actions', 'V5'], ['⚡ Actions', 'W5'],
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
    { sheet: registry, ranges: ['M5:Q200'] },
    { sheet: meeting, ranges: ['N5:N180', 'U5:Y180', 'Z5:AE180'] },
    { sheet: decisions, ranges: ['M5:M160', 'T5:W160', 'X5:AB160'] },
    { sheet: actions, ranges: ['L5:L200', 'R5:R200', 'S5:W200'] },
    { sheet: readiness, ranges: ['E5:E160', 'G5:K160', 'M5:P160'] }
  ];
  protectionSpecs.forEach(function (spec) {
    FBR_MEETING_protectionAudit_(spec.sheet, spec.ranges).forEach(function (result) {
      if (!result.ok) issues.push('Protection AUTO absente ou seulement en avertissement : ' + spec.sheet.getName() + '!' + result.range);
    });
  });

  var typeTriggers = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === FBR_MEETING_V100.TYPE_EDIT_HANDLER;
  });
  if (typeTriggers.length !== 1) issues.push('Déclencheur choix multiple : attendu 1, trouvé ' + typeTriggers.length + '.');

  infos.push('Version module : ' + FBR_MEETING_V100.VERSION);
  infos.push('Réunions : ' + meetingCount + ' ID maître ; Décisions : ' + Object.keys(decisionMap).length + ' ID ; Actions : ' + Object.keys(actionMap).length + ' ID.');
  infos.push('Références manquantes : ' + missingMeetingList.length + ' réunion(s), ' + missingDecisionList.length + ' décision(s), ' + missingActionList.length + ' action(s).');
  infos.push('Déclencheur choix multiple : ' + typeTriggers.length + '.');
  return { ok: issues.length === 0, issues: issues, warnings: warnings, infos: infos };
}

function FBR_MEETING_showAudit_(result) {
  var lines = [];
  lines.push(result.ok ? '✅ AUDIT OK' : '❌ AUDIT À CORRIGER');
  lines.push('Version : ' + FBR_MEETING_V100.VERSION);
  lines.push('');
  (result.infos || []).forEach(function (info) { lines.push('• ' + info); });
  if (result.warnings && result.warnings.length) {
    lines.push('');
    lines.push('Avertissements (' + result.warnings.length + ') :');
    result.warnings.slice(0, 25).forEach(function (warning) { lines.push('• ' + warning); });
  }
  if (result.issues && result.issues.length) {
    lines.push('');
    lines.push('Anomalies (' + result.issues.length + ') :');
    result.issues.slice(0, 25).forEach(function (issue) { lines.push('• ' + issue); });
    if (result.issues.length > 25) lines.push('• … ' + (result.issues.length - 25) + ' autre(s) anomalie(s).');
  }
  var message = lines.join('\n');
  console.log(message);
  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert('Réunions / Décisions / Actions', message, ui.ButtonSet.OK);
  } catch (uiError) {
    // Exécution depuis l’éditeur Apps Script : résultat retourné sans interface.
  }
  return result;
}

function FELIBREE_openMeetingRegistry() {
  var sheet = FBR_MEETING_sheet_(FBR_MEETING_V100.REGISTRY_SHEET);
  FBR_MEETING_ss_().setActiveSheet(sheet);
  sheet.activate();
  return { ok: true, sheet: sheet.getName() };
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
    'Créer une réunion + son bloc PV',
    'Saisir : AAAA-MM-JJ | HH:MM début | Type 1 / Type 2 | Intitulé | HH:MM fin (optionnel) | Lieu/format (optionnel) | Organisateur (optionnel)',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return { ok: false, cancelled: true };

  var parts = response.getResponseText().split('|').map(function (part) { return FBR_MEETING_trim_(part); });
  if (parts.length < 4) {
    throw new Error('Format incomplet. Minimum : AAAA-MM-JJ | HH:MM | Type(s) | Intitulé.');
  }
  var date = FBR_MEETING_parseDate_(parts[0]);
  var dateText = FBR_MEETING_formatDate_(date);
  var startTime = FBR_MEETING_parseTime_(parts[1], true);
  var types = FBR_MEETING_normalizeTypes_(parts[2], true);
  var title = parts[3] || 'Réunion ' + dateText;
  var endTime = FBR_MEETING_parseTime_(parts[4], false);
  if (endTime && endTime.value.getTime() < startTime.value.getTime()) {
    throw new Error('L’heure de fin ne peut pas être antérieure à l’heure de début.');
  }
  var place = parts[5] || 'À compléter';
  var organizer = parts[6] || 'À compléter';

  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) throw new Error('Le document est occupé. Réessayer dans quelques secondes.');
  try {
    var registrySheet = FBR_MEETING_sheet_(FBR_MEETING_V100.REGISTRY_SHEET);
    var pvSheet = FBR_MEETING_sheet_(FBR_MEETING_V100.MEETING_SHEET);
    var registryRow = FBR_MEETING_findFreeRegistryRow_(registrySheet);
    var startRow = FBR_MEETING_findContiguousMeetingRows_(pvSheet, FBR_MEETING_V100.MEETING_BLOCK_SIZE);
    var pvValues = pvSheet.getRange('A5:A180').getDisplayValues();
    var meetingValues = registrySheet.getRange('A5:A200').getDisplayValues().concat(pvSheet.getRange('S5:S180').getDisplayValues());
    var nextPv = FBR_MEETING_nextPvNumber_(pvValues);
    var meetingId = FBR_MEETING_nextMeetingId_(dateText, meetingValues);
    var firstPvId = 'PV-' + FBR_MEETING_pad_(nextPv, 3);
    var lastPvId = 'PV-' + FBR_MEETING_pad_(nextPv + FBR_MEETING_V100.MEETING_BLOCK_SIZE - 1, 3);

    var leftRows = [];
    var rightRows = [];
    for (var i = 0; i < FBR_MEETING_V100.MEETING_BLOCK_SIZE; i++) {
      var sequence = i === 0 ? 'Ouverture' : (i === FBR_MEETING_V100.MEETING_BLOCK_SIZE - 1 ? 'Clôture' : 'Point ' + FBR_MEETING_pad_(i + 1, 2));
      var pointTime = i === 0 ? startTime.text : (i === FBR_MEETING_V100.MEETING_BLOCK_SIZE - 1 && endTime ? endTime.text : '');
      leftRows.push([
        'PV-' + FBR_MEETING_pad_(nextPv + i, 3),
        pointTime,
        sequence,
        i === 0 ? title : '',
        '', '', '', '', '', '', '', '', ''
      ]);
      rightRows.push([
        '', '', '',
        'Créé par ' + FBR_MEETING_V100.TRACE,
        meetingId,
        date
      ]);
    }

    try {
      FBR_MEETING_writeRegistryRow_(registrySheet, registryRow, {
        meetingId: meetingId,
        types: types,
        title: title,
        date: date,
        startTime: startTime,
        endTime: endTime,
        place: place,
        organizer: organizer,
        status: 'Planifiée',
        participants: 'À compléter',
        pvReference: FBR_MEETING_V100.MEETING_SHEET + ' — ' + firstPvId + ' à ' + lastPvId
      });
      pvSheet.getRange(startRow, 1, leftRows.length, 13).setValues(leftRows);
      pvSheet.getRange(startRow, 15, rightRows.length, 6).setValues(rightRows);
      pvSheet.getRange(startRow, 20, rightRows.length, 1).setNumberFormat('yyyy-mm-dd');
      SpreadsheetApp.flush();
    } catch (writeError) {
      try { registrySheet.getRange(registryRow, 1, 1, 12).clearContent(); } catch (ignoreRegistryRollback) {}
      try { pvSheet.getRange(startRow, 1, leftRows.length, 13).clearContent(); } catch (ignorePvLeftRollback) {}
      try { pvSheet.getRange(startRow, 15, rightRows.length, 6).clearContent(); } catch (ignorePvRightRollback) {}
      throw writeError;
    }

    FBR_MEETING_ss_().setActiveSheet(registrySheet);
    registrySheet.setActiveRange(registrySheet.getRange(registryRow, 1));
    ui.alert(
      'Réunion créée',
      meetingId + '\nRegistre : ligne ' + registryRow + '\nPV : lignes ' + startRow + ' à ' + (startRow + leftRows.length - 1) + '\nTypes : ' + types + '\nAucune colonne AUTO modifiée.',
      ui.ButtonSet.OK
    );
    return { ok: true, meetingId: meetingId, registryRow: registryRow, startRow: startRow, rowCount: leftRows.length, types: types };
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
    { sheet: FBR_MEETING_V100.REGISTRY_SHEET, manual: ['A5:L200'], auto: ['M5:Q200'] },
    { sheet: FBR_MEETING_V100.MEETING_SHEET, manual: ['A5:M180', 'O5:T180'], auto: ['N5:N180', 'U5:Y180', 'Z5:AE180'] },
    { sheet: FBR_MEETING_V100.DECISION_SHEET, manual: ['A5:L160', 'N5:S160'], auto: ['M5:M160', 'T5:W160', 'X5:AB160'] },
    { sheet: FBR_MEETING_V100.ACTION_SHEET, manual: ['A5:K200', 'M5:Q200'], auto: ['L5:L200', 'R5:R200', 'S5:W200'] },
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

function FBR_MEETING_applyTypeValidation_() {
  var sheet = FBR_MEETING_sheet_(FBR_MEETING_V100.REGISTRY_SHEET);
  var rowCount = FBR_MEETING_V100.REGISTRY_LAST_ROW - FBR_MEETING_V100.FIRST_DATA_ROW + 1;
  var target = sheet.getRange(FBR_MEETING_V100.FIRST_DATA_ROW, FBR_MEETING_V100.TYPE_COLUMN, rowCount, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(FBR_MEETING_V100.ALLOWED_TYPES.slice(), true)
    .setAllowInvalid(true)
    .setHelpText('Choix multiple : sélectionner un type pour l’ajouter ; le sélectionner de nouveau pour le retirer.')
    .build();
  target.setDataValidation(rule);
  target.setNote('CHOIX MULTIPLE : sélectionner plusieurs fois dans la liste. Un type déjà présent sera retiré. Séparateur : « / ».');
  return { ok: true, sheet: sheet.getName(), range: target.getA1Notation(), allowedTypeCount: FBR_MEETING_V100.ALLOWED_TYPES.length };
}

function FBR_MEETING_installTypeTrigger_() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === FBR_MEETING_V100.TYPE_EDIT_HANDLER) {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });
  var created = ScriptApp.newTrigger(FBR_MEETING_V100.TYPE_EDIT_HANDLER)
    .forSpreadsheet(FBR_MEETING_ss_())
    .onEdit()
    .create();
  return { ok: true, handler: FBR_MEETING_V100.TYPE_EDIT_HANDLER, removedBeforeCreate: removed, triggerId: created.getUniqueId() };
}

function FELIBREE_MEETING_TYPES_onEdit(e) {
  if (!e || !e.range || typeof e.value === 'undefined') return;
  var range = e.range;
  if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;
  if (range.getSheet().getName() !== FBR_MEETING_V100.REGISTRY_SHEET) return;
  if (range.getRow() < FBR_MEETING_V100.FIRST_DATA_ROW || range.getRow() > FBR_MEETING_V100.REGISTRY_LAST_ROW) return;
  if (range.getColumn() !== FBR_MEETING_V100.TYPE_COLUMN) return;

  var selected = FBR_MEETING_trim_(e.value);
  if (FBR_MEETING_V100.ALLOWED_TYPES.indexOf(selected) < 0) return;
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) throw new Error('Sélection multiple occupée : réessayer dans quelques secondes.');
  try {
    var items = FBR_MEETING_splitTypes_(e.oldValue || '');
    var index = items.indexOf(selected);
    if (index >= 0) items.splice(index, 1); else items.push(selected);
    var unique = [];
    items.forEach(function (value) { if (unique.indexOf(value) < 0) unique.push(value); });
    range.setValue(unique.join(FBR_MEETING_V100.TYPE_SEPARATOR));
  } finally {
    lock.releaseLock();
  }
}

function FELIBREE_installMeetingRegistry() {
  var validation = FBR_MEETING_applyTypeValidation_();
  var trigger = FBR_MEETING_installTypeTrigger_();
  var audit = FBR_MEETING_audit_();
  var result = { ok: validation.ok && trigger.ok && audit.ok, version: FBR_MEETING_V100.VERSION, validation: validation, trigger: trigger, audit: audit };
  console.log(JSON.stringify(result, null, 2));
  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert(
      'Registre des réunions',
      (result.ok ? '✅ Installation et audit OK' : '⚠️ Installation faite, audit à corriger') + '\nVersion : ' + FBR_MEETING_V100.VERSION + '\nDéclencheur : ' + trigger.handler,
      ui.ButtonSet.OK
    );
  } catch (uiError) {}
  return result;
}

function FELIBREE_MEETING_TYPES_install() {
  return FELIBREE_installMeetingRegistry();
}

function FELIBREE_MEETING_TYPES_applyValidation() {
  var result = FBR_MEETING_applyTypeValidation_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function FELIBREE_MEETING_TYPES_installTrigger() {
  var result = FBR_MEETING_installTypeTrigger_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function FELIBREE_MEETING_TYPES_audit() {
  var result = FBR_MEETING_audit_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

