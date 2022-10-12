import { ILoc } from "./app.const";

export interface IQuest {
  name: string;
  path: ILoc[];
}

export const QUESTS: IQuest[] = [
  {
    name: 'Quest1',
    path: [
      { x: 1000, y: 1000 },
      { x: 1010, y: 1010 },
    ]
  },
  {
    name: 'Quest2',
    path: [
      { x: 1100, y: 1050 },
      { x: 1050, y: 1100 },
      { x: 1100, y: 1100 },
    ]
  }
]
