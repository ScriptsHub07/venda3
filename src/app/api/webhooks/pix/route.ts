import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verify webhook signature (implementation depends on EFI Bank's webhook format)
    const signature = request.headers.get('x-efi-signature');
    if (!signature || signature !== webhookSecret) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user_profiles (
          full_name,
          email
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
          products (
            name
          )
        )
      `)
      .eq('payment_intent_id', body.payment_id)
      .single();

    if (orderError) {
      throw orderError;
    }

    // Update order status based on payment status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: body.status,
        status: body.status === 'paid' ? 'processing' : 'pending',
      })
      .eq('id', order.id);

    if (updateError) {
      throw updateError;
    }

    // If payment is confirmed, send confirmation email
    if (body.status === 'paid') {
      await resend.emails.send({
        from: process.env.SMTP_FROM!,
        to: order.user_profiles.email,
        subject: `Pedido Confirmado - HYPEX #${order.id.slice(0, 8)}`,
        react: OrderConfirmationEmail({
          order: {
            id: order.id,
            customerName: order.user_profiles.full_name,
            items: order.items.map((item: any) => ({
              name: item.products.name,
              quantity: item.quantity,
              price: item.unit_price,
            })),
            address: {
              street: order.addresses.street,
              number: order.addresses.number,
              complement: order.addresses.complement,
              neighborhood: order.addresses.neighborhood,
              city: order.addresses.city,
              state: order.addresses.state,
              postalCode: order.addresses.postal_code,
            },
            total: order.total,
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}