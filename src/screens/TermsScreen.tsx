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

const TermsScreen = () => {
  const navigation = useNavigation();

  const lastUpdated = 'December 28, 2024';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Last Updated: {lastUpdated}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using the Stylio mobile application ("App"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Stylio is a platform that connects users with salon services and home beauty service providers. We facilitate bookings between users and service providers but are not responsible for the actual services provided.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of the App, you must create an account. You agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide accurate and complete information</Text>
            <Text style={styles.bulletItem}>• Maintain the security of your account credentials</Text>
            <Text style={styles.bulletItem}>• Notify us immediately of any unauthorized access</Text>
            <Text style={styles.bulletItem}>• Accept responsibility for all activities under your account</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Booking and Payments</Text>
          <Text style={styles.paragraph}>
            When you make a booking through the App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• You agree to pay the stated price for services</Text>
            <Text style={styles.bulletItem}>• Cancellation policies may apply as specified by the service provider</Text>
            <Text style={styles.bulletItem}>• Refunds are subject to our refund policy and provider terms</Text>
            <Text style={styles.bulletItem}>• Payment information is processed securely through our payment partners</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Use the App for any unlawful purpose</Text>
            <Text style={styles.bulletItem}>• Harass, abuse, or harm service providers or other users</Text>
            <Text style={styles.bulletItem}>• Provide false or misleading information</Text>
            <Text style={styles.bulletItem}>• Attempt to circumvent our booking or payment systems</Text>
            <Text style={styles.bulletItem}>• Copy, modify, or distribute any content from the App</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Service Provider Terms</Text>
          <Text style={styles.paragraph}>
            Service providers on our platform are independent contractors. Stylio does not employ these providers and is not responsible for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Quality of services provided</Text>
            <Text style={styles.bulletItem}>• Injuries or damages during service</Text>
            <Text style={styles.bulletItem}>• Provider availability or punctuality</Text>
            <Text style={styles.bulletItem}>• Disputes between users and providers</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of the App are owned by Stylio and are protected by copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            Stylio shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the App or services booked through it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms and Conditions, please contact us:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>📧 Email: balajinagendranaga@gmail.com</Text>
            <Text style={styles.contactItem}>📞 Phone: +91 6305517488</Text>
            <Text style={styles.contactItem}>📍 Address: Amalapuram, Andhra Pradesh, India</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Stylio, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
    marginBottom: spacing.lg,
    fontStyle: 'italic',
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
  contactInfo: {
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  contactItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  footerText: {
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default TermsScreen;

