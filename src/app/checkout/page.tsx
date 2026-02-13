import { getAllPaymentMethods } from "@/modules/payments/api/server/paymentsServer";
import { CheckoutClient } from "./CheckoutClient";

/**
 * Checkout Page - Server Component
 * Obtiene todos los métodos de pago disponibles para ambas monedas al inicio
 * y los pasa al Client Component para optimizar performance
 */
export default async function CheckoutPage() {
  // Obtener todos los métodos de pago para ambas monedas (una sola consulta)
  const allPaymentMethods = await getAllPaymentMethods();

  return <CheckoutClient allPaymentMethods={allPaymentMethods} />;
}
