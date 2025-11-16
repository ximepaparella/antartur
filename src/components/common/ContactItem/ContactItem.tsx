import React from "react";
import Link from "next/link";
import { Icon, IconName } from "../Icon/Icon";
import styles from "./ContactItem.module.scss";

interface ContactItemProps {
  icon: IconName;
  text: string;
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  text,
  href,
  target,
  rel,
  ariaLabel,
}) => {
  const content = (
    <>
      <Icon
        name={icon}
        size={20}
        className={styles.icon}
        ariaLabel={undefined}
      />
      <span className={styles.text}>{text}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={styles.item}
        aria-label={ariaLabel || text}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={styles.item} aria-label={ariaLabel || text}>
      {content}
    </div>
  );
};

