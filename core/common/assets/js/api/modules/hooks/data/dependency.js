import Base from './base';

export default class Dependency extends Base {
	register() {
		$e.hooks.registerDataDependency( this );
	}
}
