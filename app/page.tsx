'use client'

import SessionBoard from "@/components/session/session-board";
import AnimalCodeForm from "@/components/auth/animal-code-form";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListsPage from "./lists/page";
import { CheckSquare, List } from "lucide-react";

export default function HomePage() {
  const [sessionData, setSessionData] = useState<string | null>(null);
  const [hasUrlSession, setHasUrlSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("tasks");

  useEffect(() => {
    // Check for session in URL params first
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const urlSessionParam = url.searchParams.get('session');
      setHasUrlSession(!!urlSessionParam);
    }
    
    // Check for session data in localStorage
    const data = localStorage.getItem('sessionData');
    setSessionData(data);
    setIsLoading(false);
  }, []);

  // Don't render anything during initial load to prevent flash
  if (isLoading) {
    return null;
  }

  // Show SessionBoard if user has session data OR if there's a session in URL
  const shouldShowBoard = sessionData || hasUrlSession;

  return (
    <div className="container mx-auto p-4 md:p-8">
      {!shouldShowBoard ? (
        <div className="min-h-screen flex items-center justify-center">
          <AnimalCodeForm />
        </div>
      ) : (
        <ErrorBoundary>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto mb-6 grid-cols-2">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="lists" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Collaborative Lists
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks">
              <SessionBoard />
            </TabsContent>
            
            <TabsContent value="lists">
              <ListsPage />
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      )}
    </div>
  );
}
