import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Web-only page that Supabase redirects to after email confirmation.
export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to the app after 3 seconds
    const t = setTimeout(() => router.replace('/'), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.emoji}>✅</Text>
      <Text style={s.title}>Email confirmed!</Text>
      <Text style={s.sub}>Your account is ready. You can now sign in to Habit-Guard.</Text>
      <TouchableOpacity style={s.btn} onPress={() => router.replace('/')}>
        <Text style={s.btnText}>Go to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#111827' },
  emoji:  { fontSize: 64, marginBottom: 16 },
  title:  { fontSize: 28, fontWeight: '800', color: '#F9FAFB', marginBottom: 8 },
  sub:    { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  btn:    { backgroundColor: '#3B82F6', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
