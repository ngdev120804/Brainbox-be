import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserRepo, getRefreshTokenRepo } from '../db';
import crypto from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-refresh';

function signAccess(user: { id: number; username: string }) {
  return jwt.sign(user, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

function signRefresh(user: { id: number; username: string }) {
  return jwt.sign(user, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const register = async (req: Request, res: Response) => {
  const { username, password, fullName } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const userRepo = getUserRepo();
  const refreshRepo = getRefreshTokenRepo();

  const exists = await userRepo.findOneBy({ username });
  if (exists) return res.status(409).json({ message: 'username already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  let user = userRepo.create({ username, passwordHash, fullName });
  user = await userRepo.save(user);
  user = { id: user.id, username: user.username, fullName: user.fullName } as any;

  const accessToken = signAccess({ id: user.id, username: user.username });
  const refreshToken = signRefresh({ id: user.id, username: user.username });

  await refreshRepo.save({ tokenHash: hashToken(refreshToken), userId: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json({ token: accessToken, user });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const userRepo = getUserRepo();
  const refreshRepo = getRefreshTokenRepo();

  const user = await userRepo.findOneBy({ username });
  if (!user) return res.status(401).json({ message: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const accessToken = signAccess({ id: user.id, username: user.username });
  const refreshToken = signRefresh({ id: user.id, username: user.username });

  await refreshRepo.save({ tokenHash: hashToken(refreshToken), userId: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  return res.json({ token: accessToken, user: { id: user.id, username: user.username, fullName: user.fullName } });
};

export const refresh = async (req: Request, res: Response) => {
  const token = (req.cookies as any)?.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const tokenHash = hashToken(token);

    const refreshRepo = getRefreshTokenRepo();
    const stored = await refreshRepo.findOne({ where: { tokenHash, userId: payload.id, revoked: false } });
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccess({ id: payload.id, username: payload.username });
    return res.json({ token: accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = (req.cookies as any)?.refreshToken || req.body.refreshToken;
  if (!token) {
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    return res.json({ ok: true });
  }
  const refreshRepo = getRefreshTokenRepo();
  const tokenHash = hashToken(token);
  await refreshRepo.update({ tokenHash }, { revoked: true });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  return res.json({ ok: true });
};

export const me = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  const userRepo = getUserRepo();
  const user = await userRepo.findOne({ where: { id: userId }, select: { id: true, username: true, fullName: true, createdAt: true } });
  return res.json({ user });
};
