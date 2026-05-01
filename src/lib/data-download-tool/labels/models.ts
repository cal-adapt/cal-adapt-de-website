/** Canonical display casings for CMIP6 `source_id` values. */
const CMIP6_MODEL_LABELS: Readonly<Record<string, string>> = {
  "access-cm2": "ACCESS-CM2",
  "cesm2-lens": "CESM2-LENS",
  "cnrm-esm2-1": "CNRM-ESM2-1",
  "ec-earth3": "EC-Earth3",
  "ec-earth3-veg": "EC-Earth3-Veg",
  "fgoals-g3": "FGOALS-g3",
  "gfdl-esm4": "GFDL-ESM4",
  "hadgem3-gc31-ll": "HadGEM3-GC31-LL",
  "inm-cm5-0": "INM-CM5-0",
  "ipsl-cm6a-lr": "IPSL-CM6A-LR",
  "kace-1-0-g": "KACE-1-0-G",
  miroc6: "MIROC6",
  "mpi-esm1-2-hr": "MPI-ESM1-2-HR",
  "mri-esm2-0": "MRI-ESM2-0",
  taiesm1: "TaiESM1",
};

export function labelCmip6Model(id: string): string {
  return CMIP6_MODEL_LABELS[id.toLowerCase()] ?? id;
}
