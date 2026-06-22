import React from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/common/Button/Button";
import styles from "./AntartidaInquiryCta.module.scss";

interface AntartidaInquiryCtaProps {
  email?: string;
}

export const AntartidaInquiryCta: React.FC<AntartidaInquiryCtaProps> = ({
  email = "reservas@antartur.tur.ar",
}) => {
  return (
    <section className={styles.cta} aria-labelledby="antartida-inquiry-title">
      <div className={styles.card}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Icon name="info" size={40} />
        </div>
        <h2 id="antartida-inquiry-title" className={styles.title}>
          ¿Querés conocer nuestras excursiones a la Antártida?
        </h2>
        <p className={styles.description}>
          Para conocer las excursiones disponibles, itinerarios, fechas y toda la
          información que necesitás para planificar tu viaje al Continente Blanco,
          escribinos y con gusto te asesoramos.
        </p>
        <p className={styles.emailHint}>
          Contactanos por email a{" "}
          <a href={`mailto:${email}`} className={styles.emailLink}>
            {email}
          </a>
        </p>
        <Button
          href={`mailto:${email}?subject=Consulta%20sobre%20excursiones%20a%20la%20Ant%C3%A1rtida`}
          variant="primary"
          size="medium"
          className={styles.button}
        >
          ESCRIBINOS POR EMAIL
        </Button>
      </div>
    </section>
  );
};
