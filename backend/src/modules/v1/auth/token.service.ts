import { User } from '../user/user.entity'
import jwt from 'jsonwebtoken';
import { UserStatus } from '../user/user.types';

export const generateAccessToken = (user: User): string => {
  const secretKey = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
  const userId = (user.id as any).toString();
  let statusField = "";
  
  switch(user.status){
    case UserStatus.ACTIVE:
      statusField = "a";
      break;
    case UserStatus.SUSPENDED:
      statusField = "s";
      break;
    case UserStatus.BANNED:
      statusField = "b";
      break;
  }

  const accessToken = jwt.sign(
    { 
      sub: userId,
      tv: 1, //temporary
      st: statusField,
    },
    secretKey,
    { expiresIn: '1h' }
  );
  return accessToken;
}

export const generateRefreshToken = (user: User): string => {
  const secretKey = process.env.REFRESH_TOKEN_SECRET || 'default_secret';
  const userId = (user.id as any).toString();
  const refreshToken = jwt.sign(
    { 
      sub: userId,
      tv: 1, //temporary
    },
    secretKey,
    { expiresIn: '14d' }
  );
  return refreshToken;
}