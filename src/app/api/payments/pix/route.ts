import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface EfiPayment {
  id: string;
  amount: number;
  qrcode: string;
  qrcode_text: string;
  status: string;
}

export async function POST(request: Request) {
  try {
    const { orderId, amount, description } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Get credentials from environment variables
    const clientId = process.env.EFI_CLIENT_ID;
    const clientSecret = process.env.EFI_CLIENT_SECRET;
    const isSandbox = process.env.EFI_SANDBOX === 'true';

    if (!clientId || !clientSecret) {
      throw new Error('EFI Bank credentials not configured');
    }

    // Make request to EFI Bank API (placeholder implementation)
    const response = await fetch(
      `https://${isSandbox ? 'sandbox.' : ''}api.efi.com.br/v1/payments/pix`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          amount,
          description,
          expiration: 3600, // 1 hour
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pix`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create PIX payment');
    }

    const payment: EfiPayment = await response.json();

    // Update order with payment info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_intent_id: payment.id,
        payment_status: payment.status,
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      qrCodeText: payment.qrcode_text,
      copiaECola: payment.qrcode,
    });
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return NextResponse.json(
      { error: 'Failed to create PIX payment' },
      { status: 500 }
    );
  }
}