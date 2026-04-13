// SliderBar.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Slider } from "@miblanchard/react-native-slider"; // ✅ named import
import { ThemedText } from "./ThemedText";
import { useThemeColor } from "../hooks/useThemeColor";

type SliderBarProps = {
  range: [number, number];
  rangeBar?: boolean;
  label?: string;
  description?: string;
  displayValue?: boolean;
  step?: number;
  onValueChange?: (value: number | [number, number]) => void;
  initialValue?: number;
  initialValues?: [number, number];
};

const SliderBar: React.FC<SliderBarProps> = ({
  range,
  rangeBar = false,
  label,
  description,
  displayValue = false,
  step = 1,
  onValueChange,
  initialValue,
  initialValues,
}) => {
  const [value, setValue] = useState<number | [number, number]>(
    rangeBar
      ? initialValues ?? [range[0], range[1]]
      : initialValue ?? range[0]
  );
  const secondaryColor = useThemeColor({}, 'secondary');
  const tintColor = useThemeColor({}, 'icon');

  useEffect(() => {
    if (rangeBar) {
      setValue(initialValues ?? [range[0], range[1]]);
    } else {
      setValue(initialValue ?? range[0]);
    }
  }, [rangeBar, initialValue, initialValues, range]);

  const handleChange = (val: number | number[]) => {
    let newVal: number | [number, number];
    
    if (Array.isArray(val)) {
      // For range sliders, ensure values are properly rounded to integers
      const [min, max] = val;
      newVal = [Math.round(min), Math.round(max)] as [number, number];
    } else {
      // For single value sliders, round to nearest step
      newVal = Math.round(val);
    }
    
    setValue(newVal);
    onValueChange?.(newVal);
  };

  const renderDescription = () => {
    if (!displayValue) return null;

    let valueText: string;
    if (Array.isArray(value)) {
      valueText = `${value[0]}${label ? ` ${label}` : ""} - ${value[1]}${label ? ` ${label}` : ""}`;
    } else {
      valueText = `${value}${label ? ` ${label}` : ""}`;
    }

    return (
      <ThemedText style={styles.description}>
        {description ? `${description}: ${valueText}` : valueText}
      </ThemedText>
    );
  };

  return (
    <View style={styles.container}>
      <Slider
        value={value}
        onValueChange={handleChange}
        minimumValue={range[0]}
        maximumValue={range[1]}
        step={step}
        minimumTrackTintColor={secondaryColor}
        maximumTrackTintColor={tintColor}
        thumbTintColor={secondaryColor}
      />
      {renderDescription()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
  },
  description: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
});

export default SliderBar;