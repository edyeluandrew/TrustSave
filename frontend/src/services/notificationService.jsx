import toast from 'react-hot-toast';

class NotificationService {
  success(message) {
    toast.success(message);
  }

  error(message) {
    toast.error(message);
  }

  info(message) {
    toast(message);
  }

  warning(message) {
    toast(message, { icon: '⚠️' });
  }
}

const notificationService = new NotificationService();
export default notificationService;