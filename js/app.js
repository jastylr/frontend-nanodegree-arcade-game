
// Enemy constructor. Takes an initial x and y position as parameters
var Enemy = function(posX, posY) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = posX;
    this.y = posY;
    this.width = 101;
    this.height = 171;
    
    // Keep track of offsets in the image
    // for collision detection. There is a bunch of white
    // space around each PNG
    this.offsetLeft = 2;
    this.offsetRight = 3;
    this.offsetTop = 78;
    this.offsetBottom = 28;
    this.speed = 1;

    // All images are now contained in a single PNG
    this.sprite = 'images/sprite-sheet.png';

    // Private static variable to store sound
    // when bug hits a player
    var blipSound;
};

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
};

/* Set a random speed for each enemy object. Takes 2 parameters,
 * minSpeed and maxSpeed which determine the minimum speed and
 * maximum speed values to randomize
 */
Enemy.prototype.setRandomSpeed = function(minSpeed, maxSpeed) {
    this.speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
};

// checkCollisions - used to determine whether the bounding areas of an enemy and
// a player intersect. If so, deduct a life from the player as well as some points
Enemy.prototype.checkCollisions = function() {
    // The images have a bit of empty, transparent space around them that we
    // need to account for when testing for collisions
    if ((player.x + player.offsetLeft) < this.x + (this.width - this.offsetRight)  && 
        player.x + (player.width - player.offsetRight)  > (this.x + this.offsetLeft) &&
        (player.y + player.offsetTop) < this.y + (this.height - this.offsetBottom) && 
        player.y + (player.height - player.offsetBottom) > (this.y + this.offsetTop)) {

        // Reset the player position, deduct a life and decrement the score,
        // then send the user back to the default starting position
        Enemy.blipSound.play();
        player.numLives--;
        player.score -= 25;
        player.reset(false);
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), 
        0, 
        513, 
        this.width, 
        this.height, 
        this.x, 
        this.y, 
        this.width, 
        this.height);
};

/* An immediately executed static method to load the audio resource
 * for the Enemy objects.
 * Checks to see that the audio can be played before assigning it
 */
Enemy.loadAudio = (function() {

    var audioBlip = document.createElement('audio');
    audioBlip.src = 'sounds/dp_frogger_squash.mp3';
    audioBlip.loop = false;

    // Make sure the audio can be loaded and played and
    // then assign it to our static blipSound property
    audioBlip.addEventListener('canplaythrough', function() {
        Enemy.blipSound = audioBlip;
    });
})();


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

    // Private variable to store the audio for
    // moving a player aroudn the screen
    var hopSound;

};

/*
 * Initialize an array of all charcters available and their source
 * position in the sprite image as well as their ID
 */
Player.prototype.initalizeCharacters = function() {
    
    // Store this in a variable so that when setting up
    // the callbacks, they point to the actual player
    var player = this,
        i;

    // Build an array containing the locations in the sprite
    // sheet of each of the characters.
    for (i = 0; i < this.numCharacters; i++) {
        this.allCharacters[i] = {
            id: i + 1,
            srcX: i * this.width,
            srcY: 0
        };
    }

    // Setup click event listeners on each character so we can
    // allow the user to select their own character
    var characters = document.querySelectorAll('.player');

    for (i = 0; i < characters.length; i++) {
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

};

/*
 * Save the user-selected character in the player object
 * Takes the id of the selected character as a parameter
 * which is stored in the selectedCharacter property
 */
Player.prototype.selectCharacter = function(id) {
    this.selectedCharacter = this.allCharacters[id];
};

/* Update a player's position on the screen and checks
 * to make sure that the player does not go out of the bounds
 * of the playing board.
 *
 * If the player makes it to the top of the board, then the
 * score is incremented and the player's position is reset
 * by calling the reset() method with a value of "false"
 */
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
};

/* Draw the player on the screen at it's current position
 * and update the score and lives text fields.
 */
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
};

/* Reset a player's position on the screen to the starting position
 * Takes a single boolean parameter, resetLives which when equal to
 * true, will reset the players lives and score as well.
 *
 * This allows a player's position to be reset such as when they reach
 * the top of the game board or when they are hit by an enemy but the
 * game is still in progress so we don't want to reset the score or lives.
 *
 * When the resetLives parameter is provided and equates to true,
 * both the player's position and their lives and score are reset.
 */
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
};

// handleInput - detects which key was pressed
// and moves the player accordingly
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

    // If on of the expected keys is pressed,
    // play the hop sound
    if (playSound) {
        Player.hopSound.play();
    }
};

/* An immediately executed static method to load the audio resource
 * for the Player object.
 * Checks to see that the audio can be played before assigning it
 */
Player.loadAudio = (function() {
    
    var audioHop = document.createElement('audio');
    audioHop.src = 'sounds/dp_frogger_hop.mp3';
    audioHop.loop = false;

    // Make sure the audio can be played and then assign it
    // to the hopSound property
    audioHop.addEventListener('canplaythrough', function() {
        Player.hopSound = audioHop;
    }); 
})();


/* 
 * Collectible class - used to place collectibles on the board.
 *
 * Takes 4 parameters, an id, a srcX and srY which determine the
 * image positions in the sprite sheet and the number of points
 * that the collectible is worth when retrieved.
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

    // Store the sound effect played when
    // a collectible is retrieved. 
    var blipSound;
};

// Setup some static properties and methods
// Initialize the number of collectibles retrieved to 0
Collectible.numCollected = 0;

// Setup static array of all collectibles
Collectible.allCollectibles = [];
 
/* 
 * Static method to reset all collectibles so that they can be redrawn on
 * the screen once they've all been collected
 */
Collectible.reset = function() {
    // Loop through all the collectible objects in the static array
    // and call the setRandomPos() method and set their collected
    // property to false.
    for (var i=0; i<Collectible.allCollectibles.length; i++) {
        Collectible.allCollectibles[i].setRandomPos();
        Collectible.allCollectibles[i].collected = false;        
    }    
    // Reset the number collected
    Collectible.numCollected = 0;
};
 
/* 
 * setRandomPos = Places the collectible randomly on
 * the playing board
 */
Collectible.prototype.setRandomPos = function() {

    // Get a random row and column position
    var randRow = Math.floor(Math.random() *  (3 + 1 - 1)) + 1; 
    var randCol = Math.floor(Math.random() *  (4 + 1 - 0)) + 0;
    
    // Set the object's x and y position based on the
    // random row and column
    this.x = randCol * this.width;
    this.y = randRow * this.height - 98;

    console.log('x: ' + this.x + ' y: ' + this.y);
};

/* 
 * Draw the collectible image on the canvas
 */
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
};

/* 
 * Determine if a collectible has been retrieved and if so,
 * update it's position to remove it off the screen and set
 * it's collected property to TRUE.
 *
 * Once all of the collectibles have been retrieved by checking
 * the numCollected property value, then call the reset() method
 * which will reset the collected property of each collectible
 * object and redraw them all on the screen in new positions
 */
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
};

// checkCollected - determines if the player has retrieved a collectible
// by doing simply rectangluar hit detection
Collectible.prototype.checkCollected = function() {
    
    if ((player.x + player.offsetLeft) < this.x + (this.width - this.offsetRight)  && 
        player.x + (player.width - player.offsetRight)  > (this.x + this.offsetLeft) &&
        (player.y + player.offsetTop) < this.y + (this.height - this.offsetBottom) && 
        player.y + (player.height - player.offsetBottom) > (this.y + this.offsetTop)) {

        // Update the score and deduct from all collectibles
        player.score += this.points;
        this.collected = true;
        Collectible.numCollected += 1;
         
        // If a collectible has been retrieved then play the audio effect
        // associated with it. We first call the pause() method on the audio
        // and reset it's play position to the beginning of the audio file.
        // This is done in case the audio from another collectible is already playing.
        // Rather than waiting for the audio to finish, we start over instead
        Collectible.blipSound.pause();
        Collectible.blipSound.currentTime = 0;
        Collectible.blipSound.play();
        console.log('Collected ' + Collectible.numCollected + ' items');
    }   
};

/* 
 * An immediately executed static method to load the audio file
 * for the Collectible class. Checks that the audio can be played
 * and assigns the file to the blipSound property
 */
Collectible.loadAudio = (function() {
    
    var audioBlip = document.createElement('audio');
    audioBlip.src = 'sounds/dp_frogger_coin.mp3';
    audioBlip.loop = false;
    audioBlip.addEventListener('canplaythrough', function() {
        Collectible.blipSound = audioBlip;
    });
})();

// Now instantiate your objects.

/* 
 * Temp array to define collectibles with their image sprite
 * source x and y locations and their point values
 */
var collectibles = [
    {id: 'star', srcX: 0, srcY: 342, points: 100},
    {id: 'key', srcX: 101, srcY: 342, points: 75},
    {id: 'heart', srcX: 202, srcY: 342, points: 50},
    {id: 'green-gem', srcX: 303, srcY: 342, points: 25},
    {id: 'blue-gem', srcX: 404, srcY: 342, points: 25}
];

// Create instances of all the collectibles and add them to
// the static allCollectibles array
for (var i=0; i<collectibles.length; i++) {
    
    var col = new Collectible(
                    collectibles[i].id,
                    collectibles[i].srcX,
                    collectibles[i].srcY,
                    collectibles[i].points
                    );
    
    // Store the object in the static allCollectibles array
    Collectible.allCollectibles.push(col);
    
    // Call the static reset() method to redraw and reposition
    // all of the collectibles simultaneously
    Collectible.reset();

}

// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i=0; i < 3; i++) {
    
    var enemy = new Enemy(-50, (i*83) + 62);
    enemy.setRandomSpeed(400, 100);
    allEnemies.push(enemy);

}

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

