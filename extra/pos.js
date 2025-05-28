const robot = require("robotjs")

setInterval(() => {
  const pos = 
  robot.getMousePos()

console.log(
  pos, robot.getPixelColor(pos.x, pos.y)
)
}, 100)