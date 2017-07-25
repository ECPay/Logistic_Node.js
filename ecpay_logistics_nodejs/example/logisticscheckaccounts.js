/**
 * Created by ying.wu on 2017/6/27.
 */
const ecpay_logistics = require('../lib/ecpay_logistics.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	RtnMerchantTradeNo:"", // 請帶13碼uid, ex: 1531548185111, 為ReturnCVS時所得到的退貨訂單編號
	PlatformID:""
};

let create = new ecpay_logistics();
let res = create.query_client.logisticscheckaccounts(parameters = base_param);
if (typeof res === 'string'){
    console.log(res);
} else {
    res.then(function (result) {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });
}