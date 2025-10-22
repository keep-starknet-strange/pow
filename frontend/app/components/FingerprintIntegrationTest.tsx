import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRewardClaimProtection } from '../hooks/useDeviceFingerprint';
import { useFocEngine } from '../context/FocEngineConnector';

/**
 * Test component to verify fingerprint integration points
 * This component can be used for testing the integration during development
 */
const FingerprintIntegrationTest: React.FC = () => {
  const { user } = useFocEngine();
  const { canClaimReward, checkRewardEligibility, isLoading } = useRewardClaimProtection();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testRewardClaimIntegration = async () => {
    if (!user?.account_address) {
      addTestResult('❌ No user address available for testing');
      return;
    }

    try {
      addTestResult('🔄 Testing reward claim eligibility...');
      const eligible = await checkRewardEligibility(user.account_address);
      addTestResult(eligible ? '✅ Reward claim eligibility check passed' : '❌ Reward claim eligibility check failed');
    } catch (error: any) {
      addTestResult(`❌ Reward claim test failed: ${error.message}`);
    }
  };

  const testRewardClaimValidationIntegration = async () => {
    if (!user?.account_address) {
      addTestResult('❌ No user address available for testing');
      return;
    }

    try {
      addTestResult('🔄 Testing reward claim fingerprint validation...');
      
      // Simulate the reward claim validation flow
      const response = await fetch(`${process.env.EXPO_PUBLIC_FOC_ENGINE_API || 'http://localhost:8080'}/fingerprint/validate-reward-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_address: user.account_address,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        addTestResult(result.is_unique ? '✅ Reward claim fingerprint validation passed - device can claim reward' : '❌ Reward claim fingerprint validation failed - device already claimed reward');
      } else {
        addTestResult('❌ Reward claim fingerprint validation failed - API error');
      }
    } catch (error: any) {
      addTestResult(`❌ Reward claim validation test failed: ${error.message}`);
    }
  };

  const testRateLimiting = async () => {
    addTestResult('🔄 Testing rate limiting...');
    
    // Try to make multiple requests quickly to test rate limiting
    const promises = Array.from({ length: 6 }, (_, i) => 
      checkRewardEligibility(user?.account_address || 'test-address')
        .then(() => addTestResult(`✅ Request ${i + 1} succeeded`))
        .catch((error: any) => addTestResult(`❌ Request ${i + 1} failed: ${error.message}`))
    );

    await Promise.allSettled(promises);
    addTestResult('✅ Rate limiting test completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fingerprint Integration Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testRewardClaimIntegration}>
          <Text style={styles.buttonText}>Test Reward Claim Integration</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testRewardClaimValidationIntegration}>
          <Text style={styles.buttonText}>Test Reward Claim Validation Integration</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testRateLimiting}>
          <Text style={styles.buttonText}>Test Rate Limiting</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Current Status:</Text>
        <Text style={styles.statusText}>Can Claim Reward: {canClaimReward ? '✅' : '❌'}</Text>
        <Text style={styles.statusText}>Loading: {isLoading ? '🔄' : '✅'}</Text>
        <Text style={styles.statusText}>User Address: {user?.account_address || 'Not available'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default FingerprintIntegrationTest;
