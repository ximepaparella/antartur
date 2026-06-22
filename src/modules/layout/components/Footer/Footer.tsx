"use client";

import React from "react";
import { FooterSection } from "@/components/common/FooterSection/FooterSection";
import { ContactItem } from "@/components/common/ContactItem/ContactItem";
import { SocialIcon } from "@/components/common/SocialIcon/SocialIcon";
import { Badge } from "@/components/common/Badge/Badge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton/WhatsAppButton";
import footerData from "./footerdata.json";
import type { SiteSettings } from "@/modules/settings/types";
import styles from "./Footer.module.scss";

interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {

  const emailText = settings.email || footerData.contacto.address.email.text;
  const emailHref =
    settings.email ? `mailto:${settings.email}` : footerData.contacto.address.email.href;

  const phoneText = settings.phone || footerData.contacto.address.phone.text;
  const phoneHref =
    settings.phone
      ? `tel:${settings.phone.replace(/\s+/g, "")}`
      : footerData.contacto.address.phone.href;

         const locationText = settings.address || footerData.contacto.address.location.text;
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
              <nav aria-label="Datos de contacto">
                <ul className={styles.contactLinks} role="list">
                  <li role="listitem">
                    <ContactItem
                      icon="email"
                      text={emailText}
                      href={emailHref}
                      ariaLabel={footerData.contacto.address.email.ariaLabel}
                      className={styles.contactItem}
                    />
                  </li>
                  <li role="listitem">
                    <ContactItem
                      icon="phone"
                      text={phoneText}
                      href={phoneHref}
                      ariaLabel={footerData.contacto.address.phone.ariaLabel}
                      className={styles.contactItem}
                    />
                  </li>
                  <li role="listitem">
                    <ContactItem
                      icon="location"
                      text={locationText}
                      href={footerData.contacto.address.location.href}
                      ariaLabel={footerData.contacto.address.location.ariaLabel}
                      className={styles.contactItem}
                    />
                  </li>
                  {footerData.contacto.legalLinks.map((link, index) => (
                    <li key={index} role="listitem">
                      <ContactItem
                        icon="document"
                        text={link.text}
                        href={link.href}
                        ariaLabel={link.ariaLabel}
                        className={styles.contactItem}
                      />
                    </li>
                  ))}
                  <li role="listitem">
                    <ContactItem
                      icon="info"
                      text={footerData.contacto.legajo.text}
                      ariaLabel={footerData.contacto.legajo.ariaLabel}
                      className={styles.contactItem}
                    />
                  </li>
                  <li role="listitem">
                    <ContactItem
                      icon="document"
                      text={footerData.contacto.arrepentimiento.text}
                      href={footerData.contacto.arrepentimiento.href}
                      ariaLabel={footerData.contacto.arrepentimiento.ariaLabel}
                      className={styles.contactItem}
                    />
                  </li>
                </ul>
              </nav>
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

