require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Expense = require('../models/Expense');

const sampleTrips = [
  {
    name: 'Goa Coastal Escapade',
    destination: 'Goa, India',
    startDate: new Date('2026-11-15'),
    endDate: new Date('2026-11-20'),
    estimatedBudget: 45000,
    travelers: 2,
    notes: 'Sunsets at Vagator, water sports in Calangute, and exploring Portuguese heritage in Fontainhas.',
    status: 'Planned',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    itineraries: [
      { activityName: 'Check-in & Sunset at Vagator Beach', date: new Date('2026-11-15'), time: '04:30 PM', location: 'Vagator Beach', notes: 'Relax and catch golden hour at Thalassa.' },
      { activityName: 'Heritage Walk in Fontainhas Latin Quarter', date: new Date('2026-11-16'), time: '10:00 AM', location: 'Panaji', notes: 'Admire Portuguese architecture and local cafes.' },
      { activityName: 'Scuba Diving & Dolphin Cruise', date: new Date('2026-11-17'), time: '08:00 AM', location: 'Grande Island', notes: 'Booked morning session with certified instructors.' },
      { activityName: 'Spice Plantation Tour & Goan Lunch', date: new Date('2026-11-18'), time: '11:30 AM', location: 'Ponda', notes: 'Traditional buffet lunch with feni tasting.' }
    ],
    expenses: [
      { category: 'Transport', description: 'Flight Tickets (Round trip Mumbai-Goa)', amount: 14000, date: new Date('2026-10-20') },
      { category: 'Accommodation', description: 'Beachfront Resort in Anjuna (5 nights)', amount: 18500, date: new Date('2026-10-22') },
      { category: 'Activities & Sightseeing', description: 'Scuba Diving & Island Cruise for 2', amount: 5500, date: new Date('2026-10-25') },
      { category: 'Food & Dining', description: 'Thalassa Sunset Dinner Reservation', amount: 3200, date: new Date('2026-10-26') }
    ]
  },
  {
    name: 'Himalayan Highs: Manali & Solang',
    destination: 'Manali, Himachal Pradesh',
    startDate: new Date('2026-12-05'),
    endDate: new Date('2026-12-11'),
    estimatedBudget: 38000,
    travelers: 3,
    notes: 'Snow activities, paragliding at Solang Valley, hot springs in Vashisht, cafe hopping in Old Manali.',
    status: 'Planned',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    itineraries: [
      { activityName: 'Volvo Arrival & Old Manali Cafe Hopping', date: new Date('2026-12-05'), time: '11:00 AM', location: 'Old Manali', notes: 'Try trout fish and wood-fired pizza.' },
      { activityName: 'Solang Valley Snow Adventure & Skiing', date: new Date('2026-12-06'), time: '09:00 AM', location: 'Solang Valley', notes: 'Rent winter suits and gear near Atal Tunnel.' },
      { activityName: 'Jogini Waterfall Trek', date: new Date('2026-12-07'), time: '08:30 AM', location: 'Vashisht', notes: 'Scenic 3-hour pine forest hike.' },
      { activityName: 'Atal Tunnel & Sissu Day Excursion', date: new Date('2026-12-08'), time: '10:00 AM', location: 'Lahaul Valley', notes: 'Drive through the longest highway tunnel above 10,000 feet.' }
    ],
    expenses: [
      { category: 'Transport', description: 'Overnight Volvo Coach (Delhi to Manali)', amount: 6200, date: new Date('2026-10-18') },
      { category: 'Accommodation', description: 'Mountain View Cottage in Old Manali', amount: 15000, date: new Date('2026-10-21') },
      { category: 'Activities & Sightseeing', description: 'Solang Valley Skiing & Snowmobile passes', amount: 4800, date: new Date('2026-10-24') }
    ]
  },
  {
    name: 'Royal Heritage Tour of Jaipur',
    destination: 'Jaipur, Rajasthan',
    startDate: new Date('2026-10-10'),
    endDate: new Date('2026-10-14'),
    estimatedBudget: 28000,
    travelers: 2,
    notes: 'Forts, palaces, vibrant Johari Bazaar jewelry, and authentic Rajasthani thali at Chokhi Dhani.',
    status: 'Completed',
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    itineraries: [
      { activityName: 'Sunrise at Nahargarh Fort', date: new Date('2026-10-10'), time: '06:00 AM', location: 'Nahargarh Fort', notes: 'Panoramic sunrise over the Pink City.', isCompleted: true },
      { activityName: 'Amer Fort & Sheesh Mahal Tour', date: new Date('2026-10-11'), time: '09:30 AM', location: 'Amer', notes: 'Audio guide tour of mirror palace.', isCompleted: true },
      { activityName: 'Hawa Mahal & City Palace Visit', date: new Date('2026-10-12'), time: '11:00 AM', location: 'Old City Jaipur', notes: 'Photography at Wind View Cafe.', isCompleted: true },
      { activityName: 'Evening Cultural Feast at Chokhi Dhani', date: new Date('2026-10-13'), time: '07:00 PM', location: 'Tonk Road', notes: 'Folk dance, puppet show, and Dal Baati Churma.', isCompleted: true }
    ],
    expenses: [
      { category: 'Transport', description: 'Express Train Tickets & Local Cab', amount: 5600, date: new Date('2026-10-05') },
      { category: 'Accommodation', description: 'Haveli Heritage Stay (4 nights)', amount: 11200, date: new Date('2026-10-06') },
      { category: 'Food & Dining', description: 'Chokhi Dhani Dinner & Local Eateries', amount: 4200, date: new Date('2026-10-12') },
      { category: 'Shopping', description: 'Handcrafted Blue Pottery & Bandhani textiles', amount: 4500, date: new Date('2026-10-13') }
    ]
  },
  {
    name: 'Bali Tropical Paradise & Temples',
    destination: 'Bali, Indonesia',
    startDate: new Date('2026-10-25'),
    endDate: new Date('2026-11-02'),
    estimatedBudget: 95000,
    travelers: 2,
    notes: 'Ubud lush rice terraces, waterfalls, Uluwatu cliff sunset kecak dance, and Canggu cafe culture.',
    status: 'Ongoing',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    itineraries: [
      { activityName: 'Tegalalang Rice Terraces & Jungle Swing', date: new Date('2026-10-26'), time: '09:00 AM', location: 'Ubud', notes: 'Spectacular green valleys and floating breakfast.', isCompleted: true },
      { activityName: 'Sacred Monkey Forest Sanctuary', date: new Date('2026-10-27'), time: '02:00 PM', location: 'Padangtegal, Ubud', notes: 'Keep sunglasses and loose belongings safe.' },
      { activityName: 'Uluwatu Sunset Temple & Kecak Fire Dance', date: new Date('2026-10-29'), time: '05:30 PM', location: 'Uluwatu Cliffs', notes: 'Arrive early to get amphitheater front seats.' },
      { activityName: 'Nusa Penida Island Speedboat Day Tour', date: new Date('2026-10-31'), time: '07:00 AM', location: 'Sanur Harbor', notes: 'Visit Kelingking T-Rex cliff and Angel Billabong.' }
    ],
    expenses: [
      { category: 'Transport', description: 'International Roundtrip Flights', amount: 42000, date: new Date('2026-09-15') },
      { category: 'Accommodation', description: 'Private Pool Villa in Ubud & Seminyak', amount: 28000, date: new Date('2026-09-20') },
      { category: 'Activities & Sightseeing', description: 'Nusa Penida Private Tour & Snorkeling', amount: 7200, date: new Date('2026-10-22') },
      { category: 'Food & Dining', description: 'Beach Club & Organic Cafes in Canggu', amount: 6800, date: new Date('2026-10-25') }
    ]
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triptide_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing TripTide collections...');
    await Trip.deleteMany({});
    await Itinerary.deleteMany({});
    await Expense.deleteMany({});

    console.log('Inserting seed sample trips, itineraries, and expenses...');
    for (const tripData of sampleTrips) {
      const { itineraries, expenses, ...tripFields } = tripData;
      const createdTrip = await Trip.create(tripFields);

      if (itineraries && itineraries.length > 0) {
        const itinsWithId = itineraries.map(item => ({ ...item, tripId: createdTrip._id }));
        await Itinerary.insertMany(itinsWithId);
      }

      if (expenses && expenses.length > 0) {
        const expsWithId = expenses.map(item => ({ ...item, tripId: createdTrip._id }));
        await Expense.insertMany(expsWithId);
      }

      console.log(`✨ Created trip: "${createdTrip.name}" with ${itineraries.length} activities & ${expenses.length} expenses.`);
    }

    console.log('🎉 Seed completed successfully! All records saved in real MongoDB database "triptide_db".');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seed();
