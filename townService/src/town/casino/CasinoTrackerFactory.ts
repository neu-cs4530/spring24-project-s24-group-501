import CasinoTracker from './CasinoTracker';

export default class CasinoTrackerFactory {
  private static _instance: CasinoTracker | undefined;

  public static instance(): CasinoTracker {
    if (!CasinoTrackerFactory._instance) {
      CasinoTrackerFactory._instance = new CasinoTracker();
    }
    return CasinoTrackerFactory._instance;
  }
}
