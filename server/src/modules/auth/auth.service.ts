import { OAuth2Client } from "google-auth-library";
import { User } from "../users/user.model";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/token";
import { env } from "../../config/env";
import { RegisterDto, LoginDto } from "./auth.dto";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function buildTokenResponse(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  return { accessToken, refreshToken };
}

export async function register(dto: RegisterDto) {
  const existing = await User.findOne({ email: dto.email });
  if (existing) throw new Error("Email already in use");

  const user = await User.create(dto);
  const tokens = buildTokenResponse(user.id);
  await User.findByIdAndUpdate(user.id, { refreshToken: tokens.refreshToken });

  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
}

export async function login(dto: LoginDto) {
  const user = await User.findOne({ email: dto.email }).select("+password");
  if (!user || !(await user.comparePassword(dto.password))) {
    throw new Error("Invalid credentials");
  }

  const tokens = buildTokenResponse(user.id);
  await User.findByIdAndUpdate(user.id, { refreshToken: tokens.refreshToken });

  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
}

export async function googleAuth(credential: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Invalid Google token");

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });
  if (!user) {
    user = await User.create({
      email: payload.email,
      googleId: payload.sub,
      name: payload.name || payload.email.split("@")[0],
      avatar: payload.picture,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }

  const tokens = buildTokenResponse(user.id);
  await User.findByIdAndUpdate(user.id, { refreshToken: tokens.refreshToken });

  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) throw new Error("Invalid refresh token");

  const tokens = buildTokenResponse(user.id);
  await User.findByIdAndUpdate(user.id, { refreshToken: tokens.refreshToken });
  return tokens;
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
}
