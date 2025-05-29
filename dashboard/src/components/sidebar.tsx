"use client";
import { motion } from "framer-motion";
import {
  Home,
  BarChart2,
  Network,
  Hash,
  Clock,
  HelpCircle,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";

interface SidebarProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTitle aria-label="sr-only" className="hidden">
          CognitiveSky
        </SheetTitle>
        <SheetContent
          side={"left"}
          className="p-0 [&>button]:text-white [&>button]:mt-3"
          aria-description="Sidebar navigation menu"
        >
          <SideBarContent open={open} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
    );
  }

  return <SideBarContent open={open} />;
}

const SideBarContent = ({ open, setOpen }: SidebarProps) => {
  const isMobile = useIsMobile();
  const sidebarVariants = {
    open: { width: "240px", transition: { duration: 0.3 } },
    closed: { width: "72px", transition: { duration: 0.3 } },
  };

  const textVariants = {
    open: { opacity: 1, display: "block", transition: { delay: 0.1 } },
    closed: { opacity: 0, display: "none", transition: { duration: 0.1 } },
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart2, label: "Sentiment Analysis", href: "/sentiment" },
    { icon: Network, label: "Topic Clusters", href: "/topics" },
    { icon: Hash, label: "Hashtags & Emojis", href: "/hashtags" },
    { icon: Clock, label: "Timeline", href: "/timeline" },
    { icon: FileDown, label: "Export Reports", href: "/export" },
    { icon: HelpCircle, label: "Help", href: "/help" },
  ];
  return (
    <motion.div
      variants={sidebarVariants}
      animate={open ? "open" : "closed"}
      className={cn(
        "h-screen bg-gradient-to-b from-sky-600 to-sky-800 text-white shadow-lg z-20 flex-col",
        isMobile && "min-w-full"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-sky-500/30">
        <Link href={"/"}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold">CS</span>
            </div>
            <motion.div variants={textVariants} className="ml-3 font-semibold">
              CognitiveSky
            </motion.div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-sky-700 transition-colors",
                  open ? "justify-start" : "justify-center"
                )}
                onClick={() => {
                  if (isMobile) {
                    setOpen?.(false);
                  }
                }}
              >
                <item.icon size={20} className="text-white/80" />
                <motion.span
                  variants={textVariants}
                  className="ml-3 text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-sky-500/30">
        <div className="flex items-center justify-center">
          <div className="text-xs text-white/70 text-wrap">
            &copy; {open && !isMobile ? "CognitiveSky v1.0" : "v1.0"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
