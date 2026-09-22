import { router, Stack } from 'expo-router';
import { KeyboardAvoidingView, StyleSheet, ScrollView, TouchableOpacity, View, TextInput } from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from "react";
import { TIcon, TText, TView } from '@/components/ui/Themed';
import HiveBg from '@/components/common/HiveBg';
import Button from '@/components/ui/Button';
import EmptyMessage from '@/components/common/EmptyMessage';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from '@/components/common/BackButton';
import DatePickerField from '@/components/ui/DatePickerField';
import OptionsPopup from "@/components/ui/OptionsPopup";

export default function CreateRoomScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
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
        <TView style={[styles.header, styles.shadow]}>
          <LinearGradient
            colors={[secondaryColor, secondaryColor ]}
            style={{padding: 8}}
          >
            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              style={[styles.titleInput, { color: title ? '#fff' : '#fff7' }]}
            />

            <TText style={{opacity: .7, color: 'white', fontSize: 10}}>Created by revie.dev · Private </TText>

            <OptionsPopup
              options={[
                { label: 'Sharing and Privacy', iconName: 'share-variant', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
                { label: 'Create Room with Itinerary', iconName: 'tooltip-account', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
                { label: 'Mark Itinerary as Complete', iconName: 'check-circle', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
                { label: 'Cancel Itinerary', iconName: 'close-circle', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
                { label: 'Delete Itinerary', iconName: 'trash-can', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
              ]}
              style={styles.optionsButton}
            >
              <TIcon name="dots-vertical" size={20} color="white"/>
            </OptionsPopup>

          </LinearGradient>

          <ScrollView 
            contentContainerStyle={styles.headerButtonContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            

            <View style={styles.headerButton}>
              <DatePickerField
                placeholder="Start Date"
                value={startDate}
                onChange={setStartDate}
                minimumDate={new Date()}
                maximumDate={endDate || undefined}
                custom
                customLabelStyle={[styles.headerButtonText, {textDecorationLine: 'underline'}]}
              />

              <TIcon name='chevron-right' size={15}/>
              <DatePickerField
                placeholder="End Date"
                value={endDate}
                onChange={setEndDate}
                minimumDate={startDate || new Date()}
                custom
                customLabelStyle={[styles.headerButtonText, {textDecorationLine: 'underline'}]}
              />
            </View>
            <TouchableOpacity style={styles.headerButton}>
              <TIcon name='pen' size={12}/>
              <TText style={styles.headerButtonText}>{type}</TText>
            </TouchableOpacity>
          </ScrollView>
        </TView>
        
        

        
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
  header:{
    marginTop: 47,
    marginHorizontal: '1%',
    borderRadius: 15,
    overflow: 'hidden'
  },
  titleInput: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
    borderColor: 'transparent',
    height: 30,
    width: '92%',
    marginRight: 40
  },
  headerButtonContainer:{
    marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 10,
    height: 20,
    gap: 4
  },
  headerButton:{
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    flexDirection: 'row',
    borderRadius: 40,
    gap: 4,
  },
  headerButtonText:{
    fontSize: 12,
    opacity: .7
  },
  optionsButton:{
    position: 'absolute',
    right: 0,
    top: -31
  },
});