import { FooterSection } from "@/components/common/FooterSection/FooterSection";
import { ContactItem } from "@/components/common/ContactItem/ContactItem";
import { SocialIcon } from "@/components/common/SocialIcon/SocialIcon";
import footerData from "@/modules/layout/components/Footer/footerdata.json";
import { getSiteSettings } from "@/modules/settings/repository";
import styles from "./ContactInfo.module.scss";

export async function ContactInfo() {
  const settings = await getSiteSettings();

  const emailText = settings.email || "reservas@antartur.tur.ar";
  const emailHref = `mailto:${emailText}`;

  const phoneText = settings.phone || "+54 2901611338";
  const phoneHref = `tel:${phoneText.replace(/\s+/g, "")}`;

  const locationText = settings.address || "Juan Manuel de Rosas 184";
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
            text={emailText}
            href={emailHref}
            ariaLabel="Enviar correo electrónico"
          />
          <ContactItem
            icon="phone"
            text={phoneText}
            href={phoneHref}
            ariaLabel="Llamar por teléfono"
          />
          <ContactItem
            icon="location"
            text={locationText}
            ariaLabel="Dirección"
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

