import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:godafly/presentation/providers/notification_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/travel_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/travel_provider.dart';
import '../notifications/notification_screen.dart';
import '../../../domain/entities/travel.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final myTravels = ref.watch(myTravelsProvider);
    final unreadCount = ref.watch(unreadNotificationCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Hello ${user?.firstName ?? 'Traveler'}!'),
        backgroundColor: const Color(0xFF25D097),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const NotificationScreen(),
                    ),
                  );
                },
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '$unreadCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick stats cards
            Row(
              children: [
                Expanded(
                  child: _buildStatsCard(
                    context,
                    'Total Travels',
                    '${myTravels.length}',
                    Icons.flight_takeoff,
                    const Color(0xFF25D097),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatsCard(
                    context,
                    'Notifications',
                    '$unreadCount',
                    Icons.notifications,
                    Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            Text(
              'My Recent Travels',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            Expanded(
              child: myTravels.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.flight_takeoff,
                              size: 64, color: Colors.grey),
                          SizedBox(height: 16),
                          Text('No travels yet',
                              style:
                                  TextStyle(fontSize: 18, color: Colors.grey)),
                          Text('Start by searching for flights or layovers!',
                              style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: myTravels.length,
                      itemBuilder: (context, index) {
                        final travel = myTravels[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: Icon(
                              travel.type == TravelType.flight
                                  ? Icons.flight_takeoff
                                  : Icons.connecting_airports,
                              color: const Color(0xFF25D097),
                            ),
                            title: Text(
                              travel.type == TravelType.flight
                                  ? 'Flight ${travel.flightNumber ?? ""}'
                                  : 'Layover in ${travel.cityName ?? ""}',
                            ),
                            subtitle: Text(
                                '${travel.date.day}/${travel.date.month}/${travel.date.year}'),
                            trailing: const Icon(Icons.arrow_forward_ios),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
