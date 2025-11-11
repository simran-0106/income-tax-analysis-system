import React, { useState } from "react";
import { signup } from "../api";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  // Validation
  if (!formData.username.trim()) return setError("Username is required");
  if (!formData.phone.trim()) return setError("Phone number is required");
  if (!/^\d{10}$/.test(formData.phone))
    return setError("Phone number must be exactly 10 digits");
  if (!formData.password.trim()) return setError("Password is required");
  if (formData.password.length < 6)
    return setError("Password must be at least 6 characters");

  setLoading(true);
  try {
    const res = await signup(formData);
    setSuccess(res.message || "Signup successful! Redirecting to login...");
    setFormData({ username: "", phone: "", password: "" });

    // Redirect to login page
    setTimeout(() => navigate("/"), 1500);
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Signup failed. Try again.";
    setError(msg);
    console.error("Signup error:", err);
  } finally {
    setLoading(false);
  }
};



  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #74ABE2, #5563DE)",
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          borderRadius: 3,
          width: { xs: "100%", sm: 400 },
          maxWidth: 450,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img src="/logo.png" alt="App Logo" width={80} height={80} />
        </Box>

        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, color: "#0f172a" }}
        >
          Create Account
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Join us to analyze your income tax data
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="e.g., john_doe"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
          />

          <TextField
  label="Phone Number"
  name="phone"
  type="tel"
  value={formData.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    if (value.length <= 10) {
      setFormData({ ...formData, phone: value });
    }
  }}
  fullWidth
  margin="normal"
  placeholder="e.g., 9876543210"
  disabled={loading}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <PhoneIcon />
      </InputAdornment>
    ),
  }}
  sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
/>


          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="Minimum 6 characters"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
          />

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              mb: 2,
              textAlign: "right",
              cursor: "pointer",
              color: "#1976d2",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => alert("Redirect to forgot password")}
          >
            Forgot Password?
          </Typography>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, borderRadius: 2, py: 1.5, fontWeight: 600, fontSize: 16 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign Up"}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Box
              component="span"
              sx={{
                color: "#1976d2",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => navigate("/")}
            >
              Login
            </Box>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
