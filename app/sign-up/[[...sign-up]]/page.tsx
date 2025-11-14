import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-slate-900 border border-cyan-500/50 shadow-lg shadow-cyan-500/20",
            headerTitle: "text-cyan-400",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton: "border border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10",
            formButtonPrimary: "bg-cyan-500 hover:bg-cyan-600 text-black font-semibold",
            footerActionLink: "text-cyan-400 hover:text-cyan-300",
            formFieldInput: "bg-slate-800 border-slate-700 text-white focus:border-cyan-500",
            formFieldLabel: "text-slate-300",
            identityPreviewText: "text-slate-300",
            identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300",
          }
        }}
      />
    </div>
  );
}
