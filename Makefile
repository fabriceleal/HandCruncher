
final=pokerstars.js


pokerstars.js: pokerstars.peg
	pegjs --export-var exports.parser --track-line-and-column --cache pokerstars.peg

