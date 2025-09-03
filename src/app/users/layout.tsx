// app/child/layout.tsx
import SidebarLayout from "@/components/SidebarLayout";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
