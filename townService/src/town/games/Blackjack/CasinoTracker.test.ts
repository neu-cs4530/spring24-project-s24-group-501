import CasinoTracker from "./CasinoTracker";

describe('CasinoTracker', () => {
    let dbConnection: CasinoTracker;
    // const SUPABASE_URL = 'https://domiwhhznvhnvxdfptjp.supabase.co'
    // const SUPABASE_KEY = process.env.SUPABASE_KEY

    beforeEach(() => {
        dbConnection = new CasinoTracker();
        //const SUPABASE = createClient(SUPABASE_URL, SUPABASE_KEY || '')
    });

    describe('getPlayerCurrency', () => {
        test('throws an error if the request is invalid', () => {

        });
        test('retrieves the player currency for all stored historic users', () => {

        });
    });
    describe('putPlayerScores', () => {
        test('throws an error if the player does not exist', () => {

        });
        test('a player\'s currency should reflect the most recent posting', () => {

        });
    });
    describe('getCasinoSessions', () => {
        test('throws an error if the request is invalid', () => {

        });
        test('retrieves the casino sessions for all historic activity', () => {

        });
    });
    describe('postCasinoSession', () => {
        test('throws an error if the session already exists', () => {

        });
        test('a casino table should be inserted in the database after being posted', () => {

        });
    });
})