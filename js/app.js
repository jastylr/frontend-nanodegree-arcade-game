
// Enemies our player must avoid
var Enemy = function(posX, posY) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = posX;
    this.y = posY;
    this.srcX = 0;
    this.srcY = 513;
    this.width = 101;
    this.height = 171;
    
    // Keep track of offsets in the image
    // for collision detection. There is a bunch of white
    // space around each PNG
    this.offsetLeft = 2;
    this.offsetRight = 3;
    this.offsetTop = 78;
    this.offsetBottom = 28;
    this.speed = 0;

    // All images are now contained in a single PNG
    this.sprite = 'images/sprite-sheet.png';

    // Private static variable
    var blipSound;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    
    // Once the enemy reaches the far right bounds, reset it's x position
    if (this.x > 505) {
        this.x = -101;
    }

    // Check to see if we hit the player
    this.checkCollisions();
}

Enemy.prototype.setRandomSpeed = function(minSpeed, maxSpeed) {
    this.speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
}

Enemy.prototype.checkCollisions = function() {
    // The images have a bit of empty, transparent space around them that we
    // need to account for when testing for collisions
    if ((player.x + player.offsetLeft) < this.x + (this.width - this.offsetRight)  && 
        player.x + (player.width - player.offsetRight)  > (this.x + this.offsetLeft) &&
        (player.y + player.offsetTop) < this.y + (this.height - this.offsetBottom) && 
        player.y + (player.height - player.offsetBottom) > (this.y + this.offsetTop)) {

        // Reset the player position, deduct a life and decrement the score
        Enemy.blipSound.play();
        player.numLives--;
        player.score -= 25;
        player.reset(false);
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), 
        this.srcX, 
        this.srcY, 
        this.width, 
        this.height, 
        this.x, 
        this.y, 
        this.width, 
        this.height);
}

// Static function to load audio used by all instances
Enemy.loadAudio = function() {
    var audioBlip = document.createElement('audio');
    audioBlip.src = 'sounds/dp_frogger_squash.mp3';
    audioBlip.loop = false;
    audioBlip.addEventListener("canplaythrough", function () {
        Enemy.blipSound = audioBlip;
        console.log('Enemy blip sound loaded...');
    }, false);
}


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/sprite-sheet.png';
    this.numCharacters = 5;
    this.allCharacters = [];
    this.selectedCharacter = {};
    this.width = 101;
    this.height = 171;
    this.speed = 1;

    // Keep track of offsets in the image
    // for collision detection
    this.offsetLeft = 17;
    this.offsetRight = 17;
    this.offsetTop = 64;
    this.offsetBottom = 32;

    this.numLives = 3;
    this.score = 0;

    var hopSound;

}

Player.loadAudio = function() {
    var audioHop = document.createElement('audio');
    audioHop.src = 'sounds/dp_frogger_hop.mp3';
    audioHop.loop = false;
    audioHop.addEventListener("canplaythrough", function () {
        Player.hopSound = audioHop;
        console.log('Hop sound loaded...');
    }, false);
}

/*
 * Initialize an array of all charcters available and their source
 * position in the sprite image as well as their ID
 */
Player.prototype.initalizeCharacters = function() {
    
    // Store this in a variable so that when setting up
    // the callbacks, they point to the actual player
    var player = this;

    // Build an array containing the locations in the sprite
    // sheet of each of the characters.
    for (var i = 0; i < this.numCharacters; i++) {
        this.allCharacters[i] = {
            id: i + 1,
            srcX: i * this.width,
            srcY: 0
        };
    }

    // Setup click event listeners on each character so we can
    // allow the user to select their own character
    var characters = document.querySelectorAll('.player');

    for (var i = 0; i < characters.length; i++) {
        characters[i].addEventListener('click', function() {
            
            var allchars = document.querySelectorAll('.player');
            
            for (var i = 0; i < allchars.length; i++) {
                // Remove the active class from all characters
                // using removeClass in utils.js
                removeClass(allchars[i], 'active');
            }

            // Add the active class to the clicked character
            addClass(this, 'active');

            // Save the selected character            
            player.selectCharacter(this.id - 1);
        });
    }

    // Setup a default character and make it active
    // in case the user doesn't select one
    this.selectedCharacter = this.allCharacters[2];
    addClass(characters[2], 'active');

    Player.loadAudio();
}

/*
 * Save the user-selected character in the player object
 */
Player.prototype.selectCharacter = function(id) {
    this.selectedCharacter = this.allCharacters[id];
}

Player.prototype.update = function(dt) {
    
    if (this.x < 0) {
        this.x = 0;
    }
    else if (this.x + this.width > 505) {
        this.x = 505 - this.width;
    }
    else if (this.y >= 606 - this.height) {
        this.y = 606 - this.height - 20;
    }
    else if (this.y <= 0) {
        // update the score and send the player
        // back to the bottom of the board
        this.score += 100;
        player.reset(false);
    }
}

Player.prototype.render = function() {
    // Using a sprite sheet here so we use the version
    // of drawImage that takes a source x and y value
    ctx.drawImage(Resources.get(this.sprite), 
        this.selectedCharacter.srcX, 
        this.selectedCharacter.srcY, 
        this.width, 
        this.height, 
        this.x, 
        this.y, 
        this.width, 
        this.height);

    // Update the score and lives
    document.getElementById('score').innerHTML = "Score: " + this.score;
    document.getElementById('lives').innerHTML = "Lives: " + this.numLives;
}

Player.prototype.reset = function(resetLives) {
    // Set the player's x position to the center of the board
    this.x = (505 / 2) - (this.width / 2);
    // Set the player's y position to the bottom of the board
    // minus the offset of the empty space in the player image
    this.y = 606 - this.height - 20;

    // Check if the user has any more lives and if not,
    // reset them and the score
    if (resetLives && this.numLives === 0) {
        this.numLives = 3;
        this.score = 0;
    } 
}

Player.prototype.handleInput = function(key) {

    var distanceX = this.width;
    var distanceY = this.height / 2;
    var playSound = false; 
    
    // See which key was pressed
    if (key === 'left') {
        this.x -= distanceX;
        playSound = true;
    }
    else if (key === 'right') {
        this.x += distanceX;
        playSound = true;
    }
    else if (key === 'up') {
        this.y -= distanceY;
        playSound = true;
    }
    else if (key === 'down') {
        this.y += distanceY;
        playSound = true;
    }

    if (playSound) {
        Player.hopSound.play();
    }
}


/* 
 * Collectible class - used to place collectibles on the board
 */
var Collectible = function(id, srcX, srcY, points) {

    this.sprite = 'images/sprite-sheet.png';
    this.id = id;
    this.srcX = srcX;
    this.srcY = srcY;
    this.width = 101;
    this.height = 171;
    this.points = points;
    this.collected = false;
    
    // Keep track of offsets in the image
    // for collision detection
    this.offsetLeft = 17;
    this.offsetRight = 17;
    this.offsetTop = 64;
    this.offsetBottom = 32;

    var blipSound;
}

// Setup a static properties and methods
// Initialize the number of collectibles retrieved
Collectible.numCollected = 0;
// Setup static array of all collectibles
Collectible.allCollectibles = [];
// Reset all collectibles so that they can be redrawn on
// the screen once they've all been collected
Collectible.reset = function() {
    for (var i=0; i<Collectible.allCollectibles.length; i++) {
        Collectible.allCollectibles[i].setRandomPos();
        Collectible.allCollectibles[i].collected = false;        
    }    
    // Reset the number collected
    Collectible.numCollected = 0;
}


Collectible.prototype.setRandomPos = function() {
    // Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
    var randRow = Math.floor(Math.random() *  (3 + 1 - 1)) + 1; 
    var randCol = Math.floor(Math.random() *  (4 + 1 - 0)) + 0;
    
    this.x = randCol * this.width;
    this.y = randRow * this.height - 98;

    console.log('x: ' + this.x + ' y: ' + this.y);
}

Collectible.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), 
        this.srcX, 
        this.srcY, 
        this.width, 
        this.height, 
        this.x, 
        this.y, 
        this.width, 
        this.height);
}

Collectible.prototype.update = function() {
    
    if (Collectible.numCollected === 5) {
        // All collectibles have been retrieved so
        // call reset() to redraw them at new locations
        Collectible.reset();
    }
    else {
        // If a collectible has been retrieved, move it
        // off screen. 
        // TODO - Perhaps use separate canvas for collectibles
        // and clear them from the canvas when collected?
        if (this.collected === true) {
            this.x = -101;
            this.y = -171;
        }
        else {
            // There are still collectibles on the board so
            // check for retrieval
            this.checkCollected();
        }
    }
}

Collectible.prototype.checkCollected = function() {
    if ((player.x + player.offsetLeft) < this.x + (this.width - this.offsetRight)  && 
        player.x + (player.width - player.offsetRight)  > (this.x + this.offsetLeft) &&
        (player.y + player.offsetTop) < this.y + (this.height - this.offsetBottom) && 
        player.y + (player.height - player.offsetBottom) > (this.y + this.offsetTop)) {

        // Update the score and deduct from all collectibles
        player.score += this.points;
        this.collected = true;
        Collectible.numCollected += 1;
        Collectible.blipSound.play();
        console.log(Collectible.numCollected);
    }   
}

Collectible.loadAudio = function() {
    var audioBlip = document.createElement('audio');
    audioBlip.src = 'sounds/dp_frogger_coin.mp3';
    audioBlip.loop = false;
    audioBlip.addEventListener("canplaythrough", function () {
        Collectible.blipSound = audioBlip;
        console.log('Blip sound loaded...');
    }, false);
}

// Now instantiate your objects.

var collectibles = [
    {id: 'star', srcX: 0, srcY: 342, points: 100},
    {id: 'key', srcX: 101, srcY: 342, points: 75},
    {id: 'heart', srcX: 202, srcY: 342, points: 50},
    {id: 'green-gem', srcX: 303, srcY: 342, points: 25},
    {id: 'blue-gem', srcX: 404, srcY: 342, points: 25}
];

// Create instances of the collectibles and add them to
// the static allCollectibles array
for (var i=0; i<collectibles.length; i++) {
    var col = new Collectible(
                    collectibles[i].id,
                    collectibles[i].srcX,
                    collectibles[i].srcY,
                    collectibles[i].points
                    )
    //allCollectibles.push(col);
    Collectible.allCollectibles.push(col);
    Collectible.reset();
    Collectible.loadAudio();
}

// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i=0; i < 3; i++) {
    var enemy = new Enemy(-50, (i*83) + 62);
    enemy.setRandomSpeed(400, 100);
    allEnemies.push(enemy);
}
Enemy.loadAudio();

// Create a Player and reset it to defaults
var player = new Player();
player.initalizeCharacters();
player.reset(true);


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

