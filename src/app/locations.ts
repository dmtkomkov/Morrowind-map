export enum ELocationType {
  CITY,
  TOWN,
  FORT,
  TELVANNI_TOWER,
  VILLAGE,
  CAMP,
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
      }, {
        minZoom: 1,
        maxZoom: 2,
        locItems: [
          { x: 1671.6, y: 1050.3, name: 'Sadrith Mora'},
        ],
      },
    ],
  }, {
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
  }, {
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
  }, {
    type: ELocationType.TELVANNI_TOWER,
    src: 'assets/icons/MW-icon-map-Telvanni_Tower.webp',
    zoomLocs: [
      {
        minZoom: 1,
        locItems: [
          { x: 1579.7, y: 1002.1, name: 'Tel Arun'},
          { x: 1509.6, y: 720.4, name: 'Tel Mora'},
          { x: 1575.2, y: 1135.6, name: 'Tel Fyr'},
          { x: 1586.1, y: 1583.5, name: 'Tel Branora'},
        ],
      }, {
        minZoom: 3,
        locItems: [
          { x: 1670.9, y: 1043.3, name: 'Tel Naga'},
          { x: 1425.1, y: 721.6, name: 'Tel Vos'},
        ],
      },
    ]
  }, {
    type: ELocationType.VILLAGE,
    src: 'assets/icons/MW-icon-map-Village.webp',
    zoomLocs: [
      {
        minZoom: 1,
        locItems: [
          { x: 1045.0, y: 1461.9, name: 'Seyda Neen'},
          { x: 902.0, y: 1338.5, name: 'Hla Oad'},
          { x: 853.9, y: 1077.5, name: 'Gnaar Mok'},
          { x: 822.2, y: 634.9, name: 'Khuul'},
          { x: 1327.3, y: 472.5, name: 'Dagon Fel'},
          { x: 467.3, y: 358.3, name: 'Skaal'},
        ],
      }, {
        minZoom: 5,
        locItems: [
          { x: 1461.7, y: 729.9, name: 'Vos'},
        ],
      },
    ]
  }, {
    type: ELocationType.CAMP,
    src: 'assets/icons/MW-icon-map-Camp.webp',
    zoomLocs: [
      {
        minZoom: 1,
        locItems: [
          { x: 980.3, y: 596.4, name: 'Urshilaku'},
          { x: 1458.4, y: 658.2, name: 'Ahemmusa'},
          { x: 1390.1, y: 853.6, name: 'Zainab'},
          { x: 1518.4, y: 1199.7, name: 'Erabenimsun'},
        ],
      },
    ]
  },
]
