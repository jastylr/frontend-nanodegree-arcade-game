/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {

    'use strict';

    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        gameOver = false,
        audioBkg = doc.createElement('audio'),
        audioBkgReady = false,
        audioStart = doc.createElement('audio'),
        muteBtn = doc.getElementById('muteBtn');
        

    canvas.width = 808;
    canvas.height = 664;
    doc.body.appendChild(canvas);

    // Setup some audio files for background music
    audioBkg.src = 'sounds/frogger.mp3';
    audioBkg.loop = true;
    audioBkg.volume = 0.7;
    audioBkg.addEventListener("canplaythrough", function () {
        audioBkgReady = true;
    }, false);
    
    audioStart.src = 'sounds/dp_frogger_start.mp3';
    audioStart.loop = true;

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {

        // Setup an event listeners on the Start and Play Again buttons
        document.getElementById('start-btn').addEventListener('click', function() {
            playGame();
        });

        document.getElementById('startover-btn').addEventListener('click', function() {
            reset();
            startMenu();
        });

        document.getElementById('play-again').addEventListener('click', function() {
            reset();
        });

        // This listener handles the toggle of the Mute button on the Start screen
        document.getElementById('muteBtn').addEventListener('click', function() {
            if (audioStart.muted === false) {
                audioStart.muted = true;
                muteBtn.innerHTML = 'Music: OFF';
                muteBtn.style.backgroundImage = "url(images/mute-on.png)";
            } else {
                audioStart.muted = false;
                muteBtn.innerHTML = 'Music: ON';
                muteBtn.style.backgroundImage = "url(images/mute-off.png)";
            }
        });

        startMenu();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if (!gameOver) {
            updateEntities(dt);
        }
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        // See if the player has lost all their lives
        // and if not, then update the player otherwise call
        // the endGame function to end the game
        if (player.numLives !== 0) {
            
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });

            allWaterObs.forEach(function(waterob) {
                waterob.update(dt);
            });

            allPredators.forEach(function(predator) {
                predator.update(dt);
            });

            player.update();

            Collectible.allCollectibles.forEach(function(collectible) {
                collectible.update();
            });
        } else {
            // The player has lost all their lives so end the game
            endGame();
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/grass-top.png',   // Top row is grass
                'images/water-tile.png',   // Row 1 of 3 of water
                'images/water-tile.png',   // Row 2 of 3 of water
                'images/water-tile.png',   // Row 3 of 3 of water
                'images/road-top.png',   // Row 1 of 3 of road
                'images/road-mid.png',    // Row 2 of 3 of road
                'images/road-bottom.png',   // Row 3 of 3 of road
                'images/grass-bottom.png'   // Bottom row is grass
            ],
            numRows = 8,
            numCols = 8,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }


        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies and allCollectibles arrays and call
         * the render function you have defined.
         */
        
        Collectible.allCollectibles.forEach(function(collectible) {
            collectible.render(ctx);
        });

        allEnemies.forEach(function(enemy) {
            enemy.render(ctx);
        });

        allWaterObs.forEach(function(waterob) {
            waterob.render(ctx);
        });

        allRocks.forEach(function(rock) {
            rock.render(ctx);
        });

        allPredators.forEach(function(predator) {
            predator.render(ctx);
        });

        player.render(ctx);
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // Update gameOver and make it false
        gameOver = false;
        
        hide(document.getElementById('game-over'));
        hide(document.getElementById('overlay'));
        hide(document.getElementById('game-start'));
        show(document.getElementById('stats'));
        
        // Tell the Player to reset
        player.reset(true);
        
        // Reset the collectibles on the board
        Collectible.reset();
    }

    /* This function is called to display the Start menu and 
     * game player selection overlay
     */
    function startMenu() {
        show(document.getElementById('game-start'));
        show(document.getElementById('overlay'));
        hide(document.getElementById('stats'));
        audioStart.play();
    }

    function playGame() {
        
        reset();

        // Make sure the background music has loaded
        // and then play it
        if (audioBkgReady) {
            audioStart.pause();
            audioBkg.play();
        }

        lastTime = Date.now();
        main();
    }

    /* This function is called to end the current game and display a 
     * game over overlay
     */
    function endGame() {
        gameOver = true;
        audioBkg.pause();
        audioBkg.currentTime = 0;

        hide(document.getElementById('stats'));
        show(document.getElementById('game-over'));
        show(document.getElementById('overlay'));
    }

    function show(element) {
        element.style.display = 'block';
    }

    function hide(element) {
        element.style.display = 'none';
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/sprite-sheet.png',
        'images/grass-top.png',
        'images/grass-bottom.png',
        'images/water-tile.png',
        'images/road-top.png',
        'images/road-mid.png',
        'images/road-bottom.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

})(this);