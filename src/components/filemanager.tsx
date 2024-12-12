"use client"
import React, { useState } from "react";

const FileManager = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileOpen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFileContent(content);
        };
        reader.readAsText(file);
      } catch (err) {
        setError("Error reading file: " + (err as Error).message);
        console.error("Error reading file: ", err);
      }
    }
  };

  const handleFileSave = () => {
    if (fileContent !== null) {
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "file.txt";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      setError("Content is empty.");
    }
  };
 
  return (
    <div>
      <h2>File Manager</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileOpen} />
      {fileContent !== null && (
        <div>
          {fileContent.startsWith("data:image") ? (
            <img src={fileContent} alt="Selected" style={{ maxWidth: "100%", height: "auto" }} />
          ) : (
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              rows={10}
              cols={50}
            />
          )}
          <button onClick={handleFileSave}>Save File</button>
        </div>
      )}
    </div>
  );
};

export default FileManager;

