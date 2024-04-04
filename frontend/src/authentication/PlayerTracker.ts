import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  CasinoGame,
  CasinoRankScore,
  CasinoScore,
  CasinoSession,
  CasinoStake,
  CoveyBucks,
  PlayerID,
} from '../../../shared/types/CoveyTownSocket';

dotenv.config();

const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co';
const { NEXT_PUBLIC_SUPABASE_KEY } = process.env;
export const supabase = createClient(SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY || '');

/**
 * A PlayerTracker is used to perist player accounts and information in CoveyTown using a database service.
 * @see https://supabase.com/dashboard/project/domiwhhznvhnvxdfptjp
 */
export default class PlayerTracker {
  /**
   * Inserts the player into the database if they do not already exist.
   * @param email the email address of the user to be added.
   * @param nanoid the unique identifier for the player.
   * @throws an Error if the database communication fails.
   * @returns a Promise of the player's ID.
   */
  async handleUser(email: string, nanoid: string): Promise<PlayerID> {
    const getResponse = await supabase.from('Player').select().eq('email', email);
    // If the player already exists, return their ID.
    if (getResponse.data && getResponse.data.length > 0) {
      return getResponse.data[0].id as PlayerID;
    }

    // Otherwise, insert the player into the database.
    const insertResponse = await supabase
      .from('Player')
      .insert([{ email: email, id: nanoid, balance: 1000 }])
      .select();
    if (insertResponse.data && insertResponse.data.length > 0) {
      return insertResponse.data[0].id as PlayerID;
    }
    throw new Error('Communication with database failed');
  }

  /**
   * Retrieves all players and their updated currency balance.
   * @returns a Promise of players with their units and last username.
   */
  async getPlayersCurrency(): Promise<CasinoRankScore[]> {
    const response = await supabase
      .from('Player')
      .select('id, last_username, balance')
      .order('balance', { ascending: false });
    return (response.data ?? []).map(item => ({
      player: String(item.id) as PlayerID,
      netCurrency: item.balance as CoveyBucks,
      username: item.last_username,
    })) as CasinoRankScore[];
  }

  /**
   * Retrieves the player's currency balance.
   * @param id the player's ID.
   * @returns a Promise of the player's balance or 0 if the player does not exist.
   */
  async getPlayerCurrency(id: PlayerID): Promise<CoveyBucks> {
    const response = await supabase.from('Player').select('balance').eq('id', id).select();
    if (response.data && response.data.length > 0) {
      return response.data[0].balance as CoveyBucks;
    }
    return 0;
  }

  /**
   * Updates the player's id to be in sync with the townService based on their authenticated email.
   * @param email the existing player's email
   * @param nanoid the player's new id
   * @param username the player's new username
   */
  async updatePlayerInfo(email: string, nanoid: PlayerID, username: string): Promise<void> {
    await supabase
      .from('Player')
      .update({ id: nanoid, last_username: username })
      .eq('email', email);
  }

  /**
   * Fetches all casino sessions that have been played for the specified game.
   * @param game the type of casino game.
   * @returns a Promise with the stake and creation date for a table.
   */
  async getCasinoSessions(game: CasinoGame): Promise<CasinoSession[]> {
    const response = await supabase
      .from('Session')
      .select('id, stakes, created_at')
      .eq('game', game);
    return (response.data ?? []).map(item => ({
      id: item.id,
      stakes: item.stakes as CasinoStake,
      game,
      date: new Date(item.created_at),
    })) as CasinoSession[];
  }
}
