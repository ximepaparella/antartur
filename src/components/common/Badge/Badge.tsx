import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Badge.module.scss";

interface BadgeProps {
  image: string;
  alt: string;
  href?: string;
  target?: string;
  rel?: string;
  width?: number;
  height?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  image,
  alt,
  href,
  target,
  rel,
  width = 80,
  height = 80,
}) => {
  const imageElement = (
    <Image
      src={image}
      alt={alt}
      width={width}
      height={height}
      className={styles.image}
      loading="lazy"
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={styles.badge}
      >
        {imageElement}
      </Link>
    );
  }

  return <div className={styles.badge}>{imageElement}</div>;
};

