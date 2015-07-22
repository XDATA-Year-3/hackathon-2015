/*jshint browser: true, jquery: true */
/*global _, clique, tangelo */

$(function () {
    "use strict";

    var initialize;

    initialize = function (cfg) {
        var graph,
            view;

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
    };

    $.getJSON("assets/config.json")
        .then(initialize, _.bind(initialize, {}));
});
