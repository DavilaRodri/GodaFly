import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly_flutter/presentation/providers/notification_provider.dart';
import '../chat/chat_detail_screen.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationState = ref.watch(notificationNotifierProvider);
    final notificationNotifier =
        ref.watch(notificationNotifierProvider.notifier);
    final todayNotifications = ref.watch(todayNotificationsProvider);
    final olderNotifications = ref.watch(olderNotificationsProvider);
    final unreadCount = ref.watch(unreadNotificationCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Notifications'),
            if (unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$unreadCount',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
        backgroundColor: const Color(0xFF25D097),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: () => notificationNotifier.markAllAsRead(),
              child: const Text('Mark all read',
                  style: TextStyle(color: Colors.white)),
            ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              switch (value) {
                case 'clear_old':
                  notificationNotifier.clearOldNotifications();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Old notifications cleared')),
                  );
                  break;
                case 'settings':
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Notification settings coming soon!')),
                  );
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'clear_old',
                child: Text('Clear old notifications'),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: Text('Notification settings'),
              ),
            ],
          ),
        ],
      ),
      body: notificationState.notifications.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_off, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No notifications yet',
                      style: TextStyle(fontSize: 18, color: Colors.grey)),
                  Text('We\'ll notify you when something happens!',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Today Section
                if (todayNotifications.isNotEmpty) ...[
                  _buildSectionHeader('Today'),
                  const SizedBox(height: 8),
                  ...todayNotifications.map((notification) =>
                      _buildNotificationCard(
                          context, ref, notification, notificationNotifier)),
                  const SizedBox(height: 24),
                ],

                // Older Section
                if (olderNotifications.isNotEmpty) ...[
                  _buildSectionHeader('Earlier'),
                  const SizedBox(height: 8),
                  ...olderNotifications.map((notification) =>
                      _buildNotificationCard(
                          context, ref, notification, notificationNotifier)),
                ],
              ],
            ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    WidgetRef ref,
    AppNotification notification,
    NotificationNotifier notifier,
  ) {
    final timeDiff = DateTime.now().difference(notification.timestamp);
    String timeText;

    if (timeDiff.inMinutes < 60) {
      timeText = '${timeDiff.inMinutes}m ago';
    } else if (timeDiff.inHours < 24) {
      timeText = '${timeDiff.inHours}h ago';
    } else if (timeDiff.inDays < 7) {
      timeText = '${timeDiff.inDays}d ago';
    } else {
      timeText =
          '${notification.timestamp.day}/${notification.timestamp.month}/${notification.timestamp.year}';
    }

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) {
        notifier.deleteNotification(notification.id);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Notification deleted'),
            action: SnackBarAction(
              label: 'Undo',
              onPressed: () {
                // TODO: Implement undo functionality
              },
            ),
          ),
        );
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        elevation: notification.isRead ? 1 : 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            // Marcar como leída
            if (!notification.isRead) {
              notifier.markAsRead(notification.id);
            }

            // Navegar según el tipo
            _handleNotificationTap(context, notification);
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: notification.isRead
                  ? null
                  : Border.all(color: Color(notification.colorValue), width: 2),
            ),
            child: Row(
              children: [
                // Avatar/Icon
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Color(notification.colorValue).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: notification.fromUser != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(25),
                          child: notification.fromUser!.profileImage != null
                              ? Image.network(
                                  notification.fromUser!.profileImage!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      _buildFallbackAvatar(notification),
                                )
                              : _buildFallbackAvatar(notification),
                        )
                      : Center(
                          child: Text(
                            notification.iconPath,
                            style: const TextStyle(fontSize: 24),
                          ),
                        ),
                ),
                const SizedBox(width: 16),

                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: notification.isRead
                                    ? FontWeight.w600
                                    : FontWeight.bold,
                                color: notification.isRead
                                    ? Colors.black87
                                    : Colors.black,
                              ),
                            ),
                          ),
                          Text(
                            timeText,
                            style: TextStyle(
                              fontSize: 12,
                              color: notification.isRead
                                  ? Colors.grey
                                  : Color(notification.colorValue),
                              fontWeight: notification.isRead
                                  ? FontWeight.normal
                                  : FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        notification.message,
                        style: TextStyle(
                          fontSize: 14,
                          color: notification.isRead
                              ? Colors.grey.shade600
                              : Colors.black87,
                          fontWeight: notification.isRead
                              ? FontWeight.normal
                              : FontWeight.w500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      // Action buttons for certain types
                      if (!notification.isRead &&
                          notification.type ==
                              NotificationType.chatRequest) ...[
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            ElevatedButton(
                              onPressed: () {
                                notifier.markAsRead(notification.id);
                                _acceptChatRequest(context, notification);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF25D097),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20)),
                              ),
                              child: const Text('Accept',
                                  style: TextStyle(
                                      fontSize: 12, color: Colors.white)),
                            ),
                            const SizedBox(width: 8),
                            OutlinedButton(
                              onPressed: () {
                                notifier.markAsRead(notification.id);
                              },
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20)),
                                side: const BorderSide(color: Colors.grey),
                              ),
                              child: const Text('Decline',
                                  style: TextStyle(
                                      fontSize: 12, color: Colors.grey)),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

                // Unread indicator
                if (!notification.isRead)
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(left: 8),
                    decoration: BoxDecoration(
                      color: Color(notification.colorValue),
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackAvatar(AppNotification notification) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: Color(notification.colorValue),
        borderRadius: BorderRadius.circular(25),
      ),
      child: Center(
        child: notification.fromUser != null
            ? Text(
                '${notification.fromUser!.firstName[0]}${notification.fromUser!.lastName[0]}',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              )
            : Text(
                notification.iconPath,
                style: const TextStyle(fontSize: 20),
              ),
      ),
    );
  }

  void _handleNotificationTap(
      BuildContext context, AppNotification notification) {
    switch (notification.type) {
      case NotificationType.newMessage:
        final conversationId = notification.data?['conversationId'];
        if (conversationId != null) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) =>
                  ChatDetailScreen(conversationId: conversationId),
            ),
          );
        }
        break;

      case NotificationType.chatRequest:
        _showChatRequestDialog(context, notification);
        break;

      case NotificationType.travelMatch:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Opening travel matches...')),
        );
        break;

      case NotificationType.flightUpdate:
        _showFlightUpdateDialog(context, notification);
        break;

      case NotificationType.layoverMatch:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Opening layover details...')),
        );
        break;

      case NotificationType.systemUpdate:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(notification.message)),
        );
        break;
    }
  }

  void _acceptChatRequest(BuildContext context, AppNotification notification) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Chat request from ${notification.fromUser?.firstName} accepted!'),
        backgroundColor: const Color(0xFF25D097),
        action: SnackBarAction(
          label: 'Open Chat',
          textColor: Colors.white,
          onPressed: () {
            final conversationId = notification.data?['conversationId'] ??
                'conv_${notification.fromUser?.id}';
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) =>
                    ChatDetailScreen(conversationId: conversationId),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showChatRequestDialog(
      BuildContext context, AppNotification notification) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Chat Request from ${notification.fromUser?.firstName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (notification.fromUser != null) ...[
              CircleAvatar(
                radius: 30,
                backgroundImage: notification.fromUser!.profileImage != null
                    ? NetworkImage(notification.fromUser!.profileImage!)
                    : null,
                child: notification.fromUser!.profileImage == null
                    ? Text(
                        '${notification.fromUser!.firstName[0]}${notification.fromUser!.lastName[0]}')
                    : null,
              ),
              const SizedBox(height: 16),
            ],
            Text(notification.message, textAlign: TextAlign.center),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Decline'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _acceptChatRequest(context, notification);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D097)),
            child: const Text('Accept', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showFlightUpdateDialog(
      BuildContext context, AppNotification notification) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.flight_takeoff, color: Color(0xFF25D097)),
            SizedBox(width: 8),
            Text('Flight Update'),
          ],
        ),
        content: Text(notification.message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
          if (notification.data?['flightNumber'] != null)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                      content: Text(
                          'Opening flight ${notification.data!['flightNumber']} details...')),
                );
              },
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D097)),
              child: const Text('View Flight',
                  style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
    );
  }
}
