import express from "express";
import {
  enableTaraBuddy,
  disableTaraBuddy,
  searchTaraBuddies,
  likeTaraBuddy,
  updateGenderPreference,
  updateDistancePreference,
  updateAgePreference,
  updateZodiacPreference,
  getMatches,
  unmatch,
} from "./tarabuddy.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router();

// Enable TaraBuddy
router.post("/enable", authMiddleware, enableTaraBuddy);

// Disable TaraBuddy
router.post("/disable", authMiddleware, disableTaraBuddy);

// Search for TaraBuddies
router.post("/search", authMiddleware, searchTaraBuddies);

// Like a TaraBuddy user
router.post("/like", authMiddleware, likeTaraBuddy);

// Update gender preference
router.patch("/update-gender-preference", authMiddleware, updateGenderPreference);

// Update distance preference
router.patch("/update-distance-preference", authMiddleware, updateDistancePreference);

// Update age preference
router.patch("/update-age-preference", authMiddleware, updateAgePreference);

// Update zodiac preference
router.patch("/update-zodiac-preference", authMiddleware, updateZodiacPreference);

// Get all matches
router.get("/matches", authMiddleware, getMatches);

// Unmatch with a user
router.post("/unmatch", authMiddleware, unmatch);

export default router;
