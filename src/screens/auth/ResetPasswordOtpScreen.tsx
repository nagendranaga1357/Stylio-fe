import React, { useState, useRef, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { authService } from '../../services';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { showToast } from '../../utils';

const ResetPasswordOtpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email = route.params?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [resetToken, setResetToken] = useState('');

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showToast.error('Error', 'Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const token = await authService.verifyResetOtp(email, otpString);
      setResetToken(token);
      setStep('password');
      showToast.success('OTP Verified', 'Now enter your new password');
    } catch (err: any) {
      showToast.error('Error', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast.error('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      showToast.error('Error', 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      showToast.success('Success', 'Password reset successfully. Please login.');
      navigation.navigate('Login');
    } catch (err: any) {
      showToast.error('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      showToast.success('OTP Sent', 'New OTP sent to your email');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      showToast.error('Error', 'Failed to resend OTP');
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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name={step === 'otp' ? 'key-outline' : 'lock-closed-outline'} 
              size={48} 
              color={colors.primary} 
            />
          </View>

          {/* Header */}
          <Text style={styles.title}>
            {step === 'otp' ? 'Verify OTP' : 'New Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'otp' 
              ? `Enter the 6-digit code sent to\n${email}`
              : 'Create a strong new password for your account'
            }
          </Text>

          {step === 'otp' ? (
            <>
              {/* OTP Inputs */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={[styles.otpInput, digit && styles.otpInputFilled]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </TouchableOpacity>

              {/* Resend */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdown}>Resend in {countdown}s</Text>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Password Inputs */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor={colors.textLight}
                  value={newPassword}
                  onChangeText={setNewPassword}
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

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor={colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              <Text style={styles.hint}>
                Password must be at least 8 characters
              </Text>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
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
  hint: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.lg,
    marginLeft: spacing.sm,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  countdown: {
    ...typography.body,
    color: colors.textLight,
  },
});

export default ResetPasswordOtpScreen;

