__author__ = 'hen'

import sqlite3
import tangelo




def run(op):
    config = tangelo.plugin_config()
    dbName = config["database_name"]
    conn = sqlite3.connect(config['database_url'])
    c = conn.cursor()

    if op == "header":
        # returns (cid, name, type, notnull, ..)
        c.execute('PRAGMA table_info('+dbName+')')
        names = map( lambda x: {'name':x[1],'type':x[2]}, c.fetchall())

        c.execute('SELECT COUNT(*) FROM "'+dbName+'"')
        counts = c.fetchone()[0]
        # only return names
        return {'columnNames':names, 'rowcount':counts}

    conn.close()



