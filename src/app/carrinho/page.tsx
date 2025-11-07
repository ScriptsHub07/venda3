'use client';

import { useCart } from '@/lib/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function CartPage() {
  const { state, dispatch } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-semibold">Seu carrinho está vazio</h1>
        <p className="text-gray-500">Que tal adicionar alguns produtos?</p>
        <Link
          href="/produtos"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Carrinho de Compras</h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2 border-b border-gray-200 pb-4">
            <input
              type="checkbox"
              checked={state.items.every((item) => item.selected)}
              onChange={(e) =>
                dispatch({ type: 'TOGGLE_ALL', payload: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm font-medium">Selecionar todos os itens</span>
          </div>

          {/* Cart Items */}
          <ul className="divide-y divide-gray-200">
            {state.items.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() =>
                      dispatch({ type: 'TOGGLE_ITEM', payload: item.id })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                </div>

                <div className="ml-4 flex-shrink-0">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="h-24 w-24 rounded-md object-cover object-center"
                  />
                </div>

                <div className="ml-6 flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: 'REMOVE_ITEM', payload: item.id })
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_QUANTITY',
                            payload: {
                              id: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            },
                          })
                        }
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="text-gray-600">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_QUANTITY',
                            payload: {
                              id: item.id,
                              quantity: Math.min(
                                item.stock_quantity,
                                item.quantity + 1
                              ),
                            },
                          })
                        }
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="mt-16 rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 className="text-lg font-medium text-gray-900">Resumo do pedido</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-sm font-medium text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(state.selectedTotal)}
              </p>
            </div>

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

          <Link
            href={state.selectedItems.length > 0 ? '/checkout' : '#'}
            className={`mt-6 block w-full rounded-md px-4 py-3 text-center text-sm font-medium ${
              state.selectedItems.length > 0
                ? 'bg-black text-white hover:bg-gray-800'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            Finalizar Compra
            {state.selectedItems.length === 0 && ' (Selecione itens primeiro)'}
          </Link>
        </div>
      </div>
    </div>
  );
}