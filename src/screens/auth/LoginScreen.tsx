import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth, TEST_CREDENTIALS } from '../../hooks';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { showToast } from '../../utils';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login, testLogin, isLoading, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showToast.error('Error', 'Please enter username and password');
      return;
    }

    try {
      await login({ username: username.trim(), password });
      showToast.success('Success', 'Login successful');
    } catch (err: any) {
      showToast.error('Login Failed', err.response?.data?.message || 'Please check your credentials');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={['#E94560', '#FF6B6B', '#EE5A24']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.logoInner}>
                  <Text style={styles.logoLetter}>S</Text>
                </View>
              </LinearGradient>
              <View style={styles.scissorsIcon}>
                <Ionicons name="cut" size={18} color="#E94560" />
              </View>
            </View>
            <Text style={styles.title}>Stylio</Text>
            <Text style={styles.subtitle}>Your Style, Perfected</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username or Email"
                placeholderTextColor={colors.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.secondaryButtonText}>Create an Account</Text>
            </TouchableOpacity>

            {/* Test Login Button - For Development Only */}
            <View style={styles.testSection}>
              <Text style={styles.testSectionLabel}>🧪 Development Testing</Text>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => {
                  testLogin();
                  showToast.success('Test Login', 'Logged in as test user');
                }}
              >
                <Ionicons name="flask-outline" size={20} color="#FFF" />
                <Text style={styles.testButtonText}>Quick Test Login</Text>
              </TouchableOpacity>
              <Text style={styles.testCredentials}>
                Username: {TEST_CREDENTIALS.username} | Password: {TEST_CREDENTIALS.password}
              </Text>
              <TouchableOpacity
                style={styles.fillCredentialsButton}
                onPress={() => {
                  setUsername(TEST_CREDENTIALS.username);
                  setPassword(TEST_CREDENTIALS.password);
                  showToast.info('Filled', 'Test credentials filled');
                }}
              >
                <Text style={styles.fillCredentialsText}>Fill Test Credentials</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    padding: 3,
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoInner: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 52,
    fontWeight: '800',
    color: '#E94560',
    fontStyle: 'italic',
  },
  scissorsIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#E94560',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E94560',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  testSection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FF9800',
    borderStyle: 'dashed',
  },
  testSectionLabel: {
    ...typography.bodySmall,
    color: '#E65100',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  testButtonText: {
    ...typography.button,
    color: '#FFF',
  },
  testCredentials: {
    ...typography.caption,
    color: '#795548',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  fillCredentialsButton: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  fillCredentialsText: {
    ...typography.bodySmall,
    color: '#FF5722',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

