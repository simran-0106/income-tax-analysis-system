import React, { useState, useEffect } from "react";
import axios from "axios";
import Upload from "./upload";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({ users: 0, uploads: 0, fraud: 0 });
  const [fraudStats, setFraudStats] = useState([]);

  useEffect(() => {
    // Fetch basic stats
    axios
      .get("/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.info("/stats not available yet", err));

    // Fetch augmented data for fraud analysis
    axios
      .get("/augmented-data")
      .then((res) => {
        const data = typeof res.data === 'string' 
          ? res.data.split('\n').slice(1) // Skip header if CSV
            .map(line => line.split(','))
            .filter(parts => parts.length >= 6)
            .map(([date, category, desc, amount, type, , fraud_risk]) => ({
              date, category, amount: parseFloat(amount),
              fraud_risk: parseFloat(fraud_risk || 0)
            }))
          : [];

        // Calculate fraud distribution
        const high = data.filter(d => d.fraud_risk >= 0.6).length;
        const medium = data.filter(d => d.fraud_risk >= 0.25 && d.fraud_risk < 0.6).length;
        const low = data.filter(d => d.fraud_risk > 0 && d.fraud_risk < 0.25).length;
        const none = data.filter(d => d.fraud_risk === 0).length;

        setFraudStats([
          { name: "High Risk", count: high, color: "#e74c3c" },
          { name: "Medium Risk", count: medium, color: "#f39c12" },
          { name: "Low Risk", count: low, color: "#3498db" },
          { name: "No Risk", count: none, color: "#2ecc71" }
        ]);
      })
      .catch(err => console.error("Error loading fraud stats:", err));
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

  const barData = [
    { name: "Fraud", count: 12 },
    { name: "Non-Fraud", count: 88 },
  ];

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#0f172a' }}>
          Income Tax Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ color: '#475569' }}>
          Overview and analytics — Welcome <strong>{localStorage.getItem("username") || "Guest"}</strong>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper component="section" sx={{ mb: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, p: 3 }}>
                        <Box sx={{ width: '100%', textAlign: 'center', py: 1, background: 'linear-gradient(135deg,#1abc9c,#16a085)', color: '#fff', borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Total Users</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.users}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, p: 3 }}>
                        <Box sx={{ width: '100%', textAlign: 'center', py: 1, background: 'linear-gradient(135deg,#3498db,#2980b9)', color: '#fff', borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Files Uploaded</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.uploads}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, p: 3 }}>
                        <Box sx={{ width: '100%', textAlign: 'center', py: 1, background: 'linear-gradient(135deg,#e74c3c,#c0392b)', color: '#fff', borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Detected Frauds</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.fraud}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 600 }}>
                      Upload Financial Data
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ 
                        cursor: 'pointer', 
                        textDecoration: 'underline',
                        mb: 2,
                        display: 'inline-block'
                      }}
                      onClick={() => window.open('/guidelines', '_blank')}
                    >
                      View Upload Guidelines
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Upload onUploaded={(s) => setSummary(s)} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper component="section" sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 1, bgcolor: '#ffffff' }}>
            <CardContent>
              <Typography variant="h6">File Summary</Typography>
              <Divider sx={{ my: 1 }} />

              {summary ? (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Rows: <strong>{summary.rows}</strong> | Columns: <strong>{summary.columns}</strong>
                  </Typography>

                  <Box sx={{ bgcolor: '#f4f6f8', p: 2, borderRadius: 1, mb: 2, overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(summary.columns_list, null, 2)}</pre>
                  </Box>

                  {summary.preview && Array.isArray(summary.preview) && summary.preview.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Data Preview</Typography>
                        <Box component="div" sx={{ width: '100%', overflowX: 'auto', borderRadius: 1 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                {Object.keys(summary.preview[0]).map((key) => (
                                  <th key={key} style={{ textAlign: 'left', padding: '8px', background: '#1976d2', color: '#fff' }}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {summary.preview.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((val, j) => (
                                    <td key={j} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No file uploaded yet.</Typography>
              )}
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper component="section" sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 600 }}>
                      Fraud vs Non-Fraud
                    </Typography>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                        <Legend />
                        <Bar dataKey="count" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 600 }}>
                      Analysis Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie dataKey="value" isAnimationActive data={[{ name: 'Tax Paid', value: 45 }, { name: 'Refunds', value: 30 }, { name: 'Pending', value: 25 }]} cx="50%" cy="50%" outerRadius={80} label>
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box component="section" sx={{ mb: 3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Fraud Risk Distribution</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Transaction count by risk level
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fraudStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4 }}
                      formatter={(value) => [`${value} transactions`, 'Count']}
                    />
                    <Bar dataKey="count" name="Transactions">
                      {fraudStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Embedded visualizations generated on the backend (Plotly) */}
        <Grid item xs={12} md={6}>
          <Box component="section" sx={{ mb: 3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Interactive: Income vs Tax</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ height: 360 }}>
                  <iframe
                    title="income-tax-visual"
                    src="/uploads/visualization_income_tax.html"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box component="section" sx={{ mb: 3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Interactive: Fraud Risk Distribution</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ height: 360 }}>
                  <iframe
                    title="fraud-bar-visual"
                    src="/uploads/visualization_fraud_bar.html"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Power BI Analysis Section */}
        {/* <Grid item xs={12}>
          <Paper sx={{ 
            background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
            borderRadius: 2,
            p: 3,
            mt: 2
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} container alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: '#1a237e' }}>
                    Power BI Analytics Hub
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: '#1565c0', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 1
                    }}
                  >
                    Live Dashboard
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="overline" sx={{ color: '#546e7a', letterSpacing: 1 }}>
                      KEY INSIGHT
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#102027', mt: 1 }}>
                      Income Tax Patterns
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#37474f', mt: 1 }}>
                      Analyze yearly patterns, identify anomalies, and track filing trends across different income brackets.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="overline" sx={{ color: '#546e7a', letterSpacing: 1 }}>
                      TREND ANALYSIS
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#102027', mt: 1 }}>
                      Risk Assessment
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#37474f', mt: 1 }}>
                      Monitor fraud indicators, risk scores, and compliance metrics in real-time.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="overline" sx={{ color: '#546e7a', letterSpacing: 1 }}>
                      PREDICTIVE METRICS
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#102027', mt: 1 }}>
                      Future Projections
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#37474f', mt: 1 }}>
                      View AI-powered predictions for tax revenue and risk patterns based on historical data.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                  <Box sx={{ 
                    height: 600, 
                    bgcolor: '#ffffff',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    <iframe
                      title="power-bi-dashboard"
                      src="about:blank" // Replace with actual Power BI embed URL
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      allowFullScreen={true}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item container xs={12} justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Grid item>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Last updated: Real-time
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Powered by Power BI Analytics
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid> */}
        
      </Grid>
    </Container>
  );
}
