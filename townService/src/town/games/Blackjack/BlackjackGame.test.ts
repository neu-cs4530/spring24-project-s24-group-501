import { GAME_NOT_IN_PROGRESS_MESSAGE } from '../../../lib/InvalidParametersError';
import { BlackjackMove, Player } from '../../../types/CoveyTownSocket';
import BlackjackGame from './BlackjackGame';

function createGameFromPattern(game: BlackjackGame, moves: BlackjackMove[]) {
    for (const move of moves) {
        try {
            game.applyMove({
                playerID: move.player,
                gameID: game.id,
                move: move
            });
        } catch (error) {
            console.error('Unable to apply pattern: ', error);
        }
    }
}


describe('BlackjackGame', () => {
    let game: BlackjackGame;

    beforeEach(() => {
        game = new BlackjackGame();
    });

    describe('startGame', () => {
        test('should return a new game', () => {

        });
    });

    describe('ApplyMove', () => {
        beforeEach(() => {
            
        });
        test('Should throw error if game is not in progress', () => {
            game.state.status = "OVER"
            expect(() => game.applyMove({
                playerID: '',
                gameID: '',
                move: {
                    player: '',
                    action: 'Hit'
                }
            })).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
    });
});