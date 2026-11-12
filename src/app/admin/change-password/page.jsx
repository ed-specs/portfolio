"use client";

import { useState } from "react";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";

export default function ChangePassword() {
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div className="lg:relative min-h-screen md:min-h-dvh flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />

      <div className="flex flex-1 flex-col gap-6 p-5">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold">Change Password.</h1>
          <span className="text-gray-500 text-sm">Change your password.</span>
        </div>

        {errorMsg && <p>{errorMsg}</p>}

        <ChangePasswordForm message={setErrorMsg} />
      </div>
    </div>
  );
}
