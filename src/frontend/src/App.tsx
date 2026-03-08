import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AppShell, type Page } from "./components/AppShell";
import { AutomationPage } from "./pages/AutomationPage";
import { BufferPage } from "./pages/BufferPage";
import { ChatPage } from "./pages/ChatPage";
import { CloudPage } from "./pages/CloudPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SecurityPage } from "./pages/SecurityPage";

function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case "overview":
      return <OverviewPage />;
    case "chat":
      return <ChatPage />;
    case "automation":
      return <AutomationPage />;
    case "buffer":
      return <BufferPage />;
    case "cloud":
      return <CloudPage />;
    case "dashboard":
      return <DashboardPage />;
    case "security":
      return <SecurityPage />;
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  const [page, setPage] = useState<Page>("overview");

  return (
    <>
      <AppShell activePage={page} onNavigate={setPage}>
        <PageRenderer page={page} />
      </AppShell>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border border-border text-foreground font-body text-sm",
            success: "text-emerald-400",
            error: "text-red-400",
          },
        }}
      />
    </>
  );
}
