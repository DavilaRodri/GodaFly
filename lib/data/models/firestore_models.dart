import 'package:cloud_firestore/cloud_firestore.dart';

// Modelo de Usuario para Firestore
class FirebaseUser {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? bio;
  final String? profileImageUrl;
  final List<String> interests;
  final DateTime createdAt;
  final DateTime lastSeen;
  final bool isOnline;
  final GeoPoint? currentLocation;

  FirebaseUser({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.bio,
    this.profileImageUrl,
    this.interests = const [],
    required this.createdAt,
    required this.lastSeen,
    this.isOnline = false,
    this.currentLocation,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'bio': bio,
      'profileImageUrl': profileImageUrl,
      'interests': interests,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastSeen': Timestamp.fromDate(lastSeen),
      'isOnline': isOnline,
      'currentLocation': currentLocation,
    };
  }

  factory FirebaseUser.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FirebaseUser(
      id: doc.id,
      email: data['email'] ?? '',
      firstName: data['firstName'] ?? '',
      lastName: data['lastName'] ?? '',
      bio: data['bio'],
      profileImageUrl: data['profileImageUrl'],
      interests: List<String>.from(data['interests'] ?? []),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      lastSeen: (data['lastSeen'] as Timestamp).toDate(),
      isOnline: data['isOnline'] ?? false,
      currentLocation: data['currentLocation'] as GeoPoint?,
    );
  }

  FirebaseUser copyWith({
    String? email,
    String? firstName,
    String? lastName,
    String? bio,
    String? profileImageUrl,
    List<String>? interests,
    DateTime? lastSeen,
    bool? isOnline,
    GeoPoint? currentLocation,
  }) {
    return FirebaseUser(
      id: id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      bio: bio ?? this.bio,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      interests: interests ?? this.interests,
      createdAt: createdAt,
      lastSeen: lastSeen ?? this.lastSeen,
      isOnline: isOnline ?? this.isOnline,
      currentLocation: currentLocation ?? this.currentLocation,
    );
  }
}

// Modelo de Viaje para Firestore
class FirebaseTravel {
  final String id;
  final String userId;
  final String type; // 'flight' | 'layover'
  final String title;
  final String originCode;
  final String originName;
  final String destinationCode;
  final String destinationName;
  final DateTime departureTime;
  final DateTime arrivalTime;
  final String? flightNumber;
  final String? airline;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isPublic;

  FirebaseTravel({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.originCode,
    required this.originName,
    required this.destinationCode,
    required this.destinationName,
    required this.departureTime,
    required this.arrivalTime,
    this.flightNumber,
    this.airline,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.isPublic = true,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'type': type,
      'title': title,
      'originCode': originCode,
      'originName': originName,
      'destinationCode': destinationCode,
      'destinationName': destinationName,
      'departureTime': Timestamp.fromDate(departureTime),
      'arrivalTime': Timestamp.fromDate(arrivalTime),
      'flightNumber': flightNumber,
      'airline': airline,
      'metadata': metadata,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'isPublic': isPublic,
    };
  }

  factory FirebaseTravel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FirebaseTravel(
      id: doc.id,
      userId: data['userId'],
      type: data['type'],
      title: data['title'],
      originCode: data['originCode'],
      originName: data['originName'],
      destinationCode: data['destinationCode'],
      destinationName: data['destinationName'],
      departureTime: (data['departureTime'] as Timestamp).toDate(),
      arrivalTime: (data['arrivalTime'] as Timestamp).toDate(),
      flightNumber: data['flightNumber'],
      airline: data['airline'],
      metadata: data['metadata'] as Map<String, dynamic>?,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      isPublic: data['isPublic'] ?? true,
    );
  }
}

// Modelo de Chat para Firestore
class FirebaseChat {
  final String id;
  final List<String> participants;
  final String? lastMessage;
  final String? lastMessageSenderId;
  final DateTime? lastMessageTime;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, int> unreadCount;
  final String? travelId; // Opcional: chat relacionado a un viaje

  FirebaseChat({
    required this.id,
    required this.participants,
    this.lastMessage,
    this.lastMessageSenderId,
    this.lastMessageTime,
    required this.createdAt,
    required this.updatedAt,
    this.unreadCount = const {},
    this.travelId,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'participants': participants,
      'lastMessage': lastMessage,
      'lastMessageSenderId': lastMessageSenderId,
      'lastMessageTime':
          lastMessageTime != null ? Timestamp.fromDate(lastMessageTime!) : null,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'unreadCount': unreadCount,
      'travelId': travelId,
    };
  }

  factory FirebaseChat.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FirebaseChat(
      id: doc.id,
      participants: List<String>.from(data['participants']),
      lastMessage: data['lastMessage'],
      lastMessageSenderId: data['lastMessageSenderId'],
      lastMessageTime: data['lastMessageTime'] != null
          ? (data['lastMessageTime'] as Timestamp).toDate()
          : null,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      unreadCount: Map<String, int>.from(data['unreadCount'] ?? {}),
      travelId: data['travelId'],
    );
  }
}

// Modelo de Mensaje para Firestore
class FirebaseMessage {
  final String id;
  final String chatId;
  final String senderId;
  final String content;
  final MessageType type;
  final DateTime timestamp;
  final bool isRead;
  final String? imageUrl;
  final Map<String, dynamic>? metadata;

  FirebaseMessage({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.content,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.imageUrl,
    this.metadata,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'chatId': chatId,
      'senderId': senderId,
      'content': content,
      'type': type.name,
      'timestamp': Timestamp.fromDate(timestamp),
      'isRead': isRead,
      'imageUrl': imageUrl,
      'metadata': metadata,
    };
  }

  factory FirebaseMessage.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FirebaseMessage(
      id: doc.id,
      chatId: data['chatId'],
      senderId: data['senderId'],
      content: data['content'],
      type: MessageType.values.firstWhere((e) => e.name == data['type'],
          orElse: () => MessageType.text),
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      isRead: data['isRead'] ?? false,
      imageUrl: data['imageUrl'],
      metadata: data['metadata'] as Map<String, dynamic>?,
    );
  }
}

enum MessageType {
  text,
  image,
  location,
  flight_info,
  system,
}

// Modelo de Notificación para Firestore
class FirebaseNotification {
  final String id;
  final String userId;
  final String title;
  final String body;
  final NotificationType type;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic>? data;
  final String? imageUrl;

  FirebaseNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.data,
    this.imageUrl,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'title': title,
      'body': body,
      'type': type.name,
      'timestamp': Timestamp.fromDate(timestamp),
      'isRead': isRead,
      'data': data,
      'imageUrl': imageUrl,
    };
  }

  factory FirebaseNotification.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FirebaseNotification(
      id: doc.id,
      userId: data['userId'],
      title: data['title'],
      body: data['body'],
      type: NotificationType.values.firstWhere((e) => e.name == data['type']),
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      isRead: data['isRead'] ?? false,
      data: data['data'] as Map<String, dynamic>?,
      imageUrl: data['imageUrl'],
    );
  }
}

enum NotificationType {
  chat_message,
  flight_update,
  travel_match,
  system,
  marketing,
}

// Modelo de Match de Viajeros
class FirebaseTravelMatch {
  final String id;
  final String requesterId;
  final String targetUserId;
  final String travelId;
  final MatchStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? message;

  FirebaseTravelMatch({
    required this.id,
    required this.requesterId,
    required this.targetUserId,
    required this.travelId,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.message,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'requesterId': requesterId,
      'targetUserId': targetUserId,
      'travelId': travelId,
      'status': status.name,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'message': message,
    };
  }

  factory FirebaseTravelMatch.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FirebaseTravelMatch(
      id: doc.id,
      requesterId: data['requesterId'],
      targetUserId: data['targetUserId'],
      travelId: data['travelId'],
      status: MatchStatus.values.firstWhere((e) => e.name == data['status']),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      message: data['message'],
    );
  }
}

enum MatchStatus {
  pending,
  accepted,
  rejected,
  cancelled,
}
