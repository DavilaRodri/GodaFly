class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? mobile;
  final String? profileImage;
  final DateTime? dateOfBirth;
  final String? bio;
  final List<Interest> interests;
  final List<UserImage> images;
  final bool isProfileComplete;
  final AuthType authType;

  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.mobile,
    this.profileImage,
    this.dateOfBirth,
    this.bio,
    this.interests = const [],
    this.images = const [],
    this.isProfileComplete = false,
    this.authType = AuthType.email,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      mobile: json['mobile'] as String?,
      profileImage: json['profileImage'] as String?,
      dateOfBirth: json['dateOfBirth'] != null
          ? DateTime.parse(json['dateOfBirth'])
          : null,
      bio: json['bio'] as String?,
      interests: (json['interests'] as List<dynamic>?)
              ?.map((e) => Interest.fromJson(e))
              .toList() ??
          [],
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => UserImage.fromJson(e))
              .toList() ??
          [],
      isProfileComplete: json['isProfileComplete'] as bool? ?? false,
      authType: AuthType.values.firstWhere((e) => e.name == json['authType'],
          orElse: () => AuthType.email),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'mobile': mobile,
      'profileImage': profileImage,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'bio': bio,
      'interests': interests.map((e) => e.toJson()).toList(),
      'images': images.map((e) => e.toJson()).toList(),
      'isProfileComplete': isProfileComplete,
      'authType': authType.name,
    };
  }
}

class Interest {
  final String id;
  final String name;
  final bool isSelected;

  const Interest({
    required this.id,
    required this.name,
    this.isSelected = false,
  });

  factory Interest.fromJson(Map<String, dynamic> json) {
    return Interest(
      id: json['id'] as String,
      name: json['name'] as String,
      isSelected: json['isSelected'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isSelected': isSelected,
    };
  }
}

class UserImage {
  final String id;
  final String imageUrl;
  final bool isProfileImage;

  const UserImage({
    required this.id,
    required this.imageUrl,
    this.isProfileImage = false,
  });

  factory UserImage.fromJson(Map<String, dynamic> json) {
    return UserImage(
      id: json['id'] as String,
      imageUrl: json['imageUrl'] as String,
      isProfileImage: json['isProfileImage'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'isProfileImage': isProfileImage,
    };
  }
}

enum AuthType {
  email,
  facebook,
  apple,
}
