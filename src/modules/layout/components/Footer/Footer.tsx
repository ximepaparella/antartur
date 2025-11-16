import React from "react";
import { FooterSection } from "@/components/common/FooterSection/FooterSection";
import { ContactItem } from "@/components/common/ContactItem/ContactItem";
import { SocialIcon } from "@/components/common/SocialIcon/SocialIcon";
import { Badge } from "@/components/common/Badge/Badge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton/WhatsAppButton";
import footerData from "./footerdata.json";
import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Primera columna: Nosotros y Seguinos */}
          <div className={styles.firstColumn}>
            {/* Sección Nosotros */}
            <FooterSection title={footerData.nosotros.title}>
              {footerData.nosotros.paragraphs.map((paragraph, index) => (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </FooterSection>

            {/* Sección Seguinos */}
            <FooterSection title={footerData.seguinos.title}>
              <nav aria-label="Redes sociales">
                <ul className={styles.socialIcons} role="list">
                  {footerData.seguinos.socialLinks.map((social, index) => (
                    <li key={index} role="listitem">
                      <SocialIcon
                        platform={social.platform as "facebook" | "instagram"}
                        href={social.href}
                        ariaLabel={social.ariaLabel}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            </FooterSection>
          </div>

          {/* Segunda columna: Datos de Contacto */}
          <div className={styles.secondColumn}>
            <FooterSection title={footerData.contacto.title}>
              <address className={styles.address}>
                <ContactItem
                  icon="email"
                  text={footerData.contacto.address.email.text}
                  href={footerData.contacto.address.email.href}
                  ariaLabel={footerData.contacto.address.email.ariaLabel}
                />
                <ContactItem
                  icon="phone"
                  text={footerData.contacto.address.phone.text}
                  href={footerData.contacto.address.phone.href}
                  ariaLabel={footerData.contacto.address.phone.ariaLabel}
                />
                <ContactItem
                  icon="location"
                  text={footerData.contacto.address.location.text}
                  ariaLabel={footerData.contacto.address.location.ariaLabel}
                />
              </address>
              <nav aria-label="Enlaces legales">
                <ul className={styles.legalLinks} role="list">
                  {footerData.contacto.legalLinks.map((link, index) => (
                    <li key={index} role="listitem">
                      <ContactItem
                        icon="document"
                        text={link.text}
                        href={link.href}
                        ariaLabel={link.ariaLabel}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
              <ContactItem
                icon="info"
                text={footerData.contacto.legajo.text}
                ariaLabel={footerData.contacto.legajo.ariaLabel}
              />
            </FooterSection>
          </div>

          {/* Tercera columna: Badges */}
          <div className={styles.thirdColumn}>
            <nav aria-label="Certificaciones y reconocimientos">
              <ul className={styles.badges} role="list">
                {footerData.badges.map((badge, index) => (
                  <li key={index} role="listitem">
                    <Badge
                      image={badge.image}
                      alt={badge.alt}
                      width={badge.width}
                      height={badge.height}
                      href={badge.href}
                      target={badge.target}
                      rel={badge.rel}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Crédito de diseño */}
      <div className={styles.footerCopyright} role="contentinfo">
        <p>{footerData.copyright.text}</p>
      </div>

      {/* Botón WhatsApp */}
      <div className={styles.whatsappButton}>
        <WhatsAppButton
          phoneNumber={footerData.whatsapp.phoneNumber}
          message={footerData.whatsapp.message}
        />
      </div>
    </footer>
  );
};

