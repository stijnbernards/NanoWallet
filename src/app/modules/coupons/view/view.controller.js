import Sinks from '../../../utils/sinks';

class ViewCouponsCtrl {
    constructor($location, Wallet, Alert, Transactions, DataBridge, $filter, $localStorage, Coupons) {
        'ngInject';

        // Alert service
        this._Alert = Alert;
        // $location to redirect
        this._location = $location;
        // Wallet service
        this._Wallet = Wallet;
        // Transactions service
        this._Transactions = Transactions;
        // DataBridge service
        this._DataBridge = DataBridge;
        // Filters
        this._$filter = $filter;
        // Local storage
        this._storage = $localStorage;
        // Coupons
        this._Coupons = Coupons;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        /**
         *  Default provision Coupon transaction properties
         */
        this.formData = {};
        this.formData.fee = 0;
        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];

        this.loadingCoupons = false;

        this.contacts = [];

        if(undefined !== this._storage.contacts && undefined !== this._storage.contacts[this._Wallet.currentAccount.address] && this._storage.contacts[this._Wallet.currentAccount.address].length) {
            this.contacts = this._storage.contacts[this._Wallet.currentAccount.address]
        }

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': '',
        };

        // Default current address (used in view to get coupons created by account)
        this.currentAccount = this._Wallet.currentAccount.address;
        this.activeTab = 1;
        this.currentPage = 0;
        this.pageSize = 5;

        this.coupons = this.getMyCoupons();
    }


    getMyCoupons() {
        this.loadingCoupons = true;

        return this._Coupons.getAccountCoupons(this.currentAccount).then((data) => {

            this.coupons = data;
            this.loadingCoupons = false;

        }).catch((e) => {
            this.loadingCoupons = false;
            throw e;
        });
    }

    getCreatedCoupons() {
        this.loadingCoupons = true;

        return this._Coupons.getAccountCreatedCoupons(this.currentAccount).then((data) => {

            this.coupons = data;
            this.loadingCoupons = false;

        }).catch((e) => {
            this.loadingCoupons = false;
            throw e;
        });
    }

    refreshCoupons() {
        if(this.activeTab === 1){
            this.getMyCoupons();
        }else if(this.activeTab === 2){
            this.getCreatedCoupons();
        }
    }

    showMine() {
        this.activeTab = 1;

        this.refreshCoupons();
    }

    showCreated(){
        this.activeTab = 2;

        this.refreshCoupons();
    }
}

export default ViewCouponsCtrl;