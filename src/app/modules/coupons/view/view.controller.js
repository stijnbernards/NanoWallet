import Sinks from '../../../utils/sinks';
import Address from '../../../utils/Address';
import CryptoHelpers from '../../../utils/CryptoHelpers';
import helpers from '../../../utils/helpers';

class ViewCouponsCtrl {
    constructor($location, Wallet, Alert, Transactions, DataBridge, $filter, $localStorage, Coupons, NetworkRequests) {
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

        this._NetworkRequests = NetworkRequests;

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
        this.showDistribute = false;
        this.recipientAddress = "";
        this.distributeAddresses = [];
        this.distributionCoupon = {};
        this.recipientAddressPublicKey = '';
        this.recipientAddressData = {};
        this.distributeFee = 0;

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

        return this._Coupons.getAccountCoupons(this.currentAccount, true).then((data) => {

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

    showCreated() {
        this.activeTab = 2;

        this.refreshCoupons();
    }

    distributeShow(coupon) {
        this.distributionCoupon = coupon;

        this.showDistribute = true;
    }

    processRecipientInput(callback = null) {
        let recipientAddress = this.recipientAddress.toUpperCase().replace(/-/g, '');

        if (Address.isFromNetwork(recipientAddress, this._Wallet.network)) {
            this.getRecipientData(recipientAddress, callback);
        } else {
            // Error
            this._Alert.invalidAddressForNetwork(recipientAddress, this._Wallet.network);
            return;
        }
    }

    getRecipientData(address, callback) {
        let that = this;

        return this._NetworkRequests.getAccountData(helpers.getHostname(this._Wallet.node), address).then((data) => {
                // Store recipient public key (needed to encrypt messages)
                that.recipientAddressPublicKey = data.account.publicKey;
                //console.log(this.formData.recipientPubKey)
                // Set the address to send to
                that.recipientAddressData = {
                    address: address,
                    display: that.recipientAddress
                };

                if(callback != null) {
                    callback();
                }
            },
            (err) => {
                this._Alert.getAccountDataError(err.data.message);
            }
        );
    }

    addAddress() {
        let that = this;

        this.processRecipientInput(function(){
            that.distributeAddresses.push(that.recipientAddressData);

            that.calculateDistributeFee();
        });
    }

    removeAddress(index) {
        this.distributeAddresses.splice(index, 1);

        this.calculateDistributeFee();
    }

    calculateDistributeFee() {
        let totalFee = 0;

        for(let distributeAddress of this.distributeAddresses) {

            let transactionData = {};

            transactionData.message = this._Coupons.couponOwnedNamespace + angular.toJson(this.distributionCoupon);
            transactionData.recipient = distributeAddress.address;
            transactionData.amount = 0;

            let entity = this._Transactions.prepareTransfer(this.common, transactionData);

            totalFee += entity.fee;
        }

        this.distributeFee = totalFee;
    }

    distributeCoupons() {
        this.distributionCoupon.creator = this.currentAccount;

        if (!CryptoHelpers.passwordToPrivatekeyClear(this.common, this._Wallet.currentAccount, this._Wallet.algo, true)) {
            this._Alert.invalidPassword();

            return;
        } else if (!CryptoHelpers.checkAddress(this.common.privateKey, this._Wallet.network, this._Wallet.currentAccount.address)) {
            this._Alert.invalidPassword();

            return;
        }

        this.sendCoupons(0);
    }

    sendCoupons(iter) {
        let that = this;

        this._Coupons.sendCoupon(this.distributionCoupon, this.distributeAddresses[iter].address, this.common).then(() =>{
            if(iter++ == this.distributeAddresses.length){
                return;
            }

            setTimeout(function(){
                that.sendCoupons(iter++);
            }, 500);
        });
    }
}

export default ViewCouponsCtrl;