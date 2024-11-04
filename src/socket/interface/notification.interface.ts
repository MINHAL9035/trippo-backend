import { NotificationType } from '../../community/schema/notification.schema';

export interface INotification {
  _id: string;
  userId: string;
  triggeredBy: {
    _id: string;
    userName: string;
    image: string;
  };
  postId: {
    _id: string;
    imageUrl: string[];
  };
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
