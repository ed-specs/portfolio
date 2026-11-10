import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
export default function Dashboard() {
  return (
    <div className="lg:relative min-h-screen md:min-h-dvh flex flex-col lg:flex-row">
      <HeaderSection />
      {/* left (sidebar)*/}
      <Sidebar />
      {/* right */}
      <div className="flex flex-1 flex-col gap-6 p-5 ">asd</div>
    </div>
  );
}
