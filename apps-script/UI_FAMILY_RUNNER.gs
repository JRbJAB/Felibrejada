/**
 * FBR_UI_FAMILY_RUNNER_20260711_v0_1.gs
 * Safe public runner for UI families.
 * No menu by itself. Can be executed from Apps Script function selector.
 */

function FBR_UI_FAMILY_applyAllV01() {
  var out = [];
  if (typeof FBR_UI_FAMILY_applyCoreFusionV01 === 'function') out.push(FBR_UI_FAMILY_applyCoreFusionV01());
  if (typeof FBR_UI_FAMILY_applyContentsComV01 === 'function') out.push(FBR_UI_FAMILY_applyContentsComV01());
  if (typeof FBR_UI_FAMILY_applyGovernanceAdminV01 === 'function') out.push(FBR_UI_FAMILY_applyGovernanceAdminV01());
  if (typeof FBR_UI_FAMILY_applyTechniqueV01 === 'function') out.push(FBR_UI_FAMILY_applyTechniqueV01());
  return {
    ok: true,
    version: FBR_UIF_VERSION,
    label: 'ALL_UI_FAMILIES_V01',
    timestamp: FBR_UIF_now_(),
    families: out
  };
}

function FBR_UI_FAMILY_applyAll() {
  return FBR_UI_FAMILY_applyAllV01();
}

function FBR_UI_FAMILY_countApplied_(result) {
  if (!result) return 0;
  if (result.families && result.families.length) {
    var total = 0;
    for (var i = 0; i < result.families.length; i++) {
      total += Number(result.families[i] && result.families[i].appliedCount || 0);
    }
    return total;
  }
  return Number(result.appliedCount || 0);
}

function FBR_UI_FAMILY_countReviewed_(result) {
  if (!result) return 0;
  if (result.families && result.families.length) {
    var total = 0;
    for (var i = 0; i < result.families.length; i++) {
      var family = result.families[i] || {};
      total += Number(family.appliedCount || 0) +
        Number(family.missingCount || 0) +
        Number(family.failedCount || 0);
    }
    return total;
  }
  return Number(result.appliedCount || 0) +
    Number(result.missingCount || 0) +
    Number(result.failedCount || 0);
}

function FELIBREE_applyUiFamiliesAll() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyUiFamiliesAll',
    mode: 'APPLY_UI',
    sheetName: 'MULTI_SHEETS_UI',
    logStart: true,
    rowsRead: FBR_UI_FAMILY_countReviewed_,
    rowsChanged: FBR_UI_FAMILY_countApplied_,
    successMessage: function (result) {
      return 'Familles UI globales : appliquées=' + FBR_UI_FAMILY_countApplied_(result) +
        ', contrôlées=' + FBR_UI_FAMILY_countReviewed_(result) + '.';
    }
  }, function () {
    return FBR_UI_FAMILY_applyAllV01();
  });
}

function FELIBREE_applyUiFamilyCoreFusion() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyUiFamilyCoreFusion',
    mode: 'APPLY_UI',
    sheetName: 'MULTI_SHEETS_UI',
    logStart: true,
    rowsRead: FBR_UI_FAMILY_countReviewed_,
    rowsChanged: FBR_UI_FAMILY_countApplied_
  }, function () {
    return FBR_UI_FAMILY_applyCoreFusionV01();
  });
}

function FELIBREE_applyUiFamilyContentsCom() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyUiFamilyContentsCom',
    mode: 'APPLY_UI',
    sheetName: 'MULTI_SHEETS_UI',
    logStart: true,
    rowsRead: FBR_UI_FAMILY_countReviewed_,
    rowsChanged: FBR_UI_FAMILY_countApplied_
  }, function () {
    return FBR_UI_FAMILY_applyContentsComV01();
  });
}

function FELIBREE_applyUiFamilyGovernanceAdmin() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyUiFamilyGovernanceAdmin',
    mode: 'APPLY_UI',
    sheetName: 'MULTI_SHEETS_UI',
    logStart: true,
    rowsRead: FBR_UI_FAMILY_countReviewed_,
    rowsChanged: FBR_UI_FAMILY_countApplied_
  }, function () {
    return FBR_UI_FAMILY_applyGovernanceAdminV01();
  });
}

function FELIBREE_applyUiFamilyTechnique() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_applyUiFamilyTechnique',
    mode: 'APPLY_UI',
    sheetName: 'MULTI_SHEETS_UI',
    logStart: true,
    rowsRead: FBR_UI_FAMILY_countReviewed_,
    rowsChanged: FBR_UI_FAMILY_countApplied_
  }, function () {
    return FBR_UI_FAMILY_applyTechniqueV01();
  });
}

function FELIBREE_uiFamiliesDiagnostic() {
  return FBR_runLoggedAction_({
    functionName: 'FELIBREE_uiFamiliesDiagnostic',
    mode: 'DIAGNOSTIC',
    sheetName: 'MULTI_SHEETS_UI',
    rowsRead: 4,
    rowsChanged: 0,
    successMessage: 'Diagnostic des quatre familles UI exécuté.'
  }, function () {
    return {
      ok: true,
      version: FBR_UIF_VERSION,
      hasCoreFusion: typeof FBR_UI_FAMILY_applyCoreFusionV01 === 'function',
      hasContentsCom: typeof FBR_UI_FAMILY_applyContentsComV01 === 'function',
      hasGovernanceAdmin: typeof FBR_UI_FAMILY_applyGovernanceAdminV01 === 'function',
      hasTechnique: typeof FBR_UI_FAMILY_applyTechniqueV01 === 'function',
      noOnOpen: true,
      noDoGet: true,
      noMenuMaster: true,
      noExternalApi: true
    };
  });
}
