import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import BlackjackGameArea from './Blackjack/BlackjackGameArea';

/**
 * Creates a new CasinoArea from a map object
 *
 * @param mapObject the map object to create the casino area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
export default function CasinoAreaFactory(
  mapObject: ITiledMapObject,
  broadcastEmitter: TownEmitter,
): InteractableArea {
  const { name, width, height } = mapObject;
  if (!width || !height) {
    throw new Error(`Malformed viewing area ${name}`);
  }
  const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
  const gameType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
  if (gameType === 'Blackjack') {
    return new BlackjackGameArea(name, rect, broadcastEmitter);
  }
  throw new Error(`Unknown game area type ${mapObject.class}`);
}
