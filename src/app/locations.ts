export enum ELocationType {
  CITY,
  TOWN,
  FORT,
  TELVANNI_TOWER
}

export type Icons = {
  [key in ELocationType]: HTMLImageElement;
}

export interface ILocation {
  type: ELocationType;
  src: string;
  zoomLocs: IZoomLocation[];
}

export interface IZoomLocation {
  locItems: ILocItems[];
  minZoom?: number;
  maxZoom?: number;
}

export interface ILocItems {
  x: number;
  y: number;
  name: string;
}

export const LOCATIONS: ILocation[] = [
  {
    type: ELocationType.CITY,
    src: 'assets/icons/MW-icon-map-City.webp',
    zoomLocs : [
      {
        minZoom: 1,
        locItems: [
          { x: 1216.2, y: 1536.1, name: 'Vivec'},
          { x: 1011.1, y: 1240.4, name: 'Balmora'},
          { x: 1040.7, y: 971.2, name: 'Ald\'ruhn'},
        ],
      },
      {
        minZoom: 1,
        maxZoom: 2,
        locItems: [
          { x: 1671.6, y: 1050.3, name: 'Sadrith Mora'},
        ],
      },
    ],
  },
  {
    type: ELocationType.TOWN,
    src: 'assets/icons/MW-icon-map-Town.webp',
    zoomLocs: [
      {
        minZoom: 1,
        locItems: [
          { x: 1044.5, y: 1105.4, name: 'Caldera'},
          { x: 752.8, y: 824.1, name: 'Gnisis'},
          { x: 1007.3, y: 781.3, name: 'Maar Gan'},
          { x: 1520.4, y: 1426.7, name: 'Molag Mar'},
          { x: 1093.3, y: 1400.0, name: 'Pelagiad'},
          { x: 1298.8, y: 1391.6, name: 'Suran'},
          { x: 315, y: 557.7, name: 'Raven Rock'},
        ],
      },
    ]
  },
  {
    type: ELocationType.FORT,
    src: 'assets/icons/MW-icon-map-Fort.webp',
    zoomLocs: [
      {
        minZoom: 3,
        locItems: [
          { x: 1671.0, y: 1072.0, name: 'Wolverine Hall'},
        ],
      },
    ]
  },
  {
    type: ELocationType.TELVANNI_TOWER,
    src: 'assets/icons/MW-icon-map-Telvanni_Tower.webp',
    zoomLocs: [
      {
        minZoom: 3,
        locItems: [
          { x: 1670.9, y: 1043.3, name: 'Tel Naga'},
        ],
      },
    ]
  }
]
