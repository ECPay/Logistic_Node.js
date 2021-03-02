/**
 * Created by ying.wu on 2017/6/21.
 */
const helper = require('./helper.js');
const verify = require('./verification.js');
const ECpayError = require('./error.js');
const iconv = require('iconv-lite');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

class ECpayC2CProcessClient{
    constructor(){
        this.helper = new helper();
    }

    updatestoreinfo(parameters){
        this._c2c_process_base_proc(parameters);
        let res = this._c2c_process_pos_proc(parameters, 'UpdateStoreInfo');
        return res;
    }

    cancelc2corder(parameters){
        this._c2c_process_base_proc(parameters);
        let res = this._c2c_process_pos_proc(parameters, 'CancelC2COrder');
        return res;
    }

    printunimartc2corderinfo(parameters){
        this._c2c_process_base_proc(parameters);
        let res = this._c2c_process_pos_proc(parameters, 'PrintUniMartC2COrderInfo');
        return res;
    }

    printfamic2corderinfo(parameters){
        this._c2c_process_base_proc(parameters);
        let res = this._c2c_process_pos_proc(parameters, 'PrintFAMIC2COrderInfo');
        return res;
    }

    printhilifec2corderinfo(parameters){
        this._c2c_process_base_proc(parameters);
        let res = this._c2c_process_pos_proc(parameters, 'PrintHILIFEC2COrderInfo');
        return res;
    }
    printokmartc2corderinfo(parameters){
        this._c2c_process_base_proc(parameters);
        let res = this._c2c_process_pos_proc(parameters, 'PrintOKMARTC2COrderInfo');
        return res;
    }

    _get_curr_unix_time(){
        return this.helper.get_curr_unixtime();
    }

    _c2c_process_base_proc(params){
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

    _c2c_process_pos_proc(params, apiname){
        let verify_c2c_process_api = new verify.C2CProcessParamVerify(apiname);
        verify_c2c_process_api.verify_c2c_process_param(params);

        // encode special param
        let sp_param = verify_c2c_process_api.get_special_encode_param(apiname);
        this.helper.encode_special_param(params, sp_param);

        // Insert chkmacval
        // console.log(params);
        let chkmac = this.helper.gen_chk_mac_value(params, 0);
        params['CheckMacValue'] = chkmac;

        console.log(params);

        // gen post html
        let api_url = verify_c2c_process_api.get_svc_url(apiname, this.helper.get_op_mode());
        // post from server
        if (apiname === 'UpdateStoreInfo' || apiname === 'CancelC2COrder'){
            var resp = this.helper.http_request('POST', api_url, params);
            // return post response
            return new Promise((resolve, reject) => {
                resp.then(function (result) {
                    return resolve(iconv.decode(Buffer.concat(result), 'utf-8'));
                }).catch(function (err) {
                    reject(err);
                });
            });
        } else {
            var resp = this.helper.gen_html_post_form(api_url, '_form_c2c', params);
            // return post response
            return resp;
        }
    }
}
module.exports = ECpayC2CProcessClient;