// app/reset-password/page.tsx
import { Suspense } from "react"
import ResetPasswordForm from "@/components/reset-passowrd-form"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}