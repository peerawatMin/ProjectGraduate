import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import RoomLayoutClient from './RoomLayoutClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function RoomsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('authToken')?.value
  if (!token) redirect('/login?redirect=/rooms')
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    redirect('/login?redirect=/rooms')
  }
  return <RoomLayoutClient>{children}</RoomLayoutClient>
}
