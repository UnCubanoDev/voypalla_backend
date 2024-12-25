/**
 * driver controller
 */

import { factories } from '@strapi/strapi';
import { getDistance } from 'geolib';

export default factories.createCoreController(
  'api::driver.driver',
  ({ strapi }: { strapi }) => ({
    async updateLocation(ctx) {
      try {
        const { id } = ctx.params;
        const { latitude, longitude } = ctx.request.body;

        // Validar datos de entrada
        if (!latitude || !longitude) {
          return ctx.badRequest('Latitude and longitude are required');
        }

        // Validar que el conductor existe y está disponible
        const driver = await strapi.entityService.findOne(
          'api::driver.driver',
          id,
          {
            fields: ['*'],
          }
        );

        if (!driver) {
          return ctx.notFound('Driver not found');
        }

        if (!driver.availability) {
          return ctx.badRequest('Driver must be available to update location');
        }

        // Actualizar ubicación del conductor
        const updatedDriver = await strapi.entityService.update(
          'api::driver.driver',
          id,
          {
            data: {
              current_location: {
                type: 'point',
                coordinates: [longitude, latitude],
              },
              last_location_update: new Date(),
            },
          }
        );

        // Solo notificar sobre viajes cercanos si está disponible
        await strapi
          .service('api::notification.notification')
          .notifyDriverAboutNearbyTrips(id, { latitude, longitude });

        return ctx.send({
          data: updatedDriver,
          message: 'Location updated successfully',
        });
      } catch (error) {
        console.error('Error updating driver location:', error);
        return ctx.internalServerError('Error updating location');
      }
    },
    async findNearby(ctx) {
      try {
        const { latitude, longitude } = ctx.query;

        if (!latitude || !longitude) {
          return ctx.badRequest('Se requiere latitud y longitud');
        }

        // Obtener todos los conductores disponibles
        const drivers = await strapi.entityService.findMany(
          'api::driver.driver',
          {
            filters: {
              availability: true,
            },
            populate: ['current_location', 'user'],
          }
        );

        // Filtrar conductores en un radio de 5km
        const nearbyDrivers = drivers.filter((driver) => {
          if (!driver.current_location) return false;

          const distance = getDistance(
            {
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
            {
              latitude: driver.current_location.latitude,
              longitude: driver.current_location.longitude,
            }
          );

          return distance <= 5000; // 5km en metros
        });

        return { data: nearbyDrivers };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
