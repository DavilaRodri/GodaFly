import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly/domain/entities/user.dart';
import 'package:hive_flutter/hive_flutter.dart';

// Provider para el box de Hive
final userBoxProvider = Provider<Box>((ref) {
  return Hive.box('user_storage');
});

// Estados del auth
class AuthState {
  final User? currentUser;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.currentUser,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? currentUser,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      currentUser: currentUser ?? this.currentUser,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Notifier del auth
class AuthNotifier extends StateNotifier<AuthState> {
  final Box _userBox;

  AuthNotifier(this._userBox) : super(const AuthState()) {
    _loadSavedUser();
  }

  void _loadSavedUser() {
    try {
      final userData = _userBox.get('current_user');
      if (userData != null) {
        final user = User.fromJson(Map<String, dynamic>.from(userData));
        state = state.copyWith(currentUser: user);
        print('✅ Loaded saved user: ${user.email}');
      }
    } catch (e) {
      print('❌ Error loading saved user: $e');
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Simular delay de login
      await Future.delayed(const Duration(seconds: 1));

      // Mock login - en producción aquí iría la llamada a la API
      if (email.isNotEmpty && password.isNotEmpty) {
        final user = User(
          id: '1',
          email: email,
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Travel enthusiast from the mock login',
          profileImage: null,
          interests: [
            Interest(id: '1', name: 'Adventure'),
            Interest(id: '2', name: 'Culture'),
          ],
          createdAt: DateTime.now(),
        );

        // Guardar usuario en storage
        await _userBox.put('current_user', user.toJson());

        state = state.copyWith(
          currentUser: user,
          isLoading: false,
        );

        print('✅ Login successful for: $email');
      } else {
        throw Exception('Invalid credentials');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      print('❌ Login error: $e');
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? bio,
    List<Interest> interests = const [],
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Simular delay de registro
      await Future.delayed(const Duration(seconds: 1));

      final user = User(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        email: email,
        firstName: firstName,
        lastName: lastName,
        bio: bio ?? 'New traveler ready for adventures!',
        profileImage: null,
        interests: interests,
        createdAt: DateTime.now(),
      );

      // Guardar usuario en storage
      await _userBox.put('current_user', user.toJson());

      state = state.copyWith(
        currentUser: user,
        isLoading: false,
      );

      print('✅ Registration successful for: $email');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      print('❌ Registration error: $e');
    }
  }

  Future<void> logout() async {
    try {
      await _userBox.delete('current_user');
      state = const AuthState();
      print('✅ Logout successful');
    } catch (e) {
      print('❌ Logout error: $e');
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Provider principal del auth
final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final userBox = ref.watch(userBoxProvider);
  return AuthNotifier(userBox);
});

// Providers de conveniencia
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authNotifierProvider).currentUser;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).currentUser != null;
});

final isAuthLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).isLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authNotifierProvider).error;
});
