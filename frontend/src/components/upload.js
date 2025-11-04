import React, { useState } from "react";
import { uploadFile } from "../api";

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await uploadFile(file, token);

      console.log("Upload Response:", res);
      setMessage(res.message || "File uploaded");

      if (res.summary) {
        onUploaded(res.summary);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        style={{
          marginLeft: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "6px 14px",
          cursor: "pointer",
        }}
      >
        UPLOAD
      </button>
      {message && <p style={{ color: "#555", marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
