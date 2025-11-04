import React, { useState, useEffect } from "react";
import axios from "axios";
import Upload from "./upload";
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
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({ users: 0, uploads: 0, fraud: 0 });

  // Fetch metric stats
  useEffect(() => {
    axios
      .get("/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

  // Dummy data for bar chart
  const barData = [
    { name: "Fraud", count: 12 },
    { name: "Non-Fraud", count: 88 },
  ];

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
        backgroundColor: "#f9fafc",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
        📊 Income Tax Analysis Dashboard
      </h1>
      <p style={{ marginBottom: "20px", color: "#7f8c8d" }}>
        Welcome <b>{localStorage.getItem("email")}</b>
      </p>

      {/* ---------- METRIC CARDS ---------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#1abc9c",
            padding: "20px 40px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            minWidth: "200px",
          }}
        >
          <h3>Total Users</h3>
          <h2>{stats.users}</h2>
        </div>

        <div
          style={{
            background: "#3498db",
            padding: "20px 40px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            minWidth: "200px",
          }}
        >
          <h3>Files Uploaded</h3>
          <h2>{stats.uploads}</h2>
        </div>

        <div
          style={{
            background: "#e74c3c",
            padding: "20px 40px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            minWidth: "200px",
          }}
        >
          <h3>Detected Frauds</h3>
          <h2>{stats.fraud}</h2>
        </div>
      </div>

      {/* ---------- FILE UPLOAD SECTION ---------- */}
      <Upload onUploaded={(s) => setSummary(s)} />

      {/* ---------- FILE SUMMARY ---------- */}
      {summary ? (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ color: "#34495e" }}>File Summary</h2>
          <p>
            Rows: <b>{summary.rows}</b> | Columns: <b>{summary.columns}</b>
          </p>

          <pre
            style={{
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "left",
              maxWidth: "700px",
              margin: "20px auto",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(summary.columns_list, null, 2)}
          </pre>

          {/* ---------- DATA PREVIEW ---------- */}
          {summary.preview &&
            Array.isArray(summary.preview) &&
            summary.preview.length > 0 && (
              <>
                <h3 style={{ color: "#2c3e50", marginTop: "30px" }}>
                  Data Preview
                </h3>
                <table
                  style={{
                    borderCollapse: "collapse",
                    margin: "20px auto",
                    width: "80%",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  <thead>
                    <tr>
                      {Object.keys(summary.preview[0]).map((key) => (
                        <th
                          key={key}
                          style={{
                            border: "1px solid #ddd",
                            padding: "10px",
                            background: "#3498db",
                            color: "white",
                            textTransform: "capitalize",
                          }}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            style={{
                              border: "1px solid #ddd",
                              padding: "10px",
                              textAlign: "center",
                              color: "#2c3e50",
                            }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ---------- BAR CHART FOR FRAUD DISPLAY ---------- */}
                <div style={{ width: "80%", margin: "50px auto" }}>
                  <h3 style={{ color: "#2c3e50", marginBottom: "20px" }}>
                    Fraud vs Non-Fraud Bar Chart
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3498db" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* ---------- PIE CHART ---------- */}
                <div style={{ width: "100%", height: 400 }}>
                  <h3 style={{ color: "#2c3e50", marginTop: "30px" }}>
                    Analysis Overview
                  </h3>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        isAnimationActive={true}
                        data={[
                          { name: "Tax Paid", value: 45 },
                          { name: "Refunds", value: 30 },
                          { name: "Pending", value: 25 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
        </div>
      ) : null}
    </div>
  );
}
