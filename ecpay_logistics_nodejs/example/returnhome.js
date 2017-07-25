/**
 * Created by ying.wu on 2017/6/27.
 */
const ecpay_logistics = require('../lib/ecpay_logistics.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	AllPayLogisticsID:"", // 請帶數字, ex: f0a0d7e9fae1bb72bc93, 為create時所產生的
	LogisticsSubType:"TCAT",
	ServerReplyURL:"http://192.168.0.1/ReceiverServerReply", // 物流狀況會通知到此URL
	SenderName:"綠界科技",
	SenderPhone:"",
	SenderCellPhone:"0912345678",
	SenderZipCode:"115",
	SenderAddress:"台北市南港區三重路19-1號6-1樓",
	ReceiverName:"綠界科技",
	ReceiverPhone:"",
	ReceiverCellPhone:"0912345678",
	ReceiverZipCode:"115",
	ReceiverAddress:"台北市南港區三重路19-1號6-1樓",
	GoodsAmount:"100",
	GoodsName:"",
	Temperature:"0001",
	Distance:"00",
	Specification:"0001",
	ScheduledPickupTime:"4",
	ScheduledDeliveryTime:"4",
	ScheduledDeliveryDate:"",
	PackageCount:"",
	Remark:"",
	PlatformID:""

};

let create = new ecpay_logistics();
let res = create.return_client.returnhome(parameters = base_param);
if (typeof res === 'string'){
    console.log(res);
} else {
    res.then(function (result) {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });
}