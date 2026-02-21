import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/env";

export default function DrpControlTower() {

  const [activas, setActivas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/drp/control-tower`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 Solo usamos lo que realmente devuelve el backend
      setActivas(res.data?.activas || []);

    } catch (err) {
      console.error("Error cargando Control Tower:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="text-white p-6">Cargando Control Tower...</div>;
  }

  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">
        🚀 Supply Chain Control Tower
      </h1>

      <div className="bg-gray-900 p-4 rounded-xl">

        <h2 className="text-xl font-semibold mb-3">
          Órdenes Activas
        </h2>

        {activas.length === 0 ? (
          <p className="text-gray-400">
            No hay órdenes activas aún.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400">
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Qty</th>
                <th>Fecha Req.</th>
              </tr>
            </thead>

            <tbody>
              {activas.map(o => (
                <tr key={o.order_id} className="border-t border-gray-700">
                  <td>{o.order_id}</td>
                  <td>{o.sku_code}</td>
                  <td>{o.order_type}</td>
                  <td>
                    <span className="bg-cyan-700 px-2 py-1 rounded text-xs">
                      {o.status}
                    </span>
                  </td>
                  <td>{Number(o.qty).toFixed(0)}</td>
                  <td>
                    {new Date(o.required_date).toLocaleDateString()}
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