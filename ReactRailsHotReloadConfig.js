const { join, relative } = require("path");
const { readdirSync, statSync } = require("fs");

const { merge } = require("webpack-merge");
const webpack = require("webpack");

const sourceDir = "app/javascript";

class ReactRailsHotReloadConfig {
  constructor(webpackConfig) {
    this.webpackConfig = webpackConfig;
  }

  walkSync(dir, fileList = []) {
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

  packFiles() {
    return this.walkSync(sourceDir);
  }

  entries() {
    return Object.keys(this.webpackConfig.entry).reduce((accu, key) => {
      accu[key] = ["react-hot-loader/patch", this.webpackConfig.entry[key]];
      return accu;
    }, {});
  }

  reactRailsHotReloadConfig() {
    return {
      devtool: "cheap-eval-source-map",
      entry: this.entries(),
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

  merge(webpackConfig) {
    this.webpackConfig = webpackConfig;
    return merge(this.webpackConfig, this.reactRailsHotReloadConfig());
  }
}

module.exports = ReactRailsHotReloadConfig;
