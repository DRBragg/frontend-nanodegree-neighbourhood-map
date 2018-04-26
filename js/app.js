const client_id = 'KCPDTV3MZKNPMT4BK34LHM4OUTUCLQQNK1FUCASJMQDYXTAP'
const client_secret = 'PPKU0WSXUD5WZLIXFKYU1IIXRBB3JJKK02ONCTLY5HZ2NSWU'
const locations = [
  {
    title: 'Evil Genius Brewery',
    position: {
      lat: 39.976190,
      lng: -75.133475
    }
  },
  {
    title: 'Barcade',
    position: {
      lat: 39.968132,
      lng: -75.134634
    }
  },
  {
    title: 'Garage Fishtown',
    position: {
      lat: 39.969284,
      lng: -75.134248
    }
  },
  {
    title: 'Go Vertical',
    position: {
      lat: 39.963495,
      lng: -75.134763
    }
  },
  {
    title: 'Urban Axes',
    position: {
      lat: 39.984674,
      lng: -75.129141
    }
  }
];

function initMap() {
  ko.applyBindings(renderMap());
}

const renderMap = () => {
  var self = this;
  self.searchTerm = ko.observable("");
  self.markers = [];
  self.infoWindows = [];

  self.getInfo = (marker, infowindow) => {
    if (infowindow.marker !== marker) {
      infowindow.setContent('');
      infowindow.marker = marker;
      let fourSquareApi = `https://api.foursquare.com/v2/venues/search?ll=${marker.lat},${marker.lng}&query=${marker.title.split(" ").join("-")}&limit=1&client_id=${client_id}&client_secret=${client_secret}&v=20180425`;
      fetch(fourSquareApi).then(function(response){
        if (response.ok) {
          return response.json()
        }
        window.alert('Unable to load the FourSquare API, please try again later.');
        }).then(function(data){
          let venue = data.response.venues[0];
          let content = `<strong>${marker.getTitle()}</strong><br/>`;
          content += `<p>${venue.location.formattedAddress[0]}<br/>`;
          content += `${venue.location.formattedAddress[1]}</p>`;
          content += `<a href="https://foursquare.com/v/${venue.id}" target="_blank">Check out ${venue.name} on FourSquare</a>`;
          return content
        }).then(function(content){
          infowindow.setContent(content);
          infowindow.open(map, marker);
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        })
    }
  };

  self.bounceAndGenerate = function() {
    self.infoWindows.forEach((infowindow) => {
      infowindow.close();
    })
    self.getInfo(this, self.infoWindows[this.id]);
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((() => {
      this.setAnimation(null);
    }).bind(this), 1500);
  };

  self.initMap = function() {
    let map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 39.976125,
        lng: -75.133456
      },
      zoom: 14
    });

    for (i = 0; i < locations.length; i++) {
      this.infoWindow = new google.maps.InfoWindow({
        content: locations[i].title
      });
        this.markerTitle = locations[i].title;
        this.markerLat = locations[i].position.lat;
        this.markerLng = locations[i].position.lng;
        this.marker = new google.maps.Marker({
          map: map,
          position: {
            lat: this.markerLat,
            lng: this.markerLng
          },
          title: this.markerTitle,
          lat: this.markerLat,
          lng: this.markerLng,
          id: i,
          animation: google.maps.Animation.DROP,
          bounce: this.bounceAndGenerate
        });
        this.marker.setMap(map);
        self.markers.push(this.marker);
        self.infoWindows.push(this.infoWindow);
        this.marker.addListener('click', self.bounceAndGenerate);
        }
    };

    self.initMap();

    self.filteredList = ko.computed(function() {
      let results = [];
      for (i = 0; i < self.markers.length; i++) {
        let markerLocation = this.markers[i];
        this.name = this.markers[i].title;
        markerLocation.bounce = self.markers[i].bounce;
        if (markerLocation.title.toLowerCase().includes(this.searchTerm().toLowerCase())) {
          results.push(markerLocation);
          this.markers[i].setVisible(true);
        } else {
          this.markers[i].setVisible(false);
        }
      }
      return results;
    }, this);
 }

function mapError() {
	window.alert('Unable to load Google Maps API, please try again later.');
}

$('#menu-toggle').click(function(e) {
    e.preventDefault();
    $('#wrapper').toggleClass('toggled');
    $(this).toggleClass('fa-angle-right fa-angle-left');
});
