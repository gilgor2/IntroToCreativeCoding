function windowResized() {
  resizeCanvas(document.body.offsetWidth - 1, document.body.offsetHeight - 5);
}
// constants
let backgroundColor1, backgroundColor2, backgroundColor3;
const pointSpeedNum = 1300; // 파고
const interval = 360; // 60프레임(1초)마다 실행

//var
let counter = 0;
let wave1, wave2, wave3;
let isTitle = true;

// facemesh test
// const vision = await FilesetResolver.forVisionTasks(
//   // path/to/wasm/root
//   "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
// );
// const faceLandmarker = await faceLandmarker.createFromOptions(vision, {
//   baseOptions: {
//     modelAssetPath: "path/to/model",
//   },
//   runningMode: runningMode,
// });
let canvas;
let video;
let isVideoLoaded = false;

let faceapi;
let detections;
let feelingsArr = [];

function setup() {
  canvas = createCanvas(windowWidth, document.body.offsetHeight - 5);
  video = createCapture("VIDEO", videoLoaded);
  video.size(width, height);
  video.hide();
  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withExpression: true,

    withDescriptors: false,
    monConfidence: 0.5,
  };
  faceapi = ml5.faceApi(video, faceOptions, () => {
    faceapi.detect(gotFaces);
  });

  wave1 = new Wave(color(240, 255, 254, 20), -1420, false, 40 + random(70));
  wave2 = new Wave(color(240, 240, 254, 20), -720, false, 30 + random(70));

  wave3 = new Wave(color(224, 213, 198), 0, true);
}

function draw() {
  // counter
  counter = frameCount % interval;

  drawBackground();
  if (isVideoLoaded) {
    if (!isTitle) {
      drawFace();
    }
    if (isTitle) {
      drawTitle();
    }
    wave3.display();
    wave2.display();
    wave1.display();
    if (isTitle) {
      const a = color(255, 255, 255, 200);
      fill(a);
      stroke(a);
      strokeWeight(6);
      strokeCap("ROUND");
      textSize(100);
      textStyle("BOLD ITALIC");
      textWidth(15);
      text(
        "Emotion flows in you",
        width / 2 - 200,
        height / 2,
        width / 2 + 200,
        height / 2
      );
    }
  } else {
    drawTitle();
  }
}

function mouseClicked() {
  isTitle = false;
}
function videoLoaded() {
  isVideoLoaded = true;
}

export function Point(x, startY) {
  this.x = x;
  this.y = startY;
  this.speedRandom = random(70, 100) / pointSpeedNum;
  this.delay = 10;
  this.speedX = 0.7;

  this.update = (startTimingGap) => {
    const speed =
      interval / 2 - counter + random(startTimingGap - 20, startTimingGap) / 5; // interval/2-counter

    this.y += speed * this.speedRandom;
    this.x += this.speedX;

    if (counter === 0) {
      this.speedRandom = random(50, 100) / pointSpeedNum;
      this.y = startY + random(-50, 30);
      this.speedX *= -1;
      this.speedX *= random(5, 10) / 20;
    }
  };

  this.draw = (startTimingGap) => {
    // this.update(startTimingGap);
    fill("red");
    ellipse(this.x, this.y, 10);
    noFill();
  };
}

export function Wave(waveColor, startY, isLast, startTimingGap) {
  this.pointArr = [];
  this.pointCount = 9;
  this.pointGap = width / (this.pointCount - 1);
  this.waveColor = waveColor || "white";
  this.opacity = 40; // 0~255
  this.startTimingGap = startTimingGap;

  this.randomValArr = [];
  this.randomRange = 24;

  this.peakPointArr = [];
  this.peakOpacity = 120;

  //  init
  for (let i = 0; i < this.pointCount; i++) {
    this.pointArr.push(new Point(this.pointGap * i, startY));
    this.randomValArr.push(random(0, this.randomRange));
    this.peakPointArr.push([0, 0]);
  }
  this.initRandomValArr = () => {
    for (let i = 0; i < this.pointCount; i++) {
      this.randomValArr.push(random(0, this.randomRange));
    }
  };

  this.draw = () => {
    this.pointArr.forEach((pointObj) => {
      pointObj.draw(this.startTimingGap || 0);
    });
  };

  this.curveVertexByArr = (arr, color, line, callBack) => {
    beginShape();
    fill(color || "white");
    curveVertex(0, 0);

    curveVertex(-40, 0);
    curveVertex(-40, arr[0][1]);
    curveVertex(arr[0][0], arr[0][1]);
    noStroke();

    arr.forEach((point, i) => {
      curveVertex(point[0], point[1]);
      if (callBack) {
        callBack(i);
      }
    });

    curveVertex(arr[arr.length - 1][0], arr[arr.length - 1][1]);

    if (line) {
      arr.reverse();
      arr.forEach((point, i) => {
        curveVertex(
          point[0],
          point[1] -
            sin((counter / interval) * PI) *
              (this.randomValArr[i] + 5) *
              (isLast ? 4 : 1)
        );
      });
      curveVertex(
        0,
        arr[arr.length - 1][1] -
          sin((counter / interval) * PI) *
            (this.randomValArr[this.randomValArr.length - 1] + 5)
      );
      curveVertex(
        -40,
        arr[arr.length - 1][1] -
          sin((counter / interval) * PI) *
            (this.randomValArr[this.randomValArr.length - 1] - 10)
      );

      endShape();

      if (counter === interval - 1) {
        this.initRandomValArr();
      }
    } else {
      curveVertex(width, 0);
      curveVertex(0, 0);
      endShape();
    }
  };
  this.drawWave = () => {
    //draw half-visible shape

    this.curveVertexByArr(
      this.pointArr.map((pointObj) => [pointObj.x, pointObj.y]),
      this.waveColor,
      false,
      (i) => {
        this.pointArr[i].update(this.startTimingGap || 0);
      }
    );

    // vanish
    // this.opacity = map(
    //   interval / 2 - Math.abs(interval / 2 - counter),
    //   0,
    //   90,
    //   0,
    //   100
    // );
  };

  this.displayBubble = () => {
    const white = color(255, 255, 255, 160);
    this.curveVertexByArr(
      this.pointArr.map((pointObj) => [pointObj.x, pointObj.y]),
      white,
      true
    );
  };
  this.savePeak = () => {
    if (counter === parseInt(interval / 2) - 2) {
      this.peakPointArr = this.pointArr.map((pointObj) => [
        pointObj.x,
        pointObj.y,
      ]);
      this.peakOpacity = 160;
    }
  };
  this.wetSand = () => {
    this.savePeak();
    this.curveVertexByArr(
      this.peakPointArr,
      color(190, 176, 161, this.peakOpacity),
      false,
      () => {
        if (counter > (interval / 4) * 3 - random(20)) {
          this.peakPointArr = this.peakPointArr.map((xy) => [
            xy[0] + random(1, -1) / 50,
            xy[1] - 0.1,
          ]);
          this.peakOpacity -= 0.2;
        }
      }
    );
  };
  this.display = () => {
    if (isLast) {
      this.wetSand();
    }
    this.drawWave();
    this.displayBubble();
  };
}

var drawBackground = () => {
  backgroundColor1 = color(224, 210, 190); // yellow
  // backgroundColor2 = color(1, 98, 133); // blue
  // backgroundColor3 = color(99, 171, 156); // green

  // let n;
  // for (let y = 0; y < height; y++) {
  //   n = map(y, height / 3, height, 0, 1);
  //   let newc = lerpColor(backgroundColor1, backgroundColor1, n / 3);

  //   stroke(newc);
  //   line(0, height - y, width, height - y);
  // }
  background(backgroundColor1);
  // for (let y = (height / 4) * 3; y < height; y++) {
  //   n = map(y, (height / 4) * 3, height, 0, 1);
  //   let newc = lerpColor(color(198, 202, 183), backgroundColor2, n);
  //   newc.setAlpha(160);
  //   stroke(newc);
  //   line(0, height - y, width, height - y);
  // }
};
var drawTitle = () => {
  const b = color(190, 176, 161, 140);

  fill(b);
  stroke(b);

  text(
    "Emotion flows in you",
    width / 2 - 210,
    height / 2 + 10,
    width / 2 + 200,
    height / 2
  );
};
function gotFaces(err, res) {
  if (err) {
    console.log(err);
    return -1;
  }
  if (counter < 10 && !!res && res[0]) {
    detections = res;
  }
  faceapi.detect(gotFaces);
}
var drawFace = () => {
  if (detections && detections.length > 0 && counter <= (interval / 7) * 4) {
    detections.forEach((face) => {
      const positionArr = face.landmarks._positions;
      // text(
      //   `${face.expressions?.happy}`,
      //   width / 2 - 200,
      //   height / 2,
      //   width / 2 + 200,
      //   height / 2
      // );
      stroke(color(190, 176, 161, 70));
      fill(color(190, 176, 161, 60));
      strokeWeight(30 + random(2));
      // left eyelash

      for (let i = 16; i < 20; i++) {
        curve(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1),
          positionArr[i + 1]._y,
          positionArr[i + 2]._x + random(-1, 1),
          positionArr[i + 2]._y,
          positionArr[i + 3]._x + random(-1, 1),
          positionArr[i + 3]._y
        );
      }

      // right eye lash
      for (let i = 21; i < 25; i++) {
        curve(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1) / 10,
          positionArr[i + 1]._y,
          positionArr[i + 2]._x + random(-1, 1) / 10,
          positionArr[i + 2]._y,
          positionArr[i + 3]._x + random(-1, 1) / 10,
          positionArr[i + 3]._y
        );
      }
      // left eye
      for (let i = 35; i < 40; i++) {
        curve(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1) / 10,
          positionArr[i + 1]._y,
          positionArr[i + 2]._x + random(-1, 1) / 10,
          positionArr[i + 2]._y,
          positionArr[i + 3]._x + random(-1, 1) / 10,
          positionArr[i + 3]._y
        );
      }
      // right eye
      for (let i = 41; i < 46; i++) {
        curve(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1) / 10,
          positionArr[i + 1]._y,
          positionArr[i + 2]._x + random(-1, 1) / 10,
          positionArr[i + 2]._y,
          positionArr[i + 3]._x + random(-1, 1) / 10,
          positionArr[i + 3]._y
        );
      }
      // nose
      for (let i = 28; i < 29; i++) {
        line(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1) / 10,
          positionArr[i + 1]._y
        );
      }
      // for (let i = 30; i < 34; i++) {
      //   curve(
      //     positionArr[i]._x + random(-1, 1) / 10,
      //     positionArr[i]._y,
      //     positionArr[i + 1]._x + random(-1, 1) / 10,
      //     positionArr[i + 1]._y,
      //     positionArr[i + 2]._x + random(-1, 1) / 10,
      //     positionArr[i + 2]._y,
      //     positionArr[i + 3]._x + random(-1, 1) / 10,
      //     positionArr[i + 3]._y
      //   );
      // }
      // mouth
      for (let i = 48; i < 59; i++) {
        curve(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1) / 10,
          positionArr[i + 1]._y,
          positionArr[i + 2]._x + random(-1, 1) / 10,
          positionArr[i + 2]._y,
          positionArr[i + 3]._x + random(-1, 1) / 10,
          positionArr[i + 3]._y
        );
      }
      for (let i = 60; i < 65; i++) {
        curve(
          positionArr[i]._x + random(-1, 1) / 10,
          positionArr[i]._y,
          positionArr[i + 1]._x + random(-1, 1) / 10,
          positionArr[i + 1]._y,
          positionArr[i + 2]._x + random(-1, 1) / 10,
          positionArr[i + 2]._y,
          positionArr[i + 3]._x + random(-1, 1) / 10,
          positionArr[i + 3]._y
        );
      }
    });
  }
};
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mouseClicked = mouseClicked;
window.videoLoaded = videoLoaded;
