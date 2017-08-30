function CreateCouponsConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.couponsCreate', {
            url: '/coupons/create',
            controller: 'CreateCouponsCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/coupons/create/create.html',
            title: 'Create your coupons'
        });

};

export default CreateCouponsConfig;