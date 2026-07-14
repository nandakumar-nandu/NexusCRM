import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <main className="min-h-screen pl-64 pt-16 bg-transparent">
      <div className="mx-auto max-w-7xl px-8 py-8 animate-fade-in">
        {children}
      </div>
    </main>
  );
}
