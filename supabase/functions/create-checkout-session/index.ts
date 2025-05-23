import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@14.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, userId } = await req.json();

    // Validate input
    if (!items?.length || !userId) {
      throw new Error('Invalid request data');
    }

    // Get seller information for each note
    const noteIds = items.map((item: any) => item.id);
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select(`
        id,
        title,
        price,
        seller_id,
        seller:profiles!notes_seller_id_fkey (
          stripe_account_id,
          stripe_account_status
        )
      `)
      .in('id', noteIds);

    if (notesError) throw notesError;
    if (!notes?.length) throw new Error('Notes not found');

    // Verify all sellers have active Stripe accounts
    const invalidSellers = notes.filter(
      note => !note.seller?.stripe_account_id || note.seller?.stripe_account_status !== 'verified'
    );

    if (invalidSellers.length > 0) {
      throw new Error('Some sellers are not properly set up for payments');
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173';

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: notes.map(note => ({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: note.title,
          },
          unit_amount: note.price,
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cart`,
      payment_intent_data: {
        transfer_group: `order_${Date.now()}`,
      },
      metadata: {
        user_id: userId,
        note_ids: noteIds.join(','),
      },
    });

    // Create pending orders
    const orders = notes.map(note => ({
      note_id: note.id,
      buyer_id: userId,
      payment_status: 'pending',
      stripe_session_id: session.id,
      platform_fee: Math.round(note.price * 0.15), // 15% platform fee
    }));

    const { error: ordersError } = await supabase
      .from('orders')
      .insert(orders);

    if (ordersError) throw ordersError;

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});