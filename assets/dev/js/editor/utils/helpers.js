var helpers;

helpers = {
	_enqueuedFonts: [],

	elementsHierarchy: {
		section: {
			column: {
				widget: null,
				section: null,
				container: {
					column: null,
				},
			},
		},
	},

	enqueueFont: function( font ) {
		if ( -1 !== this._enqueuedFonts.indexOf( font ) ) {
			return;
		}

		var fontType = elementor.config.controls.font.options[ font ],
			fontUrl,

			subsets = {
				ru_RU: 'cyrillic',
				uk: 'cyrillic',
				bg_BG: 'cyrillic',
				vi: 'vietnamese',
				el: 'greek',
				he_IL: 'hebrew',
			};

		switch ( fontType ) {
			case 'googlefonts' :
				fontUrl = 'https://fonts.googleapis.com/css?family=' + font + ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';

				if ( subsets[ elementor.config.locale ] ) {
					fontUrl += '&subset=' + subsets[ elementor.config.locale ];
				}

				break;

			case 'earlyaccess' :
				var fontLowerString = font.replace( /\s+/g, '' ).toLowerCase();
				fontUrl = 'https://fonts.googleapis.com/earlyaccess/' + fontLowerString + '.css';
				break;
		}

		if ( ! _.isEmpty( fontUrl ) ) {
			elementor.$previewContents.find( 'link:last' ).after( '<link href="' + fontUrl + '" rel="stylesheet" type="text/css">' );
		}

		this._enqueuedFonts.push( font );

		elementor.channels.editor.trigger( 'font:insertion', fontType, font );
	},

	resetEnqueuedFontsCache: function() {
		this._enqueuedFonts = [];
	},

	getElementChildType: function( elementType, container ) {
		if ( ! container ) {
			container = this.elementsHierarchy;
		}

		if ( undefined !== container[ elementType ] ) {
			if ( jQuery.isPlainObject( container[ elementType ] ) ) {
				return Object.keys( container[ elementType ] );
			}

			return null;
		}

		for ( var type in container ) {
			if ( ! container.hasOwnProperty( type ) ) {
				continue;
			}

			if ( ! jQuery.isPlainObject( container[ type ] ) ) {
				continue;
			}

			var result = this.getElementChildType( elementType, container[ type ] );

			if ( result ) {
				return result;
			}
		}

		return null;
	},

	getUniqueID: function() {
		return Math.random().toString( 16 ).substr( 2, 7 );
	},

	/*
	 * @deprecated 2.0.0
	 */
	stringReplaceAll: function( string, replaces ) {
		var re = new RegExp( Object.keys( replaces ).join( '|' ), 'gi' );

		return string.replace( re, function( matched ) {
			return replaces[ matched ];
		} );
	},

	isActiveControl: function( controlModel, values ) {
		var condition,
			conditions;

		// TODO: Better way to get this?
		if ( _.isFunction( controlModel.get ) ) {
			condition = controlModel.get( 'condition' );
			conditions = controlModel.get( 'conditions' );
		} else {
			condition = controlModel.condition;
			conditions = controlModel.conditions;
		}

		// Multiple conditions with relations.
		if ( conditions ) {
			return elementor.conditions.check( conditions, values );
		}

		if ( _.isEmpty( condition ) ) {
			return true;
		}

		var hasFields = _.filter( condition, function( conditionValue, conditionName ) {
			var conditionNameParts = conditionName.match( /([a-z_0-9]+)(?:\[([a-z_]+)])?(!?)$/i ),
				conditionRealName = conditionNameParts[ 1 ],
				conditionSubKey = conditionNameParts[ 2 ],
				isNegativeCondition = !! conditionNameParts[ 3 ],
				controlValue = values[ conditionRealName ];

			if ( values.__dynamic__ && values.__dynamic__[ conditionRealName ] ) {
				controlValue = values.__dynamic__[ conditionRealName ];
			}

			if ( undefined === controlValue ) {
				return true;
			}

			if ( conditionSubKey && 'object' === typeof controlValue ) {
				controlValue = controlValue[ conditionSubKey ];
			}

			// If it's a non empty array - check if the conditionValue contains the controlValue,
			// If the controlValue is a non empty array - check if the controlValue contains the conditionValue
			// otherwise check if they are equal. ( and give the ability to check if the value is an empty array )
			var isContains;

			if ( _.isArray( conditionValue ) && ! _.isEmpty( conditionValue ) ) {
				isContains = _.contains( conditionValue, controlValue );
			} else if ( _.isArray( controlValue ) && ! _.isEmpty( controlValue ) ) {
				isContains = _.contains( controlValue, conditionValue );
			} else {
				isContains = _.isEqual( conditionValue, controlValue );
			}

			return isNegativeCondition ? isContains : ! isContains;
		} );

		return _.isEmpty( hasFields );
	},

	cloneObject: function( object ) {
		elementorCommon.helpers.deprecatedMethod( 'elementor.helpers.cloneObject', '2.3.0', 'elementorCommon.helpers.cloneObject' );

		return elementorCommon.helpers.cloneObject( object );
	},

	firstLetterUppercase: function( string ) {
		elementorCommon.helpers.deprecatedMethod( 'elementor.helpers.firstLetterUppercase', '2.3.0', 'elementorCommon.helpers.firstLetterUppercase' );

		return elementorCommon.helpers.firstLetterUppercase( string );
	},

	disableElementEvents: function( $element ) {
		$element.each( function() {
			var currentPointerEvents = this.style.pointerEvents;

			if ( 'none' === currentPointerEvents ) {
				return;
			}

			jQuery( this )
				.data( 'backup-pointer-events', currentPointerEvents )
				.css( 'pointer-events', 'none' );
		} );
	},

	enableElementEvents: function( $element ) {
		$element.each( function() {
			var $this = jQuery( this ),
				backupPointerEvents = $this.data( 'backup-pointer-events' );

			if ( undefined === backupPointerEvents ) {
				return;
			}

			$this
				.removeData( 'backup-pointer-events' )
				.css( 'pointer-events', backupPointerEvents );
		} );
	},

	getColorPickerPaletteIndex: function( paletteKey ) {
		return [ '7', '8', '1', '5', '2', '3', '6', '4' ].indexOf( paletteKey );
	},

	wpColorPicker: function( $element, options ) {
		var self = this,
			colorPickerScheme = elementor.schemes.getScheme( 'color-picker' ),
			items = _.sortBy( colorPickerScheme.items, function( item ) {
				return self.getColorPickerPaletteIndex( item.key );
			} ),
			defaultOptions = {
				width: window.innerWidth >= 1440 ? 271 : 251,
				palettes: _.pluck( items, 'value' ),
			};

		if ( options ) {
			_.extend( defaultOptions, options );
		}

		return $element.wpColorPicker( defaultOptions );
	},

	isInViewport: function( element, html ) {
		var rect = element.getBoundingClientRect();
		html = html || document.documentElement;
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= ( window.innerHeight || html.clientHeight ) &&
			rect.right <= ( window.innerWidth || html.clientWidth )
		);
	},

	scrollToView: function( $element, timeout, $parent ) {
		if ( undefined === timeout ) {
			timeout = 500;
		}

		var $scrolled = $parent,
			$elementorFrontendWindow = elementorFrontend.getElements( '$window' );

		if ( ! $parent ) {
			$parent = $elementorFrontendWindow;

			$scrolled = elementor.$previewContents.find( 'html, body' );
		}

		setTimeout( function() {
			var parentHeight = $parent.height(),
				parentScrollTop = $parent.scrollTop(),
				elementTop = $parent === $elementorFrontendWindow ? $element.offset().top : $element[ 0 ].offsetTop,
				topToCheck = elementTop - parentScrollTop;

			if ( topToCheck > 0 && topToCheck < parentHeight ) {
				return;
			}

			var scrolling = elementTop - ( parentHeight / 2 );

			$scrolled.stop( true ).animate( { scrollTop: scrolling }, 1000 );
		}, timeout );
	},

	getElementInlineStyle: function( $element, properties ) {
		var style = {},
			elementStyle = $element[ 0 ].style;

		properties.forEach( function( property ) {
			style[ property ] = undefined !== elementStyle[ property ] ? elementStyle[ property ] : '';
		} );

		return style;
	},

	cssWithBackup: function( $element, backupState, rules ) {
		var cssBackup = this.getElementInlineStyle( $element, Object.keys( rules ) );

		$element
			.data( 'css-backup-' + backupState, cssBackup )
			.css( rules );
	},

	recoverCSSBackup: function( $element, backupState ) {
		var backupKey = 'css-backup-' + backupState;

		$element.css( $element.data( backupKey ) );

		$element.removeData( backupKey );
	},

	compareVersions: function( versionA, versionB, operator ) {
		var prepareVersion = function( version ) {
			version = version + '';

			return version.replace( /[^\d.]+/, '.-1.' );
		};

		versionA = prepareVersion( versionA );
		versionB = prepareVersion( versionB );

		if ( versionA === versionB ) {
			return ! operator || /^={2,3}$/.test( operator );
		}

		var versionAParts = versionA.split( '.' ).map( Number ),
			versionBParts = versionB.split( '.' ).map( Number ),
			longestVersionParts = Math.max( versionAParts.length, versionBParts.length );

		for ( var i = 0; i < longestVersionParts; i++ ) {
			var valueA = versionAParts[ i ] || 0,
				valueB = versionBParts[ i ] || 0;

			if ( valueA !== valueB ) {
				return this.conditions.compare( valueA, valueB, operator );
			}
		}
	},
};

module.exports = helpers;
