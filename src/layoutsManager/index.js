import systemConfig from '$trood/config'
import layoutsManifest from '$trood/layouts/manifest'


let layout = layoutsManifest[(systemConfig.layouts || {}).defaultLayout]
if (!layout) {
  layout = layoutsManifest.TroodCoreDefaultLayout
}

export const currentLayout = layout.module
