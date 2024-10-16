// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";
let model, webcam, ctx, labelContainer, maxPredictions;

// variables de clases
let numeroArriba;
let numeroAbajo;
let numeroIzquierda;
let numeroDerecha;

let umbral = 0.8;

let posicionX = 100;
let posicionY = 100;
let anchoX = 100;
let anchoY = 100;

let pasoX = 1;
let pasoY = 1;

function paraArriba() {
  console.log("paraArriba");
  posicionY = posicionY - pasoY;
}

function paraAbajo() {
  console.log("paraAbajo");
  posicionY = posicionY + pasoY;
}

function paraIzquierda() {
  console.log("paraIzquierda");
  posicionX = posicionX - pasoX;
}

function paraDerecha() {
  console.log("paraDerecha");
  posicionX = posicionX + pasoX;
}

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const size = 200;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loopWebcam);

  // append/get elements to the DOM
  const canvasWebcam = document.getElementById("canvasWebcam");
  canvasWebcam.width = size;
  canvasWebcam.height = size;
  ctx = canvasWebcam.getContext("2d");
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loopWebcam(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loopWebcam);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      numeroArriba = prediction[0].probability.toFixed(2);
      numeroDerecha = prediction[1].probability.toFixed(2);
      numeroIzquierda = prediction[2].probability.toFixed(2);
      numeroAbajo = prediction[3].probability.toFixed(2);
    
    labelContainer.childNodes[i].innerHTML = classPrediction;

    if(numeroArriba > umbral) {
      paraArriba();
    }
    else if (numeroAbajo > umbral) {
      paraAbajo();
    }
    else if (numeroIzquierda > umbral) {
      paraIzquierda();
    }
    else if (numeroDerecha > umbral) {
      paraDerecha();
    }
  }

  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
function setup() {
  createCanvas(500, 500);
  console.log("ancho:  " + windowWidth)
  console.log("altura:  " + windowHeight)
  
}

function draw() {
  //background(50, 100, 100);
  // dibujar la elipse donde corresponde

  // atajar las posiciones en los bordes
  if (posicionX > width - anchoX/2) {
    posicionX = width - anchoX/2;
  } else if (posicionX < anchoX/2) {
    posicionX = anchoX/2;
  }

  if (posicionY > height - anchoY/2) {
    posicionY = height - anchoY/2;
  }
  else if (posicionY < anchoY/2) {
    posicionY = anchoY/2;
  }

  ellipse(posicionX, posicionY, anchoX, anchoY, 70);
}
