
import AuthForm from '../components/AuthForm'


export default function LoginPage() {
  return (
    <main className='flex justify-center items-center p-24 max-h-screen overflow-hidden'>
      <div className=" opacity-95 p-8 w-[600px] items-center m-8 space-y-6">
        <div className="flex items-center justify-center">
          <div className="w-full text-center">
          <AuthForm isLogin={true} />
          
        </div>
        </div>
        
        
      </div>
    <video src='/bg_login.mp4' autoPlay muted loop className='absolute top-0 z-[-1] w-full h-full object-cover'  ></video>
    </main>
  )
}
