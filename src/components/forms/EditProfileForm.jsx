"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Trash2, Plus } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ErrorBanner from "../ui/ErrorBanner";
import {
  UpdateProfileAction,
  uploadResumeAction,
  deleteResumeAction,
  createSocialLinkAction,
  deleteSocialLinkAction,
} from "@/app/actions/profile";

const PLATFORM_PRESETS = [
  "GitHub",
  "LinkedIn",
  "Facebook",
  "X / Twitter",
  "Portfolio",
];

export default function EditProfile({
  initialData,
  initialSocialLinks = [],
  onCancel,
  onSuccess,
  successMessage,
}) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Avatar state & refs
  const [previewUrl, setPreviewUrl] = useState(initialData.avatarurl || null);
  const fileInputRef = useRef(null);
  const avatarFileRef = useRef(null);
  const removeAvatarRef = useRef(false);

  // Resume state & refs
  const [resumeName, setResumeName] = useState(
    initialData.resume_url
      ? `${initialData.firstname}_${initialData.lastname}_Resume.pdf`
      : null,
  );
  const resumeInputRef = useRef(null);
  const resumeFileRef = useRef(null);
  const removeResumeRef = useRef(false);

  // Social links state
  const [links, setLinks] = useState(initialSocialLinks);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [deletedLinkIds, setDeletedLinkIds] = useState([]);

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

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

  // --- Avatar Handlers ---
  const handleAvatarChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    input.value = "";

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
  };

  // --- Resume Handlers ---
  const handleResumeChange = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    input.value = "";

    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are allowed for your resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Resume PDF must be 5MB or less.");
      return;
    }

    resumeFileRef.current = file;
    setResumeName(file.name);
    removeResumeRef.current = false;
  };

  const handleRemoveResume = () => {
    resumeFileRef.current = null;
    setResumeName(null);
    removeResumeRef.current = Boolean(initialData.resume_url);
  };

  // --- Social Links Handlers ---
  const handleAddLinkToQueue = () => {
    const trimmedPlatform = newPlatform.trim();
    const trimmedUrl = newUrl.trim();

    if (!trimmedPlatform || !trimmedUrl) {
      setErrorMsg("Enter both a platform name and a valid URL.");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setErrorMsg("Please enter a valid URL starting with https://");
      return;
    }

    const exists = links.some(
      (l) => l.platform.toLowerCase() === trimmedPlatform.toLowerCase(),
    );
    if (exists) {
      setErrorMsg(`${trimmedPlatform} is already in your social links.`);
      return;
    }

    setLinks((prev) => [
      ...prev,
      {
        id: `temp-${crypto.randomUUID()}`,
        platform: trimmedPlatform,
        url: trimmedUrl,
        isNew: true,
      },
    ]);
    setNewPlatform("");
    setNewUrl("");
  };

  const handleRemoveLinkFromQueue = (link) => {
    if (!link.isNew) {
      setDeletedLinkIds((prev) => [...prev, link.id]);
    }
    setLinks((prev) => prev.filter((item) => item.id !== link.id));
  };

  // --- Save Everything ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Update core profile fields + avatar
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

      const result = await UpdateProfileAction(data);
      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      let latestProfile = result.data;

      // 2. Handle Resume upload or removal
      if (resumeFileRef.current) {
        const resumeFormData = new FormData();
        resumeFormData.append("resume", resumeFileRef.current);
        const resumeRes = await uploadResumeAction(resumeFormData);
        if (!resumeRes.success) {
          setErrorMsg(resumeRes.error);
          return;
        }
        latestProfile = resumeRes.data;
      } else if (removeResumeRef.current) {
        const delResumeRes = await deleteResumeAction();
        if (!delResumeRes.success) {
          setErrorMsg(delResumeRes.error);
          return;
        }
        latestProfile = delResumeRes.data;
      }

      // 3. Delete removed social links
      for (const linkId of deletedLinkIds) {
        const delRes = await deleteSocialLinkAction(linkId);
        if (!delRes.success) {
          setErrorMsg(delRes.error);
          return;
        }
      }

      // 4. Insert newly added social links (including any un-queued input)
      const pendingLinks = links.filter((l) => l.isNew);
      if (newPlatform.trim() && newUrl.trim()) {
        pendingLinks.push({
          platform: newPlatform.trim(),
          url: newUrl.trim(),
        });
      }

      const savedNewLinks = [];
      for (const item of pendingLinks) {
        const createRes = await createSocialLinkAction({
          platform: item.platform,
          url: item.url,
        });
        if (!createRes.success) {
          setErrorMsg(createRes.error);
          return;
        }
        savedNewLinks.push(createRes.data);
      }

      const finalLinks = [...links.filter((l) => !l.isNew), ...savedNewLinks];

      onSuccess(latestProfile, finalLinks);
      successMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Could not save profile:", error);
      setErrorMsg("Could not save your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-5">
      {errorMsg && <ErrorBanner message={errorMsg} />}

      {/* Avatar Upload */}
      <div className="flex flex-col md:flex-row items-center gap-6">
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

      {/* Core Personal Fields */}
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
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          disabled={isLoading}
          required
        />
      </div>

      {/* Social Links Manager */}
      <div className="flex flex-col gap-3 mt-2">
        <span className="text-gray-500 text-sm ">Social Links</span>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="sm:w-1/3">
            <input
              type="text"
              list="platform-presets"
              placeholder="Platform (e.g., GitHub)"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              disabled={isLoading}
              className="border w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors"
            />
            <datalist id="platform-presets">
              {PLATFORM_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-1 gap-2">
            <input
              type="url"
              placeholder="https://github.com/yourusername"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={isLoading}
              className="border w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={handleAddLinkToQueue}
            >
              <span className="inline-flex items-center gap-1">
                <Plus className="size-4" /> Add
              </span>
            </Button>
          </div>
        </div>

        {links.length > 0 && (
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2 text-xs"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm">{link.platform}</span>
                  <span className="text-gray-500 truncate">{link.url}</span>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleRemoveLinkFromQueue(link)}
                  className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                  title={`Remove ${link.platform}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume PDF Upload Section */}
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-gray-500 text-sm ">
          Resume / CV (PDF, Max 5MB)
        </span>
        <input
          ref={resumeInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={handleResumeChange}
          disabled={isLoading}
        />

        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12 px-6">
          <div className="flex items-center gap-3">
            {/* <FileText className="size-5 text-gray-600 shrink-0" /> */}
            <span className="text-sm">
              {resumeName || "No PDF file selected"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={isLoading}
              onClick={() => resumeInputRef.current?.click()}
            >
              {resumeName ? "Replace PDF" : "Upload PDF"}
            </Button>
            {resumeName && (
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={handleRemoveResume}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          disabled={isLoading}
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Discard
        </Button>
        <Button disabled={isLoading} type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
