const Strings = {};
Strings.orEmpty = function( entity ) {
    return entity || "";
};

module.exports = {
  foo: function () {
    // whatever
  },
  getId: function (breweryData) {
    // whatever
  },

  formatCard: function(breweryData) {
      const b = breweryData["response"]["brewery"]["items"][0]["brewery"];
      console.log(b);
      return {
        "replies": [{
          type: 'card',
          content: {
              title: b["brewery_name"],
              subtitle: b["beer_count"] + " beers",
              imageUrl: b["brewery_label"],
              buttons: []
          }
        }],
        "conversation": {
          "memory": {
            "breweryid": b["brewery_id"]
          }
        }
      }
  },

  filterBeers: function(beerInfo) {
    const name = beerInfo["beer"]["beer_name"];
    console.log(name);
    return name && name.length <= 25;
  },

  formatBeerList: function(data) {
    const beers = data["items"]
    let elements = beers.filter(this.filterBeers).slice(0, 10).map(beerInfo => {
      const { beer } = beerInfo;
      console.log(beer);
    	return {
    			title: beer["beer_name"],
    			imageUrl: beer["beer_label"],
    			subtitle: beer["beer_style"] + ", ABV: " + beer["beer_abv"] + "%, IBU: " + beer["beer_ibu"],
          description: beer["beer_description"],
          status1: "" + Strings.orEmpty(beer["rating_score"]),
    			buttons: [],
    		};
    });

    return {
      "replies": [{
  			type: 'list',
  			content: {
  				elements
  			}
  		}]
    }
  }

};
