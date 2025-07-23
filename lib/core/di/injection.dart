import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

// Global instances - We'll use these for now, later we can use GetIt or Riverpod's providers
late Dio dio;
late Box appBox;
late FlutterSecureStorage secureStorage;

Future<void> setupDI() async {
  // Initialize Hive box
  appBox = await Hive.openBox('godafly_box');

  // Initialize secure storage
  secureStorage = const FlutterSecureStorage();

  // Initialize Dio
  dio = Dio();
  dio.options = BaseOptions(
    baseUrl: 'https://godafly.info/api/V1/',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  );

  // Add interceptors in debug mode
  // if (kDebugMode) {
  //   dio.interceptors.add(PrettyDioLogger(
  //     requestHeader: true,
  //     requestBody: true,
  //     responseBody: true,
  //     responseHeader: false,
  //     error: true,
  //     compact: true,
  //   ));
  // }

  // Add auth interceptor
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token if available
        final token = await secureStorage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 errors globally
        if (error.response?.statusCode == 401) {
          // Clear token and redirect to login
          await secureStorage.delete(key: 'auth_token');
          // TODO: Navigate to login screen
        }
        handler.next(error);
      },
    ),
  );

  print('✅ Dependency Injection setup completed');
}
