export default () => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'VoyPaLlá API',
        description: '',
        termsOfService: '',
        contact: {
          name: 'VoyPaLlá Team',
          email: 'voypalla.app@gmail.com',
          url: 'voypalla.uncubano.dev',
        },
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
        },
      },
      'x-strapi-config': {
        // Leave empty to ignore plugins during generation
        plugins: ['upload', 'users-permissions'],
        path: '/documentation',
      },
      servers: [
        { url: 'http://localhost:8082/api', description: 'Development server' },
        {
          url: 'https://voypalla.uncubano.dev/api',
          description: 'Production server',
        },
      ],
      externalDocs: {
        description: 'Find out more',
        url: 'https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html',
      },
      security: [{ bearerAuth: [] }],
    },
  },
});
