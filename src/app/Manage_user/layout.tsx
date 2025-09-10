import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import ManageUserLayoutClient from './ManageUserLayoutClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function ManageUserLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('authToken')?.value
  if (!token) redirect('/login?redirect=/Manage_user')
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    redirect('/login?redirect=/Manage_user')
  }
  return <ManageUserLayoutClient>{children}</ManageUserLayoutClient>
}
