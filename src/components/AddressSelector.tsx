'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { addressSchema } from '@/lib/validations/schemas';
import type { Address } from '@/lib/types/database';
import type { z } from 'zod';
import { FiPlus } from 'react-icons/fi';

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressSelector({
  onSelect,
  selectedId,
}: {
  onSelect: (address: Address) => void;
  selectedId?: string;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchAddresses();
  }, [supabase, selectedId, onSelect]);

  const fetchAddresses = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data);

      if (data.length > 0 && !selectedId) {
        const defaultAddress = data.find((addr) => addr.is_default) || data[0];
        onSelect(defaultAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data: address, error } = await supabase
        .from('addresses')
        .insert([{ ...data, user_id: session.session.user.id }])
        .select()
        .single();

      if (error) throw error;

      setAddresses((prev) => [address, ...prev]);
      setShowForm(false);
      reset();
      onSelect(address);
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-2">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`block cursor-pointer rounded-lg border p-4 ${
                selectedId === address.id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="address"
                value={address.id}
                checked={selectedId === address.id}
                onChange={() => onSelect(address)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.neighborhood} - {address.city}/{address.state}
                  </p>
                  <p className="text-sm text-gray-500">CEP: {address.postal_code}</p>
                </div>
                {address.is_default && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Principal
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Add New Address Button/Form */}
      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Rua
              </label>
              <input
                type="text"
                id="street"
                {...register('street')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                Número
              </label>
              <input
                type="text"
                id="number"
                {...register('number')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="complement" className="block text-sm font-medium text-gray-700">
              Complemento
            </label>
            <input
              type="text"
              id="complement"
              {...register('complement')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.complement && (
              <p className="mt-1 text-sm text-red-600">{errors.complement.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                Bairro
              </label>
              <input
                type="text"
                id="neighborhood"
                {...register('neighborhood')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.neighborhood && (
                <p className="mt-1 text-sm text-red-600">{errors.neighborhood.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <input
                type="text"
                id="state"
                maxLength={2}
                {...register('state')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                CEP
              </label>
              <input
                type="text"
                id="postal_code"
                {...register('postal_code')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.postal_code && (
                <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              {...register('is_default')}
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
              Definir como endereço principal
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-medium text-gray-900 hover:border-gray-400"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Adicionar novo endereço
        </button>
      )}
    </div>
  );
}
