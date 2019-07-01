/* global ElementorConfig */

import editorBase from './editor-base';
//_.noConflict();
const App = editorBase.extend( {
	onStart: function() {
		NProgress.start();
		NProgress.inc( 0.2 );

		editorBase.prototype.onStart.apply( this, arguments );
	},
} );

window.elementor = new App();

if ( -1 === location.href.search( 'ELEMENTOR_TESTS=1' ) ) {
	elementor.start();
}

module.exports = elementor;
