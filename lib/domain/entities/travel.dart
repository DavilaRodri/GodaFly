class Travel {
  final String id;
  final TravelType type;
  final DateTime date;
  final String? flightNumber;
  final String? startIataCode;
  final String? endIataCode;
  final String? cityId;
  final String? cityName;
  final String? airportName;
  final DateTime? arrivalTime;
  final DateTime? departureTime;
  final String? imageUrl;
  final bool isSaved;

  const Travel({
    required this.id,
    required this.type,
    required this.date,
    this.flightNumber,
    this.startIataCode,
    this.endIataCode,
    this.cityId,
    this.cityName,
    this.airportName,
    this.arrivalTime,
    this.departureTime,
    this.imageUrl,
    this.isSaved = false,
  });

  factory Travel.fromJson(Map<String, dynamic> json) {
    return Travel(
      id: json['id'] as String,
      type: TravelType.values.firstWhere((e) => e.name == json['type']),
      date: DateTime.parse(json['date']),
      flightNumber: json['flightNumber'] as String?,
      startIataCode: json['startIataCode'] as String?,
      endIataCode: json['endIataCode'] as String?,
      cityId: json['cityId'] as String?,
      cityName: json['cityName'] as String?,
      airportName: json['airportName'] as String?,
      arrivalTime: json['arrivalTime'] != null
          ? DateTime.parse(json['arrivalTime'])
          : null,
      departureTime: json['departureTime'] != null
          ? DateTime.parse(json['departureTime'])
          : null,
      imageUrl: json['imageUrl'] as String?,
      isSaved: json['isSaved'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'date': date.toIso8601String(),
      'flightNumber': flightNumber,
      'startIataCode': startIataCode,
      'endIataCode': endIataCode,
      'cityId': cityId,
      'cityName': cityName,
      'airportName': airportName,
      'arrivalTime': arrivalTime?.toIso8601String(),
      'departureTime': departureTime?.toIso8601String(),
      'imageUrl': imageUrl,
      'isSaved': isSaved,
    };
  }
}

class City {
  final String id;
  final String cityName;
  final String countryName;
  final String? imageUrl;
  final List<Airport> airports;

  const City({
    required this.id,
    required this.cityName,
    required this.countryName,
    this.imageUrl,
    this.airports = const [],
  });

  factory City.fromJson(Map<String, dynamic> json) {
    return City(
      id: json['id'] as String,
      cityName: json['cityName'] as String,
      countryName: json['countryName'] as String,
      imageUrl: json['imageUrl'] as String?,
      airports: (json['airports'] as List<dynamic>?)
              ?.map((e) => Airport.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cityName': cityName,
      'countryName': countryName,
      'imageUrl': imageUrl,
      'airports': airports.map((e) => e.toJson()).toList(),
    };
  }
}

class Airport {
  final String id;
  final String airportName;
  final String iataCode;
  final String cityId;

  const Airport({
    required this.id,
    required this.airportName,
    required this.iataCode,
    required this.cityId,
  });

  factory Airport.fromJson(Map<String, dynamic> json) {
    return Airport(
      id: json['id'] as String,
      airportName: json['airportName'] as String,
      iataCode: json['iataCode'] as String,
      cityId: json['cityId'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'airportName': airportName,
      'iataCode': iataCode,
      'cityId': cityId,
    };
  }
}

enum TravelType {
  flight,
  layover,
}
