import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://qcjnkbbwytwytearfslk.supabase.co';
const supabaseAnonKey = 'sb_publishable_dOqzXKeNqJmoK5aqaBg-gQ_KfqFobrr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: false,
	},
});
