//API endpoint are stored inside 'queryUrl'
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Execute a 'get' request from the prior 'URL'
d3.json(Url, function(data) 
{
  //Send recieved 'data.features' object to a function
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData)
 {
  //Intialize an executable function for each feature in the 'Array'
  //Popup describing the 'place' & 'time' of each Earthquake
  function onEachFeature(feature, layer) 
    {
      layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

  //Create a funtion that renders the 'circle's radius' in correlation to it's 'magnitude'
  function radiusSize(magnitude) 
    {
    return magnitude * 20000;
    }

  //Build a function that serves as a color based magnitude for the cirlce
  function circleColor(magnitude) 
  {
    if (magnitude < 1) 
    {
      return "#ccff33"
    }
    else if (magnitude < 2) 
    {
      return "#ffff33"
    }
    else if (magnitude < 3)
    {
      return "#ffcc33"
    }
    else if (magnitude < 4) 
    {
      return "#ff9933"
    }
    else if (magnitude < 5) 
    {
      return "#ff6633"
    }
    else 
    {
      return "#ff3333"
    }
  }

  //Build a 'GeoJSON layer' holding the 'Array features' of the 'Earthquake Object'
  var earthquakes = L.geoJSON(earthquakeData, 
    {
        pointToLayer: function(earthquakeData, latlng) 
        {
         return L.circle(latlng, 
            {
                radius: radiusSize(earthquakeData.properties.mag),
                color: circleColor(earthquakeData.properties.mag),
                fillOpacity: 1
            });
        },
        onEachFeature: onEachFeature
    });

  //Add the 'Earthquake layer' to 'createMap function'
  createMap(earthquakes);
}

function createMap(earthquakes) 
{
  //Intialize & Define the 'outdoorsmap', 'satellitemap', & 'grayscalemap' layers
  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", 
  {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", 
  {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", 
  {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  //Create a 'baseMaps' object to hold 'base layers'
  var baseMaps = 
  {
    "Outdoor Map": outdoorsmap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satellitemap
  };

  //Define 'overlay object' for the 'overlay layer'
  var overlayMaps = 
  {
    Earthquakes: earthquakes
  
  };

  //Create a map that consists of 'streetmap' & 'earthquake layers'
  var myMap = L.map("map",
   {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [outdoorsmap, earthquakes]
  });

  //Create a layer control, push-in 'baseMaps' & 'overlayMaps' 
  //addTo the map
  L.control.layers(baseMaps, overlayMaps, 
    {
      collapsed: false
    }).addTo(myMap);

  //Build a legend 'Color function'
  function getColor(d) 
  {
    return d > 5 ? '#ff3333' :
           d > 4  ? '#ff6633' :
           d > 3  ? '#ff9933' :
           d > 2  ? '#ffcc33' :
           d > 1  ? '#ffff33' :
                    '#ccff33';
  }

  //Populate the 'legend' to the map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) 
  {
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      //Loop through the 'density intervals' & create a colored square label for each interval
      for (var i = 0; i < mags.length; i++) 
      {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}