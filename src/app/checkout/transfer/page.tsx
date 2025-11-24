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
      .then((res) => res.json())
      .then((data) => setBankData(data))
      .catch((error) => {
        console.error("Error al cargar datos bancarios:", error);
        // Mantener valores por defecto si falla
      });
  }, []);

  return (
    <>
      <Hero variant="internal" pageKey="checkout-transfer" />
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
                children={orderData.children}
                passengers={orderData.passengers}
              />
            </>
          )}

          <Message variant="warning" className={styles.expirationWarning}>
            <p>
              <strong>Importante:</strong> La reserva estará vigente por 24 horas. Si no se efectúa el pago
              correspondiente, será dada de baja y los cupos liberados.
            </p>
          </Message>

          <Card className={styles.bankCard}>
            <h2 className={styles.bankTitle}>Datos Bancarios</h2>
            
            <div className={styles.bankData}>
              <div className={styles.bankRow}>
                <span className={styles.label}>Titular:</span>
                <span className={styles.value}>{bankData.accountName}</span>
              </div>
              
              <div className={styles.bankRow}>
                <span className={styles.label}>Número de Cuenta:</span>
                <span className={styles.value}>{bankData.accountNumber}</span>
              </div>
              
              <div className={styles.bankRow}>
                <span className={styles.label}>Banco:</span>
                <span className={styles.value}>{bankData.bank}</span>
              </div>
              
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

