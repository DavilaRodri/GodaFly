import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/user.dart';

// Entidades del Chat
class ChatMessage {
  final String id;
  final String senderId;
  final String content;
  final DateTime timestamp;
  final bool isRead;
  final MessageType type;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.content,
    required this.timestamp,
    this.isRead = false,
    this.type = MessageType.text,
  });

  ChatMessage copyWith({
    String? id,
    String? senderId,
    String? content,
    DateTime? timestamp,
    bool? isRead,
    MessageType? type,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      senderId: senderId ?? this.senderId,
      content: content ?? this.content,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      type: type ?? this.type,
    );
  }
}

enum MessageType { text, image, system }

class ChatConversation {
  final String id;
  final User otherUser;
  final List<ChatMessage> messages;
  final DateTime lastActivity;
  final int unreadCount;
  final bool isActive;

  const ChatConversation({
    required this.id,
    required this.otherUser,
    required this.messages,
    required this.lastActivity,
    this.unreadCount = 0,
    this.isActive = true,
  });

  ChatMessage? get lastMessage => messages.isNotEmpty ? messages.last : null;

  ChatConversation copyWith({
    String? id,
    User? otherUser,
    List<ChatMessage>? messages,
    DateTime? lastActivity,
    int? unreadCount,
    bool? isActive,
  }) {
    return ChatConversation(
      id: id ?? this.id,
      otherUser: otherUser ?? this.otherUser,
      messages: messages ?? this.messages,
      lastActivity: lastActivity ?? this.lastActivity,
      unreadCount: unreadCount ?? this.unreadCount,
      isActive: isActive ?? this.isActive,
    );
  }
}

// Estado del Chat
class ChatState {
  final List<ChatConversation> conversations;
  final Map<String, List<ChatMessage>> messagesByConversation;
  final bool isLoading;
  final String? error;

  const ChatState({
    this.conversations = const [],
    this.messagesByConversation = const {},
    this.isLoading = false,
    this.error,
  });

  ChatState copyWith({
    List<ChatConversation>? conversations,
    Map<String, List<ChatMessage>>? messagesByConversation,
    bool? isLoading,
    String? error,
  }) {
    return ChatState(
      conversations: conversations ?? this.conversations,
      messagesByConversation:
          messagesByConversation ?? this.messagesByConversation,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  int get totalUnreadCount =>
      conversations.fold(0, (sum, conv) => sum + conv.unreadCount);
}

// Chat Provider
class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier() : super(const ChatState()) {
    _initializeMockChats();
  }

  void _initializeMockChats() {
    // Usuarios simulados para conversaciones
    final mockUsers = [
      User(
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        profileImage:
            'https://ui-avatars.com/api/?name=Sarah+Johnson&background=FF6B6B&color=fff',
        bio: 'Digital nomad traveling the world 🌎',
        interests: [
          const Interest(id: '1', name: 'Travel', isSelected: true),
          const Interest(id: '2', name: 'Photography', isSelected: true),
        ],
        authType: AuthType.email,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
      ),
      User(
        id: '3',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@example.com',
        profileImage:
            'https://ui-avatars.com/api/?name=Mike+Chen&background=4ECDC4&color=fff',
        bio: 'Software engineer who loves exploring new cultures',
        interests: [
          const Interest(id: '1', name: 'Technology', isSelected: true),
          const Interest(id: '2', name: 'Food', isSelected: true),
        ],
        authType: AuthType.email,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
      ),
      User(
        id: '4',
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma@example.com',
        profileImage:
            'https://ui-avatars.com/api/?name=Emma+Wilson&background=95E1D3&color=fff',
        bio: 'Adventure seeker and coffee enthusiast ☕',
        interests: [
          const Interest(id: '1', name: 'Adventure', isSelected: true),
          const Interest(id: '2', name: 'Coffee', isSelected: true),
        ],
        authType: AuthType.email,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
      ),
    ];

    final now = DateTime.now();
    final conversations = <ChatConversation>[];

    // Conversación 1 - Sarah (activa con mensajes recientes)
    final sarahMessages = [
      ChatMessage(
        id: '1',
        senderId: '2',
        content: 'Hey! I saw we\'re on the same flight to Paris tomorrow!',
        timestamp: now.subtract(const Duration(hours: 2)),
        isRead: true,
      ),
      ChatMessage(
        id: '2',
        senderId: '1', // Yo
        content: 'That\'s awesome! What time do you get to the airport?',
        timestamp: now.subtract(const Duration(hours: 1, minutes: 45)),
        isRead: true,
      ),
      ChatMessage(
        id: '3',
        senderId: '2',
        content: 'Around 2 PM. Want to meet up for coffee before boarding? ☕',
        timestamp: now.subtract(const Duration(minutes: 30)),
        isRead: false,
      ),
      ChatMessage(
        id: '4',
        senderId: '2',
        content: 'I know a great spot in Terminal 2!',
        timestamp: now.subtract(const Duration(minutes: 25)),
        isRead: false,
      ),
    ];

    conversations.add(ChatConversation(
      id: 'conv_2',
      otherUser: mockUsers[0],
      messages: sarahMessages,
      lastActivity: sarahMessages.last.timestamp,
      unreadCount: 2,
    ));

    // Conversación 2 - Mike (menos reciente)
    final mikeMessages = [
      ChatMessage(
        id: '5',
        senderId: '3',
        content: 'Hi! Are you also doing the layover in Tokyo?',
        timestamp: now.subtract(const Duration(days: 1)),
        isRead: true,
      ),
      ChatMessage(
        id: '6',
        senderId: '1',
        content: 'Yes! 8 hours layover. Any recommendations?',
        timestamp: now.subtract(const Duration(days: 1, hours: -2)),
        isRead: true,
      ),
      ChatMessage(
        id: '7',
        senderId: '3',
        content:
            'Definitely check out the ramen street in Shibuya if you have time to leave the airport!',
        timestamp: now.subtract(const Duration(hours: 12)),
        isRead: true,
      ),
    ];

    conversations.add(ChatConversation(
      id: 'conv_3',
      otherUser: mockUsers[1],
      messages: mikeMessages,
      lastActivity: mikeMessages.last.timestamp,
      unreadCount: 0,
    ));

    // Conversación 3 - Emma (nueva, 1 mensaje)
    final emmaMessages = [
      ChatMessage(
        id: '8',
        senderId: '4',
        content:
            'Thanks for accepting my chat request! Looking forward to our London layover adventure! 🇬🇧',
        timestamp: now.subtract(const Duration(minutes: 5)),
        isRead: false,
      ),
    ];

    conversations.add(ChatConversation(
      id: 'conv_4',
      otherUser: mockUsers[2],
      messages: emmaMessages,
      lastActivity: emmaMessages.last.timestamp,
      unreadCount: 1,
    ));

    // Crear mapa de mensajes por conversación
    final messagesByConversation = <String, List<ChatMessage>>{};
    for (final conv in conversations) {
      messagesByConversation[conv.id] = conv.messages;
    }

    state = state.copyWith(
      conversations: conversations,
      messagesByConversation: messagesByConversation,
    );
  }

  // Enviar mensaje
  void sendMessage(String conversationId, String content) {
    final conversations = [...state.conversations];
    final convIndex = conversations.indexWhere((c) => c.id == conversationId);

    if (convIndex == -1) return;

    final newMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      senderId: '1', // ID del usuario actual
      content: content,
      timestamp: DateTime.now(),
      isRead: true,
    );

    final updatedMessages = [...conversations[convIndex].messages, newMessage];
    conversations[convIndex] = conversations[convIndex].copyWith(
      messages: updatedMessages,
      lastActivity: newMessage.timestamp,
    );

    final updatedMessagesByConversation =
        Map<String, List<ChatMessage>>.from(state.messagesByConversation);
    updatedMessagesByConversation[conversationId] = updatedMessages;

    state = state.copyWith(
      conversations: conversations,
      messagesByConversation: updatedMessagesByConversation,
    );

    // Simular respuesta automática después de 2-5 segundos
    _simulateAutoReply(conversationId);
  }

  // Simular respuesta automática
  void _simulateAutoReply(String conversationId) {
    final delay = Duration(seconds: 2 + (DateTime.now().millisecond % 4));

    Future.delayed(delay, () {
      final conversations = [...state.conversations];
      final convIndex = conversations.indexWhere((c) => c.id == conversationId);

      if (convIndex == -1) return;

      final responses = [
        'That sounds great! 😊',
        'Perfect! Can\'t wait!',
        'Absolutely! See you there!',
        'Thanks for the suggestion!',
        'Awesome, looking forward to it! ✈️',
        'Count me in! 🙌',
        'That works perfectly for me!',
      ];

      final randomResponse =
          responses[DateTime.now().millisecond % responses.length];

      final replyMessage = ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        senderId: conversations[convIndex].otherUser.id,
        content: randomResponse,
        timestamp: DateTime.now(),
        isRead: false,
      );

      final updatedMessages = [
        ...conversations[convIndex].messages,
        replyMessage
      ];
      conversations[convIndex] = conversations[convIndex].copyWith(
        messages: updatedMessages,
        lastActivity: replyMessage.timestamp,
        unreadCount: conversations[convIndex].unreadCount + 1,
      );

      final updatedMessagesByConversation =
          Map<String, List<ChatMessage>>.from(state.messagesByConversation);
      updatedMessagesByConversation[conversationId] = updatedMessages;

      state = state.copyWith(
        conversations: conversations,
        messagesByConversation: updatedMessagesByConversation,
      );
    });
  }

  // Marcar conversación como leída
  void markConversationAsRead(String conversationId) {
    final conversations = [...state.conversations];
    final convIndex = conversations.indexWhere((c) => c.id == conversationId);

    if (convIndex == -1) return;

    // Marcar todos los mensajes como leídos
    final updatedMessages = conversations[convIndex]
        .messages
        .map((msg) => msg.senderId != '1' ? msg.copyWith(isRead: true) : msg)
        .toList();

    conversations[convIndex] = conversations[convIndex].copyWith(
      messages: updatedMessages,
      unreadCount: 0,
    );

    final updatedMessagesByConversation =
        Map<String, List<ChatMessage>>.from(state.messagesByConversation);
    updatedMessagesByConversation[conversationId] = updatedMessages;

    state = state.copyWith(
      conversations: conversations,
      messagesByConversation: updatedMessagesByConversation,
    );
  }

  // Crear nueva conversación
  void createConversation(User otherUser, String initialMessage) {
    final newConversation = ChatConversation(
      id: 'conv_${otherUser.id}',
      otherUser: otherUser,
      messages: [
        ChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          senderId: '1',
          content: initialMessage,
          timestamp: DateTime.now(),
          isRead: true,
        ),
      ],
      lastActivity: DateTime.now(),
      unreadCount: 0,
    );

    final updatedConversations = [newConversation, ...state.conversations];
    final updatedMessagesByConversation =
        Map<String, List<ChatMessage>>.from(state.messagesByConversation);
    updatedMessagesByConversation[newConversation.id] =
        newConversation.messages;

    state = state.copyWith(
      conversations: updatedConversations,
      messagesByConversation: updatedMessagesByConversation,
    );
  }

  // Obtener mensajes de una conversación
  List<ChatMessage> getMessages(String conversationId) {
    return state.messagesByConversation[conversationId] ?? [];
  }

  // Obtener conversación por ID
  ChatConversation? getConversation(String conversationId) {
    return state.conversations.cast<ChatConversation?>().firstWhere(
          (conv) => conv?.id == conversationId,
          orElse: () => null,
        );
  }
}

// Providers
final chatNotifierProvider =
    StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier();
});

final conversationsProvider = Provider<List<ChatConversation>>((ref) {
  return ref.watch(chatNotifierProvider).conversations;
});

final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(chatNotifierProvider).totalUnreadCount;
});

final conversationProvider =
    Provider.family<ChatConversation?, String>((ref, conversationId) {
  return ref
      .watch(chatNotifierProvider.notifier)
      .getConversation(conversationId);
});

final messagesProvider =
    Provider.family<List<ChatMessage>, String>((ref, conversationId) {
  return ref.watch(chatNotifierProvider.notifier).getMessages(conversationId);
});
