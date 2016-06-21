# webpack-survivejs-config

A webpack config that handles both production and development use cases, based on the book Survivejs but with a few changes:


+ instead of the `DefinePlugin`, I use the `Dotenv` plugin.

+ instead of `eslint-loader`, I use the `standard-loader`

+ use the `NODE_ENV` environment variable to split config.
