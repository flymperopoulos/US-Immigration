#!/bin/bash
for i in `seq 104 108`;
do
	cd /Volumes/usb1
	rsync -avz --delete --delete-excluded --exclude **/text-versions/ govtrack.us::govtrackdata/congress/$i .
done