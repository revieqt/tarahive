import { generateUUID } from "./generateUUID";

export const usernameAdjectives: string[] = [
  "wandering",
  "drifting",
  "roaming",
  "nomadic",
  "restless",
  "faraway",
  "lost",
  "hidden",
  "endless",
  "untamed",
  "sunlit",
  "windy",
  "starlit",
  "distant",
  "coastal",
  "mountainous",
  "silent",
  "ancient",
  "wild",
  "free"
];

export function generateUsername(
  firstName: string,
): string {
  if (!firstName) throw new Error("firstName is required");
  if (!usernameAdjectives?.length) throw new Error("adjectives array cannot be empty");

  const randomAdjective =
    usernameAdjectives[Math.floor(Math.random() * usernameAdjectives.length)];

  const cleanFirstName = firstName.trim().toLowerCase();

  const uuidSuffix = generateUUID().split("-")[0];

  return `${randomAdjective}_${cleanFirstName}_${uuidSuffix}`;
}