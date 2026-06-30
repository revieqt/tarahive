import React, { createContext, useCallback, useContext, useState } from "react";

type LoaderContextType = {
  visible: boolean;
  showLoader: () => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);

  const showLoader = useCallback(() => {
    setVisible(true);
  }, []);

  const hideLoader = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <LoaderContext.Provider
      value={{
        visible,
        showLoader,
        hideLoader,
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