import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "./account.model";
import { generateAccessToken, generateRefreshToken } from "./auth.service";
import { logAction } from "../../utils/logAction";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  const { idToken, device } = req.body;

  if (!idToken) {
    await logAction(req, {
      action: "GOOGLE_AUTH_ATTEMPT_FAILED",
      module: "AUTH",
      severity: "warning",
      description: "No Google token provided",
      device: device,
    });
    return res.status(400).json({ message: "No Google token provided" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      await logAction(req, {
        action: "GOOGLE_AUTH_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: "Invalid Google token",
        device: device,
      });
      return res.status(401).json({ message: "Invalid Google token" });
    }

    let user = await User.findOne({ googleId: payload.sub });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        fname: payload.given_name,
        lname: payload.family_name,
        email: payload.email,
        googleId: payload.sub,
        provider: "google",
        profileImage: payload.picture,
        type: "traveler",
        status: "active",
      });
      isNewUser = true;

      await logAction(req, {
        action: "GOOGLE_AUTH_ACCOUNT_CREATED",
        module: "AUTH",
        severity: "info",
        description: `New user account created via Google: ${payload.email}`,
        userId: user._id?.toString(),
        device: device,
      });
    } else {
      await logAction(req, {
        action: "GOOGLE_AUTH_LOGIN_SUCCESS",
        module: "AUTH",
        severity: "info",
        description: `Google login success: ${payload.email}`,
        userId: user._id?.toString(),
        device: device,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    await logAction(req, {
      action: "GOOGLE_AUTH_FAILED",
      module: "AUTH",
      severity: "error",
      description: `Google authentication failed: ${error}`,
      device: req.body.device,
    });
    return res.status(401).json({ message: "Google authentication failed", error });
  }
};