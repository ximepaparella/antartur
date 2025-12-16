/**
 * Servicio de PayPal para crear órdenes de pago y obtener URLs de redirect
 * Integrado con gatewayConfigService para leer configuración desde BD
 */

import { logger } from "@/lib/services/logger";
import { getPayPalCredentials, isGatewayAvailable } from "../domain/gatewayConfigService";

// Lazy load PayPal SDK to avoid bundling issues
// PayPal SDK is a CommonJS module that needs to be loaded dynamically
let paypalModule: typeof import("@paypal/checkout-server-sdk") | null = null;

async function getPayPalModule() {
  if (!paypalModule) {
    // Dynamic import for CommonJS module compatibility
    paypalModule = await import("@paypal/checkout-server-sdk");
  }
  return paypalModule;
}

/**
 * Configura el entorno de PayPal (sandbox o live)
 * Ahora usa la configuración de la BD para determinar el modo
 */
async function environment() {
  const paypal = await getPayPalModule();
  const credentials = await getPayPalCredentials();

  if (!credentials) {
    logger.error("PayPal credentials not available", {
      reason: "Gateway may be inactive or credentials not configured",
    });
    throw new Error(
      "PayPal payment gateway is not available. Please ensure it is active and credentials are configured."
    );
  }

  const { clientId, clientSecret, mode } = credentials;

  // Validar que las credenciales no sean valores vacíos
  if (clientId.trim() === "" || clientSecret.trim() === "") {
    logger.error("PayPal credentials are empty strings");
    throw new Error("PayPal credentials are empty. Please configure valid PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
  }

  logger.info("PayPal environment configured", { mode });

  if (mode === "live") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

/**
 * Crea un cliente de PayPal
 */
async function client() {
  const paypal = await getPayPalModule();
  return new paypal.core.PayPalHttpClient(await environment());
}

/**
 * Verifica si PayPal está disponible para procesar pagos
 */
export async function isPayPalAvailable(): Promise<boolean> {
  return isGatewayAvailable("PAYPAL");
}

export interface CreatePayPalOrderRequest {
  orderId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePayPalOrderResponse {
  paypalOrderId: string;
  redirectUrl: string;
}

/**
 * Crea una orden de pago en PayPal y retorna la URL de redirect
 */
export async function createPayPalOrder(
  request: CreatePayPalOrderRequest
): Promise<CreatePayPalOrderResponse> {
  // Verificar que el gateway esté disponible
  const available = await isPayPalAvailable();
  if (!available) {
    throw new Error("PayPal payment gateway is not available. Please contact support.");
  }

  const paypalClient = await client();
  const paypal = await getPayPalModule();

  const orderRequest = new paypal.orders.OrdersCreateRequest();
  orderRequest.prefer("return=representation");
  orderRequest.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: request.orderId,
        description: `Orden ${request.orderId}`,
        custom_id: request.orderId,
        amount: {
          currency_code: request.currency,
          value: request.amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: "Antartur",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: request.returnUrl,
      cancel_url: request.cancelUrl,
    },
  });

  try {
    const order = await paypalClient.execute(orderRequest);
    const orderResult = order.result as { id?: string; links?: Array<{ rel?: string; href?: string }> };
    const paypalOrderId = orderResult.id as string;

    // Buscar el link de approval (redirect URL)
    const approvalLink = orderResult.links?.find(
      (link: { rel?: string; href?: string }) => link.rel === "approve"
    );

    if (!approvalLink?.href) {
      throw new Error("PayPal order created but no approval URL found");
    }

    logger.info("PayPal order created successfully", {
      paypalOrderId,
      orderId: request.orderId,
    });

    return {
      paypalOrderId,
      redirectUrl: approvalLink.href,
    };
  } catch (error) {
    logger.error("Error creating PayPal order", error);
    
    // Mejorar mensajes de error para problemas de autenticación
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("invalid_client") || errorMessage.includes("Client Authentication failed")) {
      throw new Error(
        "PayPal authentication failed. Please verify that PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are correctly configured in your environment variables."
      );
    }
    
    throw new Error(`Failed to create PayPal order: ${errorMessage}`);
  }
}

/**
 * Captura un pago de PayPal después de que el usuario aprueba
 * Nota: No verificamos disponibilidad aquí porque el pago ya fue iniciado
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  success: boolean;
  transactionId?: string;
  amount?: number;
  currency?: string;
}> {
  const paypalClient = await client();
  const paypal = await getPayPalModule();

  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    const captureResult = capture.result as {
      status?: string;
      purchase_units?: Array<{
        payments?: {
          captures?: Array<{
            id?: string;
            amount?: {
              value?: string;
              currency_code?: string;
            };
          }>;
        };
      }>;
    };
    const status = captureResult.status as string;

    if (status === "COMPLETED") {
      const purchaseUnit = captureResult.purchase_units?.[0];
      const captureData = purchaseUnit?.payments?.captures?.[0];

      logger.info("PayPal payment captured successfully", {
        paypalOrderId,
        transactionId: captureData?.id,
      });

      return {
        success: true,
        transactionId: captureData?.id as string,
        amount: parseFloat((captureData?.amount?.value as string) || "0"),
        currency: captureData?.amount?.currency_code as string,
      };
    }

    return {
      success: false,
    };
  } catch (error) {
    logger.error("Error capturing PayPal order", error);
    throw new Error(`Failed to capture PayPal order: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Obtiene el estado de una orden de PayPal
 */
export async function getPayPalOrderStatus(paypalOrderId: string): Promise<{
  status: string;
  orderId?: string;
}> {
  const paypalClient = await client();
  const paypal = await getPayPalModule();

  const request = new paypal.orders.OrdersGetRequest(paypalOrderId);

  try {
    const order = await paypalClient.execute(request);
    const orderResult = order.result as {
      status?: string;
      purchase_units?: Array<{
        reference_id?: string;
      }>;
    };
    const purchaseUnit = orderResult.purchase_units?.[0];

    return {
      status: orderResult.status as string,
      orderId: purchaseUnit?.reference_id as string,
    };
  } catch (error) {
    logger.error("Error getting PayPal order status", error);
    throw new Error(`Failed to get PayPal order status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

