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

function FELIBREE_applyUiFamiliesAll() {
  return FBR_UI_FAMILY_applyAllV01();
}

function FELIBREE_applyUiFamilyCoreFusion() {
  return FBR_UI_FAMILY_applyCoreFusionV01();
}

function FELIBREE_applyUiFamilyContentsCom() {
  return FBR_UI_FAMILY_applyContentsComV01();
}

function FELIBREE_applyUiFamilyGovernanceAdmin() {
  return FBR_UI_FAMILY_applyGovernanceAdminV01();
}

function FELIBREE_applyUiFamilyTechnique() {
  return FBR_UI_FAMILY_applyTechniqueV01();
}

function FELIBREE_uiFamiliesDiagnostic() {
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
}
