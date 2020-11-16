import { AppContainer } from "react-hot-loader";
import React from "react";
import ReactDOM from "react-dom";

const components = {};

const ReactRailsHotLoader = {
  // AppProvider: must be wrapped by AppContainer.
  // __transformProps__: is only used for Services backward compatibility. https://github.com/ministrycentered/services/blob/master/app/views/service_types/plans/show.html.erb#L28
  init: function (AppProvider, __transformProps__) {
    ReactRailsHotLoader.AppProvider = AppProvider;
    ReactRailsHotLoader.__transformProps__ = __transformProps__;
  },

  AppProvider: AppContainer,
  __transformProps__: null,

  fixDeps: function (deps, webpackRequire) {
    return [...new Set(deps.flat())].forEach((dep) => webpackRequire(dep));
  },

  // The majority of this function is is an exact copy of the mountComponents
  // function in react-rails. The addition of the transformProps callback and
  // AppProvider wrapping at the end are its only additions
  // https://github.com/reactjs/react-rails/blob/v2.6.1/react_ujs/index.js#L85
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

      // Trigger for Services __transform_props__ function.
      let __shouldTransformProps__ =
        node.getAttribute("transform_props") === "true" &&
        typeof ReactRailsHotLoader.__transformProps__ === "function";

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
          component = React.createElement(
            constructor,
            __shouldTransformProps__
              ? ReactRailsHotLoader.__transformProps__(props)
              : props
          );
          if (turbolinksPermanent) {
            components[cacheId] = component;
          }
        }

        if (hydrate && typeof ReactDOM.hydrate === "function") {
          ReactDOM.hydrate(
            React.createElement(ReactRailsHotLoader.AppProvider, {}, component),
            node
          );
        } else {
          ReactDOM.render(
            React.createElement(ReactRailsHotLoader.AppProvider, {}, component),
            node
          );
        }
      }
    }
  },
};

export default ReactRailsHotLoader;
