import styles from '@/app/(auth)/login/login.module.css';

interface CarSceneProps {
  /** Increments each time the intro should replay — used as a React key to restart CSS animations. */
  introKey: number;
  /** Whether the lane markings should be animating (true briefly while the car drives in). */
  roadDriving: boolean;
  onReplay: () => void;
}

export default function CarScene({ introKey, roadDriving, onReplay }: CarSceneProps) {
  return (
    <>
      <div className={styles.miniBrand}>
        <span className={styles.dot} />
        Drive<span>Ease</span>
      </div>

      <div className={styles.scene}>
        <div className={`${styles.road} ${roadDriving ? styles.driving : ''}`} />

        {/* key={introKey} forces a remount so the CSS animations restart on replay */}
        <div className={styles.carRig} key={introKey}>
          <div className={styles.speedLines}>
            <div />
            <div />
            <div />
          </div>
          <div className={styles.underglow} />
          <div className={styles.headbeam} />

          <svg className={styles.carSvg} viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7690" />
                <stop offset="45%" stopColor="#333c50" />
                <stop offset="100%" stopColor="#12151f" />
              </linearGradient>
              <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7d9db3" />
                <stop offset="100%" stopColor="#1c2733" />
              </linearGradient>
              <radialGradient id="rimGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#dfe4ec" />
                <stop offset="100%" stopColor="#7d859c" />
              </radialGradient>
            </defs>

            <ellipse cx="180" cy="158" rx="150" ry="9" fill="#000" opacity="0.4" />

            {/* body */}
            <path
              d="M18 122 Q18 98 55 92 L98 58 Q124 40 168 40 L218 40 Q258 40 280 60 L318 92 Q342 98 342 122 L342 130 Q342 140 328 140 L32 140 Q18 140 18 130 Z"
              fill="url(#bodyGrad)"
              stroke="#0a0c12"
              strokeWidth="2"
            />

            {/* lower skirt */}
            <rect x="18" y="120" width="324" height="20" rx="6" fill="#0f1219" />

            {/* racing stripe */}
            <path d="M150 40 L166 40 L152 140 L136 140 Z" fill="#2fe3c4" opacity="0.85" />

            {/* spoiler */}
            <path d="M300 62 L332 50 L336 60 L306 74 Z" fill="#12151f" stroke="#0a0c12" strokeWidth="1.5" />
            <rect x="298" y="70" width="8" height="20" fill="#12151f" />

            {/* windows */}
            <path
              d="M102 60 Q126 46 168 46 L214 46 Q252 46 274 62 L272 86 L104 86 Z"
              fill="url(#glassGrad)"
            />
            <path d="M112 58 L150 51 L146 62 L110 68 Z" fill="#ffffff" opacity="0.18" />

            {/* interior glow revealed when door opens */}
            <path
              className={styles.interiorGlow}
              d="M120 63 Q138 52 168 52 L208 52 Q236 52 250 64 L248 84 L122 84 Z"
              fill="#ffdca0"
              opacity="0"
            />

            {/* taillight / brake */}
            <circle className={styles.brakeGlow} cx="27" cy="105" r="12" fill="#ff3b4e" opacity="0.35" />
            <rect x="21" y="98" width="11" height="15" rx="3" fill="#ff5a68" />

            {/* headlight */}
            <circle cx="333" cy="105" r="10" fill="#ffe9bf" opacity="0.5" />
            <rect x="326" y="98" width="13" height="15" rx="3" fill="#fff3d6" />

            {/* wheels */}
            <g>
              <circle cx="95" cy="140" r="27" fill="#0a0c12" stroke="#262c3c" strokeWidth="3" />
              <circle className={styles.wheelRim} cx="95" cy="140" r="13" fill="url(#rimGrad)" />
              <g className={styles.wheelRim} style={{ transformOrigin: '95px 140px' }}>
                <rect x="93" y="128" width="4" height="24" fill="#3a4256" />
                <rect x="83" y="138" width="24" height="4" fill="#3a4256" />
              </g>
              <circle cx="95" cy="140" r="4" fill="#20242f" />
            </g>
            <g>
              <circle cx="272" cy="140" r="27" fill="#0a0c12" stroke="#262c3c" strokeWidth="3" />
              <circle className={styles.wheelRim} cx="272" cy="140" r="13" fill="url(#rimGrad)" />
              <g className={styles.wheelRim} style={{ transformOrigin: '272px 140px' }}>
                <rect x="270" y="128" width="4" height="24" fill="#3a4256" />
                <rect x="260" y="138" width="24" height="4" fill="#3a4256" />
              </g>
              <circle cx="272" cy="140" r="4" fill="#20242f" />
            </g>

            {/* DOOR (hinge near front-top, swings up) */}
            <g className={styles.door}>
              <path
                d="M158 88 L158 63 Q158 53 170 51 L232 51 Q244 53 246 62 L246 88 Z"
                fill="#3b4456"
                stroke="#0a0c12"
                strokeWidth="2"
              />
              <path d="M166 60 Q186 53 214 54 L228 61 L226 82 L168 82 Z" fill="url(#glassGrad)" />
              <rect x="198" y="72" width="15" height="4" rx="2" fill="#0a0c12" />
            </g>
          </svg>
        </div>
      </div>

      <button className={styles.replayBtn} title="Replay intro" onClick={onReplay}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4v6h6M20 20v-6h-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20 10a8 8 0 0 0-14-5M4 14a8 8 0 0 0 14 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </>
  );
}