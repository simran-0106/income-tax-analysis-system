import React, { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Paper, Typography, Box, CircularProgress, Alert } from "@mui/material";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const res = await login({ username: username.trim(), password });
      
      if (!res.token) {
        setError("No token received. Please try again.");
        return;
      }

      // Store credentials in localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", username.trim());

      // Clear form
      setUsername("");
      setPassword("");

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      setError(errorMsg);
      console.error("Login error:", err);
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
        background: "linear-gradient(135deg, #5563DE, #74ABE2)",
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Login to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            placeholder="Enter your username"
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
            placeholder="Enter your password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, borderRadius: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <span
              style={{ color: "#1976d2", cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
