// Map settings
var mymap = L.map('mapid').setView([52.2053, 0.1218], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3RhcnNoZWVwIiwiYSI6ImNqdzhlejkwejJnZ3YzeXBsZ3BnNmpvZTEifQ.mL2cbVaogw3pxT4A4O844Q'
}).addTo(mymap);

// A leaflet layer for the markers - so that we can clear it every time we filter
var markers = L.layerGroup().addTo(mymap);


// Set the default color scheme
dc.config.defaultColors(d3.schemeBlues[9])

// The charts placeholders
var reasonRowChart = dc.rowChart('#reasonChart')
var actionRowChart = dc.rowChart('#actionChart')
var reasonActionMap = dc.heatMap('#reasonActionMap')

// Read the data and create the charts
d3.json('data/data.json').then(function (data) {

    var ndx = crossfilter(data),
        all = ndx.groupAll(),
        reasonDim = ndx.dimension(function (d) { return d.reason }),
        actionDim = ndx.dimension(function (d) { return d.action }),

        reasonGroup = reasonDim.group(),
        actionGroup = actionDim.group(),

        runDim = ndx.dimension(function (d) { return [d.reason, d.action] }),
        runGroup = runDim.group()
    
    // The heatmap
    var heatColorMapping = d3.scaleLinear()
        .domain([0, 8, 16])
        .range(["white", "orange", "red"])

    reasonActionMap
        .width(45 * 8 + 80)
        .height(45 * 9 + 40)
        .dimension(runDim)
        .group(runGroup)
        .keyAccessor(function (d) { return d.key[0] })
        .valueAccessor(function (d) { return d.key[1] })
        .colorAccessor(function (d) { return d.value })
        .title(function (d) {
            return "Reason:   " + d.key[0] + "\n" +
                "Action:  " + d.key[1] + "\n" +
                "Count: " + d.value;
        })
        .colors(heatColorMapping)
        //.calculateColorDomain()
    reasonActionMap.render()

    // The reason rowchart
    reasonRowChart
        .width(400)
        .height(400)
        .margins({ top: 20, left: 10, right: 10, bottom: 20 })
        .group(reasonGroup)
        .dimension(reasonDim)
        .ordinalColors(d3.schemeSet1)
        .label(function (d) {
            return d.key;
        })
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4)
    reasonRowChart.render()

    // The action rowchart
    actionRowChart
        .width(400)
        .height(400)
        .margins({ top: 20, left: 10, right: 10, bottom: 20 })
        .group(actionGroup)
        .dimension(actionDim)
        .ordinalColors(d3.schemeSet1)
        .label(function (d) {
            return d.key;
        })
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4)
    actionRowChart.render()

    

    var refreshMarkers = function () {
        // Clear the markers
        markers.clearLayers()
        // Retrieve the visible markers
        var filtered = ndx.allFiltered()
        // display them
        for (var i = 0; i < filtered.length; i++) {
            var e = filtered[i]
            L.marker([e.lat, e.long]).addTo(markers);
        }
    }

    // Refresh the marker everytime the data is filtered
    ndx.onChange(refreshMarkers)

    // Just the first time we need to display the markers
    refreshMarkers()
    
});
