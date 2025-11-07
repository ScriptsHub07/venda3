'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiPackage } from 'react-icons/fi';
import type { Order, OrderItem, Product } from '@/lib/types/database';

type ExtendedOrder = Order & {
  user_profiles: {
    full_name: string;
  };
  addresses: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
  };
  items: (OrderItem & {
    products: Product;
  })[];
};

const statusMap = {
  pending: 'Pendente',
  processing: 'Em Separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expectedDelivery, setExpectedDelivery] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState<string>('');

  const supabase = createClientComponentClient();

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user_profiles (
            full_name
          ),
          addresses (
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            postal_code
          ),
          items:order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: keyof typeof statusMap) => {
    try {
      setIsLoading(true);
      
      const updateData: Partial<Order> = { status };
      
      if (status === 'shipped' && trackingCode) {
        updateData.tracking_code = trackingCode;
      }
      
      if (expectedDelivery) {
        updateData.expected_delivery = expectedDelivery;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gerenciar Pedidos</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Pedido #{order.id.slice(0, 8)}
                </h3>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusMap[order.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="px-4 py-3">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium uppercase text-gray-500">Cliente</h4>
                  <p className="text-sm text-gray-900">{order.user_profiles.full_name}</p>
                </div>

                <div>
                  <h4 className="text-xs font-medium uppercase text-gray-500">Endereço</h4>
                  <p className="text-sm text-gray-900">
                    {order.addresses.street}, {order.addresses.number}
                    {order.addresses.complement && `, ${order.addresses.complement}`}
                    <br />
                    {order.addresses.neighborhood} - {order.addresses.city}/{order.addresses.state}
                    <br />
                    CEP: {order.addresses.postal_code}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-medium uppercase text-gray-500">Itens</h4>
                  <ul className="mt-1 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-900">
                        {item.quantity}x {item.products.name} - {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.total_price)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <div>
                    <h4 className="text-xs font-medium uppercase text-gray-500">Total</h4>
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(order.total)}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setSelectedOrder(null)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <FiPackage className="h-6 w-6 text-gray-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Atualizar Status do Pedido
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="tracking" className="block text-sm font-medium text-gray-700">
                        Código de Rastreio
                      </label>
                      <input
                        type="text"
                        id="tracking"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="delivery" className="block text-sm font-medium text-gray-700">
                        Previsão de Entrega
                      </label>
                      <input
                        type="date"
                        id="delivery"
                        value={expectedDelivery}
                        onChange={(e) => setExpectedDelivery(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {(Object.keys(statusMap) as Array<keyof typeof statusMap>).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          className={`rounded-md px-4 py-2 text-sm font-medium ${
                            selectedOrder.status === status
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          } border border-gray-300`}
                        >
                          {statusMap[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}