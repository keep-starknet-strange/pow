import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDeviceFingerprint } from '../hooks/useDeviceFingerprint';

const FingerprintTest: React.FC = () => {
  const { 
    fingerprint, 
    isLoading, 
    error, 
    refreshFingerprint, 
    isFingerprintValid 
  } = useDeviceFingerprint();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Fingerprint Test</Text>
      
      {isLoading && (
        <Text style={styles.status}>Loading device fingerprint...</Text>
      )}
      
      {error && (
        <Text style={styles.error}>Error: {error.message}</Text>
      )}
      
      {fingerprint && (
        <View style={styles.fingerprintInfo}>
          <Text style={styles.label}>Visitor ID:</Text>
          <Text style={styles.value}>{fingerprint.visitorId}</Text>
          
          <Text style={styles.label}>Confidence:</Text>
          <Text style={styles.value}>{fingerprint.confidence}</Text>
          
          <Text style={styles.label}>Request ID:</Text>
          <Text style={styles.value}>{fingerprint.requestId}</Text>
          
          <Text style={styles.label}>Timestamp:</Text>
          <Text style={styles.value}>{new Date(fingerprint.timestamp).toLocaleString()}</Text>
          
          {fingerprint.deviceInfo && (
            <>
              <Text style={styles.label}>OS:</Text>
              <Text style={styles.value}>{fingerprint.deviceInfo.os} {fingerprint.deviceInfo.osVersion}</Text>
              
              <Text style={styles.label}>Device:</Text>
              <Text style={styles.value}>{fingerprint.deviceInfo.device}</Text>
            </>
          )}
        </View>
      )}
      
      <Text style={styles.status}>
        Valid: {isFingerprintValid ? 'Yes' : 'No'}
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={refreshFingerprint}>
        <Text style={styles.buttonText}>Refresh Fingerprint</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
  },
  fingerprintInfo: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  value: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FingerprintTest;
