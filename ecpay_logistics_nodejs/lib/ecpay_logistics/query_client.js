/**
 * Created by ying.wu on 2017/6/21.
 */
const helper = require('./helper.js');
const verify = require('./verification.js');
const ECpayError = require('./error.js');
const iconv =require('iconv-lite');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

class ECpayQueryClient{
    constructor(){
        this.helper = new helper();
        // this.verify_query_api = new verify.QueryParamVerify();
    }

    expressmap(parameters){
        this._query_base_proc(parameters);
        delete parameters['PlatformID']
        let res = this._query_pos_proc(parameters, 'Map');
        return res;
    }

    updateshipmentinfo(parameters){
        this._query_base_proc(parameters);
        let res = this._query_pos_proc(parameters, 'UpdateShipmentInfo');
        return res;
    }

    querylogisticstradeinfo(parameters){
        this._query_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        let res = this._query_pos_proc(parameters, 'QueryLogisticsTradeInfo');
        return res;
    }

    printtradedocument(parameters){
        this._query_base_proc(parameters);
        let res = this._query_pos_proc(parameters, 'printTradeDocument');
        return res;
    }

    logisticscheckaccounts(parameters){
        this._query_base_proc(parameters);
        let res = this._query_pos_proc(parameters, 'LogisticsCheckAccounts');
        return res;
    }

    createtestdata(parameters){
        this._query_base_proc(parameters);
        let res = this._query_pos_proc(parameters, 'CreateTestData');
        return res;
    }

    _get_curr_unix_time(){
        return this.helper.get_curr_unixtime();
    }

    _query_base_proc(params){
        if (params.constructor === Object){
            // Process PlatformID & MerchantID by contractor setting
            if (this.helper.is_contractor()){
                params['PlatformID'] = this.helper.get_mercid();
                if (params['MerchantID'] === null){
                    throw new Error(`[MerchantID] should be specified when you're contractor-Platform.`);
                }
            } else {
                params['PlatformID'] = '';
                params['MerchantID'] = this.helper.get_mercid();
            }
        } else {
            throw new ECpayError.ECpayInvalidParam(`Received parameter object must be a Object.`);
        }
    }

    _query_pos_proc(params, apiname, big5_trans=false){
        let verify_query_api = new verify.QueryParamVerify(apiname);
        if (apiname === 'UpdateShipmentInfo'){
            verify_query_api.verify_updateshipmentinfo_param(params);
        } else {
            verify_query_api.verify_query_param(params);
        }
        // encode special param
        let sp_param = verify_query_api.get_special_encode_param('Create');
        this.helper.encode_special_param(params, sp_param);

        // Insert chkmacval
        let chkmac = this.helper.gen_chk_mac_value(params, 0);
        params['CheckMacValue'] = chkmac;
        console.log(params);

        // gen post html
        let api_url = verify_query_api.get_svc_url(apiname, this.helper.get_op_mode());
        // post from server
        if (apiname === 'Map' || apiname === 'printTradeDocument'){
            var resp = this.helper.gen_html_post_form(api_url, '_form_map', params);
            // return post response
            return resp;
        } else {
            var resp = this.helper.http_request('POST', api_url, params);
            // return post response
            return new Promise((resolve, reject) => {
                resp.then(function (result) {
                    if (big5_trans) {
                        return resolve(iconv.decode(Buffer.concat(result), 'big5'));
                    } else {
                        return resolve(iconv.decode(Buffer.concat(result), 'utf-8'));
                    }
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }
}
module.exports = ECpayQueryClient;