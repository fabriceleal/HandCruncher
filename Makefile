
final=pokerstars.js


pokerstars.js: pokerstars.peg
	pegjs --export-var exports.parser --track-line-and-column pokerstars.peg


.PHONY: empty_clean


empty_clean:
	./clean-empty.sh
