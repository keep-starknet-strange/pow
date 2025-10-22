import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFingerprintValidation, useRewardClaimProtection } from '../hooks/useDeviceFingerprint';
import { useFocEngine } from '../context/FocEngineConnector';

const FingerprintValidationExample: React.FC = () => {
  const { user } = useFocEngine();
  const { 
    fingerprint, 
    isLoading, 
    error, 
    validationResult, 
    validateFingerprint 
  } = useFingerprintValidation();
  
  const { 
    canClaimReward, 
    checkRewardEligibility 
  } = useRewardClaimProtection();
  
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateFingerprint = async () => {
    if (!user?.account_address) {
      Alert.alert('Error', 'No user address available');
      return;
    }

    setIsValidating(true);
    try {
      await validateFingerprint(user.account_address);
      Alert.alert('Success', 'Reward claim validation successful');
    } catch (error) {
      Alert.alert('Error', 'Reward claim validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckRewardEligibility = async () => {
    if (!user?.account_address) {
      Alert.alert('Error', 'No user address available');
      return;
    }

    try {
      const eligible = await checkRewardEligibility(user.account_address);
      Alert.alert(
        'Reward Eligibility', 
        eligible ? 'You are eligible to claim rewards' : 'You are not eligible to claim rewards'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check reward eligibility');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fingerprint Validation Example</Text>
      
      {isLoading && (
        <Text style={styles.status}>Loading fingerprint...</Text>
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
        </View>
      )}
      
      {validationResult && (
        <View style={styles.validationInfo}>
          <Text style={styles.label}>Reward Claim Validation Result:</Text>
          <Text style={styles.value}>
            Can Claim Reward: {validationResult.is_unique ? 'Yes' : 'No (device already claimed)'}
          </Text>
          <Text style={styles.value}>
            Fingerprint Valid: {validationResult.is_valid ? 'Yes' : 'No'}
          </Text>
          {validationResult.message && (
            <Text style={styles.value}>Message: {validationResult.message}</Text>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isValidating && styles.buttonDisabled]} 
          onPress={handleValidateFingerprint}
          disabled={isValidating}
        >
          <Text style={styles.buttonText}>
            {isValidating ? 'Validating...' : 'Validate Reward Claim'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCheckRewardEligibility}
        >
          <Text style={styles.buttonText}>Check Reward Eligibility</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.status}>
        Can Claim Reward: {canClaimReward ? 'Yes' : 'No'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  error: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#ff0000',
  },
  fingerprintInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  validationInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FingerprintValidationExample;
