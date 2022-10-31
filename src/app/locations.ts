export enum ELocationType {
  CITY,
  TOWN,
  FORT,
  TELVANNI_TOWER,
  VILLAGE,
  CAMP,
  STRONGHOLD,
  HOUSE,
}

export interface ILocation {
  type: ELocationType;
  src: string;
  zoomLocs: IZoomLocation[];
}

export interface IZoomLocation {
  locItems: ILocItem[];
  minZoom?: number;
  maxZoom?: number;
}

export interface ILocItem {
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
          { x: 1298.8, y: 1391.6, name: 'Suran'},
          { x: 315, y: 557.7, name: 'Raven Rock'},
        ],
      }, {
        minZoom: 1,
        maxZoom: 5,
        locItems: [
          { x: 1102.1, y: 1403.5, name: 'Pelagiad'},
          { x: 1144.8, y: 1582.0, name: 'Ebonheart'},
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
          { x: 746.7, y: 683.7, name: 'Ald Velothi'},
        ],
      }, {
        minZoom: 4,
        locItems: [
          { x: 1461.7, y: 729.9, name: 'Vos'},
        ],
      }, {
        minZoom: 6,
        locItems: [
          { x: 1093.3, y: 1400.0, name: 'Pelagiad'},
        ],
      },
    ]
  }, {
    type: ELocationType.FORT,
    src: 'assets/icons/MW-icon-map-Fort.webp',
    zoomLocs: [
      {
        minZoom: 1,
        locItems: [
          { x: 842.6, y: 1522.7, name: 'Firemoth'},
          { x: 406.0, y: 626.3, name: 'Frostmoth'},
        ],
      }, {
        minZoom: 2,
        locItems: [
          { x: 1034.7, y: 1017.1, name: 'Buckmoth'},
        ],
      }, {
        minZoom: 3,
        locItems: [
          { x: 1671.0, y: 1072.0, name: 'Wolverine'},
          { x: 1069.6, y: 1255.4, name: 'Moonmoth'},
        ],
      }, {
        minZoom: 5,
        locItems: [
          { x: 776.0, y: 831.1, name: 'Fort Darius'},
        ],
      },{
        minZoom: 6,
        locItems: [
          { x: 1109.9, y: 1403.4, name: 'Pelagiad'},
          { x: 1145.2, y: 1577.3, name: 'Hawkmoth'},
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
        minZoom: 2,
        locItems: [
          { x: 1425.1, y: 721.6, name: 'Tel Vos'},
        ],
      }, {
        minZoom: 3,
        locItems: [
          { x: 1670.9, y: 1043.3, name: 'Tel Naga'},
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
      }, {
        minZoom: 5,
        maxZoom: 9,
        locItems: [
          { x: 1225.5, y: 554.1, name: 'Aharasaplit'},
          { x: 745.2, y: 719.6, name: 'Aidanat'},
          { x: 1524.3, y: 999.2, name: 'Ashamanu'},
          { x: 1426.0, y: 935.5, name: 'Elanius'},
          { x: 1520.5, y: 1467.7, name: 'Kaushtababi'},
          { x: 1142.6, y: 713.0, name: 'Mamshar-Disamus'},
          { x: 1514.7, y: 909.0, name: 'Massahanud'},
          { x: 918.6, y: 842.5, name: 'Mila-Nipal'},
          { x: 1494.1, y: 823.0, name: 'Salit'},
          { x: 817.7, y: 694.9, name: 'Shashmanu'},
          { x: 1419.3, y: 1199.0, name: 'Shashurari'},
          { x: 1511.9, y: 1084.6, name: 'Bensiberib'},
          { x: 1539.9, y: 1145.9, name: 'Sobitbael'},
          { x: 1427.1, y: 788.2, name: 'Yakaridan'},
        ],
      },
    ]
  }, {
    type: ELocationType.HOUSE,
    src: 'assets/icons/MW-icon-map-House.webp',
    zoomLocs: [
      {
        minZoom: 10,
        locItems: [
          { x: 1225.5, y: 554.1, name: 'Zallay'},
          { x: 745.2, y: 719.6, name: 'Abassel'},
          { x: 1524.3, y: 999.2, name: 'Kausha'},
          { x: 1426.0, y: 935.5, name: 'Yapal'},
          { x: 1520.5, y: 1467.7, name: 'Adibael'},
          { x: 1142.6, y: 713.0, name: 'Maesat'},
          { x: 1514.7, y: 909.0, name: 'Sargon'},
          { x: 918.6, y: 842.5, name: 'Manat'},
          { x: 1492.3, y: 822.1, name: 'Zalit'},
          { x: 1496.0, y: 821.9, name: 'Zelay'},
          { x: 817.7, y: 694.9, name: 'Anit'},
          { x: 1419.3, y: 1199.0, name: 'Zennammu'},
          { x: 1511.9, y: 1084.6, name: 'Odaishah Yasalmibaal'},
          { x: 1539.9, y: 1145.9, name: 'Mal'},
          { x: 1427.1, y: 788.2, name: 'Kitbael'},
        ],
      },
    ]
  }, {
    type: ELocationType.STRONGHOLD,
    src: 'assets/icons/MW-icon-map-Dunmer_Stronghold.webp',
    zoomLocs: [
      {
        minZoom: 2,
        locItems: [
          { x: 821.3, y: 1001.9, name: 'Andasreth'},
          { x: 783.9, y: 884.1, name: 'Berandas'},
          { x: 1040.2, y: 691.2, name: 'Falasmaryon'},
          { x: 1388.6, y: 978.0, name: 'Falensarano'},
          { x: 912.6, y: 1198.7, name: 'Hlormaren'},
          { x: 1554.9, y: 882.3, name: 'Indoranyon'},
          { x: 1105.2, y: 713.8, name: 'Kogoruhn'},
          { x: 1229.4, y: 1267.4, name: 'Marandus'},
          { x: 1297.3, y: 586.2, name: 'Rotheran'},
          { x: 1387.5, y: 1395.5, name: 'Telasero'},
          { x: 1073.3, y: 587.4, name: 'Valenvaryon'},
        ],
      },
    ]
  },
]
