import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

const supabaseUrl = 'https://qcjnkbbwytwytearfslk.supabase.co';
const supabaseAnonKey = 'sb_publishable_dOqzXKeNqJmoK5aqaBg-gQ_KfqFobrr';

// On web, leave storage undefined so Supabase uses its own localStorage
// wrapper, which guards against SSR (window is not defined in Node.js).
// On native, use AsyncStorage as normal.
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage,
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: false,
	},
});
