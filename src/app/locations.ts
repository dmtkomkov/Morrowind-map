export enum ILocationType {
  CITY,
  TOWN,
}

export type Icons = {
  [key in ILocationType]: HTMLImageElement;
}

export const LOCATIONS = [
  {
    type: ILocationType.CITY,
    zoomLevel: 1,
    items: [
      { x: 1216.2, y: 1536.1, name: 'Vivec'},
      { x: 1011.1, y: 1240.4, name: 'Balmora'},
      { x: 1040.7, y: 971.2, name: 'Ald\'ruhn'},
      { x: 1671.6, y: 1050.3, name: 'Sadrith Mora'},
    ]
  },
  {
    type: ILocationType.TOWN,
    zoomLevel: 1,
    items: [
      { x: 1044.5, y: 1105.4, name: 'Caldera'},
      { x: 752.8, y: 824.1, name: 'Gnisis'},
      { x: 1007.3, y: 781.3, name: 'Maar Gan'},
      { x: 1520.4, y: 1426.7, name: 'Molag Mar'},
      { x: 1093.3, y: 1400.0, name: 'Pelagiad'},
      { x: 1298.8, y: 1391.6, name: 'Suran'},
      { x: 315, y: 557.7, name: 'Raven Rock'},
    ]
  }
]
