import styles from '@/app/(auth)/login/login.module.css';

/** Purely decorative cinematic backdrop layers. No props needed. */
export default function Background() {
  return (
    <>
      <div className={styles.backdrop} />
      <div className={styles.stars} />
      <div className={styles.fog} />
      <div className={styles.vignette} />
      <div className={styles.grain} />
    </>
  );
}