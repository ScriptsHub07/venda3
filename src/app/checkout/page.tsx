'use client';

import { useState } from 'react';
import { useCart } from '@/lib/contexts/CartContext';
import AddressSelector from '@/components/AddressSelector';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Address } from '@/lib/types/database';
import Image from 'next/image';
import QRCode from 'qrcode';

export default function CheckoutPage() {
  const { state } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  if (state.selectedItems.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-semibold">Nenhum item selecionado</h1>
        <p className="text-gray-500">
          Volte ao carrinho e selecione os itens para compra
        </p>
      </div>
    );
  }

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      if (!selectedAddress) {
        alert('Por favor, selecione um endereço de entrega');
        return;
      }

      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: session.user.id,
            address_id: selectedAddress.id,
            status: 'pending',
            subtotal: state.selectedTotal,
            discount: 0,
            total: state.selectedTotal,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = state.selectedItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create PIX charge using Efi Bank API
      // Placeholder for Efi Bank API integration
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: state.selectedTotal,
          description: `Pedido #${order.id.slice(0, 8)}`,
        }),
      });

      const paymentData = await response.json();

      // Generate QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(paymentData.qrCodeText);
      
      setPixQrCode(qrCodeDataUrl);
      setPixCopiaECola(paymentData.copiaECola);
      setOrderId(order.id);

    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Erro ao processar o pedido. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <div className="space-y-6">
            {/* Delivery Address */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Endereço de Entrega
              </h2>
              <div className="mt-4">
                <AddressSelector
                  onSelect={setSelectedAddress}
                  selectedId={selectedAddress?.id}
                />
              </div>
            </div>

            {/* Selected Items */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">Itens Selecionados</h2>
              <ul className="mt-4 divide-y divide-gray-200 border-t border-b">
                {state.selectedItems.map((item) => (
                  <li key={item.id} className="flex py-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-md object-cover object-center"
                      />
                    </div>
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="ml-4 text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 lg:col-span-5 lg:mt-0">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 sm:p-6 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Resumo do Pedido</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">Total</p>
                <p className="text-base font-medium text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(state.selectedTotal)}
                </p>
              </div>
            </div>

            {pixQrCode ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    Pague com PIX
                  </h3>
                  <div className="mt-4">
                    <Image
                      src={pixQrCode}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">ou</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (pixCopiaECola) {
                          navigator.clipboard.writeText(pixCopiaECola);
                          alert('Código PIX copiado!');
                        }
                      }}
                      className="mt-2 text-sm font-medium text-black hover:text-gray-700"
                    >
                      Copiar código PIX
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isLoading || !selectedAddress}
                className="mt-6 w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isLoading ? 'Processando...' : 'Finalizar Compra'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}