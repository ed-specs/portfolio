"use client";

import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { UpdateProfileAction } from "@/app/actions/profile";

export default function EditProfile({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fullName = `${formData.firstname} ${formData.middlename.slice(0, 1).concat(".")} ${formData.lastname}`;

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

  let age = calculateAge(formData.birthdate);
  return (
    <form className="flex flex-1 flex-col gap-6 p-5">
      <div className=" flex flex-col md:flex-row items-center gap-6">
        {/* image container */}
        <div className="flex size-24 md:size-26 bg-gray-200 rounded-lg items-center justify-center text-3xl font-bold text-gray-500">
          {formData.firstname.slice(0, 1).toUpperCase()}
          {formData.lastname.slice(0, 1).toUpperCase()}
        </div>

        {/* upload and remove */}
        <div className="flex flex-col gap-2">
          <span className="text-gray-500 text-sm">Upload profile picture</span>
          <div className="flex gap-2">
            <Button type="button" variant="primary" disabled={isLoading}>
              Upload Photo
            </Button>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Remove Photo
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <Input
          id="firstname"
          label="First Name"
          type="text"
          value={formData?.firstname}
          onChange={(e) => setFormData.firstname(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          id="middlename"
          label="Middle Name"
          type="text"
          value={formData?.middlename}
          onChange={(e) => setFormData.middlename(e.target.value)}
          disabled={isLoading}
        />
        <Input
          id="lastname"
          label="Last Name"
          type="text"
          value={formData?.lastname}
          onChange={(e) => setFormData.lastname(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          id="phone"
          label="Phone"
          type="tel"
          value={formData?.phone}
          onChange={(e) => setFormData.phone(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          id="birthday"
          label="Birthday"
          type="date"
          value={formData?.birthdate}
          onChange={(e) => setFormData.birthdate(e.target.value)}
          disabled={isLoading}
          required
        />
        <div className="flex flex-col gap-1">
          <Input
            id="age"
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setFormData.age(e.target.value)}
            disabled={true}
          />
          <span className="text-xs text-gray-500 italic">
            Age is auto calculated based on the given birthday.
          </span>
        </div>

        <Input
          id="address"
          label="Address"
          type="text"
          value={formData?.address}
          onChange={(e) => setFormData.address(e.target.value)}
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
