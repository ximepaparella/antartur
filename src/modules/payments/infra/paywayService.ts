/**
 * Servicio de Payway/Decidir para procesar pagos
 * 
 * Integración: SDK JavaScript + API REST
 * - El frontend usa el SDK de JavaScript para tokenizar datos de tarjeta
 * - El backend procesa el pago usando el token via API REST
 * - No se manejan datos de tarjeta en nuestro servidor
 * - No requiere certificación PCI DSS completa (SAQ A-EP)
 * 
 * Documentación: https://developers.payway.com.ar/
 * API Decidir: https://decidir.com.ar/documentacion
 */

import { logger } from "@/lib/services/logger";
import { getPaywayCredentials, isGatewayAvailable } from "../domain/gatewayConfigService";
import crypto from "crypto";

// URLs de API Decidir para procesar pagos
// Documentación oficial: https://decidir.com.ar/documentacion
// 
// Ambientes disponibles:
// - SANDBOX: https://developers.decidir.com/api/v2
// - PRODUCCIÓN: https://ventasonline.payway.com.ar/api/v2
//
// Endpoints oficiales Decidir/Payway (documentación oficial)
// Sandbox: https://developers.decidir.com/api/v2
// Producción: https://ventasonline.payway.com.ar/api/v2
const DECIDIR_API_URL = {
  sandbox: "https://developers.decidir.com/api/v2",
  production: "https://ventasonline.payway.com.ar/api/v2",
};

// URLs legacy para compatibilidad (deprecated - no se usan más)
// Apuntan a los mismos bases oficiales por consistencia
const PAYWAY_API_URL = {
  sandbox: "https://developers.decidir.com/api/v2",
  production: "https://ventasonline.payway.com.ar/api/v2",
};

const PAYWAY_CHECKOUT_URL = {
  sandbox: "https://developers.decidir.com/api/v2",
  production: "https://ventasonline.payway.com.ar/api/v2",
};

/**
 * Decidir payment_method_id por red de tarjeta.
 * Referencia: documentación Decidir (Visa=1, Mastercard=15, Amex=6, Diners=8).
 */
const DECIDIR_PAYMENT_METHOD_IDS = {
  visa: 1,
  mastercard: 15,
  amex: 6,
  diners: 8,
} as const;

/**
 * Deriva payment_method_id de Decidir a partir del BIN (primeros 6-8 dígitos).
 * Si el BIN está vacío o no se reconoce, se usa 1 (Visa) como fallback.
 */
export function getPaymentMethodIdFromBin(bin: string): number {
  const digits = (bin || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length < 4) return DECIDIR_PAYMENT_METHOD_IDS.visa;

  // Visa: empieza con 4
  if (digits.startsWith("4")) return DECIDIR_PAYMENT_METHOD_IDS.visa;
  // Amex: 34 o 37
  if (digits.startsWith("34") || digits.startsWith("37")) return DECIDIR_PAYMENT_METHOD_IDS.amex;
  // Mastercard: 51-55, 2221-2720
  if (/^5[1-5]/.test(digits)) return DECIDIR_PAYMENT_METHOD_IDS.mastercard;
  const n = parseInt(digits.slice(0, 4), 10);
  if (n >= 2221 && n <= 2720) return DECIDIR_PAYMENT_METHOD_IDS.mastercard;
  // Diners: 36, 38, 300-305
  if (digits.startsWith("36") || digits.startsWith("38")) return DECIDIR_PAYMENT_METHOD_IDS.diners;
  const n3 = parseInt(digits.slice(0, 3), 10);
  if (n3 >= 300 && n3 <= 305) return DECIDIR_PAYMENT_METHOD_IDS.diners;

  return DECIDIR_PAYMENT_METHOD_IDS.visa;
}

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
 * @deprecated Esta función ya no se usa. Payway ahora usa SDK JavaScript + API REST.
 * El checkout hosted no existe en Payway/Decidir.
 * Usar processPaywayPayment en su lugar.
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

  const { apiKey, merchantId, environment, siteId, templateId } = credentials;
  // Usar SITE_URL (servidor) o NEXT_PUBLIC_SITE_URL (cliente), con fallback a URL de producción actual
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://coderoots.tech";
  
  // Determinar URLs según ambiente
  const checkoutBaseUrl = environment === "production" 
    ? PAYWAY_CHECKOUT_URL.production 
    : PAYWAY_CHECKOUT_URL.sandbox;

  logger.info("Creating Payway Checkout transaction", {
    environment,
    orderId: request.orderId,
    amount: request.amount,
    hasSiteId: !!siteId,
    hasTemplateId: !!templateId,
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
    ...(siteId && { site_id: siteId }), // Agregar site_id si está disponible
    ...(templateId && { template_id: templateId }), // Agregar template_id si está disponible
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
  
  // Agregar Site ID si está configurado (opcional)
  if (siteId) {
    params.append("site_id", siteId);
  }
  
  // Agregar Template ID si está configurado (opcional)
  if (templateId) {
    params.append("template_id", templateId);
  }

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
 * 
 * @deprecated Esta función ya no se usa. Payway ahora usa SDK JavaScript + API REST.
 * El checkout hosted no existe en Payway/Decidir.
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

  // Verificar la firma del callback - REQUERIDA para validar autenticidad
  const receivedSignature = queryParams.signature;
  const dataToVerify = `${queryParams.transaction_id}${queryParams.status}${queryParams.amount || ""}`;
  const expectedSignature = generateSignature(dataToVerify, apiKey);

  // Fail closed: firma ausente o incorrecta es inválida
  const signatureMissing = !receivedSignature;
  const signatureMismatch = receivedSignature !== expectedSignature;

  if (signatureMissing || signatureMismatch) {
    logger.warn("Payway signature validation failed", {
      transactionId,
      reason: signatureMissing ? "missing" : "mismatch",
      received: receivedSignature || "(not provided)",
    });
    return {
      success: false,
      status: "invalid_signature",
      message: signatureMissing 
        ? "Firma de transacción ausente" 
        : "La firma de la transacción no es válida",
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
 * Procesa un pago de Payway usando un token generado por el SDK
 * 
 * @param token - Token generado por el SDK de JavaScript
 * @param orderId - ID de la orden
 * @param amount - Monto a pagar (en la moneda base, ej: 100.00 para $100)
 * @param currency - Moneda (ARS o USD)
 * @param bin - Primeros 6 dígitos de la tarjeta (BIN)
 * @param lastFourDigits - Últimos 4 dígitos de la tarjeta
 */
export interface ProcessPaywayPaymentRequest {
  token: string;
  orderId: string;
  amount: number;
  currency: string;
  bin: string;
  lastFourDigits: string;
}

export interface ProcessPaywayPaymentResponse {
  success: boolean;
  status: "approved" | "rejected" | "pending" | "error";
  transactionId?: string;
  message?: string;
  rawResponse?: unknown;
}

export async function processPaywayPayment(
  request: ProcessPaywayPaymentRequest
): Promise<ProcessPaywayPaymentResponse> {
  // Verificar que el gateway esté disponible
  const available = await isPaywayAvailable();
  if (!available) {
    throw new Error("Payway payment gateway is not available. Please contact support.");
  }

  const credentials = await getPaywayCredentials();
  if (!credentials) {
    throw new Error(
      "Payway credentials not configured. Please set PAYWAY_API_KEY and PAYWAY_MERCHANT_ID"
    );
  }

  const { apiKey, merchantId, environment, siteId } = credentials;

  if (!siteId) {
    throw new Error("PAYWAY_SITE_ID is required for processing payments");
  }

  // Determinar URL de API según ambiente
  const apiUrl =
    environment === "production" ? DECIDIR_API_URL.production : DECIDIR_API_URL.sandbox;

  // Monto en centavos (Decidir usa enteros)
  const amountInCents = Math.round(request.amount * 100);

  // Generar ID único para la transacción
  const siteTransactionId = `${request.orderId}-${Date.now()}`;

  const paymentMethodId = getPaymentMethodIdFromBin(request.bin ?? "");

  // Preparar request body según documentación de Decidir
  const requestBody = {
    site_transaction_id: siteTransactionId,
    token: request.token,
    payment_method_id: paymentMethodId,
    bin: request.bin,
    amount: amountInCents,
    currency: request.currency,
    installments: 1,
    payment_type: "single",
    sub_payments: [],
  };

  logger.info("Processing Payway payment", {
    environment,
    orderId: request.orderId,
    siteTransactionId,
    amount: request.amount,
    currency: request.currency,
    hasToken: !!request.token,
  });

  try {
    const response = await fetch(`${apiUrl}/payments`, {
      method: "POST",
      headers: {
        "apikey": apiKey, // Decidir usa "apikey" en lugar de "Authorization"
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Manejar errores de la API
      const errorMessage =
        responseData.error?.reason?.description ||
        responseData.error?.reason?.additional_description ||
        responseData.message ||
        `Error al procesar el pago: ${response.statusText}`;

      logger.error("Payway payment processing failed", {
        status: response.status,
        orderId: request.orderId,
        error: errorMessage,
        responseData,
      });

      return {
        success: false,
        status: "error",
        message: errorMessage,
        rawResponse: responseData,
      };
    }

    // Mapear estado de Decidir a nuestros estados
    const decidirStatus = responseData.status?.toLowerCase();
    let status: "approved" | "rejected" | "pending" | "error";

    switch (decidirStatus) {
      case "approved":
      case "aprobado":
        status = "approved";
        break;
      case "rejected":
      case "rechazado":
      case "declined":
        status = "rejected";
        break;
      case "pending":
      case "pendiente":
      case "in_process":
        status = "pending";
        break;
      default:
        status = "error";
    }

    logger.info("Payway payment processed", {
      orderId: request.orderId,
      transactionId: responseData.id,
      status,
      decidirStatus,
    });

    return {
      success: status === "approved",
      status,
      transactionId: responseData.id?.toString(),
      message:
        status === "approved"
          ? "Pago aprobado exitosamente"
          : status === "rejected"
          ? responseData.status_details?.reason?.description ||
            "El pago fue rechazado"
          : status === "pending"
          ? "El pago está pendiente de confirmación"
          : "Estado desconocido del pago",
      rawResponse: responseData,
    };
  } catch (error) {
    logger.error("Error processing Payway payment", error, {
      orderId: request.orderId,
    });

    return {
      success: false,
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar el pago",
    };
  }
}

/**
 * Obtiene el estado de una transacción de Payway via API
 * (Para consultas posteriores o verificación)
 * @deprecated Esta función puede no funcionar con la nueva API de Decidir
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
    ? DECIDIR_API_URL.production 
    : DECIDIR_API_URL.sandbox;

  try {
    const response = await fetch(`${apiUrl}/payments/${paywayTransactionId}`, {
      method: "GET",
      headers: {
        "apikey": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
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
      orderId: result.site_transaction_id?.split("-")[0] || paywayTransactionId.split("-")[0],
      amount: result.amount ? result.amount / 100 : undefined,
      currency: result.currency || "ARS",
    };
  } catch (error) {
    logger.error("Error getting Payway transaction status", error);
    return {
      status: "error",
      orderId: paywayTransactionId.split("-")[0],
    };
  }
}

