import _ from 'lodash';
import {
  CasinoArea,
  GameState,
  InteractableID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  GAME_AREA_TYPE,
} from './InteractableAreaController';

export type GenericCasinoAreaController = CasinoAreaController<GameState, CasinoEventTypes>;

export type CasinoEventTypes = BaseInteractableEventMap & {
  casinoStart: () => void;
  casinoUpdated: () => void;
  casinoEnd: () => void;
  playersChange: (newPlayers: PlayerController[]) => void;
};

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in casino';

export const NO_GAME_IN_PROGRESS_ERROR = 'No casino in progress';

export const NO_GAME_STARTABLE = 'No casino startable';

/**
 * This class is the base class for all casino controllers. It is responsible for managing the
 * state of the casino, and for sending commands to the server to update the state of the casino.
 * It is also responsible for notifying the UI when the state of the casino changes, by emitting events.
 */
export default abstract class CasinoAreaController<
  State extends GameState,
  EventTypes extends CasinoEventTypes,
> extends InteractableAreaController<EventTypes, any> {
  protected _instanceID?: any;

  protected _townController: TownController;

  protected _model: any;

  protected _players: PlayerController[] = [];

  constructor(id: InteractableID, casinoArea: CasinoArea<State>, townController: TownController) {
    super(id);
    this._model = casinoArea;
    this._townController = townController;

    const casino = casinoArea.casino;
    if (casino && casino.players)
      this._players = casino.players.map(playerID => this._townController.getPlayer(playerID));
  }

  get history(): any[] {
    return this._model.history;
  }

  get players(): PlayerController[] {
    return this._players;
  }

  public get observers(): PlayerController[] {
    return this.occupants.filter(eachOccupant => !this._players.includes(eachOccupant));
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    return GAME_AREA_TYPE;
  }

  /**
   * Sends a request to the server to join the current casino in the casino area, or create a new one if there is no casino in progress.
   *
   * @throws An error if the server rejects the request to join the casino.
   */
  public async joinCasino() {
    const { casinoID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinGame',
    });
    this._instanceID = casinoID;
  }

  /**
   * Sends a request to the server to leave the current casino in the casino area.
   */
  public async leaveCasino() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveGame',
        gameID: instanceID,
      });
    }
  }

  protected _updateFrom(newModel: CasinoArea<State>): void {
    const casinoEnding =
      this._model.casino?.state.status === 'IN_PROGRESS' && newModel.casino?.state.status === 'OVER';
    const newPlayers =
      newModel.casino?.players.map(playerID => this._townController.getPlayer(playerID)) ?? [];
    if (!newPlayers && this._players.length > 0) {
      this._players = [];
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', []);
    }
    if (
      this._players.length != newModel.casino?.players.length ||
      _.xor(newPlayers, this._players).length > 0
    ) {
      this._players = newPlayers;
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', newPlayers);
    }
    this._model = newModel;
    //TODO - Bounty for figuring out how to make the types work here
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('casinoUpdated');
    this._instanceID = newModel.casino?.id ?? this._instanceID;
    if (casinoEnding) {
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('casinoEnd');
    }
  }

  toInteractableAreaModel(): any {
    return this._model;
  }
}
