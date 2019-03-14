module.exports = function( $ ) {
	const self = this;

	// element-type.skin-type
	const handlers = {
		// Elements
		section: require( 'elementor-frontend/handlers/section' ),

		// Widgets
		'accordion.default': require( 'elementor-frontend/handlers/accordion' ),
		'alert.default': require( 'elementor-frontend/handlers/alert' ),
		'counter.default': require( 'elementor-frontend/handlers/counter' ),
		'progress.default': require( 'elementor-frontend/handlers/progress' ),
		'tabs.default': require( 'elementor-frontend/handlers/tabs' ),
		'toggle.default': require( 'elementor-frontend/handlers/toggle' ),
		'video.default': require( 'elementor-frontend/handlers/video' ),
		'image-carousel.default': require( 'elementor-frontend/handlers/image-carousel' ),
		'text-editor.default': require( 'elementor-frontend/handlers/text-editor' ),
	};

	const handlersInstances = {};

	const addGlobalHandlers = function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', require( 'elementor-frontend/handlers/global' ) );
	};

	const addElementsHandlers = function() {
		$.each( handlers, function( elementName, funcCallback ) {
			elementorFrontend.hooks.addAction( 'frontend/element_ready/' + elementName, funcCallback );
		} );
	};

	const init = function() {
		self.initHandlers();
	};

	this.initHandlers = function() {
		addGlobalHandlers();

		addElementsHandlers();
	};

	this.addHandler = function( HandlerClass, options ) {
		const elementID = options.$element.data( 'model-cid' );

		let handlerID;

		// If element is in edit mode
		if ( elementID ) {
			handlerID = HandlerClass.prototype.getConstructorID();

			if ( ! handlersInstances[ elementID ] ) {
				handlersInstances[ elementID ] = {};
			}

			const oldHandler = handlersInstances[ elementID ][ handlerID ];

			if ( oldHandler ) {
				oldHandler.onDestroy();
			}
		}

		const newHandler = new HandlerClass( options );

		if ( elementID ) {
			handlersInstances[ elementID ][ handlerID ] = newHandler;
		}
	};

	this.getHandlers = function( handlerName ) {
		if ( handlerName ) {
			return handlers[ handlerName ];
		}

		return handlers;
	};

	this.runReadyTrigger = function( scope ) {
		// Initializing the `$scope` as frontend jQuery instance
		const $scope = jQuery( scope ),
			elementType = $scope.attr( 'data-element_type' );

		if ( ! elementType ) {
			return;
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/global', $scope, $ );

		elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $scope, $ );

		if ( 'widget' === elementType ) {
			elementorFrontend.hooks.doAction( 'frontend/element_ready/' + $scope.attr( 'data-widget_type' ), $scope, $ );
		}
	};

	init();
};
