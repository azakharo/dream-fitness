const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = (options, webpack) => {
  // Calculate the correct output path for notification-service
  // NestJS outputs to: dist/apps/{project-name}/
  const distPath = path.resolve(__dirname, '../../dist/apps/notification-service');

  const plugins = [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/email/templates'),
          to: path.join(distPath, 'templates'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ];

  return {
    ...options,
    plugins: [
      ...options.plugins,
      ...plugins,
    ],
  };
};
