import { LoginForm } from "@/components/login-form"
import { connection } from 'next/server'

export default async function LoginPage() {
  await connection()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
  
  {/* Background Image */}
  <div className="fixed inset-0 -z-10">
    <img
      src="https://images.unsplash.com/photo-1634831318569-0df6cdeac7da?q=80&w=1374&auto=format&fit=crop"
      alt="Background"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/40"></div>
  </div>

  <div className="w-full max-w-sm md:max-w-4xl">
    <LoginForm />
  </div>
</div>

  )
}
