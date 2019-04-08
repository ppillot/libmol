// this function is triggered by a doubleclick
// it evaluates if the double click aims at the background or not
// if it does, it triggers the callback function

function mouseFocus (callBack: () => void) {
  return function (stage: any, x: number, y: number): void {
    // background is being picked
    const pickingProxy = stage.pickingControls.pick(x, y)
    if (pickingProxy === undefined) {
      callBack()
    }
  }
}

export { mouseFocus }
