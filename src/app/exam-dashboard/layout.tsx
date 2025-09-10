import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import ExamDashboardLayoutClient from './ExamDashboardLayoutClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function ExamDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('authToken')?.value
  if (!token) redirect('/login?redirect=/exam-dashboard')
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    redirect('/login?redirect=/exam-dashboard')
  }
  return <ExamDashboardLayoutClient>{children}</ExamDashboardLayoutClient>
}
