import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type LoaderContextType = {
  isLoading: boolean;
  setScreenLoading: (loading: boolean) => void;
  setNavigationLoading: (loading: boolean) => void;
  routingError: RoutingErrorState | null;
  setRoutingError: (error: RoutingErrorState | null) => void;
};

export type RoutingErrorState = {
  onRetry: () => void;
  title?: string;
  message?: string;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);
let updateNavigationLoading: ((loading: boolean) => void) | undefined;
let navigationTimeout: ReturnType<typeof setTimeout> | undefined;

export const showNavigationLoading = () => {
  updateNavigationLoading?.(true);
  if (navigationTimeout) clearTimeout(navigationTimeout);
  navigationTimeout = setTimeout(() => {
    updateNavigationLoading?.(false);
    navigationTimeout = undefined;
  }, 600);
};

export const hideNavigationLoading = () => {
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
    navigationTimeout = undefined;
  }
  updateNavigationLoading?.(false);
};

export const LoaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [screenLoading, setScreenLoading] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [routingError, setRoutingError] = useState<RoutingErrorState | null>(null);

  const updateNavigationLoadingState = useCallback((loading: boolean) => {
    setNavigationLoading(loading);
  }, []);

  useEffect(() => {
    updateNavigationLoading = updateNavigationLoadingState;
    return () => {
      updateNavigationLoading = undefined;
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
        navigationTimeout = undefined;
      }
    };
  }, [updateNavigationLoadingState]);

  return (
    <LoaderContext.Provider
      value={{
        isLoading: screenLoading || navigationLoading,
        setScreenLoading,
        setNavigationLoading,
        routingError,
        setRoutingError,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoaderContext = () => {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error("useLoaderContext must be used within LoaderProvider");
  }

  return context;
};