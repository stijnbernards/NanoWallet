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
        this._Wallet = Wallet;
        this._$http = $http;
        this._DataBridge = DataBridge;
        this._NetworkRequests = NetworkRequests;
        this._Transactions = Transactions;
        this._nemUtils = nemUtils;

        this.couponFee = 10;
        this.couponCreateNamespace = 'couponCreate:';
        this.couponOwnedNamespace = 'coupon:';
        this.couponSendNamespace = 'sendCoupon:';
    }

    createCoupon(tx, common) {
        let message = angular.toJson(tx.coupon);

        return this._nemUtils.sendMessage(tx.recipient, this.couponCreateNamespace + message, common);
    }

    sendCoupon(coupon, recipient, common) {
        return this._nemUtils.sendMessage(recipient, this.couponOwnedNamespace + angular.toJson(coupon), common);
    }

    getAccountCoupons(address, withSend = false) {
        return this._nemUtils.getTransactionsWithString(address, this.couponOwnedNamespace).then((transactions) => {
            return this._nemUtils.getTransactionsWithString(address, this.couponSendNamespace).then((sendCoupons) => {
                let parsedCoupons = this.transactionsToCouponData(transactions);
                for (let sendCoupon of this.transactionsToCouponData(sendCoupons)) {
                    for (let [index, coupon] of parsedCoupons.entries()) {

                        if (sendCoupon.creator == coupon.creator &&
                            sendCoupon.name == coupon.name &&
                            sendCoupon.type == coupon.type &&
                            sendCoupon.amount == coupon.amount) {

                            if (withSend) {
                                parsedCoupons[index].beenSend = true;
                            } else {

                                //Here
                                parsedCoupons.splice(index, 1);
                            }
                        }
                    }
                }

                return parsedCoupons;
            });
        }).catch((e) => {
            throw e;
        });
    }

    getAccountCreatedCoupons(address) {
        return this._nemUtils.getTransactionsWithString(address, this.couponCreateNamespace).then((transactions) => {

            return this.transactionsToCouponData(transactions);
        }).catch((e) => {
            throw e;
        });
    }

    transactionsToCouponData(transactions) {
        let coupons = [];

        for (let transaction of transactions) {
            let couponData = transaction.transaction.message.replace(this.couponOwnedNamespace, '');
            couponData = couponData.replace(this.couponSendNamespace, '');
            couponData = couponData.replace(this.couponCreateNamespace, '');

            couponData = JSON.parse(couponData);

            if (couponData.creator == null) {
                couponData.creator = Address.toAddress(transaction.transaction.signer, this._Wallet.network);
            }

            coupons.push(
                couponData
            );
        }

        return coupons;
    }
}

export default Coupons;
