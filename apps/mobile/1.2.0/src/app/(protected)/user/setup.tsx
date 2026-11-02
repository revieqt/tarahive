import DatePickerField from '@/components/ui/DatePickerField';
import RoundButton from '@/components/ui/RoundButton';
import TextField from '@/components/ui/TextField';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import Wave from '@/components/ui/Wave';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { useSetupAccount } from '@/hooks/user/useSetupAccount';
import { router } from 'expo-router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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

type SetupSlide = {
	id: string;
	seconds?: number;
	onPress?: () => void;
	disabled?: boolean;
	children: ReactNode;
};

export default function SetupScreen() {
	const [slideIndex, setSlideIndex] = useState(0);
	const [fname, setFname] = useState('');
	const [lname, setLname] = useState('');
	const [bdate, setBdate] = useState<Date | null>(null);
	const [gender, setGender] = useState('');
	const [interests, setInterests] = useState<string[]>([]);
	const { validateStep, submitSetup, isSubmitting } = useSetupAccount();
	const secondaryColor = useThemeColor({}, 'secondary');
	const accentColor = useThemeColor({}, 'accent');
	const opacity = useRef(new Animated.Value(1)).current;
	const backgroundOpacity = useRef(new Animated.Value(0)).current;
	const backgroundHasFadedIn = useRef(false);

	const formValues = { fname, lname, bdate: bdate?.toISOString() || '', gender, interests };

	const transitionTo = (nextSlideIndex: number, onComplete?: () => void) => {
		Animated.timing(opacity, {
			toValue: 0,
			duration: 350,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (!finished) return;

			setSlideIndex(nextSlideIndex);
			Animated.timing(opacity, {
				toValue: 1,
				duration: 350,
				useNativeDriver: true,
			}).start(({ finished: fadeInFinished }) => {
				if (fadeInFinished) onComplete?.();
			});
		});
	};

	const goNext = (step: number) => {
		if (!validateStep(step, formValues)) return;
		transitionTo(slideIndex + 1);
	};

	const toggleInterest = (interest: string) => {
		setInterests((current) =>
			current.includes(interest)
				? current.filter((item) => item !== interest)
				: [...current, interest],
		);
	};

	const handleSubmit = async () => {
		if (!validateStep(3, formValues) || !bdate) return;

		try {
			await submitSetup({
				fname,
				lname,
				bdate: bdate.toISOString(),
				gender,
				interests,
			});
			transitionTo(slideIndex + 1);
		} catch {
			// The hook displays the setup error.
		}
	};

	const finishSetup = () => {
		Animated.timing(opacity, {
			toValue: 0,
			duration: 350,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) router.replace('/home');
		});
	};

	const slides: SetupSlide[] = [
		{
			id: 'hello',
			seconds: 4,
			children: <TText style={styles.introText}>Hello</TText>,
		},
		{
			id: 'name',
			onPress: () => goNext(0),
			disabled: !fname.trim() || !lname.trim(),
			children: (
				<View style={styles.centerSlide}>
					<View style={styles.header}>
						<TText type="title" style={styles.title}>Tell us your name</TText>
						<TText style={styles.subtitle}>This is how we will introduce you to the Tarahive community.</TText>
					</View>
					<View style={styles.section}>
						<TextField placeholder="First name" value={fname} onChangeText={setFname} autoCapitalize="words" />
						<TextField placeholder="Last name" value={lname} onChangeText={setLname} autoCapitalize="words" />
					</View>
				</View>
			),
		},
		{
			id: 'birth',
			onPress: () => goNext(1),
			disabled: !bdate,
			children: (
				<View style={styles.centerSlide}>
					<View style={styles.header}>
						<TText type="title" style={styles.title}>
							When is your birthday?
						</TText>
						<TText style={styles.subtitle}>Your date of birth helps us personalize your experience.</TText>
					</View>
					<View style={styles.section}>
						<DatePickerField
							placeholder="Date of birth"
							value={bdate}
							onChange={setBdate}
							maximumDate={new Date()}
						/>
					</View>
				</View>
			),
		},
		{
			id: 'gender',
			onPress: () => goNext(2),
			disabled: !gender,
			children: (
				<View style={styles.centerSlide}>
					<View style={styles.header}>
						<TText type="title" style={styles.title}>
							What is your gender?
						</TText>
						<TText style={styles.subtitle}>This helps us personalize your experience.</TText>
					</View>
					<View style={styles.section}>
						<View style={styles.choiceGrid}>
							{GENDERS.map((option) => (
								<TouchableOpacity key={option.label} onPress={() => setGender(option.label)} style={[styles.choice, gender === option.label && { opacity: 1 }]}>
									<TIcon
										name={option.icon}
										color={'#fff'}
										size={20}
										style={{
											backgroundColor: gender === option.label ? '#fff5' : undefined,
											padding: 8,
											borderRadius: 50,
										}}
									/>
									<TText style={[styles.selectedChoiceText, gender === option.label && { color: '#fff', fontWeight: '700', opacity: 1 }]}>
										{option.label}
									</TText>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
			),
		},
		{
			id: 'travel',
			onPress: handleSubmit,
			disabled: interests.length < 3,
			children: (
				<View style={styles.centerSlide}>
					<View style={styles.header}>
						<TText type="title" style={styles.title}>
							Find your kind of travel
						</TText>
						<TText style={styles.subtitle}>Choose at least three interests to shape your recommendations.</TText>
					</View>
					<View style={styles.section}>
						<View style={styles.interestGrid}>
							{INTERESTS.map((interest) => {
								const selected = interests.includes(interest);
								return (
									<TouchableOpacity
										key={interest}
										onPress={() => toggleInterest(interest)}
										style={[styles.interest, selected && { backgroundColor: "#fff3", opacity: 1 }]}
									>
										<TText style={{color: '#fff'}}> {interest} </TText>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
				</View>
			),
		},
		{
			id: 'welcome',
			seconds: 5,
			children: <TText style={styles.introText}>Welcome to Tarahive</TText>,
		},
		{
			id: 'onboarding1',
			onPress: () => transitionTo(slideIndex + 1),
			children: (
				<View style={{zIndex: 1, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
					<Image source={require('../../../../assets/images/onboarding-1.png')} style={styles.onboardingImage} resizeMode="contain" />
					<TText>Discover new destinations</TText>
				</View>
				
			),
		},
		{
			id: 'onboarding2',
			onPress: () => transitionTo(slideIndex + 1),
			children: (
				<Image source={require('../../../../assets/images/onboarding-2.png')} style={styles.onboardingImage} resizeMode="contain" />
			),
		},
		{
			id: 'onboarding3',
			onPress: () => transitionTo(slideIndex + 1),
			children: (
				<Image source={require('../../../../assets/images/onboarding-3.png')} style={styles.onboardingImage} resizeMode="contain" />
			),
		},
		{
			id: 'onboarding4',
			onPress: () => transitionTo(slideIndex + 1),
			children: (
				<Image source={require('../../../../assets/images/onboarding-4.png')} style={styles.onboardingImage} resizeMode="contain" />
			),
		},
		{
			id: 'onboarding5',
			onPress: finishSetup,
			children: (
				<Image source={require('../../../../assets/images/onboarding-5.png')} style={styles.onboardingImage} resizeMode="contain" />
			),
		},
	];

	const currentSlide = slides[slideIndex] ?? slides[slides.length - 1];

	useEffect(() => {
		if (slideIndex <= 5 || backgroundHasFadedIn.current) return;

		backgroundHasFadedIn.current = true;
		Animated.timing(backgroundOpacity, {
			toValue: 1,
			duration: 350,
			useNativeDriver: true,
		}).start();
	}, [backgroundOpacity, slideIndex]);

	useEffect(() => {
		if (!currentSlide.seconds) return;

		const timeout = setTimeout(() => {
			if (slideIndex >= slides.length - 1) {
				finishSetup();
				return;
			}

			transitionTo(slideIndex + 1);
		}, currentSlide.seconds * 1000);

		return () => clearTimeout(timeout);
	}, [currentSlide.id, currentSlide.seconds, slideIndex]);

	return (
		<TView color='accent' style={styles.screen}>
			{slideIndex > 5 && (
				<Animated.Image
					source={require('../../../../assets/images/default-bg-1.2.0.jpg')}
					style={[styles.imageBg, styles.imageFill, { opacity: backgroundOpacity }]}
				/>
			)}
			<Animated.View style={[styles.screen, { opacity }]}>
				{currentSlide.onPress ? (
					<>
						<View style={styles.centerSlide}>
							{currentSlide.children}
						</View>
						<View style={styles.actions}>
							<RoundButton
								iconName="check"
								onPress={currentSlide.onPress}
								disabled={currentSlide.disabled}
								loading={isSubmitting}
								style={{ backgroundColor: secondaryColor+'20' }}
							/>
						</View>
					</>
				) : (
					<View style={styles.intro}>
						{currentSlide.children}
					</View>
				)}
			</Animated.View>
		</TView>
		
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	container: { flexGrow: 1 },
	centerSlide:{
		flex: 1,
		justifyContent: 'center',
	},
	header: {
		padding: '3%',
		overflow: 'hidden',
	},
	section: {
		paddingHorizontal: '3%',
		paddingVertical: 8,
	},
	subtitle: { 
		opacity: 0.7,
		color: '#fff',
		textAlign: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: '800',
		textAlign: 'center',
		color: '#fff',
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
		opacity: 0.7,
	},
	selectedChoiceText: { 
        fontWeight: '500',
		color: '#fff',
        fontSize: 12,
        opacity: 0.7,
        textAlign: 'center',
    },
	interestGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8,
		justifyContent: 'center',
		alignItems: 'center',
    },
	interest: { 
        borderWidth: 1, 
        borderColor: '#fff3', 
        borderRadius: 20, 
        paddingVertical: 9, 
        paddingHorizontal: 14,
		opacity: 0.7,
    },
	actions: { 
        gap: 10, 
        position: 'absolute',
        bottom: 16,
        right: '3%',
    },
	intro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	introText: { color: '#fff', fontSize: 28, fontWeight: '700' },
	onboardingImage: { flex: 1, width: '100%' },
	imageBg: { 
		position: 'absolute', 
		width: '100%', 
		height: Dimensions.get('window').height - 200,
		overflow: 'hidden',
		backgroundColor: '#fff',
	},
	imageFill: { width: '100%', height: '100%', opacity: 0.5 },
});
