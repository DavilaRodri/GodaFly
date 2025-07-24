import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly/data/service/amadeus_service.dart';
import '../../providers/flight_provider.dart';
import 'dart:math' as math;

class MapScreen extends ConsumerStatefulWidget {
  final Airport? originAirport;
  final Airport? destinationAirport;
  final List<FlightOffer>? flightOffers;

  const MapScreen({
    super.key,
    this.originAirport,
    this.destinationAirport,
    this.flightOffers,
  });

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  bool _showFlightPath = true;
  bool _showAirports = true;

  // Aeropuertos destacados para mostrar en la vista
  final List<Airport> _featuredAirports = [
    Airport(
      iataCode: 'JFK',
      name: 'John F. Kennedy International',
      cityName: 'New York',
      countryName: 'United States',
      countryCode: 'US',
      timeZone: 'America/New_York',
      coordinates: GeoCoordinates(latitude: 40.6413, longitude: -73.7781),
    ),
    Airport(
      iataCode: 'CDG',
      name: 'Charles de Gaulle',
      cityName: 'Paris',
      countryName: 'France',
      countryCode: 'FR',
      timeZone: 'Europe/Paris',
      coordinates: GeoCoordinates(latitude: 49.0097, longitude: 2.5479),
    ),
    Airport(
      iataCode: 'LHR',
      name: 'Heathrow',
      cityName: 'London',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      timeZone: 'Europe/London',
      coordinates: GeoCoordinates(latitude: 51.4700, longitude: -0.4543),
    ),
    Airport(
      iataCode: 'NRT',
      name: 'Narita International',
      cityName: 'Tokyo',
      countryName: 'Japan',
      countryCode: 'JP',
      timeZone: 'Asia/Tokyo',
      coordinates: GeoCoordinates(latitude: 35.7647, longitude: 140.3864),
    ),
    Airport(
      iataCode: 'DXB',
      name: 'Dubai International',
      cityName: 'Dubai',
      countryName: 'UAE',
      countryCode: 'AE',
      timeZone: 'Asia/Dubai',
      coordinates: GeoCoordinates(latitude: 25.2532, longitude: 55.3657),
    ),
    Airport(
      iataCode: 'LAX',
      name: 'Los Angeles International',
      cityName: 'Los Angeles',
      countryName: 'United States',
      countryCode: 'US',
      timeZone: 'America/Los_Angeles',
      coordinates: GeoCoordinates(latitude: 33.9425, longitude: -118.4081),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flight Routes'),
        backgroundColor: const Color(0xFF25D097),
        actions: [
          IconButton(
            icon: Icon(_showAirports ? Icons.flight : Icons.flight_outlined),
            onPressed: () {
              setState(() {
                _showAirports = !_showAirports;
              });
            },
          ),
          IconButton(
            icon: Icon(
                _showFlightPath ? Icons.timeline : Icons.timeline_outlined),
            onPressed: () {
              setState(() {
                _showFlightPath = !_showFlightPath;
              });
            },
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'refresh':
                  setState(() {});
                  break;
                case 'info':
                  _showRouteInfo(context);
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'refresh', child: Text('Refresh')),
              const PopupMenuItem(value: 'info', child: Text('Route Info')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Route summary header
          if (widget.originAirport != null && widget.destinationAirport != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF25D097), Color(0xFF1DB584)],
                ),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.originAirport!.iataCode,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              widget.originAirport!.cityName,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.flight_takeoff,
                          color: Colors.white, size: 24),
                      const SizedBox(width: 16),
                      const Icon(Icons.more_horiz,
                          color: Colors.white, size: 24),
                      const SizedBox(width: 16),
                      const Icon(Icons.flight_land,
                          color: Colors.white, size: 24),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              widget.destinationAirport!.iataCode,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              widget.destinationAirport!.cityName,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (_calculateDistance() != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Distance: ${_calculateDistance()!.toStringAsFixed(0)} km',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),

          // Airport list
          Expanded(
            child: _buildAirportList(),
          ),

          // Flight info panel
          if (widget.flightOffers != null && widget.flightOffers!.isNotEmpty)
            _buildFlightInfoPanel(),
        ],
      ),
    );
  }

  Widget _buildAirportList() {
    final airportsToShow = _showAirports ? _featuredAirports : <Airport>[];

    // Add origin and destination if they exist
    final allAirports = <Airport>[];
    if (widget.originAirport != null) allAirports.add(widget.originAirport!);
    if (widget.destinationAirport != null)
      allAirports.add(widget.destinationAirport!);
    allAirports.addAll(airportsToShow);

    // Remove duplicates
    final uniqueAirports = allAirports.toSet().toList();

    if (uniqueAirports.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_airport, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No airports to display',
                style: TextStyle(fontSize: 18, color: Colors.grey)),
            Text('Enable airport view to see featured airports',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: uniqueAirports.length,
      itemBuilder: (context, index) {
        final airport = uniqueAirports[index];
        final isOrigin = airport.iataCode == widget.originAirport?.iataCode;
        final isDestination =
            airport.iataCode == widget.destinationAirport?.iataCode;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: isOrigin
                  ? Colors.green
                  : isDestination
                      ? Colors.red
                      : Colors.transparent,
              width: 2,
            ),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isOrigin
                    ? Colors.green.withOpacity(0.1)
                    : isDestination
                        ? Colors.red.withOpacity(0.1)
                        : const Color(0xFF25D097).withOpacity(0.1),
                borderRadius: BorderRadius.circular(25),
              ),
              child: Icon(
                isOrigin
                    ? Icons.flight_takeoff
                    : isDestination
                        ? Icons.flight_land
                        : Icons.local_airport,
                color: isOrigin
                    ? Colors.green
                    : isDestination
                        ? Colors.red
                        : const Color(0xFF25D097),
              ),
            ),
            title: Row(
              children: [
                Text(
                  airport.iataCode,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(width: 8),
                if (isOrigin)
                  const Chip(
                    label: Text('Origin', style: TextStyle(fontSize: 10)),
                    backgroundColor: Colors.green,
                    labelStyle: TextStyle(color: Colors.white),
                  )
                else if (isDestination)
                  const Chip(
                    label: Text('Destination', style: TextStyle(fontSize: 10)),
                    backgroundColor: Colors.red,
                    labelStyle: TextStyle(color: Colors.white),
                  ),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  airport.name,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 4),
                Text('${airport.cityName}, ${airport.countryName}'),
                const SizedBox(height: 4),
                Text(
                  'Timezone: ${airport.timeZone}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                Text(
                  'Coordinates: ${airport.coordinates.latitude.toStringAsFixed(4)}, ${airport.coordinates.longitude.toStringAsFixed(4)}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'search':
                    _searchFlightsFrom(airport);
                    break;
                  case 'info':
                    _showAirportDetails(airport);
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'search',
                  child: Row(
                    children: [
                      Icon(Icons.search, size: 16),
                      SizedBox(width: 8),
                      Text('Search Flights'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'info',
                  child: Row(
                    children: [
                      Icon(Icons.info, size: 16),
                      SizedBox(width: 8),
                      Text('More Info'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFlightInfoPanel() {
    final offer = widget.flightOffers!.first;
    final itinerary = offer.itineraries.first;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${itinerary.firstSegment.flightNumber}',
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text(
                '${offer.price.currency} ${offer.price.totalAmount.toStringAsFixed(0)}',
                style: const TextStyle(
                  color: Color(0xFF25D097),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    itinerary.firstSegment.departure.timeFormatted,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    itinerary.firstSegment.departure.iataCode,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    itinerary.durationFormatted,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const Icon(Icons.flight_takeoff,
                      color: Color(0xFF25D097), size: 16),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    itinerary.lastSegment.arrival.timeFormatted,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    itinerary.lastSegment.arrival.iataCode,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Booking functionality coming soon!'),
                    backgroundColor: Color(0xFF25D097),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D097),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Book Flight',
                  style: TextStyle(color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  double? _calculateDistance() {
    if (widget.originAirport == null || widget.destinationAirport == null) {
      return null;
    }

    final origin = widget.originAirport!.coordinates;
    final destination = widget.destinationAirport!.coordinates;

    // Haversine formula for distance calculation
    const double earthRadius = 6371; // km

    final double lat1Rad = origin.latitude * math.pi / 180;
    final double lat2Rad = destination.latitude * math.pi / 180;
    final double deltaLatRad =
        (destination.latitude - origin.latitude) * math.pi / 180;
    final double deltaLngRad =
        (destination.longitude - origin.longitude) * math.pi / 180;

    final double a = math.sin(deltaLatRad / 2) * math.sin(deltaLatRad / 2) +
        math.cos(lat1Rad) *
            math.cos(lat2Rad) *
            math.sin(deltaLngRad / 2) *
            math.sin(deltaLngRad / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

    return earthRadius * c;
  }

  void _searchFlightsFrom(Airport airport) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Searching flights from ${airport.iataCode}...'),
        backgroundColor: const Color(0xFF25D097),
      ),
    );
  }

  void _showAirportDetails(Airport airport) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF25D097).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child:
                      const Icon(Icons.local_airport, color: Color(0xFF25D097)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        airport.iataCode,
                        style: const TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        airport.name,
                        style:
                            const TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildAirportDetailRow(
                Icons.location_city, 'City', airport.cityName),
            _buildAirportDetailRow(
                Icons.public, 'Country', airport.countryName),
            _buildAirportDetailRow(
                Icons.access_time, 'Timezone', airport.timeZone),
            _buildAirportDetailRow(
              Icons.map,
              'Coordinates',
              '${airport.coordinates.latitude.toStringAsFixed(4)}, ${airport.coordinates.longitude.toStringAsFixed(4)}',
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _searchFlightsFrom(airport);
                    },
                    icon: const Icon(Icons.search, size: 16),
                    label: const Text('Search Flights'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D097)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text(
                                'Airport info for ${airport.name} displayed')),
                      );
                    },
                    icon: const Icon(Icons.info, size: 16),
                    label: const Text('More Info'),
                    style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF25D097)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAirportDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 12),
          Text('$label:', style: const TextStyle(color: Colors.grey)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  void _showRouteInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Route Information'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.originAirport != null &&
                widget.destinationAirport != null) ...[
              Text(
                  'Route: ${widget.originAirport!.iataCode} → ${widget.destinationAirport!.iataCode}'),
              const SizedBox(height: 8),
              if (_calculateDistance() != null)
                Text(
                    'Distance: ${_calculateDistance()!.toStringAsFixed(0)} km'),
              const SizedBox(height: 8),
              Text(
                  'Origin: ${widget.originAirport!.cityName}, ${widget.originAirport!.countryName}'),
              const SizedBox(height: 4),
              Text(
                  'Destination: ${widget.destinationAirport!.cityName}, ${widget.destinationAirport!.countryName}'),
            ] else ...[
              const Text(
                  'No route selected. This screen shows featured airports and flight information.'),
            ],
            const SizedBox(height: 16),
            Text('Featured Airports: ${_featuredAirports.length}'),
            if (widget.flightOffers != null)
              Text('Flight Offers: ${widget.flightOffers!.length}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
