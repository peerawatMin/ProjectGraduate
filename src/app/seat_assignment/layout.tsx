import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import SeatAssignmentLayoutClient from './SeatAssignmentLayoutClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function SeatAssignmentLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('authToken')?.value
  if (!token) redirect('/login?redirect=/seat_assignment')
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    redirect('/login?redirect=/seat_assignment')
  }
  return <SeatAssignmentLayoutClient>{children}</SeatAssignmentLayoutClient>
}
