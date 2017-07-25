/**
 * Created by ying.wu on 2017/6/27.
 */
const ecpay_logistics = require('../lib/ecpay_logistics.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	AllPayLogisticsID:"", // 請帶數字, ex: f0a0d7e9fae1bb72bc93, 為create時所產生的
	ServerReplyURL:"http://192.168.0.1/ReceiverServerReply", // 物流狀況會通知到此URL
	GoodsName:"",
	GoodsAmount:"100",
	CollectionAmount:"",
	ServiceType:"4",
	SenderName:"綠界科技",
	SenderPhone:"",
	Remark:"",
	PlatformID:""

};

let create = new ecpay_logistics();
let res = create.return_client.returnhilifecvs(parameters = base_param);
if (typeof res === 'string'){
    console.log(res);
} else {
    res.then(function (result) {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });
}