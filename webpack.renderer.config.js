/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.(scss|css)$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader'
  ],
}, {
  test: /\.(png|jpe?g|gif|svg)$/i,
  use: [
    'file-loader',
  ],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss'],
  },
};
