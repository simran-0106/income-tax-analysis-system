import React, { useState } from "react";
import { signup } from "../api";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Paper, Typography, Box, CircularProgress, Alert } from "@mui/material";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({ username: username.trim(), phone: phone.trim(), password });
      setSuccess(res.message || "Signup successful!");
      setUsername("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Signup failed. Please try again.";
      setError(errorMsg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #74ABE2, #5563DE)",
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, width: 400, maxHeight: "90vh", overflowY: "auto" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Create Account
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Join us to analyze your income tax data
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            placeholder="Choose a unique username"
          />
          <TextField
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            placeholder="e.g., 9876543210"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            placeholder="Minimum 6 characters"
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            placeholder="Re-enter your password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, borderRadius: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign Up"}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <span
              style={{ color: "#1976d2", cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
