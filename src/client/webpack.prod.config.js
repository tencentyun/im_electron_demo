const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
  },
  entry: {
    main: './app.tsx',
    call: './call.tsx'
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'native-ext-loader',
        options: {
          rewritePath: targetPlatform === 'win32' ? './resources' : '../Resources'
        }
      },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          'file-loader',
        ],
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '../../bundle'),
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main'],
      template: 'index.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['call'],
      template: 'call.html',
      filename: 'call.html'
    })
  ],
  node: {
    global: true,
    __dirname: true,
    __filename: true
  }
};