import { ILoc } from "./app.const";

const MAGE_GUILD_BALMORA_COORD = { x: 1003, y: 1236 };

export enum EQuestType {
  OTHER,
  MAGIC_GUILD
}

export interface IQuestItem {
  name: string;
  giver: string | null;
  path: ILoc[];
}

export interface IQuest {
  type: EQuestType;
  color: string;
  questItems: IQuestItem[];
}

export interface IQuestObject {
  questItem: IQuestItem;
  questPath2D: Path2D;
}

export const QUESTS: IQuest[] = [
  {
    type: EQuestType.MAGIC_GUILD,
    color: '#1c20eb',
    questItems: [
      {
        name: 'Four Types of Mushrooms',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
          { x: 1056, y: 1452 },
        ]
      },
      {
        name: 'Fake Soul Gem',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
        ]
      },
      {
        name: 'Four Types of Flowers',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
          { x: 1110, y: 1310 }
        ]
      },
      {
        name: 'Ceramic Bowl',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
        ]
      },
      {
        name: 'Stolen Reports',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
        ]
      },
      {
        name: 'Staff of Magnus',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
          { x: 1462, y: 1325 },
        ]
      },
      {
        name: 'Warlock ring',
        giver: 'Ajira',
        path: [
          MAGE_GUILD_BALMORA_COORD,
          { x: 1423, y: 1555 }
        ]
      },
    ]
  },

]
