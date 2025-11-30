"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { StatusBadge } from "@/modules/admin/components/StatusBadge/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

interface Notification {
  id: string;
  type: "EMAIL" | "WHATSAPP";
  recipient: string;
  templateKey: string;
  subject: string | null;
  body: string | null;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
}

export default function AdminNotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiClient.getNotificationById(notificationId);
        if (response.success && response.data) {
          setNotification(response.data);
        } else {
          setError(response.error || "Failed to fetch notification");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (notificationId) {
      fetchNotification();
    }
  }, [notificationId]);

  const handleRetry = async () => {
    // TODO: Implement retry functionality
    alert("Retry functionality to be implemented");
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando notificación...</p>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className={styles.error}>
        <p>Error: {error || "Notificación no encontrada"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/notifications")}>
          Volver a notificaciones
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => router.push("/admin/notifications")}>
          ← Volver
        </Button>
        <div>
          <h1 className={styles.title}>Notificación #{notification.id.substring(0, 8)}</h1>
          <StatusBadge status={notification.status as any} />
        </div>
      </div>

      <div className={styles.content}>
        <Card title="Información de la Notificación">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tipo:</span>
              <span className={styles.value}>
                {notification.type === "EMAIL" ? "Email" : "WhatsApp"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Destinatario:</span>
              <span className={styles.value}>{notification.recipient}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Plantilla:</span>
              <span className={styles.value}>{notification.templateKey}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Estado:</span>
              <StatusBadge status={notification.status as any} />
            </div>
            {notification.sentAt && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Enviado:</span>
                <span className={styles.value}>
                  {new Date(notification.sentAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.label}>Reintentos:</span>
              <span className={styles.value}>
                {notification.retryCount} / {notification.maxRetries}
              </span>
            </div>
          </div>
        </Card>

        {notification.subject && (
          <Card title="Asunto">
            <p className={styles.subject}>{notification.subject}</p>
          </Card>
        )}

        {notification.body && (
          <Card title="Contenido">
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{ __html: notification.body }}
            />
          </Card>
        )}

        {notification.errorMessage && (
          <Card title="Error">
            <div className={styles.errorMessage}>
              <p>{notification.errorMessage}</p>
              {notification.status === "ERROR" && notification.retryCount < notification.maxRetries && (
                <Button variant="primary" onClick={handleRetry}>
                  Reintentar envío
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

