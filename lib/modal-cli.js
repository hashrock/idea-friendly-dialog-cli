exports = module.exports = ProgressBar;

function ProgressBar(fmt, options) {
  this.stream = options.stream || process.stderr;

  this.fmt = fmt;
  this.curr = 0;
  this.total = options.total;
  this.width = options.width || this.total;
  this.clear = options.clear
  this.chars = {
    complete   : options.complete || '=',
    incomplete : options.incomplete || '-'
  };
  this.renderThrottle = options.renderThrottle !== 0 ? (options.renderThrottle || 16) : 0;
  this.callback = options.callback || function () {};
  this.tokens = {};
  this.lastDraw = '';
}

ProgressBar.prototype.tick = function(len, tokens){
  if (len !== 0)
    len = len || 1;

  // swap tokens
  if ('object' == typeof len) tokens = len, len = 1;
  if (tokens) this.tokens = tokens;

  // start time for eta
  if (0 == this.curr) this.start = new Date;

  this.curr += len

  // schedule render
  if (!this.renderThrottleTimeout) {
    this.renderThrottleTimeout = setTimeout(this.render.bind(this), this.renderThrottle);
  }

  // progress complete
  if (this.curr >= this.total) {
    if (this.renderThrottleTimeout) this.render();
    this.complete = true;
    this.terminate();
    this.callback(this);
    return;
  }
};

/**
 * Method to render the progress bar with optional `tokens` to place in the
 * progress bar's `fmt` field.
 *
 * @param {object} tokens
 * @api public
 */

ProgressBar.prototype.render = function (tokens) {
  clearTimeout(this.renderThrottleTimeout);
  this.renderThrottleTimeout = null;

  if (tokens) this.tokens = tokens;

  if (!this.stream.isTTY) return;

  var ratio = this.curr / this.total;
  ratio = Math.min(Math.max(ratio, 0), 1);

  var percent = ratio * 100;
  var incomplete, complete, completeLength;
  var elapsed = new Date - this.start;
  var eta = (percent == 100) ? 0 : elapsed * (this.total / this.curr - 1);

  /* populate the bar template with percentages and timestamps */
  var str = this.fmt
    .replace(':current', this.curr)
    .replace(':total', this.total)
    .replace(':elapsed', isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
    .replace(':eta', (isNaN(eta) || !isFinite(eta)) ? '0.0' : (eta / 1000)
      .toFixed(1))
    .replace(':percent', percent.toFixed(0) + '%');

  /* compute the available space (non-zero) for the bar */
  var availableSpace = Math.max(0, this.stream.columns - str.replace(':bar', '').length);
  var width = Math.min(this.width, availableSpace);

  /* TODO: the following assumes the user has one ':bar' token */
  completeLength = Math.round(width * ratio);
  complete = Array(completeLength + 1).join(this.chars.complete);
  incomplete = Array(width - completeLength + 1).join(this.chars.incomplete);

  /* fill in the actual progress bar */
  str = str.replace(':bar', complete + incomplete);

  /* replace the extra tokens */
  if (this.tokens) for (var key in this.tokens) str = str.replace(':' + key, this.tokens[key]);

  if (this.lastDraw !== str) {
    this.stream.cursorTo(0);
    this.stream.write(str);
    this.stream.clearLine(1);
    this.lastDraw = str;
  }
};


ProgressBar.prototype.update = function (ratio, tokens) {
  var goal = Math.floor(ratio * this.total);
  var delta = goal - this.curr;

  this.tick(delta, tokens);
};

ProgressBar.prototype.terminate = function () {
  if (this.clear) {
    this.stream.clearLine();
    this.stream.cursorTo(0);
  } else this.stream.write('\n');
};