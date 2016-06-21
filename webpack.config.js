// paths and constants
var path = require('path')
var SRC_PATH = path.resolve('./src/index.js')
var DIST_PATH = path.resolve('./build')
var STYLE_PATHS = [
  path.resolve('./node_modules', 'purecss'),
  path.resolve('./src/css/main.css')
]

var OUTPUT_FILENAME = '[name].[chunkhash].js'
var DEV_REGEXP = (/(^babel-?.*|.*-plugin$|.*-loader)/)
var DOT_ENV_SAMPLE_PATH = path.resolve('./.env.default')
var DOT_ENV_PATH = path.resolve('./.env')
var pkg = require('./package.json')

var validator = require('webpack-validator')
var merge = require('webpack-merge')
var webpack = require('webpack')

// plugins
var NpmInstallPlugin = require('npm-install-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var template = require('html-webpack-template')
var DotEnvPlugin = require('webpack-dotenv-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var PurifyCssPlugin = require('purifycss-webpack-plugin')
var VisualizerPlugin = require('webpack-visualizer-plugin')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

var purifyConfig = {
  basePath: process.cwd(),
  paths: [SRC_PATH],
  info: true
}

var uglifyConfig = {
  compress: {
    warnings: false,
    drop_console: true
  },
  mangle: {
    except: ['$', 'webpackJsonp'],
    screw_ie8: true,
    keep_fnames: true
  },
  beautify: false,
  comments: false
}

var npmInstallPluginConfig = {
  dev: function (module, path) { return DEV_REGEXP.test(module) }
}

var dotenvConfig = {
  sample: DOT_ENV_SAMPLE_PATH,
  path: DOT_ENV_PATH
}

var hmrConfig = {
  multiStep: true
}

var htmlConfig = {
  inject: false,
  mobile: true,
  appMountId: 'root',
  template: template
}

var chunks = {
  names: ['vendor', 'manifest'],
  minChunks: Infinity
}

var cleanPluginConfig = {
  root: process.cwd()
}

var common = {
  output: {
    path: DIST_PATH
  },
  plugins: [
    new HtmlWebpackPlugin(htmlConfig),
    new DotEnvPlugin(dotenvConfig)
  ],
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'standard',
        include: SRC_PATH
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: SRC_PATH,
        query: {
          cacheDirectory: true
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url',
        query: {
          limit: 50000,
          mimetype: 'application/font-woff',
          name: './fonts/[hash].[ext]'
        }
      }
    ]
  }
}

var dev = {
  entry: SRC_PATH,
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      },
      {
        test: /\.less$/,
        loaders: ['style', 'css', 'less']
      },
      {
        test: /\.sass$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file'
      }
    ]
  },
  devtool: 'eval-source-map',
  devServer: {
    inline: true,
    hot: true,
    port: process.env.PORT || 3030,
    host: process.env.HOST || '0.0.0.0',
    stats: 'errors-only',
    historyApiFallback: true,
    contentBase: DIST_PATH,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    compress: true
  },
  plugins: [
    new HotModuleReplacementPlugin(hmrConfig),
    new NpmInstallPlugin(npmInstallPluginConfig)
  ]
}

var production = {
  entry: {
    app: SRC_PATH,
    vendor: Object.keys(pkg.dependencies),
    style: STYLE_PATHS
  },
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[chunkhash].js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css')
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style', 'css!less')
      },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract('style', 'css!sass')
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack'
        ]
      }
    ]
  },
  imageWebpackLoader: {
    imagemin: {
      optimizationLevel: 7,
      interlaced: false
    },
    pngquant: {
      quality: '65-90',
      speed: 4
    },
    svgo: {
      plugins: [
        {
          removeViewBox: false
        },
        {
          removeEmptyAttrs: false
        }
      ]
    }
  },
  devtool: 'source-map',
  plugins: [
    new CommonsChunkPlugin(chunks),
    new ExtractTextPlugin('[name][chunkhash].css'),
    new PurifyCssPlugin(purifyConfig),
    new UglifyJsPlugin(uglifyConfig),
    new VisualizerPlugin(),
    new CleanWebpackPlugin([DIST_PATH], cleanPluginConfig)
  ]
}

console.log(process.env.NODE_ENV)

var config
switch (process.env.NODE_ENV) {
  case 'development':
    config = merge(common, dev)
  case 'production':
    config = merge(common, production)
}

module.exports = validator(config)
