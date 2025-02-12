import React, { useCallback, useEffect, useState } from "react";
import { Upload } from "lucide-react";

interface Props {
  onUpload: (file: File) => Promise<void>;
}

export function FileUpload({ onUpload }: Props) {
  const [apiKey, setApiKey] = useState(
    JSON.parse(localStorage.getItem("modelApiKeys") as string)
  );

  useEffect(() => {
    if (apiKey?.openai === "" || apiKey?.openai === undefined)
      alert("Add OpenAI apiKey to run document embeddings");
  }, [apiKey]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
    >
      <input
        type="file"
        onChange={(e) => {
          console.log(e.target.files?.[0]);
          e.target.files?.[0] && onUpload(e.target.files[0]);
        }}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center gap-2"
      >
        <Upload className="w-8 h-8 text-gray-400" />
        <div className="text-sm text-gray-600">
          <span className="text-blue-500 hover:text-blue-700">
            Click to upload
          </span>{" "}
          or drag and drop
        </div>
      </label>
    </div>
  );
}
