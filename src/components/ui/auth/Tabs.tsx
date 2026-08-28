import styles from '@/app/(auth)/login/login.module.css';

export type AuthTab = 'login' | 'signup';

interface TabsProps {
  active: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className={styles.tabs} data-active={active}>
      <div className={styles.tabHighlight} />
      <button
        className={`${styles.tabBtn} ${active === 'login' ? styles.active : ''}`}
        onClick={() => onChange('login')}
        type="button"
      >
        Log In
      </button>
      <button
        className={`${styles.tabBtn} ${active === 'signup' ? styles.active : ''}`}
        onClick={() => onChange('signup')}
        type="button"
      >
        Sign Up
      </button>
    </div>
  );
}