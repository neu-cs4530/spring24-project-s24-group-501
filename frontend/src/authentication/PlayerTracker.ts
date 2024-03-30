import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { CoveyBucks, PlayerID } from '../../../shared/types/CoveyTownSocket';

dotenv.config();

const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co';
const { SUPABASE_KEY } = process.env;
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY || '');

/**
 * A PlayerTracker is used to perist player accounts in CoveyTown using a database service.
 * @see https://supabase.com/dashboard/project/domiwhhznvhnvxdfptjp
 */
export default class PlayerTracker {
    /**
   * Inserts the player into the database if they do not already exist.
   * @param email the email address of the user to be added.
   * @throws an Error if the database communication fails.
   * @returns a Promise of the player's ID.
   */
  async handleUser(email: string): Promise<PlayerID> {
    const response = await supabase.from('Player').insert([{ email: email, balance: 1000 }]).select();
    if (response.data) {
        return response.data[0].id as PlayerID;
    }
    throw new Error('Communication with database failed');
  }

  /**
   * Retrieves the player's currency balance.
   * @param id the player's ID.
   * @returns a Promise of the player's balance or 0 if the player does not exist.
   */
  async getPlayerCurrency(id: PlayerID): Promise<CoveyBucks> {
    const response = await supabase.from('Player').select('balance').eq('id', id).select();
    return response.data ? response.data[0].balance as CoveyBucks : 0;
  }
}