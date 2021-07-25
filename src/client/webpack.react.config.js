const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
  },
  entry: './app.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [{
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
  devServer: {
    contentBase: path.join(__dirname, '../../bundle'),
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 3000,
    publicPath: '/',
    proxy: {
      '/api': {
        target: 'http://106.52.161.51:30006/',
        secure: false, // http请求https，这里需设置成false,
        pathRewrite: {
          "^/api": ""
        },
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      },
      '/user': {
        target: 'http://106.52.161.51:30006/',
        secure: false, // http请求https，这里需设置成false,
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      },
      '/sticker': {
        target: 'http://106.52.161.51:30006/',
        secure: false, // http请求https，这里需设置成false,
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      },
      '/status': {
        target: 'http://106.52.161.51:30006/',
        secure: false, // http请求https，这里需设置成false,
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      }
    }
  },
  output: {
    path: path.resolve(__dirname, '../../bundle'),
    filename: 'js/[name].js',
    publicPath: './',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Im electron demo',
      // Load a custom template (lodash by default)
      template: 'index.html'
    })
  ],
  node: {
    global: true,
    __dirname: true,
    __filename: true
  }
};