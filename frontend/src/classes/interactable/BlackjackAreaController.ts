import {
  Card,
  CasinoScore,
  CasinoState,
  PlayerHand,
} from '../../../../shared/types/CoveyTownSocket';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export type BlackjackEvents = GameEventTypes & {
  playerHandChanged: (hands: PlayerHand[]) => void;
  dealerHandChanged: (cards: Card[]) => void;
  playerChanged: (player: number) => void;
  currencyChanged: (newUnits: CasinoScore) => void;
};

export default class BlackjackAreaController extends GameAreaController<
  CasinoState,
  BlackjackEvents
> {
  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }
}
