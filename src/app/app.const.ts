import { ELocationType } from "./locations";

export interface ILoc {
  x: number,
  y: number;
}

export const ANIMATION_TIME = 200;

export const ZOOM_LEVEL_OFFSET = 4
export const MAX_ZOOM_LEVEL = 10;
export const MIN_ZOOM_LEVEL = 1;
export const ZOOM_FACTOR = 1.5;

export const DEFAULT_OFFSET = { x: 0, y: -120 };

export enum ELayerSize {
  LAYER_SIZE_2 = 2,
  LAYER_SIZE_4 = 4,
  LAYER_SIZE_8 = 8,
  LAYER_SIZE_16 = 16
}

export const DEFAULT_LAYERS = {
  [ELayerSize.LAYER_SIZE_2]: [],
  [ELayerSize.LAYER_SIZE_8]: [],
  [ELayerSize.LAYER_SIZE_4]: [],
  [ELayerSize.LAYER_SIZE_16]: [],
};

export const DEFAULT_ICONS = {
  [ELocationType.CITY]: new Image(),
  [ELocationType.TOWN]: new Image(),
  [ELocationType.FORT]: new Image(),
  [ELocationType.TELVANNI_TOWER]: new Image(),
  [ELocationType.VILLAGE]: new Image(),
  [ELocationType.CAMP]: new Image(),
  [ELocationType.STRONGHOLD]: new Image(),
  [ELocationType.HOUSE]: new Image(),
};
