import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/user.dart';
import '../../core/di/injection.dart';

// Estados de autenticación
enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

// Estado del auth
class AuthState {
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

// Provider del estado de auth
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _checkAuthStatus();
  }

  // Verificar si hay sesión guardada
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(status: AuthStatus.loading);

    try {
      final token = await secureStorage.read(key: 'auth_token');
      if (token != null && token.isNotEmpty) {
        // Simular obtener usuario del token
        final userData = appBox.get('user_data');
        if (userData != null) {
          final user = User.fromJson(Map<String, dynamic>.from(userData));
          state = state.copyWith(
            status: AuthStatus.authenticated,
            user: user,
          );
        } else {
          state = state.copyWith(status: AuthStatus.unauthenticated);
        }
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Error checking auth status: $e',
      );
    }
  }

  // Login simulado
  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);

    try {
      await Future.delayed(const Duration(seconds: 1)); // Simular API call

      // Usuario simulado
      final user = User(
        id: '1',
        firstName: 'John',
        lastName: 'Traveler',
        email: email,
        mobile: '+1234567890',
        profileImage:
            'https://ui-avatars.com/api/?name=John+Traveler&background=25D097&color=fff',
        dateOfBirth: DateTime(1990, 5, 15),
        bio: 'Love to travel and meet new people!',
        interests: [
          const Interest(id: '1', name: 'Travel', isSelected: true),
          const Interest(id: '2', name: 'Food', isSelected: true),
          const Interest(id: '3', name: 'Photography', isSelected: true),
        ],
        isProfileComplete: true,
        authType: AuthType.email,
      );

      // Guardar token y usuario
      await secureStorage.write(key: 'auth_token', value: 'mock_token_123456');
      await appBox.put('user_data', user.toJson());

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Login failed: $e',
      );
    }
  }

  // Registro simulado
  Future<void> register(
      String firstName, String lastName, String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);

    try {
      await Future.delayed(const Duration(seconds: 1)); // Simular API call

      final user = User(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        profileImage:
            'https://ui-avatars.com/api/?name=$firstName+$lastName&background=25D097&color=fff',
        isProfileComplete: false,
        authType: AuthType.email,
      );

      await secureStorage.write(
          key: 'auth_token', value: 'mock_token_new_user');
      await appBox.put('user_data', user.toJson());

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Registration failed: $e',
      );
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await secureStorage.delete(key: 'auth_token');
      await appBox.delete('user_data');

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        user: null,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Logout failed: $e',
      );
    }
  }

  // Limpiar errores
  void clearError() {
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      errorMessage: null,
    );
  }
}

// Provider principal
final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

// Providers de conveniencia
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authNotifierProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).status == AuthStatus.authenticated;
});

final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).status == AuthStatus.loading;
});
