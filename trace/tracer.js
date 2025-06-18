
(function(){ 'use strict';

function ImageTracer(){
	var _this = this;

	this.versionnumber = '1.2.6',
	
	this.imageToSVG = function( url, callback, options ){
		options = _this.checkoptions(options);
		_this.loadImage(
			url,
			function(canvas){
				callback(
					_this.imagedataToSVG( _this.getImgdata(canvas), options )
				);
			},
			options
		);
	},

	this.imagedataToSVG = function( imgd, options ){
		options = _this.checkoptions(options);
		var td = _this.imagedataToTracedata( imgd, options );
		return _this.getsvgstring(td, options);
	},

	this.imageToTracedata = function( url, callback, options ){
		options = _this.checkoptions(options);
		_this.loadImage(
			url,
			function(canvas){
				callback(
					_this.imagedataToTracedata( _this.getImgdata(canvas), options )
				);
			},
			options
		);
	},

	this.imagedataToTracedata = function( imgd, options ){
		options = _this.checkoptions(options);
		var ii = _this.colorquantization( imgd, options );
		if(options.layering === 0){
			return _this.sequentialLayering(ii, options);
		}else{
			return _this.parallelLayering(ii, options);
		}
	};
}

})();