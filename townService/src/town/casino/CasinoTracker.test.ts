import CasinoTracker from './CasinoTracker';
import { CasinoScore, CasinoSession } from '../../types/CoveyTownSocket';
import CasinoTrackerFactory from './CasinoTrackerFactory';

describe('CasinoTracker', () => {
  let dbConnection: CasinoTracker;
  let getCurrencySpy: jest.SpyInstance;
  let putPlayerScoresSpy: jest.SpyInstance;
  let getCasinoSessionsSpy: jest.SpyInstance;
  let postCasinoSessionSpy: jest.SpyInstance;
  const sampleCurrency: CasinoScore[] = [
    { player: '1', netCurrency: 300 },
    { player: '2', netCurrency: 200 },
    { player: '3', netCurrency: 100 },
  ];
  const newScoreP1: CasinoScore = { player: '1', netCurrency: 1000 };
  const sampleSessions: CasinoSession[] = [
    { id: 1, playerID: '1', stakes: 'Low', game: 'Blackjack', date: new Date('2024-03-20') },
    { id: 2, playerID: '2', stakes: 'Low', game: 'Blackjack', date: new Date('2024-03-20') },
    { id: 3, playerID: '1', stakes: 'Medium', game: 'Blackjack', date: new Date('2024-03-21') },
  ];
  const newSession: CasinoSession = {
    id: Number.MAX_SAFE_INTEGER,
    playerID: '3',
    stakes: 'Low',
    game: 'Blackjack',
    date: new Date('2024-03-22'),
  };

  beforeEach(() => {
    dbConnection = CasinoTrackerFactory.instance();
    getCurrencySpy = jest.spyOn(dbConnection, 'getPlayerCurrency');
    putPlayerScoresSpy = jest.spyOn(dbConnection, 'putPlayerScores');
    getCasinoSessionsSpy = jest.spyOn(dbConnection, 'getCasinoSessions');
    postCasinoSessionSpy = jest.spyOn(dbConnection, 'postCasinoSession');
  });

  describe('getPlayerCurrency', () => {
    test('throws an error if the request is invalid', async () => {
      getCurrencySpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getPlayersCurrency()).rejects.toThrowError();
      expect(getCurrencySpy).toHaveBeenCalled();
      expect(putPlayerScoresSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
    test('retrieves all players and their updated currency balance', async () => {
      getCurrencySpy.mockResolvedValue(sampleCurrency);
      await expect(dbConnection.getPlayersCurrency()).resolves.toEqual(sampleCurrency);
      expect(getCurrencySpy).toHaveBeenCalled();
      expect(putPlayerScoresSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
  });
  describe('putPlayerScores', () => {
    test('throws an error if the player does not exist', async () => {
      putPlayerScoresSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.putPlayerScores([newScoreP1])).rejects.toThrowError();
      expect(putPlayerScoresSpy).toHaveBeenCalled();
      expect(getCurrencySpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
    test("a player's currency should reflect the most recent posting", async () => {
      const newScoreP3: CasinoScore = { player: '3', netCurrency: 0 };
      const updatedCurrency: CasinoScore[] = [
        newScoreP1,
        { player: '2', netCurrency: 200 },
        newScoreP3,
      ];
      putPlayerScoresSpy.mockResolvedValue(updatedCurrency);
      await expect(dbConnection.putPlayerScores([newScoreP1, newScoreP3])).resolves.toEqual(
        updatedCurrency,
      );
      expect(putPlayerScoresSpy).toHaveBeenCalled();
      expect(getCurrencySpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
  });
  describe('getCasinoSessions', () => {
    test('throws an error if the request is invalid', async () => {
      getCasinoSessionsSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getCasinoSessions('Blackjack')).rejects.toThrowError();
      expect(getCasinoSessionsSpy).toHaveBeenCalled();
      expect(getCurrencySpy).not.toHaveBeenCalled();
      expect(putPlayerScoresSpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
    test('retrieves the casino sessions for all historic activity', async () => {
      getCasinoSessionsSpy.mockResolvedValue(sampleSessions);
      await expect(dbConnection.getCasinoSessions('Blackjack')).resolves.toEqual(sampleSessions);
      expect(getCasinoSessionsSpy).toHaveBeenCalled();
      expect(getCurrencySpy).not.toHaveBeenCalled();
      expect(putPlayerScoresSpy).not.toHaveBeenCalled();
      expect(postCasinoSessionSpy).not.toHaveBeenCalled();
    });
  });
  describe('postCasinoSession', () => {
    test('throws an error if the session already exists', async () => {
      postCasinoSessionSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.postCasinoSession(newSession)).rejects.toThrowError();
      expect(postCasinoSessionSpy).toHaveBeenCalled();
      expect(getCurrencySpy).not.toHaveBeenCalled();
      expect(putPlayerScoresSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
    test('a casino table should be inserted in the database after being posted', async () => {
      const updatedSessions = [...sampleSessions, newSession];
      postCasinoSessionSpy.mockResolvedValue(updatedSessions);
      await expect(dbConnection.postCasinoSession(newSession)).resolves.toEqual(updatedSessions);
      expect(postCasinoSessionSpy).toHaveBeenCalled();
      expect(getCurrencySpy).not.toHaveBeenCalled();
      expect(putPlayerScoresSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
  });
});
