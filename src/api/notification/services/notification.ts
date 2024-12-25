import * as admin from 'firebase-admin';
import { getDistance } from 'geolib';

// Inicializar Firebase Admin
const firebaseConfig = {
  apiKey: 'AIzaSyB-jtqf4oIu0vnIT5GOQP9aoPbZcpMa5-0',
  authDomain: 'voypalla-cf6ec.firebaseapp.com',
  projectId: 'voypalla-cf6ec',
  storageBucket: 'voypalla-cf6ec.firebasestorage.app',
  messagingSenderId: '224686330348',
  appId: '1:224686330348:web:dca2e189448fa9984ff0c9',
  measurementId: 'G-FMH33E26C8',
};
admin.initializeApp(firebaseConfig);

const notificationService = ({ strapi }) => ({
  async notifyNearbyDrivers(origin, tripId) {
    // Obtener todos los conductores disponibles
    const availableDrivers = await strapi.entityService.findMany(
      'api::driver.driver',
      {
        filters: { availability: true },
        populate: ['user', 'current_location'],
      }
    );

    // Filtrar conductores en un radio de 5km
    const nearbyDrivers = availableDrivers.filter((driver) => {
      const distance = getDistance(
        { latitude: origin.latitude, longitude: origin.longitude },
        {
          latitude: driver.current_location.latitude,
          longitude: driver.current_location.longitude,
        }
      );
      return distance <= 5000; // 5km en metros
    });

    // Enviar notificación a cada conductor cercano
    const notifications = {
      tokens: nearbyDrivers.map((driver) => driver.user.fcmToken),
      notification: {
        title: '¡Nuevo viaje disponible!',
        body: 'Hay un nuevo viaje cerca de tu ubicación',
      },
      data: {
        tripId: tripId.toString(),
        type: 'new_trip',
      },
    };

    return admin.messaging().sendEachForMulticast(notifications);
  },

  async notifyUserNewProposal(userId, proposalData) {
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      userId,
      {
        populate: ['*'],
      }
    );

    if (!user.fcmToken) return;

    const message = {
      token: user.fcmToken,
      notification: {
        title: 'Nueva propuesta recibida',
        body: `Un conductor ha enviado una propuesta por $${proposalData.price}`,
      },
      data: {
        proposalId: proposalData.id.toString(),
        type: 'new_proposal',
      },
    };

    return admin.messaging().send(message);
  },
});

export default notificationService;
