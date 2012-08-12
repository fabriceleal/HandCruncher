#!/bin/bash

cd tests

for f in $(command ls *.txt); do
	echo "Is $f newer than ../tests-db/$f.json?"
	if [ "$f" -nt "../tests-db/$f.json" ]
	then
		echo "* Parsing $f ..."
		../parse.js "$f" > "../tests-db/$f.json"
		echo "* Parsed $f into ../tests-db/$f.json"
	fi
done

cd -

