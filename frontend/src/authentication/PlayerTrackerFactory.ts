import PlayerTracker from './PlayerTracker';

/**
 * Returns a singleton instance of the PlayerTracker class.
 */
export default class PlayerTrackerFactory {
  private static _instance: PlayerTracker | undefined;

  public static instance(): PlayerTracker {
    if (!PlayerTrackerFactory._instance) {
      PlayerTrackerFactory._instance = new PlayerTracker();
    }
    return PlayerTrackerFactory._instance;
  }
}
