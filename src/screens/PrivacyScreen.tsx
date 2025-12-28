import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../utils/theme';

const PrivacyScreen = () => {
  const navigation = useNavigation();

  const lastUpdated = 'December 28, 2024';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Last Updated: {lastUpdated}</Text>

        <View style={styles.introCard}>
          <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introText}>
            At Stylio, we are committed to protecting your personal information and your right to privacy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Account Information:</Text> Name, email, phone number, gender</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Profile Data:</Text> Profile photo, address, preferences</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Booking Information:</Text> Service history, appointments, payments</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Location Data:</Text> Your location for finding nearby services</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Device Information:</Text> Device type, OS, app version</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide and improve our services</Text>
            <Text style={styles.bulletItem}>• Process your bookings and payments</Text>
            <Text style={styles.bulletItem}>• Send you notifications about your appointments</Text>
            <Text style={styles.bulletItem}>• Personalize your experience</Text>
            <Text style={styles.bulletItem}>• Communicate with you about updates and promotions</Text>
            <Text style={styles.bulletItem}>• Ensure security and prevent fraud</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We may share your information with:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Service Providers:</Text> To fulfill your bookings</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Payment Processors:</Text> To process secure payments</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Analytics Partners:</Text> To improve our services</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Legal Requirements:</Text> When required by law</Text>
          </View>
          <Text style={[styles.paragraph, styles.highlight]}>
            We do NOT sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your data:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Encryption of data in transit and at rest</Text>
            <Text style={styles.bulletItem}>• Secure authentication mechanisms</Text>
            <Text style={styles.bulletItem}>• Regular security audits</Text>
            <Text style={styles.bulletItem}>• Access controls and monitoring</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Access:</Text> Request a copy of your personal data</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Correct:</Text> Update inaccurate information</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Delete:</Text> Request deletion of your account</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Opt-out:</Text> Unsubscribe from marketing communications</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Portability:</Text> Receive your data in a portable format</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            Our App may use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our services are not intended for children under 13. We do not knowingly collect information from children under 13. If we learn we have collected such information, we will delete it promptly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as your account is active or as needed to provide services. You can request account deletion at any time through the app settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy periodically. We will notify you of significant changes through the App or via email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={18} color={colors.primary} />
              <Text style={styles.contactText}>balajinagendranaga@gmail.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={18} color={colors.primary} />
              <Text style={styles.contactText}>+91 6305517488</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.contactText}>Amalapuram, Andhra Pradesh, India</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={24} color={colors.success} />
          <Text style={styles.footerText}>
            Your data is encrypted and stored securely
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  introText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletList: {
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
  highlight: {
    marginTop: spacing.md,
    color: colors.success,
    fontWeight: '600',
  },
  contactInfo: {
    marginTop: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: borderRadius.md,
  },
  footerText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '500',
  },
});

export default PrivacyScreen;

