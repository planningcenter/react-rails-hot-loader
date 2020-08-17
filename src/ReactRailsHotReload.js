import { AppContainer } from "react-hot-loader";
import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

const components = {};

const ReactRailsHotReload = {
  init: function (module, webpackRequire) {
    window.ReactRailsUJS.mountComponents = ReactRailsHotReload.mountComponents;

    if (module.hot) {
      module.hot.accept(ReactRailsHotReload.hmrModules(), (updatedDeps) => {
        ReactRailsHotReload.fixDeps(updatedDeps).forEach((dep) =>
          webpackRequire(dep)
        );
        window.ReactRailsUJS.mountComponents();
      });
    }
  },

  fixDeps: function (deps) {
    return _(deps).flatten().uniq().value();
  },

  hmrModules: function () {
    return HMR_MODULES.map((dep) => require.context("../").resolve(dep));
  },

  // This is an exact copy of the mountComponents function in react-rails
  // https://github.com/reactjs/react-rails/blob/v2.6.1/react_ujs/index.js#L85
  // with the addition of the AppContainer wrapping at the end
  mountComponents: function (searchSelector) {
    let ujs = window.ReactRailsUJS;
    let nodes = ujs.findDOMNodes(searchSelector);
    for (let i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      let className = node.getAttribute(ujs.CLASS_NAME_ATTR);
      let constructor = ujs.getConstructor(className);
      let propsJson = node.getAttribute(ujs.PROPS_ATTR);
      let props = propsJson && JSON.parse(propsJson);
      let hydrate = node.getAttribute(ujs.RENDER_ATTR);
      let cacheId = node.getAttribute(ujs.CACHE_ID_ATTR);
      let turbolinksPermanent = node.hasAttribute(
        ujs.TURBOLINKS_PERMANENT_ATTR
      );

      if (!constructor) {
        let message = "Cannot find component: '" + className + "'";
        if (console && console.log) {
          console.log(
            "%c[react-rails] %c" + message + " for element",
            "font-weight: bold",
            "",
            node
          );
        }
        throw new Error(
          message + ". Make sure your component is available to render."
        );
      } else {
        let component = components[cacheId];
        if (component === undefined) {
          component = React.createElement(constructor, props);
          if (turbolinksPermanent) {
            components[cacheId] = component;
          }
        }
        if (hydrate && typeof ReactDOM.hydrate === "function") {
          ReactDOM.hydrate(
            React.createElement(AppContainer, {}, component),
            node
          );
        } else {
          ReactDOM.render(
            React.createElement(AppContainer, {}, component),
            node
          );
        }
      }
    }
  },
};

export default ReactRailsHotReload;
