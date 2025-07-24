import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly_flutter/data/service/amadeus_service.dart';

// Estado de búsqueda de vuelos
class FlightSearchState {
  final List<FlightOffer> offers;
  final bool isLoading;
  final String? error;
  final String? lastSearchQuery;

  const FlightSearchState({
    this.offers = const [],
    this.isLoading = false,
    this.error,
    this.lastSearchQuery,
  });

  FlightSearchState copyWith({
    List<FlightOffer>? offers,
    bool? isLoading,
    String? error,
    String? lastSearchQuery,
  }) {
    return FlightSearchState(
      offers: offers ?? this.offers,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      lastSearchQuery: lastSearchQuery ?? this.lastSearchQuery,
    );
  }
}

// Estado de aeropuertos
class AirportSearchState {
  final List<Airport> airports;
  final bool isLoading;
  final String? error;

  const AirportSearchState({
    this.airports = const [],
    this.isLoading = false,
    this.error,
  });

  AirportSearchState copyWith({
    List<Airport>? airports,
    bool? isLoading,
    String? error,
  }) {
    return AirportSearchState(
      airports: airports ?? this.airports,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Notifier para búsqueda de vuelos
class FlightSearchNotifier extends StateNotifier<FlightSearchState> {
  final AmadeusService _amadeusService;

  FlightSearchNotifier(this._amadeusService) : super(const FlightSearchState());

  Future<void> searchFlights({
    required String origin,
    required String destination,
    required DateTime departureDate,
    DateTime? returnDate,
    int adults = 1,
    String travelClass = 'ECONOMY',
  }) async {
    state = state.copyWith(
      isLoading: true,
      error: null,
      lastSearchQuery: '$origin → $destination',
    );

    try {
      final offers = await _amadeusService.searchFlights(
        origin: origin,
        destination: destination,
        departureDate: departureDate,
        returnDate: returnDate,
        adults: adults,
        travelClass: travelClass,
      );

      // Simular delay para mostrar loading
      await Future.delayed(const Duration(milliseconds: 800));

      state = state.copyWith(
        offers: offers,
        isLoading: false,
      );

      print('✅ Found ${offers.length} flight offers');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to search flights: $e',
      );
      print('❌ Flight search error: $e');
    }
  }

  void clearResults() {
    state = const FlightSearchState();
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Notifier para búsqueda de aeropuertos
class AirportSearchNotifier extends StateNotifier<AirportSearchState> {
  final AmadeusService _amadeusService;

  AirportSearchNotifier(this._amadeusService)
      : super(const AirportSearchState());

  Future<void> searchAirports(String query) async {
    if (query.length < 2) {
      state = const AirportSearchState();
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final airports = await _amadeusService.searchAirports(query);

      state = state.copyWith(
        airports: airports,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to search airports: $e',
      );
    }
  }

  void clearResults() {
    state = const AirportSearchState();
  }
}

// Providers
final amadeusServiceProvider = Provider<AmadeusService>((ref) {
  return AmadeusService();
});

final flightSearchNotifierProvider =
    StateNotifierProvider<FlightSearchNotifier, FlightSearchState>((ref) {
  final amadeusService = ref.watch(amadeusServiceProvider);
  return FlightSearchNotifier(amadeusService);
});

final airportSearchNotifierProvider =
    StateNotifierProvider<AirportSearchNotifier, AirportSearchState>((ref) {
  final amadeusService = ref.watch(amadeusServiceProvider);
  return AirportSearchNotifier(amadeusService);
});

// Helper providers
final flightOffersProvider = Provider<List<FlightOffer>>((ref) {
  return ref.watch(flightSearchNotifierProvider).offers;
});

final isFlightSearchLoadingProvider = Provider<bool>((ref) {
  return ref.watch(flightSearchNotifierProvider).isLoading;
});

final flightSearchErrorProvider = Provider<String?>((ref) {
  return ref.watch(flightSearchNotifierProvider).error;
});

final airportSuggestionsProvider = Provider<List<Airport>>((ref) {
  return ref.watch(airportSearchNotifierProvider).airports;
});

final isAirportSearchLoadingProvider = Provider<bool>((ref) {
  return ref.watch(airportSearchNotifierProvider).isLoading;
});
