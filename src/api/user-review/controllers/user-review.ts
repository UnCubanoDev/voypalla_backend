// import { factories } from '@strapi/strapi';

// export default factories.createCoreController(
//   'api::user-review.user-review',
//   ({ strapi }) => ({
//     async create(ctx) {
//       const { trip: tripId } = ctx.request.body.data;

//       // Verificar si ya existe una reseña para este viaje
//       const existingReview = await strapi.entityService.findMany<any, any>(
//         'api::user-review.user-review',
//         {
//           filters: { trip: tripId },
//         }
//       );

//       if (Array.isArray(existingReview) && existingReview.length > 0) {
//         return ctx.badRequest('Ya existe una reseña para este viaje');
//       }

//       const response = await super.create(ctx);

//       // Notificar al usuario sobre la nueva reseña
//       const review = await strapi.entityService.findOne<any, any>(
//         'api::user-review.user-review',
//         response.data.id,
//         { populate: ['user'] }
//       );

//       if (review.user?.fcmToken) {
//         await strapi.service('api::notification.notification').send({
//           token: review.user.fcmToken,
//           notification: {
//             title: 'Nueva reseña recibida',
//             body: `Has recibido una calificación de ${review.rating} estrellas`,
//           },
//           data: {
//             type: 'new_review',
//             reviewId: review.id.toString(),
//           },
//         });
//       }

//       return response;
//     },
//   })
// );
