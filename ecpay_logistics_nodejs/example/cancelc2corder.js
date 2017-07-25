/**
 * Created by ying.wu on 2017/6/27.
 */
const ecpay_logistics = require('../lib/ecpay_logistics.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	AllPayLogisticsID:"", // 請帶20碼uid, ex: 84851681561813188188, 為Create時所得到的物流交易編號
	CVSPaymentNo:"", // 請帶15碼uid, ex: 848516815618131, 為Create時所得到的寄貨編號
	CVSValidationNo:"", // 請帶10碼uid, ex: 8485168156, 為Create時所得到的驗證碼
	PlatformID:""
};

let create = new ecpay_logistics();
let res = create.c2c_process_client.cancelc2corder(parameters = base_param);
if (typeof res === 'string'){
    console.log(res);
} else {
    res.then(function (result) {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });
}