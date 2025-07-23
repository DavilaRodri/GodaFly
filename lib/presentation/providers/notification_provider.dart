import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/user.dart';

// Tipos de notificaciones
enum NotificationType {
  chatRequest,
  newMessage,
  travelMatch,
  flightUpdate,
  layoverMatch,
  systemUpdate,
}

// Entidad de notificación
class AppNotification {
  final String id;
  final String title;
  final String message;
  final NotificationType type;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic>? data;
  final User? fromUser;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.data,
    this.fromUser,
  });

  AppNotification copyWith({
    String? id,
    String? title,
    String? message,
    NotificationType? type,
    DateTime? timestamp,
    bool? isRead,
    Map<String, dynamic>? data,
    User? fromUser,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      data: data ?? this.data,
      fromUser: fromUser ?? this.fromUser,
    );
  }

  // Helper para obtener icono según tipo
  String get iconPath {
    switch (type) {
      case NotificationType.chatRequest:
        return '💬';
      case NotificationType.newMessage:
        return '📩';
      case NotificationType.travelMatch:
        return '🎯';
      case NotificationType.flightUpdate:
        return '✈️';
      case NotificationType.layoverMatch:
        return '🌍';
      case NotificationType.systemUpdate:
        return '🔔';
    }
  }

  // Helper para obtener color según tipo
  int get colorValue {
    switch (type) {
      case NotificationType.chatRequest:
        return 0xFF25D097;
      case NotificationType.newMessage:
        return 0xFF4ECDC4;
      case NotificationType.travelMatch:
        return 0xFFFF6B6B;
      case NotificationType.flightUpdate:
        return 0xFF45B7D1;
      case NotificationType.layoverMatch:
        return 0xFF96CEB4;
      case NotificationType.systemUpdate:
        return 0xFF6C5CE7;
    }
  }
}

// Estado de notificaciones
class NotificationState {
  final List<AppNotification> notifications;
  final bool isLoading;
  final String? error;

  const NotificationState({
    this.notifications = const [],
    this.isLoading = false,
    this.error,
  });

  NotificationState copyWith({
    List<AppNotification>? notifications,
    bool? isLoading,
    String? error,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  int get unreadCount => notifications.where((n) => !n.isRead).length;

  List<AppNotification> get unreadNotifications =>
      notifications.where((n) => !n.isRead).toList();

  List<AppNotification> get todayNotifications {
    final today = DateTime.now();
    return notifications
        .where((n) =>
            n.timestamp.year == today.year &&
            n.timestamp.month == today.month &&
            n.timestamp.day == today.day)
        .toList();
  }

  List<AppNotification> get olderNotifications {
    final today = DateTime.now();
    return notifications
        .where((n) => !(n.timestamp.year == today.year &&
            n.timestamp.month == today.month &&
            n.timestamp.day == today.day))
        .toList();
  }
}

// Notifier
class NotificationNotifier extends StateNotifier<NotificationState> {
  NotificationNotifier() : super(const NotificationState()) {
    _initializeMockNotifications();
  }

  void _initializeMockNotifications() {
    final now = DateTime.now();
    final mockUsers = [
      User(
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        profileImage:
            'https://ui-avatars.com/api/?name=Sarah+Johnson&background=FF6B6B&color=fff',
        authType: AuthType.email,
      ),
      User(
        id: '3',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@example.com',
        profileImage:
            'https://ui-avatars.com/api/?name=Mike+Chen&background=4ECDC4&color=fff',
        authType: AuthType.email,
      ),
      User(
        id: '4',
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma@example.com',
        profileImage:
            'https://ui-avatars.com/api/?name=Emma+Wilson&background=95E1D3&color=fff',
        authType: AuthType.email,
      ),
    ];

    final notifications = <AppNotification>[
      // Notificaciones recientes (hoy)
      AppNotification(
        id: '1',
        title: 'New Chat Request',
        message: 'Emma wants to connect for your London layover',
        type: NotificationType.chatRequest,
        timestamp: now.subtract(const Duration(minutes: 5)),
        fromUser: mockUsers[2],
        data: {'conversationId': 'conv_4'},
      ),
      AppNotification(
        id: '2',
        title: 'New Message',
        message:
            'Sarah: "Around 2 PM. Want to meet up for coffee before boarding? ☕"',
        type: NotificationType.newMessage,
        timestamp: now.subtract(const Duration(minutes: 30)),
        fromUser: mockUsers[0],
        data: {'conversationId': 'conv_2'},
      ),
      AppNotification(
        id: '3',
        title: 'Travel Match Found!',
        message: 'Found 3 travelers on your flight AA1234 tomorrow',
        type: NotificationType.travelMatch,
        timestamp: now.subtract(const Duration(hours: 1)),
        data: {'flightNumber': 'AA1234', 'matchCount': 3},
      ),
      AppNotification(
        id: '4',
        title: 'Flight Update',
        message: 'Flight BA567 to Paris - Gate changed to B12',
        type: NotificationType.flightUpdate,
        timestamp: now.subtract(const Duration(hours: 2)),
        data: {'flightNumber': 'BA567', 'gate': 'B12'},
      ),

      // Notificaciones anteriores
      AppNotification(
        id: '5',
        title: 'Layover Match',
        message: 'Mike Chen also has a layover in Tokyo tomorrow',
        type: NotificationType.layoverMatch,
        timestamp: now.subtract(const Duration(days: 1)),
        fromUser: mockUsers[1],
        data: {'city': 'Tokyo', 'userId': '3'},
        isRead: true,
      ),
      AppNotification(
        id: '6',
        title: 'Welcome to GodaFly!',
        message:
            'Your profile is complete. Start connecting with fellow travelers!',
        type: NotificationType.systemUpdate,
        timestamp: now.subtract(const Duration(days: 2)),
        isRead: true,
      ),
      AppNotification(
        id: '7',
        title: 'Chat Request Accepted',
        message: 'Sarah accepted your chat request for flight AA1234',
        type: NotificationType.chatRequest,
        timestamp: now.subtract(const Duration(days: 2, hours: 5)),
        fromUser: mockUsers[0],
        isRead: true,
      ),
      AppNotification(
        id: '8',
        title: 'New Features Available',
        message: 'Check out our new layover matching feature!',
        type: NotificationType.systemUpdate,
        timestamp: now.subtract(const Duration(days: 3)),
        isRead: true,
      ),
    ];

    // Ordenar por timestamp (más recientes primero)
    notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));

    state = state.copyWith(notifications: notifications);
  }

  // Marcar notificación como leída
  void markAsRead(String notificationId) {
    final notifications = state.notifications.map((notification) {
      if (notification.id == notificationId) {
        return notification.copyWith(isRead: true);
      }
      return notification;
    }).toList();

    state = state.copyWith(notifications: notifications);
  }

  // Marcar todas como leídas
  void markAllAsRead() {
    final notifications = state.notifications.map((notification) {
      return notification.copyWith(isRead: true);
    }).toList();

    state = state.copyWith(notifications: notifications);
  }

  // Eliminar notificación
  void deleteNotification(String notificationId) {
    final notifications = state.notifications
        .where((notification) => notification.id != notificationId)
        .toList();

    state = state.copyWith(notifications: notifications);
  }

  // Agregar nueva notificación
  void addNotification(AppNotification notification) {
    final notifications = [notification, ...state.notifications];
    state = state.copyWith(notifications: notifications);
  }

  // Simular nueva notificación de chat
  void simulateChatNotification(User fromUser, String message) {
    final notification = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'New Message',
      message: '${fromUser.firstName}: "$message"',
      type: NotificationType.newMessage,
      timestamp: DateTime.now(),
      fromUser: fromUser,
      data: {'conversationId': 'conv_${fromUser.id}'},
    );

    addNotification(notification);
  }

  // Simular notificación de match de viaje
  void simulateTravelMatchNotification(String flightNumber, int matchCount) {
    final notification = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'Travel Match Found!',
      message: 'Found $matchCount travelers on your flight $flightNumber',
      type: NotificationType.travelMatch,
      timestamp: DateTime.now(),
      data: {'flightNumber': flightNumber, 'matchCount': matchCount},
    );

    addNotification(notification);
  }

  // Simular notificación de solicitud de chat
  void simulateChatRequestNotification(User fromUser, String context) {
    final notification = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'New Chat Request',
      message: '${fromUser.firstName} wants to connect for your $context',
      type: NotificationType.chatRequest,
      timestamp: DateTime.now(),
      fromUser: fromUser,
      data: {'userId': fromUser.id, 'context': context},
    );

    addNotification(notification);
  }

  // Obtener notificaciones por tipo
  List<AppNotification> getNotificationsByType(NotificationType type) {
    return state.notifications.where((n) => n.type == type).toList();
  }

  // Limpiar notificaciones antiguas (más de 30 días)
  void clearOldNotifications() {
    final cutoffDate = DateTime.now().subtract(const Duration(days: 30));
    final notifications = state.notifications
        .where((notification) => notification.timestamp.isAfter(cutoffDate))
        .toList();

    state = state.copyWith(notifications: notifications);
  }
}

// Providers
final notificationNotifierProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier();
});

final unreadNotificationCountProvider = Provider<int>((ref) {
  return ref.watch(notificationNotifierProvider).unreadCount;
});

final unreadNotificationsProvider = Provider<List<AppNotification>>((ref) {
  return ref.watch(notificationNotifierProvider).unreadNotifications;
});

final todayNotificationsProvider = Provider<List<AppNotification>>((ref) {
  return ref.watch(notificationNotifierProvider).todayNotifications;
});

final olderNotificationsProvider = Provider<List<AppNotification>>((ref) {
  return ref.watch(notificationNotifierProvider).olderNotifications;
});
