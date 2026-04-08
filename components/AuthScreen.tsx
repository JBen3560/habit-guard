import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signIn, signUp } from '@/lib/auth';
import { useTheme } from '@/src/context/ThemeContext';
import { getColors } from '@/src/types';

type Mode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'neutral' | 'error' | 'success'>('neutral');

  const showMessage = (nextMessage: string, tone: 'neutral' | 'error' | 'success') => {
    setMessage(nextMessage);
    setMessageTone(tone);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();
    const trimmedDescription = description.trim();

    if (!trimmedEmail || !password.trim()) {
      showMessage('Enter an email and password to continue.', 'error');
      return;
    }

    if (mode === 'sign-up' && (!trimmedDisplayName || !trimmedUsername)) {
      showMessage('Enter a display name and username to create your account.', 'error');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      if (mode === 'sign-in') {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          showMessage(error.message, 'error');
          return;
        }

        showMessage('Signed in. Loading your account...', 'success');
        return;
      }

      const { data, error } = await signUp(trimmedEmail, password, {
        displayName: trimmedDisplayName,
        username: trimmedUsername,
        description: trimmedDescription,
      });
      if (error) {
        showMessage(error.message, 'error');
        return;
      }

      if (data.session) {
        showMessage('Account created. Loading your account...', 'success');
      } else {
        showMessage('Account created. Check your email to confirm before signing in.', 'success');
        setMode('sign-in');
      }
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'sign-in' ? 'Sign in to Habit-Guard' : 'Create your account';
  const subtitle =
    mode === 'sign-in'
      ? 'Pick up your habits on any device with a real Supabase account.'
      : 'Create your account once and keep your habit history tied to you.';

  return (
    <View style={[s.shell, { backgroundColor: C.bg }]}>
      <View style={[s.ambientOne, { backgroundColor: `${C.blue}20` }]} />
      <View style={[s.ambientTwo, { backgroundColor: `${C.green}18` }]} />

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={s.hero}>
            <View style={[s.logoMark, { backgroundColor: C.card, borderColor: C.border }]}>
              <MaterialIcons name="shield" size={28} color={C.blue} />
            </View>
            <Text style={[s.brand, { color: C.text }]}>Habit-Guard</Text>
            <Text style={[s.heroText, { color: C.sub }]}>{subtitle}</Text>
          </View>

          <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.title, { color: C.text }]}>{title}</Text>
            <Text style={[s.caption, { color: C.sub }]}>
              Use the same email and password every time.
            </Text>

            <Text style={[s.fieldLabel, { color: C.sub }]}>EMAIL</Text>
            <TextInput
              style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={C.sub}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />

            {mode === 'sign-up' ? (
              <>
                <Text style={[s.fieldLabel, { color: C.sub }]}>DISPLAY NAME</Text>
                <TextInput
                  style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="How you want your name shown"
                  placeholderTextColor={C.sub}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />

                <Text style={[s.fieldLabel, { color: C.sub }]}>USERNAME</Text>
                <TextInput
                  style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="your name"
                  placeholderTextColor={C.sub}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />

                <Text style={[s.fieldLabel, { color: C.sub }]}>DESCRIPTION</Text>
                <TextInput
                  style={[s.textArea, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="A short bio for your profile"
                  placeholderTextColor={C.sub}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

              </>
            ) : null}

            <Text style={[s.fieldLabel, { color: C.sub }]}>PASSWORD</Text>
            <TextInput
              style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={C.sub}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {message ? (
              <View
                style={[
                  s.messageBox,
                  { backgroundColor: `${messageTone === 'error' ? '#DC2626' : C.blue}12` },
                  messageTone === 'error' && { borderColor: '#FCA5A5' },
                  messageTone === 'success' && { borderColor: '#86EFAC' },
                ]}
              >
                <Text
                  style={[
                    s.messageText,
                    {
                      color:
                        messageTone === 'error'
                          ? '#DC2626'
                          : messageTone === 'success'
                            ? C.green
                            : C.sub,
                    },
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: C.blue }, busy && { opacity: 0.72 }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>
                  {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.switchBtn, { borderColor: C.border, backgroundColor: C.bg }]}
              onPress={() => {
                const nextMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
                setMode(nextMode);
                setMessage(null);
                if (nextMode === 'sign-in') {
                  setDisplayName('');
                  setUsername('');
                  setDescription('');
                }
              }}
            >
              <Text style={[s.switchText, { color: C.sub }]}>
                {mode === 'sign-in'
                  ? 'Need an account? Create one'
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[s.footer, { color: C.sub }]}>
            Your habits stay attached to your account instead of a shared demo state.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  shell: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  ambientOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -70,
    right: -80,
  },
  ambientTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -60,
    left: -60,
  },
  hero: { alignItems: 'center', marginBottom: 24 },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  brand: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  heroText: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 21, maxWidth: 320 },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  caption: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 92,
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  messageText: { fontSize: 13, lineHeight: 18 },
  submitBtn: {
    marginTop: 16,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  switchBtn: {
    marginTop: 12,
    borderRadius: 16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  switchText: { fontSize: 14, fontWeight: '600' },
  footer: { marginTop: 18, textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
