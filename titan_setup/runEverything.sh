#!/usr/bin/env bash
set -e

echo ""
echo "...shutting down and deleting the titan database..."
echo ""
../data/titan/bin/titan.sh stop
#../titan/bin/titan.sh clean
rm -rf ../data/titan/db
rm -rf ../data/titan/log

#<<COMMENT
echo ""
echo "...collecting and simplifying the tag lists..."
echo ""
python collectTerms.py

echo ""
echo "...splitting the songs file into separate artist, album, and song files..."
echo ""
python split.py

echo ""
echo "...sorting albums..."
echo ""
(head -n 1 /tmp/splitalbums.csv && tail -n +2 /tmp/splitalbums.csv | sort -s) > /tmp/sortedalbums.csv
rm /tmp/splitalbums.csv
echo ""
echo "...sorting artists..."
echo ""
(head -n 1 /tmp/splitartists.csv && tail -n +2 /tmp/splitartists.csv | sort -s) > /tmp/sortedartists.csv
rm /tmp/splitartists.csv
echo ""
echo "...sorting songs..."
echo ""
(head -n 1 /tmp/splitsongs.csv && tail -n +2 /tmp/splitsongs.csv | sort -s) > /tmp/sortedsongs.csv
rm /tmp/splitsongs.csv

echo ""
echo "...deduping albums..."
echo ""
python dedup.py /tmp/sortedalbums.csv /tmp/albums.csv
rm /tmp/sortedalbums.csv
echo ""
echo "...deduping artists..."
echo ""
python dedup.py /tmp/sortedartists.csv /tmp/artists.csv
rm /tmp/sortedartists.csv
echo ""
echo "...deduping songs..."
echo ""
python dedup.py /tmp/sortedsongs.csv /tmp/songs.csv
rm /tmp/sortedsongs.csv
#COMMENT
echo ""
echo "...restarting titan..."
echo ""
../data/titan/bin/titan.sh start

echo ""
echo "...sending all the results to Titan..."
echo ""
cp ../data/artist_similarity.csv /tmp/similarArtists.csv
../data/titan/bin/gremlin.sh sendToTitan.groovy

echo ""
echo "*** done ***"
echo ""