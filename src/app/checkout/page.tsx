import { getAllPaymentMethods } from "@/modules/payments/api/server/paymentsServer";
import { getSiteSettings } from "@/modules/settings/repository";
import { CheckoutClient } from "./CheckoutClient";

/**
 * Checkout Page - Server Component
 * Obtiene todos los métodos de pago disponibles para ambas monedas al inicio
 * y los pasa al Client Component para optimizar performance
 */
export default async function CheckoutPage() {
  const [allPaymentMethods, settings] = await Promise.all([
    getAllPaymentMethods(),
    getSiteSettings(),
  ]);

  return (
    <CheckoutClient
      allPaymentMethods={allPaymentMethods}
      onlineBookingsEnabled={settings.onlineBookingsEnabled}
      whatsappNumber={settings.whatsappNumber}
    />
  );
}
