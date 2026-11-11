"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { UpdateProfileAction } from "@/app/actions/profile";
import ErrorBanner from "../ui/ErrorBanner";
import Image from "next/image";

export default function EditProfile({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialData.avatarurl || null);
  const fileInputRef = useRef(null);
  const avatarFileRef = useRef(null);
  const removeAvatarRef = useRef(false);

  useEffect(() => {
    if (!previewUrl?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const calculateAge = (birthDate, today = new Date()) => {
    if (!birthDate) return null;

    const [year, month, day] = birthDate.split("-").map(Number);
    if (!year || !month || !day) return null;

    let age = today.getFullYear() - year;

    const beforeBirthDay =
      today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day);

    if (beforeBirthDay) age--;

    return age < 0 ? null : age;
  };

  const age = calculateAge(formData.birthdate);

  const handleAvatarChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    input.value = "";
    setErrorMsg("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMsg("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Profile photo must be 5MB or less.");
      return;
    }

    let image;
    try {
      image = await createImageBitmap(file);
      const maxDimension = 512;
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the image.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const resizedBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not resize the image.")),
          "image/jpeg",
          0.85,
        );
      });
      const resizedFile = new File([resizedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      if (resizedFile.size > 5 * 1024 * 1024) {
        throw new Error("Profile photo must be 5MB or less after resizing.");
      }

      avatarFileRef.current = resizedFile;
      setPreviewUrl(URL.createObjectURL(resizedFile));
      removeAvatarRef.current = false;
    } catch (error) {
      console.error("Could not prepare profile photo:", error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Could not prepare the image. Please choose another photo.",
      );
    } finally {
      image?.close();
    }
  };

  const handleRemoveAvatar = () => {
    avatarFileRef.current = null;
    setPreviewUrl(null);
    removeAvatarRef.current = Boolean(initialData.avatarurl);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const data = new FormData();
    data.append("firstname", formData.firstname ?? "");
    data.append("middlename", formData.middlename ?? "");
    data.append("lastname", formData.lastname ?? "");
    data.append("email", formData.email ?? "");
    data.append("phone", formData.phone ?? "");
    data.append("birthdate", formData.birthdate ?? "");
    data.append("age", age === null ? "" : String(age));
    data.append("address", formData.address ?? "");

    if (avatarFileRef.current) {
      data.append("avatar", avatarFileRef.current);
    }
    data.append("removeAvatar", String(removeAvatarRef.current));

    try {
      const result = await UpdateProfileAction(data);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onSuccess(result.data);
    } catch (error) {
      console.error("Could not save profile:", error);
      setErrorMsg("Could not save your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-8 p-5">
      {errorMsg && <ErrorBanner message={errorMsg} />}
      <div className=" flex flex-col md:flex-row items-center gap-6">
        {/* image container */}
        <div className="flex size-24 md:size-26 lg:size-28 bg-gray-200 rounded-lg items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden border border-gray-300 hover:border-black/90 transition-colors duration-300">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile photo preview"
              className="size-full object-cover"
            />
          ) : (
            <>
              {formData.firstname?.slice(0, 1).toUpperCase()}
              {formData.lastname?.slice(0, 1).toUpperCase()}
            </>
          )}
        </div>

        {/* upload and remove */}
        <div className="flex flex-col gap-2">
          <span className="text-gray-500 text-sm">Upload profile picture</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={handleRemoveAvatar}
            >
              Remove Photo
            </Button>
          </div>
        </div>
      </div>
      {errorMsg && (
        <p role="alert" className="text-sm text-red-600">
          {errorMsg}
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        <Input
          id="firstname"
          label="First Name"
          type="text"
          value={formData?.firstname ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, firstname: e.target.value })
          }
          disabled={isLoading}
          required
        />
        <Input
          id="middlename"
          label="Middle Name"
          type="text"
          value={formData?.middlename ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, middlename: e.target.value })
          }
          disabled={isLoading}
        />
        <Input
          id="lastname"
          label="Last Name"
          type="text"
          value={formData?.lastname ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, lastname: e.target.value })
          }
          disabled={isLoading}
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={formData?.email ?? ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          required
        />
        <Input
          id="phone"
          label="Phone"
          type="tel"
          value={formData?.phone ?? ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isLoading}
          required
        />
        <Input
          id="birthday"
          label="Birthday"
          type="date"
          value={formData?.birthdate ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, birthdate: e.target.value })
          }
          disabled={isLoading}
          required
        />
        <div className="flex flex-col gap-1">
          <Input
            id="age"
            label="Age"
            type="number"
            value={age ?? ""}
            disabled={true}
          />
          <span className="text-xs text-gray-500 italic">
            Age is auto calculated based on the given birthday.
          </span>
        </div>

        <Input
          id="address"
          name="address"
          label="Address"
          type="text"
          value={formData?.address ?? ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

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
