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

class ECpayCreateClient{
    constructor(){
        this.helper = new helper();
    }

    create(parameters){
        this._create_base_proc(parameters);
        let mode = true;
        if (parameters['ClientReplyURL'] !== ''){
            mode = false;
        }
        let res = this._create_pos_proc(parameters, mode);
        return res;
    }

    _get_curr_unix_time(){
        return this.helper.get_curr_unixtime();
    }

    _create_base_proc(params){
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

    _create_pos_proc(params, server_post=true){
        let verify_create_api = new verify.CreateParamVerify('Create');
        verify_create_api.verify_create_param(params);

        // encode special param
        let sp_param = verify_create_api.get_special_encode_param('Create');
        this.helper.encode_special_param(params, sp_param);

        // Insert chkmacval
        // console.log(params);
        let chkmac = this.helper.gen_chk_mac_value(params, 0);
        params['CheckMacValue'] = chkmac;

        console.log(params);

        // gen post html
        let api_url = verify_create_api.get_svc_url('Create', this.helper.get_op_mode());
        // post from server
        if (server_post){
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
            var resp = this.helper.gen_html_post_form(api_url, '_form_create', params);
            // return post response
            return resp;
        }
    }
}
module.exports = ECpayCreateClient;