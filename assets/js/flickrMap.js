var flickrMap = {},
	flickrMarkers = [], idxMarker = 0, bounds,
	map, infowindow = new google.maps.InfoWindow();

var GRAND_LYON = new google.maps.LatLng(45.764043000,4.8356589999999640),
	JSON_OUTPUT_FOLDER = 'assets/',
	JSON_DENSITY = JSON_OUTPUT_FOLDER +'density.json';

//trace function for debugging
function trace(message)
{
	if (typeof console != 'undefined')
	{
		console.log(message);
	}
}

/**
 * An init function to set a google map centered on the city of Lyon
 * and show the most importants places where flickr's users have tooken some pictures
 * These places are showed with circle of density
 *
 * @return no return
 */
flickrMap.initialize = function(){
	// init the propeties of the map
	var mapProp = {
		center:GRAND_LYON,
		zoom:13,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};

	// instanciate it
	map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

	//
	bounds = new google.maps.LatLngBounds ();

	flickrMap.createCircleDensity();
}

/**
 * Create on the map a custom marker for a flickr picture
 *
 * @param  {int}    i                 : marker's index on the map
 * @param  {int}    latitude          :
 * @param  {int}    longitude         :
 * @param  {String} infowindowcontent : custom infowindows associated with the marker
 * @param  {Img}    icon              : the custom display of the marker
 * @return no return
 */
flickrMap.createFlickrMarker = function(i,latitude,longitude,infowindowcontent,icon){
	var markerLatLng = new google.maps.LatLng(latitude,longitude);

	//set marker to be the flickr image, resizing it to 32 by 32 pixels
	var image = new google.maps.MarkerImage(icon, null, null, null, new google.maps.Size(32,32));

	//create and map the marker
	flickrMarkers[i] = new google.maps.Marker({
			position: markerLatLng,
			map: map,
			title: infowindowcontent,
			icon: image
	});

	//add an onclick event
	google.maps.event.addListener(flickrMarkers[i], 'click', function() {
			infowindow.setContent(infowindowcontent);
			infowindow.open(map,flickrMarkers[i]);
	});

	flickrMarkers[i].setMap(map);
}

/**
 * Get all the data of a flickr picture from the flickr api
 *
 * @param  {int} idPicture
 * @return no return
 */
flickrMap.getFlickrPicture = function(idPicture){
	var reqFlickerAPI = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=24c576ca7450c3d670fcd9f0f11661f4&photo_id='+idPicture+'&jsoncallback=?';

	$.getJSON(reqFlickerAPI, {
		format: 'json'
	})
	.done(function(data) {
		var photo = data.photo,
			owner = data.photo.owner.realname,
			location = photo.location,
			url_photo;

		flickrMap.url_photo(idPicture, 'Small', function(url_photo,url){

			infowindowcontent = '<h4><strong>'+photo.title._content+'</strong></h4><br>';
			infowindowcontent += '<a href="'+url+'" target="_blank">';
			infowindowcontent += '<img src="'+url_photo+'"></a>';
			infowindowcontent += '<hr/><span class="text-right">'+owner+'</span>';

			idxMarker++;
			flickrMap.createFlickrMarker(idxMarker,
										location.latitude,
										location.longitude,
										infowindowcontent,
										url_photo);
		});
	});
}

/**
 * Load the data of all pictures which are contained in a specfific cluster
 *
 * @param  {String} json : the json name file (eg: cluster_1.json)
 * @return no return
 */
flickrMap.loadAllDataFromJson = function (json){
	var newBounds = new google.maps.LatLngBounds ();
	var markerLatLng;

	$.getJSON(JSON_OUTPUT_FOLDER +json,function(data){
		$.each(data,function(){
			var idPicture = this.id;

			flickrMap.getFlickrPicture(idPicture);

			markerLatLng = new google.maps.LatLng(this.latitude,this.longitude);
			newBounds.extend(markerLatLng);
		});
	});
}

/**
 * Dessine sur la map les cercles de chaque cluster en fonction des
 * données lues en dans le fichier json passé en paramètre
 *
 * @return no return
 */
flickrMap.createCircleDensity = function (){

	var dMin,vMin, // variables needed to calculate the diameter of the circle
		color = ["#BA0C1F","#74cfae","#2580A3", "#BAB703", "#70BA33"]; // a set of color for the circles

	$.getJSON(JSON_DENSITY,function(data){
		$.each(data, function(){
			var that = this;
			var randColor = color[Math.floor(Math.random() * color.length)];
			var clusterCircle = new google.maps.Circle({
					center: new google.maps.LatLng(that.latitude,that.longitude),
					radius:Math.sqrt(that.count) * 12,
					strokeColor:"#BA0C1F",
					strokeOpacity:0.8,
					strokeWeight:2,
					fillColor:"#BA0C1F",
					fillOpacity:0.4
				});

			clusterCircle.setMap(map);

			//extent bounds for each stop and adjust map to fit to it
			var markerLatLng = new google.maps.LatLng(that.latitude,that.longitude);
			bounds.extend(markerLatLng);
			map.fitBounds(bounds);

			google.maps.event.addListener(clusterCircle, 'click', function() {
				// load the data collected by knime for the associated cluster
				flickrMap.loadAllDataFromJson(that.cluster+".json");
			});
		});
	});
}


//toggle array layers of markers on/off
flickrMap.toggleArrayLayer = function(arraylayer){
	if (arraylayer) {
		for (i in arraylayer) {
			if (arraylayer[i].getVisible() == true)
			{
				arraylayer[i].setMap(null);
				arraylayer[i].visible = false;
			}
			else
			{
				arraylayer[i].setMap(map);
				arraylayer[i].visible = true;
			}
		}
	}
}

//get the url of the photo
flickrMap.url_photo =function(idPhoto, taille , callback) {
	// Si la taille a été précisée on ajoute un "_" pour respecter le format.
	var reqFlickerAPI = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=24c576ca7450c3d670fcd9f0f11661f4&photo_id='+idPhoto+'&jsoncallback=?'
	var url_photo;
	var url;
	$.getJSON(reqFlickerAPI, {
		format: 'json',
		async:true
	})
	.success(function(data) {
		var photo = data.sizes.size;
		$.each(photo , function(key,item){
			if(item.label === taille){
				url_photo = item.source;
				url = item.url;
			}
		})
		callback(url_photo,url);
	});
}


