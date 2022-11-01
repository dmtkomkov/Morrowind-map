import { ILoc } from "./app.const";

export enum EQuestType {
  OTHER
}

export interface IQuestItem {
  name: string;
  path: ILoc[];
}

export interface IQuest {
  type: EQuestType;
  color: string;
  questItems: IQuestItem[];
}

export interface IQuestObject {
  name: string;
  questPath2D: Path2D;
}

export const QUESTS: IQuest[] = [
  {
    type: EQuestType.OTHER,
    color: 'white',
    questItems: [
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
  },

]
