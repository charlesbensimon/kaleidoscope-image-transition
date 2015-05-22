// Generated by CoffeeScript 1.9.2
var Curves, DragDrop, Kaleidoscope, Parameters, Timer, ease, getRadius, linear, triCubic,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

getRadius = function() {
  var d2, h, w;
  w = window.innerWidth;
  h = window.innerHeight;
  d2 = w * w + h * h;
  return (Math.sqrt(d2)) / 2;
};

Timer = (function() {
  function Timer(period) {
    this.time = new Date().getTime();
    this.t = 0;
    this.period = period;
  }

  Timer.prototype.getT = function() {
    var currentTime, deltaTime;
    currentTime = new Date().getTime();
    deltaTime = currentTime - this.time;
    this.time = currentTime;
    this.t += deltaTime;
    if (this.t > this.period) {
      this.t = this.period;
    }
    return this.t / this.period;
  };

  Timer.prototype.end = function() {
    return this.t === this.period;
  };

  return Timer;

})();

Curves = (function() {
  function Curves(options) {
    this.fx = options.x;
    this.fy = options.y;
    this.fr = options.r;
    this.timer = options.timer;
  }

  Curves.prototype.x = function() {
    var t;
    t = this.timer.getT();
    return this.fx(t);
  };

  Curves.prototype.y = function() {
    var t;
    t = this.timer.getT();
    return this.fy(t);
  };

  Curves.prototype.r = function() {
    var t;
    t = this.timer.getT();
    return this.fr(t);
  };

  return Curves;

})();

linear = function(begin, end, power) {
  return function(t) {
    return (end - begin) * Math.pow(t, power) + begin;
  };
};

triCubic = function(begin, middle) {
  return function(t) {
    return (2 * t - 1) * (2 * t - 1) * (begin - middle) + middle;
  };
};

ease = function(begin, end) {
  return function(t) {
    t *= 2;
    if (t < 1) {
      return (end - begin) / 2 * t * t * t * t + begin;
    }
    t -= 2;
    return (begin - end) / 2 * (t * t * t * t - 2) + begin;
  };
};

Parameters = function() {
  this.xBegin = -70;
  this.xEnd = 89;
  this.yBegin = 0.999;
  this.yMiddle = 250;
  this.rotationBegin = 0.001;
  this.rotationMiddle = 0.001;
};

Kaleidoscope = (function() {
  Kaleidoscope.prototype.HALF_PI = Math.PI / 2;

  Kaleidoscope.prototype.TWO_PI = Math.PI * 2;

  function Kaleidoscope(options1) {
    var key, ref, ref1, val;
    this.options = options1 != null ? options1 : {};
    this.defaults = {
      offsetRotation: 0.0,
      offsetScale: 1.0,
      offsetX: 0.0,
      offsetY: 0.0,
      radius: getRadius(),
      slices: 12,
      zoom: 1.0
    };
    ref = this.defaults;
    for (key in ref) {
      val = ref[key];
      this[key] = val;
    }
    ref1 = this.options;
    for (key in ref1) {
      val = ref1[key];
      this[key] = val;
    }
    if (this.domElement == null) {
      this.domElement = document.createElement('canvas');
    }
    if (this.context == null) {
      this.context = this.domElement.getContext('2d');
    }
    if (this.image == null) {
      this.image = document.createElement('img');
    }
  }

  Kaleidoscope.prototype.draw = function() {
    var cx, i, index, ref, results, scale, step;
    this.domElement.width = this.domElement.height = this.radius * 2;
    this.context.fillStyle = this.context.createPattern(this.image, 'no-repeat');
    scale = this.zoom * (this.radius / Math.min(this.image.width, this.image.height));
    step = this.TWO_PI / this.slices;
    cx = this.image.width / 2;
    results = [];
    for (index = i = 0, ref = this.slices; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
      this.context.save();
      this.context.translate(this.radius, this.radius);
      this.context.rotate(index * step);
      this.context.beginPath();
      this.context.moveTo(-0.5, -0.5);
      this.context.arc(0, 0, this.radius, step * -0.51, step * 0.51);
      this.context.lineTo(0.5, 0.5);
      this.context.closePath();
      this.context.rotate(this.HALF_PI);
      this.context.scale([-1, 1][index % 2], 1);
      this.context.translate(this.offsetX - cx, this.offsetY);
      this.context.rotate(this.offsetRotation);
      this.context.scale(this.offsetScale, this.offsetScale);
      this.context.fill();
      results.push(this.context.restore());
    }
    return results;
  };

  return Kaleidoscope;

})();

DragDrop = (function() {
  function DragDrop(callback, context, filter) {
    var disable;
    this.callback = callback;
    this.context = context != null ? context : document;
    this.filter = filter != null ? filter : /^image/i;
    this.onDrop = bind(this.onDrop, this);
    disable = function(event) {
      event.stopPropagation();
      return event.preventDefault();
    };
    this.context.addEventListener('dragleave', disable);
    this.context.addEventListener('dragenter', disable);
    this.context.addEventListener('dragover', disable);
    this.context.addEventListener('drop', this.onDrop, false);
  }

  DragDrop.prototype.onDrop = function(event) {
    var file, reader;
    event.stopPropagation();
    event.preventDefault();
    file = event.dataTransfer.files[0];
    if (this.filter.test(file.type)) {
      reader = new FileReader;
      reader.onload = (function(_this) {
        return function(event) {
          return typeof _this.callback === "function" ? _this.callback(event.target.result) : void 0;
        };
      })(this);
      return reader.readAsDataURL(file);
    }
  };

  return DragDrop;

})();

document.body.onload = function() {
  var gui, image, kaleidoscope, parameters, playAnimation;
  image = new Image;
  image.onload = (function(_this) {
    return function() {
      return kaleidoscope.draw();
    };
  })(this);
  image.src = 'img3-small.png';
  kaleidoscope = new Kaleidoscope({
    image: image,
    slices: 20
  });
  parameters = new Parameters;
  kaleidoscope.domElement.style.position = 'absolute';
  kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
  kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
  kaleidoscope.domElement.style.left = '50%';
  kaleidoscope.domElement.style.top = '50%';
  kaleidoscope.domElement.style.zIndex = '-1';
  document.body.appendChild(kaleidoscope.domElement);
  document.querySelector('#start').addEventListener('click', function() {
    return playAnimation();
  });
  playAnimation = function() {
    var curves, update, xSize, ySize;
    update = function() {
      kaleidoscope.offsetX = curves.x();
      kaleidoscope.offsetY = curves.y();
      kaleidoscope.offsetRotation = curves.r();
      kaleidoscope.draw();
      if (curves.timer.end()) {
        return window.setTimeout((function() {
          return document.querySelector('#image').classList.remove('next');
        }), 1500);
      } else {
        return window.requestAnimationFrame(update);
      }
    };
    xSize = image.width / 100;
    ySize = -(kaleidoscope.radius + image.height);
    console.log(xSize, ySize);
    curves = new Curves({
      x: linear(parameters.xBegin * xSize, parameters.xEnd * xSize, 1.3),
      y: triCubic(parameters.yBegin * ySize, -parameters.yMiddle),
      r: triCubic(parameters.rotationBegin, parameters.rotationMiddle),
      timer: new Timer(5000)
    });
    document.querySelector('#image').classList.add('next');
    return update();
  };
  gui = new dat.GUI;
  gui.add(parameters, 'xBegin').min(-100).max(100);
  gui.add(parameters, 'xEnd').min(-100).max(100);
  gui.add(parameters, 'yBegin').min(0).max(1);
  gui.add(parameters, 'yMiddle').min(0).max(kaleidoscope.radius);
  gui.add(parameters, 'rotationBegin').min(-3.14).max(3.14);
  gui.add(parameters, 'rotationMiddle').min(-3.14).max(3.14);
  return gui.close();
};


/*

  onChange = =>

  #	kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px'
  #	kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px'
      
   *  options.interactive = no
      
    do kaleidoscope.draw

  ( c.onChange onChange ) for c in gui.__controllers
 */
