// Call a given function for all horizontal and vertical neighbors
// of the given point.
function forAllNeighbors(point, fn) {
  fn({x: point.x, y: point.y + 1});
  fn({x: point.x, y: point.y - 1});
  fn({x: point.x + 1, y: point.y});
  fn({x: point.x - 1, y: point.y});
}

// Given two positions, returns true when they hold the same color.
function isSameColor(data, pos1, pos2) {
  var offset1 = (pos1.x + pos1.y * data.width) * 4;
  var offset2 = (pos2.x + pos2.y * data.width) * 4;
  for (var i = 0; i < 4; i++) {
    if (data.data[offset1 + i] != data.data[offset2 + i])
      return false;
  }
  return true;
}

tools["Flood fill"] = function(event, cx) {
  var startPos = relativePos(event, cx.canvas);

  var data = cx.getImageData(0, 0, cx.canvas.width,
                              cx.canvas.height);
  // An array with one place for each pixel in the image.
  var alreadyFilled = new Array(data.width * data.height);

  // This is a list of same-colored pixel coordinates that we have
  // not handled yet.
  var workList = [startPos];
  while (workList.length) {
    var pos = workList.pop();
    var offset = pos.x + data.width * pos.y;
    if (alreadyFilled[offset]) continue;

    cx.fillRect(pos.x, pos.y, 1, 1);
    alreadyFilled[offset] = true;

    forAllNeighbors(pos, function(neighbor) {
      if (neighbor.x >= 0 && neighbor.x < data.width &&
          neighbor.y >= 0 && neighbor.y < data.height &&
          isSameColor(data, startPos, neighbor))
        workList.push(neighbor);
    });
  }
};