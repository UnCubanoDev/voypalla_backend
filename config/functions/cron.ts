// module.exports = {
//   '0 9 * * *': async () => {
//     const subscriptions = await strapi.services.subscription.find({
//       end_date_lte: new Date(new Date().setDate(new Date().getDate() + 7)), // Vencimiento en los próximos 7 días
//       status: 'active',
//     });

//     subscriptions.forEach((subscription) => {
//       // Aquí podrías enviar un correo electrónico de aviso
//       // Usa la funcionalidad de notificación o correo de Strapi
//       console.log(
//         `Reminder: Your subscription for driver ${subscription.driver_id} is about to expire.`
//       );
//     });
//   },
// };
