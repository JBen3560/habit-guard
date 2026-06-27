import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signInWithUsername, signUp } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/src/context/ThemeContext';
import { getColors } from '@/src/types';

type Mode = 'sign-in' | 'sign-up';
type Colors = ReturnType<typeof getColors>;
type MessageTone = 'neutral' | 'error' | 'success';

// ─── Utility ──────────────────────────────────────────────────────────────────

async function uploadAvatar(userId: string, uri: string, mimeType: string): Promise<void> {
  const ext = mimeType.split('/')[1] ?? 'jpeg';
  const filePath = `${userId}/avatar.${ext}`;
  const arrayBuffer = await fetch(uri).then((r) => r.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, { contentType: mimeType, upsert: true });
  if (!uploadError) {
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function VerificationBanner({ email, onDismiss }: { email: string; onDismiss: () => void }) {
  return (
    <View style={s.verifyBanner}>
      <View style={s.verifyIconWrap}>
        <MaterialIcons name="mark-email-unread" size={26} color="#166534" />
      </View>
      <View style={s.verifyBody}>
        <Text style={s.verifyTitle}>Check your inbox!</Text>
        <Text style={s.verifyText}>
          We sent a confirmation link to{' '}
          <Text style={s.verifyEmail}>{email}</Text>
          . Click the link to verify your account, then sign in below.
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={s.verifyDismiss}>
        <MaterialIcons name="close" size={18} color="#166534" />
      </TouchableOpacity>
    </View>
  );
}

function AvatarPicker({ uri, onPress, C }: { uri: string | null; onPress: () => void; C: Colors }) {
  return (
    <View style={s.avatarPickerWrap}>
      <View style={s.avatarPickerContainer}>
        <TouchableOpacity style={s.avatarPickerCircle} onPress={onPress} activeOpacity={0.8}>
          {uri ? (
            <Image source={{ uri }} style={s.avatarPickerImg} resizeMode="cover" />
          ) : (
            <MaterialIcons name="person" size={36} color="#6366F1" />
          )}
        </TouchableOpacity>
        <View style={[s.avatarCameraOverlay, { backgroundColor: C.blue, borderColor: C.card }]}>
          <MaterialIcons name="camera-alt" size={11} color="#fff" />
        </View>
      </View>
      <Text style={[s.avatarPickerHint, { color: C.sub }]}>
        {uri ? 'Tap to change photo' : 'Add a photo (optional)'}
      </Text>
    </View>
  );
}

function SignInFields({
  loginUsername,
  password,
  onChangeUsername,
  onChangePassword,
  onSubmit,
  C,
}: {
  loginUsername: string;
  password: string;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
  C: Colors;
}) {
  return (
    <>
      <Text style={[s.fieldLabel, { color: C.sub }]}>USERNAME</Text>
      <TextInput
        style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
        value={loginUsername}
        onChangeText={onChangeUsername}
        placeholder="your_username"
        placeholderTextColor={C.sub}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        autoComplete="username"
        returnKeyType="next"
      />
      <Text style={[s.fieldLabel, { color: C.sub }]}>PASSWORD</Text>
      <TextInput
        style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
        value={password}
        onChangeText={onChangePassword}
        placeholder="At least 6 characters"
        placeholderTextColor={C.sub}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </>
  );
}

function SignUpFields({
  email,
  displayName,
  username,
  description,
  password,
  onChangeEmail,
  onChangeDisplayName,
  onChangeUsername,
  onChangeDescription,
  onChangePassword,
  onSubmit,
  C,
}: {
  email: string;
  displayName: string;
  username: string;
  description: string;
  password: string;
  onChangeEmail: (v: string) => void;
  onChangeDisplayName: (v: string) => void;
  onChangeUsername: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
  C: Colors;
}) {
  return (
    <>
      <Text style={[s.fieldLabel, { color: C.sub }]}>EMAIL</Text>
      <TextInput
        style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
        value={email}
        onChangeText={onChangeEmail}
        placeholder="you@example.com"
        placeholderTextColor={C.sub}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
      />
      <Text style={[s.fieldLabel, { color: C.sub }]}>DISPLAY NAME</Text>
      <TextInput
        style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
        value={displayName}
        onChangeText={onChangeDisplayName}
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
        onChangeText={onChangeUsername}
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
        onChangeText={onChangeDescription}
        placeholder="A short bio for your profile"
        placeholderTextColor={C.sub}
        autoCapitalize="sentences"
        autoCorrect={false}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <Text style={[s.fieldLabel, { color: C.sub }]}>PASSWORD</Text>
      <TextInput
        style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
        value={password}
        onChangeText={onChangePassword}
        placeholder="At least 6 characters"
        placeholderTextColor={C.sub}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </>
  );
}

function MessageBox({ message, tone, C }: { message: string; tone: MessageTone; C: Colors }) {
  const bgColor = tone === 'error' ? '#DC262612' : `${C.blue}12`;
  const borderColor = tone === 'error' ? '#FCA5A5' : tone === 'success' ? '#86EFAC' : C.border;
  const textColor = tone === 'error' ? '#DC2626' : tone === 'success' ? C.green : C.sub;
  return (
    <View style={[s.messageBox, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[s.messageText, { color: textColor }]}>{message}</Text>
    </View>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useAuthForm() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [loginUsername, setLoginUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>('neutral');
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [localAvatarMimeType, setLocalAvatarMimeType] = useState('image/jpeg');

  useEffect(() => {
    if (Platform.OS === 'web' && globalThis.location?.hash === '#signup') {
      setMode('sign-up');
      globalThis.history?.replaceState(null, '', globalThis.location.pathname);
    }
  }, []);

  const showMessage = (msg: string, tone: MessageTone) => {
    setMessage(msg);
    setMessageTone(tone);
  };

  const pickAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow access to your photo library to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setLocalAvatarUri(asset.uri);
    setLocalAvatarMimeType(asset.mimeType ?? 'image/jpeg');
  };

  const handleSignIn = async () => {
    const un = loginUsername.trim();
    const pw = password;
    if (!un || !pw.trim()) {
      showMessage('Enter your username and password to continue.', 'error');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await signInWithUsername(un, pw);
      if (error) { showMessage(error.message, 'error'); return; }
      setVerificationEmail(null);
      showMessage('Signed in. Loading your account...', 'success');
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();
    const trimmedDescription = description.trim();
    if (!trimmedEmail || !password.trim()) {
      showMessage('Enter an email and password to continue.', 'error');
      return;
    }
    if (!trimmedDisplayName || !trimmedUsername) {
      showMessage('Enter a display name and username to create your account.', 'error');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { data, error } = await signUp(trimmedEmail, password, {
        displayName: trimmedDisplayName,
        username: trimmedUsername,
        description: trimmedDescription,
      });
      if (error) { showMessage(error.message, 'error'); return; }
      if (localAvatarUri && data.user) {
        try { await uploadAvatar(data.user.id, localAvatarUri, localAvatarMimeType); } catch { /* non-fatal */ }
      }
      if (data.session) {
        showMessage('Account created. Loading your account...', 'success');
      } else {
        setVerificationEmail(trimmedEmail);
        setLoginUsername(trimmedUsername);
        setMode('sign-in');
        setMessage(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'sign-in') { void handleSignIn(); } else { void handleSignUp(); }
  };

  const handleSwitchMode = () => {
    const nextMode: Mode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
    setMode(nextMode);
    setMessage(null);
    if (nextMode === 'sign-in') {
      setLoginUsername(username.trim());
      setDisplayName('');
      setUsername('');
      setDescription('');
      setEmail('');
      setLocalAvatarUri(null);
      setLocalAvatarMimeType('image/jpeg');
    } else {
      setLoginUsername('');
    }
  };

  return {
    mode,
    loginUsername, setLoginUsername,
    email, setEmail,
    password, setPassword,
    displayName, setDisplayName,
    username, setUsername,
    description, setDescription,
    busy,
    message, messageTone,
    verificationEmail, setVerificationEmail,
    localAvatarUri,
    pickAvatar,
    handleSubmit,
    handleSwitchMode,
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AuthScreen() {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const form = useAuthForm();
  const isSignIn = form.mode === 'sign-in';

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
            <Text style={[s.brand, { color: C.text }]}>Habit Guard</Text>
            <Text style={[s.heroText, { color: C.sub }]}>
              {isSignIn
                ? 'Pick up your habits on any device.'
                : 'Create your account once and keep your habit history tied to you.'}
            </Text>
          </View>

          {form.verificationEmail ? (
            <VerificationBanner
              email={form.verificationEmail}
              onDismiss={() => form.setVerificationEmail(null)}
            />
          ) : null}

          <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.title, { color: C.text }]}>
              {isSignIn ? 'Sign in to Habit Guard' : 'Create your account'}
            </Text>
            <Text style={[s.caption, { color: C.sub }]}>
              {isSignIn
                ? 'Enter your username and password.'
                : 'Your email is only needed once to create your account.'}
            </Text>

            {isSignIn ? null : (
              <AvatarPicker
                uri={form.localAvatarUri}
                onPress={() => { void form.pickAvatar(); }}
                C={C}
              />
            )}

            {isSignIn ? (
              <SignInFields
                loginUsername={form.loginUsername}
                password={form.password}
                onChangeUsername={form.setLoginUsername}
                onChangePassword={form.setPassword}
                onSubmit={form.handleSubmit}
                C={C}
              />
            ) : (
              <SignUpFields
                email={form.email}
                displayName={form.displayName}
                username={form.username}
                description={form.description}
                password={form.password}
                onChangeEmail={form.setEmail}
                onChangeDisplayName={form.setDisplayName}
                onChangeUsername={form.setUsername}
                onChangeDescription={form.setDescription}
                onChangePassword={form.setPassword}
                onSubmit={form.handleSubmit}
                C={C}
              />
            )}

            {form.message ? (
              <MessageBox message={form.message} tone={form.messageTone} C={C} />
            ) : null}

            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: C.blue }, form.busy && { opacity: 0.72 }]}
              onPress={form.handleSubmit}
              activeOpacity={0.85}
              disabled={form.busy}
            >
              {form.busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>
                  {isSignIn ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.switchBtn, { borderColor: C.border, backgroundColor: C.bg }]}
              onPress={form.handleSwitchMode}
            >
              <Text style={[s.switchText, { color: C.sub }]}>
                {isSignIn ? 'Need an account? Create one' : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
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

  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  verifyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verifyBody: { flex: 1 },
  verifyTitle: { fontSize: 15, fontWeight: '800', color: '#166534', marginBottom: 4 },
  verifyText: { fontSize: 13, color: '#166534', lineHeight: 18 },
  verifyEmail: { fontWeight: '700' },
  verifyDismiss: { padding: 4, flexShrink: 0 },

  avatarPickerWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  avatarPickerContainer: {
    position: 'relative',
  },
  avatarPickerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPickerImg: { width: '100%', height: '100%' },
  avatarCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarPickerHint: {
    marginTop: 8,
    fontSize: 12,
  },
});
