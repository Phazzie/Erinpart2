import NeonTitle from "@/components/common/neon-title";
import SessionBoard from "@/components/session/session-board";
import { Suspense } from "react";
import Loading from "./loading";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<Loading />}>
        <SessionBoard />
      </Suspense>
    </div>
  );
}
