import { AppContainer } from "react-hot-loader";
import React from "react";
import ReactDOM from "react-dom";

const components = {};
let AppContainerComponent = AppContainer;
let AppProvider;
let transformProps;

const ReactRailsHotLoader = {
  init: function (AppProvider, transformProps) {
    AppProvider = AppProvider;
    transformProps = transformProps;
  },

  fixDeps: function (deps, webpackRequire) {
    return [...new Set(deps.flat())].forEach((dep) => webpackRequire(dep));
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

      // This is for Services backward compatibility only.
      let shouldTransformProps =
        node.getAttribute("transform_props") === "true";

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
            shouldTransformProps && typeof transformProps === "function"
              ? transformProps(props)
              : props
          );
          if (turbolinksPermanent) {
            components[cacheId] = component;
          }
        }
        if (hydrate && typeof ReactDOM.hydrate === "function") {
          if (AppProvider) {
            ReactDOM.hydrate(
              React.createElement(
                AppContainer,
                {},
                React.createElement(AppProvider, {}, component)
              ),
              node
            );
          } else {
            ReactDOM.hydrate(
              React.createElement(AppContainer, {}, component),
              node
            );
          }
        } else {
          if (AppProvider) {
            ReactDOM.render(
              React.createElement(
                AppContainer,
                {},
                React.createElement(AppProvider, {}, component)
              ),
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
    }
  },
};

export default ReactRailsHotLoader;
