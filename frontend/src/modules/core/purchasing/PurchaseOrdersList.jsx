import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/env";
import { useNavigate } from "react-router-dom";

export default function PurchaseOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/purchasing/company/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (id) => {
    try {
      setApprovingId(id);

      await axios.put(
        `${API_BASE}/api/purchasing/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchOrders();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al aprobar");
    } finally {
      setApprovingId(null);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-500";
      case "approved":
        return "bg-blue-600";
      case "partially_received":
        return "bg-orange-500";
      case "received":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order =>
        statusFilter === "ALL"
          ? true
          : order.status === statusFilter
      )
      .filter(order =>
        order.supplier_name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [orders, statusFilter, search]);

  if (loading) {
    return (
      <div className="p-10 bg-gray-900 text-white">
        Cargando órdenes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        📦 Órdenes de Compra
      </h1>

      {/* 🔎 Filtros */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">

        <div className="flex flex-col md:flex-row gap-4 justify-between">

          <div className="flex gap-2 flex-wrap">
            {[
              "ALL",
              "pending_approval",
              "approved",
              "partially_received",
              "received"
            ].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  statusFilter === status
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {status === "ALL" ? "Todos" : status}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-700 p-2 rounded-lg w-full md:w-64"
          />

        </div>

        <div className="mt-4 text-sm text-gray-400">
          Mostrando {filteredOrders.length} órdenes
        </div>

      </div>

      {/* 📋 Tabla */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6">

        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No hay órdenes
          </div>
        ) : (

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="py-3">ID</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
                <th>Total Ítems</th>
                <th>Total $</th> 
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td>{order.total_items}</td>

                  <td className="font-semibold text-green-400">
                    ${Number(order.total_amount).toLocaleString()}
                  </td>

                  <td className="py-3 text-sm">
                    {order.id.substring(0, 8)}...
                  </td>

                  <td>{order.supplier_name}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>

                  <td className="space-x-2">

                    {order.status === "pending_approval" && (
                      <button
                        onClick={() => approveOrder(order.id)}
                        disabled={approvingId === order.id}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
                      >
                        {approvingId === order.id
                          ? "Aprobando..."
                          : "Aprobar"}
                      </button>
                    )}

                    {["approved", "partially_received"].includes(order.status) && (
                      <button
                        onClick={() =>
                          navigate(`/core/purchasing/receive/${order.id}`)
                        }
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition"
                      >
                        Recibir
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        )}

      </div>
    </div>
  );
}