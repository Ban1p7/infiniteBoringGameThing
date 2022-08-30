import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

//define variables
let pi = 3.1415926535
let floorLevel = -2;
let playerSize = [1, 1, 1];
let playerSpeed = 0;
let leftDown = false;
let rightDown = false;
let speed = 0.03;
let negativeSpeed = 0 - speed;
let score = 0;
let scoreable = true;
let currentNewEnemy = 20;
let firstTime = true;
let redMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
let greenMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
let lastUpdate = Date.now();
let singleEnemyGeometry = new THREE.BoxGeometry( 5/3, 2, 0.1 );
let now;
let dt;
let multiplier;
let timeMultiplier = 1;

var myAudio = new Audio('You are not alone2.mp3'); 
myAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

var badSoundEffect = new Audio('badSoundEffect.ogg');
var goodSoundEffect = new Audio('goodSoundEffect.ogg');

//new scene and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.domElement.style = "position: absolute; top: 0px; left: 0px; z-index: 0;";

//define player
const geometry = new THREE.BoxGeometry( playerSize[0], playerSize[1], playerSize[2] );
const material = new THREE.MeshLambertMaterial( { color: 0x00C3FF } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

//enemy class
class enemy{
   constructor(x, y, z, width, height, depth, color, hurts){
      this.width = width;
      this.height = height;
      this.depth = depth;
      this.color = color;
      this.hurts = hurts;
      this.init(x, y, z);
   }
   init(x, y, z){
      //enemy geometry and add to scene
      this.geometry = singleEnemyGeometry;
      if (this.hurts){
         this.material = redMaterial;
      } else {
         this.material = greenMaterial;
      }
      this.shape = new THREE.Mesh( this.geometry, this.material );
      scene.add( this.shape );
      this.shape.position.x = x;
      this.shape.position.y = y;
      this.shape.position.z = z;
   }
}

let enemies = {
   list: [],
   moveAll: null,
   collideAll: null,
   resetAll: null
};

enemies.moveAll = () => {
   for (let i = 0; i < enemies.list.length; i++){
      enemies.list[i].shape.position.z -= 0.075 * multiplier;
      if (enemies.list[i].shape.position.z <= 0){
         enemies.list[i].shape.position.z = currentNewEnemy;
         let place = Math.floor(Math.random() * 3) - 1;
         enemies.list[i].shape.position.x = place * (5 / 3);
         currentNewEnemy += 5;
         let willHurt =  Math.floor(Math.random() * 2);
         if (willHurt === 1) {
            enemies.list[i].shape.material = redMaterial;
            enemies.list[i].hurts = true;
         } else {
            enemies.list[i].shape.material = greenMaterial;
            enemies.list[i].hurts = false;
         }
      }
   }
   currentNewEnemy -= 0.075 * multiplier;
}

enemies.resetAll = () => {
   currentNewEnemy = 20;
   for (let i = 0; i < enemies.list.length; i++){
      enemies.list[i].shape.position.z = currentNewEnemy;
      currentNewEnemy += 10;
      
   }
}

enemies.collideAll = () => {
   for (let i = 0; i < enemies.list.length; i++){
      let myPosition = enemies.list[i].shape.position;
      let myGeometry = enemies.list[i];
      let myleft = myPosition.x - (myGeometry.width / 2);;
      let myright = myPosition.x + (myGeometry.width / 2);
      let mytop = myPosition.y - (myGeometry.height / 2);
      let mybottom = myPosition.y + (myGeometry.height / 2);
      let otherleft = cube.position.x - (playerSize[0] / 2);
      let otherright = cube.position.x + (playerSize[0] / 2);
      let othertop = cube.position.y - (playerSize[1] / 2);
      let otherbottom = cube.position.y + (playerSize[1] / 2);
      let myback = myPosition.z - (myGeometry.depth / 2);
      let myfront = myPosition.z + (myGeometry.depth / 2);
      let otherback = cube.position.z - (playerSize[2] / 2);
      let otherfront = cube.position.z + (playerSize[2] / 2);
      var crash = true;
      if ((mybottom < othertop) ||
          (mytop > otherbottom) ||
          (myright < otherleft) ||
          (myleft > otherright) ||
          (myback > otherfront) ||
          (myfront < otherback)
         ) {
         crash = false;
      }
      if (crash === true){
         console.log("hit");
         if (enemies.list[i].hurts === true){
            badSoundEffect.play();
            badSoundEffect.currentTime = 0;
            clearInterval(loop);
            console.log("die");
            console.log("Your score was " + score);
            document.getElementById("start").style = "z-index: 999;";
         } else if (scoreable === true){
            goodSoundEffect.play();
            goodSoundEffect.currentTime = 0;
            score++;
            document.getElementById("score").innerHTML = "<h1 id=\"text\">" + score + "</h1>";
            console.log(score);
            scoreable = false;
            let willHurt =  Math.floor(Math.random() * 2);
            if (willHurt === 1) {
               enemies.list[i].shape.material = redMaterial;
               enemies.list[i].hurts = true;
               console.log("Will hurt");
            } else {
               enemies.list[i].shape.material = greenMaterial;
               enemies.list[i].hurts = false;
               console.log("Will not hurt");
            }
            enemies.list[i].shape.position.z = currentNewEnemy;
            currentNewEnemy += 10;
         }
      }
      scoreable = true;
   }
}

document.getElementById("start").addEventListener('click', () => {
   if (firstTime === true){
      myAudio.play();
      firstTime = false;
   }
   timeMultiplier = 1;
   document.getElementById("start").style = "z-index: -1;";
   score = 0;
   enemies.resetAll();
   cube.position.x = 0;
   loop = setInterval(animate, 0);
});

function addEnemy(x, hurts){
   //x, y, z, width, height, depth, color, hurts
   let endx = x * (5 / 3);
   let endy = floorLevel;
   let endz = currentNewEnemy;
   currentNewEnemy += 10;
   let endWidth = 5/3;
   let endHeight = 2;
   let endDepth = 0.1;
   let endColor;
   if (hurts === true){
      endColor = 0xff0000;
   } else {
      endColor = 0x00ff00;
   }
   let endHurts = hurts;
   //console.log(new enemy(endx, endy, endz, endWidth, endHeight, endDepth, endColor, endHurts));
   enemies.list.unshift(new enemy(endx, endy, endz, endWidth, endHeight, endDepth, endColor, endHurts));
}

//make an enemy
addEnemy(1, true);
addEnemy(0, false);
addEnemy(-1, false);
addEnemy(0, true);
addEnemy(1, true);
addEnemy(-1, false);
addEnemy(0, true);

//new light
const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 0, 0, 2  );
scene.add( light );

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.7 );
scene.add( ambientLight );

//make floor (btw it's just for show)
const floorGeometry = new THREE.BoxGeometry( 5, 1, 100 );
const floorMaterial = new THREE.MeshBasicMaterial( {color: 0x777777, side: THREE.DoubleSide} );
const floor = new THREE.Mesh( floorGeometry, floorMaterial );
scene.add( floor );

//background
var texture = new THREE.TextureLoader().load( 'sky.jpg' );
var backgroundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2, 1),
            new THREE.MeshBasicMaterial(
                {map:texture}
            ));

backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;

var backgroundScene = new THREE.Scene();
var backgroundCamera = new THREE.Camera();
backgroundScene.add(backgroundCamera );
backgroundScene.add(backgroundMesh );

//fog
const fog = new THREE.Fog( 0xffffff, -30, 100 );
scene.fog = fog;

//initiate camera rotation and floor rotation and all positions
camera.rotation.y = pi;
cube.position.z = 5;
cube.position.y = floorLevel;
floor.position.y = floorLevel - playerSize[2];
floor.position.z = 53;

//player movement
document.addEventListener('keyup', (e) => {
   switch(e.keyCode){
      case 37:
         if (rightDown === true){
            playerSpeed = negativeSpeed;
            leftDown = false;
         } else {
            playerSpeed = 0;
            leftDown = false;
         }
         break;
      case 39:
         if (leftDown === true){
            playerSpeed = speed;
            rightDown = false;
         } else {
            playerSpeed = 0;
            rightDown = false;
         }
         break;
   }
});
document.addEventListener('keydown', (e) => {
   switch(e.keyCode){
      case 37:
         if (rightDown === true){
            playerSpeed = 0;
            leftDown = true;
         } else {
            playerSpeed = speed;
            leftDown = true;
         }
         break;
      case 39:
         if (leftDown === true){
            playerSpeed = 0;
            rightDown = true;
         } else {
            playerSpeed = negativeSpeed;
            rightDown = true;
         }
         break;
   }
});

//called every frame
function animate() {
   now = Date.now();
   dt = now - lastUpdate;
   lastUpdate = now;
   multiplier = (dt / 16) * timeMultiplier;
   //move player by speed
   cube.position.x += playerSpeed * multiplier;
   //move enemy
   enemies.moveAll();
   //keep them within bounds
   if (cube.position.x + playerSize[0] / 2 > 2.5){
      cube.position.x = 2;
   } else if (cube.position.x < -2){
      cube.position.x = -2;
   }
   
   enemies.collideAll();
   
   //don't automatically clear screen so we can render background and foreground as different scenes
   renderer.autoClear = false;
   //clear screen
   renderer.clear();
   //render background, then foreground on top
   renderer.render(backgroundScene , backgroundCamera );
   renderer.render(scene, camera);
   timeMultiplier += 0.0005 * multiplier;
}

//initiate loop
let loop;