import PlayerTracker from './PlayerTracker';
import {
  CasinoRankScore,
  CasinoSession,
} from '../../../shared/types/CoveyTownSocket';
import PlayerTrackerFactory from './PlayerTrackerFactory';
import { nanoid } from 'nanoid';

/** Tests were additionally tested manually to observe appropiate side-effects in the database service. */
describe('PlayerTracker', () => {
  let dbConnection: PlayerTracker;
  let handleUserSpy: jest.SpyInstance;
  let getPlayersCurrencySpy: jest.SpyInstance;
  let getPlayerCurrencySpy: jest.SpyInstance;
  let updatePlayerInfoSpy: jest.SpyInstance;
  let getCasinoSessionsSpy: jest.SpyInstance;
  const sampleCurrency: CasinoRankScore[] = [
    { player: '1', netCurrency: 300, username: 'Dallon' },
    { player: '2', netCurrency: 200, username: 'Tomas' },
    { player: '3', netCurrency: 100, username: 'Ari' },
  ];

  beforeEach(() => {
    dbConnection = PlayerTrackerFactory.instance();
    handleUserSpy = jest.spyOn(dbConnection, 'handleUser');
    getPlayersCurrencySpy = jest.spyOn(dbConnection, 'getPlayersCurrency');
    getPlayerCurrencySpy = jest.spyOn(dbConnection, 'getPlayerCurrency');
    updatePlayerInfoSpy = jest.spyOn(dbConnection, 'updatePlayerInfo');
    getCasinoSessionsSpy = jest.spyOn(dbConnection, 'getCasinoSessions');
    handleUserSpy.mockClear();
    getPlayersCurrencySpy.mockClear();
    getPlayerCurrencySpy.mockClear();
    updatePlayerInfoSpy.mockClear();
    getCasinoSessionsSpy.mockClear();
  });

  describe('handleUser', () => {
    test('throws an error if the request is invalid', async () => {
      handleUserSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.handleUser('test@email.com', nanoid())).rejects.toThrowError();
      expect(handleUserSpy).toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
    test("retrieves the player's id if they already exist", async () => {
      getPlayerCurrencySpy.mockResolvedValue(0);
      await expect(dbConnection.getPlayerCurrency('1')).resolves.toEqual(0);
      handleUserSpy.mockResolvedValue('1');
      await expect(dbConnection.handleUser('test@email.com', nanoid())).resolves.toEqual('1');
      expect(handleUserSpy).toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
    test('inserts the player into the database if they do not already exist', async () => {
      getPlayerCurrencySpy.mockResolvedValue(300);
      await expect(dbConnection.getPlayerCurrency('4')).resolves.toEqual(300);
      handleUserSpy.mockResolvedValue('4');
      await expect(dbConnection.handleUser('test@email.com', nanoid())).resolves.toEqual('4');
      expect(handleUserSpy).toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
  });
  describe('getPlayersCurrency', () => {
    test('throws an error if the request is invalid', async () => {
      getPlayersCurrencySpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getPlayersCurrency()).rejects.toThrowError();
      expect(getPlayersCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
    test('retrieves all players and their updated currency balance', async () => {
      getPlayersCurrencySpy.mockResolvedValue(sampleCurrency);
      await expect(dbConnection.getPlayersCurrency()).resolves.toEqual(sampleCurrency);
      expect(getPlayersCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
  });
  describe('getPlayerCurrency', () => {
    test('throws an error if the request is invalid', async () => {
      getPlayerCurrencySpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getPlayerCurrency('1')).rejects.toThrowError();
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
    test("retrives the player's currency balance", async () => {
      getPlayerCurrencySpy.mockResolvedValue(1000);
      await expect(dbConnection.getPlayerCurrency('1')).resolves.toEqual(1000);
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
    test('returns 0 if the player does not exist', async () => {
      getPlayerCurrencySpy.mockResolvedValue(0);
      await expect(dbConnection.getPlayerCurrency('4')).resolves.toEqual(0);
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
      expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
    });
  });
  // describe('updatePlayerInfo', () => {
  //   test("updates the player's id and username to be in sync with the townService", async () => {
  //     getPlayersCurrencySpy.mockResolvedValue(sampleCurrency);
  //     await expect(dbConnection.getPlayersCurrency()).resolves.toEqual(sampleCurrency);
  //     await dbConnection.updatePlayerInfo('test@email.com', '5', 'NewName');
  //     const updatedCurrency: CasinoRankScore[] = [
  //       { player: '5', netCurrency: 300, username: 'NewName' },
  //       { player: '2', netCurrency: 200, username: 'Tomas' },
  //       { player: '3', netCurrency: 100, username: 'Ari' },
  //     ];
  //     getPlayersCurrencySpy.mockResolvedValue(updatedCurrency);
  //     await expect(dbConnection.getPlayersCurrency()).resolves.toEqual(updatedCurrency);
  //     expect(updatePlayerInfoSpy).toHaveBeenCalled();
  //     expect(handleUserSpy).not.toHaveBeenCalled();
  //     expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
  //     expect(getCasinoSessionsSpy).not.toHaveBeenCalled();
  //   });
  // });
  describe('getCasinoSessions', () => {
    test('throws an error if the request is invalid', async () => {
      getCasinoSessionsSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getCasinoSessions('Blackjack')).rejects.toThrowError();
      expect(getCasinoSessionsSpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
    });
    test('retrieves all casino sessions', async () => {
      const sampleSessions: CasinoSession[] = [
        { id: 1, stakes: 'Low', game: 'Blackjack', date: new Date('2024-03-20') },
        { id: 2, stakes: 'Low', game: 'Blackjack', date: new Date() },
        { id: 3, stakes: 'Medium', game: 'Blackjack', date: new Date('2024-03-21') },
      ];
      getCasinoSessionsSpy.mockResolvedValue(sampleSessions);
      await expect(dbConnection.getCasinoSessions('Blackjack')).resolves.toEqual(sampleSessions);
      expect(getCasinoSessionsSpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
      expect(getPlayersCurrencySpy).not.toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
      expect(updatePlayerInfoSpy).not.toHaveBeenCalled();
    });
  });
});
