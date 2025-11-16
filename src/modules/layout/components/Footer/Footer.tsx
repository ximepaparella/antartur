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
              <nav aria-label="Redes sociales">
                <ul className={styles.socialIcons} role="list">
                  <li role="listitem">
                    <SocialIcon
                      platform="facebook"
                      href="https://www.facebook.com/antartur"
                      ariaLabel="Seguinos en Facebook"
                    />
                  </li>
                  <li role="listitem">
                    <SocialIcon
                      platform="instagram"
                      href="https://www.instagram.com/antartur"
                      ariaLabel="Seguinos en Instagram"
                    />
                  </li>
                </ul>
              </nav>
            </FooterSection>
          </div>

          {/* Segunda columna: Datos de Contacto */}
          <div className={styles.secondColumn}>
            <FooterSection title="Datos de Contacto">
              <address className={styles.address}>
                <ContactItem
                  icon="email"
                  text="hola@antartur.tur.ar"
                  href="mailto:hola@antartur.tur.ar"
                  ariaLabel="Enviar correo electrónico a hola@antartur.tur.ar"
                />
                <ContactItem
                  icon="phone"
                  text="+54 9 2901 48-7838"
                  href="tel:+542901487838"
                  ariaLabel="Llamar al teléfono +54 9 2901 48-7838"
                />
                <ContactItem
                  icon="location"
                  text="Juan Manuel de Rosas 184"
                  ariaLabel="Dirección: Juan Manuel de Rosas 184"
                />
              </address>
              <nav aria-label="Enlaces legales">
                <ul className={styles.legalLinks} role="list">
                  <li role="listitem">
                    <ContactItem
                      icon="document"
                      text="Términos y Condiciones"
                      href="/terminos-y-condiciones"
                      ariaLabel="Leer términos y condiciones"
                    />
                  </li>
                  <li role="listitem">
                    <ContactItem
                      icon="document"
                      text="Políticas de privacidad"
                      href="/politicas-de-privacidad"
                      ariaLabel="Leer políticas de privacidad"
                    />
                  </li>
                </ul>
              </nav>
              <ContactItem
                icon="info"
                text="N° Legajo 12896 del Ministerio de Turismo de la República Argentina"
                ariaLabel="Número de legajo 12896 del Ministerio de Turismo de la República Argentina"
              />
            </FooterSection>
          </div>

          {/* Tercera columna: Badges */}
          <div className={styles.thirdColumn}>
            <nav aria-label="Certificaciones y reconocimientos">
              <ul className={styles.badges} role="list">
                <li role="listitem">
                  <Badge
                    image="/images/logos-premios-lugares.png"
                    alt="Premios Lugares 2012 - Reconocimiento turístico"
                    width={100}
                    height={100}
                  />
                </li>
                <li role="listitem">
                  <Badge
                    image="/images/logo_miembro_aaetav.ai_.png"
                    alt="Miembro de AAETAV - Asociación Argentina de Ecoturismo y Turismo Aventura"
                    width={100}
                    height={100}
                  />
                </li>
                <li role="listitem">
                  <Badge
                    image="https://www.afip.gob.ar/images/f960/DATAWEB.jpg"
                    alt="Data Fiscal - Verificar información fiscal"
                    href="https://qr.afip.gob.ar/?qr=vq8kOZRTEEQmBZOx6jRFdw,,"
                    target="_F960AFIPInfo"
                    rel="noopener noreferrer"
                    width={100}
                    height={100}
                  />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Crédito de diseño */}
      <div className={styles.footerCopyright} role="contentinfo">
        <p>Diseñado X Estudio Equis</p>
      </div>

      {/* Botón WhatsApp */}
      <div className={styles.whatsappButton}>
        <WhatsAppButton phoneNumber="+54 9 2901 48-7838" />
      </div>
    </footer>
  );
};

