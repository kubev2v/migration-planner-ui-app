const path = require('path');

module.exports = {
  appUrl: '/openshift/migration-assessment',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  sassPrefix: '.assisted-migration-app, .assistedMigrationApp',
  interceptChromeConfig: false,
  plugins: [],
  hotReload: process.env.HOT === 'true',
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'], // Asegúrate de que Webpack puede resolver .js, .ts, .tsx
    fullySpecified: false, // Permite Webpack resolver sin extensión
    alias: {
      './MigrationIssuesInner': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/MigrationIssuesInner.js'),
      './VMResourceBreakdownHistogram': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/VMResourceBreakdownHistogram.js'),
      './Inventory': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Inventory.js'),
      './AgentProxy': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/AgentProxy.js'),
      './Agent': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Agent.js'),
      './InfraDatastoresInner': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/InfraDatastoresInner.js'),
      './InfraNetworksInner': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/InfraNetworksInner.js'),
      './EventData': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/EventData.js'),
      './VMs': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/VMs.js'),
      './VMResourceBreakdown': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/VMResourceBreakdown.js'),
      './VCenter': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/VCenter.js'),
      './Status': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Status.js'),
      './SourceUpdateOnPrem': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/SourceUpdateOnPrem.js'),
      './SourceCreate': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/SourceCreate.js'),
      './Source': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Source.js'),
      './PresignedUrl': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/PresignedUrl.js'),
      './ModelError': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/ModelError.js'),
      './Infra': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Infra.js'),
      './Event': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Event.js'),
      './AgentApi': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/apis/AgentApi.js'),
      '../models/index': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/index.js'),
      '../runtime': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/runtime.js'),
    }, 
  },
  customizeWebpackConfig: (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: 'ts-loader',
      include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules/@migration-planner-ui'),
        path.resolve(__dirname, 'node_modules/@migration-planner-ui/agent-client/src'),
      ],
      exclude: /node_modules\/(?!@migration-planner-ui)/
      
    });

    return config;
  },
};
