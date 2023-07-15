(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


(function() {

var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

// Main
initHeader();
initAnimation();
addListeners();

function initHeader() {
    width = window.innerWidth;
    height = window.innerHeight;
    target = {x: width/2, y: height/2};

    largeHeader = document.getElementById('large-header');

  largeHeader.style.height = height+'px';

    canvas = document.getElementById('x-canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    // create points
    points = [];
    var puntitos=20;
    for(var x = 0; x < width; x = x + width/puntitos) {
        for(var y = 0; y < height; y = y + height/puntitos) {
            var px = x + Math.random()*width/puntitos;
            var py = y + Math.random()*height/puntitos;
            var p = {x: px, originX: px, y: py, originY: py };
            points.push(p);
        }
    }

    // for each point find the 5 closest points
    for(var i = 0; i < points.length; i++) {
        var closest = [];
        var p1 = points[i];
        for(var j = 0; j < points.length; j++) {
            var p2 = points[j]
            if(!(p1 == p2)) {
                var placed = false;
                for(var k = 0; k < 5; k++) {
                    if(!placed) {
                        if(closest[k] == undefined) {
                            closest[k] = p2;
                            placed = true;
                        }
                    }
                }

                for(var k = 0; k < 5; k++) {
                    if(!placed) {
                        if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                            closest[k] = p2;
                            placed = true;
                        }
                    }
                }
            }
        }
        p1.closest = closest;
    }

    // assign a circle to each point
    for(var i in points) {
        var c = new Circle(points[i], 2+Math.random()*2, 'rgba(200,200,255,255)');
        points[i].circle = c;
    }
}

// Event handling
function addListeners() {
    if(!('ontouchstart' in window)) {
        window.addEventListener('mousemove', mouseMove);
    }
    window.addEventListener('scroll', scrollCheck);
    window.addEventListener('resize', resize);
}

function mouseMove(e) {
    var posx = posy = 0;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY)    {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    target.x = posx;
    target.y = posy;
}

function scrollCheck() {
    if(document.body.scrollTop > height) animateHeader = false;
    else animateHeader = true;
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    largeHeader.style.height = height+'px';
    canvas.width = width;
    canvas.height = height;
}

// animation
function initAnimation() {
    animate();
    for(var i in points) {
        shiftPoint(points[i]);
    }
}

function animate() {
    if(animateHeader) {
        ctx.clearRect(0,0,width,height);
        for(var i in points) {
            // detect points in range
            if(Math.abs(getDistance(target, points[i])) < 4000) {
                points[i].active = 0.3;
                points[i].circle.active = 0.6;
            } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                points[i].active = 0.1;
                points[i].circle.active = 0.3;
            } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                points[i].active = 0.02;
                points[i].circle.active = 0.1;
            } else {
                points[i].active = 0;
                points[i].circle.active = 0;
            }

            drawLines(points[i]);
            points[i].circle.draw();
        }
    }
    requestAnimationFrame(animate);
}

function shiftPoint(p) {
    TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*50,
        y: p.originY-50+Math.random()*50, ease:Circ.easeInOut,
        onComplete: function() {
            shiftPoint(p);
        }});
}

// Canvas manipulation
function drawLines(p) {
    if (!p.active) return;
    for (var i in p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.closest[i].x, p.closest[i].y);

        // Check if cursor/mouse has passed half the height down
        if (p.y > canvas.height / 2) {
            ctx.strokeStyle = 'rgba(0, 0, 0, ' + p.active + ')';
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 0, ' + p.active + ')';
        }

        ctx.stroke();
    }
}

function Circle(pos, rad, color) {
    var _this = this;

    // constructor
    (function () {
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;
    })();

    this.draw = function () {
        if (!_this.active) return;
        ctx.beginPath();
        ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);

        // Check if cursor/mouse has passed half the height down
        if (_this.pos.y > canvas.height / 2) {
            ctx.fillStyle = 'rgba(0, 0, 0, ' + _this.active + ')';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 0, ' + _this.active + ')';
        }

        ctx.fill();
    };
}

// Util
function getDistance(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}



})();
















let menuIcon = document.querySelector('.menuIcon');
let nav = document.querySelector('.overlay-menu');

menuIcon.addEventListener('click', () => {
    if (nav.style.transform != 'translateX(0%)') {
        nav.style.transform = 'translateX(0%)';
        nav.style.transition = 'transform 0.2s ease-out';
    } else { 
        nav.style.transform = 'translateX(-100%)';
        nav.style.transition = 'transform 0.2s ease-out';
    }
});


// Toggle Menu Icon ========================================
let toggleIcon = document.querySelector('.menuIcon');

toggleIcon.addEventListener('click', () => {
    if (toggleIcon.className != 'menuIcon toggle') {
        toggleIcon.className += ' toggle';
    } else {
        toggleIcon.className = 'menuIcon';
    }
});


window.addEventListener('scroll', function() {
    var navbar = document.getElementById('navbar');
    if (window.scrollY > 0) {
      navbar.style.opacity = '0.9';
    } else {
      navbar.style.opacity = '0.5';
    }
  });
  
  


  const scrollButton = document.querySelector(".scroll-top");
  scrollButton.addEventListener("click", () => {
    window.scrollTo(0, 0);
  });
  




// Array of words
var words = [
  "Front End Utvikler",
  "Web Utvikler",
  "Spill Programmerer",
  "Back End-Utvikler",
  "UX Designer"
];

var typingElement = document.querySelector('.typing-2');
var wordIndex = 0;
var letterIndex = 0;

function type() {
  if (letterIndex < words[wordIndex].length) {
    typingElement.textContent += words[wordIndex][letterIndex];
    letterIndex++;
    setTimeout(type, 100); // Typing speed (adjust as needed)
  } else {
    setTimeout(erase, 1500); // Pause before erasing (adjust as needed)
  }
}

function erase() {
  if (letterIndex > 0) {
    typingElement.textContent = typingElement.textContent.slice(0, -1);
    letterIndex--;
    setTimeout(erase, 50); // Erasing speed (adjust as needed)
  } else {
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(type, 500); // Pause before typing the next word (adjust as needed)
  }
}

type(); // Start the typing animation

// Set the text color of typingElement to yellow
typingElement.style.color = 'yellow';

















// Remove the existing JavaScript code you provided

// Get the element with the ID "highlighted-text"
const highlightedText = document.getElementById('highlighted-text');
// Get the text content
const text = highlightedText.innerHTML;
// Clear the existing text content
highlightedText.innerHTML = '';

// Variable to keep track of the current character index
let charIndex = 0;

// Function to display the text character by character
function typeText() {
  // Check if all characters have been displayed
  if (charIndex < text.length) {
    // Get the next character
    const char = text.charAt(charIndex);
    // Append the character to the text container
    highlightedText.innerHTML += '<span style="color: yellow;">' + char + '</span>';
    // Increment the character index
    charIndex++;
    // Schedule the next character display
    setTimeout(typeText, 120); // Adjust the timeout value to control the typing speed
  }
}

// Start the typewriter effect
typeText();























































;(function(window, document) {
    "use strict";
    var pluginName = 'particleground';
  
    function extend(out) {
      out = out || {};
      for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        if (!obj) continue;
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object')
              deepExtend(out[key], obj[key]);
            else
              out[key] = obj[key];
          }
        }
      }
      return out;
    };
  
    var $ = window.jQuery;
  
    function Plugin(element, options) {
      var canvasSupport = !!document.createElement('canvas').getContext;
      var canvas;
      var ctx;
      var particles = [];
      var raf;
      var mouseX = 0;
      var mouseY = 0;
      var winW;
      var winH;
      var desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
      var orientationSupport = !!window.DeviceOrientationEvent;
      var tiltX = 0;
      var pointerX;
      var pointerY;
      var tiltY = 0;
      var paused = false;
  
      options = extend({}, window[pluginName].defaults, options);
  
      /**
       * Init
       */
      function init() {
        if (!canvasSupport) { return; }
  
        //Create canvas
        canvas = document.createElement('canvas');
        canvas.className = 'pg-canvas';
        canvas.style.display = 'block';
        element.insertBefore(canvas, element.firstChild);
        ctx = canvas.getContext('2d');
        styleCanvas();
  
        // Create particles
        var numParticles = Math.round((canvas.width * canvas.height) / options.density);
        for (var i = 0; i < numParticles; i++) {
          var p = new Particle();
          p.setStackPos(i);
          particles.push(p);
        };
  
        window.addEventListener('resize', function() {
          resizeHandler();
        }, false);
  
        document.addEventListener('mousemove', function(e) {
          mouseX = e.pageX;
          mouseY = e.pageY;
        }, false);
  
        if (orientationSupport && !desktop) {
          window.addEventListener('deviceorientation', function () {
            // Contrain tilt range to [-30,30]
            tiltY = Math.min(Math.max(-event.beta, -30), 30);
            tiltX = Math.min(Math.max(-event.gamma, -30), 30);
          }, true);
        }
  
        draw();
        hook('onInit');
      }
  
      /**
       * Style the canvas
       */
      function styleCanvas() {
        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;
        ctx.fillStyle = options.dotColor;
        ctx.strokeStyle = options.lineColor;
        ctx.lineWidth = options.lineWidth;
      }
  
      /**
       * Draw particles
       */
      function draw() {
        if (!canvasSupport) { return; }
  
        winW = window.innerWidth;
        winH = window.innerHeight;
  
        // Wipe canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        // Update particle positions
        for (var i = 0; i < particles.length; i++) {
          particles[i].updatePosition();
        };
        // Draw particles
        for (var i = 0; i < particles.length; i++) {
          particles[i].draw();
        };
  
        // Call this function next time screen is redrawn
        if (!paused) {
          raf = requestAnimationFrame(draw);
        }
      }
  
      /**
       * Add/remove particles.
       */
      function resizeHandler() {
        // Resize the canvas
        styleCanvas();
  
        var elWidth = element.offsetWidth;
        var elHeight = element.offsetHeight;
  
        // Remove particles that are outside the canvas
        for (var i = particles.length - 1; i >= 0; i--) {
          if (particles[i].position.x > elWidth || particles[i].position.y > elHeight) {
            particles.splice(i, 1);
          }
        };
  
        // Adjust particle density
        var numParticles = Math.round((canvas.width * canvas.height) / options.density);
        if (numParticles > particles.length) {
          while (numParticles > particles.length) {
            var p = new Particle();
            particles.push(p);
          }
        } else if (numParticles < particles.length) {
          particles.splice(numParticles);
        }
  
        // Re-index particles
        for (i = particles.length - 1; i >= 0; i--) {
          particles[i].setStackPos(i);
        };
      }
  
      /**
       * Pause particle system
       */
      function pause() {
        paused = true;
      }
  
      /**
       * Start particle system
       */
      function start() {
        paused = false;
        draw();
      }
  
      /**
       * Particle
       */
      function Particle() {
        this.stackPos;
        this.active = true;
        this.layer = Math.ceil(Math.random() * 3);
        this.parallaxOffsetX = 0;
        this.parallaxOffsetY = 0;
        // Initial particle position
        this.position = {
          x: Math.ceil(Math.random() * canvas.width),
          y: Math.ceil(Math.random() * canvas.height)
        }
        // Random particle speed, within min and max values
        this.speed = {}
        switch (options.directionX) {
          case 'left':
            this.speed.x = +(-options.maxSpeedX + (Math.random() * options.maxSpeedX) - options.minSpeedX).toFixed(2);
            break;
          case 'right':
            this.speed.x = +((Math.random() * options.maxSpeedX) + options.minSpeedX).toFixed(2);
            break;
          default:
            this.speed.x = +((-options.maxSpeedX / 2) + (Math.random() * options.maxSpeedX)).toFixed(2);
            this.speed.x += this.speed.x > 0 ? options.minSpeedX : -options.minSpeedX;
            break;
        }
        switch (options.directionY) {
          case 'up':
            this.speed.y = +(-options.maxSpeedY + (Math.random() * options.maxSpeedY) - options.minSpeedY).toFixed(2);
            break;
          case 'down':
            this.speed.y = +((Math.random() * options.maxSpeedY) + options.minSpeedY).toFixed(2);
            break;
          default:
            this.speed.y = +((-options.maxSpeedY / 2) + (Math.random() * options.maxSpeedY)).toFixed(2);
            this.speed.x += this.speed.y > 0 ? options.minSpeedY : -options.minSpeedY;
            break;
        }
      }
  
      /**
       * Draw particle
       */
      Particle.prototype.draw = function() {
        // Draw circle
        ctx.beginPath();
        ctx.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, options.particleRadius / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
  
        // Draw lines
        ctx.beginPath();
        // Iterate over all particles which are higher in the stack than this one
        for (var i = particles.length - 1; i > this.stackPos; i--) {
          var p2 = particles[i];
  
          // Pythagorus theorum to get distance between two points
          var a = this.position.x - p2.position.x
          var b = this.position.y - p2.position.y
          var dist = Math.sqrt((a * a) + (b * b)).toFixed(2);
  
          // If the two particles are in proximity, join them
          if (dist < options.proximity) {
            ctx.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY);
            if (options.curvedLines) {
              ctx.quadraticCurveTo(Math.max(p2.position.x, p2.position.x), Math.min(p2.position.y, p2.position.y), p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
            } else {
              ctx.lineTo(p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
            }
          }
        }
        ctx.stroke();
        ctx.closePath();
      }
  
      /**
       * update particle position
       */
      Particle.prototype.updatePosition = function() {
        if (options.parallax) {
          if (orientationSupport && !desktop) {
            // Map tiltX range [-30,30] to range [0,winW]
            var ratioX = (winW - 0) / (30 - -30);
            pointerX = (tiltX - -30) * ratioX + 0;
            // Map tiltY range [-30,30] to range [0,winH]
            var ratioY = (winH - 0) / (30 - -30);
            pointerY = (tiltY - -30) * ratioY + 0;
          } else {
            pointerX = mouseX;
            pointerY = mouseY;
          }
          // Calculate parallax offsets
          this.parallaxTargX = (pointerX - (winW / 2)) / (options.parallaxMultiplier * this.layer);
          this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10; // Easing equation
          this.parallaxTargY = (pointerY - (winH / 2)) / (options.parallaxMultiplier * this.layer);
          this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10; // Easing equation
        }
  
        var elWidth = element.offsetWidth;
        var elHeight = element.offsetHeight;
  
        switch (options.directionX) {
          case 'left':
            if (this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
              this.position.x = elWidth - this.parallaxOffsetX;
            }
            break;
          case 'right':
            if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth) {
              this.position.x = 0 - this.parallaxOffsetX;
            }
            break;
          default:
            // If particle has reached edge of canvas, reverse its direction
            if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth || this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
              this.speed.x = -this.speed.x;
            }
            break;
        }
  
        switch (options.directionY) {
          case 'up':
            if (this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
              this.position.y = elHeight - this.parallaxOffsetY;
            }
            break;
          case 'down':
            if (this.position.y + this.speed.y + this.parallaxOffsetY > elHeight) {
              this.position.y = 0 - this.parallaxOffsetY;
            }
            break;
          default:
            // If particle has reached edge of canvas, reverse its direction
            if (this.position.y + this.speed.y + this.parallaxOffsetY > elHeight || this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
              this.speed.y = -this.speed.y;
            }
            break;
        }
  
        // Move particle
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
      }
  
      /**
       * Setter: particle stacking position
       */
      Particle.prototype.setStackPos = function(i) {
        this.stackPos = i;
      }
  
      function option (key, val) {
        if (val) {
          options[key] = val;
        } else {
          return options[key];
        }
      }
  
      function destroy() {
        console.log('destroy');
        canvas.parentNode.removeChild(canvas);
        hook('onDestroy');
        if ($) {
          $(element).removeData('plugin_' + pluginName);
        }
      }
  
      function hook(hookName) {
        if (options[hookName] !== undefined) {
          options[hookName].call(element);
        }
      }
  
      init();
  
      return {
        option: option,
        destroy: destroy,
        start: start,
        pause: pause
      };
    }
  
    window[pluginName] = function(elem, options) {
      return new Plugin(elem, options);
    };
  
    window[pluginName].defaults = {
      minSpeedX: 0.1,
      maxSpeedX: 0.7,
      minSpeedY: 0.1,
      maxSpeedY: 0.7,
      directionX: 'center', // 'center', 'left' or 'right'. 'center' = dots bounce off edges
      directionY: 'center', // 'center', 'up' or 'down'. 'center' = dots bounce off edges
      density: 10000, // How many particles will be generated: one particle every n pixels
      dotColor: 'yellow',
    lineColor: 'yellow',
      particleRadius: 7, // Dot size
      lineWidth: 1,
      curvedLines: false,
      proximity: 100, // How close two dots need to be before they join
      parallax: true,
      parallaxMultiplier: 5, // The lower the number, the more extreme the parallax effect
      onInit: function() {},
      onDestroy: function() {}
    };
  
    // nothing wrong with hooking into jQuery if it's there...
    if ($) {
      $.fn[pluginName] = function(options) {
        if (typeof arguments[0] === 'string') {
          var methodName = arguments[0];
          var args = Array.prototype.slice.call(arguments, 1);
          var returnVal;
          this.each(function() {
            if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
              returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
            }
          });
          if (returnVal !== undefined){
            return returnVal;
          } else {
            return this;
          }
        } else if (typeof options === "object" || !options) {
          return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
              $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
          });
        }
      };
    }
  
  })(window, document);
  

  (function() {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
      }
  
      if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };
  
      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
        };
  }());
  
  document.addEventListener('DOMContentLoaded', function () {
    particleground(document.getElementById('particles'), {
        dotColor: 'yellow',
        lineColor: 'yellow'
      });
    var intro = document.getElementById('intro');
    intro.style.marginTop = - intro.offsetHeight / 2 + 'px';
  }, false);
  



























