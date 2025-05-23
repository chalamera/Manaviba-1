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

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const noteIds = session.metadata.note_ids.split(',');
        const userId = session.metadata.user_id;

        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .eq('stripe_session_id', session.id);

        if (orderError) throw orderError;

        // Create transfers to connected accounts
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            note_id,
            platform_fee,
            notes!inner (
              price,
              seller:profiles!inner (
                stripe_account_id
              )
            )
          `)
          .eq('stripe_session_id', session.id);

        if (!orders) break;

        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );

        // Create transfers for each seller
        for (const order of orders) {
          const transferAmount = order.notes.price - order.platform_fee;
          
          await stripe.transfers.create({
            amount: transferAmount,
            currency: 'jpy',
            destination: order.notes.seller.stripe_account_id,
            transfer_group: paymentIntent.transfer_group,
          });
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        
        // Check if the account is fully verified
        if (
          account.charges_enabled &&
          account.details_submitted &&
          account.payouts_enabled
        ) {
          // Update the account status in the database
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ stripe_account_status: 'verified' })
            .eq('stripe_account_id', account.id);

          if (updateError) throw updateError;
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});