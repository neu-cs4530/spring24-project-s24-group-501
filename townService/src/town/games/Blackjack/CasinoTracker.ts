import { createClient } from '@supabase/supabase-js'
import { CasinoGame, CasinoScore, CasinoSession } from '../../../../../shared/types/CoveyTownSocket';

const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY
const SUPABASE = createClient(SUPABASE_URL, SUPABASE_KEY || '')

/**
DESIRABLE:
I should be able to see my numeric rank out of all players who have played the game that day
I should be able to see the currency total of the top ten players ever
I should be able to see the currency total of the top ten players that day
I should be able to click on an entry in the leaderboard to view more statistics, like number of games played

TODO: -- change in design to:
I should be able to see how many casino tables have been played that day
I should be able to see how many sessions of each casino stake type have been played
I should be able to see the currency total of the top ten players ever
I should be able to click on an entry in the leaderboard to view more statistics, like number of games played
 */

/**
 * A CasinoTracker is used to perist currency changes and track tables for players in CoveyTown using a database service.
 * Errors are propogated to its user.
 * @see https://supabase.com/dashboard/project/domiwhhznvhnvxdfptjp
 */
export default class CasinoTracker {
    /**
     * Retrieves all players and their updated currency balance.
     * @returns a Promise of players and their units.
     */
    async getPlayerCurrency(): Promise<CasinoScore[]> {
        const response = await SUPABASE.from("Player").select("id, balance");
        return (response.data ?? []).map(item => ({
            player: item.id,
            netCurrency: item.balance
        })) as CasinoScore[];
    }

    /**
     * Updates the player balances of the supplied entries.
     * @param scores a list of players and new balances.
     * @returns a Promise of the updates.
     */
    async putPlayerScores(scores: CasinoScore[]): Promise<CasinoScore[]> {
        scores.map(async score => ({
            id: score.player,
            netCurrency: await SUPABASE
            .from('Player')
            .update({ balance: score.netCurrency })
            .eq('id', score.player)
            .select()
        }))

        return await Promise.all(scores);
    }

    /**
     * Fetches all casino sessions that have been played for the specified game.
     * @param game the type of casino game.
     * @returns a Promise with the stake and creation date for a table.
     */
    async getCasinoSessions(game: CasinoGame): Promise<CasinoSession[]> {
        const response = await SUPABASE.from('Session').select('id, stakes, start_date').eq('game', game)
        return (response.data ?? []).map(item => ({
            id: item.id,
            stakes: item.stakes,
            game: game,
            date: item.start_date
        })) as CasinoSession[];
    }

    /**
     * Inserts the casino session as a new record.
     * @param session the table to be stored.
     * @returns a Promise containing the constructed session entry. 
     */
    async postCasinoSession(session: CasinoSession): Promise<CasinoSession[]> {
        const response = await SUPABASE.from('Session').insert([
        { id: session.id, stakes: session.stakes, game: session.game },
        ])
        .select()
        return (response.data ?? []).map(item => ({
            id: item.id,
            stakes: item.stakes,
            game: item.game,
            date: item.start_date
        }));
    }
}