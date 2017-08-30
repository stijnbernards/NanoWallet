import Sinks from '../../../utils/sinks';
import CryptoHelpers from '../../../utils/CryptoHelpers';

class CreateCouponsCtrl {
    constructor($location, Wallet, Alert, Transactions, DataBridge, $filter, $localStorage, Coupons, nemUtils) {
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
        // Nem Utils
        this._nemUtils = nemUtils;

        // If no wallet show alert and redirect to home
        if (!this._Wallet.current) {
            this._Alert.noWalletLoaded();
            this._location.path('/');
            return;
        }

        //Form Settings
        this.charsLeft = 1024;
        this.fee = 0.1;

        /**
         *  Default provision Coupon transaction properties
         */
        this.formData = {};
        this.formData.fee = 1;
        this.formData.coupon = {};

        this.formData.recipient = Sinks.sinks.coupons[this._Wallet.network].toUpperCase().replace(/-/g, '');

        // Multisig data
        this.formData.innerFee = 0;
        this.formData.isMultisig = false;
        this.formData.multisigAccount = this._DataBridge.accountData.meta.cosignatoryOf.length == 0 ? '' : this._DataBridge.accountData.meta.cosignatoryOf[0];

        this.mosaicsMetaData = this._DataBridge.mosaicDefinitionMetaDataPair;

        this.contacts = [];

        if(undefined !== this._storage.contacts && undefined !== this._storage.contacts[this._Wallet.currentAccount.address] && this._storage.contacts[this._Wallet.currentAccount.address].length) {
            this.contacts = this._storage.contacts[this._Wallet.currentAccount.address]
        }

        // Needed to prevent user to click twice on send when already processing
        this.okPressed = false;

        // Object to contain our password & private key data.
        this.common = {
            'password': '',
            'privateKey': '',
        };

        // Default current address (used in view to get coupons created by account)
        this.currentAccount = this._Wallet.currentAccount.address;
    }

    updateFees() {
        let total = 0;

        let data = JSON.stringify(this.formData.coupon);

        total += this._nemUtils.getMessageFee(data);

        this.formData.fee = total;
    }

    send(){
        this.okPressed = true;

        if (this._DataBridge.accountData.account.balance < this.fee) {
            // This account has insufficient funds to perform the operation
            this._Alert.errorInsuficientBalance();
            this.creating = false;
            return;
        }

        // Decrypt/generate private key and check it. Returned private key is contained into this.common
        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, false)) {
            this._Alert.invalidPassword();
            this.creating = false;
            return;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
            this._Alert.invalidPassword();
            this.creating = false;
            return;
        }

        return this._Coupons.createCoupon(this.formData, this.common);
    }
}

export default CreateCouponsCtrl;