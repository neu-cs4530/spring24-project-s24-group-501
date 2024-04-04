import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { CasinoScore, CasinoSession, CoveyBucks, PlayerID } from '../../types/CoveyTownSocket';

dotenv.config();

const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co';
const { SUPABASE_KEY } = process.env;
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY || '');

/**
 * A CasinoTracker is used to perist currency changes and track tables for players in CoveyTown using a database service.
 * @see https://supabase.com/dashboard/project/domiwhhznvhnvxdfptjp
 */
export default class CasinoTracker {
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
   * Updates the player's balance to reflect the net change.
   * @param id the player's id
   * @param netCurrency the player's change to their currency balance, can be positive or negative
   * @returns a Promise of the player's updated balance or 0 if the player does not exist.
   */
  async putPlayerCurrency(playerScore: CasinoScore): Promise<CoveyBucks> {
    const response = await supabase
      .from('Player')
      .update({
        balance: (await this.getPlayerCurrency(playerScore.player)) + playerScore.netCurrency,
      })
      .eq('id', playerScore.player)
      .select();
    if (response.data && response.data.length > 0) {
      return response.data[0].balance as CoveyBucks;
    }
    return 0;
  }

  /**
   * Inserts the casino session as a new record.
   * @param session the table to be stored.
   * @returns a Promise containing the constructed session entry.
   */
  async postCasinoSession(session: CasinoSession): Promise<number> {
    const response = await supabase
      .from('Session')
      .insert([{ stakes: session.stakes, game: session.game }])
      .select();
    if (response.data && response.data.length > 0) {
      return response.data[0].id as number;
    }
    return 0;
  }
}
