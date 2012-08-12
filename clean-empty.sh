#!/bin/bash

for f in $(command find tests-db/ -type f -empty ); do
	echo "Removing file $f"
	rm "$f"
done
