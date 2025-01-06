/**
 * client controller
 */

// src/api/client/controllers/client.ts

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::client.client',
  ({ strapi }) => ({
    async create(ctx) {
      const { username, email, password, name, phone, image, type } =
        ctx.request.body;

      // Verificar que los campos requeridos no sean nulos
      if (!username || !password || !phone || !name) {
        return ctx.badRequest('Todos los campos son requeridos.');
      }

      try {
        // Crear el usuario
        const user = await strapi.entityService.create(
          'plugin::users-permissions.user',
          {
            data: {
              username,
              email,
              password,
              confirmed: true,
              blocked: false,
              type: type || 'pasajero',
              name,
              phone,
              image: image || null,
              provider: 'local',
            },
          }
        );

        if (type === 'taxista') {
          const driver = await strapi.entityService.create(
            'api::driver.driver',
            {
              data: {
                availability: false,
              },
            }
          );
          const client = await strapi.entityService.create(
            'api::client.client',
            {
              data: {
                username,
                email,
                password,
                confirmed: true,
                blocked: false,
                type: 'taxista',
                name,
                phone,
                image: image || null,
                role: user.id,
                driver: driver.id,
                userID: user.id,
                driverID: driver.id,
              },
            }
          );
          // Obtener el InitialWalletBalance de la configuración
          const config = await strapi.entityService.findMany(
            'api::configuration.configuration'
          );
          const initialWalletBalance = config?.[0]?.InitialWalletBalance || 0; // valor por defecto
          const wallet = await strapi.entityService.create(
            'api::wallet.wallet',
            {
              data: {
                balance: initialWalletBalance,
                driver: driver.id,
              },
            }
          );
          return { user, client, driver, wallet };
        } else {
          // Crear el cliente con los mismos datos del usuario
          const client = await strapi.entityService.create(
            'api::client.client',
            {
              data: {
                username,
                email,
                password,
                confirmed: true,
                blocked: false,
                type: 'pasajero',
                name,
                phone,
                image: image || null,
                role: user.id,
              },
            }
          );
          return { user, client };
        }
      } catch (error) {
        return ctx.internalServerError(
          'Error al crear el cliente: ' + error.message
        );
      }
    },
    async update(ctx) {
      const { id } = ctx.params;
      const { username, email, name, phone, image } = ctx.request.body;

      // Verificar que el cliente existe
      const client = await strapi.entityService.findOne(
        'api::client.client',
        id
      );
      if (!client) {
        return ctx.notFound('Cliente no encontrado');
      }

      // Actualizar el cliente
      const updatedClient = await strapi.entityService.update(
        'api::client.client',
        id,
        {
          data: {
            username,
            email,
            name,
            phone,
            image,
          },
        }
      );

      // Actualizar el usuario asociado
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        client.userID,
        {
          data: {
            username,
            email,
            name,
            phone,
            image,
          },
        }
      );

      return { client: updatedClient };
    },
    async delete(ctx) {
      const { id } = ctx.params;

      // Verificar que el cliente existe
      const client = await strapi.entityService.findOne(
        'api::client.client',
        id
      );

      if (!client) {
        return ctx.notFound('Cliente no encontrado');
      }

      // Eliminar el usuario asociado
      await strapi.entityService.delete(
        'plugin::users-permissions.user',
        client.userID
      );

      // Si el tipo es 'taxista' y el driver existe, eliminar el driver
      if (client.type === 'taxista') {
        await strapi.entityService.delete(
          'api::driver.driver',
          client.driverID
        );
      }

      // Eliminar el cliente
      await strapi.entityService.delete('api::client.client', id);

      return ctx.send({
        message:
          client.type === 'taxista'
            ? 'Taxista eliminado correctamente.'
            : 'Cliente eliminado correctamente.',
      });
    },
  })
);
