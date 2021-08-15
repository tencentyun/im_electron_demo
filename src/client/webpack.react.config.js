const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APADDRESS =  process.env.huarun_config === 'prod' ?  'http://oaim.crbank.com.cn:30002/' : "http://oaim.uat.crbank.com.cn:30002/" //测试

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
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'native-ext-loader'
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
  devServer: {
    contentBase: path.join(__dirname, '../../bundle'),
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 3000,
    publicPath: '/',
    proxy: {
      '/commonauthservice_crbk': {
        target: APADDRESS,
        secure: false,
        changeOrigin: true
      },
      '/api': {
        //target: 'http://106.52.161.51:30006/',
        target: APADDRESS,
        secure: false,
        pathRewrite: {
          '^/api': ''
        },
        changeOrigin: true
      },
      '/huarun': {
        //target: 'http://oaim.crbank.com.cn:30002/',
        target: APADDRESS,
        secure: false, // http请求https，这里需设置成false,
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      },
      '/v4': {
        //target: 'http://106.52.161.51:30006/',
        target: APADDRESS,
        secure: false, // http请求https，这里需设置成false,
        changeOrigin: true // 一些服务器防止爬虫会设置origin,
      },
      '/sticker': {
        //target: 'http://106.52.161.51:30006/',
        target: APADDRESS,
        secure: false,
        changeOrigin: true
      },
      '/huarun': {
        //target: 'http://106.52.161.51:30006/',
        target: APADDRESS,
        secure: false,
        changeOrigin: true
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
