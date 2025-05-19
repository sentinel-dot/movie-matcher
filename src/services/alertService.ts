// alertService.ts
const isWeb = typeof window !== 'undefined' && !(window as any).ReactNative;

// Create a platform-agnostic alert service
export const AlertService = {
  alert: (title: string, message?: string) => {
    if (isWeb) {
      // Web implementation
      window.alert(message ? `${title}: ${message}` : title);
    } else {
      // React Native implementation
      import('react-native').then(({ Alert }) => {
        Alert.alert(title, message);
      }).catch(err => {
        console.error('Failed to import Alert from react-native', err);
      });
    }
  },
  
  confirm: (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    if (isWeb) {
      // Web implementation
      const confirmed = window.confirm(`${title}\n${message}`);
      if (confirmed) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
    } else {
      // React Native implementation
      import('react-native').then(({ Alert }) => {
        Alert.alert(
          title,
          message,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: onCancel
            },
            {
              text: 'Yes',
              onPress: onConfirm
            }
          ]
        );
      }).catch(err => {
        console.error('Failed to import Alert from react-native', err);
      });
    }
  }
};