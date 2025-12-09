"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import type { NotificationResponse } from "@/modules/notifications/api/dto/notificationsDto";
import type { NotificationStatus } from "@/components/common/StatusBadge";
import { Card } from "@/components/common/Card/Card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

export default function AdminNotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<NotificationResponse | null>(null);
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
          setError("Failed to fetch notification");
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
          <StatusBadge status={notification.status as NotificationStatus} />
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
              <StatusBadge status={notification.status as "PENDING" | "SENT" | "ERROR"} />
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
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.body) }}
            />
          </Card>
        )}

        {notification.errorMessage && (
          <Card title="Error">
            <div className={styles.errorMessage}>
              <p>{notification.errorMessage}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

