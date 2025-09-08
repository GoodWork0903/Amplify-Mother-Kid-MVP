import SidebarLayout from "@/components/SidebarLayout";

export default function AdoptLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
