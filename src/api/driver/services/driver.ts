/**
 * driver service
 */

import { factories } from '@strapi/strapi';

const enhanced = factories.createCoreService(
  'api::driver.driver',
  ({ strapi }) => ({
    async afterCreate(result, data) {
      // Obtener la configuración
      const config = await strapi.entityService.findMany(
        'api::configuration.configuration'
      );
      const initialBalance = config?.[0]?.InitialWalletBalance || 100; // valor por defecto si no hay configuración

      // Crear wallet con el balance configurado
      await strapi.entityService.create('api::wallet.wallet', {
        data: {
          balance: initialBalance,
          driver: result.id,
          publishedAt: new Date(),
        },
      });

      return result;
    },
  })
);

export default enhanced;
