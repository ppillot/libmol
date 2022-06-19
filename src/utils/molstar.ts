import { DefaultPluginSpec, PluginSpec } from 'molstar/lib/mol-plugin/spec'
import { PluginContext } from 'molstar/lib/mol-plugin/context'
import { PluginConfig } from 'molstar/lib/mol-plugin/config'
import { ColorNames } from 'molstar/lib/mol-util/color/names'

const MySpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [
    [PluginConfig.VolumeStreaming.Enabled, false]
  ]
}

async function init (canvasId: string, canvasParentId: string) {
  const plugin = new PluginContext(MySpec)
  await plugin.init()

  const canvas = <HTMLCanvasElement> document.getElementById(canvasId)
  const parent = <HTMLDivElement> document.getElementById(canvasParentId)

  if (!plugin.initViewer(canvas, parent)) {
    console.error('Failed to init Mol*')
    return
  }
  plugin.canvas3d.setProps({ renderer: { backgroundColor: ColorNames.white } })

  const data = await plugin.builders.data.download({ url: 'https://models.rcsb.org/4hhb.bcif', isBinary: true }, { state: { isGhost: true } })
  const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif')
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default')
}

export {
  init
}
