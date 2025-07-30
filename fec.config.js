const path = require('path');

module.exports = {
  appUrl: '/openshift/migration-assessment',
  debug: true,
  useProxy: true,
  //customProxy: [
  //  {
  //    context: ['/planner'],
  //    //target: 'http://127.0.0.1:3443',
  //    target: 'https://migration-planner-assisted-migration-stage.apps.crcs02ue1.urby.p1.openshiftapps.com',
  //    secure: false,
  //    pathRewrite: { '^/planner/': '/' },
  //    changeOrigin: true
  //  },
  //],
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
      './SourceApi': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/apis/SourceApi.js'),
      './ImageApi': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/apis/ImageApi.js'),
      '../models/index': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/index.js'),
      '../runtime': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/runtime.js'),
      './HealthApi': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/apis/HealthApi.js'),
      './Datastore': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Datastore.js'),
      './UploadRvtoolsFile200Response': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/UploadRvtoolsFile200Response.js'),
      './Network': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Network.js'),
      './Host': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Host.js'),
      './Label': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Label.js'),
      './Histogram': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Histogram.js'),
      './MigrationIssue': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/MigrationIssue.js'),
      './OsInfo': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/OsInfo.js'),   
      './UpdateInventoryRequest': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/UpdateInventoryRequest.js'),
      './UpdateSourceRequest': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/UpdateSourceRequest.js'),
      './MigrationIssuesInner': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/MigrationIssuesInner.js'),
      './VMResourceBreakdownHistogram': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/VMResourceBreakdownHistogram.js'),
      './Inventory': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Inventory.js'),
      './AgentProxy': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/AgentProxy.js'),
      './Agent': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Agent.js'),
      './InfraDatastoresInner': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/InfraDatastoresInner.js'),
      './InfraNetworksInner': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/InfraNetworksInner.js'),
      './SourceUpdate': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/SourceUpdate.js'),
      './UpdateInventory': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/UpdateInventory.js'),
      './Assessment': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Assessment.js'),
      './AssessmentForm': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/AssessmentForm.js'),

      
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
