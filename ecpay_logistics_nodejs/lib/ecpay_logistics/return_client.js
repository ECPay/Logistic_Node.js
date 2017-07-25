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

class ECpayReturnClient{
    constructor(){
        this.helper = new helper();
        // this.verify_return_api = new verify.ActParamVerify();
    }

    returnhome(parameters){
        this._return_base_proc(parameters);
        let res = this._return_pos_proc(parameters, 'ReturnHome');
        return res;
    }

    returncvs(parameters){
        this._return_base_proc(parameters);
        let res = this._return_pos_proc(parameters, 'ReturnCVS');
        return res;
    }

    returnhilifecvs(parameters){
        this._return_base_proc(parameters);
        let res = this._return_pos_proc(parameters, 'ReturnHiLifeCVS');
        return res;
    }

    returnunimartcvs(parameters){
        this._return_base_proc(parameters);
        let res = this._return_pos_proc(parameters, 'ReturnUniMartCVS');
        return res;
    }

    _get_curr_unix_time(){
        return this.helper.get_curr_unixtime();
    }

    _return_base_proc(params){
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

    _return_pos_proc(params, apiname){
        let verify_return_api = new verify.ReturnParamVerify(apiname);
        if (apiname === 'ReturnHome'){
            verify_return_api.verify_returnhome_param(params);
        } else if (apiname === 'ReturnCVS'){
            verify_return_api.verify_returncvs_param(params);
        } else if (apiname === 'ReturnHiLifeCVS'){
            verify_return_api.verify_returnhilifecvs_param(params);
        } else if (apiname === 'ReturnUniMartCVS'){
            verify_return_api.verify_returnunimartcvs_param(params);
        }
        // encode special param
        let sp_param = verify_return_api.get_special_encode_param(apiname);
        this.helper.encode_special_param(params, sp_param);

        // Insert chkmacval
        // console.log(params);
        let chkmac = this.helper.gen_chk_mac_value(params, 0);
        params['CheckMacValue'] = chkmac;

        // gen post html
        let api_url = verify_return_api.get_svc_url(apiname, this.helper.get_op_mode());
        //post from server
        let resp = this.helper.http_request('POST', api_url, params);
        // return post response
        return new Promise((resolve, reject) => {
            resp.then(function (result) {
                return resolve(iconv.decode(Buffer.concat(result), 'utf-8'));
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}
module.exports = ECpayReturnClient;