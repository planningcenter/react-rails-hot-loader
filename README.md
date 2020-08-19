# react-rails-hot-loader
This package is the culmination of 3, possibly 4, separate free weeks the Services team used to get [`react-hot-loader`](https://github.com/gaearon/react-hot-loader) working with [`react-rails`](https://github.com/reactjs/react-rails) and [`webpacker`](https://github.com/rails/webpacker). According to the docs it should be pretty easy. Add a few deps, change some webpack config, wrap your "single entry point" and bing bang boom, 🔥 reloading. This is not real life. If you're curious about why it is not, see the [Questions](https://github.com/planningcenter/react-rails-hot-loader#questions) section below.

Rather than share a large gist or pull request these two files with all the other config into every app. I wanted to share the setup a bit more easily and take advantage of one teams solution helping all of us.

## Install
1. Add github packages config to your `.npmrc`
``` bash
# .npmrc
//npm.pkg.github.com/:_authToken=GITHUB_PACKAGES_TOKEN
@planningcenter:registry=https://npm.pkg.github.com
```
2. Add package and dependancies
```
yarn add @planningcenter/react-rails-hot-loader react-hot-loader @hot-loader/react-dom 
```

**Note:** Using this package assumes you already use `react-rails` and `webpacker` so you should have installed `rails_ujs` already.

## Getting started
1. Add `react-hot-loader/babel` to your `.babelrc` _easy enough I thought it wasn't worth extracting_
``` javascript
// .babelrc
{
 "plugins": ["react-hot-loader/babel"]
}
```

2. Enable hmr for webpacker
``` yml
# config/webpacker.yml

dev_server:
  hmr: true
```

3. Merge `ReactRailsHotLoaderConfig` into your webpack dev config
``` javascript
// config/webpack/development.js
const ReactRailsHotLoaderConfig = require('@planningcenter/react-rails-hot-loader/config')
// ... other dev config
module.exports = ReactRailsHotLoaderConfig.merge(environment.toWebpackConfig())
```

4. Override `ReactRailsUJS.mountcomponents` with our own and manually accept and require exposed hot modules
``` javascript
// packs/application.js
import ReactRailsUJS from 'react_ujs'
import ReactRailsHotLoader from '@planningcenter/react-rails-hot-loader'

// Setup React Rails Hot Loader
ReactRailsUJS.mountComponents = ReactRailsHotLoader.mountComponents

// HMR_MODULES is exposed by the webpack dev config
if (module.hot) {
  /* global __webpack_require__, HMR_MODULES */
  module.hot.accept(
    HMR_MODULES.map(dep => require.context('../').resolve(dep)),
    deps => {
      ReactRailsHotLoader.fixDeps(deps, __webpack_require__)
      ReactRailsUJS.mountComponents()
    }
  )
}
```
The `ReactRailsHotloader.mountComponents` is an _almost_ exact duplicate of the function provided by `ReactRailsUJS`, but before rendering wraps the component in the `AppContainer` provided by `rails-hot-loader`.



### Optional step
If your app needs to wrap every component in something like a `ThemeProvider` from a ui-kit or an `ErrorBoundary` from a bug reporter you can use the optional `init` function to tell `ReactRailsHotLoader` to wrap your components in that instead.
#### Caveate: You will need to wrap whatever component you provide with `AppContainer` yourself
``` javascript
// ./AppProvider.js
import React from 'react'
import { AppContainer } from 'react-hot-loader'
import { ThemeProvider } from './ui-kit'
import { ErrorBoundary } from './bugsnag'

export default function AppProvider({ children }) {
  return (
    <AppContainer>
      <ErrorBoundary>
        <ThemeProvider>{children}</ThemeProvider>
      </ErrorBoundary>
    </AppContainer>
  )
}
```

``` javascript
// packs/application.js
import AppProvider from './AppProvider'
import ReactRailsUJS from 'react_ujs'
import ReactRailsHotLoader from '@planningcenter/react-rails-hot-loader'

// Must call init before mountComponents
ReactRailsHotLoader.init(AppProvider)
ReactRailsUJS.mountComponents = ReactRailsHotLoader.mountComponents

if (module.hot) {
  // ... same as before
}
```

## Questions
### Why can't I just use `react-hot-loader` directly?
The first problem is that `react-rails` applications (at least the way PCO uses them) have multiple entry points and multiple root components. There isn't a main `<App>` that you can "just" wrap and mark as hot exported. (Step 2 of the [Getting Started section](https://github.com/gaearon/react-hot-loader#getting-started)). You could make sure that every component that gets used with `react_component` is wrapped with `hot`. But, ewe. I wanted a way that would work without needing to remember which components I could use with `react_component` or by wrapping EVERY component with `hot` to be safe.

Second, you have to make sure that `react-hot-loader` is required before `react` and `react-dom`. With the combination of webpack and sprockets, it's hard to know where that spot is. So you'd probably want to use the patch option (step 3 second bullet). That means prepending each entry point with `react-hot-loader/path`, easy. But where are my entry points? With `webpacker` they're added dynamically based on the files in your packs folder. Hmmmm. Not so easy. This requires some "fun" webpack config massaging that I've saved you from having to do.

The `react-hot-loader` v4 added a `hot` function that is "supposed" to export a hot version of the wrapped component and also _self-accept_ itself on reload. I could not get it to work without manually accepting ([the v3 way](https://github.com/gaearon/react-hot-loader#appcontainer-vs-hot)). That is where the bulk of this packages logic goes. Finding all the modules that could be "hot", and providing a way to self accept and require them easily.

### What not fast refresh?
[Fast refresh](https://mariosfakiolas.com/blog/what-the-heck-is-react-fast-refresh) will be the blessed path moving forward and developer experience-wise it offers a couple more features `react-hot-loader` doesn't.
* it will continue working once we resolve a syntax or a runtime error without having to reload manually 💖
* local state will be preserved for function components and Hooks out of the box 🍬

One big caveat of its implementation however, is this little detail
* local state won’t be preserved for class components 😢

Since most all of our apps were built with "legacy" React (classes), class components would not be able to take advantage of state preservation. Ouch, that's like most of our apps. Until they figure that out, or we switch everything to functions, We need to keep using `react-hot-loader` which now has added some backports for hook support. ([see step 4. `@hot-loader/react-dom`](https://github.com/gaearon/react-hot-loader#getting-started))

If your team is ok with class components not preserving state and have figured out how to fit it into an app using `react-rails` multiple entry points, please let me know so I can add a link from this document.

## Contributing
### Developing 
1. clone the repo
2. in the directory of the app in question
    * `yarn add ../react-rails-hot-loader`
    * this will point the package to your local copy
    * assuming you've cloned into the same folder your app is in
4. make edits
5. `yarn add ../react-rails-hot-loader` to update the cache (it's annoying I know, but better then pushing build every time)

### Publishing
1. fix bug
2. create a branch and pull request changes
3. once merged edit `package.json` and bump build respectful of change (breaking: major, feature: minor, bugfix: patch)
4. go to [releases](https://github.com/planningcenter/react-rails-hot-loader/releases)
    * draft a new release with the bumped version as the tag version (targeting master)
    * release title should match tag version
    * add a note about what you broke, added, or fixed
    * publish release
5. in the `react-rails-hot-loader` directory run `npm publish`
    * this will publish a new version using the version in the `package.json` we edited earlier
