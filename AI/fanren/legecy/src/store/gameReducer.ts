import { PlayerStats, Spell, FlyingSword, Pet, MapZone, Quest, GameItem, GardenSlot, Sect } from '../types/game';
import { INITIAL_SPELLS, INITIAL_FLYING_SWORDS, INITIAL_PETS, MAP_ZONES, INITIAL_QUESTS, INITIAL_INVENTORY, SECTS } from '../data/gameData';

export interface GameState {
  player: PlayerStats;
  spells: Spell[];
  flyingSwords: FlyingSword[];
  pets: Pet[];
  mapZones: MapZone[];
  currentMap: MapZone;
  quests: Quest[];
  inventory: GameItem[];
  garden: GardenSlot[];
  sects: Sect[];
}

export const initialGameState: GameState = {
  player: {
    name: '韩立',
    title: '修仙菜鸟',
    root: '天灵根',
    sectId: 'SECT001',
    sectName: '黄枫谷',
    realmId: 'REALM001',
    level: 1,
    hp: 200,
    maxHp: 200,
    mp: 100,
    maxMp: 100,
    exp: 0,
    maxExp: 100,
    divineSense: 1,
    atk: 35,
    def: 10,
    critRate: 0.15,
    critDamage: 1.8,
    moveSpeed: 3.5,
    qiRegen: 5,
    spiritStones: 200,
    demonCores: 5,
    greenVialLiquids: 3,
    age: 18,
    maxAge: 120,
    isBottleneck: false,
    tribulationProgress: 0,
    killCount: 0,
    equippedSwordElements: ['木'],
    selectedEffectFx: 'wind_blade_cyclone',
  },
  spells: INITIAL_SPELLS,
  flyingSwords: INITIAL_FLYING_SWORDS,
  pets: INITIAL_PETS,
  mapZones: MAP_ZONES,
  currentMap: MAP_ZONES[0],
  quests: INITIAL_QUESTS,
  inventory: INITIAL_INVENTORY,
  garden: [
    { id: 'g1', itemId: '', itemName: '', plantedAt: 0, lastHarvestedAt: 0 },
    { id: 'g2', itemId: '', itemName: '', plantedAt: 0, lastHarvestedAt: 0 },
    { id: 'g3', itemId: '', itemName: '', plantedAt: 0, lastHarvestedAt: 0 },
    { id: 'g4', itemId: '', itemName: '', plantedAt: 0, lastHarvestedAt: 0 },
  ],
  sects: SECTS,
};

export type GameAction =
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'UPDATE_PLAYER'; updater: (prev: PlayerStats) => PlayerStats }
  | { type: 'SET_PLAYER'; payload: PlayerStats }
  | { type: 'UPDATE_SPELLS'; updater: (prev: Spell[]) => Spell[] }
  | { type: 'SET_SPELLS'; payload: Spell[] }
  | { type: 'UPDATE_FLYING_SWORDS'; updater: (prev: FlyingSword[]) => FlyingSword[] }
  | { type: 'SET_FLYING_SWORDS'; payload: FlyingSword[] }
  | { type: 'UPDATE_PETS'; updater: (prev: Pet[]) => Pet[] }
  | { type: 'SET_PETS'; payload: Pet[] }
  | { type: 'UPDATE_MAP_ZONES'; updater: (prev: MapZone[]) => MapZone[] }
  | { type: 'SET_MAP_ZONES'; payload: MapZone[] }
  | { type: 'SET_CURRENT_MAP'; payload: MapZone }
  | { type: 'UPDATE_QUESTS'; updater: (prev: Quest[]) => Quest[] }
  | { type: 'SET_QUESTS'; payload: Quest[] }
  | { type: 'UPDATE_INVENTORY'; updater: (prev: GameItem[]) => GameItem[] }
  | { type: 'SET_INVENTORY'; payload: GameItem[] }
  | { type: 'UPDATE_GARDEN'; updater: (prev: GardenSlot[]) => GardenSlot[] }
  | { type: 'SET_GARDEN'; payload: GardenSlot[] }
  | { type: 'UPDATE_SECTS'; updater: (prev: Sect[]) => Sect[] }
  | { type: 'SET_SECTS'; payload: Sect[] }
  | { type: 'RESTART_GAME' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_PLAYER':
      return { ...state, player: action.updater(state.player) };
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'UPDATE_SPELLS':
      return { ...state, spells: action.updater(state.spells) };
    case 'SET_SPELLS':
      return { ...state, spells: action.payload };
    case 'UPDATE_FLYING_SWORDS':
      return { ...state, flyingSwords: action.updater(state.flyingSwords) };
    case 'SET_FLYING_SWORDS':
      return { ...state, flyingSwords: action.payload };
    case 'UPDATE_PETS':
      return { ...state, pets: action.updater(state.pets) };
    case 'SET_PETS':
      return { ...state, pets: action.payload };
    case 'UPDATE_MAP_ZONES':
      return { ...state, mapZones: action.updater(state.mapZones) };
    case 'SET_MAP_ZONES':
      return { ...state, mapZones: action.payload };
    case 'SET_CURRENT_MAP':
      return { ...state, currentMap: action.payload };
    case 'UPDATE_QUESTS':
      return { ...state, quests: action.updater(state.quests) };
    case 'SET_QUESTS':
      return { ...state, quests: action.payload };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: action.updater(state.inventory) };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'UPDATE_GARDEN':
      return { ...state, garden: action.updater(state.garden) };
    case 'SET_GARDEN':
      return { ...state, garden: action.payload };
    case 'UPDATE_SECTS':
      return { ...state, sects: action.updater(state.sects) };
    case 'SET_SECTS':
      return { ...state, sects: action.payload };
    case 'RESTART_GAME':
      return {
        ...initialGameState,
        player: {
          ...initialGameState.player,
          root: '四灵根',
          realmName: '练气期一层', // Keeping from the restart logic
        } as any,
      };
    default:
      return state;
  }
}
