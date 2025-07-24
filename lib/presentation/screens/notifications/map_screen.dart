import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly/data/service/amadeus_service.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
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
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  bool _showFlightPath = true;
  bool _showAirports = true;

  // Aeropuertos destacados para mostrar en el mapa
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
    Airport(
      iataCode: 'SIN',
      name: 'Singapore Changi',
      cityName: 'Singapore',
      countryName: 'Singapore',
      countryCode: 'SG',
      timeZone: 'Asia/Singapore',
      coordinates: GeoCoordinates(latitude: 1.3644, longitude: 103.9915),
    ),
    Airport(
      iataCode: 'HND',
      name: 'Tokyo Haneda',
      cityName: 'Tokyo',
      countryName: 'Japan',
      countryCode: 'JP',
      timeZone: 'Asia/Tokyo',
      coordinates: GeoCoordinates(latitude: 35.5494, longitude: 139.7798),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _setupMap();
  }

  void _setupMap() {
    _createMarkers();
    _createFlightPaths();
  }

  void _createMarkers() {
    final markers = <Marker>{};

    // Agregar aeropuertos destacados
    if (_showAirports) {
      for (final airport in _featuredAirports) {
        markers.add(
          Marker(
            markerId: MarkerId(airport.iataCode),
            position: LatLng(
              airport.coordinates.latitude,
              airport.coordinates.longitude,
            ),
            icon:
                BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
            infoWindow: InfoWindow(
              title: '${airport.iataCode} - ${airport.name}',
              snippet: '${airport.cityName}, ${airport.countryName}',
            ),
            onTap: () => _showAirportDetails(airport),
          ),
        );
      }
    }

    // Resaltar origen y destino si existen
    if (widget.originAirport != null) {
      markers.add(
        Marker(
          markerId: MarkerId('origin_${widget.originAirport!.iataCode}'),
          position: LatLng(
            widget.originAirport!.coordinates.latitude,
            widget.originAirport!.coordinates.longitude,
          ),
          icon:
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          infoWindow: InfoWindow(
            title: '🛫 ${widget.originAirport!.iataCode}',
            snippet: 'Origin: ${widget.originAirport!.cityName}',
          ),
        ),
      );
    }

    if (widget.destinationAirport != null) {
      markers.add(
        Marker(
          markerId:
              MarkerId('destination_${widget.destinationAirport!.iataCode}'),
          position: LatLng(
            widget.destinationAirport!.coordinates.latitude,
            widget.destinationAirport!.coordinates.longitude,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: InfoWindow(
            title: '🛬 ${widget.destinationAirport!.iataCode}',
            snippet: 'Destination: ${widget.destinationAirport!.cityName}',
          ),
        ),
      );
    }

    setState(() {
      _markers = markers;
    });
  }

  void _createFlightPaths() {
    final polylines = <Polyline>{};

    if (_showFlightPath &&
        widget.originAirport != null &&
        widget.destinationAirport != null) {
      final origin = LatLng(
        widget.originAirport!.coordinates.latitude,
        widget.originAirport!.coordinates.longitude,
      );
      final destination = LatLng(
        widget.destinationAirport!.coordinates.latitude,
        widget.destinationAirport!.coordinates.longitude,
      );

      // Crear ruta curva (great circle path aproximado)
      final pathPoints = _createCurvedPath(origin, destination);

      polylines.add(
        Polyline(
          polylineId: const PolylineId('flight_path'),
          points: pathPoints,
          color: const Color(0xFF25D097),
          width: 3,
          patterns: [PatternItem.dash(20), PatternItem.gap(10)],
        ),
      );

      // Añadir polilínea de rutas populares entre aeropuertos destacados
      _addPopularRoutes(polylines);
    }

    setState(() {
      _polylines = polylines;
    });
  }

  void _addPopularRoutes(Set<Polyline> polylines) {
    final popularRoutes = [
      ['JFK', 'LHR'], // New York - London
      ['CDG', 'NRT'], // Paris - Tokyo
      ['DXB', 'SIN'], // Dubai - Singapore
      ['LAX', 'NRT'], // Los Angeles - Tokyo
    ];

    for (final route in popularRoutes) {
      final origin =
          _featuredAirports.firstWhere((a) => a.iataCode == route[0]);
      final destination =
          _featuredAirports.firstWhere((a) => a.iataCode == route[1]);

      final originLatLng =
          LatLng(origin.coordinates.latitude, origin.coordinates.longitude);
      final destinationLatLng = LatLng(
          destination.coordinates.latitude, destination.coordinates.longitude);

      polylines.add(
        Polyline(
          polylineId: PolylineId('route_${route[0]}_${route[1]}'),
          points: _createCurvedPath(originLatLng, destinationLatLng),
          color: Colors.blue.withOpacity(0.3),
          width: 2,
          patterns: [PatternItem.dot, PatternItem.gap(10)],
        ),
      );
    }
  }

  List<LatLng> _createCurvedPath(LatLng start, LatLng end) {
    final points = <LatLng>[];
    const int numPoints = 50;

    for (int i = 0; i <= numPoints; i++) {
      final t = i / numPoints;

      // Interpolación lineal básica con curva
      final lat = _lerp(start.latitude, end.latitude, t);
      final lng = _lerp(start.longitude, end.longitude, t);

      // Añadir curvatura para simular ruta de gran círculo
      final curvature = math.sin(math.pi * t) * 0.1;
      final adjustedLat = lat + curvature;

      points.add(LatLng(adjustedLat, lng));
    }

    return points;
  }

  double _lerp(double start, double end, double t) {
    return start + (end - start) * t;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flight Map'),
        backgroundColor: const Color(0xFF25D097),
        actions: [
          IconButton(
            icon: Icon(_showAirports ? Icons.flight : Icons.flight_outlined),
            onPressed: () {
              setState(() {
                _showAirports = !_showAirports;
                _createMarkers();
              });
            },
          ),
          IconButton(
            icon: Icon(
                _showFlightPath ? Icons.timeline : Icons.timeline_outlined),
            onPressed: () {
              setState(() {
                _showFlightPath = !_showFlightPath;
                _createFlightPaths();
              });
            },
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'satellite':
                  // Cambiar a vista satelital
                  break;
                case 'traffic':
                  // Mostrar tráfico
                  break;
                case 'weather':
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Weather overlay coming soon!')),
                  );
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                  value: 'satellite', child: Text('Satellite View')),
              const PopupMenuItem(
                  value: 'traffic', child: Text('Show Traffic')),
              const PopupMenuItem(
                  value: 'weather', child: Text('Weather Overlay')),
            ],
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: (GoogleMapController controller) {
              _mapController = controller;
              _fitMapToMarkers();
            },
            initialCameraPosition: const CameraPosition(
              target: LatLng(40.7128, -74.0060), // New York por defecto
              zoom: 3.0,
            ),
            markers: _markers,
            polylines: _polylines,
            mapType: MapType.normal,
            zoomControlsEnabled: false,
            myLocationButtonEnabled: true,
            myLocationEnabled: true,
            compassEnabled: true,
            mapToolbarEnabled: false,
          ),

          // Panel de información flotante
          if (widget.flightOffers != null && widget.flightOffers!.isNotEmpty)
            Positioned(
              bottom: 20,
              left: 16,
              right: 16,
              child: _buildFlightInfoPanel(),
            ),

          // Leyenda flotante
          Positioned(
            top: 20,
            right: 16,
            child: _buildLegend(),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'center_map',
            mini: true,
            backgroundColor: Colors.white,
            onPressed: _fitMapToMarkers,
            child:
                const Icon(Icons.center_focus_strong, color: Color(0xFF25D097)),
          ),
          const SizedBox(height: 8),
          FloatingActionButton(
            heroTag: 'my_location',
            mini: true,
            backgroundColor: Colors.white,
            onPressed: _goToMyLocation,
            child: const Icon(Icons.my_location, color: Color(0xFF25D097)),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Legend',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 8),
          _buildLegendItem(Colors.green, 'Origin'),
          _buildLegendItem(Colors.red, 'Destination'),
          _buildLegendItem(Colors.blue, 'Airports'),
          _buildLegendItem(const Color(0xFF25D097), 'Flight Path'),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildFlightInfoPanel() {
    final offer = widget.flightOffers!.first;
    final itinerary = offer.itineraries.first;

    return Container(
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

  void _fitMapToMarkers() {
    if (_markers.isEmpty || _mapController == null) return;

    final bounds = _calculateBounds(_markers);
    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 100.0),
    );
  }

  LatLngBounds _calculateBounds(Set<Marker> markers) {
    final lats = markers.map((m) => m.position.latitude).toList();
    final lngs = markers.map((m) => m.position.longitude).toList();

    return LatLngBounds(
      southwest: LatLng(lats.reduce(math.min), lngs.reduce(math.min)),
      northeast: LatLng(lats.reduce(math.max), lngs.reduce(math.max)),
    );
  }

  void _goToMyLocation() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Location services coming soon!')),
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
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text(
                                'Searching flights from ${airport.iataCode}...')),
                      );
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
                                'Getting directions to ${airport.name}...')),
                      );
                    },
                    icon: const Icon(Icons.directions, size: 16),
                    label: const Text('Directions'),
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
}
