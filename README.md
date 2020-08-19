# react-rails-hot-loader
## What is this for?
I know what you're thinking. It can't be this hard to add hot loading that I need a package dedicated to adding it? Go ahead. Try it. You'll be back.

This package is the culmination of 3, possibly 4, separate free weeks the Services team used to get [`react-hot-loader`](https://github.com/gaearon/react-hot-loader) working with [`react-rails`](https://github.com/reactjs/react-rails) and [`webpacker`](https://github.com/rails/webpacker). According to the docs it should be pretty easy. Add a few deps, change some webpack config, wrap your "single entry point" and bing bang boom, 🔥 reloading. This is not real life. If you're curious about why it is not, see the [Questions]() section below.

## Alright, I'm convinced. How do I Install this thing?

## Contributing

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
