import CasinoTracker from "./CasinoTracker";

describe('CasinoTracker', () => {
    let dbConnection: CasinoTracker;
    // const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co'
    // const SUPABASE_KEY = process.env.SUPABASE_KEY

    beforeEach(() => {
        dbConnection = new CasinoTracker();
        //const SUPABASE = createClient(SUPABASE_URL, SUPABASE_KEY || '')
    });

    describe('getPlayerCurrency', async () => {
        test('throws an error if the request is invalid', () => {

        });
        test('retrieves the player currency for all stored historic users', () => {

        });
    });
    describe('putPlayerScores', async () => {
        test('throws an error if the player does not exist', () => {

        });
        test('a player\'s currency should reflect the most recent posting', () => {

        });
    });
    describe('getCasinoSessions', async () => {
        test('throws an error if the request is invalid', () => {

        });
        test('retrieves the casino sessions for all historic activity', () => {

        });
    });
    describe('postCasinoSession', async () => {
        test('throws an error if the session already exists', () => {

        });
        test('a casino table should be inserted in the database after being posted', () => {

        });
    });
})