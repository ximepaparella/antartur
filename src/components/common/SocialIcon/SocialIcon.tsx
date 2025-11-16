import React from "react";
import Link from "next/link";
import { Icon, IconName } from "../Icon/Icon";
import styles from "./SocialIcon.module.scss";

type SocialPlatform = "facebook" | "instagram";

interface SocialIconProps {
  platform: SocialPlatform;
  href: string;
  ariaLabel: string;
}

const platformIcons: Record<SocialPlatform, IconName> = {
  facebook: "facebook",
  instagram: "instagram",
};

export const SocialIcon: React.FC<SocialIconProps> = ({
  platform,
  href,
  ariaLabel,
}) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
      aria-label={ariaLabel}
    >
      <Icon name={platformIcons[platform]} size={32} className={styles.icon} />
    </Link>
  );
};

