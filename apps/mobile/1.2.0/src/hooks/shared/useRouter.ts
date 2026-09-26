import React, { useEffect, useRef } from "react";
import { router as expoRouter } from "expo-router";
import Loading from "@/components/feedback/Loading";
import ErrorLoading from "@/components/feedback/ErrorLoading";
import { TView } from "@/components/ui/Themed";
import {
	hideNavigationLoading,
	showNavigationLoading,
	useLoaderContext,
} from "@/context/LoaderContext";
import type { RoutingErrorState } from "@/context/LoaderContext";
import { StyleSheet } from "react-native";

const NAVIGATION_METHODS = new Set([
	"back",
	"dismiss",
	"dismissAll",
	"dismissTo",
	"navigate",
	"push",
	"replace",
]);

export const router: typeof expoRouter = new Proxy(expoRouter, {
	get(target, property, receiver) {
		const method = Reflect.get(target, property, receiver);
		if (typeof method !== "function") return method;
		if (!NAVIGATION_METHODS.has(String(property))) return method.bind(target);

		return (...args: unknown[]) => {
			showNavigationLoading();
			try {
				return method.apply(target, args);
			} catch (error) {
				hideNavigationLoading();
				throw error;
			}
		};
	},
});

type UseRouterOptions = {
	isLoading?: boolean;
	hasError?: boolean;
	onRetry?: () => void;
	errorTitle?: string;
	errorMessage?: string;
};

export function useRouter(options: UseRouterOptions = {}) {
	const { isLoading: screenLoading = false, hasError = false, onRetry, errorTitle, errorMessage } = options;
	const { isLoading, setScreenLoading, setRoutingError } = useLoaderContext();
	const tracksScreenState = useRef(false);

	useEffect(() => {
		tracksScreenState.current = true;
		setScreenLoading(screenLoading);
	}, [screenLoading, setScreenLoading]);

	useEffect(() => {
		if (hasError && onRetry) {
			const routingError: RoutingErrorState = {
				onRetry,
				title: errorTitle,
				message: errorMessage,
			};
			setRoutingError(routingError);
		} else {
			setRoutingError(null);
		}
	}, [hasError, onRetry, errorTitle, errorMessage, setRoutingError]);

	useEffect(
		() => () => {
			if (tracksScreenState.current) {
				setScreenLoading(false);
				setRoutingError(null);
			}
		},
		[setScreenLoading, setRoutingError],
	);

	return { router, isLoading };
}

export function RouterLoadingOverlay() {
	const { isLoading, routingError } = useLoaderContext();
	if (routingError) {
		return React.createElement(
			TView,
			{ color: "primary", style: styles.overlay },
			React.createElement(ErrorLoading, {
				onRetry: routingError.onRetry,
				onBack: () => router.back(),
				title: routingError.title,
				message: routingError.message,
			}),
		);
	}
	return React.createElement(Loading, { visible: isLoading });
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 10000,
		elevation: 10000,
	},
});
