"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider
          refetchOnWindowFocus={false} // Disable refetch on focus
              refetchInterval={5 * 60} // Optional: Refetch every 5 minutes
          >{children}
          </SessionProvider>
  }