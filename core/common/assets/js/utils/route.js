import Commands from './commands';

export default class extends Commands {
	constructor( ...args ) {
		super( ...args );

		this.savedStates = {};
	}

	refreshContainer( container ) {
		const currentRoute = this.getCurrent( container ),
			currentArgs = this.getCurrentArgs( container );

		this.clearCurrent( container );

		this.to( currentRoute, currentArgs );
	}

	clearCurrent( container ) {
		const route = this.current[ container ];

		if ( ! route ) {
			return;
		}

		delete this.current[ container ];
		delete this.currentArgs[ container ];

		this.getComponent( route ).onCloseRoute();
	}

	saveState( container ) {
		this.savedStates[ container ] = {
			route: this.current[ container ],
			args: this.currentArgs[ container ],
		};

		return this;
	}

	restoreState( container ) {
		if ( ! this.savedStates[ container ] ) {
			return false;
		}

		this.to( this.savedStates[ container ].route, this.savedStates[ container ].args );

		return true;
	}

	beforeRun( route, args ) {
		if ( ! super.beforeRun( route, args ) ) {
			return false;
		}

		if ( this.is( route, args ) ) {
			return false;
		}

		const component = this.getComponent( route );

		const container = component.getRootContainer();

		if ( this.current[ container ] ) {
			this.getComponent( this.current[ container ] ).onCloseRoute();
		}

		if ( ! component.isOpen ) {
			component.isOpen = component.open();
		}

		return component.isOpen;
	}

	to( route, args ) {
		this.run( route, args );
	}

	// Don't use the event object.
	runShortcut( command ) {
		this.to( command );
	}

	// Don't clear current route.
	afterRun( route, args ) {
		this.getComponent( route ).onRoute( args );
	}

	is( route, args = {} ) {
		if ( ! super.is( route ) ) {
			return false;
		}

		const container = this.getComponent( route ).getRootContainer();

		return _.isEqual( args, this.currentArgs[ container ] );
	}

	isPartOf( route ) {
		const component = elementorCommon.components.get( route );

		if ( component ) {
			return component.isActive();
		}

		/**
		 * Check against current command hierarchically.
		 * For example `is( 'panel' )` will be true for `panel/elements`
		 * `is( 'panel/editor' )` will be true for `panel/editor/style`
		 */
		const parts = route.split( '/' ),
			container = parts[ 0 ],
			toCheck = [],
			currentParts = this.current[ container ] ? this.current[ container ].split( '/' ) : [];

		let match = false;

		currentParts.forEach( ( part ) => {
			toCheck.push( part );
			if ( toCheck.join( '/' ) === route ) {
				match = true;
			}
		} );

		return match;
	}

	error( message ) {
		throw Error( 'Route: ' + message );
	}
}
