import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =============================================================
// Types
// =============================================================

export interface AuthPayload {
    userId: string;
    email: string;
}

export interface TokenPayload extends AuthPayload {
    iat: number;
    exp: number;
}

// =============================================================
// Password Hashing
// =============================================================

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// =============================================================
// JWT Token
// =============================================================

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    return secret;
}

export function generateToken(
    payload: AuthPayload,
    expiresIn: string = "7d",
): string {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn,
    } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

// =============================================================
// Refresh Token
// =============================================================

export function generateRefreshToken(payload: AuthPayload): string {
    return jwt.sign(payload, getJwtSecret() + "_refresh", {
        expiresIn: "30d",
    } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, getJwtSecret() + "_refresh") as TokenPayload;
}

export function refreshAccessToken(refreshToken: string): {
    accessToken: string;
    refreshToken: string;
} {
    const payload = verifyRefreshToken(refreshToken);
    const { userId, email } = payload;
    return {
        accessToken: generateToken({ userId, email }, "7d"),
        refreshToken: generateRefreshToken({ userId, email }),
    };
}
