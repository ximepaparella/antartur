import React from "react";
import Link from "next/link";
import { Icon, IconName } from "../Icon/Icon";
import styles from "./SocialIcon.module.scss";

type SocialPlatform = "facebook" | "instagram";

interface SocialIconProps {
  platform: SocialPlatform;
  href: string;
  ariaLabel: string;
  className?: string;
}

const platformIcons: Record<SocialPlatform, IconName> = {
  facebook: "facebook",
  instagram: "instagram",
};

export const SocialIcon: React.FC<SocialIconProps> = ({
  platform,
  href,
  ariaLabel,
  className = "",
}) => {
  const linkClassName = `${styles.link} ${className}`.trim();
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClassName}
      aria-label={ariaLabel}
    >
      <Icon name={platformIcons[platform]} size={32} className={styles.icon} />
    </Link>
  );
};

