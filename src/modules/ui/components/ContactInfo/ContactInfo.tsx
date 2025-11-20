import React from "react";
import { FooterSection } from "@/components/common/FooterSection/FooterSection";
import { ContactItem } from "@/components/common/ContactItem/ContactItem";
import { SocialIcon } from "@/components/common/SocialIcon/SocialIcon";
import footerData from "@/modules/layout/components/Footer/footerdata.json";
import styles from "./ContactInfo.module.scss";

export const ContactInfo: React.FC = () => {
  return (
    <div className={styles.contactInfo}>
      <FooterSection 
        title={footerData.contacto.title}
        className={styles.section}
        titleClassName={styles.title}
        contentClassName={styles.content}
      >
        <address className={styles.address}>
          <ContactItem
            icon="email"
            text="agencias@antartur.tur.ar"
            href="mailto:agencias@antartur.tur.ar"
            ariaLabel="Enviar correo electrónico a agencias@antartur.tur.ar"
          />
          <ContactItem
            icon="phone"
            text="+54 2901611338"
            href="tel:+542901611338"
            ariaLabel="Llamar al teléfono +54 2901611338"
          />
          <ContactItem
            icon="location"
            text="Juan Manuel de Rosas 184"
            ariaLabel="Dirección: Juan Manuel de Rosas 184"
          />
        </address>
      </FooterSection>

      <FooterSection 
        title="SEGUINOS EN:"
        className={styles.section}
        titleClassName={styles.title}
        contentClassName={styles.content}
      >
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
  );
};

