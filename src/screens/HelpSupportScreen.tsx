import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { showToast } from '../utils';

// Contact Information
const CONTACT_INFO = {
  name: 'Balaji',
  phone: '+91 6305517488',
  email: 'balajinagendranaga@gmail.com',
  address: 'Amalapuram, Andhra Pradesh, India',
  whatsapp: '+916305517488',
};

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I book an appointment?',
    answer: 'Browse salons or services, select your preferred options, choose a date and time slot, and confirm your booking. You can pay online or at the salon.',
  },
  {
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes, you can cancel or reschedule your booking from the "My Bookings" section. Please note that cancellation policies may vary by salon.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit/debit cards, UPI payments, net banking, and wallet payments. You can also pay at the salon.',
  },
  {
    question: 'How do I contact a salon directly?',
    answer: 'You can find the salon\'s contact information on their profile page. Tap on the phone icon to call them directly.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard encryption and security measures to protect your payment information. We never store your card details.',
  },
  {
    question: 'How do home services work?',
    answer: 'For home services, a verified professional will visit your location at the scheduled time. You can track their arrival in the app.',
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We have a satisfaction guarantee policy. Contact our support team within 24 hours of your appointment, and we\'ll help resolve any issues.',
  },
];

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_INFO.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT_INFO.email}?subject=Support Request - Stylio App`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hi, I need help with the Stylio app.`);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      showToast.error('Error', 'Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackText('');
      showToast.success('Thank you!', 'Your feedback has been submitted successfully.');
    }, 1500);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Contact Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.contactCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.contactHeader}>
            <MaterialCommunityIcons name="headset" size={32} color="#FFF" />
            <Text style={styles.contactTitle}>Need Help?</Text>
            <Text style={styles.contactSubtitle}>
              We're here to assist you 24/7
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="person" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.contactText}>{CONTACT_INFO.name}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.contactText}>{CONTACT_INFO.address}</Text>
            </View>
          </View>

          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactButton, styles.whatsappButton]} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={[styles.contactButtonText, { color: '#FFF' }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons 
                  name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.textLight} 
                />
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Feedback</Text>
          <View style={styles.feedbackCard}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us how we can improve..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitFeedback}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinks}>
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => navigation.navigate('Terms' as never)}
            >
              <View style={styles.quickLinkIcon}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickLinkText}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => navigation.navigate('Privacy' as never)}
            >
              <View style={styles.quickLinkIcon}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickLinkText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => Linking.openURL('https://stylio.app')}
            >
              <View style={styles.quickLinkIcon}>
                <Ionicons name="globe" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickLinkText}>Visit Website</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Stylio v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Stylio. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  contactCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  contactHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: spacing.sm,
  },
  contactSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  contactInfo: {
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFF',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
    marginBottom: spacing.md,
  },
  faqItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  feedbackInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  quickLinks: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  versionText: {
    fontSize: 12,
    color: colors.textLight,
  },
  copyrightText: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});

export default HelpSupportScreen;

