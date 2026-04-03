import React from "react";
import { useThemeColor } from "../hooks/useThemeColor";

type GradientBlobsProps = {
  color?: string;
};

const GradientBlobs: React.FC<GradientBlobsProps> = ({ color }) => {
  const secondaryColor = useThemeColor({}, "accent");
  const gradientColor = color || secondaryColor;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
      {/* Top Right Blob */}
      <div
        className="absolute -top-1/8 -right-1/8 w-[60%] aspect-square rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 70%)`,
        }}
      />

      {/* Bottom Left Blob */}
      <div
        className="absolute -bottom-1/10 -left-3/20 w-[70%] aspect-square rounded-full opacity-50"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 70%)`,
        }}
      />

      {/* Bottom Center Blob */}
      <div
        className="absolute -bottom-1/10 left-2/5 w-[40%] aspect-square rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default GradientBlobs;
