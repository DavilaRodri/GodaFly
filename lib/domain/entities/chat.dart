import 'user.dart';

class ChatThread {
  final String id;
  final User otherUser;
  final Message? lastMessage;
  final int unreadCount;
  final ChatStatus status;
  final DateTime? createdAt;

  const ChatThread({
    required this.id,
    required this.otherUser,
    this.lastMessage,
    this.unreadCount = 0,
    this.status = ChatStatus.active,
    this.createdAt,
  });

  factory ChatThread.fromJson(Map<String, dynamic> json) {
    return ChatThread(
      id: json['id'] as String,
      otherUser: User.fromJson(json['otherUser']),
      lastMessage: json['lastMessage'] != null
          ? Message.fromJson(json['lastMessage'])
          : null,
      unreadCount: json['unreadCount'] as int? ?? 0,
      status: ChatStatus.values.firstWhere((e) => e.name == json['status'],
          orElse: () => ChatStatus.active),
      createdAt:
          json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'otherUser': otherUser.toJson(),
      'lastMessage': lastMessage?.toJson(),
      'unreadCount': unreadCount,
      'status': status.name,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

class Message {
  final String id;
  final String senderId;
  final String receiverId;
  final String content;
  final MessageType type;
  final bool isRead;
  final DateTime? createdAt;

  const Message({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.content,
    this.type = MessageType.text,
    this.isRead = false,
    this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      receiverId: json['receiverId'] as String,
      content: json['content'] as String,
      type: MessageType.values.firstWhere((e) => e.name == json['type'],
          orElse: () => MessageType.text),
      isRead: json['isRead'] as bool? ?? false,
      createdAt:
          json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'receiverId': receiverId,
      'content': content,
      'type': type.name,
      'isRead': isRead,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

class ChatRequest {
  final String id;
  final User requester;
  final User receiver;
  final RequestStatus status;
  final String? message;
  final DateTime? createdAt;

  const ChatRequest({
    required this.id,
    required this.requester,
    required this.receiver,
    this.status = RequestStatus.pending,
    this.message,
    this.createdAt,
  });

  factory ChatRequest.fromJson(Map<String, dynamic> json) {
    return ChatRequest(
      id: json['id'] as String,
      requester: User.fromJson(json['requester']),
      receiver: User.fromJson(json['receiver']),
      status: RequestStatus.values.firstWhere((e) => e.name == json['status'],
          orElse: () => RequestStatus.pending),
      message: json['message'] as String?,
      createdAt:
          json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requester': requester.toJson(),
      'receiver': receiver.toJson(),
      'status': status.name,
      'message': message,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

enum ChatStatus {
  active,
  blocked,
  deleted,
}

enum MessageType {
  text,
  image,
  system,
}

enum RequestStatus {
  pending,
  accepted,
  rejected,
  expired,
}
