export type DownloadableAsset = {
  name: string;
  href: string;
  size: number;
};

export type DownloadItem = {
  model: string;
  countyname: string;
  scenario: string;
  vars: DownloadableAsset[];
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
