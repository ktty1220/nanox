const path = require('path');

module.exports = {
  //mode: 'development',
  mode: 'production',
  entry: {
    nanox: path.resolve(__dirname, './src/nanox.ts')
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'Nanox',
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true,
    globalObject: 'this'
  },
  externals: {
    react: 'React'
  },
  devtool: 'source-map'
};
