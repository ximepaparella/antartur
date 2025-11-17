import styles from "./page.module.scss";

export default function CheckoutPage() {
  return (
    <section className={styles.checkoutBanner}>
      <div className={styles.checkoutContainer}>
        <h1 className={styles.checkoutTitle}>Finalizar reserva</h1>
      </div>
    </section>
  );
}

