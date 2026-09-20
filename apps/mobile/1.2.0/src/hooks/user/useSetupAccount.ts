import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { showError, showSuccess } from '@/services/toast.service';
import { setupUserAccount } from '@/services/userService';
import { generateUsername } from '@/utils/generateUsername';
import { SetupAccountPayload } from '@/types/userTypes';

const MINIMUM_INTERESTS = 3;

export const useSetupAccount = () => {
	const { updateSession } = useSession();

	const validateStep = (
		step: number,
		values: Pick<SetupAccountPayload, 'fname' | 'lname' | 'bdate' | 'gender' | 'interests'>,
	) => {
		if (step === 0 && (!values.fname.trim() || !values.lname.trim())) {
			showError('Missing information', 'Please enter your first and last name');
			return false;
		}

		if (step === 1 && (!values.bdate || !values.gender)) {
			showError('Missing information', 'Please select your date of birth and gender');
			return false;
		}

		if (step === 2 && values.interests.length < MINIMUM_INTERESTS) {
			showError('Missing information', `Please select at least ${MINIMUM_INTERESTS} interests`);
			return false;
		}

		return true;
	};

	const mutation = useMutation({
		mutationFn: async (payload: SetupAccountPayload) => {
			const firstName = payload.fname.trim();
			const lastName = payload.lname.trim();

			if (!firstName || !lastName) {
				throw new Error('First name and last name are required');
			}

			if (!payload.bdate) {
				throw new Error('Date of birth is required');
			}

			const birthDate = new Date(payload.bdate);
			if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
				throw new Error('Please enter a valid date of birth');
			}

			if (!payload.gender) {
				throw new Error('Please select your gender');
			}

			if (payload.interests.length < MINIMUM_INTERESTS) {
				throw new Error(`Please select at least ${MINIMUM_INTERESTS} interests`);
			}

			return setupUserAccount({
				...payload,
				fname: firstName,
				lname: lastName,
				username: generateUsername(firstName),
				bdate: birthDate.toISOString(),
			});
		},
		onSuccess: async (response) => {
			await updateSession({ user: response.data });
			showSuccess('Profile ready', response.message);
			router.replace('/home');
		},
		onError: (error: any) => {
			showError('Setup Error', error.message || 'Unable to set up your account');
		},
	});

	return {
		validateStep,
		submitSetup: mutation.mutateAsync,
		isSubmitting: mutation.isPending,
	};
};
