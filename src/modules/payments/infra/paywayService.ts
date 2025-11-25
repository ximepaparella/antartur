/**
 * Servicio de Payway para crear transacciones de pago y obtener URLs de redirect
 * Payway usa REST API directa, no SDK oficial
 */

import { logger } from "@/lib/services/logger";

const PAYWAY_API_BASE_URL = {
  sandbox: "https://sandbox.payway.com.ar",
  production: "https://api.payway.com.ar",
};

export interface CreatePaywayTransactionRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePaywayTransactionResponse {
  paywayTransactionId: string;
  redirectUrl: string;
}

/**
 * Obtiene la URL base de la API de Payway según el entorno
 */
function getPaywayApiUrl(): string {
  const environment = process.env.PAYWAY_ENVIRONMENT || "sandbox";
  return PAYWAY_API_BASE_URL[environment as keyof typeof PAYWAY_API_BASE_URL] || PAYWAY_API_BASE_URL.sandbox;
}

/**
 * Crea una transacción de pago en Payway y retorna la URL de redirect
 */
export async function createPaywayTransaction(
  request: CreatePaywayTransactionRequest
): Promise<CreatePaywayTransactionResponse> {
  const apiKey = process.env.PAYWAY_API_KEY;
  const merchantId = process.env.PAYWAY_MERCHANT_ID;

  if (!apiKey || !merchantId) {
    throw new Error("Payway credentials not configured. Please set PAYWAY_API_KEY and PAYWAY_MERCHANT_ID");
  }

  const apiUrl = getPaywayApiUrl();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antartur.tur.ar";

  // Payway generalmente requiere autenticación con API Key en headers
  // y crear una transacción con los datos del pago
  const transactionData = {
    merchant_id: merchantId,
    amount: request.amount,
    currency: request.currency,
    order_id: request.orderId,
    customer_email: request.customerEmail,
    customer_name: request.customerName,
    return_url: request.returnUrl,
    cancel_url: request.cancelUrl,
    description: `Orden ${request.orderId}`,
  };

  try {
    // Payway API generalmente usa POST a /transactions o /checkout
    // La estructura exacta depende de la versión de la API de Payway
    const response = await fetch(`${apiUrl}/api/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        // Payway puede requerir otros headers según su documentación
        "X-Merchant-Id": merchantId,
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("Payway API error", {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Payway API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    // Payway generalmente retorna un transaction_id y una redirect_url
    // La estructura exacta depende de la API de Payway
    const paywayTransactionId = result.transaction_id || result.id || result.payment_id;
    const redirectUrl = result.redirect_url || result.checkout_url || result.url;

    if (!paywayTransactionId || !redirectUrl) {
      logger.error("Payway response missing required fields", result);
      throw new Error("Payway response missing transaction_id or redirect_url");
    }

    logger.info("Payway transaction created successfully", {
      paywayTransactionId,
      orderId: request.orderId,
    });

    return {
      paywayTransactionId,
      redirectUrl,
    };
  } catch (error) {
    logger.error("Error creating Payway transaction", error);
    throw new Error(`Failed to create Payway transaction: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Obtiene el estado de una transacción de Payway
 */
export async function getPaywayTransactionStatus(paywayTransactionId: string): Promise<{
  status: string;
  orderId?: string;
  amount?: number;
  currency?: string;
}> {
  const apiKey = process.env.PAYWAY_API_KEY;
  const merchantId = process.env.PAYWAY_MERCHANT_ID;

  if (!apiKey || !merchantId) {
    throw new Error("Payway credentials not configured");
  }

  const apiUrl = getPaywayApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/v1/transactions/${paywayTransactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Merchant-Id": merchantId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Payway API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    return {
      status: result.status || result.payment_status || "unknown",
      orderId: result.order_id || result.orderId,
      amount: result.amount,
      currency: result.currency,
    };
  } catch (error) {
    logger.error("Error getting Payway transaction status", error);
    throw new Error(`Failed to get Payway transaction status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

