#!/usr/bin/env python

import csv, sys

#LIMIT = sys.maxint
LIMIT = 10000

rawfile = open('../data/songs.csv','rb')
raw = csv.reader(rawfile)

songsfile = open('/tmp/splitsongs.csv', 'wb')
songs = csv.writer(songsfile)

albumsfile = open('/tmp/splitalbums.csv','wb')
albums = csv.writer(albumsfile)

artistsfile = open('/tmp/splitartists.csv','wb')
artists = csv.writer(artistsfile)

songAlbumFile = open('/tmp/albumSong.csv', 'wb')
songAlbum = csv.writer(songAlbumFile)

albumArtistFile = open('/tmp/artistAlbum.csv', 'wb')
albumArtist = csv.writer(albumArtistFile)

songArtistFile = open('/tmp/artistSong.csv', 'wb')
songArtist = csv.writer(songArtistFile)

skipped = open('/tmp/skipped.txt','wb')

column_mappings = {
    'analysis_sample_rate' : 'songs',
    'artist_7digitalid' : 'SKIP',
    'artist_familiarity' : 'artists',
    'artist_hotttnesss' : 'artists',
    'artist_id' : 'SKIP',
    'artist_latitude' : 'artists',
    'artist_location' : 'artists',
    'artist_longitude' : 'artists',
    'artist_mbid' : 'SKIP',
    'artist_name' : 'artists',
    'artist_playmeid' : 'SKIP',
    'audio_md5' : 'SKIP',
    'danceability' : 'songs',
    'duration' : 'songs',
    'end_of_fade_in' : 'songs',
    'energy' : 'songs',
    'key' : 'songs',
    'key_confidence' : 'songs',
    'loudness' : 'songs',
    'mode' : 'songs',
    'mode_confidence' : 'songs',
    'release' : 'albums',
    'release_7digitalid' : 'SKIP',
    'song_hotttnesss' : 'songs',
    'song_id' : 'SKIP',
    'start_of_fade_out' : 'songs',
    'tempo' : 'songs',
    'time_signature' : 'songs',
    'time_signature_confidence' : 'songs',
    'title' : 'songs',
    'track_7digitalid' : 'SKIP',
    'track_id' : 'SKIP',
    'year' : 'albums'
}

songIdentifier = 'song_id'
songIdentifierIndex = None
artistIdentifier = 'artist_id'
artistIdentifierIndex = None
albumIdentifier = 'release'
albumIdentifierIndex = None

headers = None

songHeaders = [songIdentifier]
albumHeaders = ['album_id']    # While I use the release name as the album ID, it needs a separate header
artistHeaders = [artistIdentifier]

songAlbum.writerow(['album_id', songIdentifier])
albumArtist.writerow([artistIdentifier, 'album_id'])
songArtist.writerow([artistIdentifier, songIdentifier])

songFields = None
albumFields = None
artistFields = None

for i, columns in enumerate(raw):
    if LIMIT != None and i > LIMIT:
        break
    if headers == None:
        headers = columns
        
        songIdentifierIndex = headers.index(songIdentifier)
        artistIdentifierIndex = headers.index(artistIdentifier)
        albumIdentifierIndex = headers.index(albumIdentifier)
        
        songHeaders.extend(filter(lambda h : column_mappings[h] == 'songs', columns))
        songs.writerow(songHeaders)
    
        albumHeaders.extend(filter(lambda h : column_mappings[h] == 'albums', columns))
        albums.writerow(albumHeaders)
    
        artistHeaders.extend(filter(lambda h : column_mappings[h] == 'artists', columns))
        artists.writerow(artistHeaders)
    else:
        songFields = [columns[songIdentifierIndex]]
        albumFields = [columns[albumIdentifierIndex]]
        artistFields = [columns[artistIdentifierIndex]]
        
        songAlbum.writerow([columns[albumIdentifierIndex], columns[songIdentifierIndex]])
        albumArtist.writerow([columns[artistIdentifierIndex], columns[albumIdentifierIndex]])
        songArtist.writerow([columns[artistIdentifierIndex], columns[songIdentifierIndex]])
        
        if len(headers) != len(columns):
            skipped.write(str(columns) + '\n')
            continue
        
        for i,c in enumerate(columns):
            if column_mappings[headers[i]] == 'songs':
                songFields.append(c)
            elif column_mappings[headers[i]] == 'albums':
                albumFields.append(c)
            elif column_mappings[headers[i]] == 'artists':
                artistFields.append(c)
        
        songs.writerow(songFields)
        albums.writerow(albumFields)
        artists.writerow(artistFields)

rawfile.close()
songsfile.close()
albumsfile.close()
artistsfile.close()
songAlbumFile.close()
albumArtistFile.close()
songArtistFile.close()
skipped.close()