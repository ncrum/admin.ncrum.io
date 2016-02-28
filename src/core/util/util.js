String.prototype.addDashes = function() {
  return this.replace(/\s+/g, '-')
}

String.prototype.removeDashes = function() {
  return this.replace(/-/g, ' ')
}
