__author__ = 'hen'

import sqlite3
import tangelo

@tangelo.types(start=int, end=int)
def run(start, end, fields="*", sort="rowid", name=None):
    config = tangelo.plugin_config()
    dbName = config["database_name"]

    conn = sqlite3.connect(config['database_url'])
    c = conn.cursor()

    print sort

    if name is not None:
        c.execute('SELECT %s FROM "%s" WHERE artist_name="%s" LIMIT ?,?;' % (fields, dbName, name), (start, end-start))
    elif sort=="rowid":
        # for speedup
        c.execute('SELECT %s FROM "%s" LIMIT ?,?;' % (fields, dbName),( start, end-start))
    else:
        print "THIS"
        c.execute('SELECT %s FROM "%s" ORDER BY "%s"  LIMIT ?,?;' % (fields, dbName, name),(start,end-start))

    res = c.fetchall()
    conn.close()
    return  {'res':res, 'sort':sort, 'fields':fields}



