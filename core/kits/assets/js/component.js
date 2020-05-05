import * as hooks from './hooks';
import * as commands from './commands/';

export default class extends $e.modules.ComponentBase {
	pages = {};

	getNamespace() {
		return 'panel/global';
	}

	defaultTabs() {
		return {
			'site-identity': {
				title: elementor.translate( 'Site Identity' ),
				icon: 'eicon-site-identity',
				helpUrl: 'http://go.elementor.com/panel-site-identity',
			},
			// 'colors-and-typography': {
			// 	title: elementor.translate( 'Colors & Typography' ),
			// 	icon: 'eicon-colors-typography',
			// 	helpUrl: 'http://go.elementor.com/panel-colors-and-typography',
			// },
			lightbox: {
				title: elementor.translate( 'Lightbox' ),
				icon: 'eicon-lightbox-expand',
				helpUrl: 'http://go.elementor.com/panel-lightbox',
			},
			'layout-settings': {
				title: elementor.translate( 'Layout Settings' ),
				icon: 'eicon-layout-settings',
				helpUrl: 'http://go.elementor.com/panel-layout-settings',
			},
			'theme-style': {
				title: elementor.translate( 'Theme Style' ),
				icon: 'eicon-theme-style',
				helpUrl: 'http://go.elementor.com/panel-theme-style',
			},
		};
	}

	defaultRoutes() {
		return {
			menu: () => {
				elementor.getPanelView().setPage( 'kit_menu' );
			},
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			back: {
				keys: 'esc',
				scopes: [ 'panel' ],
				dependency: () => {
					return elementor.documents.isCurrent( elementor.config.kit_id ) && ! jQuery( '.dialog-widget:visible' ).length;
				},
			},
		};
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	async open() {
		// Don't run if it's on opening process.
		if ( this.isOpening ) {
			return false;
		}

		this.isOpening = true;

		let isOpen = null;

		await $e.run( 'panel/global/open' )
			.then( () => {
				// Set true only if the document has been opened.
				isOpen = true;
			} );

		this.isOpening = false;
		return isOpen;
	}

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
