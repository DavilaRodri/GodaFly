class AppConstants {
  // App Info
  static const String appName = 'GodaFly';
  static const String appVersion = '1.0.0';

  // Package Names
  static const String androidPackageName = 'com.app.godafly';
  static const String iosAppId = '9ZR77KRSWG';

  // Storage Keys
  static const String userDataKey = 'USER_DATA';
  static const String authTokenKey = 'auth_token';
  static const String fcmTokenKey = 'fcm_token';

  // Date Formats
  static const String dobFormat = 'dd, MMM yyyy';
  static const String chatDateFormat = 'd MMM yyyy';
  static const String timeFormat = 'hh:mm a';
  static const String backendTimeFormat = 'HH:mm';
  static const String backendDateFormat = 'yyyy-MM-dd';
  static const String commonDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

  // Flight Number Mask
  static const String flightNumberPattern = r'^[A-Z]{2}\s-\s[A-Z0-9]{3,6}$';

  // Validation
  static const int maxProfileImages = 6;
  static const int maxBioLength = 500;
  static const int minPasswordLength = 6;

  // Chat
  static const String chatTypeMessage = 'message';

  // Travel Types
  static const String travelTypeFlight = 'Plane';
  static const String travelTypeLayover = 'Layover';

  // Request Status
  static const String requestStatusRequest = 'Request Chat';
  static const String requestStatusRequested = 'Requested';
  static const String requestStatusChatNow = 'Chat Now';

  // Auth Types
  static const String authTypeEmail = 'email';
  static const String authTypeFacebook = 'facebook';
  static const String authTypeApple = 'apple';

  // Push Notification Types
  static const int pushTypeFriendRequest = 1;
  static const int pushTypeChatRequest = 2;
  static const int pushTypeMessage = 3;

  // Image Types
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB

  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 50;

  // URLs
  static const String privacyPolicyUrl = 'https://godafly.info/privacy';
  static const String termsOfServiceUrl = 'https://godafly.info/terms';
  static const String supportEmail = 'support@godafly.info';

  // Random Images Count
  static const int randomFlightImagesCount = 11;
  static const int randomLayoverImagesCount = 11;
}
