#!/bin/bash

for f in $(command find tests-db/ -type f -empty ); do
	rm "$f"
done
