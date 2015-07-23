/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 7/22/15.
 */

$(function(){

    var diff=100;
    var rowCount = 1;
    var currentStart=0;

    var displayColumns = [];
    var undisplayColumns = [];


    var updateHeader = function(){
        var thead = d3.select("#mainTable thead")

        var column = thead.selectAll(".column").data(displayColumns);
        column.exit().remove();

        // --- adding Element to class column
        var columnEnter = column.enter().append("th").attr({
            "class":"column"
        }).on({
            "click":function(d){
                var index = displayColumns.indexOf(d);
                if (index > -1) {
                    displayColumns.splice(index, 1);
                }
                undisplayColumns.push(d);

                updateHeader();

                currentEnd = Math.min(currentStart+diff,rowCount);
                queryBody(currentStart,currentEnd)

            }
        })

        column.text(function(d){return d;})
    }

    var queryHeader = function(){
        $.ajax({
            url: "meta/header",
            data: {},
            //dataType: "text",
            success: function (response) {
                rowCount = response.rowcount;

                var columnInfo = response.columnNames;
                displayColumns = columnInfo.map(function(d){return d.name;})

                updateHeader();

                queryBody(currentStart,currentStart+diff);


            },
            error: function (jqxhr, textStatus, reason) {
                console.log("ERROR", textStatus);
            }
        }); 
    }
    

    var queryBody = function(s,e){

        var query = "range/"+s+"/"+e+"/"+encodeURI(displayColumns.join(","))

        $.ajax({
            url: query,
            success: function (response) {
                
    
                var tbody = d3.select("#mainTable tbody")

                tbody.selectAll(".tableRow").remove();

                // --- adding Element to class tableRow
                var tableRowEnter = tbody.selectAll(".tableRow").data(response.res).enter().append("tr").attr({
                    "class":"tableRow"
                })
                
                var tableCell = tableRowEnter.selectAll(".tableCell").data(function(d){return d;})
                .enter().append("td").attr({
                    "class":"tableCell"
                })
                
                tableCell.text(function(d){return d;})
                
    
    
            },
            error: function (jqxhr, textStatus, reason) {
                console.log("ERROR", textStatus);
            }
        });


}
    

    queryHeader();


    d3.select("#plus").on({
        "click": function () {
            if (currentStart+diff < rowCount){
                currentStart+=diff
                currentEnd = Math.min(currentStart+diff,rowCount);
                queryBody(currentStart,currentEnd)

                d3.select("#currentPos").text(currentStart+"-"+currentEnd+" / "+rowCount);
            }
        }
    })

    d3.select("#minus").on({
        "click": function () {
            if (currentStart-diff >= 0){
                currentStart-=diff
                currentEnd = Math.min(currentStart+diff,rowCount);
                queryBody(currentStart,currentEnd)

                d3.select("#currentPos").text(currentStart+"-"+currentEnd+" / "+rowCount);
            }
        }
    })







})