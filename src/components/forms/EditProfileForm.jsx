"use client";

import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { UpdateProfileAction } from "@/app/actions/profile";

export default function EditProfile({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <form className="flex flex-1 flex-col gap-6 p-5">
      <div className="flex items-center gap-2">
        <Button disabled={isLoading} type="submit" variant="primary">
          Save Changes
        </Button>
        <Button
          disabled={isLoading}
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Discard
        </Button>
      </div>
    </form>
  );
}
