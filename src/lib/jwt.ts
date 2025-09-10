/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!) // ตั้งใน .env
const alg = 'HS256'

export async function signJwt(payload: Record<string, any>, expiresIn: string = '7d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as any
}
