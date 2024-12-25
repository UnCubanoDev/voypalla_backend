/**
 * proposal controller
 */

import { factories } from '@strapi/strapi';

interface ProposalWithRelations {
  id: number;
  driver?: {
    id: number;
    user?: {
      fcmToken?: string;
    };
  };
}

const enhanced = factories.createCoreController(
  'api::proposal.proposal',
  ({ strapi }) => ({
    async create(ctx) {
      const response = await super.create(ctx);

      // Obtener el viaje y el usuario asociado
      const trip = (await strapi.entityService.findOne(
        'api::trip.trip',
        response.data.trip.id,
        {
          populate: ['user'],
        }
      )) as any;

      // Notificar al usuario
      await strapi
        .service('api::notification.notification')
        .notifyUserNewProposal(trip.user.id, response.data);

      return response;
    },
    async update(ctx) {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Si la propuesta está siendo aceptada
      if (data.porposal_status === 'Aceptada') {
        // Obtener la propuesta actual con el viaje relacionado
        const proposal: any = await strapi.entityService.findOne(
          'api::proposal.proposal',
          id,
          {
            populate: ['trip', 'driver.user'],
          }
        );

        // Notificar al conductor que su propuesta fue aceptada
        if (proposal.driver?.user?.fcmToken) {
          await strapi.service('api::notification.notification').send({
            token: proposal.driver.user.fcmToken,
            notification: {
              title: 'Propuesta aceptada',
              body: '¡Felicitaciones! Tu propuesta ha sido aceptada',
            },
            data: {
              type: 'proposal_accepted',
              tripId: proposal.trip.id.toString(),
            },
          });
        }

        // Obtener todas las otras propuestas para este viaje
        const otherProposals =
          ((await strapi.entityService.findMany('api::proposal.proposal', {
            filters: {
              trip: proposal.trip.id,
              id: {
                $ne: id,
              },
            },
            populate: ['driver.user'],
          })) as unknown as ProposalWithRelations[]) || [];

        // Rechazar todas las otras propuestas
        for (const otherProposal of otherProposals) {
          await strapi.entityService.update(
            'api::proposal.proposal',
            otherProposal.id,
            {
              data: {
                porposal_status: 'Rechazada',
              },
            }
          );

          // Notificar a cada conductor que su propuesta fue rechazada
          if (otherProposal.driver?.user?.fcmToken) {
            await strapi.service('api::notification.notification').send({
              token: otherProposal.driver.user.fcmToken,
              notification: {
                title: 'Propuesta no seleccionada',
                body: 'Lo sentimos, otra propuesta fue seleccionada para este viaje',
              },
              data: {
                type: 'proposal_rejected',
                tripId: proposal.trip.id.toString(),
              },
            });
          }
        }

        // Actualizar el estado del viaje
        await strapi.entityService.update('api::trip.trip', proposal.trip.id, {
          data: {
            status_trip: 'En Espera',
            driver: proposal.driver.id,
          },
        });
      }

      // Continuar con la actualización normal de la propuesta
      const response = await super.update(ctx);
      return response;
    },
  })
);

export default enhanced;
