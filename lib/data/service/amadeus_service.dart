import 'dart:convert';
import 'package:http/http.dart' as http;

class AmadeusService {
  static const String _baseUrl = 'https://test.api.amadeus.com';
  static const String _clientId = 'YOUR_AMADEUS_CLIENT_ID';
  static const String _clientSecret = 'YOUR_AMADEUS_CLIENT_SECRET';

  String? _accessToken;
  DateTime? _tokenExpiry;

  // Singleton pattern
  static final AmadeusService _instance = AmadeusService._internal();
  factory AmadeusService() => _instance;
  AmadeusService._internal();

  // Obtener token de acceso
  Future<void> _getAccessToken() async {
    if (_accessToken != null &&
        _tokenExpiry != null &&
        DateTime.now().isBefore(_tokenExpiry!)) {
      return; // Token aún válido
    }

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/v1/security/oauth2/token'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          'grant_type': 'client_credentials',
          'client_id': _clientId,
          'client_secret': _clientSecret,
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _accessToken = data['access_token'];
        _tokenExpiry =
            DateTime.now().add(Duration(seconds: data['expires_in'] - 60));
        print('✅ Amadeus token obtained successfully');
      } else {
        throw Exception('Failed to get access token: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error getting Amadeus token: $e');
      // Fallback to mock data
      _accessToken = 'mock_token';
      _tokenExpiry = DateTime.now().add(const Duration(hours: 1));
    }
  }

  // Buscar vuelos
  Future<List<FlightOffer>> searchFlights({
    required String origin,
    required String destination,
    required DateTime departureDate,
    DateTime? returnDate,
    int adults = 1,
    String travelClass = 'ECONOMY',
  }) async {
    await _getAccessToken();

    // Por ahora usar datos mock mientras configuramos las API keys
    return _getMockFlights(origin, destination, departureDate);

    /* CÓDIGO REAL PARA CUANDO TENGAS LAS API KEYS:
    try {
      final queryParams = {
        'originLocationCode': origin,
        'destinationLocationCode': destination,
        'departureDate': departureDate.toIso8601String().split('T')[0],
        'adults': adults.toString(),
        'travelClass': travelClass,
        'max': '10',
      };

      if (returnDate != null) {
        queryParams['returnDate'] = returnDate.toIso8601String().split('T')[0];
      }

      final uri = Uri.parse('$_baseUrl/v2/shopping/flight-offers').replace(
        queryParameters: queryParams,
      );

      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $_accessToken',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data'] as List)
            .map((offer) => FlightOffer.fromAmadeusJson(offer))
            .toList();
      } else {
        throw Exception('Flight search failed: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error searching flights: $e');
      return _getMockFlights(origin, destination, departureDate);
    }
    */
  }

  // Obtener detalles de aeropuerto
  Future<Airport?> getAirportDetails(String iataCode) async {
    await _getAccessToken();

    // Mock data por ahora
    return _getMockAirport(iataCode);

    /* CÓDIGO REAL:
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/v1/reference-data/locations?keyword=$iataCode&subType=AIRPORT'),
        headers: {
          'Authorization': 'Bearer $_accessToken',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['data'].isNotEmpty) {
          return Airport.fromAmadeusJson(data['data'][0]);
        }
      }
      return null;
    } catch (e) {
      print('❌ Error getting airport details: $e');
      return _getMockAirport(iataCode);
    }
    */
  }

  // Mock data mientras configuramos las APIs
  List<FlightOffer> _getMockFlights(
      String origin, String destination, DateTime date) {
    final random = DateTime.now().millisecond;

    return [
      FlightOffer(
        id: 'flight_1_$random',
        price: Price(
          currency: 'USD',
          total: '${450 + (random % 200)}',
          base: '${400 + (random % 150)}',
        ),
        itineraries: [
          Itinerary(
            duration: 'PT${6 + (random % 4)}H${30 + (random % 30)}M',
            segments: [
              FlightSegment(
                departure: FlightEndpoint(
                  iataCode: origin,
                  terminal: '${1 + (random % 3)}',
                  at: date.add(Duration(hours: 8 + (random % 12))),
                ),
                arrival: FlightEndpoint(
                  iataCode: destination,
                  terminal: '${1 + (random % 3)}',
                  at: date.add(Duration(hours: 14 + (random % 8))),
                ),
                carrierCode: ['AA', 'BA', 'LH', 'AF', 'DL'][random % 5],
                number: '${100 + (random % 8999)}',
                aircraft: AircraftInfo(code: '32A'),
                duration: 'PT${6 + (random % 4)}H${30 + (random % 30)}M',
              ),
            ],
          ),
        ],
        travelerPricings: [
          TravelerPricing(
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: Price(
              currency: 'USD',
              total: '${450 + (random % 200)}',
              base: '${400 + (random % 150)}',
            ),
            fareDetailsBySegment: [],
          ),
        ],
      ),
      // Más vuelos mock...
      FlightOffer(
        id: 'flight_2_$random',
        price: Price(
          currency: 'USD',
          total: '${350 + (random % 300)}',
          base: '${300 + (random % 250)}',
        ),
        itineraries: [
          Itinerary(
            duration: 'PT${7 + (random % 3)}H${15 + (random % 45)}M',
            segments: [
              FlightSegment(
                departure: FlightEndpoint(
                  iataCode: origin,
                  terminal: '${1 + (random % 3)}',
                  at: date.add(Duration(hours: 14 + (random % 8))),
                ),
                arrival: FlightEndpoint(
                  iataCode: destination,
                  terminal: '${1 + (random % 3)}',
                  at: date.add(Duration(hours: 22 + (random % 4))),
                ),
                carrierCode: ['UA', 'LH', 'KL', 'VS', 'IB'][random % 5],
                number: '${200 + (random % 7999)}',
                aircraft: AircraftInfo(code: '738'),
                duration: 'PT${7 + (random % 3)}H${15 + (random % 45)}M',
              ),
            ],
          ),
        ],
        travelerPricings: [
          TravelerPricing(
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: Price(
              currency: 'USD',
              total: '${350 + (random % 300)}',
              base: '${300 + (random % 250)}',
            ),
            fareDetailsBySegment: [],
          ),
        ],
      ),
    ];
  }

  Airport? _getMockAirport(String iataCode) {
    final airports = {
      'JFK': Airport(
        iataCode: 'JFK',
        name: 'John F. Kennedy International Airport',
        cityName: 'New York',
        countryName: 'United States',
        countryCode: 'US',
        timeZone: 'America/New_York',
        coordinates: GeoCoordinates(latitude: 40.6413, longitude: -73.7781),
      ),
      'CDG': Airport(
        iataCode: 'CDG',
        name: 'Charles de Gaulle Airport',
        cityName: 'Paris',
        countryName: 'France',
        countryCode: 'FR',
        timeZone: 'Europe/Paris',
        coordinates: GeoCoordinates(latitude: 49.0097, longitude: 2.5479),
      ),
      'LHR': Airport(
        iataCode: 'LHR',
        name: 'Heathrow Airport',
        cityName: 'London',
        countryName: 'United Kingdom',
        countryCode: 'GB',
        timeZone: 'Europe/London',
        coordinates: GeoCoordinates(latitude: 51.4700, longitude: -0.4543),
      ),
      'NRT': Airport(
        iataCode: 'NRT',
        name: 'Narita International Airport',
        cityName: 'Tokyo',
        countryName: 'Japan',
        countryCode: 'JP',
        timeZone: 'Asia/Tokyo',
        coordinates: GeoCoordinates(latitude: 35.7647, longitude: 140.3864),
      ),
      'DXB': Airport(
        iataCode: 'DXB',
        name: 'Dubai International Airport',
        cityName: 'Dubai',
        countryName: 'United Arab Emirates',
        countryCode: 'AE',
        timeZone: 'Asia/Dubai',
        coordinates: GeoCoordinates(latitude: 25.2532, longitude: 55.3657),
      ),
    };

    return airports[iataCode.toUpperCase()];
  }

  // Buscar aeropuertos por ciudad/nombre
  Future<List<Airport>> searchAirports(String query) async {
    await _getAccessToken();

    // Mock data
    final allAirports = [
      _getMockAirport('JFK')!,
      _getMockAirport('CDG')!,
      _getMockAirport('LHR')!,
      _getMockAirport('NRT')!,
      _getMockAirport('DXB')!,
    ];

    return allAirports
        .where((airport) =>
            airport.name.toLowerCase().contains(query.toLowerCase()) ||
            airport.cityName.toLowerCase().contains(query.toLowerCase()) ||
            airport.iataCode.toLowerCase().contains(query.toLowerCase()))
        .toList();
  }
}

// Modelos de datos
class FlightOffer {
  final String id;
  final Price price;
  final List<Itinerary> itineraries;
  final List<TravelerPricing> travelerPricings;

  FlightOffer({
    required this.id,
    required this.price,
    required this.itineraries,
    required this.travelerPricings,
  });

  factory FlightOffer.fromAmadeusJson(Map<String, dynamic> json) {
    return FlightOffer(
      id: json['id'],
      price: Price.fromJson(json['price']),
      itineraries: (json['itineraries'] as List)
          .map((i) => Itinerary.fromJson(i))
          .toList(),
      travelerPricings: (json['travelerPricings'] as List)
          .map((t) => TravelerPricing.fromJson(t))
          .toList(),
    );
  }
}

class Price {
  final String currency;
  final String total;
  final String base;

  Price({
    required this.currency,
    required this.total,
    required this.base,
  });

  factory Price.fromJson(Map<String, dynamic> json) {
    return Price(
      currency: json['currency'],
      total: json['total'],
      base: json['base'] ?? json['total'],
    );
  }

  double get totalAmount => double.parse(total);
  double get baseAmount => double.parse(base);
}

class Itinerary {
  final String duration;
  final List<FlightSegment> segments;

  Itinerary({
    required this.duration,
    required this.segments,
  });

  factory Itinerary.fromJson(Map<String, dynamic> json) {
    return Itinerary(
      duration: json['duration'],
      segments: (json['segments'] as List)
          .map((s) => FlightSegment.fromJson(s))
          .toList(),
    );
  }

  FlightSegment get firstSegment => segments.first;
  FlightSegment get lastSegment => segments.last;

  String get durationFormatted {
    final regex = RegExp(r'PT(\d+)H(\d+)M');
    final match = regex.firstMatch(duration);
    if (match != null) {
      final hours = match.group(1);
      final minutes = match.group(2);
      return '${hours}h ${minutes}m';
    }
    return duration;
  }
}

class FlightSegment {
  final FlightEndpoint departure;
  final FlightEndpoint arrival;
  final String carrierCode;
  final String number;
  final AircraftInfo aircraft;
  final String duration;

  FlightSegment({
    required this.departure,
    required this.arrival,
    required this.carrierCode,
    required this.number,
    required this.aircraft,
    required this.duration,
  });

  factory FlightSegment.fromJson(Map<String, dynamic> json) {
    return FlightSegment(
      departure: FlightEndpoint.fromJson(json['departure']),
      arrival: FlightEndpoint.fromJson(json['arrival']),
      carrierCode: json['carrierCode'],
      number: json['number'],
      aircraft: AircraftInfo.fromJson(json['aircraft']),
      duration: json['duration'],
    );
  }

  String get flightNumber => '$carrierCode$number';
}

class FlightEndpoint {
  final String iataCode;
  final String? terminal;
  final DateTime at;

  FlightEndpoint({
    required this.iataCode,
    this.terminal,
    required this.at,
  });

  factory FlightEndpoint.fromJson(Map<String, dynamic> json) {
    return FlightEndpoint(
      iataCode: json['iataCode'],
      terminal: json['terminal'],
      at: DateTime.parse(json['at']),
    );
  }

  String get timeFormatted =>
      '${at.hour.toString().padLeft(2, '0')}:${at.minute.toString().padLeft(2, '0')}';
}

class AircraftInfo {
  final String code;

  AircraftInfo({required this.code});

  factory AircraftInfo.fromJson(Map<String, dynamic> json) {
    return AircraftInfo(code: json['code']);
  }
}

class TravelerPricing {
  final String travelerId;
  final String fareOption;
  final String travelerType;
  final Price price;
  final List<dynamic> fareDetailsBySegment;

  TravelerPricing({
    required this.travelerId,
    required this.fareOption,
    required this.travelerType,
    required this.price,
    required this.fareDetailsBySegment,
  });

  factory TravelerPricing.fromJson(Map<String, dynamic> json) {
    return TravelerPricing(
      travelerId: json['travelerId'],
      fareOption: json['fareOption'],
      travelerType: json['travelerType'],
      price: Price.fromJson(json['price']),
      fareDetailsBySegment: json['fareDetailsBySegment'] ?? [],
    );
  }
}

class Airport {
  final String iataCode;
  final String name;
  final String cityName;
  final String countryName;
  final String countryCode;
  final String timeZone;
  final GeoCoordinates coordinates;

  Airport({
    required this.iataCode,
    required this.name,
    required this.cityName,
    required this.countryName,
    required this.countryCode,
    required this.timeZone,
    required this.coordinates,
  });

  factory Airport.fromAmadeusJson(Map<String, dynamic> json) {
    return Airport(
      iataCode: json['iataCode'],
      name: json['name'],
      cityName: json['address']['cityName'],
      countryName: json['address']['countryName'],
      countryCode: json['address']['countryCode'],
      timeZone: json['timeZoneOffset'] ?? 'UTC',
      coordinates: GeoCoordinates.fromJson(json['geoCode']),
    );
  }
}

class GeoCoordinates {
  final double latitude;
  final double longitude;

  GeoCoordinates({
    required this.latitude,
    required this.longitude,
  });

  factory GeoCoordinates.fromJson(Map<String, dynamic> json) {
    return GeoCoordinates(
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
    );
  }
}
