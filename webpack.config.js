const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './app/scripts/index.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  devServer: {
    open: 'http://localhost:9000',
    port: 9000,
    publicPath: "/",
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/register.html', to: 'register.html' },
      { from: './app/newProposal.html', to: 'newProposal.html' },
      { from: './app/blacklist.html', to: 'blacklist.html' },
      { from: './app/pay.html', to: 'pay.html' },
      { from: './app/voteProposal.html', to: 'voteProposal.html' },
      { from: './app/incentives.html', to: 'incentives.html' },
      { from: './app/execute.html', to: 'execute.html' },
      { from: './app/delete.html', to: 'delete.html' },
      { from: './app/user.html', to: 'user.html' },
      { from: './app/merchant.html', to: 'merchant.html' },
      { from: './app/userToken.html', to: 'userToken.html' },
      { from: './app/changeToken.html', to: 'changeToken.html' }
    ])
  ],
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.s?css$/, use: [ 'style-loader', 'css-loader', 'sass-loader' ] },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['env'],
          plugins: ['transform-react-jsx', 'transform-object-rest-spread', 'transform-runtime']
        }
      }
    ]
  }
}

