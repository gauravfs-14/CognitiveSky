import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

export function TopBar({ setSidebarOpen, sidebarOpen }: TopBarProps) {
  return (
    <>
      <header className="h-16 border-b border-sky-100 bg-white/80 backdrop-blur-sm flex items-center justify-between p-4 md:p-6 sticky top-0 z-10">
        <div className="flex items-center">
          {
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 text-sky-700"
            >
              <Menu size={20} />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          }

          <h1 className="text-lg font-semibold text-sky-900 lg:hidden">
            CognitiveSky
          </h1>

          <h1 className="text-xl font-semibold text-sky-900 hidden lg:block">
            Mental Health Narratives Dashboard
          </h1>
        </div>
      </header>
    </>
  );
}
