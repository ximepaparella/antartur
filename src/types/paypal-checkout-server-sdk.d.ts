/**
 * Type definitions for @paypal/checkout-server-sdk
 * This is a temporary type definition file until official types are available
 */

declare module "@paypal/checkout-server-sdk" {
  namespace core {
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute<T = unknown>(request: any): Promise<{ result: T; statusCode: number }>;
    }
  }

  namespace orders {
    class OrdersCreateRequest {
      prefer(value: string): OrdersCreateRequest;
      requestBody(body: Record<string, unknown>): OrdersCreateRequest;
    }

    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: Record<string, unknown>): OrdersCaptureRequest;
    }

    class OrdersGetRequest {
      constructor(orderId: string);
    }
  }

  const paypal: {
    core: typeof core;
    orders: typeof orders;
  };

  export = paypal;
}

