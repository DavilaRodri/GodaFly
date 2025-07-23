import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/travel.dart';
import '../../domain/entities/user.dart';
import '../../core/di/injection.dart';
import 'dart:math';

// Estado de travels
class TravelState {
  final List<Travel> myTravels;
  final List<User> searchResults;
  final bool isLoading;
  final String? errorMessage;

  const TravelState({
    this.myTravels = const [],
    this.searchResults = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  TravelState copyWith({
    List<Travel>? myTravels,
    List<User>? searchResults,
    bool? isLoading,
    String? errorMessage,
  }) {
    return TravelState(
      myTravels: myTravels ?? this.myTravels,
      searchResults: searchResults ?? this.searchResults,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class TravelNotifier extends StateNotifier<TravelState> {
  TravelNotifier() : super(const TravelState()) {
    _loadMyTravels();
  }

  // Cargar mis viajes guardados
  Future<void> _loadMyTravels() async {
    state = state.copyWith(isLoading: true);

    try {
      final savedTravels = appBox.get('my_travels', defaultValue: <dynamic>[]);
      final travels = (savedTravels as List)
          .map((json) => Travel.fromJson(Map<String, dynamic>.from(json)))
          .toList();

      state = state.copyWith(
        myTravels: travels,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load travels: $e',
      );
    }
  }

  // Buscar por vuelo
  Future<void> searchByFlight(String flightNumber, DateTime date) async {
    state = state.copyWith(isLoading: true);

    try {
      await Future.delayed(const Duration(seconds: 1)); // Simular API call

      // Generar usuarios simulados
      final users = _generateMockUsers(flightNumber);

      // Guardar búsqueda en mis viajes
      final travel = Travel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: TravelType.flight,
        date: date,
        flightNumber: flightNumber,
        startIataCode: _getRandomIataCode(),
        endIataCode: _getRandomIataCode(),
        isSaved: true,
      );

      await _saveTravel(travel);

      state = state.copyWith(
        searchResults: users,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Flight search failed: $e',
      );
    }
  }

  // Buscar por layover
  Future<void> searchByLayover(String cityName, String airportName,
      DateTime date, DateTime arrivalTime, DateTime departureTime) async {
    state = state.copyWith(isLoading: true);

    try {
      await Future.delayed(const Duration(seconds: 1)); // Simular API call

      final users = _generateMockUsers(cityName);

      final travel = Travel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: TravelType.layover,
        date: date,
        cityName: cityName,
        airportName: airportName,
        arrivalTime: arrivalTime,
        departureTime: departureTime,
        isSaved: true,
      );

      await _saveTravel(travel);

      state = state.copyWith(
        searchResults: users,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Layover search failed: $e',
      );
    }
  }

  // Guardar viaje
  Future<void> _saveTravel(Travel travel) async {
    final updatedTravels = [...state.myTravels, travel];
    await appBox.put(
        'my_travels', updatedTravels.map((t) => t.toJson()).toList());

    state = state.copyWith(myTravels: updatedTravels);
  }

  // Eliminar viaje
  Future<void> deleteTravel(String travelId) async {
    final updatedTravels =
        state.myTravels.where((t) => t.id != travelId).toList();
    await appBox.put(
        'my_travels', updatedTravels.map((t) => t.toJson()).toList());

    state = state.copyWith(myTravels: updatedTravels);
  }

  // Generar usuarios simulados
  List<User> _generateMockUsers(String searchTerm) {
    final random = Random();
    final names = [
      ['Emma', 'Johnson'],
      ['Liam', 'Smith'],
      ['Olivia', 'Brown'],
      ['Noah', 'Davis'],
      ['Ava', 'Miller'],
      ['William', 'Wilson'],
      ['Sophia', 'Moore'],
      ['James', 'Taylor'],
      ['Isabella', 'Anderson'],
      ['Benjamin', 'Thomas'],
      ['Charlotte', 'Jackson'],
      ['Lucas', 'White'],
    ];

    final interests = [
      'Travel',
      'Food',
      'Photography',
      'Music',
      'Sports',
      'Art',
      'Books',
      'Movies',
      'Hiking',
      'Dancing',
      'Cooking',
      'Gaming'
    ];

    return List.generate(random.nextInt(8) + 3, (index) {
      final name = names[random.nextInt(names.length)];
      final userInterests = List.generate(
        random.nextInt(4) + 2,
        (i) => Interest(
          id: i.toString(),
          name: interests[random.nextInt(interests.length)],
          isSelected: true,
        ),
      );

      return User(
        id: (index + 1).toString(),
        firstName: name[0],
        lastName: name[1],
        email: '${name[0].toLowerCase()}.${name[1].toLowerCase()}@email.com',
        profileImage:
            'https://ui-avatars.com/api/?name=${name[0]}+${name[1]}&background=${_getRandomColor()}&color=fff',
        dateOfBirth: DateTime(1985 + random.nextInt(20), random.nextInt(12) + 1,
            random.nextInt(28) + 1),
        bio: 'Traveler exploring the world and meeting amazing people!',
        interests: userInterests,
        isProfileComplete: true,
        authType: AuthType.email,
      );
    });
  }

  String _getRandomIataCode() {
    final codes = [
      'JFK',
      'LAX',
      'LHR',
      'CDG',
      'NRT',
      'SYD',
      'DXB',
      'FRA',
      'AMS',
      'MAD'
    ];
    return codes[Random().nextInt(codes.length)];
  }

  String _getRandomColor() {
    final colors = [
      'FF6B6B',
      '4ECDC4',
      '45B7D1',
      '96CEB4',
      'FECA57',
      'FF9FF3',
      '54A0FF'
    ];
    return colors[Random().nextInt(colors.length)];
  }

  void clearSearchResults() {
    state = state.copyWith(searchResults: []);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

// Provider principal
final travelNotifierProvider =
    StateNotifierProvider<TravelNotifier, TravelState>((ref) {
  return TravelNotifier();
});

// Providers de conveniencia
final myTravelsProvider = Provider<List<Travel>>((ref) {
  return ref.watch(travelNotifierProvider).myTravels;
});

final searchResultsProvider = Provider<List<User>>((ref) {
  return ref.watch(travelNotifierProvider).searchResults;
});

final travelLoadingProvider = Provider<bool>((ref) {
  return ref.watch(travelNotifierProvider).isLoading;
});
