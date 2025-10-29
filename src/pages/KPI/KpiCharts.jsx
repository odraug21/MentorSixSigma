// src/pages/KPI/KpiCharts.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function KpiCharts({ data }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mt-6">
      <h2 className="text-lg font-semibold text-indigo-400 mb-4 text-center">
        📊 Comparativo Mensual de KPIs
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="mes" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Legend />
          <Bar dataKey="OEE" fill="#3b82f6" />
          <Bar dataKey="OOE" fill="#22c55e" />
          <Bar dataKey="TEEP" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
