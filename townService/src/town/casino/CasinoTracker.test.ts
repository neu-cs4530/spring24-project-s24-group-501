import CasinoTracker from './CasinoTracker';
import { CasinoScore, CasinoSession } from '../../types/CoveyTownSocket';
import CasinoTrackerFactory from './CasinoTrackerFactory';

/** Tests were additionally tested manually to observe appropiate side-effects in the database service. */
describe('CasinoTracker', () => {
  let dbConnection: CasinoTracker;
  let getPlayerCurrencySpy: jest.SpyInstance;
  let putPlayerCurrencySpy: jest.SpyInstance;
  let postCasinoSessionSpy: jest.SpyInstance;
  const newSession: CasinoSession = {
    id: 3,
    stakes: 'Low',
    game: 'Blackjack',
    date: new Date(),
  };
  const newScore: CasinoScore = { player: '1', netCurrency: 100 };

  beforeEach(() => {
    dbConnection = CasinoTrackerFactory.instance();
    getPlayerCurrencySpy = jest.spyOn(dbConnection, 'getPlayerCurrency');
    putPlayerCurrencySpy = jest.spyOn(dbConnection, 'putPlayerCurrency');
    postCasinoSessionSpy = jest.spyOn(dbConnection, 'postCasinoSession');
    getPlayerCurrencySpy.mockClear();
    putPlayerCurrencySpy.mockClear();
    postCasinoSessionSpy.mockClear();
  });

  describe('getPlayerCurrency', () => {
    test('throws an error if the request is invalid', async () => {
      getPlayerCurrencySpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getPlayerCurrency('1')).rejects.toThrowError();
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
    test("retrieves the player's currency balance", async () => {
      getPlayerCurrencySpy.mockResolvedValue(1000);
      await expect(dbConnection.getPlayerCurrency('1')).resolves.toEqual(1000);
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
    test('returns 0 if the player does not exist', async () => {
      getPlayerCurrencySpy.mockResolvedValue(0);
      await expect(dbConnection.getPlayerCurrency('4')).resolves.toEqual(0);
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
  });
  describe('putPlayerCurrency', () => {
    test('throws an error if the player does not exist', async () => {
      putPlayerCurrencySpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.putPlayerCurrency(newScore)).rejects.toThrowError();
      expect(putPlayerCurrencySpy).toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
    test("a player's currency should reflect the most recent posting", async () => {
      getPlayerCurrencySpy.mockResolvedValue(1000);
      await expect(dbConnection.getPlayerCurrency('1')).resolves.toEqual(1000);
      putPlayerCurrencySpy.mockResolvedValue(1100);
      await expect(dbConnection.putPlayerCurrency(newScore)).resolves.toEqual(1100);
      expect(putPlayerCurrencySpy).toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
  });
  describe('postCasinoSession', () => {
    test('throws an error if the session already exists', async () => {
      postCasinoSessionSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.postCasinoSession(newSession)).rejects.toThrowError();
      expect(postCasinoSessionSpy).toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
    });
    test('a casino table should be inserted in the database after being posted', async () => {
      const sampleSessions: CasinoSession[] = [
        { id: 1, stakes: 'Low', game: 'Blackjack', date: new Date() },
        { id: 2, stakes: 'Medium', game: 'Blackjack', date: new Date() },
      ];
      expect(sampleSessions).not.toContain(newSession);
      postCasinoSessionSpy.mockResolvedValue(3);
      await expect(dbConnection.postCasinoSession(newSession)).resolves.toEqual(3);
      expect(postCasinoSessionSpy).toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(putPlayerCurrencySpy).not.toHaveBeenCalled();
    });
  });
});
