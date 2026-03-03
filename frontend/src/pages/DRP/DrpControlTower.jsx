import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/env";
import { useNavigate } from "react-router-dom";

export default function DrpControlTower() {

  const [activas, setActivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* ===============================
     CARGAR ÓRDENES
  =============================== */
  const loadData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/drp/control-tower`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  /* ===============================
     AVANZAR ESTADO ORDEN
  =============================== */
  const avanzarOrden = async (order_id) => {
    try {
      setProcessingId(order_id);

      await axios.post(
        `${API_BASE}/api/drp/order-next-status`,
        { order_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadData(); // refresca tabla

    } catch (err) {
      console.error("Error avanzando orden:", err);
      alert("No se pudo avanzar la orden");
    } finally {
      setProcessingId(null);
    }
  };

  /* =============================== */

  if (loading) {
    return <div className="text-white p-6">Cargando Control Tower...</div>;
  }

  return (
    <div className="p-6 text-white">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          🚀 Supply Chain Control Tower
        </h1>

        <button
          onClick={() => navigate("/drp/intro")}
          className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
        >
          Menú DRP
        </button>
      </div>

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
                <th>Acción</th>
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

                  <td>
                    {o.status === "CLOSED" ? (
                      <span className="text-gray-500">—</span>
                    ) : (
                      <button
                        onClick={() => avanzarOrden(o.order_id)}
                        disabled={processingId === o.order_id}
                        className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-xs"
                      >
                        {processingId === o.order_id
                          ? "Procesando..."
                          : "Avanzar"}
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