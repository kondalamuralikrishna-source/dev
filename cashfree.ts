import crypto from "crypto";

// ============================================================================
// CASHFREE PAYMENT GATEWAY INTEGRATION (PG API v2023-08-01)
// ============================================================================
// Implements the Board Strategy doc's monetization plan: a 7-Day Sachet Pass and
// Plus/Pro recurring plans. Cashfree's Orders API + hosted Checkout is used rather than
// embedding raw card handling, so this app never touches card/PCI data directly.
//
// NOTE on pricing: the board doc specifies the Sachet Pass price (Rs99-149) but does not
// specify exact Plus/Pro subscription prices -- those below are placeholder figures pending
// a real pricing decision; change PLANS to adjust.

export type PlanId = "sachet_7day" | "plus_monthly" | "pro_monthly";

export interface PlanDefinition {
  id: PlanId;
  tier: "sachet" | "plus" | "pro";
  name: string;
  amountInr: number;
  durationDays: number;
  description: string;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  sachet_7day: {
    id: "sachet_7day",
    tier: "sachet",
    name: "7-Day Sprint Pass",
    amountInr: 149,
    durationDays: 7,
    description: "Unlimited AI voice, full scenario library, and detailed feedback for 7 days. No auto-renewal.",
  },
  plus_monthly: {
    id: "plus_monthly",
    tier: "plus",
    name: "Plus (General Fluency)",
    amountInr: 399,
    durationDays: 30,
    description: "Unlimited AI voice, full scenario library, full phonetic & grammar analysis, auto error-tracking deck.",
  },
  pro_monthly: {
    id: "pro_monthly",
    tier: "pro",
    name: "Pro",
    amountInr: 999,
    durationDays: 30,
    description: "Everything in Plus, plus priority low-latency voice, custom scenario builder, and official CEFR/IELTS/TOEFL rubrics.",
  },
};

function getConfig() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = (process.env.CASHFREE_ENV || "SANDBOX").toUpperCase();
  if (!appId || !secretKey) {
    throw new Error("CASHFREE_APP_ID / CASHFREE_SECRET_KEY are not set. Add them to .env before accepting payments.");
  }
  const baseUrl = env === "PRODUCTION" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  return { appId, secretKey, env, baseUrl };
}

export function isCashfreeConfigured(): boolean {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

interface CreateOrderParams {
  orderId: string;
  amount: number;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
  notifyUrl: string;
}

export async function createCashfreeOrder(params: CreateOrderParams) {
  const { appId, secretKey, baseUrl } = getConfig();

  const res = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: params.customerId,
        customer_email: params.customerEmail,
        // Cashfree requires a phone number; fall back to a placeholder if we don't have a real
        // one on file (most accounts here were created via email/Google, not phone).
        customer_phone: params.customerPhone || "9999999999",
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: params.notifyUrl,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Cashfree order creation failed (HTTP ${res.status})`);
  }
  return data as { order_id: string; payment_session_id: string; order_status: string };
}

export async function fetchCashfreeOrderStatus(orderId: string) {
  const { appId, secretKey, baseUrl } = getConfig();
  const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Failed to fetch Cashfree order status (HTTP ${res.status})`);
  }
  return data as { order_id: string; order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED"; order_amount: number };
}

// Cashfree webhooks (PG v2023-08-01) sign the payload as base64(HMAC-SHA256(timestamp + rawBody, secretKey)),
// sent in the `x-webhook-signature` header alongside `x-webhook-timestamp`. Verify before trusting the body.
export function verifyCashfreeWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
  try {
    const { secretKey } = getConfig();
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBody)
      .digest("base64");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
