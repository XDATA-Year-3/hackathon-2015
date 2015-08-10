#!/usr/bin/env python

import csv

allTags = {}

mbFile = open('../data/artist_mbtag.csv', 'rb')
mbInput = csv.DictReader(mbFile)

enFile = open('../data/artist_term.csv', 'rb')
enInput = csv.DictReader(enFile)

tags = open('/tmp/tagNames.csv', 'wb')
tags.write('tag_id,tag\n')

enTags = open('/tmp/enTags.csv', 'wb')
enTags.write('artist_id,tag_id\n')

mbTags = open('/tmp/mbTags.csv', 'wb')
mbTags.write('artist_id,tag_id\n')

for line in enInput:
    if not allTags.has_key(line['term']):
        allTags[line['term']] = len(allTags)
        tags.write('tag' + str(allTags[line['term']]) + ',' + line['term'] + '\n')
    
    enTags.write(line['artist_id'] + ',' + 'tag' + str(allTags[line['term']]) + '\n')
    
for line in mbInput:
    if not allTags.has_key(line['mbtag']):
        allTags[line['mbtag']] = len(allTags)
        tags.write('tag' + str(allTags[line['mbtag']]) + ',' + line['mbtag'] + '\n')
    
    mbTags.write(line['artist_id'] + ',' + 'tag' + str(allTags[line['mbtag']]) + '\n')

mbFile.close()
enFile.close()
tags.close()
enTags.close()
mbTags.close()