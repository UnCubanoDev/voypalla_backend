// import { factories } from '@strapi/strapi';

// export default factories.createCoreController(
//   'api::driver-review.driver-review',
//   ({ strapi }) => ({
//     async create(ctx) {
//       const { trip: tripId } = ctx.request.body.data;

//       // Verificar si ya existe una reseña para este viaje
//       const existingReview = await strapi.entityService.findMany('api::driver-review.driver-review', {
//         filters: { trip: tripId },
//       });

//       if (existingReview.length > 0) {
//         return ctx.badRequest('Ya existe una reseña para este viaje');
//       }

//       const response = await super.create(ctx);

//       // Notificar al conductor sobre la nueva reseña
//       const review = await strapi.entityService.findOne(
//         'api::driver-review.driver-review',
//         response.data.id,
//         { populate: ['driver.user'] }
//       );

//       if (review.driver?.user?.fcmToken) {
//         await strapi.service('api::notification.notification').send({
//           token: review.driver.user.fcmToken,
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
