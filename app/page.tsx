'use client'

import SessionBoard from "@/components/session/session-board";
import AnimalCodeForm from "@/components/auth/animal-code-form";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [sessionData, setSessionData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for session data on mount
    const data = localStorage.getItem('sessionData');
    setSessionData(data);
    setIsLoading(false);
  }, []);

  // Don't render anything during initial load to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {!sessionData ? (
        <div className="min-h-screen flex items-center justify-center">
          <AnimalCodeForm />
        </div>
      ) : (
        <ErrorBoundary>
          <SessionBoard />
        </ErrorBoundary>
      )}
    </div>
  );
}
