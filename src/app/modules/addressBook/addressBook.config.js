function CouponsConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.coupons', {
            url: '/coupons',
            controller: 'CouponsCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/coupons/coupons.html',
            title: 'Coupons'
        });

};

export default CouponsConfig;