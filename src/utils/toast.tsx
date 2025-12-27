import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  success: {
    backgroundColor: '#10B981',
  },
  error: {
    backgroundColor: '#EF4444',
  },
  info: {
    backgroundColor: '#3B82F6',
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  text2: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
});

const ToastComponent = ({ type, text1, text2 }: { type: string; text1?: string; text2?: string }) => (
  <View style={[styles.container, styles[type as keyof typeof styles] || styles.info]}>
    <View>
      {text1 && <Text style={styles.text1}>{text1}</Text>}
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: BaseToastProps) => <ToastComponent type="success" text1={props.text1} text2={props.text2} />,
  error: (props: BaseToastProps) => <ToastComponent type="error" text1={props.text1} text2={props.text2} />,
  info: (props: BaseToastProps) => <ToastComponent type="info" text1={props.text1} text2={props.text2} />,
};

export const showToast = {
  success: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({ type: 'success', text1: title, text2: message });
  },
  error: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({ type: 'error', text1: title, text2: message });
  },
  info: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({ type: 'info', text1: title, text2: message });
  },
};

export default showToast;

