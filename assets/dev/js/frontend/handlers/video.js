const VideoModule = elementorModules.frontend.handlers.Base.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				imageOverlay: '.elementor-custom-embed-image-overlay',
				video: '.elementor-video',
				videoIframe: '.elementor-video-iframe',
			},
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$imageOverlay: this.$element.find( selectors.imageOverlay ),
			$video: this.$element.find( selectors.video ),
			$videoIframe: this.$element.find( selectors.videoIframe ),
		};
	},

	getLightBox: function() {
		return elementorFrontend.utils.lightbox;
	},

	handleVideo: function() {
		if ( ! this.getElementSettings( 'lightbox' ) ) {
			this.elements.$imageOverlay.remove();

			this.playVideo();
		}
	},

	playVideo: function() {
		if ( this.elements.$video.length ) {
			this.elements.$video[ 0 ].play();

			return;
		}

		const $videoIframe = this.elements.$videoIframe,
			lazyLoad = $videoIframe.data( 'lazy-load' );

		if ( lazyLoad ) {
			$videoIframe.attr( 'src', lazyLoad );
		}

		const newSourceUrl = $videoIframe[ 0 ].src.replace( '&autoplay=0', '' );

		$videoIframe[ 0 ].src = newSourceUrl + '&autoplay=1';

		if ( $videoIframe[ 0 ].src.includes( 'vimeo.com' ) ) {
			const videoSrc = $videoIframe[ 0 ].src,
				timeMatch = /#t=[^&]*/.exec( videoSrc );

			// Param '#t=' must be last in the URL
			$videoIframe[ 0 ].src = videoSrc.slice( 0, timeMatch.index ) + videoSrc.slice( timeMatch.index + timeMatch[ 0 ].length ) + timeMatch[ 0 ];
		}
	},

	animateVideo: function() {
		this.getLightBox().setEntranceAnimation( this.getCurrentDeviceSetting( 'lightbox_content_animation' ) );
	},

	handleAspectRatio: function() {
		this.getLightBox().setVideoAspectRatio( this.getElementSettings( 'aspect_ratio' ) );
	},

	bindEvents: function() {
		this.elements.$imageOverlay.on( 'click', this.handleVideo );
	},

	onElementChange: function( propertyName ) {
		if ( 0 === propertyName.indexOf( 'lightbox_content_animation' ) ) {
			this.animateVideo();

			return;
		}

		var isLightBoxEnabled = this.getElementSettings( 'lightbox' );

		if ( 'lightbox' === propertyName && ! isLightBoxEnabled ) {
			this.getLightBox().getModal().hide();

			return;
		}

		if ( 'aspect_ratio' === propertyName && isLightBoxEnabled ) {
			this.handleAspectRatio();
		}
	},
} );

module.exports = function( $scope ) {
	elementorFrontend.elementsHandler.addHandler( VideoModule, { $element: $scope } );
};
