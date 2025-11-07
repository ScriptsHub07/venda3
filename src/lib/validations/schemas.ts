import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório').max(2, 'Use a sigla do estado'),
  postal_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  is_default: z.boolean(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  images: z.array(z.string().url('URL inválida')).min(1, 'Pelo menos uma imagem é obrigatória').max(5, 'Máximo de 5 imagens'),
  status: z.enum(['draft', 'published', 'out_of_stock']),
  stock_quantity: z.number().int().min(0, 'Quantidade não pode ser negativa'),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Código deve ter pelo menos 3 caracteres').toUpperCase(),
  discount_percentage: z.number().min(0).max(100).nullish(),
  discount_fixed: z.number().min(0).nullish(),
  min_purchase_amount: z.number().min(0).nullish(),
  max_uses: z.number().int().min(1).nullish(),
  starts_at: z.string().datetime().nullish(),
  expires_at: z.string().datetime().nullish(),
}).refine(
  (data) => data.discount_percentage != null || data.discount_fixed != null,
  'Deve especificar desconto percentual ou fixo'
);

export const orderSchema = z.object({
  address_id: z.string().uuid('ID do endereço inválido'),
  items: z.array(z.object({
    product_id: z.string().uuid('ID do produto inválido'),
    quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero'),
  })).min(1, 'Pedido deve ter pelo menos um item'),
  coupon_code: z.string().optional(),
});