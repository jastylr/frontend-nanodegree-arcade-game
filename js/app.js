var engine = this.Engine = this.Engine || {};

// Enemies our player must avoid
var Enemy = function(posX, posY) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = posX;
    this.y = posY;
    this.width = 101;
    this.height = 171;
    this.speed = Math.floor(Math.random() * (300 - 100 + 1) + 100);

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    
    // Clear the previous enemy image
    ctx.clearRect(this.x, this.y, this.width, this.height);

    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    // Once the enemy reaches the far right bounds, reset it's x position
    if (this.x > 505) {
        this.x = -101;
    }
}

Enemy.prototype.setRandomSpeed = function(minSpeed, maxSpeed) {
    this.speed = Math.floor(Math.random() * (max - min + 1)) + min;
}

Enemy.prototype.checkCollisions = function() {

}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.width = 101;
    this.height = 171;
    this.speed = 10;
    this.stageComplete = false;
}

Player.prototype.update = function(dt) {
    if (this.y <= 0) {
        this.y = 0;
        this.stageComplete = true;
    }

    if (this.y >= 606)
        engine.endGame();
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.reset = function() {
    this.x = (505 / 2) - (this.width / 2);
    this.y = 606 - this.height - 28;
    this.stageComplete = false;
}

Player.prototype.handleInput = function(key) {

    var distanceX = this.width;
    var distanceY = this.height / 2; 
    
    // See which key was pressed
    if (key === 'left') {
        this.x -= distanceX;
    }
    else if (key === 'right') {
        this.x += distanceX;
    }
    else if (key === 'up') {
        this.y -= distanceY;
    }
    else if (key === 'down') {
        this.y += distanceY;
    }

}


// Now instantiate your objects.

// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i=0; i < 3; i++) {
    allEnemies.push(new Enemy(50, (i*84) + 62));
}

// Create a Player and reset it to defaults
var player = new Player();
player.reset();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

