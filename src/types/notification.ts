export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system' | 'alert';
  read: boolean;
  createdAt: any; // Using any for Firestore Timestamp compatibility
  link?: string;
}
