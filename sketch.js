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
		this.speed = 3*scale;
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
			balls[length+i] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r);
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
			circle(this.a/2 + this.x + this.a/5,this.a/2 + this.x + this.a/5,this.a/3);
	}


	action(){
		let length = balls.length;
		for(i=0;i<length;i++){
			for(j=0;j<2;j++){
				balls[length+j+i*2] = new ball(balls[i].position.x,balls[i].position.y,balls[i].velocity.x,balls[i].velocity.y,balls[i].r);
				balls[length+j+i*2].velocity.rotate(PI*j/3);
			}
		}
	}
}

class death extends powerUp {

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
							bricks[i][j].hitPoints--;
							addPoints(l);
							return;
						}
					} else if(this.position.y > bricks[i][j].y&& this.position.y < bricks[i][j].y + bricks[i][j].height) {
						if((this.position.x > bricks[i][j].x - this.r  && this.position.x < bricks[i][j].x + bricks[i][j].width + this.r)) {
							this.velocity.x = (-1)*this.velocity.x;
							bricks[i][j].hitPoints--;
							addPoints(l);
							return;
						}
					} else {
						let A = dist(bricks[i][j].x,bricks[i][j].y,this.position.x,this.position.y);
						if (A <= this.r) {
							let corner = new p5.Vector(1,-1);
							roundBounce(this.velocity,corner);
							bricks[i][j].hitPoints--;
							addPoints(l);
							return;
						}
						let C = dist(bricks[i][j].x,bricks[i][j].y + bricks[i][j].height,this.position.x,this.position.y);
						if (C <= this.r) {
							let corner = new p5.Vector(-1,-1);
							roundBounce(this.velocity,corner);
							bricks[i][j].hitPoints--;
							addPoints(l);
							return;
						}
						let B = dist(bricks[i][j].x + bricks[i][j].width,bricks[i][j].y,this.position.x,this.position.y);
						if (B <= this.r) {
							let corner = new p5.Vector(1,1);
							roundBounce(this.velocity,corner);
							bricks[i][j].hitPoints--;
							addPoints(l);
							return;
						}
						let D = dist(bricks[i][j].x + bricks[i][j].width,bricks[i][j].y + bricks[i][j].height,this.position.x,this.position.y)
						if (D <= this.r) {
							let corner = new p5.Vector(-1,1);
							roundBounce(this.velocity,corner);
							bricks[i][j].hitPoints--;
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
	}

	draw() {
		fill(this.color,80*this.hitPoints/this.maxHitPoints,100);
		rect(this.x,this.y,this.width,this.height,2);
	}

	move() {
		this.y = this.y + brickSpeed;
		this.yCenter = this.yCenter + brickSpeed;
	}

	spawnPowerUp() {
		if(this.hitPoints == 0){
			if(random(1,22) < 20+this.initialHitPoints){
				let length = powerUps.length;
				if(balls.length < maxBallCount){
					powerUps[length] =  new doubleBall(this.x,this.y);
				}
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
	heightBrick = height/25;
	widthBrick = width/10;
	textStyle(BOLD);

	playButton = new button(width/2,height/2 - 75,300,50,"Play",game);
	howToPlayButton = new button(width/2,height/2,300,50,"How To Play",howToPlay);
	highScoresButton = new button(width/2,height/2 + 75,300,50,"High Scores",highScores);
	pauseButton = new button(width*0.975,height*0.035,width*0.042,height*0.06,"",pause);
	mainMenuButton = new button(width*0.05,height*0.035,width*0.096,height*0.06,"Menu",start);
	backButton = new button(width*0.025,height*0.035,width*0.042,height*0.06,"",start);
	resumeButton = new button(width*0.975,height*0.035,width*0.042,height*0.06,"",game);

	initializeNewGame();
}

function draw() {
	strokeWeight(2);
	t0 = performance.now();
	background(295,40,60);
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
	if(gameState == "gameOver"){
		initializeNewGame();
		balls[0].position.x = thePad.x;
		balls[0].position.y = thePad.y - thePad.height/2 - balls[0].r;
	}
	activeGame = 1;
	gameState = "game";



	minuteCount();
	bricksSpeedPosition();
	newRowOfBricks();
	drawElements();
	moveColideElements();

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
	let l = bricks[0].length
	if(l>0){
		brickSpeed = -0.01 + 3*0.01*startRows/l;
	} else {
		brickSpeed = 0.31;
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
	balls[0] = new ball(width/2,300,0,scale*4/step,scale*4);
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

	for(g=0;g<step;g++){
		thePad.move();
	}
}

function blur() {
	fill(295,60,60,0.8);
	rect(0,0,width,height);
}
