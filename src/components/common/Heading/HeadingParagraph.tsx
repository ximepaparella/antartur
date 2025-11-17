import React from "react";
import styles from "./Heading.module.scss";

interface HeadingParagraphProps {
  /** Contenido del párrafo */
  children: React.ReactNode;
}

export const HeadingParagraph: React.FC<HeadingParagraphProps> = ({ children }) => {
  return (
    <div style={{ textAlign: "center", marginTop: "-30px" }}>
      <p className={styles.paragraph}>{children}</p>
    </div>
  );
};

