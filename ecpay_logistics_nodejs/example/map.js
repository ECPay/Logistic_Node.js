/**
 * Created by ying.wu on 2017/6/27.
 */
 // 作廢發票
const ecpay_logistics = require('../lib/ecpay_logistics.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	MerchantTradeNo:"", // 請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
	ServerReplyURL:"http://192.168.0.1/ReceiverServerReply", // 物流狀況會通知到此URL
	LogisticsType:"CVS",
	LogisticsSubType:"OKMARTC2C",
	IsCollection:"N",
	ExtraData:"",
	Device:""
};

let create = new ecpay_logistics();
let res = create.query_client.expressmap(parameters = base_param);
if (typeof res === 'string'){
    console.log(res);
} else {
    res.then(function (result) {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });
}