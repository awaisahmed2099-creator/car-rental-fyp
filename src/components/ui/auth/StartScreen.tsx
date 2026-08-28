import styles from '@/app/(auth)/login/login.module.css';

interface StartScreenProps {
  hidden: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export default function StartScreen({ hidden, onStart, onSkip }: StartScreenProps) {
  return (
    <div className={`${styles.startScreen} ${hidden ? styles.hidden : ''}`}>
      <div className={styles.startLogo}>
        <div className={styles.word}>
          Drive<span>Ease</span>
        </div>
        <div className={styles.eyebrow}>Premium Car Rental</div>
      </div>

      <div className={styles.keyRing}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M14 8a4 4 0 1 0-3.87 4H12v2h2v2h2v2h3v-3l-3.13-3.13A4 4 0 0 0 14 8Z"
            stroke="#f97316"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8" r="1.4" fill="#f97316" />
        </svg>
      </div>

      <button className={styles.startBtn} onClick={onStart}>
        Tap to Start Engine
      </button>
      <button className={styles.skipLink} onClick={onSkip}>
        Skip intro
      </button>
    </div>
  );
}