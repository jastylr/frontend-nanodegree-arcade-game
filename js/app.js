'use strict';

/**
 * @description - Base class for all game entities.
 * @constructor
 * @param srcX - The x coordinate of the object's image in the sprite sheet.
 * @param srcY - The x coordinate of the object's image in the sprite sheet.
 * @param xPos - The x coordinate of the image on the screen.
 * @param yPos - The y coordinate of the image on the screen.
 * @param width - The width of the object's image.
 * @param height - The height of the object's image.
 */ 
 var GameObject = function() {

    // Assign the image sprite sheet that is used
    // for all the game objects
    this.sprite = 'images/sprite-sheet.png';
    
    // Initialize to some default values which will be overriden
    // by inherited objects
    this.name = 'GameObject'; // Inherited classes will have specific names
    this.srcX = 0; // X coordinate of the image in the sprite sheet
    this.srcY = 0; // Y coordinate of the image in the sprite sheet
    this.x = -GameObject.constants.COL_WIDTH; // Initial X coordinate off to the left of the canvas
    this.y = -GameObject.constants.ROW_HEIGHT; // Initial Y coordinate off to the top of the canvas
    this.width = GameObject.constants.COL_WIDTH; // Set the initial object width to be the column width
    this.height = GameObject.constants.ROW_HEIGHT; // Set the initial object height to the the row height
};

// Setup some constants used throughout the code.
// Note: Originally these were defined using the "const" keyword 
// but this is not supported in all versions of Javascript and will
// cause an error when using 'strict' mode, therefore I'm
// defining properties as part of the GameObject using defineProperty
GameObject.constants = {};

Object.defineProperty(GameObject.constants, "COL_WIDTH", {
    value: 101
});

Object.defineProperty(GameObject.constants, "ROW_HEIGHT", {
    value: 83
});

Object.defineProperty(GameObject.constants, "NUM_ROWS", {
    value: 8
});

Object.defineProperty(GameObject.constants, "NUM_COLS", {
    value: 8
});

Object.defineProperty(GameObject.constants, "BOARD_WIDTH", {
    value: GameObject.constants.NUM_COLS * GameObject.constants.COL_WIDTH
});

Object.defineProperty(GameObject.constants, "BOARD_HEIGHT", {
    value: GameObject.constants.NUM_ROWS * GameObject.constants.ROW_HEIGHT
});

Object.defineProperty(GameObject.constants, "ROAD_HEIGHT", {
    value: 64
});

Object.defineProperty(GameObject.constants, "XTOL", {
    value: 40
});

Object.defineProperty(GameObject.constants, "YTOL", {
    value: 40
});

Object.defineProperty(GameObject.constants, "NUM_ENEMIES", {
    value: 7
});

Object.defineProperty(GameObject.constants, "ENEMY_HEIGHT", {
    value: 50
});

Object.defineProperty(GameObject.constants, "NUM_LIVES", {
    value: 3
});

/**
 * @description - Render method to display object on the canvas.
 */ 
GameObject.prototype.render = function(ctx) {
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

/**
 * @description - Get the row number that the object currently resides in.
 */
GameObject.prototype.getRow = function(tolerance) {
    
    // Account for some blank space in the player sprite when determining
    // which row the player is currently on. Check that tolerance was
    // provided otherwise set it to 0.
    tolerance = typeof tolerance !== 'undefined' ? tolerance : 0;
    
    return Math.abs(Math.floor((this.y + tolerance) / GameObject.constants.ROW_HEIGHT));
};


/**
 * @description - Base class representation of an Enemy.
 * @constructor
 * @param srcX - The x coordinate of the image in the sprite sheet.
 * @param srcY - The y coordinate of the image in the sprite sheet.
 */ 
var Enemy = function(srcX, srcY) {
    
    // Call the superclass constructor
    GameObject.call(this);
    
    // Save image sprite source location and the x and y position
    // on the canvas
    this.srcX = srcX;
    this.srcY = srcY;
    
};

// Set the Enemy prototype to be the base GameObject class
// so that it inherits the base class's properties and methods
Enemy.prototype = Object.create(GameObject.prototype); 
Enemy.prototype.constructor = Enemy;

/**
 * @description - Representation of a Vehicle inherited from Enemy.
 * @constructor
 * @param srcX - The x coordinate of the image in the sprite sheet.
 * @param srcY - The y coordinate of the image in the sprite sheet.
 */ 
var Vehicle = function(srcX, srcY) {
    
    // Call the superclass constructor
    Enemy.call(this);

    // Generate a random row position for this enemy
    var pos = this.getRandomPos();
    
    // Save which direction the enemy is travelling in
    this.direction = pos.direction;
    
    // If the enemy is moving from right to left, then adjust
    // the srcX value to grab the image just to the right
    // of it in the sprite sheet
    if (this.direction === 1) {
        srcX += GameObject.constants.COL_WIDTH;
    }

    // // Save image sprite source location and the x and y position
    // // on the canvas
    this.srcX = srcX;
    this.srcY = srcY;
    this.x = pos.x; // pos.x contains the x coordinate returned from getRandomPos()
    this.y = pos.y; // pos.y contains the y coordinate returned from getRandomPos()

    // Vehicles have a different height than other game objects
    // so override it here
    this.height = GameObject.constants.ENEMY_HEIGHT;
    
};

// Set the Vehicle prototype to be the base Enemy class
// so that it inherits the base class's properties and methods
Vehicle.prototype = Object.create(Enemy.prototype); 
Vehicle.prototype.constructor = Vehicle;

/**
 * @description - Generate a random position on the road for a vehicle
 */
Vehicle.prototype.getRandomPos = function() {
    
    var x,
        direction,
        row = Math.floor(Math.random() * 4),
        y = (GameObject.constants.ROW_HEIGHT * 4) + (GameObject.constants.ROAD_HEIGHT * row);

    // Enemies on even rows go left to right,
    // odd rows go right to left
    if (row % 2 === 0) { // Even row so place the object off the left side of the canvas
        x = -GameObject.constants.COL_WIDTH;
        direction = 0;
    } else {
        x = GameObject.constants.BOARD_WIDTH; // Odd row so place the object off the right side of the canvas
        direction = 1;
    }

    // Return an object containing the 
    // x and y positions and the direction of travel
    return {
        x: x,
        y: y,
        direction: direction
    };
};

/** 
 * @description - Update an enemy
 * @param dt - delta time created in engine.js
 */
Vehicle.prototype.update = function(dt) {

    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Update the x position based based on the direction
    this.x += ((this.direction === 0) ? this.speed : -this.speed) * dt;
    
    // Once the enemy is out of bounds, reset it's x position
    if (this.x > GameObject.constants.BOARD_WIDTH || this.x < 0 - GameObject.constants.COL_WIDTH) {
        this.x = (this.direction === 0) ? -GameObject.constants.COL_WIDTH : GameObject.constants.BOARD_WIDTH;
    }

};


var Car = function(srcX, srcY) {

    Vehicle.call(this, srcX, srcY);

    this.speed = (Math.floor(Math.random() * 5) + 1) * 50;
    this.points = 25; // Number of points lost if hit by this object

};

Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;

var Viper = function(srcX, srcY) {

    Vehicle.call(this, srcX, srcY);
    this.speed = (Math.floor(Math.random() * 5) + 1) * 100;
    this.points = 50; // Number of points lost if hit by this object
};

Viper.prototype = Object.create(Vehicle.prototype);
Viper.prototype.constructor = Viper;

var Truck = function(srcX, srcY) {

    Vehicle.call(this, srcX, srcY);
    this.speed = (Math.floor(Math.random() * 5) + 1) * 30;
    this.points = 40; // Number of points lost if hit by this object
};

Truck.prototype = Object.create(Vehicle.prototype);
Truck.prototype.constructor = Truck;

var Ambulance = function(srcX, srcY) {

    Vehicle.call(this, srcX, srcY);
    this.speed = (Math.floor(Math.random() * 5) + 1) * 40;
    this.points = 80; // Number of points lost if hit by this object
};

Ambulance.prototype = Object.create(Vehicle.prototype);
Ambulance.prototype.constructor = Ambulance;


/** 
 * Predator Class - an enemy that can kill the player
 * and deduct points and lives. Predators live on the grass, on
 * logs or on lilypads.
 */
var Predator = function(srcX, srcY) {

    Enemy.call(this, srcX, srcY);

    // Generate a random row position for this enemy
    var pos = this.getRandomPos();

    this.x = pos.x;
    this.y = pos.y;
    this.speed = 0;
    this.direction = -1;
    this.points = 10; // Intiial number of points lost if hit by this object
};

Predator.prototype = Object.create(Enemy.prototype);
Predator.prototype.constructor = Predator;

/**
 * @description - Generate a random position for a predator
 */
Predator.prototype.getRandomPos = function() {
    
    var x, y, row, col;

    // Predators are placed on any row excpet the road rows
    var availRows = [0];

    // Randomly choose from one of the available rows in the availRows array
    row = availRows[Math.floor(Math.random() * availRows.length)];
    col = Math.floor(Math.random() * 8);

    x = col * GameObject.constants.COL_WIDTH;
    y = row * GameObject.constants.ROW_HEIGHT;

    // If the predator is on a water row, then set it's
    // speed and direction
    if (this.onWaterRow(row)) {
        this.direction = (row % 2 === 0) ? 0 : 1;
        this.speed = (row + 1) * 100;
    }

    // Return an object containing the 
    // x and y positions and the direction of travel
    return {
        x: x,
        y: y
    };
};

Predator.prototype.onWaterRow = function(row) {
    return (row === 1 || row === 2 || row === 3);
};

Predator.prototype.update = function(dt) {

    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += ((this.direction === 0) ? this.speed : -this.speed) * dt;
    
    // Once the floatable reaches either end of the board, reset it's x position
    if (this.x > GameObject.constants.BOARD_WIDTH || this.x < 0 - GameObject.constants.COL_WIDTH) {
        this.x = (this.direction === 0) ? 
                -GameObject.constants.COL_WIDTH : 
                (GameObject.constants.COL_WIDTH * GameObject.constants.NUM_COLS);
    }

};

/**
 * @description - Representation of an Floatable object (Log, Lilypad etc).
 * @constructor
 * @param srcX - The x coordinate of the image in the sprite sheet.
 * @param srcY - The x coordinate of the image in the sprite sheet.
 * @param row - The row to place the object on.
 * @param xPos - The x coordinate in the row of where to display.
 */ 
var Floatable = function(srcX, srcY, row, xPos) {
    
    // Call the superclass constructor
    GameObject.call(this);

    this.srcX = srcX;
    this.srcY = srcY;
    
    this.x = xPos;
    this.y = (row * GameObject.constants.ROW_HEIGHT) + GameObject.constants.ROW_HEIGHT;
    this.row = row;
    this.direction = (this.row % 2 === 0) ? 0 : 1;

    this.speed = (this.row + 1) * 100;
    this.hasPredator = false; // Does this object have a predator on it?
    
};

Floatable.prototype = Object.create(GameObject.prototype); 
Floatable.prototype.constructor = Floatable;

Floatable.prototype.update = function(dt) {

    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += ((this.direction === 0) ? this.speed : -this.speed) * dt;
    
    // Once the floatable reaches either end of the board, reset it's x position
    if (this.x > GameObject.constants.BOARD_WIDTH || this.x < 0 - GameObject.constants.COL_WIDTH) {
        this.x = (this.direction === 0) ? 
                -GameObject.constants.COL_WIDTH : 
                (GameObject.constants.COL_WIDTH * GameObject.constants.NUM_COLS);
    }

};

Floatable.prototype.ride = function(player, dt) {
    player.riding = true;
    player.x = this.x;
};

Floatable.prototype.addPredator = function(predator) {
    this.hasPredator = true;
    predator.x = this.x;
    predator.y = this.y;
    predator.speed = this.speed;
    predator.direction = this.direction;
};

Floatable.prototype.removePredator = function() {
    if (this.hasPredator) {
        // Remove it
        this.hasPredator = false;
    }
};


/**
 * @description Representation of a Player.
 * @constructor
 */ 
var Player = function(srcX, srcY) {
    
    GameObject.call(this);
    
    this.srcX = srcX;
    this.srcY = srcY;
    this.speed = 1;
    this.riding = false;
    this.numLives = GameObject.constants.NUM_LIVES;
    this.score = 0;
    this.food = 0;

    // Private variables to store the audio for
    // moving a player around the screen and dying
    var hopSound;
    var dieSound;
    var eatSound;
};

Player.prototype = Object.create(GameObject.prototype); 
Player.prototype.constructor = Player;

/**
 * Return whether the player is on a water row or not
 */
Player.prototype.isOnWater = function() {
    
    var row = this.getRow(GameObject.constants.YTOL);
    if (row === 1 || row === 2 || row === 3) {
        return (this.y <= row * GameObject.constants.ROW_HEIGHT);
    }

    return false;
};

/**
 * Update a player's position on the screen and checks
 * to make sure that the player does not go out of the bounds
 * of the playing board.
 *
 * If the player makes it to the top of the board, then the
 * score is incremented and the player's position is reset
 * by calling the reset() method with a value of "false"
 */
Player.prototype.update = function(dt) {
    
    
    this.checkCollisions(dt);

    // Check food count and if it equals 5 then
    // add a life to the player and reset food count
    if (this.food === 5) {
        this.numLives++;
        this.food = 0;
    }

    if (this.x < 0) {
        this.x = 0;
    } else if (this.x + this.width > GameObject.constants.BOARD_WIDTH) {
        this.x = GameObject.constants.BOARD_WIDTH - this.width;
    } else if (this.y >= GameObject.constants.BOARD_HEIGHT - this.height) {
        this.y = GameObject.constants.BOARD_HEIGHT - this.height;
    } else if (this.y <= 0) {
        // update the score and send the player
        // back to the bottom of the board
        this.score += 100;
        player.reset(false);
    }

    // Update the score and lives text elements
    var scoreElem = document.getElementById('score');
    var livesElem = document.getElementById('lives');

    scoreElem.innerHTML = 'Score: ' + this.score;
    livesElem.innerHTML = 'Lives: ' + this.numLives;
};

Player.prototype.eat = function() {
    Player.eatSound.play();
    this.food++;
};

/**
 * @description - die method used to play die sound and reset player
 */
Player.prototype.die = function() {
    Player.dieSound.play();
    this.numLives--;
    this.reset(false);
};

/**
 * @description - do rectangluar collision detection with the passed in object
 * @param obj - the object to compare against the player for collision
 */
Player.prototype.collideswith = function(obj) {

    // return true or false if there is a collision
    // XTOL and YTOL are space around the player that
    // is used to make collision detection more accurate
    // since there is blank space in the player image
    return (this.x + GameObject.constants.XTOL < obj.x + obj.width &&
       this.x + this.width - GameObject.constants.XTOL > obj.x &&
       this.y + GameObject.constants.YTOL < obj.y + obj.height &&
       this.height + this.y - GameObject.constants.YTOL > obj.y);
        
};

/**
 * @description - check for any collisions with the player and other objects
 * @param dt - time value for smooth animation
 */
Player.prototype.checkCollisions = function(dt) {
    
    var isRiding = false,
        i;

    // Loop through all the enemies (Vehicles) and check
    // for collisions. 
    for (i=0; i<allEnemies.length; i++) {
        if (this.collideswith(allEnemies[i])) {
            this.score -= allEnemies[i].points;
            this.showMessage('You Were Run Over by a Vehicle! Loss of ' + allEnemies[i].points + ' points!');
            this.die();
            break;
        }
    }

    // If the player is on a water row, then check if we
    // have a collision with a ridable water object. If the
    // player is on the water but not on a ridable object,
    // then they must be in the water which means they're dead
    if (this.isOnWater()) {
        for (i=0; i<allWaterObs.length; i++) {
            if (this.collideswith(allWaterObs[i])) {
                isRiding = true;
                allWaterObs[i].ride(this, dt);
                break;
            } 
        }

        // The player is on a water row but isn't on a log or lilypad 
        // so they must have fallen into the water which means they're dead
        if (!isRiding) {
            this.score -= 25;
            this.showMessage('You Fell in the Water! Loss of 25 points!');
            this.die();
        }      
    }

    // Loop through all the predators and check for collisions
    for (i=0; i<allPredators.length; i++) {
        if (this.collideswith(allPredators[i])) {
            this.score -= allPredators[i].points;
            this.showMessage('You Were Eaten by a Predator!');
            this.die();
            break;
        }
    }

    // Loop through all the flying food and check for collisions
    for (i=0; i<allFood.length; i++) {
        if (this.collideswith(allFood[i])) {
            this.eat();
            allFood[i].reset();
            this.showMessage('You Ate Some Food!');
            console.log('Food count: ' + this.food);
            break;
        }
    }
};

/**
 * Reset a player's position on the screen to the starting position
 * Takes a single boolean parameter, resetLives which when equal to
 * true, will reset the players lives and score as well.
 *
 * This allows a player's position to be reset such as when they reach
 * the top of the game board or when they are hit by an enemy but the
 * game is still in progress so we don't want to reset the score or lives.
 *
 * When the resetLives parameter is provided and equates to true,
 * both the player's position and their lives and score are reset.
 *
 * @param resetLives - Boolean
 */
Player.prototype.reset = function(resetLives) {
    
    // Set the player's x position to the center of the board
    this.x = (GameObject.constants.BOARD_WIDTH / 2) - (this.width / 2);
    
    // Set the player's y position to the bottom of the board
    this.y = GameObject.constants.BOARD_HEIGHT - this.height;

    // Check if the user has any more lives and if not,
    // reset them and the score
    if (resetLives && this.numLives === 0) {
        this.numLives = GameObject.constants.NUM_LIVES;
        this.score = 0;
    } 
};

/**
 * Display a popup message such as when a user dies or completes a level
 */
Player.prototype.showMessage = function(message) {
    console.log(message);

    var canvas = document.getElementById("msgCanvas");
    var ctx = canvas.getContext("2d");
    var x = canvas.width / 2;
    var y = canvas.height / 2 + 10;
    var alpha = 1.0;   // full opacity
    var interval;

    interval = setInterval(function () {
            // Clears the canvas
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.textAlign = 'center';
            ctx.font = "bold 20pt Arial";
            ctx.strokeStyle = "rgba(0, 0, 0, " + alpha + ")";
            ctx.lineWidth = 3;
            ctx.strokeText(message, x, y);
            ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
            ctx.fillText(message, x, y);
            alpha = alpha - 0.05; // decrease opacity (fade out)
            if (alpha < 0) {
                canvas.width = canvas.width;
                clearInterval(interval);
            }
        }, 150); 

};

/**
 * @description - Detect key presses for player movement
 * @param key - The pressed key
 */
Player.prototype.handleInput = function(key) {

    var distanceX = this.width / 2;
    var distanceY;
    var playSound = false; 

    if (this.getRow() === 4 || this.getRow() === 5 || this.getRow() === 6) {
        distanceY = GameObject.constants.ROAD_HEIGHT;
    } else {
        distanceY = this.height;
    }
    
    // See which key was pressed
    if (key === 'left') {
        this.x -= distanceX;
        playSound = true;
    } else if (key === 'right') {
        this.x += distanceX;
        playSound = true;
    } else if (key === 'up') {
        this.y -= distanceY;
        playSound = true;
    } else if (key === 'down') {
        this.y += distanceY;
        playSound = true;
    }

    // If one of the expected keys is pressed,
    // play the hop sound
    if (playSound) {
        Player.hopSound.play();
    }
};

/** 
 * An immediately executed static method to load the audio resource
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

    var audioDie = document.createElement('audio');
    audioDie.src = 'sounds/dp_frogger_squash.mp3';
    audioDie.loop = false;

    // Make sure the audio can be played and then assign it
    // to the dieSound property
    audioDie.addEventListener('canplaythrough', function() {
        Player.dieSound = audioDie;
    });

    var audioEat = document.createElement('audio');
    audioEat.src = 'sounds/bonus.mp3';
    audioEat.loop = false;

    // Make sure the audio can be played and then assign it
    // to the eatSound property
    audioEat.addEventListener('canplaythrough', function() {
        Player.eatSound = audioEat;
    });

})();


/**
 * Obstacle class. Objects such as rocks that don't move, 
 * they just prevent a player from advancing. These will 
 * only appear on the grass rows.
 */
var Obstacle = function(srcX, srcY, row, xPos) {
    // Call the superclass constructor
    GameObject.call(this);

    this.srcX = srcX;
    this.srcY = srcY;
    this.x = xPos;
    this.y = (row * GameObject.constants.ROW_HEIGHT);
    this.row = row;
};

Obstacle.prototype = Object.create(GameObject.prototype); 
Obstacle.prototype.constructor = Obstacle;


var Food = function(srcX, srcY) {
    // Call the superclass constructor
    GameObject.call(this);

    this.srcX = srcX;
    this.srcY = srcY;

    this.reset();

}

Food.prototype = Object.create(GameObject.prototype); 
Food.prototype.constructor = Food;

/**
 * @description - Generate a random position for the food object
 */
Food.prototype.getRandomPos = function() {
    
    var col = Math.floor(Math.random() * GameObject.constants.NUM_COLS),
        y = -GameObject.constants.ROW_HEIGHT,
        x = col * GameObject.constants.COL_WIDTH;

    this.speed = (Math.floor(Math.random() * 5) + 1) * 100;    

    this.x = x;
    this.y = y;
};

Food.prototype.reset = function() {
    // Get a new random position
    this.getRandomPos();
}

/** 
 * @description - Update an food object's position
 * @param dt - delta time created in engine.js
 */
Food.prototype.update = function(dt) {

    // Update the y position based based on the direction
    this.y += this.speed * dt;
    
    // Once the enemy is out of bounds, reset it's x position
    if (this.y > GameObject.constants.BOARD_HEIGHT) {
        this.getRandomPos();
    }

};


/**
 * @description Representation of a collectible object.
 * @constructor
 * @param id - ID of the collectible
 * @param srcX - The x coordinate of the image in the sprite sheet
 * @param srcY - The y coordinate of the image in the sprite sheet
 * @param points - The point value of the collectible
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
 
/**
 * Static method to reset all collectibles so that they can be redrawn on
 * the screen once they've all been collected
 */
Collectible.reset = function() {
    // Loop through all the collectible objects in the static array
    // and call the setRandomPos() method and set their collected
    // property to false.
    for (var i = 0; i < Collectible.allCollectibles.length; i++) {
        Collectible.allCollectibles[i].setRandomPos();
        Collectible.allCollectibles[i].collected = false;        
    }
    // Reset the number collected
    Collectible.numCollected = 0;
};
 
/**
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

};

/**
 * @description - Render a collectible on the canvas
 * @param ctx - A reference to the canvas context to draw on
 */
Collectible.prototype.render = function(ctx) {
    
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

/**
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
    } else {
        // If a collectible has been retrieved, move it
        // off screen. 
        // TODO - Perhaps use separate canvas for collectibles
        // and clear them from the canvas when collected?
        if (this.collected === true) {
            this.x = -101;
            this.y = -171;
        } else {
            // There are still collectibles on the board so
            // check for retrieval
            this.checkCollected();
        }
    }
};

/**
 * @description - Determine if a collectible object has been retrieved by the player
 */
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

/**
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

/**
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

/**
 * Create instances of all the collectibles and add them to
 * the static allCollectibles array
 */
// for (var i = 0; i <  collectibles.length; i++) {
    
//     var col = new Collectible(
//                     collectibles[i].id,
//                     collectibles[i].srcX,
//                     collectibles[i].srcY,
//                     collectibles[i].points
//                     );
    
//     // Store the object in the static allCollectibles array
//     Collectible.allCollectibles.push(col);
    
//     // Call the static reset() method to redraw and reposition
//     // all of the collectibles simultaneously
//     Collectible.reset();

// }

var player,
    allEnemies = [],
    allPredators = [],
    allWaterObs = [],
    allCollectibles = [],
    allFood = [],
    allRocks = [];

/**
 * Place all enemy objects in an array called allEnemies
 * Place the player object in a variable called player
 * Create a Player and reset it to defaults
 */
player = new Player(0, 0);
player.reset(true);


/**
 * Generate the enemies and give them an initial
 * position and speed and add them to the allEnemies
 * array
 */
allEnemies[0] = new Car(0, 133);
allEnemies[1] = new Car(0, 133);
allEnemies[2] = new Car(0, 133);
allEnemies[3] = new Truck(0, 83);
allEnemies[4] = new Viper(0, 183);
allEnemies[5] = new Viper(0, 183);
allEnemies[6] = new Ambulance(0, 233);
allEnemies[7] = new Truck(0, 83);

/**
 * Create an array of predators. Predators are objects
 * such as snakes, raccoons etc. which can kill our player
 */
allPredators[0] = new Predator(303, 283);
allPredators[1] = new Predator(101, 283);
allPredators[2] = new Predator(101, 283);
allPredators[3] = new Predator(303, 283);
allPredators[4] = new Predator(202, 283);



/** 
 * A Map of locations where floatable objects reside on the water rows
 */
var waterMap = [
    ['log', 'lilypad', 'space', 'lilypad', 'space', 'log', 'log', 'space'],
    ['lilypad', 'space', 'lilypad', 'space', 'lilypad', 'space', 'lilypad', 'space'],
    ['log', 'space', 'lilypad', 'lilypad', 'space', 'log', 'log', 'space'],
];


/** 
 * Create an array of Floatable objects (Logs, Lilypads etc)
 */
for (var i=0; i<waterMap.length; i++) {
    for (var j=0; j<waterMap[i].length; j++) {
        // Check the array for logs or lilypads and create new Floatabl objects
        if (waterMap[i][j] === 'log') {
            allWaterObs.push(new Floatable(202, 0, i, (j + 1) * GameObject.constants.COL_WIDTH));
        } else if (waterMap[i][j] === 'lilypad') {
            allWaterObs.push(new Floatable(101, 0, i, (j + 1) * GameObject.constants.COL_WIDTH));
        }
    }
}

// Now that we have an array of all floatable objects, let's place
// some predators on some of them. Well take 3 random predators from
// the predators array and assign them to a floatable
var randPredIdxs = getRandNums(3, allPredators.length);
var randWaterObIdxs = getRandNums(3, allWaterObs.length);
for (var i=0; i<randWaterObIdxs.length; i++) {
    allWaterObs[randWaterObIdxs[i]].addPredator(allPredators[randPredIdxs[i]]);
}

// Add some food
allFood[0] = new Food(0, 366);
allFood[1] = new Food(202, 366);


// Array of rock obstacles. 0 represents open spaces and 1 represents rocks
// Rocks will only appear on the top and bottom grass rows so only 2 arrays
// are required
var rockMap = [
    [1, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0]
];

for (var i=0; i<rockMap.length; i++) {
    for (var j=0; j<rockMap[i].length; j++) {
        if (rockMap[i][j] === 1) {
            allRocks.push(new Obstacle(0, 283, (i === 0) ? 0 : 7, j * GameObject.constants.COL_WIDTH));
        }
    }
}

/**
 * This listens for key presses and sends the keys to your
 * Player.handleInput() method. You don't need to modify this.
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // Call handleInput and pass the currently pressed key
    player.handleInput(allowedKeys[e.keyCode]);
});

