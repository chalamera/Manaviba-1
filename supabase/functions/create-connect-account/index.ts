import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@14.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // First verify that the platform account is activated
    try {
      await stripe.accounts.retrieve('acct_default');
    } catch (error) {
      if (error.code === 'account_invalid') {
        return new Response(
          JSON.stringify({
            error: 'Stripeアカウントを有効にする必要があります。有効にするには、<a href="https://dashboard.stripe.com/account/onboarding" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-500 underline">Stripeダッシュボード</a>にアクセスしてください。'
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    const { userId, email } = await req.json();

    if (!userId || !email) {
      throw new Error('ユーザーIDとメールアドレスは必須です');
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'JP',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      settings: {
        payouts: {
          schedule: {
            interval: 'manual',
          },
        },
      },
    });

    // Update user profile with Stripe account ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_account_id: account.id,
        stripe_account_status: 'pending',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('プロフィールの更新に失敗しました');
    }

    return new Response(
      JSON.stringify({ accountId: account.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating Connect account:', error);
    
    let errorMessage = 'Stripeアカウントの作成に失敗しました';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});