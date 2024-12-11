module.exports = (async function config() {
  const txoPackageReactConfigList = await import('eslint-config-txo-package-react')
  return txoPackageReactConfigList.configList
})()
