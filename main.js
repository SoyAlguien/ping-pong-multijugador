
/*creado por prashant shukla */

var paddle2 = 10, paddle1 = 10;

var paddle1X = 10, paddle1Height = 110;
var paddle2Y = 685, paddle2Height = 70;

var score1 = 0, score2 = 0;
var paddle1Y=0;

var playerscore = 0;
var audio1;
var pcscore = 0;
NumeroDeJugadores=0
var estatus=0
var paddle2y=0
//pelota x, y, y la velocidad speedx, y y radio
var ball = {
  x: 350 / 2,
  y: 480 / 2,
  r: 20,
  dx: 3,
  dy: 3
}
function preload() {
  sonido = loadSound("bounce.mp3")
}
function setup() {
  var canvas = createCanvas(700, 480);
  video = createCapture(VIDEO)
  video.hide()
  coordenadas = ml5.poseNet(video, listo)
  //coordenadas.on("pose", respuesta)
  fondo=createImg("background1.jpg")
  fondo.position(0,0)
  nombre = createInput("").attribute("placeholder","Ingresa tu nombre")
  nombre.position(width/2,height/2)
  enviar=createButton("Ingresar")
  enviar.position(width/2,height/2+100)
  h2=createElement("h2")
  h2.position(width/2,height/2)
  enviar.mousePressed(Ingresar)
  firebase.database().ref("estatus").on("value",(datos)=>{
    estatus=datos.val()
  })
  firebase.database().ref("pelota").on("value",(datos)=>{
    ball.x=datos.val().x;
    ball.y=datos.val().y;
    ball.dx=datos.val().dx;
    ball.dy=datos.val().dy;
  })
}
manoY = 0
function listo() {
  console.log("HOLA")
}
function respuesta(poses) {
  if (poses[0] && poses[0].pose.leftWrist.confidence > 0.25) {
    manoY = poses[0].pose.leftWrist.y
    //console.log(manoY)
  }
}
function draw() {
if(estatus==1){
  if(!localStorage.getItem("jugador2")){
    firebase.database().ref("jugadores").once("value",(datos)=>{
        datos.forEach(function (reg) {
          childKey = reg.key;
          if (childKey != localStorage.getItem("jugador1")) {
                localStorage.setItem("jugador2", childKey)
                console.log(localStorage.getItem("jugador2"));
                firebase.database().ref("jugadores/"+localStorage.getItem("jugador2")).on("value",(data2)=>{
                  paddle2y = data2.val().y  - paddle2Height / 2
            })
          }
        });
  });
}
  enviar.hide()
  nombre.hide()
  h2.hide()
  fondo.hide()
  background(0);
  image(video, 0, 0, 350, 480)
  fill("black");
  stroke("black");
  rect(680, 0, 20, 700);

  fill("black");
  stroke("black");
  rect(0, 0, 20, 700);

  //llamar función paddleInCanvas  
  paddleInCanvas();

  //paleta izquierda
  fill(250, 0, 0);
  stroke(0, 0, 250);
  strokeWeight(0.5);
  //paddle1Y = manoY;
  firebase.database().ref("jugadores/"+localStorage.getItem("jugador1")).update({
    y: mouseY
  })
  rect(paddle1X, paddle1Y, paddle1, paddle1Height, 100);
  rectMode(CENTER)

  //paleta de la computadora
  fill("#FFA500");
  stroke("#FFA500");
  //var paddle2y = ball.y - paddle2Height / 2; 
  rect(paddle2Y, paddle2y, paddle2, paddle2Height, 100);

  //llamar a la función midline 
  midline();

  //llamar a la función drawScore  
  drawScore();

  //llamar a la función models   
  models();

  //llamar a la función move que es muy importante
  move();
}else{
  enviar.show()
  nombre.show()
  h2.show()
  fondo.show()
}
}



//la función reset cuando la pelota no haga contacto con la paleta
function reset() {
  ball.x = width / 2 + 100,
    ball.y = height / 2 + 100;
  ball.dx = 3;
  ball.dy = 3;

}


//la función midline dibuja una línea en el centro
function midline() {
  for (i = 0; i < 480; i += 10) {
    var y = 0;
    fill("white");
    stroke(0);
    rect(width / 2, y + i, 10, 480);
  }
}


//la función drawScore muestra la puntuación
function drawScore() {
  textAlign(CENTER);
  textSize(20);
  fill("white");
  stroke(250, 0, 0)
  text("Jugador:", 100, 50)
  text(playerscore, 140, 50);
  text("Computadora:", 500, 50)
  text(pcscore, 555, 50)
}


//una función muy importante de este juego
function move() {
  fill(50, 350, 0);
  stroke(255, 0, 0);
  strokeWeight(0.5);
  ellipse(ball.x, ball.y, ball.r, 20)
  ball.x = ball.x + ball.dx;
  ball.y = ball.y + ball.dy;
  if (ball.x + ball.r > width - ball.r / 2) {
    ball.dx = -ball.dx - 0.5;
  }
  if (ball.x - 2.5 * ball.r / 2 < 0) {
    if (ball.y >= paddle1Y && ball.y <= paddle1Y + paddle1Height) {
      ball.dx = -ball.dx + 0.5;
      playerscore++;
    //sonido.play()
      firebase.database().ref("pelota").update({
        x:ball.x + ball.dx,
        y:ball.y + ball.dy,
        dx: ball.dx,
        dy: ball.dy
      })
    }
    else {
      pcscore++;
      reset();
      //navigator.vibrate(100);
    }
  }
  if (ball.y + ball.r > height || ball.y - ball.r < 0) {
    //sonido.play()
    ball.dy = - ball.dy;
    firebase.database().ref("pelota").update({
      x:ball.x + ball.dx,
      y:ball.y + ball.dy,
      dx: ball.dx,
      dy: ball.dy
    })
  }
  if (pcscore == 4) {
    fill("#FFA500");
    stroke(0)
    rect(0, 0, width, height - 1);
    fill("white");
    stroke("white");
    textSize(25)
    text("¡Fin del juego!☹☹", width / 2, height / 2);
    text("¡Volver a cargar la página!", width / 2, height / 2 + 30)
    noLoop();
    pcscore = 0;
  }
}


//ancho altura del canvas velocidad de la pelota 
function models() {
  textSize(18);
  fill(255);
  noStroke();
  text("Ancho:" + width, 135, 15);
  text("Velocidad:" + abs(ball.dx), 50, 15);
  text("Altura:" + height, 235, 15)
}
function Ingresar(){
  enviar.hide()
  nombre.hide()
  h2.html("Espera a que cada jugador se una")
  firebase.database().ref("jugadores/"+nombre.value()).set({
    nombre:nombre.value(),
    x:0,
    y:0,
    puntos:0
  })
  firebase.database().ref("jugadores").once("value",(datos)=>{
    if (datos.numChildren()===2){
      h2.hide()
      fondo.hide()
      firebase.database().ref("/").update({estatus: 1})
    }
  })
  localStorage.setItem("jugador1", nombre.value());
  firebase.database().ref("jugadores/"+localStorage.getItem("jugador1")).on("value",(data)=>{
    paddle1Y = data.val().y
  })
}

//esta función ayuda a que la paleta no salga del canvas
function paddleInCanvas() {
  if (mouseY + paddle1Height > height) {
    mouseY = height - paddle1Height;
  }
  if (mouseY < 0) {
    mouseY = 0;
  }
}
