import SessionBoard from "@/components/session/session-board";
import LoginForm from "@/components/auth/login-form";
import ClientOnly from "@/components/common/client-only";
import { Suspense } from "react";
import Loading from "./loading";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <ClientOnly fallback={<Loading />}>
        <Suspense fallback={<Loading />}>
          <SessionChecker />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

function SessionChecker() {
  if (typeof window === 'undefined') {
    return <Loading />
  }
  
  const sessionData = localStorage.getItem('sessionData')
  
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>
    )
  }
  
  return <SessionBoard />
}
