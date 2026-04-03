import { BACKEND_URL } from "@/constants/Config";
import defaultProfileImg from "@/assets/images/defaultProfile.png";

interface ProfileImageProps {
  imagePath?: string;
  alt?: string;
  className?: string;
  size?: "small" | "medium" | "large" | "xl";
}

export default function ProfileImage({
  imagePath,
  alt = "Profile",
  className = "",
  size = "medium",
}: ProfileImageProps) {
  // Determine size based on the size prop
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-20 h-20",
    xl: "w-32 h-32",
  };

  // Build the image source URL
  const imageSource = imagePath
    ? `${BACKEND_URL}${imagePath}`
    : defaultProfileImg;

  return (
    <img
      src={imageSource}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // Fallback to default image if image fails to load
        e.currentTarget.src = defaultProfileImg;
      }}
    />
  );
}
