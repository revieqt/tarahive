import { User } from '../user/user.entity'
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user: User): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user.id as any).toString();
  const accessToken = jwt.sign(
    { id: userId, email: user.email },
    secretKey,
    { expiresIn: '1h' }
  );
  return accessToken;
}

export const generateRefreshToken = (user: User): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user.id as any).toString();
  const refreshToken = jwt.sign(
    { id: userId , email: user.email },
    secretKey,
    { expiresIn: '14d' }
  );
  return refreshToken;
}