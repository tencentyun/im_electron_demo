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
  } ,
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
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
        secure: false,
        pathRewrite: {
          '^/api':''
        },
        changeOrigin:true
      },
      '/user': {
        target: 'http://106.52.161.51:30006/',
        secure: false, // http请求https，这里需设置成false,
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      },
      '/sticker': {
        target: 'http://106.52.161.51:30006/',
        secure: false,
        changeOrigin:true
      },
      '/status': {
        target: 'http://106.52.161.51:30006/',
        secure: false,
        changeOrigin:true
      }
    }
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