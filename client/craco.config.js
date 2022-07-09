const { ProvidePlugin } = require('webpack');
module.exports = {
  webpack: {
    plugins: {
      add: [
        new ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
    configure: {

      module: {
        rules: [
          {
            type: 'javascript/auto',
            test: /\.mjs$/,
            include: /node_modules/,
            resolve: {
              fullySpecified: false
            },
           // use: [],
          },
        ],
      },


      resolve: {
        fallback: {
          process: 'process/browser',
          path: require.resolve('path-browserify'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer'),
        },
      },
    },
  },
};
