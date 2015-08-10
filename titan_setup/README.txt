Making this work:
-----------------

If you:
1. download the data files into ../data/
2. extract an empty titan database as ../data/titan/
3. download http://downloads.sourceforge.net/project/opencsv/opencsv/3.5/opencsv-3.5.jar?r=&ts=1438788854 into ../data/titan/lib/
4. add the performance tweaks below
5. Run ./runEverything.sh

That *should* do everything to get the database up and running...

Performance tweaks:
-------------------
To make loading faster, temporarily add:

1. these to conf/rexster-cassandra-es.xml inside rexster -> graphs -> properties:

<storage.batch-loading>true</storage.batch-loading>
<schema.default>none</schema.default>

2. add this to conf/elasticsearch.yml:
index.refresh_interval: 120s

3. set this on the command line (this may or may not be necessary... I ran into problems with ElasticSearch without it):
export ES_HEAP_SIZE="8g"

It should be cool to remove these settings once the data is loaded.