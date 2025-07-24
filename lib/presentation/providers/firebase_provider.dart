import 'package:firebase_auth/firebase_auth.dart';
import 'package:godafly/data/models/firestore_models.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class FirebaseAuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream del usuario actual
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  // Usuario actual
  User? get currentUser => _firebaseAuth.currentUser;

  // Registrar con email y contraseña
  Future<UserCredential?> signUpWithEmailAndPassword({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? bio,
    List<String> interests = const [],
  }) async {
    try {
      print('🔐 Registering user with email: $email');

      final credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Crear perfil de usuario en Firestore
        await _createUserProfile(
          user: credential.user!,
          firstName: firstName,
          lastName: lastName,
          bio: bio,
          interests: interests,
        );

        // Actualizar display name
        await credential.user!.updateDisplayName('$firstName $lastName');

        print('✅ User registered successfully: ${credential.user!.uid}');
      }

      return credential;
    } on FirebaseAuthException catch (e) {
      print('❌ Firebase Auth Error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      print('❌ Unexpected error during registration: $e');
      throw Exception('Registration failed: $e');
    }
  }

  // Iniciar sesión con email y contraseña
  Future<UserCredential?> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      print('🔐 Signing in user with email: $email');

      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Actualizar estado online
        await _updateUserPresence(credential.user!.uid, isOnline: true);
        print('✅ User signed in successfully: ${credential.user!.uid}');
      }

      return credential;
    } on FirebaseAuthException catch (e) {
      print('❌ Firebase Auth Error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      print('❌ Unexpected error during sign in: $e');
      throw Exception('Sign in failed: $e');
    }
  }

  // Iniciar sesión con Google
  Future<UserCredential?> signInWithGoogle() async {
    try {
      print('🔐 Starting Google Sign In');

      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        print('❌ Google Sign In cancelled by user');
        return null;
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential =
          await _firebaseAuth.signInWithCredential(credential);

      if (userCredential.user != null) {
        // Verificar si es primera vez que inicia sesión
        final userDoc = await _firestore
            .collection('users')
            .doc(userCredential.user!.uid)
            .get();

        if (!userDoc.exists) {
          // Crear perfil para nuevo usuario de Google
          final nameParts = (userCredential.user!.displayName ?? '').split(' ');
          await _createUserProfile(
            user: userCredential.user!,
            firstName: nameParts.isNotEmpty ? nameParts.first : 'User',
            lastName: nameParts.length > 1 ? nameParts.skip(1).join(' ') : '',
          );
        } else {
          // Actualizar estado online para usuario existente
          await _updateUserPresence(userCredential.user!.uid, isOnline: true);
        }

        print('✅ Google Sign In successful: ${userCredential.user!.uid}');
      }

      return userCredential;
    } catch (e) {
      print('❌ Google Sign In error: $e');
      throw Exception('Google Sign In failed: $e');
    }
  }

  // Cerrar sesión
  Future<void> signOut() async {
    try {
      final user = currentUser;
      if (user != null) {
        // Actualizar estado offline antes de cerrar sesión
        await _updateUserPresence(user.uid, isOnline: false);
      }

      await Future.wait([
        _firebaseAuth.signOut(),
        _googleSignIn.signOut(),
      ]);

      print('✅ User signed out successfully');
    } catch (e) {
      print('❌ Sign out error: $e');
      throw Exception('Sign out failed: $e');
    }
  }

  // Restablecer contraseña
  Future<void> resetPassword(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
      print('✅ Password reset email sent to: $email');
    } on FirebaseAuthException catch (e) {
      print('❌ Password reset error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    }
  }

  // Eliminar cuenta
  Future<void> deleteAccount() async {
    try {
      final user = currentUser;
      if (user == null) throw Exception('No user signed in');

      // Eliminar datos del usuario de Firestore
      await _firestore.collection('users').doc(user.uid).delete();

      // Eliminar cuenta de Firebase Auth
      await user.delete();

      print('✅ Account deleted successfully');
    } catch (e) {
      print('❌ Delete account error: $e');
      throw Exception('Delete account failed: $e');
    }
  }

  // Obtener perfil de usuario desde Firestore
  Future<FirebaseUser?> getUserProfile(String userId) async {
    try {
      final doc = await _firestore.collection('users').doc(userId).get();
      if (doc.exists) {
        return FirebaseUser.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('❌ Error getting user profile: $e');
      return null;
    }
  }

  // Stream del perfil de usuario
  Stream<FirebaseUser?> getUserProfileStream(String userId) {
    return _firestore
        .collection('users')
        .doc(userId)
        .snapshots()
        .map((doc) => doc.exists ? FirebaseUser.fromFirestore(doc) : null);
  }

  // Actualizar perfil de usuario
  Future<void> updateUserProfile({
    required String userId,
    String? firstName,
    String? lastName,
    String? bio,
    String? profileImageUrl,
    List<String>? interests,
  }) async {
    try {
      final updateData = <String, dynamic>{
        'updatedAt': FieldValue.serverTimestamp(),
        'lastSeen': FieldValue.serverTimestamp(),
      };

      if (firstName != null) updateData['firstName'] = firstName;
      if (lastName != null) updateData['lastName'] = lastName;
      if (bio != null) updateData['bio'] = bio;
      if (profileImageUrl != null)
        updateData['profileImageUrl'] = profileImageUrl;
      if (interests != null) updateData['interests'] = interests;

      await _firestore.collection('users').doc(userId).update(updateData);

      // Actualizar también en Firebase Auth si es necesario
      if (firstName != null || lastName != null) {
        final displayName = '${firstName ?? ''} ${lastName ?? ''}'.trim();
        await currentUser?.updateDisplayName(displayName);
      }

      print('✅ User profile updated successfully');
    } catch (e) {
      print('❌ Error updating user profile: $e');
      throw Exception('Update profile failed: $e');
    }
  }

  // Crear perfil de usuario en Firestore
  Future<void> _createUserProfile({
    required User user,
    required String firstName,
    required String lastName,
    String? bio,
    List<String> interests = const [],
  }) async {
    final firebaseUser = FirebaseUser(
      id: user.uid,
      email: user.email ?? '',
      firstName: firstName,
      lastName: lastName,
      bio: bio,
      profileImageUrl: user.photoURL,
      interests: interests,
      createdAt: DateTime.now(),
      lastSeen: DateTime.now(),
      isOnline: true,
    );

    await _firestore
        .collection('users')
        .doc(user.uid)
        .set(firebaseUser.toFirestore());

    print('✅ User profile created in Firestore');
  }

  // Actualizar presencia del usuario
  Future<void> _updateUserPresence(String userId,
      {required bool isOnline}) async {
    try {
      await _firestore.collection('users').doc(userId).update({
        'isOnline': isOnline,
        'lastSeen': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('❌ Error updating user presence: $e');
    }
  }

  // Manejar excepciones de Firebase Auth
  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found for that email.';
      case 'wrong-password':
        return 'Wrong password provided.';
      case 'email-already-in-use':
        return 'The account already exists for that email.';
      case 'weak-password':
        return 'The password provided is too weak.';
      case 'invalid-email':
        return 'The email address is not valid.';
      case 'user-disabled':
        return 'This user account has been disabled.';
      case 'too-many-requests':
        return 'Too many requests. Try again later.';
      case 'operation-not-allowed':
        return 'Signing in with Email and Password is not enabled.';
      case 'invalid-credential':
        return 'The provided credentials are invalid.';
      default:
        return 'An authentication error occurred: ${e.message}';
    }
  }

  // Verificar si el email está verificado
  bool get isEmailVerified => currentUser?.emailVerified ?? false;

  // Enviar email de verificación
  Future<void> sendEmailVerification() async {
    try {
      await currentUser?.sendEmailVerification();
      print('✅ Verification email sent');
    } catch (e) {
      print('❌ Error sending verification email: $e');
      throw Exception('Failed to send verification email: $e');
    }
  }

  // Recargar usuario actual
  Future<void> reloadUser() async {
    try {
      await currentUser?.reload();
    } catch (e) {
      print('❌ Error reloading user: $e');
    }
  }

  // Cambiar contraseña
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final user = currentUser;
      if (user == null) throw Exception('No user signed in');

      // Re-autenticar usuario
      final credential = EmailAuthProvider.credential(
        email: user.email!,
        password: currentPassword,
      );

      await user.reauthenticateWithCredential(credential);

      // Cambiar contraseña
      await user.updatePassword(newPassword);

      print('✅ Password changed successfully');
    } on FirebaseAuthException catch (e) {
      print('❌ Change password error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    }
  }

  // Vincular cuenta con Google
  Future<UserCredential?> linkWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await currentUser?.linkWithCredential(credential);
      print('✅ Account linked with Google successfully');

      return userCredential;
    } catch (e) {
      print('❌ Link with Google error: $e');
      throw Exception('Failed to link with Google: $e');
    }
  }

  // Desvincular proveedor
  Future<void> unlinkProvider(String providerId) async {
    try {
      await currentUser?.unlink(providerId);
      print('✅ Provider $providerId unlinked successfully');
    } catch (e) {
      print('❌ Unlink provider error: $e');
      throw Exception('Failed to unlink provider: $e');
    }
  }
}
