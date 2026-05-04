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
  let email: string | undefined;
  let sub: string | undefined;
  let name: string | undefined;
  let picture: string | undefined;

  if (credential.startsWith("ya29.")) {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` },
    });
    if (!res.ok) throw new Error("Invalid Google access token");
    const info = (await res.json()) as { email?: string; sub?: string; name?: string; picture?: string };
    ({ email, sub, name, picture } = info);
  } else {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    email = payload?.email;
    sub = payload?.sub;
    name = payload?.name;
    picture = payload?.picture;
  }

  if (!email) throw new Error("Invalid Google token");

  let isNewUser = false;
  let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });
  if (!user) {
    user = await User.create({
      email,
      googleId: sub,
      name: name || email.split("@")[0],
      avatar: picture,
    });
    isNewUser = true;
  } else if (!user.googleId) {
    user.googleId = sub;
    await user.save();
  }

  const tokens = buildTokenResponse(user.id);
  await User.findByIdAndUpdate(user.id, { refreshToken: tokens.refreshToken });

  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens, isNewUser };
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
