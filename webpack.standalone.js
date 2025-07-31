const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  entry: './src/standalone-entry.tsx',

  output: {
    filename: 'js/bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist-standalone'),
    publicPath: '/',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules\/(?!@migration-planner-ui)/, // Keep this line as it's for specific packages
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                jsx: 'react-jsx',
              },
              transpileOnly: true,
            },
          },
        ],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/@migration-planner-ui'),
          // path.resolve(__dirname, 'node_modules/@migration-planner-ui/agent-client/src'),
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        // PatternFly CSS is often in node_modules, so this rule should apply to it.
        // If you have Sass files, you might need to add 'sass-loader' here:
        // use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // --- If you use SASS/SCSS for your own components, add a specific rule for that ---
      // {
      //   test: /\.scss$/,
      //   use: ['style-loader', 'css-loader', 'sass-loader'],
      // },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[contenthash][ext]',
        },
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    fullySpecified: false,
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
      './SourceUpdate': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/SourceUpdate.js'),
      './UpdateInventory': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/UpdateInventory.js'),
      './Assessment': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/Assessment.js'),
      './AssessmentForm': path.resolve(__dirname, 'node_modules/@migration-planner-ui/api-client/dist/models/AssessmentForm.js'),
      '@redhat-cloud-services/frontend-components/useChrome': path.resolve(__dirname, 'src/standalone-mocks/useChrome-mock.ts'),
      '@redhat-cloud-services/frontend-components/InvalidObject': path.resolve(__dirname, 'src/standalone-mocks/frontend-components-mock.tsx'),
      '@redhat-cloud-services/frontend-components/PageHeader': path.resolve(__dirname, 'src/standalone-mocks/frontend-components-mock.tsx'),
      '@redhat-cloud-services/frontend-components': path.resolve(__dirname, 'src/standalone-mocks/frontend-components-mock.tsx'), // Keep as fallback
      '@redhat-cloud-services/frontend-components-notifications': path.resolve(__dirname, 'src/standalone-mocks/notifications-mock.tsx'),
      '@redhat-cloud-services/frontend-components-utilities': path.resolve(__dirname, 'src/standalone-mocks/utilities-mock.ts'),
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/standalone.html', // This path seems correct if public is at root
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.STANDALONE_MODE': JSON.stringify(true),
      'process.env.PLANNER_API_BASE_URL': JSON.stringify(
        process.env.USE_MIGRATION_PLANNER_API === 'true' 
          ? (process.env.PLANNER_API_BASE_URL || '')
          : '/planner'
      ),
    }),
  ],

  devServer: {
    port: 3000,
    historyApiFallback: true,
    open: true,
    // Proxy for your backend APIs
    proxy: process.env.PLANNER_LOCAL_DEV === 'true' ? {
      // Local development with migration-planner API
      '/planner': {
        target: 'http://localhost:3443',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/planner': ''              // Remove /planner prefix for local dev only
        },
      },
    } : {
      // Default proxy configuration
      '/api/migration-assessment': {
        target: 'https://migration-planner-assisted-migration-stage.apps.crcs02ue1.urby.p1.openshiftapps.com',
        secure: false,
        changeOrigin: true,
      },
      '/planner': {
        target: 'http://localhost:3443',
        secure: false,
        changeOrigin: true,
      },
    },
  },
};
