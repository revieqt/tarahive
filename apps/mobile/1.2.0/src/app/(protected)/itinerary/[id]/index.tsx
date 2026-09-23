import { router, Stack, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useState } from "react";
import { TIcon, TText } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from '@/components/common/BackButton';
import ItineraryHeader from '@/components/itinerary/Header';

export default function CreateRoomScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Solo");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const handleGoBack = () => {
    try{
      router.back();
      return;
    }catch{
      router.push('/');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{backgroundColor, flex: 1}}
    >
      <LinearGradient
        style={styles.topButtons}
        colors={[backgroundColor, 'transparent']}
      >
        <BackButton style={[styles.backButton,, styles.shadow, {backgroundColor: primaryColor}]}/>

        <TouchableOpacity style={[styles.doneButton, styles.shadow, {backgroundColor: accentColor}]}>
          <TIcon name='check' size={16} color='white'/>
          <TText style={{color: '#fff'}}>Done</TText>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={{flexGrow: 1}}
        contentContainerStyle={{paddingBottom: 1000}}
      >
        <ItineraryHeader
          itineraryId={typeof id === 'string' ? id : undefined}
          title={title}
          onTitleChange={setTitle}
          type={type}
          onTypeChange={setType}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          showOptionsMenu
        />
        
        

        
      </ScrollView>

      <LinearGradient
        style={styles.bottomButtons}
        colors={['transparent', backgroundColor ]}
      >
        <ScrollView 
          style={[styles.buttonsContainer, styles.shadow, {backgroundColor: primaryColor}]}
          contentContainerStyle={{padding: 8}}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity>
            <TText>{type}</TText>
          </TouchableOpacity>
        </ScrollView>

      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topButtons:{
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    flexDirection: 'row',
    padding: '3%',
    justifyContent: 'space-between'
  },
  bottomButtons:{
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    flexDirection: 'row',
    padding: '3%',
    justifyContent: 'space-between'
  },
  doneButton:{
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 16
  },
  backButton:{
    borderRadius: 20,
    padding: 3,
    marginLeft: 0
  },
  buttonsContainer:{
    flex: 1,
    borderRadius: 10
  },
  shadow:{
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});