import { ILoc } from "./app.const";

export enum EQuestType {
  OTHER,
  MAGIC_GUILD
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
    type: EQuestType.MAGIC_GUILD,
    color: 'blue',
    questItems: [
      {
        name: 'Four Types of Mushrooms',
        path: [
          { x: 1000, y: 1250 },
          { x: 1042, y: 1438 },
        ]
      },
      {
        name: 'Stolen Reports',
        path: [
          { x: 1005, y: 1250 },
        ]
      }
    ]
  },

]
