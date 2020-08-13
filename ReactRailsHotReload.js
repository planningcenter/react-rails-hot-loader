import { AppContainer } from "react-hot-loader";
import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

const components = {};

export default class ReactRailsHotReload {
  static init(module, webpackRequire) {
    window.ReactRailsUJS.mountComponents = ReactRailsHotReload.mountComponents;

    if (module.hot) {
      module.hot.accept(ReactRailsHotReload.hmrModules(), (updatedDeps) => {
        ReactRailsHotReload.fixDeps(updatedDeps).forEach((dep) =>
          webpackRequire(dep)
        );
        window.ReactRailsUJS.mountComponents();
      });
    }
  }

  static fixDeps(deps) {
    return _(deps).flatten().uniq().value();
  }

  static hmrModules() {
    return HMR_MODULES.map((dep) => require.context("../").resolve(dep));
  }

  static mountComponents(searchSelector) {
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
          ReactDOM.hydrate(<AppContainer>{component}</AppContainer>, node);
        } else {
          ReactDOM.render(<AppContainer>{component}</AppContainer>, node);
        }
      }
    }
  }
}
