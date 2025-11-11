import React, { useState, useEffect } from "react";
import axios from "axios";
import Upload from "./upload";
import {
  Container, Grid, Card, CardContent, Typography, Box, Divider
} from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({ users: 0, uploads: 0, fraud: 0 });
  const [fraudStats, setFraudStats] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/stats");
      setStats(res.data || { users: 0, uploads: 0, fraud: 0 });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchFraudData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/fraud-data");
      const data = res.data || [];

      const high = data.filter((d) => d.fraud_risk >= 0.6).length;
      const medium = data.filter((d) => d.fraud_risk >= 0.25 && d.fraud_risk < 0.6).length;
      const low = data.filter((d) => d.fraud_risk > 0 && d.fraud_risk < 0.25).length;
      const none = data.filter((d) => d.fraud_risk === 0).length;

      setFraudStats([
        { name: "High Risk", count: high, color: "#e74c3c" },
        { name: "Medium Risk", count: medium, color: "#f39c12" },
        { name: "Low Risk", count: low, color: "#3498db" },
        { name: "No Risk", count: none, color: "#2ecc71" },
      ]);
    } catch (err) {
      console.error("Error fetching fraud data:", err);
    }
  };

  useEffect(() => {
    if (summary) {
      fetchStats();
      fetchFraudData();
    }
  }, [refresh, summary]);

  const barData = [
    { name: "Fraud", count: stats.fraud },
    { name: "Non-Fraud", count: stats.uploads - stats.fraud },
  ];

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          mt: 2,
          p: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg,#4facfe,#00f2fe)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Income Tax Analysis Dashboard
        </Typography>
        <Typography variant="subtitle1">
          Welcome, <strong>{localStorage.getItem("username") || "Guest"}</strong>
        </Typography>
      </Box>

      {/* Upload Section */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Financial Data
          </Typography>
          <Upload
            onUploaded={(s) => {
              setSummary(s);
              setRefresh((prev) => !prev);
            }}
          />
        </CardContent>
      </Card>

      {/* ✅ Metrics Panel (visible after file upload) */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: "center", borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" color="text.secondary">
                👥 Users Logged In
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                {stats.users}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: "center", borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" color="text.secondary">
                📁 Files Uploaded
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                {stats.uploads}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: "center", borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" color="text.secondary">
                ⚠️ Fraud Detected
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  color: stats.fraud > 0 ? "#e74c3c" : "#2ecc71",
                }}
              >
                {stats.fraud}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* File Summary */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6">File Summary</Typography>
          <Divider sx={{ my: 1 }} />

          {summary ? (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rows: <strong>{summary.rows}</strong> | Columns:{" "}
                <strong>{summary.columns}</strong>
              </Typography>

              {Array.isArray(summary.data) && summary.data.length > 0 ? (
                <Box sx={{ overflowX: "auto", mt: 2 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {Object.keys(summary.data[0]).map((key) => (
                          <th
                            key={key}
                            style={{
                              borderBottom: "1px solid #ccc",
                              padding: "8px",
                              textAlign: "left",
                            }}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.data.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td
                              key={j}
                              style={{
                                borderBottom: "1px solid #eee",
                                padding: "8px",
                              }}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No data available in file.
                </Typography>
              )}
            </>
          ) : (
            <Typography color="text.secondary">No file uploaded yet.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Charts Section — Only after upload */}
      {summary && (
        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">Fraud vs Non-Fraud</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Fraud Risk Distribution */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">Fraud Risk Distribution</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={fraudStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count">
                      {fraudStats.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">Analysis Overview</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      dataKey="count"
                      data={fraudStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {fraudStats.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
