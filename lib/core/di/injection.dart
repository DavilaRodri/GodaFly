import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

// Configuración de dependencias simplificada
class DependencyInjection {
  static Future<void> init() async {
    // Inicializar Hive
    await Hive.initFlutter();
    print('📦 Hive initialized');
  }

  // Método para limpiar recursos
  static Future<void> dispose() async {
    await Hive.close();
    print('📦 Hive closed');
  }
}

// Providers básicos
final hiveProvider = Provider<HiveInterface>((ref) {
  return Hive;
});

// Storage providers
final userStorageProvider = Provider<Box?>((ref) {
  try {
    return Hive.box('user_storage');
  } catch (e) {
    print('❌ Error opening user storage box: $e');
    return null;
  }
});

final settingsStorageProvider = Provider<Box?>((ref) {
  try {
    return Hive.box('settings_storage');
  } catch (e) {
    print('❌ Error opening settings storage box: $e');
    return null;
  }
});

// Inicializar boxes de Hive si no existen
final initializeStorageProvider = FutureProvider<void>((ref) async {
  try {
    // Abrir boxes principales si no están abiertos
    if (!Hive.isBoxOpen('user_storage')) {
      await Hive.openBox('user_storage');
    }

    if (!Hive.isBoxOpen('settings_storage')) {
      await Hive.openBox('settings_storage');
    }

    print('✅ Storage boxes initialized');
  } catch (e) {
    print('❌ Error initializing storage: $e');
    throw Exception('Failed to initialize storage: $e');
  }
});

// Provider para configuración de la app
final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig();
});

// Clase de configuración básica
class AppConfig {
  static const String appName = 'GodaFly';
  static const String version = '1.0.0';
  static const bool debugMode = true;

  // URLs base para desarrollo vs producción
  static const String devBaseUrl = 'https://dev-api.godafly.com';
  static const String prodBaseUrl = 'https://api.godafly.com';

  String get baseUrl => debugMode ? devBaseUrl : prodBaseUrl;

  // Configuraciones de timeout
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // Configuraciones de cache
  static const Duration cacheMaxAge = Duration(hours: 1);
  static const int maxCacheSize = 100 * 1024 * 1024; // 100MB
}

// Provider para logging
final loggerProvider = Provider<AppLogger>((ref) {
  return AppLogger();
});

class AppLogger {
  void info(String message) {
    if (AppConfig.debugMode) {
      print('ℹ️ INFO: $message');
    }
  }

  void error(String message, [Object? error, StackTrace? stackTrace]) {
    print('❌ ERROR: $message');
    if (error != null) print('Error details: $error');
    if (stackTrace != null && AppConfig.debugMode) {
      print('Stack trace: $stackTrace');
    }
  }

  void warning(String message) {
    if (AppConfig.debugMode) {
      print('⚠️ WARNING: $message');
    }
  }

  void debug(String message) {
    if (AppConfig.debugMode) {
      print('🔍 DEBUG: $message');
    }
  }
}
