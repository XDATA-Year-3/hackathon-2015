#!/usr/bin/env python

import sys, csv

infile = open(sys.argv[1],'rb')
rows = csv.reader(infile)

outfile = open(sys.argv[2],'wb')
result = csv.writer(outfile)

headers = None
bestValues = {}
currentIdentifier = None

def writeResults(id, counts):
    results = [id]
    for h in headers[1:]:
        if len(counts[h]) == 0:
            results.append('')
        else:
            # write the most frequent value seen for this attribute/id
            v,k = max((v,k) for k,v in counts[h].iteritems())
            results.append(k)
    result.writerow(results)

for columns in rows:
    if headers == None:
        headers = columns
        result.writerow(headers)
    else:
        if currentIdentifier == None:
            currentIdentifier = columns[0]
        elif currentIdentifier != columns[0]:
            writeResults(currentIdentifier, bestValues)
            bestValues = {}
            currentIdentifier = columns[0]
        
        for h,c in zip(headers[1:], columns[1:]):
            if not bestValues.has_key(h):
                bestValues[h] = {}
            # is this a good value?
            if c == '' or c == 'nan':
                continue
            # have we seen this value yet?
            if not bestValues[h].has_key(c):
                bestValues[h][c] = 0
            # increment the count for the value
            bestValues[h][c] += 1

# the last one hasn't been written yet...
writeResults(currentIdentifier, bestValues)

infile.close()
outfile.close()