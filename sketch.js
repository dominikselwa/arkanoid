let step = 30;
let alfa;
let tri = 11;
let angle;
let heightBrick;
let widthBrick;
let brickSpeed = 0.02;
let brickShift;
let newBrick = 100;
let a = 0;
let scale;

let kostka = [];
let count = 0;
let kostkaLength;
let startRows = 10;
let powerUps = [];
let balls = [];
let thePad;
let minute;
let possibleHitPoints = [-1,1,2,3,4,5];
let c;
let t = [];
let color;
let points = 0;
let t0;
let t1;
let gameState = "start"; //possible: start, game, pause, gameOver



class pad {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.height = 15*scale;
		this.width = 80*scale;
		this.speed = 5*scale;
	}

	draw(){
		fill(300,100,40);
		ellipse(this.x,this.y,this.width,this.height);
	}

	move(){
		if (keyIsDown(LEFT_ARROW) && this.x>this.width/2) {
			this.x -= this.speed/step;
		}
		if (keyIsDown(RIGHT_ARROW) && this.x<width-this.width/2) {
			this.x += this.speed/step;
		}
	}
}

class powerUp {
	constructor(x,y){
		this.a = 20;
		this.shift = (widthBrick - this.a)/2;
		this.x = x + this.shift;
		this.y = y;
		this.speed = 1;
		this.color = "green";
	}

	draw(){
		fill(this.color);
		square(this.x,this.y,this.a);
	}

	move(){
		this.y = this.y + this.speed;
	}

	colide(j){
		if(this.x >= thePad.x - this.a - thePad.width/2
			&& this.x <= thePad.x + thePad.width/2
			&& this.y >= thePad.y - this.a
			&& this.y <= thePad.y){
				let length = balls.length;
				for(i=0;i<length;i++){
					balls[length+i] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r);
					balls[length+i].velocity.rotate(random(-0.5,0.5));
				}
				powerUps.splice(j,1);
			}
	}


}

class doubleBall extends powerUp {
	constructor(x,y){
		super(x,y,a,color);
	}

	action(){
		let length = balls.length;
		for(i=0;i<length;i++){
			balls[length+i] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r);
			balls[length+i].velocity.rotate(random(-0.5,0.5));
		}
	}
}

class manyBalls extends powerUp {
	constructor(x,y){
		super(x,y,a,color);
	}

	action(){
		let length = balls.length;
		for(i=0;i<length;i++){
			for(j=0;j<7;j++){
				balls[length+i*j+j] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r);
				balls[length+i].velocity.rotate(TAU*j/7);
			}

		}
	}
}

class death extends powerUp {

}

class ball {
	constructor(x,y,xVelocity,yVelocity,r){
		this.position = new p5.Vector(x,y);
		this.r = r;
		this.velocity = new p5.Vector(xVelocity,yVelocity);
		this.combo = 0;
	}

	draw(){
		fill("white");
		circle(this.position.x,this.position.y,2*this.r);
	}

	move(){
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;
	}

	colideWall() {
		if (this.position.x <= 0 + this.r && this.velocity.x < 0) {
			this.velocity.x = (-1)*this.velocity.x;
		}

		if (this.position.x >= width - this.r && this.velocity.x > 0) {
			this.velocity.x = (-1)*this.velocity.x;
		}

		if (this.position.y <= this.r && this.velocity.y < 0) {
			this.velocity.y = (-1)*this.velocity.y;
		}
	}

	colideBrick(l){
		for(i=0; i<kostka.length; i++) {
			for(j=0; j<kostka[i].length; j++) {
				if(kostka[i][j].hitPoints > 0 &&
				abs(this.position.x - kostka[i][j].xCenter) - widthBrick - this.r < 0) {
					//line(this.position.x,this.position.y,kostka[i][j].xCenter,kostka[i][j].yCenter);
					if(this.position.x > kostka[i][j].x && this.position.x < kostka[i][j].x + kostka[i][j].width) {
						if((this.position.y > kostka[i][j].y - this.r  && this.position.y < kostka[i][j].y + kostka[i][j].height + this.r)) {
							this.velocity.y = (-1)*this.velocity.y;
							kostka[i][j].hitPoints--;
							addPoints(l);
							return;
						}
					} else if(this.position.y > kostka[i][j].y&& this.position.y < kostka[i][j].y + kostka[i][j].height) {
						if((this.position.x > kostka[i][j].x - this.r  && this.position.x < kostka[i][j].x + kostka[i][j].width + this.r)) {
							this.velocity.x = (-1)*this.velocity.x;
							kostka[i][j].hitPoints--;
							addPoints(l);
							return;
						}
					} else {
						let A = dist(kostka[i][j].x,kostka[i][j].y,this.position.x,this.position.y);
						if (A <= this.r) {
							let corner = new p5.Vector(1,-1);
							roundBounce(this.velocity,corner);
							kostka[i][j].hitPoints--;
							addPoints(l);
							return;
						}
						let C = dist(kostka[i][j].x,kostka[i][j].y + kostka[i][j].height,this.position.x,this.position.y);
						if (C <= this.r) {
							let corner = new p5.Vector(-1,-1);
							roundBounce(this.velocity,corner);
							kostka[i][j].hitPoints--;
							addPoints(l);
							return;
						}
						let B = dist(kostka[i][j].x + kostka[i][j].width,kostka[i][j].y,this.position.x,this.position.y);
						if (B <= this.r) {
							let corner = new p5.Vector(1,1);
							roundBounce(this.velocity,corner);
							kostka[i][j].hitPoints--;
							addPoints(l);
							return;
						}
						let D = dist(kostka[i][j].x + kostka[i][j].width,kostka[i][j].y + kostka[i][j].height,this.position.x,this.position.y)
						if (D <= this.r) {
							let corner = new p5.Vector(-1,1);
							roundBounce(this.velocity,corner);
							kostka[i][j].hitPoints--;
							addPoints(l);
							return;
						}
					}
				} else {
					kostka[i][j].spawnPowerUp();
				}
			}
		}
	}

	colidePadNew() {

	}

	colidePad() {
		let distance = dist(this.position.x,this.position.y,thePad.x,thePad.y);

		if(distance <= (thePad.width/2) + this.r && this.position.y < thePad.y && this.velocity.y > 0) {
			let xvalue = new Array();
			let yvalue = new Array();
			let dvalue = new Array();
			let dvalue_sorted = new Array();
			let point_number_uno;
			let point_number_dos;
			let j = 0;

			for(i=0; i<=PI; i += PI/tri) {
				xvalue[j] = thePad.x+(thePad.width/2)*cos(i);
				yvalue[j] = thePad.y-(thePad.height/2)*sin(i);
				dvalue[j] = dist(this.position.x,this.position.y,thePad.x+(thePad.width/2)*cos(i),thePad.y-(thePad.height/2)*sin(i));
				dvalue_sorted[j] = dvalue[j];
				j++;
			}

			dvalue_sorted.sort(function(a,b){return a-b});

			point_number_uno = dvalue.indexOf(dvalue_sorted[0]);
			point_number_dos = dvalue.indexOf(dvalue_sorted[1]);

			if(point_number_uno == point_number_dos) {
				point_number_dos = point_number_uno + 1;
			}

			var normal = new p5.Vector(xvalue[point_number_uno]-xvalue[point_number_dos],yvalue[point_number_uno]-yvalue[point_number_dos]);
			normal.normalize();
			var a = new p5.Vector(xvalue[point_number_uno],yvalue[point_number_uno]);
			let a_minus_p = p5.Vector.sub(a,this.position);
			let a_minus_p_kropka_n = a_minus_p.dot(normal);
			normal.mult(a_minus_p_kropka_n);
			let dist_v = p5.Vector.sub(a_minus_p,normal);
			let line_ball_dist = dist_v.mag();

			if(line_ball_dist <= this.r) {
				roundBounce(this.velocity,normal);
				this.combo = 0;
			}
		}
	}
}

class brick {
	constructor(x,y,hitPoints){
		this.x = x;
		this.y = y;
		this.width = width/10;
		this.height = height/25;
		this.hitPoints = hitPoints;
		this.initialHitPoints = this.hitPoints;
		this.maxHitPoints = possibleHitPoints[possibleHitPoints.length-1];
		this.color = color;
		this.xCenter = this.x + this.width/2;
		this.yCenter = this.y + this.height/2;
	}

	draw() {
		fill(this.color,80*this.hitPoints/this.maxHitPoints,100);
		rect(this.x,this.y,this.width,this.height);
	}

	move() {
		this.y = this.y + brickSpeed;
		this.yCenter = this.yCenter + brickSpeed;
	}

	spawnPowerUp() {
		if(this.hitPoints == 0){
			if(random(1,22) < 3+this.initialHitPoints){
				let length = powerUps.length;
				powerUps[length] =  new doubleBall(this.x,this.y);
			}
			this.hitPoints--;
		}
	}
}

function setup() {

	createCanvas(700,500);
	scale = width/500;
	frameRate(30);
	colorMode(HSB);
	c = random(0,360-(startRows-1)*5);
	//stroke("white");

	heightBrick = height/25;
	widthBrick = width/10;


	thePad = new pad(width/2,height*9/10)
	balls[0] = new ball(width/2,300,scale*0.5/step,scale*3.5/step,scale*4);

    for(i=0; i<9; i++) {
		kostka[i] = [];
	}

	for(j=0; j<startRows; j++) {
		color = c + 5*j;
		for(i=0; i<9; i++) {
			if(j%2 > 0){
				brickShift = widthBrick/4;
			} else {
				brickShift = 3 * widthBrick/4;
			}
			kostka[i][j] = new brick(i*widthBrick + brickShift,(startRows-j-1)*heightBrick,random(possibleHitPoints));
		}
	}
}

function minuteCount(){
	if(frameCount%1800 == 0){
		minute = frameCount/1800;
		possibleHitPoints.push(5+minute);
	}
	color = c + (startRows*5 + frameCount/(180))%360;
}

function addPoints(l){
	points = points + 100 + 10*balls[l].combo;
	balls[l].combo++;
}

function newBrickPosition(){
	if(brickShift == widthBrick/4){
		brickShift = 3 * widthBrick/4;
	}else{
		brickShift = widthBrick/4;
	}
}

function bricksSpeedPosition(){
	let l = kostka[0].length
	if(l>0){
		brickSpeed = -0.01 + 3*0.01*startRows/l;
	} else {
		brickSpeed = 0.31;
	}
	newBrick = newBrick + brickSpeed;
}

function draw() {

	t0 = performance.now();
	background(295,40,60);
	if(gameState == "start"){
		drawElements();
	}else if (gameState = "game"){
		game();
	} else if(gameState = "pause"){
		pause();
	}

	t1 = performance.now();
	//performancePlot();
}

function performancePlot(){
	if(count%10 == 0){
		t[t.length] = (t1-t0);
	}
	fill("black");
	for(i=1;i<t.length;i++){
		line(t.length-i-1,height-t[i],t.length-i,height-t[i-1]);
	}
}

function roundBounce(ballVelocity,vec) {
	let ang = ballVelocity.heading() - vec.heading();
	ballVelocity.rotate(-2*ang);
}

function eraseElements(){
	if(count == 100) {
		count = 0;
		let hitPoints = 0;
		for(i = 0; i<kostka.length; i++) {
			hitPoints = hitPoints + kostka[i][0].hitPoints;
		}
		if (hitPoints == -9){
			for(i = 0; i<kostka.length; i++) {
				kostka[i].shift();
			}
		}
		for(i=0;i<powerUps.length;i++){
			if(powerUps[i].y > height){
				powerUps.splice(i,1);
			}
		}
	} else {
		count++;
	}

	if(balls.length>1){
		for(i=0;i<balls.length;i++){
			if(balls[i].position.y > height){
				balls.splice(i,1);
			}
		}
	}else if (balls[0].position.y > height){
		fill(295,40,60,0.7);
		rect(0,0,width,height);
		textAlign(CENTER,CENTER);
		textSize(50);
		fill("black");
		text("You lose :(",width/2+random(-1,1),height/2+random(-1,1));
	}

}

function newRowOfBricks(){
	if (newBrick >= heightBrick) {
		newBrickPosition();
		let kostkaLength = kostka[0].length;
		for(i=0; i<9; i++) {
			kostka[i][kostkaLength] = new brick(i*widthBrick+brickShift,-heightBrick,random(possibleHitPoints)); //adding new bricks
		}
		newBrick = 0;
	}
}

function moveColideElements(){
	for(i=0; i<kostka.length; i++) {
			for(j=0; j<kostka[i].length; j++) {
				if(kostka[i][j].hitPoints > 0) {
					kostka[i][j].move();
			}
		}
	}

	for(i=0;i<powerUps.length;i++){
		powerUps[i].move();
		powerUps[i].colide(i);
	}

	for(g=0;g<step;g++){
		for(l=0; l<balls.length; l++){
			balls[l].colideBrick(l);
			balls[l].colideWall();
			balls[l].colidePad();
			balls[l].move();
		}
		thePad.move();
	}
}

function initializeNewGame(){

}

function zeroElements(){

}

function game(){
	minuteCount();
	bricksSpeedPosition();
	newRowOfBricks();
	drawElements();
	moveColideElements();

	fill(0);
	textSize(25);
	textAlign(LEFT);
	textAlign(CENTER,CENTER);
    text(points,width/2,height-15);
	eraseElements();
}

function pause(){

	drawElements();

	fill(295,40,60,0.7);
	rect(0,0,width,height);

	textAlign(CENTER,CENTER);
	textSize(24);
	fill("black");
	text("Press space to restart",width/2,height/2);
}

function keyReleased() {
	if (key === ' '){
		if (gameState == "start" || gameState == "pause") {
			gameState = "game";
		} else if (gameState == "game"){
			gameState = "pause";
		} else {
			gameState = "start";
		}
	}

  return false; // prevent any default behavior
}

function drawElements() {
	for(i=0; i<kostka.length; i++) {
		for(j=0; j<kostka[i].length; j++) {
			if(kostka[i][j].hitPoints > 0) {
				kostka[i][j].draw();
			}
		}
	}

	for(i=0; i<balls.length; i++){
		balls[i].draw();
	}

	thePad.draw();

	for(i=0;i<powerUps.length;i++){
		powerUps[i].draw();
	}

	for(g=0;g<step;g++){
		thePad.move();
	}
}
