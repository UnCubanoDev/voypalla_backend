/**
 * trip controller
 */

import { factories } from '@strapi/strapi';

const enhanced = factories.createCoreController(
  'api::trip.trip',
  ({ strapi }) => ({
    async update(ctx) {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Obtener el viaje actual
      const trip: any = await strapi.entityService.findOne(
        'api::trip.trip',
        id,
        {
          populate: ['driver'],
        }
      );

      // Cuando se asigna un conductor
      if (data.status_trip === 'En Espera' && trip?.driver?.id) {
        // Marcar conductor como no disponible
        await strapi.entityService.update(
          'api::driver.driver',
          trip.driver.id,
          {
            data: {
              availability: false,
            },
          }
        );

        // Obtener el porcentaje de comisión desde la configuración
        const config = await strapi.entityService.findMany(
          'api::configuration.configuration'
        );

        // Obtener hora actual
        const currentHour = new Date().getHours();

        // Determinar comisión basada en la hora
        const comisionPorcentaje =
          currentHour >= 22 || currentHour < 6
            ? config?.[0]?.NightCommission // Comisión nocturna
            : config?.[0]?.Commission; // Comisión normal

        // Calcular la comisión
        const comision = trip.base_price * (comisionPorcentaje / 100);

        // Obtener la wallet del conductor
        const wallet = await strapi.entityService.findMany(
          'api::wallet.wallet',
          {
            filters: {
              driver: trip.driver.id,
            },
          }
        );

        if (wallet && wallet.length > 0) {
          // Actualizar el balance de la wallet
          await strapi.entityService.update(
            'api::wallet.wallet',
            wallet[0].id,
            {
              data: {
                balance: wallet[0].balance - comision,
              },
            }
          );
        }
      }

      // Cuando el viaje se completa
      if (data.status_trip === 'Completado' && trip?.driver?.id) {
        // Marcar conductor como disponible nuevamente
        await strapi.entityService.update(
          'api::driver.driver',
          trip.driver.id,
          {
            data: {
              availability: true,
            },
          }
        );
      }

      // Continuar con la actualización normal del viaje
      const response = await super.update(ctx);

      // Si el viaje se completa, permitir reseñas
      if (data.status_trip === 'Completado') {
        interface TripWithRelations {
          id: number;
          driver?: {
            id: number;
            user?: {
              fcmToken?: string;
            };
          };
          user?: {
            id: number;
            fcmToken?: string;
          };
        }

        const trip = (await strapi.entityService.findOne('api::trip.trip', id, {
          populate: ['driver', 'user'],
        })) as TripWithRelations;

        // Notificar a ambas partes que pueden dejar reseña
        if (trip.driver?.user?.fcmToken) {
          await strapi.service('api::notification.notification').send({
            token: trip.driver.user.fcmToken,
            notification: {
              title: 'Viaje completado',
              body: '¡No olvides calificar a tu pasajero!',
            },
            data: {
              type: 'review_reminder',
              tripId: trip.id.toString(),
              userId: trip.user.id.toString(),
            },
          });
        }

        if (trip.user?.fcmToken) {
          await strapi.service('api::notification.notification').send({
            token: trip.user.fcmToken,
            notification: {
              title: 'Viaje completado',
              body: '¡Califica tu experiencia con el conductor!',
            },
            data: {
              type: 'review_reminder',
              tripId: trip.id.toString(),
              driverId: trip.driver.id.toString(),
            },
          });
        }
      }

      return response;
    },
    async create(ctx) {
      const response = await super.create(ctx);

      // Obtener la ubicación de origen del viaje
      const origin = response.data.origin.coordinates;

      // Notificar a los conductores cercanos
      await strapi
        .service('api::notification.notification')
        .notifyNearbyDrivers(
          { latitude: origin[1], longitude: origin[0] },
          response.data.id
        );

      return response;
    },
  })
);

export default enhanced;
