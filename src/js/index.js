/*jshint browser: true, jquery: true */
/*global _, clique, tangelo, app, delv, LineUp, d3 */

$(function () {
    "use strict";

    var initialize,
        DummyView,
        columns;

    window.app = {};

    columns = [
        {column: "artist_name", type: "string"},
        {column: "title", type: "string"},
        {column: "release", type: "string"},
        {column: "duration", type: "number", domain: [0, 600]},
        {column: "loudness", type: "number", domain: [-30, 0]},
        {column: "tempo", type: "number", domain: [0, 200]}
    ];

    DummyView = function (lineup) {
        return {
            react: function (invoker, dataset) {
                console.log(app.delv.dataIF.getSelectedItems(dataset, "name"));
                console.log(app.delv.dataIF.getAllItems(dataset, "name"));
            },

            lineup: function (invoker, dataset) {
                var selected = app.delv.dataIF.getSelectedItems(dataset, "name"),
                    lookups;

                lookups = _.map(selected, function (s) {
                    return $.getJSON("plugin/misong/range/0/100", {
                        name: s,
                        fields: _.pluck(columns, "column").join(",")
                    });
                });

                $.when.apply($, lookups)
                    .done(function () {
                        var data = _.map(Array.prototype.concat.apply([], _.pluck(_.pluck(arguments, "0"), "res")), function (song) {
                            var rec = {};
                            _.each(_.pluck(columns, "column"), function (col, i) {
                                rec[col] = song[i];
                            });
                            rec.loudness = Number(rec.loudness);
                            return rec;
                        });

                        lineup.changeDataStorage({
                            storage: LineUp.createLocalStorage(data, columns, null, "title")
                        });
                    });
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
            lineup = LineUp.create(LineUp.createLocalStorage([], columns, null, "title"), d3.select("#lineup"), {
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

        dummy = new DummyView(lineup);
        delv.addView(dummy, "dummy");

        delv.connectToSignal("selectedIdsChanged", "dummy", "react");
        delv.connectToSignal("selectedIdsChanged", "dummy", "lineup");
    };

    $.getJSON("assets/config.json")
        .then(initialize, _.bind(initialize, {}));
});
