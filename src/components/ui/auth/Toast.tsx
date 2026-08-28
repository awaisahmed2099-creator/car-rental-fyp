import styles from '@/app/(auth)/login/login.module.css';

interface ToastProps {
  message: string;
  show: boolean;
}

export default function Toast({ message, show }: ToastProps) {
  return <div className={`${styles.toast} ${show ? styles.show : ''}`}>{message}</div>;
}