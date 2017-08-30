import angular from 'angular';

/**
 * View Coupons module
 */
//Create the module where our functionality can attach to
let viewCouponsModule = angular.module('app.couponsView', []);

// Include our UI-Router config settings
import ViewCouponsConfig from './view/view.config';
viewCouponsModule.config(ViewCouponsConfig);

// Controllers
import ViewCouponsCtrl from './view/view.controller';
viewCouponsModule.controller('ViewCouponsCtrl', ViewCouponsCtrl);

/**
* Create coupon module
*/
// Create the module where our functionality can attach to
let createCouponsModule = angular.module('app.couponsCreate', []);

// Include our UI-Router config settings
import CreateCouponsConfig from './create/create.config';
createCouponsModule.config(CreateCouponsConfig);

// Controllers
import CreateCouponsCtrl from './create/create.controller';
createCouponsModule.controller('CreateCouponsCtrl', CreateCouponsCtrl);

export default viewCouponsModule;

