__author__ = 'hen'

import sqlite3
import tangelo


def run(start, end, fields="*", sort="rowid"):
    config = tangelo.plugin_config()
    dbName = config["database_name"]

    conn = sqlite3.connect(config['database_url'])
    c = conn.cursor()

    print sort

    # for speedup
    if sort=="rowid":
        c.execute('SELECT '+fields+' FROM "'+dbName+'" LIMIT ?,?;',( start,end))
    else:
        print "THIS"


        c.execute('SELECT '+fields+' FROM "'+dbName+'" ORDER BY "'+sort+'"  LIMIT ?,?;',(start,end))

    res = c.fetchall()
    conn.close()
    return  {'res':res, 'sort':sort, 'fields':fields}



