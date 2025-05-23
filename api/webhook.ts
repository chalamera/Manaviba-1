import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { noteId, userId } = session.metadata!;

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ payment_status: 'completed' })
      .eq('stripe_session_id', session.id);

    if (orderError) {
      console.error('Error updating order:', orderError);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  return res.status(200).json({ received: true });
}