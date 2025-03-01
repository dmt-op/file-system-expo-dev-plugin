export let useFsTools: typeof import('./useFsTools').useFsTools

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== 'production') {
  useFsTools = require('./useFsTools').useFsTools
} else {
  useFsTools = () => {}
}
