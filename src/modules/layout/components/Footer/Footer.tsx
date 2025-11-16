import React from "react";
import { FooterSection } from "@/components/common/FooterSection/FooterSection";
import { ContactItem } from "@/components/common/ContactItem/ContactItem";
import { SocialIcon } from "@/components/common/SocialIcon/SocialIcon";
import { Badge } from "@/components/common/Badge/Badge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton/WhatsAppButton";
import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Primera columna: Nosotros y Seguinos */}
          <div className={styles.firstColumn}>
            {/* Sección Nosotros */}
            <FooterSection title="Nosotros">
              <p className={styles.paragraph}>
                Si te gusta la naturaleza y la aventura, la cultura y la
                historia, te invitamos a compartir nuestros excursiones, ANTARTUR
                es una empresa familiar que desde 1990 comparte experiencia e
                idoneidad organizando tours en grupos reducidos.
              </p>
              <p className={styles.paragraph}>
                Guias especializados acompañados de moderno equipamiento te
                harán llevar de Tierra Del Fuego la imagen clara e inolvidable de
                un viaje maravilloso.
              </p>
            </FooterSection>

            {/* Sección Seguinos */}
            <FooterSection title="Seguinos">
              <div className={styles.socialIcons}>
                <SocialIcon
                  platform="facebook"
                  href="https://www.facebook.com/antartur"
                  ariaLabel="Seguinos en Facebook"
                />
                <SocialIcon
                  platform="instagram"
                  href="https://www.instagram.com/antartur"
                  ariaLabel="Seguinos en Instagram"
                />
              </div>
            </FooterSection>
          </div>

          {/* Segunda columna: Datos de Contacto */}
          <div className={styles.secondColumn}>
            <FooterSection title="Datos de Contacto">
              <ContactItem
                icon="email"
                text="hola@antartur.tur.ar"
                href="mailto:hola@antartur.tur.ar"
              />
              <ContactItem
                icon="phone"
                text="+54 9 2901 48-7838"
                href="tel:+542901487838"
              />
              <ContactItem
                icon="document"
                text="Términos y Condiciones"
                href="/terminos-y-condiciones"
              />
              <ContactItem
                icon="document"
                text="Políticas de privacidad"
                href="/politicas-de-privacidad"
              />
              <ContactItem icon="location" text="Juan Manuel de Rosas 184" />
              <ContactItem
                icon="info"
                text="N° Legajo 12896 del Ministerio de Turismo de la República Argentina"
              />
            </FooterSection>
          </div>

          {/* Tercera columna: Badges */}
          <div className={styles.thirdColumn}>
            <div className={styles.badges}>
              <Badge
                image="/images/logos-premios-lugares.png"
                alt="Premios Lugares 2012"
                width={100}
                height={100}
              />
              <Badge
                image="/images/logo_miembro_aaetav.ai_.png"
                alt="AAETAV Miembro"
                width={100}
                height={100}
              />
              <Badge
                image="http://www.afip.gob.ar/images/f960/DATAWEB.jpg"
                alt="Data Fiscal"
                href="http://qr.afip.gob.ar/?qr=vq8kOZRTEEQmBZOx6jRFdw,,"
                target="_F960AFIPInfo"
                rel="noopener"
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>

        {/* Crédito de diseño */}
        <div className={styles.credit}>
          <p>Diseñado X Estudio Equis</p>
        </div>
      </div>

      {/* Botón WhatsApp */}
      <div className={styles.whatsappButton}>
        <WhatsAppButton phoneNumber="+54 9 2901 48-7838" />
      </div>
    </footer>
  );
};

