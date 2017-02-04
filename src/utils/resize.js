function optimizedResize () {
  var callbacks = []
  var running = false
  // fired on resize event
  function resize () {
    if (!running) {
      running = true
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks)
      } else {
        setTimeout(runCallbacks, 66)
      }
    }
  }
  // run the actual callbacks
  function runCallbacks () {
    callbacks.forEach(function (callback) {
      callback()
    })
    running = false
  }
  // adds callback to loop
  function addCallback (callback) {
    if (callback) {
      callbacks.push(callback)
    }
  }

  return {
    add: function (callback) {
      if (!callbacks.length) {
        window.addEventListener('resize', resize)
      }
      addCallback(callback)
    }
  }
}
export default optimizedResize
