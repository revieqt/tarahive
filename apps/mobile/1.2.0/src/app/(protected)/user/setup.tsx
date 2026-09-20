import HiveBg from '@/components/common/HiveBg';
import Button from '@/components/ui/Button';
import DatePickerField from '@/components/ui/DatePickerField';
import TextField from '@/components/ui/TextField';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useSetupAccount } from '@/hooks/user/useSetupAccount';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const INTERESTS = [
	'Adventure',
	'Culture',
	'Food',
	'Nature',
	'Photography',
	'Relaxation',
	'Shopping',
	'Sports',
	'Wellness',
];

const GENDERS = [
	{ label: 'Female', icon: 'gender-female' },
	{ label: 'Male', icon: 'gender-male' },
	{ label: 'Non-binary', icon: 'gender-non-binary' },
	{ label: 'Prefer not to say', icon: 'account-question-outline' },
];

const STEP_COPY = [
	{
		title: 'Tell us your name',
		subtitle: 'This is how we will introduce you to the Tarahive community.',
	},
	{
		title: 'A little more about you',
		subtitle: 'Your date of birth and gender help us personalize your experience.',
	},
	{
		title: 'Find your kind of travel',
		subtitle: 'Choose at least three interests to shape your recommendations.',
	},
];

export default function SetupScreen() {
	const [tab, setTab] = useState(0);
	const [fname, setFname] = useState('');
	const [lname, setLname] = useState('');
	const [bdate, setBdate] = useState<Date | null>(null);
	const [gender, setGender] = useState('');
	const [interests, setInterests] = useState<string[]>([]);
	const { validateStep, submitSetup, isSubmitting } = useSetupAccount();
	const stepCopy = STEP_COPY[tab];
    const secondaryColor = useThemeColor({}, 'secondary');
    const accentColor = useThemeColor({}, 'accent');

	const formValues = { fname, lname, bdate: bdate?.toISOString() || '', gender, interests };

	const goNext = () => {
		if (!validateStep(tab, formValues)) return;
		setTab((currentTab) => currentTab + 1);
	};

	const toggleInterest = (interest: string) => {
		setInterests((current) =>
			current.includes(interest)
				? current.filter((item) => item !== interest)
				: [...current, interest],
		);
	};

	const handleSubmit = async () => {
		if (!validateStep(2, formValues) || !bdate) return;

		try {
			await submitSetup({
				fname,
				lname,
				bdate: bdate.toISOString(),
				gender,
				interests,
			});
		} catch {
			// The hook displays the setup error.
		}
	};

	return (
		<TView style={{flex: 1}}>
			<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
				<View style={styles.header}>
                    <TText type='title'>{stepCopy.title}</TText>
                    <TText style={{opacity: 0.7}}>{stepCopy.subtitle}</TText>

                    <View style={styles.tabs}>
                        {[0, 1, 2].map((item) => (
                            <View key={item} style={[styles.tab, item <= tab && {backgroundColor: accentColor}]} />
                        ))}
                    </View>
                    
                    <View style={styles.hiveBgContainer}>
                        <HiveBg/>
                    </View>
                    
                </View>

				{tab === 0 && (
					<View style={styles.section}>
						<TextField placeholder="First name" value={fname} onChangeText={setFname} autoCapitalize="words" />
						<TextField placeholder="Last name" value={lname} onChangeText={setLname} autoCapitalize="words" />
					</View>
				)}

				{tab === 1 && (
					<View style={styles.section}>
						<DatePickerField
							placeholder="Date of birth"
							value={bdate}
							onChange={setBdate}
							maximumDate={new Date()}
						/>

						<View style={styles.choiceGrid}>
							{GENDERS.map((option) => (
								<TouchableOpacity
									key={option.label}
									onPress={() => setGender(option.label)}
									style={styles.choice}
								>
									<TIcon
										name={option.icon}
										size={20}
                                        style={{ 
                                            backgroundColor: gender === option.label ? secondaryColor + '80' : undefined,
                                            padding: 8,
                                            borderRadius: 50,
                                        }}
									/>
									<TText
										style={[styles.selectedChoiceText, gender === option.label && { color: secondaryColor, fontWeight: '600', opacity: 1 }]}
									>
										{option.label}
									</TText>
								</TouchableOpacity>
							))}
						</View>
					</View>
				)}

				{tab === 2 && (
					<View style={styles.section}>
						<View style={styles.interestGrid}>
							{INTERESTS.map((interest) => {
								const selected = interests.includes(interest);
								return (
									<TouchableOpacity
										key={interest}
										onPress={() => toggleInterest(interest)}
										style={[styles.interest, selected && { backgroundColor: secondaryColor + '20'  }]}
									>
										<TText>{interest}</TText>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
				)}
			</ScrollView>

			<View style={styles.actions}>
				{tab > 0 && (
					<Button title="Back" onPress={() => setTab((currentTab) => currentTab - 1)} buttonStyle={styles.actionButton} />
				)}
				<Button
					title={tab === 2 ? 'Finish' : 'Continue'}
					onPress={tab === 2 ? handleSubmit : goNext}
					type="primary"
					disabled={tab === 2 ? interests.length < 3 : false}
					loading={isSubmitting}
					buttonStyle={styles.actionButton}
				/>
			</View>
		</TView>
	);
}

const styles = StyleSheet.create({
	container: { flexGrow: 1},
    header:{
        padding: '3%',
        paddingTop: 50,
        overflow: 'hidden',
    },
    hiveBgContainer:{
        position: 'absolute',
        top: -20,
        left: 0,
        right: -30,
        bottom: 0,
        zIndex: -1,
    },
	tabs: { 
        flexDirection: 'row', 
        gap: 8,
        marginTop: 10
    },
	tab: { 
        height: 4, 
        flex: 1, 
        borderRadius: 2, 
        backgroundColor: '#9996' 
    },
	section: { 
        paddingHorizontal: '3%',
        paddingVertical: 8,
    },
	choiceGrid: {
		flexDirection: 'row'
	},
	choice: {
		flex: 1,
		alignItems: 'center',
		gap: 4,
		paddingVertical: 10,
		paddingHorizontal: 4,
	},
	selectedChoiceText: { 
        fontWeight: '500',
        fontSize: 12,
        opacity: 0.7,
        textAlign: 'center',
    },
	interestGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8
    },
	interest: { 
        borderWidth: 1, 
        borderColor: '#ccc4', 
        borderRadius: 20, 
        paddingVertical: 9, 
        paddingHorizontal: 14 
    },
	actions: { 
        flexDirection: 'row', 
        gap: 10, 
        position: 'absolute',
        bottom: 16,
        right: '3%',
        left: '3%',
    },
	actionButton: { 
        flex: 1 
    },
});
