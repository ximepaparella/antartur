"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import { OrderDetails } from "@/components/common/OrderDetails";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard";
import { getCompletedOrderData, type CompletedOrderData } from "@/lib/utils/orderStorage";
import type { OrderFullResponse } from "@/modules/orders/api/dto/ordersDto";
import styles from "./page.module.scss";

interface BankData {
  accountName: string;
  accountNumber: string;
  bank: string;
  cuit: string;
  cbu: string;
  alias: string;
}

export default function CheckoutTransferPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<CompletedOrderData | null>(null);

  useEffect(() => {
    // Obtener datos desde sessionStorage en lugar de URL
    const completedData = getCompletedOrderData();
    
    if (completedData) {
      setOrderData(completedData);

      const loadPublicOrderCode = async () => {
        const rawCode = completedData.code;
        let order: OrderFullResponse | null = null;

        const tryLoadOrder = async (apiUrl: string): Promise<OrderFullResponse | null> => {
          const response = await fetch(apiUrl);
          if (!response.ok) return null;
          const result = await response.json();
          if (!result.success || !result.data) return null;
          return result.data as OrderFullResponse;
        };

        // Primero intentar como código público (ANT-....)
        order = await tryLoadOrder(`/api/orders/code/${rawCode}?includePayments=true`);
        // Compatibilidad: algunos flujos guardaban el id interno en completedData.code
        if (!order) {
          order = await tryLoadOrder(`/api/orders/${rawCode}?includePayments=true`);
        }

        if (order) {
          // Calcular vigencia real (createdAt → expiresAt), que respeta la env del backend
          let validityHours: number | undefined;
          if (order.expiresAt && order.createdAt) {
            const diffMs = new Date(order.expiresAt).getTime() - new Date(order.createdAt).getTime();
            if (diffMs > 0) {
              validityHours = Math.round(diffMs / (1000 * 60 * 60));
            }
          }

          setOrderData({
            ...completedData,
            code: order.code || completedData.code,
            expiresAt: order.expiresAt,
            validityHours,
          });
        }
      };

      void loadPublicOrderCode();
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }
  }, [router]);

  const [bankData, setBankData] = useState<BankData>({
    accountName: "Gustavo Adolfo Francisco Giro",
    accountNumber: "6893238937",
    bank: "HSBC",
    cuit: "20-20453913-9",
    cbu: "1500689100068932389378",
    alias: "Antartur",
  });

  useEffect(() => {
    // Cargar datos bancarios desde API
    fetch("/api/bank-details")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Bank transfer not available");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setBankData(data.data);
        }
      })
      .catch((error) => {
        console.error("Error al cargar datos bancarios:", error);
        // Si no hay datos disponibles, redirigir al inicio
        router.push("/");
      });
  }, [router]);

  return (
    <>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <div className={styles.transferPage}>
          <h1 className={styles.title}>Instrucciones para Transferencia Bancaria</h1>

          {orderData && (
            <>
              <OrderSummaryCard
                orderData={orderData}
                showTotal={true}
                showMessage={false}
              />

              <OrderDetails
                tourTitle={orderData.tourTitle}
                date={orderData.date}
                timeSlot={orderData.timeSlot}
                adults={orderData.adults}
                numChildren={orderData.children}
                passengers={orderData.passengers}
              />
            </>
          )}

          <Message variant="warning" className={styles.expirationWarning}>
            <p>
              <strong>Importante:</strong> La reserva está pendiente de confirmación
              {orderData?.validityHours && orderData.validityHours > 0
                ? ` y estará vigente por ${orderData.validityHours} ${orderData.validityHours === 1 ? "hora" : "horas"} desde su creación`
                : ""}
              . Si no se efectúa el pago correspondiente, será dada de baja y los cupos liberados.
            </p>
          </Message>

          <Card className={styles.bankCard}>
            <h2 className={styles.bankTitle}>Datos Bancarios</h2>
            
            <div className={styles.bankData}>
              <div className={styles.bankRow}>
                <span className={styles.label}>Titular:</span>
                <span className={styles.value}>{bankData.accountName}</span>
              </div>
              
              {bankData.accountNumber && bankData.accountNumber.trim() !== "" && (
                <div className={styles.bankRow}>
                  <span className={styles.label}>Número de Cuenta:</span>
                  <span className={styles.value}>{bankData.accountNumber}</span>
                </div>
              )}
              
              {bankData.bank && bankData.bank.trim() !== "" && (
                <div className={styles.bankRow}>
                  <span className={styles.label}>Banco:</span>
                  <span className={styles.value}>{bankData.bank}</span>
                </div>
              )}
              
              <div className={styles.bankRow}>
                <span className={styles.label}>CUIT:</span>
                <span className={styles.value}>{bankData.cuit}</span>
              </div>
              
              <div className={styles.bankRow}>
                <span className={styles.label}>CBU:</span>
                <span className={styles.value}>{bankData.cbu}</span>
              </div>
              
              <div className={styles.bankRow}>
                <span className={styles.label}>Alias:</span>
                <span className={styles.value}>{bankData.alias}</span>
              </div>
            </div>
          </Card>

          <Card className={styles.instructionsCard}>
            <h2 className={styles.instructionsTitle}>Instrucciones</h2>
            <ol className={styles.instructionsList}>
              <li>Realiza la transferencia bancaria por el monto total indicado.</li>
              <li>Usa el código de orden como referencia de pago.</li>
              <li>Una vez completada la transferencia, envía el comprobante a{" "}
                <a href="mailto:agencias@antartur.tur.ar">agencias@antartur.tur.ar</a>.
              </li>
              <li>Nuestro equipo confirmará el pago y validará tu reserva.</li>
            </ol>
          </Card>

          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

