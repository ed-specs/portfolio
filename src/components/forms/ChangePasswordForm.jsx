"use client";
import { useState } from "react";
import { ChangePasswordAction } from "@/app/actions/password";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function ChangePasswordForm({ message }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      message("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      message("Password must be atleast 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      message("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      message("New password must be different from your current password.");
      return;
    }

    try {
      const result = await ChangePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        message(result.error);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      message("Password changed successfully.");
    } catch (err) {
      message("An unexpected error occured. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5">
      <Input
        type="password"
        id="currentpassword"
        label="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="••••••••"
        disabled={isLoading}
        required
      />
      <Input
        type="password"
        id="newpassword"
        label="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="••••••••"
        disabled={isLoading}
        required
      />
      <Input
        type="password"
        id="confirmpassword"
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        disabled={isLoading}
        required
      />

      <div className="flex items-center justify-end mt-2.5">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Change password
        </Button>
      </div>
    </form>
  );
}
