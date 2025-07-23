import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/travel_provider.dart';
import '../../providers/chat_provider.dart';
import '../chat/chat_detail_screen.dart';
import '../../../domain/entities/user.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});
  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Flight controllers
  final _flightController = TextEditingController();
  final _flightDateController = TextEditingController();
  DateTime? _selectedFlightDate;

  // Layover controllers
  final _cityController = TextEditingController();
  final _airportController = TextEditingController();
  final _layoverDateController = TextEditingController();
  final _arrivalController = TextEditingController();
  final _departureController = TextEditingController();
  DateTime? _selectedLayoverDate;
  DateTime? _arrivalTime;
  DateTime? _departureTime;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _flightController.dispose();
    _flightDateController.dispose();
    _cityController.dispose();
    _airportController.dispose();
    _layoverDateController.dispose();
    _arrivalController.dispose();
    _departureController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final travelState = ref.watch(travelNotifierProvider);
    final travelNotifier = ref.watch(travelNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Travelers'),
        backgroundColor: const Color(0xFF25D097),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.flight_takeoff), text: 'Flight'),
            Tab(icon: Icon(Icons.connecting_airports), text: 'Layover'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFlightTab(travelState, travelNotifier),
          _buildLayoverTab(travelState, travelNotifier),
        ],
      ),
    );
  }

  Widget _buildFlightTab(TravelState state, TravelNotifier notifier) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                  colors: [Color(0xFF25D097), Color(0xFF1DB584)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              children: [
                Icon(Icons.flight_takeoff, size: 50, color: Colors.white),
                SizedBox(height: 12),
                Text('Find Fellow Passengers',
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white)),
                Text('Connect with travelers on your flight',
                    style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Flight Number',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _flightController,
            decoration: InputDecoration(
              hintText: 'e.g., AA1234, BA567',
              prefixIcon: const Icon(Icons.flight, color: Color(0xFF25D097)),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
              filled: true,
              fillColor: Colors.grey.shade100,
            ),
            textCapitalization: TextCapitalization.characters,
          ),
          const SizedBox(height: 16),
          const Text('Flight Date',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _flightDateController,
            readOnly: true,
            onTap: _pickFlightDate,
            decoration: InputDecoration(
              hintText: 'Select flight date',
              prefixIcon:
                  const Icon(Icons.calendar_today, color: Color(0xFF25D097)),
              suffixIcon: const Icon(Icons.arrow_drop_down),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
              filled: true,
              fillColor: Colors.grey.shade100,
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: state.isLoading ||
                      _flightController.text.isEmpty ||
                      _selectedFlightDate == null
                  ? null
                  : () => notifier.searchByFlight(
                      _flightController.text.toUpperCase(),
                      _selectedFlightDate!),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D097),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: state.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Find Passengers',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
            ),
          ),
          if (state.searchResults.isNotEmpty) ...[
            const SizedBox(height: 32),
            Text('Found ${state.searchResults.length} travelers',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...state.searchResults.map((user) => _buildUserCard(user)),
          ],
        ],
      ),
    );
  }

  Widget _buildLayoverTab(TravelState state, TravelNotifier notifier) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                  colors: [Color(0xFF25D097), Color(0xFF1DB584)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              children: [
                Icon(Icons.connecting_airports, size: 50, color: Colors.white),
                SizedBox(height: 12),
                Text('Connect During Layovers',
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white)),
                Text('Meet travelers in the same city',
                    style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('City',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _cityController,
            decoration: InputDecoration(
              hintText: 'e.g., London, Paris, Tokyo',
              prefixIcon:
                  const Icon(Icons.location_city, color: Color(0xFF25D097)),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
              filled: true,
              fillColor: Colors.grey.shade100,
            ),
          ),
          const SizedBox(height: 16),
          const Text('Airport',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _airportController,
            decoration: InputDecoration(
              hintText: 'e.g., Heathrow, CDG',
              prefixIcon:
                  const Icon(Icons.local_airport, color: Color(0xFF25D097)),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
              filled: true,
              fillColor: Colors.grey.shade100,
            ),
          ),
          const SizedBox(height: 16),
          const Text('Layover Date',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _layoverDateController,
            readOnly: true,
            onTap: _pickLayoverDate,
            decoration: InputDecoration(
              hintText: 'Select layover date',
              prefixIcon:
                  const Icon(Icons.calendar_today, color: Color(0xFF25D097)),
              suffixIcon: const Icon(Icons.arrow_drop_down),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
              filled: true,
              fillColor: Colors.grey.shade100,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Arrival Time',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _arrivalController,
                      readOnly: true,
                      onTap: _pickArrivalTime,
                      decoration: InputDecoration(
                        hintText: 'Arrival',
                        prefixIcon: const Icon(Icons.access_time,
                            color: Color(0xFF25D097)),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none),
                        filled: true,
                        fillColor: Colors.grey.shade100,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Departure Time',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _departureController,
                      readOnly: true,
                      onTap: _pickDepartureTime,
                      decoration: InputDecoration(
                        hintText: 'Departure',
                        prefixIcon: const Icon(Icons.access_time,
                            color: Color(0xFF25D097)),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none),
                        filled: true,
                        fillColor: Colors.grey.shade100,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: state.isLoading ||
                      _cityController.text.isEmpty ||
                      _airportController.text.isEmpty ||
                      _selectedLayoverDate == null ||
                      _arrivalTime == null ||
                      _departureTime == null
                  ? null
                  : () => notifier.searchByLayover(
                        _cityController.text,
                        _airportController.text,
                        _selectedLayoverDate!,
                        _arrivalTime!,
                        _departureTime!,
                      ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D097),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: state.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Find Travelers',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
            ),
          ),
          if (state.searchResults.isNotEmpty) ...[
            const SizedBox(height: 32),
            Text('Found ${state.searchResults.length} travelers',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...state.searchResults.map((user) => _buildUserCard(user)),
          ],
        ],
      ),
    );
  }

  Widget _buildUserCard(User user) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundImage: user.profileImage != null
                  ? NetworkImage(user.profileImage!)
                  : null,
              child: user.profileImage == null
                  ? Text('${user.firstName[0]}${user.lastName[0]}',
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold))
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${user.firstName} ${user.lastName}',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
                  if (user.bio != null) ...[
                    const SizedBox(height: 4),
                    Text(user.bio!,
                        style: TextStyle(
                            color: Colors.grey.shade600, fontSize: 14),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                  ],
                  if (user.interests.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 4,
                      children: user.interests
                          .take(3)
                          .map((interest) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color:
                                      const Color(0xFF25D097).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(interest.name,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF25D097))),
                              ))
                          .toList(),
                    ),
                  ],
                ],
              ),
            ),
            Column(
              children: [
                ElevatedButton(
                  onPressed: () => _requestChat(context, ref, user,
                      _tabController.index == 0 ? 'flight' : 'layover'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D097),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20)),
                  ),
                  child: const Text('Request Chat',
                      style: TextStyle(fontSize: 12, color: Colors.white)),
                ),
                TextButton(
                  onPressed: () => _showUserProfile(context, user),
                  child: const Text('View Profile',
                      style: TextStyle(fontSize: 12, color: Color(0xFF25D097))),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Función para manejar request de chat
  void _requestChat(
      BuildContext context, WidgetRef ref, User user, String type) {
    String initialMessage;

    if (type == 'flight') {
      final flightNumber = _flightController.text.trim();
      final date = _selectedFlightDate;
      initialMessage =
          'Hi ${user.firstName}! I saw we\'re both on flight $flightNumber on ${date?.day}/${date?.month}/${date?.year}. Would you like to connect and maybe meet up at the airport? ✈️';
    } else {
      final city = _cityController.text.trim();
      final airport = _airportController.text.trim();
      initialMessage =
          'Hi ${user.firstName}! I noticed we both have layovers in $city at $airport. Want to explore the city together during our layover? 🌍';
    }

    // Crear la conversación
    ref
        .read(chatNotifierProvider.notifier)
        .createConversation(user, initialMessage);

    // Mostrar confirmación
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Chat started with ${user.firstName}!'),
        backgroundColor: const Color(0xFF25D097),
        action: SnackBarAction(
          label: 'View Chat',
          textColor: Colors.white,
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) =>
                    ChatDetailScreen(conversationId: 'conv_${user.id}'),
              ),
            );
          },
        ),
      ),
    );
  }

  // Función para mostrar perfil
  void _showUserProfile(BuildContext context, User user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              CircleAvatar(
                radius: 50,
                backgroundImage: user.profileImage != null
                    ? NetworkImage(user.profileImage!)
                    : null,
                child: user.profileImage == null
                    ? Text('${user.firstName[0]}${user.lastName[0]}',
                        style: const TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold))
                    : null,
              ),
              const SizedBox(height: 16),
              Text('${user.firstName} ${user.lastName}',
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold)),
              Text(user.email,
                  style: const TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 20),
              if (user.bio != null) ...[
                Text(user.bio!,
                    style: const TextStyle(fontSize: 16),
                    textAlign: TextAlign.center),
                const SizedBox(height: 20),
              ],
              if (user.interests.isNotEmpty) ...[
                const Text('Interests',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: user.interests
                      .map((interest) => Chip(
                            label: Text(interest.name),
                            backgroundColor:
                                const Color(0xFF25D097).withOpacity(0.1),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 20),
              ],
              const Spacer(),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _requestChat(context, ref, user,
                            _tabController.index == 0 ? 'flight' : 'layover');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D097),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Start Chat',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF25D097),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: Color(0xFF25D097)),
                      ),
                      child: const Text('Close',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _pickFlightDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null) {
      setState(() {
        _selectedFlightDate = date;
        _flightDateController.text = '${date.day}/${date.month}/${date.year}';
      });
    }
  }

  void _pickLayoverDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null) {
      setState(() {
        _selectedLayoverDate = date;
        _layoverDateController.text = '${date.day}/${date.month}/${date.year}';
      });
    }
  }

  void _pickArrivalTime() async {
    final time =
        await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (time != null) {
      setState(() {
        _arrivalTime = DateTime(2024, 1, 1, time.hour, time.minute);
        _arrivalController.text = time.format(context);
      });
    }
  }

  void _pickDepartureTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now().replacing(hour: TimeOfDay.now().hour + 2),
    );
    if (time != null) {
      setState(() {
        _departureTime = DateTime(2024, 1, 1, time.hour, time.minute);
        _departureController.text = time.format(context);
      });
    }
  }
}
