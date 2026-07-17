import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import PageWrapper from "@/components/layout/PageWrapper";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen">
      <Sidebar />
      <TopBar />
      <PageWrapper>{children}</PageWrapper>
    </div>
  );
}
