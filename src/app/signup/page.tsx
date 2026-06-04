import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
      
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://plus.unsplash.com/premium_photo-1700767195067-cebeea138cea?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Background"
          className="w-full h-full object-cover rotate-y-180"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
    
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
