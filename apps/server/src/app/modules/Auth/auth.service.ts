import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { TLoginUser, TUserRole } from './auth.interface';
import { UserModel } from './auth.model';

const registerUser = async (payload: { email: string; password: string; role?: TUserRole }) => {
  const exists = await UserModel.findOne({ email: payload.email });
  if (exists) {
    throw new AppError(StatusCodes.CONFLICT, 'Email already registered');
  }

  const user = await UserModel.create({
    email: payload.email,
    password: payload.password,
    role: payload.role || 'USER',
  });

  return {
    userId: user.id || user._id,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async (payload: TLoginUser) => {
  const user = await UserModel.findOne({ email: payload.email }).select(
    '+password',
  );
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const jwtPayload = {
    userId: user.id || user._id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      userId: user.id || user._id,
      email: user.email,
      role: user.role,
    },
  };
};

const refreshToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string);
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const user = await UserModel.findById(decoded.userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const jwtPayload = {
    userId: user.id || user._id,
    role: user.role,
  };

  const newAccessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const newRefreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const AuthService = { registerUser, loginUser, refreshToken };

