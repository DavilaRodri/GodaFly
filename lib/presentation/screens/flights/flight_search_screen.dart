import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly_flutter/data/service/amadeus_service.dart';
import '../../providers/flight_provider.dart';

class FlightSearchScreen extends ConsumerStatefulWidget {
  const FlightSearchScreen({super.key});

  @override
  ConsumerState<FlightSearchScreen> createState() => _FlightSearchScreenState();
}

class _FlightSearchScreenState extends ConsumerState<FlightSearchScreen> {
  final _originController = TextEditingController();
  final _destinationController = TextEditingController();
  final _departureDateController = TextEditingController();
  final _returnDateController = TextEditingController();

  Airport? _selectedOrigin;
  Airport? _selectedDestination;
  DateTime? _departureDate;
  DateTime? _returnDate;
  int _passengers = 1;
  String _travelClass = 'ECONOMY';
  bool _isRoundTrip = false;

  @override
  void dispose() {
    _originController.dispose();
    _destinationController.dispose();
    _departureDateController.dispose();
    _returnDateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final flightState = ref.watch(flightSearchNotifierProvider);
    final isLoading = ref.watch(isFlightSearchLoadingProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Flights'),
        backgroundColor: const Color(0xFF25D097),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search form
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF25D097), Color(0xFF1DB584)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Trip type toggle
                  Row(
                    children: [
                      Expanded(
                        child: _buildTripTypeButton('One Way', !_isRoundTrip),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildTripTypeButton('Round Trip', _isRoundTrip),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Origin and Destination
                  Row(
                    children: [
                      Expanded(
                        child: _buildAirportField(
                          controller: _originController,
                          hint: 'From',
                          icon: Icons.flight_takeoff,
                          selectedAirport: _selectedOrigin,
                          onAirportSelected: (airport) {
                            setState(() {
                              _selectedOrigin = airport;
                              _originController.text =
                                  '${airport.cityName} (${airport.iataCode})';
                            });
                          },
                        ),
                      ),
                      IconButton(
                        onPressed: _swapAirports,
                        icon: const Icon(Icons.swap_horiz,
                            color: Colors.white, size: 28),
                      ),
                      Expanded(
                        child: _buildAirportField(
                          controller: _destinationController,
                          hint: 'To',
                          icon: Icons.flight_land,
                          selectedAirport: _selectedDestination,
                          onAirportSelected: (airport) {
                            setState(() {
                              _selectedDestination = airport;
                              _destinationController.text =
                                  '${airport.cityName} (${airport.iataCode})';
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Dates
                  Row(
                    children: [
                      Expanded(
                        child: _buildDateField(
                          controller: _departureDateController,
                          hint: 'Departure',
                          icon: Icons.calendar_today,
                          selectedDate: _departureDate,
                          onDateSelected: (date) {
                            setState(() {
                              _departureDate = date;
                              _departureDateController.text =
                                  '${date.day}/${date.month}/${date.year}';
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _isRoundTrip
                            ? _buildDateField(
                                controller: _returnDateController,
                                hint: 'Return',
                                icon: Icons.calendar_today,
                                selectedDate: _returnDate,
                                onDateSelected: (date) {
                                  setState(() {
                                    _returnDate = date;
                                    _returnDateController.text =
                                        '${date.day}/${date.month}/${date.year}';
                                  });
                                },
                              )
                            : const SizedBox(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Passengers and Class
                  Row(
                    children: [
                      Expanded(
                        child: _buildPassengerSelector(),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildClassSelector(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Search button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _canSearch() ? _searchFlights : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF25D097),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25)),
                        elevation: 2,
                      ),
                      child: isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text(
                              'Search Flights',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Results
          Expanded(
            child: _buildResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildTripTypeButton(String text, bool isSelected) {
    return GestureDetector(
      onTap: () => setState(() => _isRoundTrip = text == 'Round Trip'),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected ? const Color(0xFF25D097) : Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildAirportField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    required Airport? selectedAirport,
    required Function(Airport) onAirportSelected,
  }) {
    return GestureDetector(
      onTap: () => _showAirportSelector(
        context: context,
        onAirportSelected: onAirportSelected,
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF25D097), size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hint,
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                  Text(
                    selectedAirport != null
                        ? '${selectedAirport.cityName} (${selectedAirport.iataCode})'
                        : 'Select airport',
                    style: TextStyle(
                      color: selectedAirport != null
                          ? Colors.black87
                          : Colors.grey,
                      fontWeight: selectedAirport != null
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    required DateTime? selectedDate,
    required Function(DateTime) onDateSelected,
  }) {
    return GestureDetector(
      onTap: () => _selectDate(onDateSelected),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF25D097), size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hint,
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                  Text(
                    selectedDate != null
                        ? '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}'
                        : 'Select date',
                    style: TextStyle(
                      color:
                          selectedDate != null ? Colors.black87 : Colors.grey,
                      fontWeight: selectedDate != null
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPassengerSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.person, color: Color(0xFF25D097), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Passengers',
                    style: TextStyle(color: Colors.grey, fontSize: 12)),
                Row(
                  children: [
                    IconButton(
                      onPressed: _passengers > 1
                          ? () => setState(() => _passengers--)
                          : null,
                      icon: const Icon(Icons.remove, size: 16),
                      constraints:
                          const BoxConstraints(minWidth: 32, minHeight: 32),
                    ),
                    Text('$_passengers',
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    IconButton(
                      onPressed: _passengers < 9
                          ? () => setState(() => _passengers++)
                          : null,
                      icon: const Icon(Icons.add, size: 16),
                      constraints:
                          const BoxConstraints(minWidth: 32, minHeight: 32),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClassSelector() {
    return GestureDetector(
      onTap: _showClassSelector,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.airline_seat_recline_extra,
                color: Color(0xFF25D097), size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Class',
                      style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    _travelClass.toLowerCase().replaceFirst(
                        _travelClass[0], _travelClass[0].toUpperCase()),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResults() {
    final flightState = ref.watch(flightSearchNotifierProvider);

    if (flightState.offers.isEmpty && !flightState.isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.flight_takeoff, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Ready to search!',
                style: TextStyle(fontSize: 18, color: Colors.grey)),
            Text('Enter your travel details above',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    if (flightState.error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: ${flightState.error}',
                style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () =>
                  ref.read(flightSearchNotifierProvider.notifier).clearError(),
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (flightState.lastSearchQuery != null) ...[
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Flights ${flightState.lastSearchQuery} • ${flightState.offers.length} results',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ],
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: flightState.offers.length,
            itemBuilder: (context, index) {
              final offer = flightState.offers[index];
              return _buildFlightCard(offer);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFlightCard(FlightOffer offer) {
    final itinerary = offer.itineraries.first;
    final firstSegment = itinerary.firstSegment;
    final lastSegment = itinerary.lastSegment;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Price and airline
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${offer.price.currency} ${offer.price.totalAmount.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF25D097),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF25D097).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    firstSegment.flightNumber,
                    style: const TextStyle(
                      color: Color(0xFF25D097),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Flight details
            Row(
              children: [
                // Departure
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        firstSegment.departure.timeFormatted,
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        firstSegment.departure.iataCode,
                        style: const TextStyle(
                            color: Colors.grey, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),

                // Duration and stops
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      Text(
                        itinerary.durationFormatted,
                        style:
                            const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        height: 2,
                        decoration: BoxDecoration(
                          color: const Color(0xFF25D097),
                          borderRadius: BorderRadius.circular(1),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        itinerary.segments.length > 1
                            ? '${itinerary.segments.length - 1} stop'
                            : 'Nonstop',
                        style:
                            const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ),

                // Arrival
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        lastSegment.arrival.timeFormatted,
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        lastSegment.arrival.iataCode,
                        style: const TextStyle(
                            color: Colors.grey, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Select button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _selectFlight(offer),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D097),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Select Flight'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _swapAirports() {
    final tempAirport = _selectedOrigin;
    final tempText = _originController.text;

    setState(() {
      _selectedOrigin = _selectedDestination;
      _selectedDestination = tempAirport;
      _originController.text = _destinationController.text;
      _destinationController.text = tempText;
    });
  }

  bool _canSearch() {
    return _selectedOrigin != null &&
        _selectedDestination != null &&
        _departureDate != null &&
        (_isRoundTrip ? _returnDate != null : true);
  }

  void _searchFlights() {
    if (!_canSearch()) return;

    ref.read(flightSearchNotifierProvider.notifier).searchFlights(
          origin: _selectedOrigin!.iataCode,
          destination: _selectedDestination!.iataCode,
          departureDate: _departureDate!,
          returnDate: _returnDate,
          adults: _passengers,
          travelClass: _travelClass,
        );
  }

  void _selectDate(Function(DateTime) onDateSelected) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null) {
      onDateSelected(date);
    }
  }

  void _showAirportSelector({
    required BuildContext context,
    required Function(Airport) onAirportSelected,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => AirportSelectorSheet(
        onAirportSelected: onAirportSelected,
      ),
    );
  }

  void _showClassSelector() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Select Class',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ...['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map(
              (travelClass) => ListTile(
                title: Text(travelClass
                    .toLowerCase()
                    .replaceAll('_', ' ')
                    .split(' ')
                    .map((word) => word[0].toUpperCase() + word.substring(1))
                    .join(' ')),
                trailing: _travelClass == travelClass
                    ? const Icon(Icons.check, color: Color(0xFF25D097))
                    : null,
                onTap: () {
                  setState(() => _travelClass = travelClass);
                  Navigator.pop(context);
                },
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _selectFlight(FlightOffer offer) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Selected flight for \${offer.price.totalAmount.toStringAsFixed(0)}!'),
        backgroundColor: const Color(0xFF25D097),
        action: SnackBarAction(
          label: 'View Details',
          textColor: Colors.white,
          onPressed: () {
            // Aquí navegarías a la pantalla de detalles del vuelo
          },
        ),
      ),
    );
  }
}

// Widget para selector de aeropuertos
class AirportSelectorSheet extends ConsumerStatefulWidget {
  final Function(Airport) onAirportSelected;

  const AirportSelectorSheet({
    super.key,
    required this.onAirportSelected,
  });

  @override
  ConsumerState<AirportSelectorSheet> createState() =>
      _AirportSelectorSheetState();
}

class _AirportSelectorSheetState extends ConsumerState<AirportSelectorSheet> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final airportState = ref.watch(airportSearchNotifierProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      minChildSize: 0.5,
      builder: (context, scrollController) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Title
            const Text(
              'Select Airport',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Search field
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by city or airport code',
                prefixIcon: const Icon(Icons.search, color: Color(0xFF25D097)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey.shade100,
              ),
              onChanged: (query) {
                ref
                    .read(airportSearchNotifierProvider.notifier)
                    .searchAirports(query);
              },
            ),
            const SizedBox(height: 16),

            // Results
            Expanded(
              child: airportState.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : airportState.airports.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.local_airport,
                                  size: 48, color: Colors.grey),
                              SizedBox(height: 16),
                              Text('Start typing to search airports',
                                  style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          controller: scrollController,
                          itemCount: airportState.airports.length,
                          itemBuilder: (context, index) {
                            final airport = airportState.airports[index];
                            return ListTile(
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color:
                                      const Color(0xFF25D097).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(
                                  Icons.local_airport,
                                  color: Color(0xFF25D097),
                                ),
                              ),
                              title: Text(
                                airport.name,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600),
                              ),
                              subtitle: Text(
                                  '${airport.cityName}, ${airport.countryName}'),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  airport.iataCode,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              onTap: () {
                                widget.onAirportSelected(airport);
                                Navigator.pop(context);
                              },
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
