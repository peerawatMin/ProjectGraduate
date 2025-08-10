import ForgotPasswordForm from '../components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Forgot Password</h1>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
