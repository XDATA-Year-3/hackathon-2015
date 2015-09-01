# hackathon-2015

## Download the Song Data

1. ``cd data``
2. ``curl https://data.kitware.com/api/v1/file/55b0fd098d777f3a9520e948/download >misongs.sqlite.bzip2``
3. ``bunzip2 misongs.sqlite.bzip2``

## Download the Artist Similarity Graph Data

1. ``curl https://data.kitware.com/api/v1/file/55e5f1998d777f6ddc3ff8e2/download >similarity.tar.bzip2``
2. ``tar xjvf similarity.tar.bzip2``
3. ``mongorestore similarity``

## Build and Run

1. ``pip install tangelo==0.9``
2. ``npm install``
3. ``gulp``
4. ``gulp serve``
5. Visit http://localhost:3000 in your browser.

## Related Technology

- Delv + Vega 2.0 Crossfilter example
  <https://github.com/krismz/Delv/tree/master/examples/vega_crossfilter>
