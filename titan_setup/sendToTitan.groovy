import com.opencsv.CSVReader
import groovy.json.JsonSlurper

def parse(value, format) {
    if (value == '') {
        return null
    } else {
        switch (format) {
            case 'Float.class':
                return value.toFloat()
            case 'Double.class':
                return value.toDouble()
            case 'Integer.class':
                return value.toInteger()
            case 'Long.class':
                return value.toLong()
            case 'Short.class':
                return value.toShort()
            default:
                return value
        }
    }
}


config = new JsonSlurper().parseText(new File('million-songs.conf.json').text)
schema = config['schema']

g = TitanFactory.open("cassandra:localhost")

m = g.getManagementSystem()

// Index for the ids
k = m.makePropertyKey(config['idAttribute']).dataType(String.class).cardinality(Cardinality.SINGLE).make()
m.buildIndex('compositeVertex' + config['idAttribute'], Vertex.class).addKey(k).buildCompositeIndex()
m.buildIndex('compositeEdge' + config['idAttribute'], Edge.class).addKey(k).buildCompositeIndex()

// TODO: hacky node typing property key... I index this so I can count nodes by label quickly
// I should probably do this differently
k = m.makePropertyKey(config['nodeLabelAttribute']).dataType(String.class).cardinality(Cardinality.SINGLE).make()
m.buildIndex('mixed' + config['nodeLabelAttribute'], Vertex.class).addKey(k).buildCompositeIndex()

// Set up property keys for anything in the schema (helps speed up loading + parses numbers)
for (nodeOrEdge in config['schema']) {
    for (labelAttrs in nodeOrEdge.value) {
        for (prop in labelAttrs.value) {
            m.makePropertyKey(prop.key).dataType(Eval.me(prop.value['dataType'])).cardinality(Cardinality.SINGLE).make()
        }
    }
}

// Set up all other indices (specified in titan.conf.json)
// TODO: will fail if multiple node types use the same field name, need to support other index types
for (prop in config['searchableAttributes']) {
    for (indexSpec in prop.value) {
        k = m.getPropertyKey(indexSpec['Property'])
        if (k == null) {
            k = m.makePropertyKey(indexSpec['Property']).dataType(Eval.me(indexSpec['DataType'])).cardinality(Cardinality.SINGLE).make()
        }
        m.buildIndex('mixed' + indexSpec['Property'], Vertex.class).addKey(k, Mapping.STRING.getParameter() ).buildMixedIndex('search')
    }
}
// Init edge types TODO: instead of my hacky node typing, init node labels properly here!
for (edgeLabel in config['schema']['edgeTypes']) {
    m.makeEdgeLabel(edgeLabel.key).make()
}
m.commit()

// Set up batch loading
bg = new BatchGraph(g, VertexIDType.STRING, 10000)
bg.setVertexIdKey(config['idAttribute'])

// Load the nodes
nodeCounter = 0L
lineNo = 0L
for (node in config['sources']['nodes']) {
    CSVReader f = new CSVReader(new FileReader(node['data']))
    header = null
    while ((line = f.readNext()) != null) {
        lineNo++
        
        if (header == null) {
            header = line
        } else {
            lineMap = [header,line].transpose().collectEntries { it }
            id = lineMap.remove(node['id'])    // don't bother keeping the id as an attribute...
            if (bg.getVertex(id) != null) {
                throw new Exception("Duplicate id in " + node['data'] + " on line " + lineNo.toString() + ": \n" + p.next().toString() + "\n" + line) 
            } else {
                newNode = bg.addVertex(id)
                for (prop in lineMap) {
                    if (config['schema']['nodeTypes'][node['label']][prop.key] == null) {
                        println(prop.key)
                        println(config['schema']['nodeTypes'][node['label']])
                    }
                    prop.value = parse(prop.value, config['schema']['nodeTypes'][node['label']][prop.key]['dataType'])
                    if (prop.value != null) {
                        newNode.setProperty(prop.key, prop.value)
                    }
                }
                newNode.setProperty(config['nodeLabelAttribute'], node['label'])  // hacky node typing
            }
            if (++nodeCounter%100000L == 0L) println "Added ${nodeCounter} nodes"
        }
    }
}

// Load the edges, generating ids
edgeCounter = 0L
skippedEdges = 0L
lineNo = 0L
for (edge in config['sources']['edges']) {
    CSVReader f = new CSVReader(new FileReader(edge['data']))
    header = null
    while ((line = f.readNext()) != null) {
        lineNo++
        
        if (header == null) {
            header = line
        } else {
            lineMap = [header,line].transpose().collectEntries { it }
            
            sourceStr = lineMap.remove(edge['source'])
            targetStr = lineMap.remove(edge['target'])
            
            if (sourceStr == null || targetStr == null) {
                def error = "Error: could ot parse"
                if (sourceStr == null) {
                    error += " source (" + edge['source'] + ")"
                }
                if (sourceStr == null && targetStr == null) {
                    error += " or"
                }
                if (targetStr == null) {
                    error += " target (" + edge['target'] + ")"
                }
                throw new Exception(error + " id for edge in " + edge['data'] + " on line " + lineNo.toString() + ": \n" + line.toString())
            }
            
            source = bg.getVertex(sourceStr)
            target = bg.getVertex(targetStr)
            
            if (source == null || target == null) {
                def error = "Warning: could not find nodes matching"
                if (source == null) {
                    error += " source id: " + sourceStr
                }
                if (source == null && target == null) {
                    error += " or"
                }
                if (target == null) {
                    error += " target id: " + targetStr
                }
                error += " in " + edge['data'] + " on line " + lineNo.toString() + ":\n" + line.toString()
                skippedEdges++
                //println(error)
                //throw new Exception(error)
            } else {
                newEdge = bg.addEdge(null, source, target, edge['label'])
                newEdge.setProperty(config['idAttribute'], edgeCounter.toString())
                for (prop in lineMap) {
                    prop.value = parse(prop.value, config['schema']['edgeTypes'][edge['label']][prop.key]['dataType'])
                    if (prop.value != null) {
                        newEdge.setProperty(prop.key, prop.value)
                    }
                }
                if (++edgeCounter%100000L == 0L) println "Added ${edgeCounter} edges"
            }
        }
    }
}

println("Finished loading data. Nodes: ${nodeCounter} Edges: ${edgeCounter} Skipped Edges: ${skippedEdges}")

g.commit()