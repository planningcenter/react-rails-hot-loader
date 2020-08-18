const { join, relative } = require("path");
const { readdirSync, statSync } = require("fs");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const sourceDir = "app/javascript";

class ReactRailsHotLoaderConfig {
  static walkSync(dir, fileList = []) {
    readdirSync(dir).forEach((file) => {
      const filePath = join(dir, file);
      if (filePath.includes(".DS_Store")) return;
      if (filePath.includes("packs")) return;
      statSync(filePath).isDirectory()
        ? (fileList = this.walkSync(filePath, fileList))
        : fileList.push(`./${relative(sourceDir, filePath)}`);
    });
    return fileList;
  }

  static packFiles() {
    return this.walkSync(sourceDir);
  }

  static entries(webpackConfig) {
    return Object.keys(webpackConfig.entry).reduce((accu, key) => {
      accu[key] = ["react-hot-loader/patch", webpackConfig.entry[key]];
      return accu;
    }, {});
  }

  static hotConfig(webpackConfig) {
    return {
      devtool: "cheap-eval-source-map",
      entry: this.entries(webpackConfig),
      output: {
        publicPath: "http://localhost:3035/packs/",
      },
      plugins: [
        new webpack.DefinePlugin({
          HMR_MODULES: JSON.stringify(this.packFiles()),
        }),
      ],
      resolve: {
        alias: {
          "react-dom": "@hot-loader/react-dom",
        },
      },
      watch: false,
    };
  }

  static merge(webpackConfig) {
    return merge(webpackConfig, this.hotConfig(webpackConfig));
  }
}

module.exports = ReactRailsHotLoaderConfig;
