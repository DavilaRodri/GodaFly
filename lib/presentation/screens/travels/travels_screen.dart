import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/travel_provider.dart';

class TravelsScreen extends ConsumerWidget {
  const TravelsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myTravels = ref.watch(myTravelsProvider);

    // Mock data para travels con imágenes
    final mockTravels = [
      {
        'id': '1',
        'type': 'flight',
        'title': 'Flight AA1234 to Paris',
        'subtitle': 'Paris, France',
        'date': DateTime.now().add(const Duration(days: 2)),
        'image':
            'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80',
        'status': 'upcoming',
        'details': {
          'departure': 'JFK Airport',
          'arrival': 'Charles de Gaulle',
          'time': '14:30',
          'duration': '7h 45m',
          'seat': '12A',
        }
      },
      {
        'id': '2',
        'type': 'layover',
        'title': 'Layover in Tokyo',
        'subtitle': 'Tokyo, Japan',
        'date': DateTime.now().add(const Duration(days: 5)),
        'image':
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        'status': 'upcoming',
        'details': {
          'airport': 'Haneda Airport',
          'duration': '8 hours',
          'arrival': '09:15',
          'departure': '17:30',
        }
      },
      {
        'id': '3',
        'type': 'flight',
        'title': 'Flight BA567 to London',
        'subtitle': 'London, United Kingdom',
        'date': DateTime.now().subtract(const Duration(days: 3)),
        'image':
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
        'status': 'completed',
        'details': {
          'departure': 'LAX Airport',
          'arrival': 'Heathrow',
          'time': '22:15',
          'duration': '11h 20m',
          'seat': '8C',
        }
      },
      {
        'id': '4',
        'type': 'layover',
        'title': 'Layover in Dubai',
        'subtitle': 'Dubai, UAE',
        'date': DateTime.now().subtract(const Duration(days: 10)),
        'image':
            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
        'status': 'completed',
        'details': {
          'airport': 'Dubai International',
          'duration': '6 hours',
          'arrival': '14:00',
          'departure': '20:00',
        }
      },
      {
        'id': '5',
        'type': 'flight',
        'title': 'Flight LH456 to Berlin',
        'subtitle': 'Berlin, Germany',
        'date': DateTime.now().subtract(const Duration(days: 15)),
        'image':
            'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80',
        'status': 'completed',
        'details': {
          'departure': 'Frankfurt Airport',
          'arrival': 'Berlin Brandenburg',
          'time': '16:45',
          'duration': '1h 15m',
          'seat': '15F',
        }
      },
    ];

    final upcomingTravels =
        mockTravels.where((t) => t['status'] == 'upcoming').toList();
    final completedTravels =
        mockTravels.where((t) => t['status'] == 'completed').toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Travels'),
          backgroundColor: const Color(0xFF25D097),
          bottom: const TabBar(
            indicatorColor: Colors.white,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(icon: Icon(Icons.upcoming), text: 'Upcoming'),
              Tab(icon: Icon(Icons.history), text: 'Completed'),
              Tab(icon: Icon(Icons.analytics), text: 'Stats'),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Add new travel coming soon!')),
                );
              },
            ),
          ],
        ),
        body: TabBarView(
          children: [
            _buildUpcomingTab(context, upcomingTravels),
            _buildCompletedTab(context, completedTravels),
            _buildStatsTab(context, mockTravels),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingTab(
      BuildContext context, List<Map<String, dynamic>> travels) {
    if (travels.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.flight_takeoff, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No upcoming travels',
                style: TextStyle(fontSize: 18, color: Colors.grey)),
            Text('Plan your next adventure!',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: travels.length,
      itemBuilder: (context, index) {
        final travel = travels[index];
        return _buildTravelCard(context, travel, isUpcoming: true);
      },
    );
  }

  Widget _buildCompletedTab(
      BuildContext context, List<Map<String, dynamic>> travels) {
    if (travels.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No completed travels',
                style: TextStyle(fontSize: 18, color: Colors.grey)),
            Text('Your travel history will appear here',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: travels.length,
      itemBuilder: (context, index) {
        final travel = travels[index];
        return _buildTravelCard(context, travel, isUpcoming: false);
      },
    );
  }

  Widget _buildTravelCard(BuildContext context, Map<String, dynamic> travel,
      {required bool isUpcoming}) {
    final date = travel['date'] as DateTime;
    final details = travel['details'] as Map<String, dynamic>;
    final isLayover = travel['type'] == 'layover';

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image header
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Stack(
              children: [
                Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage(travel['image']),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.7),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 16,
                  right: 16,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isUpcoming ? const Color(0xFF25D097) : Colors.grey,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isLayover
                              ? Icons.connecting_airports
                              : Icons.flight_takeoff,
                          color: Colors.white,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isLayover ? 'Layover' : 'Flight',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        travel['title'],
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        travel['subtitle'],
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date
                Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        color: Color(0xFF25D097), size: 16),
                    const SizedBox(width: 8),
                    Text(
                      '${date.day}/${date.month}/${date.year}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isUpcoming
                            ? Colors.orange.withOpacity(0.1)
                            : Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        isUpcoming ? 'Upcoming' : 'Completed',
                        style: TextStyle(
                          color: isUpcoming ? Colors.orange : Colors.green,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Details
                if (isLayover) ...[
                  _buildDetailRow(
                      Icons.local_airport, 'Airport', details['airport']),
                  _buildDetailRow(
                      Icons.access_time, 'Duration', details['duration']),
                  _buildDetailRow(
                      Icons.flight_land, 'Arrival', details['arrival']),
                  _buildDetailRow(
                      Icons.flight_takeoff, 'Departure', details['departure']),
                ] else ...[
                  _buildDetailRow(
                      Icons.flight_takeoff, 'From', details['departure']),
                  _buildDetailRow(Icons.flight_land, 'To', details['arrival']),
                  _buildDetailRow(Icons.access_time, 'Time', details['time']),
                  _buildDetailRow(
                      Icons.schedule, 'Duration', details['duration']),
                  if (details['seat'] != null)
                    _buildDetailRow(Icons.airline_seat_recline_normal, 'Seat',
                        details['seat']),
                ],

                const SizedBox(height: 16),

                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showTravelDetails(context, travel),
                        icon: const Icon(Icons.info_outline, size: 16),
                        label: const Text('Details'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF25D097),
                          side: const BorderSide(color: Color(0xFF25D097)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _findTravelers(context, travel),
                        icon: const Icon(Icons.people, size: 16),
                        label: const Text('Find Travelers'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D097),
                          foregroundColor: Colors.white,
                        ),
                      ),
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

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey, size: 16),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: const TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsTab(
      BuildContext context, List<Map<String, dynamic>> travels) {
    final totalTravels = travels.length;
    final flightCount = travels.where((t) => t['type'] == 'flight').length;
    final layoverCount = travels.where((t) => t['type'] == 'layover').length;
    final countriesVisited = travels.map((t) => t['subtitle']).toSet().length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Travel Statistics',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),

          // Stats grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildStatCard('Total Travels', '$totalTravels', Icons.flight,
                  const Color(0xFF25D097)),
              _buildStatCard(
                  'Flights', '$flightCount', Icons.flight_takeoff, Colors.blue),
              _buildStatCard('Layovers', '$layoverCount',
                  Icons.connecting_airports, Colors.orange),
              _buildStatCard(
                  'Countries', '$countriesVisited', Icons.public, Colors.green),
            ],
          ),

          const SizedBox(height: 32),

          // Travel timeline
          const Text(
            'Travel Timeline',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),

          ...travels.map((travel) => _buildTimelineItem(travel)).toList(),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: color,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(Map<String, dynamic> travel) {
    final date = travel['date'] as DateTime;
    final isUpcoming = date.isAfter(DateTime.now());

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: isUpcoming ? const Color(0xFF25D097) : Colors.grey,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    travel['title'],
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${date.day}/${date.month}/${date.year}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showTravelDetails(BuildContext context, Map<String, dynamic> travel) {
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
            crossAxisAlignment: CrossAxisAlignment.start,
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
              Text(
                travel['title'],
                style:
                    const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                travel['subtitle'],
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 20),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  travel['image'],
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D097),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Close',
                      style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _findTravelers(BuildContext context, Map<String, dynamic> travel) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Searching for travelers on ${travel['title']}...'),
        backgroundColor: const Color(0xFF25D097),
        action: SnackBarAction(
          label: 'Go to Search',
          textColor: Colors.white,
          onPressed: () {
            // Aquí podrías navegar al SearchScreen con datos pre-rellenados
          },
        ),
      ),
    );
  }
}
