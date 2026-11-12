"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "../../../components/forms/SignInForm";
import { SignInAction } from "@/app/actions/auth";
import ErrorBanner from "@/components/ui/ErrorBanner";
import SuccessBanner from "@/components/ui/SuccessBanner";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleLogIn = async (formData) => {
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const result = await SignInAction(formData);

      if (!result.success) {
        setErrorMsg("Sign in failed. Please try again.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.log(err);
      setErrorMsg(
        "An unexpected connection error occured. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-svh md:min-h-screen flex items-center justify-center p-5">
      <div className="flex flex-col gap-8 w-full max-w-sm ">
        {/* logo */}
        <div className="flex flex-col text-center">
          {/* <span className=" text-gray-500">Welcome back,</span> */}
          <h1 className="text-2xl font-bold tracking-tight">
            Edward's Portfolio
          </h1>
          <span className="text-gray-500 text-sm text-center">
            Sign in to your account.
          </span>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} />}
        {successMsg && <SuccessBanner message={successMsg} />}

        <SignInForm
          onSubmit={handleLogIn}
          isLoading={isLoading}
          onSuccess={setSuccessMsg}
          onError={setErrorMsg}
        />
      </div>
    </div>
  );
}
