export let useFileExplorer: typeof import('./useFileExplorer').useFileExplorer

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== 'production') {
  useFileExplorer = require('./useFileExplorer').useFileExplorer
} else {
  useFileExplorer = () => {}
}
