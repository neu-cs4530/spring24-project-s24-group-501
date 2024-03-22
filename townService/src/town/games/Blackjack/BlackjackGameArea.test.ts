import { INVALID_COMMAND_MESSAGE } from '../../../lib/InvalidParametersError';

describe('BlackjackGameArea', () => {
  describe('JoinGame Command', () => {});

  describe('StartGame Command', () => {});

  describe('LeaveGame Command', () => {});

  describe('ApplyMove Command', () => {});

  describe('PlaceBet Command', () => {});

  test('When given an invalid command it should throw an error', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
    expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, red)).toThrowError(
      INVALID_COMMAND_MESSAGE,
    );
    // expect(interactableUpdateSpy).not.toHaveBeenCalled();
  });
});
