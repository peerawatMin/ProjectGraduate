import ResetPasswordForm from '../components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Reset Password</h1>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
