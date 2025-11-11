import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <AppBar
      position="static"
      sx={{
        mb: 3,
        background: "linear-gradient(90deg, #5563DE, #74ABE2)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        borderRadius: 2,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* --- Left Section: Logo + App Name --- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.03)" },
          }}
          onClick={() => navigate("/dashboard")}
        >
          <img
            src="/logo.png"
            alt="App Logo"
            width={60}
            height={60}
            style={{
              marginRight: 12,
              borderRadius: "50%",
              objectFit: "cover",
              backgroundColor: "white",
              padding: "5px",
              boxShadow: "0 0 12px rgba(255, 255, 255, 0.8)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "white",
              fontSize: "1.3rem",
              transition: "0.3s",
              textShadow: "0 2px 4px rgba(0,0,0,0.4)",
              "&:hover": { color: "#FFD700" },
            }}
          >
            Income Tax Analysis
          </Typography>
        </Box>

        {/* --- Right Section: Auth Buttons --- */}
        {username ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: "white",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              Hello, {username || "Guest"}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                px: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/")}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                px: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/signup")}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                px: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
