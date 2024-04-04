import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Player from '../../lib/Player';
import {
  CasinoGame,
  CasinoScore,
  CasinoSession,
  CasinoStake,
  CoveyBucks,
  PlayerID,
} from '../../types/CoveyTownSocket';

dotenv.config();

const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co';
const { SUPABASE_KEY } = process.env;
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY || '');

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
  async getPlayersCurrency(): Promise<CasinoScore[]> {
    const response = await supabase
      .from('Player')
      .select('id, balance')
      .order('balance', { ascending: false });
    return (response.data ?? []).map(item => ({
      player: String(item.id) as PlayerID,
      netCurrency: item.balance as CoveyBucks,
    })) as CasinoScore[];
  }

  async getPlayerCurrency(player: Player): Promise<CasinoScore> {
    const response = await this.getPlayersCurrency();
    return response.filter(score => score.player === player.id)[0];
  }

  /**
   * Updates the player balances of the supplied entries.
   * @param scores a list of players and new balances.
   * @returns a Promise of the updated scores.
   */
  async putPlayerScores(scores: CasinoScore[]): Promise<CasinoScore[]> {
    scores.map(async score => ({
      id: score.player,
      netCurrency: await supabase
        .from('Player')
        .update({ balance: score.netCurrency })
        .eq('id', score.player)
        .select(),
    }));

    await Promise.all(scores);

    return (await this.getPlayersCurrency()).filter(fullScore =>
      scores.map(updatedScore => updatedScore.player).includes(fullScore.player),
    );
  }

  /**
   * Fetches all casino sessions that have been played for the specified game.
   * @param game the type of casino game.
   * @returns a Promise with the stake and creation date for a table.
   */
  async getCasinoSessions(game: CasinoGame): Promise<CasinoSession[]> {
    const response = await supabase
      .from('Session')
      .select('id, player_id, stakes, start_date')
      .eq('game', game);
    return (response.data ?? []).map(item => ({
      id: item.id,
      playerID: item.player_id as PlayerID,
      stakes: item.stakes as CasinoStake,
      game,
      date: item.start_date as Date,
    })) as CasinoSession[];
  }

  /**
   * Inserts the casino session as a new record.
   * @param session the table to be stored.
   * @returns a Promise containing the constructed session entry.
   */
  async postCasinoSession(session: CasinoSession): Promise<CasinoSession[]> {
    const response = await supabase
      .from('Session')
      .insert([
        { id: session.id, player_id: session.playerID, stakes: session.stakes, game: session.game },
      ])
      .select();
    return (response.data ?? []).map(item => ({
      id: item.id,
      playerID: item.player_id as PlayerID,
      stakes: item.stakes as CasinoStake,
      game: item.game as CasinoGame,
      date: item.start_date as Date,
    }));
  }

  /**
   * Inserts the player into the database if they do not already exist.
   * @param email the email address of the user to be added.
   */
  async postUser(email: string): Promise<void> {
    // this could also maintain a map of emails to ids
    await supabase.from('Player').insert([{ email }]);
  }
}
