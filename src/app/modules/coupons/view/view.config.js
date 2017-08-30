function ViewCouponsConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.couponsView', {
            url: '/coupons/view',
            controller: 'ViewCouponsCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/coupons/view/view.html',
            title: 'View your coupons'
        });

};

export default ViewCouponsConfig;