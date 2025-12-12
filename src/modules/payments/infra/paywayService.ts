/**
 * Servicio de Payway para crear transacciones de pago y obtener URLs de redirect
 * 
 * Integración: Payway Checkout (formulario hosted)
 * - El usuario es redirigido a Payway para completar el pago
 * - No se manejan datos de tarjeta en nuestro servidor
 * - No requiere certificación PCI DSS
 * 
 * Documentación: https://developers.payway.com.ar/
 */

import { logger } from "@/lib/services/logger";
import { getPaywayCredentials, isGatewayAvailable } from "../domain/gatewayConfigService";
import crypto from "crypto";

// URLs de Payway Checkout
const PAYWAY_CHECKOUT_URL = {
  sandbox: "https://sandbox.payway.com.ar/checkout",
  production: "https://checkout.payway.com.ar",
};

// URLs de API Payway para consultas
const PAYWAY_API_URL = {
  sandbox: "https://sandbox.payway.com.ar/api",
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
 * Verifica si Payway está disponible para procesar pagos
 */
export async function isPaywayAvailable(): Promise<boolean> {
  return isGatewayAvailable("PAYWAY");
}

/**
 * Genera una firma HMAC para validar la transacción
 */
function generateSignature(data: string, secretKey: string): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex");
}

/**
 * Crea una transacción de pago en Payway Checkout y retorna la URL de redirect
 * 
 * El usuario será redirigido al formulario de pago de Payway donde
 * ingresará los datos de su tarjeta de forma segura.
 */
export async function createPaywayTransaction(
  request: CreatePaywayTransactionRequest
): Promise<CreatePaywayTransactionResponse> {
  // Verificar que el gateway esté disponible
  const available = await isPaywayAvailable();
  if (!available) {
    throw new Error("Payway payment gateway is not available. Please contact support.");
  }

  const credentials = await getPaywayCredentials();
  if (!credentials) {
    throw new Error("Payway credentials not configured. Please set PAYWAY_API_KEY and PAYWAY_MERCHANT_ID");
  }

  const { apiKey, merchantId, environment } = credentials;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antartur.tur.ar";
  
  // Determinar URLs según ambiente
  const checkoutBaseUrl = environment === "production" 
    ? PAYWAY_CHECKOUT_URL.production 
    : PAYWAY_CHECKOUT_URL.sandbox;

  logger.info("Creating Payway Checkout transaction", {
    environment,
    orderId: request.orderId,
    amount: request.amount,
  });

  // Generar ID único para la transacción
  const transactionId = `${request.orderId}-${Date.now()}`;
  
  // Monto en centavos (Payway usa enteros)
  const amountInCents = Math.round(request.amount * 100);

  // Usar la moneda de la request (default: ARS)
  const currency = request.currency || "ARS";

  // Datos para el checkout de Payway
  // La estructura exacta puede variar según la versión de la API
  const checkoutData = {
    merchant_id: merchantId,
    transaction_id: transactionId,
    amount: amountInCents,
    currency: currency,
    description: `Orden ${request.orderId} - Antartur`,
    customer_email: request.customerEmail,
    customer_name: request.customerName,
    success_url: `${siteUrl}/checkout/payway/return?orderId=${request.orderId}&status=success`,
    failure_url: `${siteUrl}/checkout/payway/return?orderId=${request.orderId}&status=failure`,
    pending_url: `${siteUrl}/checkout/payway/return?orderId=${request.orderId}&status=pending`,
    cancel_url: request.cancelUrl,
  };

  // Generar firma para validación
  const signatureData = `${merchantId}${transactionId}${amountInCents}`;
  const signature = generateSignature(signatureData, apiKey);

  // Construir URL de checkout con parámetros
  const params = new URLSearchParams({
    merchant_id: merchantId,
    transaction_id: transactionId,
    amount: amountInCents.toString(),
    currency: currency,
    description: checkoutData.description,
    customer_email: request.customerEmail,
    success_url: checkoutData.success_url,
    failure_url: checkoutData.failure_url,
    pending_url: checkoutData.pending_url,
    cancel_url: checkoutData.cancel_url,
    signature: signature,
  });

  const redirectUrl = `${checkoutBaseUrl}?${params.toString()}`;

  logger.info("Payway Checkout URL generated", {
    transactionId,
    orderId: request.orderId,
    environment,
  });

  return {
    paywayTransactionId: transactionId,
    redirectUrl,
  };
}

/**
 * Verifica el estado de un pago con Payway
 * Se llama cuando el usuario vuelve del checkout
 */
export async function verifyPaywayPayment(
  transactionId: string,
  queryParams: Record<string, string>
): Promise<{
  success: boolean;
  status: string;
  orderId?: string;
  amount?: number;
  message?: string;
}> {
  const credentials = await getPaywayCredentials();
  if (!credentials) {
    throw new Error("Payway credentials not configured");
  }

  const { apiKey, merchantId, environment } = credentials;

  // Verificar la firma del callback
  const receivedSignature = queryParams.signature;
  const dataToVerify = `${queryParams.transaction_id}${queryParams.status}${queryParams.amount || ""}`;
  const expectedSignature = generateSignature(dataToVerify, apiKey);

  if (receivedSignature && receivedSignature !== expectedSignature) {
    logger.warn("Payway signature mismatch", {
      transactionId,
      received: receivedSignature,
    });
    return {
      success: false,
      status: "invalid_signature",
      message: "La firma de la transacción no es válida",
    };
  }

  // Mapear estados de Payway a nuestros estados
  const status = queryParams.status?.toLowerCase();
  
  switch (status) {
    case "success":
    case "approved":
    case "completed":
      return {
        success: true,
        status: "approved",
        orderId: queryParams.order_id || transactionId.split("-")[0],
        amount: queryParams.amount ? parseInt(queryParams.amount) / 100 : undefined,
      };
    
    case "pending":
    case "in_process":
      return {
        success: false,
        status: "pending",
        orderId: queryParams.order_id || transactionId.split("-")[0],
        message: "El pago está pendiente de confirmación",
      };
    
    case "failure":
    case "rejected":
    case "declined":
      return {
        success: false,
        status: "rejected",
        orderId: queryParams.order_id || transactionId.split("-")[0],
        message: queryParams.error_message || "El pago fue rechazado",
      };
    
    case "cancelled":
      return {
        success: false,
        status: "cancelled",
        orderId: queryParams.order_id || transactionId.split("-")[0],
        message: "El pago fue cancelado",
      };
    
    default:
      return {
        success: false,
        status: "unknown",
        orderId: queryParams.order_id || transactionId.split("-")[0],
        message: `Estado desconocido: ${status}`,
      };
  }
}

/**
 * Obtiene el estado de una transacción de Payway via API
 * (Para consultas posteriores o verificación)
 */
export async function getPaywayTransactionStatus(paywayTransactionId: string): Promise<{
  status: string;
  orderId?: string;
  amount?: number;
  currency?: string;
}> {
  const credentials = await getPaywayCredentials();
  if (!credentials) {
    throw new Error("Payway credentials not configured");
  }

  const { apiKey, merchantId, environment } = credentials;
  const apiUrl = environment === "production" 
    ? PAYWAY_API_URL.production 
    : PAYWAY_API_URL.sandbox;

  try {
    const response = await fetch(`${apiUrl}/transactions/${paywayTransactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Merchant-Id": merchantId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Si la API no existe o falla, retornar estado desconocido
      // (algunas integraciones simples no tienen API de consulta)
      if (response.status === 404) {
        return {
          status: "not_found",
          orderId: paywayTransactionId.split("-")[0],
        };
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Payway API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    return {
      status: result.status || "unknown",
      orderId: result.order_id || paywayTransactionId.split("-")[0],
      amount: result.amount ? result.amount / 100 : undefined,
      currency: result.currency || "ARS",
    };
  } catch (error) {
    logger.error("Error getting Payway transaction status", error);
    // No lanzar error, retornar estado desconocido
    return {
      status: "error",
      orderId: paywayTransactionId.split("-")[0],
    };
  }
}

