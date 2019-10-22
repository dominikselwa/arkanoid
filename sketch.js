let step = 30;
let approxEllipse = 11;
let angle;
let heightBrick;
let widthBrick;
let brickSpeed = 0.02;
let brickShift;
let newBrick = 100;
let scale;
let maxBallCount = 8;
let bricks = [];
let count = 0;
let startRows = 10;
let powerUps = [];
let balls = [];
let thePad;
let minute;
let possibleHitPoints = [-1,1,2,3,4,5];
let t = [];
let color;
let points = 0;
let t0;
let t1;
let gameState = "start"; //possible: start, game, pause, gameOver, howToPlay, highScores
let activeGame = 0;
let lives = 3;
let startUp = 45;
let particles = [];

let playButton;
let howToPlayButton;
let highScoresButton;
let pauseButton;
let mainMenuButton;
let backButton;
let resumeButton;

class pad {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.height = 15*scale;
		this.width = 80*scale;
		this.speed = 3.1*scale;
	}

	draw(){
		fill(300,100,40);
		ellipse(this.x,this.y,this.width,this.height);
	}

	move(){
		if(gameState == "game"){
			if (keyIsDown(LEFT_ARROW) && this.x>this.width/2) {
				this.x -= this.speed/step;
			}
			if (keyIsDown(RIGHT_ARROW) && this.x<width-this.width/2) {
				this.x += this.speed/step;
			}
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
		square(this.x,this.y,this.a,2);
	}

	move(){
		this.y = this.y + this.speed;
	}

	colide(j){
		if(this.x >= thePad.x - this.a - thePad.width/2
			&& this.x <= thePad.x + thePad.width/2
			&& this.y >= thePad.y - this.a
			&& this.y <= thePad.y){
				this.action();
				powerUps.splice(j,1);
				points += 100;
			}
	}


}

class badPowerUp extends powerUp {
	constructor(x,y){
		super(x,y);
		this.color = "red";
	}

	move(){
		super.move();
		if(this.x +this.a/2 - 5 > thePad.x){
			this.x -= this.speed/2;
		} else if(this.x +this.a/2 + 5 < thePad.x){
			this.x += this.speed/2;
		}
	}
}

class doubleBall extends powerUp {
	constructor(x,y){
		super(x,y);
	}

	draw(){
		super.draw();
		fill("white");
		circle(this.a/2 + this.x-this.a/5,this.y+this.a/2,this.a/3);
		circle(this.a/2 + this.x+this.a/5,this.y+this.a/2,this.a/3);
	}

	action(){
		let length = balls.length;
		for(i=0;i<length;i++){
			balls[length+i] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r,round(balls[i].fireOrIce/2));
			balls[length+i].velocity.rotate(random(-0.5,0.5));
		}
	}
}

class threeBalls extends powerUp {
	constructor(x,y){
		super(x,y);
	}

	draw(){
		super.draw();
		fill("white");
		circle(this.a/2 + this.x,this.y+this.a*1/3,this.a/3);
		circle(this.a/2 + this.x-this.a/5,this.y+this.a*2/3,this.a/3);
		circle(this.a/2 + this.x+this.a/5,this.y+this.a*2/3,this.a/3);
	}

	action(){
		let length = balls.length;
		for(i=0;i<length;i++){
			for(j=0;j<2;j++){
				balls[length+j+i*2] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r,round(balls[i].fireOrIce/3));
				balls[length+j+i*2].velocity.rotate(PI*2/3*(j+1));
			}
		}
	}
}

class largePad extends powerUp {
	constructor(x,y){
		super(x,y);
		this.color = "green";
	}

	draw(){
		super.draw();
		fill("white");
		ellipse(this.a/2 + this.x,this.y+this.a/2,this.a*3/4,this.a/4);
	}

	action(){
		thePad.width += 20;
	}
}

class smallPad extends badPowerUp {
	constructor(x,y){
		super(x,y);
	}

	draw(){
		super.draw();
		fill("white");
		ellipse(this.a/2 + this.x,this.y+this.a/2,this.a*3/4,this.a/4);
	}

	action(){
		thePad.width -= 20;
	}
}

class deathPowerUp extends badPowerUp {
	constructor(x,y){
		super(x,y);
	}

	draw(){
		super.draw();
		drawHeart(this.a/2 + this.x,this.a/2 + this.y);
	}

	action(){
		lives--;
		if(lives <= 0){
			gameOver();
		}
	}
}

class lifePowerUp extends powerUp {
	constructor(x,y){
		super(x,y);
	}

	draw(){
		super.draw();
		drawHeart(this.a/2 + this.x,this.a/2 + this.y);
	}

	action(){
		lives++;
	}
}

class fireBall extends powerUp {
	constructor(x,y){
		super(x,y);
		this.color = [47,100,100];
		this.particles = [];
		for(this.i = 0; this.i < 100; this.i++){
			this.particles[this.i] = new particle();
		}
	}

	draw(){
		super.draw();
		for(j = 0; j < 100; j++){
			this.particles[j].draw(this.x + this.a/2,this.y + this.a/2,0);
		}
	}

	action(){
		for(i = 0; i < balls.length; i++){
			balls[i].fireOrIce += 1200;
		}
	}
}

class iceBall extends powerUp {
	constructor(x,y){
		super(x,y);
		this.color = [190,100,100];
		this.particles = [];
		for(this.i = 0; this.i < 100; this.i++){
			this.particles[this.i] = new particle();
		}
	}

	draw(){
		super.draw();
		for(j = 0; j < 100; j++){
			this.particles[j].draw(this.x + this.a/2,this.y + this.a/2,180);
		}
	}

	action(){
		for(i = 0; i < balls.length; i++){
			balls[i].fireOrIce -= 1200;
		}
	}
}

class button {
	constructor(x,y,w,h,text,page){
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.text = text;
		this.page = page;
	}

	draw(){
		strokeWeight(4);
		fill(0,0,100,0.5);
		rect(this.x-this.width/2,this.y-this.height/2,this.width,this.height,5);
		fill("black");
		textAlign(CENTER,CENTER);
		textSize(this.height-10);
		text(this.text,this.x,this.y);
	}

	click(){
		if (mouseButton === LEFT) {
			if(mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 && mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2){
				this.page();
			}
		}
	}
}

class ball {
	constructor(x,y,xVelocity,yVelocity,r,fireOrIce){
		this.position = new p5.Vector(x,y);
		this.r = r;
		this.velocity = new p5.Vector(xVelocity,yVelocity);
		this.combo = 0;
		this.fireOrIce = fireOrIce;
		this.particles = [];
		for(this.i = 0; this.i < 100; this.i++){
			this.particles[this.i] = new particle();
		}
	}

	draw(){
		fill("white");
		circle(this.position.x,this.position.y,2*this.r);
		if(this.fireOrIce > 0){
			for(j = 0; j < 100; j++){
				this.particles[j].draw(this.position.x,this.position.y,0);
			}
			if(gameState == "game"){
							this.fireOrIce--;
			}
		} else if (this.fireOrIce < 0) {
			for(j = 0; j < 100; j++){
				this.particles[j].draw(this.position.x,this.position.y,180);
			}
			if(gameState == "game"){
							this.fireOrIce++;
			}
		}
	}

	move(){
		if(abs(this.velocity.y) < 0.15 * this.velocity.mag()){
			if(this.velocity.y >= 0){
				if(this.velocity.x >= 0){
					this.velocity.rotate(0.01);
				} else {
					this.velocity.rotate(-0.01);
				}
			} else{
				if(this.velocity.x >= 0){
					this.velocity.rotate(-0.01);
				} else {
					this.velocity.rotate(0.01);
				}
			}
		}
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
		for(i=0; i<bricks.length; i++) {
			for(j=0; j<bricks[i].length; j++) {
				if(bricks[i][j].hitPoints > 0 &&
				abs(this.position.x - bricks[i][j].xCenter) - widthBrick - this.r < 0) {
					if(this.position.x > bricks[i][j].x && this.position.x < bricks[i][j].x + bricks[i][j].width) {
						if((this.position.y > bricks[i][j].y - this.r  && this.position.y < bricks[i][j].y + bricks[i][j].height + this.r)) {
							this.velocity.y = (-1)*this.velocity.y;
							this.colideBrickMode();
							addPoints(l);
							return;
						}
					} else if(this.position.y > bricks[i][j].y&& this.position.y < bricks[i][j].y + bricks[i][j].height) {
						if((this.position.x > bricks[i][j].x - this.r  && this.position.x < bricks[i][j].x + bricks[i][j].width + this.r)) {
							this.velocity.x = (-1)*this.velocity.x;
							this.colideBrickMode();
							addPoints(l);
							return;
						}
					} else {
						let A = dist(bricks[i][j].x,bricks[i][j].y,this.position.x,this.position.y);
						if (A <= this.r) {
							let corner = new p5.Vector(1,-1);
							roundBounce(this.velocity,corner);
							this.colideBrickMode();
							addPoints(l);
							return;
						}
						let C = dist(bricks[i][j].x,bricks[i][j].y + bricks[i][j].height,this.position.x,this.position.y);
						if (C <= this.r) {
							let corner = new p5.Vector(-1,-1);
							roundBounce(this.velocity,corner);
							this.colideBrickMode();
							addPoints(l);
							return;
						}
						let B = dist(bricks[i][j].x + bricks[i][j].width,bricks[i][j].y,this.position.x,this.position.y);
						if (B <= this.r) {
							let corner = new p5.Vector(1,1);
							roundBounce(this.velocity,corner);
							this.colideBrickMode();
							addPoints(l);
							return;
						}
						let D = dist(bricks[i][j].x + bricks[i][j].width,bricks[i][j].y + bricks[i][j].height,this.position.x,this.position.y)
						if (D <= this.r) {
							let corner = new p5.Vector(-1,1);
							roundBounce(this.velocity,corner);
							this.colideBrickMode();
							addPoints(l);
							return;
						}
					}
				} else {
					bricks[i][j].spawnPowerUp();
				}
			}
		}
	}

	colideBrickMode() {
		if (this.fireOrIce == 0){
			bricks[i][j].hitPoints--;
		} else 	if(this.fireOrIce > 0){
			bricks[i][j].hitPoints = 0;
		} else if (this.fireOrIce < 0) {
			if(bricks[i][j].hitPoints > 1){
				bricks[i][j].isFrozen = 1;
				bricks[i][j].hitPoints = 1;
			} else{
				bricks[i][j].hitPoints--;
			}
		}
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

			for(i=0; i<=PI; i += PI/approxEllipse) {
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
		this.isFrozen = 0;
	}

	draw() {
		if(this.isFrozen == 0){
			fill(this.color,80*this.hitPoints/this.maxHitPoints,100);
		} else {
			fill(191,100,100,0.3);
		}
		rect(this.x,this.y,this.width,this.height,2);
	}

	move() {
		this.y = this.y + brickSpeed;
		this.yCenter = this.yCenter + brickSpeed;
	}

	spawnPowerUp() {
		if(this.hitPoints == 0){
			if(random(1,22) < 5+this.initialHitPoints){
				randomPowerUp(this.x,this.y,powerUps.length);
			}
			this.hitPoints--;
		}
	}
}

class particle {
	constructor(){
		this.distance = random(-10,10);
		this.x = random(-10,10);
		if(this.distance > 0){
			this.y = sqrt(this.distance*this.distance - this.x*this.x);
		} else {
			this.y = -sqrt(this.distance*this.distance - this.x*this.x);
		}
		this.color = random(10,50);
		this.alpha = random(0.15,0.4);
		this.r = random(4,4 + 20/((abs(this.x)+abs(this.y))+1));
		this.beta = random(TAU);
		this.gamma = random(TAU);
	}

	draw(x,y,yellowOrBlue){
		strokeWeight(0);
		fill(this.color + yellowOrBlue + 10*sin(this.beta),100,100,this.alpha + 0.04*sin(this.beta));
		circle(this.x + x + 3*sin(this.beta),this.y + y + 3*sin(this.gamma),this.r + 5*sin(this.beta + this.gamma));
		strokeWeight(2);
		this.beta += 0.1 + random(-0.02,0.02);
		this.gamma += 0.1 + random(-0.02,0.02);
	}
}

class backgroundParticle {
	constructor(){
		this.x = random(width);
		this.y = random(height);
		this.color = random(360);
		this.alpha = random(0.05,0.08);
		this.r = random(50,200);
		this.beta = random(TAU);
		this.gamma = random(TAU);
	}

	draw(){
		strokeWeight(0);
		fill(this.color + 60*sin(this.beta),80,100,this.alpha + 0.04*sin(this.beta));
		circle(this.x + 50*sin(this.beta),this.y + 50*sin(this.gamma),this.r + 50*sin(this.beta));
		strokeWeight(2);
		this.beta += 0.002;
		this.gamma += 0.002;
	}
}

function setup() {

	createCanvas(700,500);
	scale = width/500;
	frameRate(30);
	colorMode(HSB);
	heightBrick = height/25;
	widthBrick = width/10;
	textStyle(BOLD);
	strokeJoin(ROUND);

	playButton = new button(width/2,height/2 - 75,300,50,"Play",game);
	howToPlayButton = new button(width/2,height/2,300,50,"How To Play",howToPlay);
	highScoresButton = new button(width/2,height/2 + 75,300,50,"High Scores",highScores);
	pauseButton = new button(width*0.975,height*0.035,width*0.042,height*0.06,"",pause);
	mainMenuButton = new button(width*0.05,height*0.035,width*0.096,height*0.06,"Menu",start);
	backButton = new button(width*0.025,height*0.035,width*0.042,height*0.06,"",start);
	resumeButton = new button(width*0.975,height*0.035,width*0.042,height*0.06,"",game);

	initializeNewGame();

	for(i = 0; i < 200; i++){
		particles[i] = new backgroundParticle();
	}

}

function draw() {
	strokeWeight(2);
	t0 = performance.now();
	//background(295,40,60);
	background(color,20,100);
	if(gameState == "start"){
		start();
	}else if (gameState == "game"){
		game();
	} else if(gameState == "pause"){
		pause();
	} else if(gameState == "gameOver"){
		gameOver();
	}  else if(gameState == "howToPlay"){
		howToPlay();
	}  else {
		highScores();
	}

	t1 = performance.now();
	//performancePlot();
	console.log(balls.length);



}

//GAME STATES

function start(){
	if(gameState === "gameOver"){
		initializeNewGame();
	}
	gameState = "start";
	drawElements();
	if (activeGame == 0){
		playButton.text = "Play";
		balls[0].position.x = thePad.x;
		balls[0].position.y = thePad.y - thePad.height/2 - balls[0].r;
	} else {
		playButton.text = "Resume";
	}
	blur();
	playButton.draw();
	howToPlayButton.draw();
	highScoresButton.draw();
}

function game(){
	if(lives <= 0){
		gameOver();
	}

	if(gameState == "gameOver"){
		initializeNewGame();
		balls[0].position.x = thePad.x;
		balls[0].position.y = thePad.y - thePad.height/2 - balls[0].r;
		startUp = 45;
	}
	activeGame = 1;
	gameState = "game";

	drawElements();

	if(startUp > 1){
		startUp--;
		fill("black");
		textSize( 75 - 2*((startUp)%15));
		textAlign(CENTER,CENTER);
	  text(ceil(startUp/15),width/2,height/2);
		balls[0].position.x = thePad.x;
		balls[0].position.y = thePad.y - thePad.height/2 - balls[0].r;
	} else {
		minuteCount();
		bricksSpeedPosition();
		newRowOfBricks();
		moveColideElements();
	}

	fill(0);
	textSize(25);
	textAlign(CENTER,CENTER);
  text(points,width/2,height-15);
	pauseButton.draw();
	strokeWeight(4);
	line(pauseButton.x-pauseButton.width/6,pauseButton.y-pauseButton.height/4,pauseButton.x-pauseButton.width/6,pauseButton.y+pauseButton.height/4);
	line(pauseButton.x+pauseButton.width/6,pauseButton.y-pauseButton.height/4,pauseButton.x+pauseButton.width/6,pauseButton.y+pauseButton.height/4);
	eraseElements();
}

function pause(){
	gameState = "pause";
	drawElements();
	blur();


	textAlign(CENTER,CENTER);
	textSize(24);
	fill("black");
	text("Press space to resume",width/2,height/2);

	resumeButton.draw();
	mainMenuButton.draw();
	fill("black");
	strokeWeight(4);
	triangle(resumeButton.x-resumeButton.width/6,resumeButton.y-resumeButton.height/4,resumeButton.x-resumeButton.width/6,resumeButton.y+resumeButton.height/4,resumeButton.x+resumeButton.width/6,resumeButton.y);


}

function gameOver(){
	if(lives <= 0){
		activeGame =0;
		gameState = "gameOver";
		drawElements();
		blur();
		textAlign(CENTER,CENTER);
		textSize(50);
		fill("black");
		text("You lose :(",width/2+random(-1,1),height/2-150+random(-1,1));
		mainMenuButton.draw();
		playButton.text = "Play again";
		playButton.draw();
	} else {
		startUp = 45;
		game();
	}
}

function howToPlay(){
	gameState = "howToPlay";
	drawElements();
	blur();
	fill("black");
	textAlign(CENTER,CENTER);
	textSize(24);
	text("To move the pad use arrows on your keyboard",width/2,height/2 - 50);
	text("Try to catch as many good power ups as you can and avoid bad ones",0,height/2,width);
	text("You can pause the game using space bar",width/2,height/2 + 75);
	backButton.draw();
	fill("black");
	strokeWeight(4);
	triangle(backButton.x+backButton.width/6,backButton.y-backButton.height/4,backButton.x+backButton.width/6,backButton.y+backButton.height/4,backButton.x-backButton.width/6,backButton.y);
}

function highScores(){
	gameState = "highScores";
	drawElements();
	blur();
	backButton.draw();
	fill("black");
	strokeWeight(4);
	triangle(backButton.x+backButton.width/6,backButton.y-backButton.height/4,backButton.x+backButton.width/6,backButton.y+backButton.height/4,backButton.x-backButton.width/6,backButton.y);
}

//FUNCTIONS

function minuteCount(){
	if(frameCount%1800 == 0){
		minute = frameCount/1800;
		possibleHitPoints.push(5+minute);
	}
}

function addPoints(l){
	points = points + 10 + 1*balls[l].combo;
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
	let l = bricks[0].length
	if(l>0){
		brickSpeed = - 0.0225 + 0.045*startRows/l;
	} else {
		brickSpeed = 0.6;
	}
	newBrick = newBrick + brickSpeed;
}

function mouseClicked(){
	if(gameState === "start"){
		playButton.click();
		howToPlayButton.click();
		highScoresButton.click();
	} else if(gameState === "game"){
		pauseButton.click();
	} else if(gameState === "gameOver"){
		mainMenuButton.click();
		playButton.click();
	} else if(gameState === "pause"){
		resumeButton.click();
		mainMenuButton.click();
	}else{
		backButton.click();
	}
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
		for(i = 0; i<bricks.length; i++) {
			hitPoints = hitPoints + bricks[i][0].hitPoints;
		}
		if (hitPoints == -9){
			for(i = 0; i<bricks.length; i++) {
				bricks[i].shift();
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
		lives--;
		gameOver();
	}

}

function newRowOfBricks(){
	if (newBrick >= heightBrick) {
		color =(color + 5)%360
		newBrickPosition();
		let bricksLength = bricks[0].length;
		for(i=0; i<9; i++) {
			bricks[i][bricksLength] = new brick(i*widthBrick+brickShift,-heightBrick,random(possibleHitPoints)); //adding new bricks
		}
		newBrick = 0;
	}
}

function moveColideElements(){
	for(i=0; i<bricks.length; i++) {
			for(j=0; j<bricks[i].length; j++) {
				if(bricks[i][j].hitPoints > 0) {
					bricks[i][j].move();
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
	zeroElements();

	thePad = new pad(width/2,height*9/10)
	balls[0] = new ball(width/2,300,0,scale*4.2/step,scale*4,0);
	balls[0].velocity.rotate(random(-0.5,0.5));

  for(i=0; i<9; i++) {
		bricks[i] = [];
	}

	color = random(0,360);

	for(j=0; j<startRows; j++) {
		color = (color + 5)%360;
		for(i=0; i<9; i++) {
			if(j%2 > 0){
				brickShift = widthBrick/4;
			} else {
				brickShift = 3 * widthBrick/4;
			}
			bricks[i][j] = new brick(i*widthBrick + brickShift,(startRows-j-1)*heightBrick,random(possibleHitPoints));
		}
	}
}

function zeroElements(){
	brickSpeed = 0.02;
	newBrick = 100;
	bricks = [];
	count = 0;
	startRows = 10;
	powerUps = [];
	balls = [];
	possibleHitPoints = [-1,1,2,3,4,5];
	t = [];
	points = 0;
	lives = 3;
}

function keyReleased() {
	if (key === ' '){
		if (gameState == "pause") {
			gameState = "game";
		} else if (gameState == "game"){
			gameState = "pause";
		}
	}
  return false; // prevent any default behavior
}

function drawElements() {
	for(i = 0; i < particles.length; i++){
		particles[i].draw();
	}


	for(i=0; i<bricks.length; i++) {
		for(j=0; j<bricks[i].length; j++) {
			if(bricks[i][j].hitPoints > 0) {
				bricks[i][j].draw();
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

	for(i = 0; i < lives; i++){
		drawHeart(15+20*i,height - 15);
	}

	for(g=0;g<step;g++){
		thePad.move();
	}
}

function blur() {
	//fill(295,60,80,0.3);
	fill(color,60,50,0.3);
	rect(0,0,width,height);
	//for(i = 0; i < particles.length; i++){
	//	particles[i].draw();
	//}
}

function randomPowerUp(x,y,length) {
	let doubleBallCap = 25;
	let threeBallsCap = doubleBallCap + 25;
	let largePadCap =  threeBallsCap + 20;
	let smallPadCap = largePadCap + 30;
	let deathPowerUpCap = smallPadCap + 25;
	let lifePowerUpCap = deathPowerUpCap + 10;
	let fireBallCap = lifePowerUpCap + 20;
	let iceBallCap = fireBallCap + 20

	let randomNumber = random(iceBallCap);
	if(balls.length > maxBallCount && randomNumber < 50){
		randomNumber = random(threeBallsCap,iceBallCap);
	}

	if(thePad.width >= 160*scale && randomNumber >= threeBallsCap && randomNumber < largePadCap){
		randomNumber += 25;
	} else if(thePad.width <= 40*scale && randomNumber >= largePadCap && randomNumber < smallPadCap){
		randomNumber -= 25;
	}

	if(randomNumber < doubleBallCap){
		powerUps[length] =  new doubleBall(x,y);
	} else if(randomNumber < threeBallsCap){
		powerUps[length] =  new threeBalls(x,y);
	} else if(randomNumber < largePadCap){
		powerUps[length] =  new largePad(x,y);
	} else if(randomNumber < smallPadCap){
		powerUps[length] =  new smallPad(x,y);
	} else if(randomNumber < deathPowerUpCap){
		powerUps[length] =  new deathPowerUp(x,y);
	} else if(randomNumber < lifePowerUpCap){
		powerUps[length] =  new lifePowerUp(x,y);
	} else if(randomNumber < fireBallCap){
		powerUps[length] =  new fireBall(x,y);
	} else {
		powerUps[length] =  new iceBall(x,y);
	}
}

function drawHeart(middleX,middleY){
	fill(0,100,65);
	let A = new p5.Vector(0, -4.5);
	let B = new p5.Vector(4.7, -13.3);
	let C = new p5.Vector(14.4, -2.3);
	let D = new p5.Vector(4, 3.3);
	let E = new p5.Vector(0, 6.7);
	beginShape();
	vertex(middleX,middleY + A.y);
	bezierVertex(middleX + B.x, middleY + B.y, middleX + C.x, middleY + C.y,middleX + D.x,middleY + D.y);
	vertex(middleX + D.x,middleY + D.y);
	vertex(middleX,middleY + E.y);
	vertex(middleX - D.x,middleY + D.y);
	bezierVertex(middleX - C.x,middleY + C.y,middleX - B.x,middleY + B.y,middleX,middleY + A.y);
	endShape();
}
