/*jshint browser: true, jquery: true */
/*global _, clique, tangelo, app, delv, LineUp, d3 */

$(function () {
    "use strict";

    var initialize,
        DummyView;

    window.app = {};

    DummyView = function () {
        return {
            react: function (invoker, dataset) {
                console.log(app.delv.dataIF.getSelectedItems(dataset, "name"));
                console.log(app.delv.dataIF.getAllItems(dataset, "name"));
            }
        };
    };

    initialize = function (cfg) {
        var graph,
            view,
            cliqueSelection,
            dummy,
            lineup;

        // Initialize Clique.
        window.graph = graph = new clique.Graph({
            adapter: tangelo.getPlugin("mongo").Mongo,
            options: {
                host: cfg.graphHost,
                database: cfg.graphDatabase,
                collection: cfg.graphCollection
            }
        });

        view = new clique.view.Cola({
            model: graph,
            el: "#clique"
        });

        // Initialize LineUp.
        (function () {
            var storage,
                data,
                columns;

            data = [
                {foo: 0.4,
                 bar: "roni"},

                {foo: 0.7,
                 bar: "hendrik"}
            ];

            columns = [
                {column: "foo",
                 type: "number",
                 domain: [0,1]},

                {column: "bar",
                 type: "string"}
            ];

            _.each(_.range(100), function (i) {
                var n = _.clone(data[1]);
                n.bar += i;
                data.push(n);
            });

            storage = LineUp.createLocalStorage(data, columns, null, "bar");

            lineup = LineUp.create(storage, d3.select("#lineup"), {
                svgLayout: {
                    addPlusSigns: true
                }
            });
        }());

        // Initialize Delv.
        app.delv = {};
        app.delv.dataIF = new delv.data("data");
        delv.addDataIF(app.delv.dataIF);
        app.delv.dataIF.setDelvIF(delv);
        window.cliqueSelection = cliqueSelection = app.delv.dataIF.addDataSet("clique_selection");

        cliqueSelection.addAttribute(new delv.attribute("name", delv.AttributeType.UNSTRUCTURED, new delv.colorMap(["210", "210", "210"]), new delv.dataRange()));

        app.delv.clique = new delv.d3View("clique");
        app.delv.clique.dataIF("data");

        view.model.on("change", function (m) {
            cliqueSelection.clearItems();

            _.each(m.get("nodes"), function (node) {
                cliqueSelection.addId(node.key);
                cliqueSelection.setItem("name", node.key, node.data.name);
            });
        });

        view.selection.on("change", _.debounce(function (sel) {
            var delvView = app.delv.clique;
            delvView._dataIF.updateSelectedIds(delvView.svgElem, "clique_selection", _.keys(sel.attributes));
        }, 100));

        dummy = new DummyView();
        delv.addView(dummy, "dummy");

        delv.connectToSignal("selectedIdsChanged", "dummy", "react");
    };

    $.getJSON("assets/config.json")
        .then(initialize, _.bind(initialize, {}));
});
