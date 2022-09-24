export enum ILocationType {
  TOWN,

}

export const LOCATIONS = [
  {
    type: ILocationType.TOWN,
    zoomLevel: 1,
    items: [
      { x: 1000, y: 1000, name: 'Some Town 1'},
      { x: 1110, y: 1050, name: 'Some Town 2'},
      { x: 1055.5, y: 968.6, name: 'The Temple'}
    ]
  }
]
