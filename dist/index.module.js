import"react-hot-loader";import"react";import"react-dom";import"lodash";import{join as t,relative as o}from"path";import{readdirSync as e,statSync as r}from"fs";import{merge as i}from"webpack-merge";import a from"webpack";var n={init:function(t,o){console.log("-----------------------------------------"),console.log(window.ReactRailsUJS),console.log("-----------------------------------------")}},c=function(){function n(t){this.webpackConfig=t}var c=n.prototype;return c.walkSync=function(i,a){var n=this;return void 0===a&&(a=[]),e(i).forEach(function(e){var c=t(i,e);c.includes(".DS_Store")||c.includes("packs")||(r(c).isDirectory()?a=n.walkSync(c,a):a.push("./"+o("app/javascript",c)))}),a},c.packFiles=function(){return this.walkSync("app/javascript")},c.entries=function(){var t=this;return Object.keys(this.webpackConfig.entry).reduce(function(o,e){return o[e]=["react-hot-loader/patch",t.webpackConfig.entry[e]],o},{})},c.reactRailsHotReloadConfig=function(){return{devtool:"cheap-eval-source-map",entry:this.entries(),output:{publicPath:"http://localhost:3035/packs/"},plugins:[new a.DefinePlugin({HMR_MODULES:JSON.stringify(this.packFiles())})],resolve:{alias:{"react-dom":"@hot-loader/react-dom"}},watch:!1}},c.merge=function(t){return this.webpackConfig=t,i(this.webpackConfig,this.reactRailsHotReloadConfig())},n}();export{n as ReactRailsHotReload,c as ReactRailsHotReloadConfig};
//# sourceMappingURL=index.module.js.map
