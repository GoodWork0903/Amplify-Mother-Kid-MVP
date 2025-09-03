// app/child/layout.tsx
import SidebarLayout from "@/components/SidebarLayout";

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
