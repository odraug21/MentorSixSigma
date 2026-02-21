import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/env";

export default function DrpOrders() {

  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const cargar = async () => {
    const res = await axios.get(`${API_BASE}/api/drp/orders`, {
      headers:{ Authorization:`Bearer ${token}` }
    });
    setOrders(res.data.orders);
  };

  const avanzar = async (order, next) => {
    await axios.post(`${API_BASE}/api/drp/order-next-status`,
      {
        order_id: order.order_id,
        next_status: next
      },
      { headers:{ Authorization:`Bearer ${token}` }}
    );
    cargar();
  };

  useEffect(()=>{ cargar(); },[]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🚚 Órdenes Logísticas</h1>

      <table className="w-full bg-gray-800 rounded-lg">
        <thead className="bg-gray-700">
          <tr>
            <th>SKU</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(o=>(
            <tr key={o.order_id}>
              <td>{o.sku_code}</td>
              <td>{o.origin}</td>
              <td>{o.destination}</td>
              <td>{o.qty}</td>
              <td>{o.status}</td>
              <td>

                {o.status==="APPROVED" &&
                  <button onClick={()=>avanzar(o,"RELEASED")}>Liberar</button>}

                {o.status==="RELEASED" &&
                  <button onClick={()=>avanzar(o,"IN_TRANSIT")}>En tránsito</button>}

                {o.status==="IN_TRANSIT" &&
                  <button onClick={()=>avanzar(o,"RECEIVED")}>Recibir</button>}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
