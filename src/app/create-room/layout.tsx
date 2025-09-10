import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import CreateRoomLayoutClient from './CreateRoomLayoutClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function CreateRoomLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('authToken')?.value
  if (!token) redirect('/login?redirect=/create-room')
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    redirect('/login?redirect=/create-room')
  }
  return <CreateRoomLayoutClient>{children}</CreateRoomLayoutClient>
}
