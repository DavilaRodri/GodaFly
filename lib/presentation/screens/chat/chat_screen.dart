import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/chat_provider.dart';
import 'chat_detail_screen.dart';

class ChatScreen extends ConsumerWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversations = ref.watch(conversationsProvider);
    final unreadCount = ref.watch(unreadCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Messages'),
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
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Search conversations coming soon!')),
              );
            },
          ),
        ],
      ),
      body: conversations.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No conversations yet',
                      style: TextStyle(fontSize: 18, color: Colors.grey)),
                  Text('Start chatting with fellow travelers!',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : ListView.builder(
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                final conversation = conversations[index];
                return _buildConversationCard(context, ref, conversation);
              },
            ),
    );
  }

  Widget _buildConversationCard(
      BuildContext context, WidgetRef ref, ChatConversation conversation) {
    final lastMessage = conversation.lastMessage;
    final timeDiff = DateTime.now().difference(conversation.lastActivity);

    String timeText;
    if (timeDiff.inMinutes < 60) {
      timeText = '${timeDiff.inMinutes}m';
    } else if (timeDiff.inHours < 24) {
      timeText = '${timeDiff.inHours}h';
    } else {
      timeText = '${timeDiff.inDays}d';
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: Stack(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundImage: conversation.otherUser.profileImage != null
                  ? NetworkImage(conversation.otherUser.profileImage!)
                  : null,
              child: conversation.otherUser.profileImage == null
                  ? Text(
                      '${conversation.otherUser.firstName[0]}${conversation.otherUser.lastName[0]}',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    )
                  : null,
            ),
            if (conversation.isActive)
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: const Color(0xFF25D097),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
          ],
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                '${conversation.otherUser.firstName} ${conversation.otherUser.lastName}',
                style: TextStyle(
                  fontWeight: conversation.unreadCount > 0
                      ? FontWeight.bold
                      : FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ),
            Text(
              timeText,
              style: TextStyle(
                color: conversation.unreadCount > 0
                    ? const Color(0xFF25D097)
                    : Colors.grey,
                fontSize: 12,
                fontWeight: conversation.unreadCount > 0
                    ? FontWeight.bold
                    : FontWeight.normal,
              ),
            ),
          ],
        ),
        subtitle: Row(
          children: [
            Expanded(
              child: Text(
                lastMessage?.content ?? 'No messages yet',
                style: TextStyle(
                  color: conversation.unreadCount > 0
                      ? Colors.black87
                      : Colors.grey.shade600,
                  fontWeight: conversation.unreadCount > 0
                      ? FontWeight.w500
                      : FontWeight.normal,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (conversation.unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF25D097),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${conversation.unreadCount}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        onTap: () {
          // Marcar como leído al abrir
          ref
              .read(chatNotifierProvider.notifier)
              .markConversationAsRead(conversation.id);

          // Navegar al chat individual
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) =>
                  ChatDetailScreen(conversationId: conversation.id),
            ),
          );
        },
        onLongPress: () {
          _showConversationOptions(context, conversation);
        },
      ),
    );
  }

  void _showConversationOptions(
      BuildContext context, ChatConversation conversation) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          ListTile(
            leading: CircleAvatar(
              backgroundImage: conversation.otherUser.profileImage != null
                  ? NetworkImage(conversation.otherUser.profileImage!)
                  : null,
              child: conversation.otherUser.profileImage == null
                  ? Text(
                      '${conversation.otherUser.firstName[0]}${conversation.otherUser.lastName[0]}')
                  : null,
            ),
            title: Text(
                '${conversation.otherUser.firstName} ${conversation.otherUser.lastName}'),
            subtitle: const Text('Conversation options'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.person, color: Color(0xFF25D097)),
            title: const Text('View Profile'),
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(
                        'Viewing ${conversation.otherUser.firstName}\'s profile...')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.notifications_off, color: Colors.orange),
            title: const Text('Mute Notifications'),
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text('Muted ${conversation.otherUser.firstName}')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.delete, color: Colors.red),
            title: const Text('Delete Conversation',
                style: TextStyle(color: Colors.red)),
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Delete conversation coming soon')),
              );
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
