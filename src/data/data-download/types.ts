export type apiParamStrs = {
  countyQueryStr: string;
  scenariosQueryStr: string;
  modelQueryStr: string;
  freqQueryStr: string;
};

export type varUrl = {
  name: string;
  href: string;
  size: number;
};

export type modelVarUrls = {
  model: string;
  countyname: string;
  scenario: string;
  vars: varUrl[];
};

export interface DataPackage {
  id: number;
  name: string;
  dataset: string;
  scenarios: string;
  models: string;
  vars: string;
  boundaryType: string;
  frequency: string;
  dataFormat: string;
  rangeStart: string;
  rangeEnd: string;
  units: string;
  disabled: boolean;
}

export type PackagesData = DataPackage[];
