/**
 * FBR_UI_FAMILY_COMMON_20260711_v0_1.gs
 * Helpers for UI-by-family formatting.
 * Scope: spreadsheet UI only. No onOpen, no doGet, no menu master, no external API, no triggers.
 */

var FBR_UIF_VERSION = 'UI_FAMILIES_20260711_v0_1';

function FBR_UIF_now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Paris', 'yyyy-MM-dd HH:mm:ss');
}

function FBR_UIF_ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function FBR_UIF_result_(label, rows) {
  var ok = 0;
  var missing = 0;
  var failed = 0;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i].ok) ok++;
    if (rows[i] && rows[i].missing) missing++;
    if (rows[i] && rows[i].error) failed++;
  }
  return {
    ok: failed === 0,
    version: FBR_UIF_VERSION,
    label: label,
    timestamp: FBR_UIF_now_(),
    appliedCount: ok,
    missingCount: missing,
    failedCount: failed,
    details: rows
  };
}

function FBR_UIF_safe_(label, fn) {
  try {
    var res = fn();
    if (!res) res = {};
    res.ok = res.ok !== false;
    res.label = label;
    return res;
  } catch (err) {
    return { ok: false, label: label, error: String(err && err.message ? err.message : err) };
  }
}

function FBR_UIF_hideSheets_(ss, names) {
  var rows = [];
  for (var i = 0; i < names.length; i++) {
    rows.push(FBR_UIF_safe_('hide:' + names[i], function(name) {
      return function() {
        var sh = ss.getSheetByName(name);
        if (!sh) return { ok: false, missing: true, sheet: name };
        sh.hideSheet();
        return { ok: true, sheet: name, hidden: true };
      };
    }(names[i])));
  }
  return rows;
}

function FBR_UIF_showSheets_(ss, names) {
  var rows = [];
  for (var i = 0; i < names.length; i++) {
    rows.push(FBR_UIF_safe_('show:' + names[i], function(name) {
      return function() {
        var sh = ss.getSheetByName(name);
        if (!sh) return { ok: false, missing: true, sheet: name };
        sh.showSheet();
        return { ok: true, sheet: name, hidden: false };
      };
    }(names[i])));
  }
  return rows;
}

function FBR_UIF_applyStandardTable_(ss, sheetName, opts) {
  return FBR_UIF_safe_('format:' + sheetName, function() {
    opts = opts || {};
    var sh = ss.getSheetByName(sheetName);
    if (!sh) return { ok: false, missing: true, sheet: sheetName };

    var cols = Math.min(opts.cols || sh.getMaxColumns(), sh.getMaxColumns());
    var rows = Math.min(opts.rows || sh.getMaxRows(), sh.getMaxRows());
    var headerRow = opts.headerRow || 4;
    var dataStart = headerRow + 1;

    sh.showSheet();
    sh.hideGridlines();
    sh.setFrozenRows(opts.frozenRows || headerRow);

    var titleBg = opts.titleBg || '#12385F';
    var headerBg = opts.headerBg || '#1B4E7A';
    var noteBg = opts.noteBg || '#EAF3F8';
    var noteFg = opts.noteFg || '#12385F';

    sh.getRange(1, 1, 1, cols)
      .setBackground(titleBg)
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontSize(opts.titleFontSize || 14)
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle')
      .setWrap(true);

    if (rows >= 2) {
      sh.getRange(2, 1, Math.min(2, rows - 1), cols)
        .setBackground(noteBg)
        .setFontColor(noteFg)
        .setFontWeight('bold')
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle')
        .setWrap(true);
    }

    if (rows >= headerRow) {
      sh.getRange(headerRow, 1, 1, cols)
        .setBackground(headerBg)
        .setFontColor('#FFFFFF')
        .setFontWeight('bold')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setWrap(true);
    }

    if (rows >= dataStart) {
      sh.getRange(dataStart, 1, rows - dataStart + 1, cols)
        .setFontFamily('Arial')
        .setFontSize(10)
        .setVerticalAlignment('middle')
        .setWrap(true);
    }

    sh.setRowHeight(1, opts.titleHeight || 34);
    if (rows >= 2) sh.setRowHeights(2, Math.min(2, rows - 1), opts.noteHeight || 34);
    if (rows >= headerRow) sh.setRowHeight(headerRow, opts.headerHeight || 46);
    if (rows >= dataStart) sh.setRowHeights(dataStart, rows - dataStart + 1, opts.dataHeight || 54);

    FBR_UIF_applyWidths_(sh, cols, opts);
    FBR_UIF_applySemanticColumns_(sh, headerRow, dataStart, rows, cols, opts);
    FBR_UIF_applyValidations_(sh, headerRow, dataStart, rows, cols, opts);
    FBR_UIF_applyFilter_(sh, headerRow, rows, cols);

    return { ok: true, sheet: sheetName, cols: cols, rows: rows };
  });
}

function FBR_UIF_applyWidths_(sh, cols, opts) {
  var defaultWidth = opts.defaultWidth || 145;
  sh.setColumnWidths(1, cols, defaultWidth);

  if (opts.widths && opts.widths.length) {
    for (var i = 0; i < opts.widths.length && i < cols; i++) {
      if (opts.widths[i]) sh.setColumnWidth(i + 1, opts.widths[i]);
    }
  }

  var headerRow = opts.headerRow || 4;
  var headers = sh.getRange(headerRow, 1, 1, cols).getDisplayValues()[0];
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toLowerCase();
    if (h.indexOf('synthèse') >= 0 || h.indexOf('action') >= 0 || h.indexOf('livrable') >= 0 || h.indexOf('risque') >= 0 || h.indexOf('notes') >= 0) {
      sh.setColumnWidth(c + 1, 260);
    }
    if (h.indexOf('id') >= 0 && c === 0) sh.setColumnWidth(c + 1, 90);
    if (h.indexOf('statut') >= 0 || h.indexOf('priorité') >= 0 || h.indexOf('budget') >= 0 || h.indexOf('coût') >= 0) sh.setColumnWidth(c + 1, 125);
    if (h.indexOf('responsable') >= 0 || h.indexOf('bureau') >= 0 || h.indexOf('owner') >= 0) sh.setColumnWidth(c + 1, 160);
  }
}

function FBR_UIF_applySemanticColumns_(sh, headerRow, dataStart, rows, cols, opts) {
  if (rows < dataStart) return;
  var headers = sh.getRange(headerRow, 1, 1, cols).getDisplayValues()[0];
  var dataRows = rows - dataStart + 1;
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toLowerCase();
    var rng = sh.getRange(dataStart, c + 1, dataRows, 1);
    if (c === 0 || h === 'id' || h.indexOf(' id') >= 0) {
      rng.setBackground('#EFF2F7').setFontColor('#283342').setFontWeight('bold').setHorizontalAlignment('center');
    } else if (h.indexOf('statut') >= 0 || h.indexOf('priorité') >= 0 || h.indexOf('readiness') >= 0) {
      rng.setBackground('#FFF2B7').setFontColor('#6B3A05').setFontWeight('bold').setHorizontalAlignment('center');
    } else if (h.indexOf('bureau') >= 0 || h.indexOf('responsable') >= 0 || h.indexOf('owner') >= 0 || h.indexOf('référent') >= 0) {
      rng.setBackground('#EAE8FC').setFontColor('#281660').setFontWeight('bold').setHorizontalAlignment('left');
    } else if (h.indexOf('propagation') >= 0 || h.indexOf('contrôle') >= 0 || h.indexOf('validation') >= 0) {
      rng.setBackground('#E7F8EE').setFontColor('#063B1A').setFontWeight('bold').setHorizontalAlignment('center');
    } else if (h.indexOf('budget') >= 0 || h.indexOf('coût') >= 0) {
      rng.setBackground('#E5F7E5').setFontColor('#0A4414').setFontWeight('bold').setHorizontalAlignment('center');
    }
  }
}

function FBR_UIF_applyValidations_(sh, headerRow, dataStart, rows, cols, opts) {
  if (rows < dataStart) return;
  var headers = sh.getRange(headerRow, 1, 1, cols).getDisplayValues()[0];
  var dataRows = rows - dataStart + 1;

  var lists = {
    status: opts.statusList || ['À faire', 'En cours', 'À valider', 'Validé', 'Terminé', 'Bloqué', 'Reporté'],
    decisionStatus: opts.decisionStatusList || ['Validé', 'Corrigé', 'Refusé', 'À valider', 'À arbitrer', 'Reporté'],
    priority: opts.priorityList || ['P0 critique', 'P1 haute', 'P2 normale', 'P3 optionnelle'],
    bureau: opts.bureauList || ['Étienne DUBUISSON', 'Chantal REY', 'Pascal DAUBIGNEY'],
    yesNo: opts.yesNoList || ['Oui', 'Non', 'Partiel', 'Non concerné'],
    retard: opts.retardList || ['Oui', 'Non', 'À vérifier']
  };

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toLowerCase();
    var list = null;
    if (h.indexOf('priorité') >= 0) list = lists.priority;
    else if (h.indexOf('bureau') >= 0) list = lists.bureau;
    else if (h.indexOf('propagation') >= 0 || h.indexOf('contrôle final') >= 0 || h.indexOf('décision requise') >= 0) list = lists.yesNo;
    else if (h.indexOf('retard') >= 0) list = lists.retard;
    else if (h.indexOf('statut décision') >= 0) list = lists.decisionStatus;
    else if (h.indexOf('statut') >= 0 || h.indexOf('readiness') >= 0) list = lists.status;

    if (list) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(list, true)
        .setAllowInvalid(false)
        .build();
      sh.getRange(dataStart, c + 1, dataRows, 1).setDataValidation(rule);
    }
  }
}

function FBR_UIF_applyFilter_(sh, headerRow, rows, cols) {
  try {
    if (sh.getFilter()) sh.getFilter().remove();
    if (rows >= headerRow && cols >= 1) {
      sh.getRange(headerRow, 1, rows - headerRow + 1, cols).createFilter();
    }
  } catch (err) {
    // Non-blocking UI convenience.
  }
}
