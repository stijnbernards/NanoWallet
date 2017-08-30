import Network from '../utils/Network';
import convert from '../utils/convert';
import KeyPair from '../utils/KeyPair';
import CryptoHelpers from '../utils/CryptoHelpers';
import Serialization from '../utils/Serialization';
import helpers from '../utils/helpers';
import Address from '../utils/Address';
import TransactionTypes from '../utils/TransactionTypes';

class Coupons {

    /**
     * Initialize services and properties
     *
     * @param {service} Wallet - The Wallet service
     * @param {service} $http - The angular $http service
     * @param {service} DataBridge - The DataBridge service
     * @param {service} NetworkRequests - The NetworkRequests service
     * @param {service} Transactions - Transactions service
     */
    constructor(Wallet, $http, DataBridge, NetworkRequests, Transactions, nemUtils) {
        'ngInject';

        /***
         * Declare services
         */
        this._Wallet = Wallet
        this._$http = $http;
        this._DataBridge = DataBridge;
        this._NetworkRequests = NetworkRequests;
        this._Transactions = Transactions;
        this._nemUtils = nemUtils;

        this.couponFee = 10;
    }

    createCoupon(tx, common) {
        let message = JSON.stringify(tx.coupon);

        return this._nemUtils.sendMessage(tx.recipient, message, common);
    }
}

export default Coupons;
