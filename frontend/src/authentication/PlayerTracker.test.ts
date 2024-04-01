import PlayerTracker from './PlayerTracker';
import { CoveyBucks, PlayerID } from '../../../shared/types/CoveyTownSocket';
import PlayerTrackerFactory from './PlayerTrackerFactory';

describe('PlayerTracker', () => {
  let dbConnection: PlayerTracker;
  let handleUserSpy: jest.SpyInstance;
  let getPlayerCurrencySpy: jest.SpyInstance;

  beforeEach(() => {
    dbConnection = PlayerTrackerFactory.instance();
    handleUserSpy = jest.spyOn(dbConnection, 'handleUser');
    getPlayerCurrencySpy = jest.spyOn(dbConnection, 'getPlayerCurrency');
    handleUserSpy.mockClear();
    getPlayerCurrencySpy.mockClear();
  });

  describe('handleUser', () => {
    test('throws an error if the request is invalid', async () => {
      handleUserSpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.handleUser('test@email.com')).rejects.toThrowError();
      expect(handleUserSpy).toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
    });
    test('inserts the player into the database if they do not already exist', async () => {
      handleUserSpy.mockResolvedValue('1');
      await expect(dbConnection.handleUser('test@email.com')).resolves.toEqual('1');
      expect(handleUserSpy).toHaveBeenCalled();
      expect(getPlayerCurrencySpy).not.toHaveBeenCalled();
    });
  });
  describe('getPlayerCurrency', () => {
    test('throws an error if the request is invalid', async () => {
      getPlayerCurrencySpy.mockRejectedValue(new Error('Invalid request'));
      await expect(dbConnection.getPlayerCurrency('1')).rejects.toThrowError();
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
    });
    test('retrives the player\'s currency balance', async () => {
      getPlayerCurrencySpy.mockResolvedValue(1000);
      await expect(dbConnection.getPlayerCurrency('1')).resolves.toEqual(1000);
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
    });
    test('returns 0 if the player does not exist', async () => {
      getPlayerCurrencySpy.mockResolvedValue(0);
      await expect(dbConnection.getPlayerCurrency('' + Number.MAX_SAFE_INTEGER)).resolves.toEqual(0);
      expect(getPlayerCurrencySpy).toHaveBeenCalled();
      expect(handleUserSpy).not.toHaveBeenCalled();
    });
  });
});