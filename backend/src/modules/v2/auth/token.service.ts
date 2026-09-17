import { User } from '../user/user.entity'
import jwt from 'jsonwebtoken';
import { UserStatus } from '../user/user.types';

export const generateAccessToken = (user: User): string => {
  const secretKey = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
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
      sub: (user.id as any).toString(),
      tv: user.tv,
      st: statusField,
    },
    secretKey,
    { expiresIn: '1h' }
  );
  return accessToken;
}

export const generateRefreshToken = (user: User): string => {
  const secretKey = process.env.REFRESH_TOKEN_SECRET || 'default_secret';
  const refreshToken = jwt.sign(
    { 
      sub: (user.id as any).toString(),
      tv: user.tv,
    },
    secretKey,
    { expiresIn: '14d' }
  );
  return refreshToken;
}