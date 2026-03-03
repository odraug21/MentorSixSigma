import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/env";
import { useParams } from "react-router-dom";

export default function ReceivePurchaseOrder() {
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");
  const warehouseId = localStorage.getItem("warehouseId");

  useEffect(() => {
    fetchPO();
  }, []);

  const fetchPO = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/purchasing/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (itemId, value) => {
    setQuantities({
      ...quantities,
      [itemId]: Number(value)
    });
  };

  const handleReceive = async () => {
    const items = Object.keys(quantities)
      .filter(k => quantities[k] > 0)
      .map(k => ({
        itemId: k,
        quantity: quantities[k]
      }));

    if (items.length === 0) {
      alert("Debe ingresar cantidades");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/purchasing/${id}/receive`,
        {
          companyId,
          warehouseId,
          items
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Recepción registrada correctamente");
      fetchPO();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-white bg-gray-900">
        Cargando orden...
      </div>
    );
  }

  if (!po) {
    return (
      <div className="p-10 text-white bg-gray-900">
        Orden no encontrada
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        Recepción Parcial – PO {po.id}
      </h1>

      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3">Producto</th>
              <th>Solicitado</th>
              <th>Recibido</th>
              <th>Pendiente</th>
              <th>Recibir Ahora</th>
            </tr>
          </thead>

          <tbody>
            {po.items.map(item => {

              const pending =
                Number(item.quantity) -
                Number(item.received_quantity);

              return (
                <tr
                  key={item.id}
                  className="border-b border-gray-700"
                >
                  <td className="py-3">
                    {item.product_name}
                  </td>

                  <td>{item.quantity}</td>

                  <td>{item.received_quantity}</td>

                  <td className="text-yellow-400 font-semibold">
                    {pending}
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max={pending}
                      className="bg-gray-700 p-2 rounded-lg w-24"
                      onChange={(e) =>
                        handleChange(item.id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 text-right">
          <button
            onClick={handleReceive}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
          >
            Confirmar Recepción
          </button>
        </div>

      </div>
    </div>
  );
}