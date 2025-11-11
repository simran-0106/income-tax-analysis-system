import React, { useState } from "react";
import axios from "axios";
import { Button, Box, LinearProgress, Typography } from "@mui/material";

export default function Upload({ onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Upload response:", res.data);
      if (onUploaded) onUploaded(res.data.summary);
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        component="label"
        sx={{ borderRadius: 2, mb: 1 }}
      >
        Upload File
        <input
          type="file"
          hidden
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
      </Button>

      {loading && <LinearProgress sx={{ mt: 1, mb: 1 }} />}
      {fileName && (
        <Typography variant="body2" color="text.secondary">
          Selected: {fileName}
        </Typography>
      )}
    </Box>
  );
}
