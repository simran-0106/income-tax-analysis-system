import React, { useState } from "react";
import { login } from "../api";
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
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../assets/logo.png"; // ✅ Make sure logo.png is inside src/assets/

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(formData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", formData.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
      console.error("Login error:", err);
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
        }}
      >
        {/* ✅ Logo Section */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1,
              letterSpacing: "0.5px",
            }}
          >
            App Logo
          </Typography>

          <img
            src={logo}
            alt="App Logo"
            style={{
              width: "110px",
              height: "110px",
              objectFit: "contain",
              borderRadius: "50%",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
              marginBottom: "15px",
            }}
          />
        </Box>

        {/* ✅ Welcome Message */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, color: "#0f172a" }}
        >
          Welcome Back
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Login to continue
        </Typography>

        {/* ✅ Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* ✅ Form */}
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
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="Enter your password"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
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
            sx={{
              mt: 2,
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              fontSize: 16,
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Login"
            )}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center">
            Don’t have an account?{" "}
            <Box
              component="span"
              sx={{
                color: "#1976d2",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Box>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
