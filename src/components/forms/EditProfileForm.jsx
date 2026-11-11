"use client";

import { useState } from "react";
import Button from "../ui/Button";

export default function EditProfile({ onCancel }) {
  return (
    <form className="flex flex-1 flex-col gap-6 p-5">
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
        <Button
          type="button"
          variant="secondary"
          onCancel={() => onCancel(false)}
        >
          Discard
        </Button>
      </div>
    </form>
  );
}
