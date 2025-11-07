'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { Coupon } from '@/lib/types/database';
import { couponSchema } from '@/lib/validations/schemas';
import type { z } from 'zod';

type CouponFormData = z.infer<typeof couponSchema>;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const onSubmit = async (data: CouponFormData) => {
    try {
      setIsLoading(true);

      if (selectedCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(data)
          .eq('id', selectedCoupon.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([data]);

        if (error) throw error;
      }

      reset();
      setSelectedCoupon(null);
      await fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('coupons')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gerenciar Cupons</h1>
        <button
          onClick={() => {
            setSelectedCoupon(null);
            reset();
          }}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Novo Cupom
        </button>
      </div>

      {/* Coupon Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Código
            </label>
            <input
              type="text"
              id="code"
              {...register('code')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700">
              Limite de Usos
            </label>
            <input
              type="number"
              id="max_uses"
              {...register('max_uses', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.max_uses && (
              <p className="mt-1 text-sm text-red-600">{errors.max_uses.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700">
              Desconto (%)
            </label>
            <input
              type="number"
              step="0.01"
              id="discount_percentage"
              {...register('discount_percentage', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.discount_percentage && (
              <p className="mt-1 text-sm text-red-600">{errors.discount_percentage.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="discount_fixed" className="block text-sm font-medium text-gray-700">
              Desconto Fixo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              id="discount_fixed"
              {...register('discount_fixed', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.discount_fixed && (
              <p className="mt-1 text-sm text-red-600">{errors.discount_fixed.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="min_purchase_amount" className="block text-sm font-medium text-gray-700">
            Valor Mínimo da Compra (R$)
          </label>
          <input
            type="number"
            step="0.01"
            id="min_purchase_amount"
            {...register('min_purchase_amount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          {errors.min_purchase_amount && (
            <p className="mt-1 text-sm text-red-600">{errors.min_purchase_amount.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700">
              Data de Início
            </label>
            <input
              type="datetime-local"
              id="starts_at"
              {...register('starts_at')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.starts_at && (
              <p className="mt-1 text-sm text-red-600">{errors.starts_at.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
              Data de Expiração
            </label>
            <input
              type="datetime-local"
              id="expires_at"
              {...register('expires_at')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.expires_at && (
              <p className="mt-1 text-sm text-red-600">{errors.expires_at.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {isLoading ? 'Salvando...' : selectedCoupon ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>

      {/* Coupons List */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">Lista de Cupons</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Desconto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expira em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {coupon.code}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {coupon.discount_percentage
                        ? `${coupon.discount_percentage}%`
                        : coupon.discount_fixed
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(coupon.discount_fixed)
                        : '-'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {coupon.times_used}
                      {coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString('pt-BR')
                        : 'Sem expiração'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          reset(coupon);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}