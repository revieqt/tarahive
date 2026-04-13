import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import { useSession } from '@/context/SessionContext';
import Switch from '@/components/Switch';
import Button from '@/components/Button';
import SliderBar from '@/components/Slider';
import { CustomAlert } from '@/components/Alert';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEnableTaraBuddy, useDisableTaraBuddy, useUpdateGenderPreference, useUpdateDistancePreference, useUpdateAgePreference, useUpdateZodiacPreference } from '@/hooks/useTarabuddy';

export default function TaraBuddyPreference() {
  const { session, updateSession } = useSession();
  const user = session?.user;
  const accentColor = useThemeColor({}, 'accent');
  
  // Get TaraBuddy settings from user object
  const taraBuddySettings = user?.taraBuddySettings;
  const isEnabled = taraBuddySettings?.isTaraBuddyEnabled || false;

  // Local state for preferences
  const [isEnabledLocal, setIsEnabledLocal] = useState(isEnabled);
  const [genderPref, setGenderPref] = useState(taraBuddySettings?.preferredGender || 'All');
  const [distancePref, setDistancePref] = useState(taraBuddySettings?.preferredDistance || 20);
  const [agePref, setAgePref] = useState<[number, number]>((taraBuddySettings?.preferredAgeRange as [number, number]) || [18, 50]);
  const [zodiacPref, setZodiacPref] = useState(taraBuddySettings?.preferredZodiac || []);

  // Alerts
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string }>({ title: '', message: '' });

  // Mutations
  const enableMutation = useEnableTaraBuddy();
  const disableMutation = useDisableTaraBuddy();
  const updateGenderMutation = useUpdateGenderPreference();
  const updateDistanceMutation = useUpdateDistancePreference();
  const updateAgeMutation = useUpdateAgePreference();
  const updateZodiacMutation = useUpdateZodiacPreference();

  const isLoading = enableMutation.isPending || disableMutation.isPending || 
    updateGenderMutation.isPending || updateDistanceMutation.isPending ||
    updateAgeMutation.isPending || updateZodiacMutation.isPending;

  // Handle toggle TaraBuddy
  const handleToggleTaraBuddy = async (value: boolean) => {
    setIsEnabledLocal(value);
    try {
      if (value) {
        const result = await enableMutation.mutateAsync();
        await updateSession({
          user: {
            ...(user as any),
            taraBuddySettings: result,
          } as any,
        });
        setAlertConfig({
          title: 'Success',
          message: 'TaraBuddy enabled! Start finding your travel buddies.',
        });
      } else {
        const result = await disableMutation.mutateAsync();
        await updateSession({
          user: {
            ...(user as any),
            taraBuddySettings: result,
          } as any,
        });
        setAlertConfig({
          title: 'Success',
          message: 'TaraBuddy disabled.',
        });
      }
      setAlertVisible(true);
    } catch (error) {
      setIsEnabledLocal(!value);
      setAlertConfig({
        title: 'Error',
        message: (error as Error).message || 'Failed to update TaraBuddy status.',
      });
      setAlertVisible(true);
    }
  };

  // Handle gender preference change
  const handleGenderChange = async (value: string) => {
    setGenderPref(value);
    console.log('🟡 Gender preference change:', value);
    try {
      console.log('📤 Calling updateGenderMutation with:', value);
      const result = await updateGenderMutation.mutateAsync(value);
      console.log('✅ Gender preference mutation returned:', result);
      
      try {
        await updateSession({
          user: {
            ...(user as any),
            taraBuddySettings: {
              ...(user?.taraBuddySettings as any),
              preferredGender: value,
            },
          } as any,
        });
        console.log('✅ Session updated successfully');
      } catch (sessionError) {
        const sessionErrorMsg = sessionError instanceof Error ? sessionError.message : String(sessionError);
        console.error('❌ Session update failed:', sessionErrorMsg);
      }
      
      setTimeout(() => {
        setAlertConfig({
          title: 'Success',
          message: 'Gender preference updated!',
        });
        setAlertVisible(true);
      }, 100);
    } catch (error) {
      console.error('❌ Gender preference update failed:', error);
      setGenderPref(taraBuddySettings?.preferredGender || 'All');
      setAlertConfig({
        title: 'Error',
        message: (error as Error).message || 'Failed to update gender preference.',
      });
      setAlertVisible(true);
    }
  };

  // Handle distance preference change
  const handleDistanceChange = async (value: number | [number, number]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setDistancePref(numValue);
    console.log('🟡 Distance preference change:', numValue);
    try {
      console.log('📤 Calling updateDistanceMutation with:', numValue);
      const result = await updateDistanceMutation.mutateAsync(numValue);
      console.log('✅ Distance preference mutation returned:', result);
      
      try {
        await updateSession({
          user: {
            ...(user as any),
            taraBuddySettings: {
              ...(user?.taraBuddySettings as any),
              preferredDistance: numValue,
            },
          } as any,
        });
        console.log('✅ Session updated successfully');
      } catch (sessionError) {
        const sessionErrorMsg = sessionError instanceof Error ? sessionError.message : String(sessionError);
        console.error('❌ Session update failed:', sessionErrorMsg);
      }
      
      setTimeout(() => {
        setAlertConfig({
          title: 'Success',
          message: 'Distance preference updated!',
        });
        setAlertVisible(true);
      }, 100);
    } catch (error) {
      console.error('❌ Distance preference update failed:', error);
      setDistancePref(taraBuddySettings?.preferredDistance || 20);
      setAlertConfig({
        title: 'Error',
        message: (error as Error).message || 'Failed to update distance preference.',
      });
      setAlertVisible(true);
    }
  };

  // Handle age preference change
  const handleAgeChange = async (value: number | [number, number]) => {
    // Ensure we have a valid tuple
    let arrayValue: [number, number];
    
    if (Array.isArray(value)) {
      // Ensure it's exactly 2 numbers and they're integers
      const [min, max] = value;
      arrayValue = [Math.round(min), Math.round(max)];
      console.log('🟡 Age slider value received:', value, '-> rounded to:', arrayValue);
    } else {
      arrayValue = [value, value];
    }
    
    console.log('🟡 Age preference change:', arrayValue, 'typeof:', typeof arrayValue[0], typeof arrayValue[1]);
    setAgePref(arrayValue);
    
    try {
      console.log('📤 Calling updateAgeMutation with:', arrayValue);
      const result = await updateAgeMutation.mutateAsync(arrayValue);
      console.log('✅ Age preference mutation returned:', result);
      
      // Update session context
      console.log('📝 Updating session with new age preference...');
      try {
        await updateSession({
          user: {
            ...(user as any),
            taraBuddySettings: {
              ...(user?.taraBuddySettings as any),
              preferredAgeRange: arrayValue,
            },
          } as any,
        });
        console.log('✅ Session updated successfully');
      } catch (sessionError) {
        const sessionErrorMsg = sessionError instanceof Error ? sessionError.message : String(sessionError);
        console.error('❌ Session update failed:', sessionErrorMsg);
        // Continue anyway - backend already succeeded
      }
      
      // Show success alert
      setTimeout(() => {
        setAlertConfig({
          title: 'Success',
          message: 'Age preference updated!',
        });
        setAlertVisible(true);
      }, 100);
    } catch (error) {
      console.error('❌ Age preference update failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAgePref((taraBuddySettings?.preferredAgeRange as [number, number]) || [18, 50]);
      setAlertConfig({
        title: 'Error',
        message: errorMessage || 'Failed to update age preference.',
      });
      setAlertVisible(true);
    }
  };

  // Handle zodiac preference change
  const handleZodiacChange = async (zodiac: string) => {
    const newZodiacPref = zodiacPref.includes(zodiac)
      ? zodiacPref.filter((z) => z !== zodiac)
      : [...zodiacPref, zodiac];
    setZodiacPref(newZodiacPref);
    console.log('🟡 Zodiac preference change:', newZodiacPref);
    try {
      console.log('📤 Calling updateZodiacMutation with:', newZodiacPref);
      const result = await updateZodiacMutation.mutateAsync(newZodiacPref);
      console.log('✅ Zodiac preference mutation returned:', result);
      
      try {
        await updateSession({
          user: {
            ...(user as any),
            taraBuddySettings: {
              ...(user?.taraBuddySettings as any),
              preferredZodiac: newZodiacPref,
            },
          } as any,
        });
        console.log('✅ Session updated successfully');
      } catch (sessionError) {
        const sessionErrorMsg = sessionError instanceof Error ? sessionError.message : String(sessionError);
        console.error('❌ Session update failed:', sessionErrorMsg);
      }
      
      setTimeout(() => {
        setAlertConfig({
          title: 'Success',
          message: 'Zodiac preference updated!',
        });
        setAlertVisible(true);
      }, 100);
    } catch (error) {
      console.error('❌ Zodiac preference update failed:', error);
      setZodiacPref(taraBuddySettings?.preferredZodiac || []);
      setAlertConfig({
        title: 'Error',
        message: (error as Error).message || 'Failed to update zodiac preference.',
      });
      setAlertVisible(true);
    }
  };

  // Gender options
  const genderOptions = ['All', 'Male', 'Female', 'Non-binary'];
  
  // Zodiac options
  const zodiacOptions = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  return (
    <ThemedView style={{ flex: 1 }}>
      <GradientBlobs />
      <KeyboardAvoidingView
        style={{}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ padding: 16 }}>
            <BackButton />
            <ThemedText type='title'>
              TaraBuddy Preferences
            </ThemedText>
            <ThemedText>
              Update your preferences to find better matches with TaraBuddy!
            </ThemedText>
          </View>

          {/* Enable TaraBuddy Toggle */}
          <ThemedView color='primary' style={styles.sectionContainer}>
            <Switch
              key="2fa"
              label={isEnabledLocal ? 'Active' : 'Inactive'}
              description="Enable TaraBuddy"
              value={isEnabledLocal}
              onValueChange={handleToggleTaraBuddy}
            />
          </ThemedView>

          {/* Gender Preference */}
          {isEnabledLocal && (
            <>
              <ThemedView color='primary' style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Preferred Gender
                </ThemedText>
                <View style={styles.genderButtonContainer}>
                  {genderOptions.map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        genderPref === gender && styles.genderButtonActive,
                      ]}
                      onPress={() => handleGenderChange(gender)}
                      disabled={isLoading}
                    >
                      <ThemedText
                        style={[
                          { fontSize: 12 },
                          genderPref === gender && { color: 'white' },
                        ]}
                      >
                        {gender}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ThemedView>

              <ThemedView color='primary' style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Preferred Zodiac Signs
                </ThemedText>
                <ThemedText style={[styles.sectionChildDescription, { marginBottom: 12 }]}>
                  {zodiacPref.length > 0 ? `${zodiacPref.length} selected` : 'Select any zodiac signs'}
                </ThemedText>
                <View style={styles.zodiacButtonContainer}>
                  {zodiacOptions.map((zodiac) => (
                    <TouchableOpacity
                      key={zodiac}
                      style={[
                        styles.zodiacButton,
                        zodiacPref.includes(zodiac) && styles.zodiacButtonActive,
                      ]}
                      onPress={() => handleZodiacChange(zodiac)}
                      disabled={isLoading}
                    >
                      <ThemedText
                        style={[
                          styles.zodiacButtonText,
                          zodiacPref.includes(zodiac) && { color: 'white' },
                        ]}
                      >
                        {zodiac}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ThemedView>

              

              {/* Age Preference */}
              {/* <ThemedView color='primary' style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Preferred Age Range
                </ThemedText>
                <SliderBar
                  range={[18, 100]}
                  rangeBar
                  label='years'
                  description='Age'
                  displayValue
                  onValueChange={handleAgeChange}
                  initialValues={agePref}
                />
              </ThemedView> */}

              <ThemedView color='primary' style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Preferred Distance
                </ThemedText>
                <SliderBar
                  range={[1, 100]}
                  label='km'
                  description='Distance'
                  displayValue
                  onValueChange={handleDistanceChange}
                  initialValue={distancePref}
                />
              </ThemedView>
            </>
          )}

          {!isEnabledLocal && (
            <View style={{ padding: 16 }}>
              <ThemedText style={{ textAlign: 'center', opacity: 0.6 }}>
                Enable TaraBuddy to start customizing your preferences and finding travel buddies!
              </ThemedText>
            </View>
          )}

          {isLoading && (
            <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size='large' color={accentColor} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        fadeAfter={3000}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionChild: {
    flexDirection: 'row',
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionChildDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  genderButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff2',
  },
  genderButtonActive: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  zodiacButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zodiacButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff2',
  },
  zodiacButtonActive: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  zodiacButtonText: {
    fontSize: 11,
  },
});
