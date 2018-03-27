/**
 * Created by ying.wu on 2017/6/12.
 */
const ECpayError = require('./error.js');
const fs = require('fs');
const et = require('elementtree');

class LogisticsVerifyBase{
    constructor(){
        this.param_xml_file = fs.readFileSync(__dirname + '/../../lib/ecpay_logistics/ECpayLogistics.xml').toString();
        this.param_xml = et.parse(this.param_xml_file);
    }

    get_svc_url(apiname, mode){
        let url = this.param_xml.findtext(`./${apiname}/ServiceAddress/url[@type=\"${mode}\"]`);
        return url;
    }

    get_special_encode_param(apiname){
        let ret = [];
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@urlencode=\"1\"]`);
        // console.log(node);
        node.forEach(function (elem) {
            // console.log(elem.attrib.name);
            ret.push(elem.attrib.name);
        });
        return ret;
    }

    get_basic_params(apiname){
        let basic_param = [];
        this.param_xml.findall(`./${apiname}/Parameters/param[@require=\"1\"]`).forEach(function (elem) {
           // console.log(elem.attrib.name);
           basic_param.push(elem.attrib.name);
        });
        return basic_param;
    }

    get_cond_param(apiname){
        let aio_sw_param = [];
        let conditional_param = {};
        this.param_xml.findall(`./${apiname}/Config/switchparam/n`).forEach(function (elem) {
           // console.log(elem.text);
           aio_sw_param.push(elem.text);
        });
        let param_xml = this.param_xml;
        aio_sw_param.forEach(function (pname) {
            let opt_param = {};
            let node = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${pname}\"]/condparam`);
            node.forEach(function (elem) {
               let opt = elem.attrib.owner;
               let params = [];
               param_xml.findall(`./${apiname}/Parameters//param[@name=\"${pname}\"]//condparam[@owner=\"${opt}\"]/param[@require="1"]`).forEach(function (pa) {
                  params.push(pa.attrib.name);
               });
               opt_param[opt] = params;
            });
            conditional_param[pname] = opt_param;
        });
        return conditional_param;
    }

    get_param_type(apiname){
        let param_type ={};
        this.param_xml.findall(`./${apiname}/Parameters//param`).forEach(function (elem) {
           param_type[elem.attrib.name] = elem.attrib.type;
        });
        return param_type;
    }

    get_opt_param_pattern(apiname){
        let pattern = {};
        let temp_arr = [];
        let param_xml = this.param_xml;
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"Opt\"]`);
        node.forEach(function (param_elem) {
            temp_arr.push(param_elem.attrib.name);
        });
        // console.log(temp_arr);
        temp_arr.forEach(function (opt_params) {
            // console.log(opt_params);
            let opt_elems = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//option`);
            // console.log(opt_elems);
            let opt = [];
            opt_elems.forEach(function (oe) {opt.push(oe.text);});
            // console.log(opt);
            pattern[opt_params] = opt;
        });
        if (apiname === 'AioCheckOut'){
            pattern['ChoosePayment'].splice(3, 13);
        }
        // console.log(pattern);
        return pattern;
    }

    get_int_param_pattern(apiname){
        let pattern = {};
        let temp_arr = [];
        let param_xml = this.param_xml;
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"Int\"]`);
        node.forEach(function (param_elem) {
            temp_arr.push(param_elem.attrib.name);
        });
        // console.log(temp_arr);
        temp_arr.forEach(function (opt_params) {
            // console.log(opt_params);
            let mode = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//mode`);
            let mx = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//maximum`);
            let mn = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//minimal`);
            // console.log(mode);
            let arr = [];
            mode.forEach(function (md) {arr.push(md.text);});
            mx.forEach(function (mx) {arr.push(mx.text);});
            mn.forEach(function (mn) {arr.push(mn.text);});
            // console.log(arr);
            pattern[opt_params] = arr;
        });
        if (apiname === 'AioCheckOut'){
            pattern['StoreExpireDate'].splice(1, 2);
            pattern['StoreExpireDate'].splice(2, 1);
        }
        // console.log(pattern);
        return pattern;
    }

    get_str_param_pattern(apiname){
        let pattern = {};
        let temp_arr = [];
        let param_xml = this.param_xml;
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"String\"]`);
        node.forEach(function (param_elem) {
            temp_arr.push(param_elem.attrib.name);
        });
        // console.log(temp_arr);
        temp_arr.forEach(function (opt_params) {
            // console.log(opt_params);
            let pat_elems = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//pattern`);
            let arr = [];
            pat_elems.forEach(function (pa) {arr.push(pa.text);});
            // console.log(arr);
            pattern[opt_params] = arr.toString();
        });
        if (apiname === 'AioCheckOut'){
            pattern['InvoiceMark'] = '';
            pattern['PaymentInfoURL'] = pattern['PaymentInfoURL'].slice(11,21);
            pattern['ClientRedirectURL'] = pattern['ClientRedirectURL'].slice(11,21);
            pattern['Desc_1'] = pattern['Desc_1'].slice(10,20);
            pattern['Desc_2'] = pattern['Desc_2'].slice(10,20);
            pattern['Desc_3'] = pattern['Desc_3'].slice(10,20);
            pattern['Desc_4'] = pattern['Desc_4'].slice(10,20);
        }
        // console.log(pattern);
        return pattern;
    }

    get_depopt_param_pattern(apiname){
        let pattern = {};
        let param_xml = this.param_xml;
        let p_name, parent_name;
        let k, get_opts;
        let k_opts = [];
        let sub_opts = {};
        let parent_n_opts = {};
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"DepOpt\"]`);
        node.forEach(function (param_elem) {
            p_name = param_elem.attrib.name;
            parent_name = param_elem.attrib.main;
        });
        k = this.param_xml.findall(`./${apiname}/Parameters//param[@name=\"${p_name}\"]//mainoption`);
        k.forEach(function (elem) {
           k_opts.push(elem.attrib.name);
        });
        k_opts.forEach(function (elem) {
            get_opts = param_xml.findall(`./${apiname}/Parameters//mainoption[@name=\"${elem}\"]//option`);
            let opt = [];
            get_opts.forEach(function (c) {
                opt.push(c.text);
                sub_opts[elem] = opt;
            });
        });
        // console.log(sub_opts);
        parent_n_opts[parent_name] = sub_opts;
        // console.log(parent_n_opts);
        pattern[p_name] = parent_n_opts;
        // console.log(pattern['ChooseSubPayment']['ChoosePayment']['BARCODE']);
        return pattern;
    }

    get_all_pattern(apiname){
        let res = {};
        res['Type_idx'] = this.get_param_type(apiname);
        res['Int'] = this.get_int_param_pattern(apiname);
        res['String'] = this.get_str_param_pattern(apiname);
        res['Opt'] = this.get_opt_param_pattern(apiname);
        res['DepOpt'] = this.get_depopt_param_pattern(apiname);
        return res;
    }

    verify_param_by_pattern(params, pattern){
        // console.log(params);
        // console.log(pattern);
        let type_index = pattern['Type_idx'];
        // console.log(type_index);
        Object.keys(params).forEach(function (p_name) {
           // console.log(p_name);
           let p_type = type_index[p_name];
           // console.log(p_type);
           let patt_container = pattern[p_type];
           // console.log(patt_container);
           switch (p_type) {
               case 'String':
                   let regex_patt = patt_container[p_name];
                   let mat = params[p_name].match(new RegExp(regex_patt));
                   if (p_name === 'LogisticsType'){
                    mat = params[p_name].match(new RegExp(/(CVS|Home)/));
                   }
                   if (mat === null){
                       throw new ECpayError.ECpayInvalidParam(`Wrong format of param ${p_name} or length exceeded.`);
                   }
                   break;
               case 'Opt':
                   let aval_opt = patt_container[p_name];
                   let mat_opt = aval_opt.includes(params[p_name]);
                   if (mat_opt === false){
                       throw new ECpayError.ECpayInvalidParam(`Unexpected option of param ${p_name} (${params[p_name]}). Available option: (${aval_opt}).`);
                   }
                   break;
               case 'Int':
                   let criteria = patt_container[p_name];
                   // console.log('criteria: '+ criteria);
                   let mode = criteria[0];
                   let max = parseInt(criteria[1]);
                   let min = parseInt(criteria[2]);
                   let val = parseInt(params[p_name]);
                   // console.log('mode: '+ mode);
                   // console.log('max: '+  max);
                   // console.log('min: '+  min);
                   // console.log('val: '+  val);
                   switch (mode){
                       case 'BETWEEN':
                           if (val < min || val > max){
                               throw new ECpayError.ECpayInvalidParam(`Value of ${p_name} should be between ${min} and ${max}.`);
                           }
                           break;
                       case 'GE':
                           if (val < min){
                               throw new ECpayError.ECpayInvalidParam(`Value of ${p_name} should be greater than or equal to ${min}.`);
                           }
                           break;
                       case 'LE':
                           if (val > max){
                               throw new ECpayError.ECpayInvalidParam(`Value of ${p_name} should be less than or equal to ${max}.`);
                           }
                           break;
                       case 'EXCLUDE':
                           if (val >= max && val <= max){
                               throw new ECpayError.ECpayInvalidParam(`Value of ${p_name} can NOT be between ${min} and ${max}..`);
                           }
                           break;
                       default:
                           throw new ECpayError.ECpayInvalidParam(`Unexpected integer verification mode for parameter ${p_name}: ${mode}.`);
                   }
                   break;
               case 'DepOpt':
                   let dep_opt = patt_container[p_name];
                   let parent_param = Object.keys(dep_opt)[0];
                   let all_dep_opt = dep_opt[parent_param];
                   let parent_val = params[parent_param];
                   let aval_dopt = all_dep_opt[parent_val];
                   if (aval_dopt === null && pattern['Opt'][parent_param].includes(parent_val) === false){
                       throw new ECpayError.ECpayInvalidParam(`Cannot find available option of [${p_name}] by related param [${parent_param}](Value: ${parent_val}.`);
                   } else if (aval_dopt.constructor === Array){
                       if (!aval_dopt.includes(params[p_name])){
                           throw new ECpayError.ECpayInvalidParam(`Unexpected option of param ${p_name} (${params[p_name]}). Available option: (${aval_dopt}).`);
                       }
                   }
                   break;
               default:
                   throw new Error(`Unexpected type (${p_type}) for parameter ${p_name}.`);
           }
        });
    }
}

class CreateParamVerify extends LogisticsVerifyBase{
    constructor(apiname){
        super();
        this.logi_basic_param = this.get_basic_params(apiname);
        this.logi_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_create_param(params){
        if (params.constructor === Object){
            // 所有參數預設要全帶
            Object.keys(params).forEach(function (keys) {
               if (params[keys] === null){
                   throw new ECpayError.ECpayInvalidParam(`Parameter value cannot be null.`);
               }
            });
            // 1. 比對欄位是否缺乏
            let basic_param = this.logi_basic_param
            if (params['LogisticsType'] === 'Home'){
              basic_param = basic_param.concat(this.logi_conditional_param['LogisticsType']['Home']).sort();
              console.log(basic_param);
            } else if (params['LogisticsType'] === 'CVS'){
              basic_param = basic_param.concat(this.logi_conditional_param['LogisticsType']['CVS']).sort();
              console.log(basic_param);
            } else {
              throw new ECpayError.ECpayInvalidParam(`[LogisticsType] can not  be ${params['LogisticsType']}`);
            }
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // [ServerReplyURL] 不能為空
            if (params['ServerReplyURL'] === ''){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[ServerReplyURL] can not be empty.`);
            }

            // 3. 因應物流類型不同所對應的欄位，做相關檢查
            // [LogisticsType]為Home
            if (params['LogisticsType'] === 'Home'){
              // [LogisticsType] is Home, LogisticsSubType must be 'TCAT' or 'ECAN'
              if (params['LogisticsSubType'] !== 'TCAT' && params['LogisticsSubType'] !== 'ECAN'){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[LogisticsSubType] cannot be ${params['LogisticsSubType']} when [LogisticsType] is Home.`);
              }
              // [LogisticsType] is Home, IsCollection can not be 'Y'
              if (params['IsCollection'] === 'Y'){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[IsCollection] can not be ${params['IsCollection']} when [LogisticsType] is Home.`);
              }
              // [LogisticsType] is Home, SenderPhone and SenderCellPhone cannot both be empty
              if (params['SenderPhone'] === '' && params['SenderCellPhone'] === ''){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderPhone] and [SenderCellPhone] can not both be empty when [LogisticsType] is Home.`);
              }
              // [LogisticsType] is Home, ReceiverPhone and ReceiverCellPhone can not both be empty
              if (params['ReceiverPhone'] === '' && params['ReceiverCellPhone'] === ''){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverPhone] and [ReceiverCellPhone] can not both be empty when [LogisticsType] is Home.`);
              }
              // [LogisticsType] is Home and [LogisticsSubType] is ECAN
              if (params['LogisticsSubType'] === 'ECAN'){
                // [LogisticsSubType] is ECAN, Temperature only can be 0001
                if (params['Temperature'] !== '0001'){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[Temperature] can not be ${params['Temperature']} when [LogisticsSubType] is ECAN.`);
                }
                // [LogisticsSubType] is ECAN, ScheduledDeliveryTime can not be '5:20~21'
                if (params['ScheduledDeliveryTime'] === '5'){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ScheduledDeliveryTime] can not be ${params['ScheduledDeliveryTime']} when [LogisticsSubType] is ECAN.`);
                }
                // [LogisticsSubType] is ECAN, PackageCount range is between 1 and 999
                if (parseInt(params["PackageCount"]) < 1 || parseInt(params['PackageCount']) > 999){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[PackageCount] of should be between 1 and 999 when [LogisticsSubType] is ECAN.`);
                }
              }
              // [LogisticsType] is Home and [LogisticsSubType] is TCAT
              else if (params['LogisticsSubType'] === 'TCAT'){
                // [LogisticsSubType] is TCAT, ScheduledDeliveryTime can not be '12:9~17', '13:9~12-17~20' and '23:13~20'
                if (parseInt(params['ScheduledDeliveryTime']) >= 5 && parseInt(params['ScheduledDeliveryTime']) <= 23){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ScheduledDeliveryTime] can not be ${params['ScheduledDeliveryTime']} when [LogisticsSubType] is TCAT.`);
                }
                // [LogisticsSubType] is TCAT, PackageCount is unuse argument
                if (params['PackageCount'] !== ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[PackageCount] must be empty when [LogisticsSubType] is TCAT.`);
                }
                // [LogisticsSubType] is TCAT, ScheduledPickupTime can not be empty
                if (params['ScheduledPickupTime'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ScheduledPickupTime] can not be empty when [LogisticsSubType] is TCAT.`);
                }
              }
              // [Temperature] is '0003', Specification can not be '0004:150cm'
              if (params['Temperature'] === '0003'){
                if (params['Specification'] === '0004'){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[Specification] can not be ${params['Specification']} when [Temperature] is 0003.`);
                }
              }
            } else if (params['LogisticsType'] === 'CVS'){
              // [LogisticsType] is CVS, LogisticsSubType can not be Home
              if (params['LogisticsSubType'] === 'TCAT' || params['LogisticsSubType'] === 'ECAN'){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[LogisticsSubType] can not be ${params['LogisticsSubType']} when [LogisticsType] is CVS.`);
              } 
              // [LogisticsSubType] is UNIMART, UNIMART Rules
              else if (params['LogisticsSubType'] === 'UNIMART'){
                // [LogisticsSubType] is UNIMART, ReceiverCellPhone can not be empty
                if (params['ReceiverCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverCellPhone] can not be empty when [LogisticsSubType] is UNIMART.`);
                }
                // [LogisticsSubType] is UNIMART, ReceiverStoreID can not be empty
                if (params['ReceiverStoreID'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] can not be empty when [LogisticsSubType] is UNIMART.`);
                }
                // [LogisticsSubType] is UNIMART, ReturnStoreID must be empty
                if (params['ReturnStoreID'] !== ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReturnStoreID] must be empty when [LogisticsSubType] is UNIMART.`);
                }
              } 
              // [LogisticsSubType] is FAMI, FAMI Rules
              else if (params['LogisticsSubType'] === 'FAMI'){
                // [LogisticsSubType] is FAMI, ReceiverCellPhone can not be empty
                if (params['ReceiverCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverCellPhone] can not be empty when [LogisticsSubType] is FAMI.`);
                }
                // [LogisticsSubType] is FAMI, ReceiverStoreID can not be empty
                if (params['ReceiverStoreID'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] can not be empty when [LogisticsSubType] is FAMI.`);
                }
                // [LogisticsSubType] is FAMI, ReturnStoreID Must be empty
                if (params['ReturnStoreID'] !== ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReturnStoreID] must be empty when [LogisticsSubType] is FAMI.`);
                }
              } 
              // [LogisticsSubType] is HILIFE, HILIFE Rules
              else if (params['LogisticsSubType'] === 'HILIFE'){
                // [LogisticsSubType] is HILIFE, ReceiverPhone can not be empty
                if (params['ReceiverPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverPhone] can not be empty when [LogisticsSubType] is HILIFE.`);
                }
                // [LogisticsSubType] is HILIFE, ReceiverStoreID can not be empty
                if (params['ReceiverStoreID'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] can not be empty when [LogisticsSubType] is HILIFE.`);
                }
                // [LogisticsSubType] is HILIFE, ReturnStoreID Must be empty
                if (params['ReturnStoreID'] !== ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReturnStoreID] must be empty when [LogisticsSubType] is HILIFE.`);
                }
              } 
              // [LogisticsSubType] is UNIMARTC2C, UNIMARTC2C Rules
              else if (params['LogisticsSubType'] === 'UNIMARTC2C'){
                // [LogisticsSubType] is UNIMARTC2C, GoodsAmount must be equal CollectionAmount
                if (parseInt(params['GoodsAmount']) !== parseInt(params['CollectionAmount'])){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsAmount] ${params['GoodsAmount']} can not be equal [CollectionAmount] ${params['CollectionAmount']} when [LogisticsSubType] is UNIMARTC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, SenderCellPhone can not be empty
                if (params['SenderCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderCellPhone] can not be empty when [LogisticsSubType] is UNIMARTC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, ReceiverCellPhone can not be empty
                if (params['ReceiverCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverCellPhone] can not be empty when [LogisticsSubType] is UNIMARTC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, GoodsName can not be empty
                if (params['GoodsName'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] can not be empty when [LogisticsSubType] is UNIMARTC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, LogisticsC2CReplyURL can not be empty
                if (params['LogisticsC2CReplyURL'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[LogisticsC2CReplyURL] can not be empty when [LogisticsSubType] is UNIMARTC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, ReceiverStoreID can not be empty
                if (params['ReceiverStoreID'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] can not be empty when [LogisticsSubType] is UNIMARTC2C.`);
                }
              } 
              // [LogisticsSubType] is FAMIC2C, FAMIC2C Rules
              else if (params['LogisticsSubType'] === 'FAMIC2C'){
                // [LogisticsSubType]為FAMIC2C, ReceiverCellPhone can not be empty
                if (params['ReceiverCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverCellPhone] can not be empty when [LogisticsSubType] is FAMIC2C`);
                }
                // [LogisticsSubType] is FAMIC2C, ReceiverStoreID can not be empty
                if (params['ReceiverStoreID'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] can not be empty when [LogisticsSubType] is FAMIC2C.`);
                }
              } 
              // [LogisticsSubType] is HILIFEC2C, HILIFEC2C Rules
              else if (params['LogisticsSubType'] === 'HILIFEC2C'){
                // [LogisticsSubType] is UNIMARTC2C, SenderCellPhone can not be empty
                if (params['SenderCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderCellPhone] can not be empty when [LogisticsSubType] is HILIFEC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, ReceiverCellPhone can not be empty
                if (params['ReceiverCellPhone'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverCellPhone] can not be empty when [LogisticsSubType] is HILIFEC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, GoodsName can not be empty
                if (params['GoodsName'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] can not be empty when [LogisticsSubType] is HILIFEC2C.`);
                }
                // [LogisticsSubType] is UNIMARTC2C, ReceiverStoreID can not be empty
                if (params['ReceiverStoreID'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] can not be empty when [LogisticsSubType] is HILIFEC2C.`);
                }
              }
            }

            // 4. 比對所有欄位Pattern
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw TypeError(`Received argument is not a object.`);
        }
    }
}

class QueryParamVerify extends LogisticsVerifyBase{
    constructor(apiname){
        super();
        this.logi_basic_param = this.get_basic_params(apiname);
        this.logi_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_query_param(params){
        if (params.constructor === Object){
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
          throw new TypeError(`Received argument is not a object`);
        }
    }

    verify_updateshipmentinfo_param(params){
        if (params.constructor === Object){
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // [ShipmentDate] and [ReceiverStoreID] can not both be empty.
            if (params['ShipmentDate'] === '' && params['ReceiverStoreID'] === ''){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[ShipmentDate] and [ReceiverStoreID] can not both be empty.`);
            }

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
          throw new TypeError(`Received argument is not a object`);
        }
    }
}

class ReturnParamVerify extends LogisticsVerifyBase{
    constructor(apiname){
        super();
        this.logi_basic_param = this.get_basic_params(apiname);
        this.logi_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_returnhome_param(params){
        if (params.constructor === Object){
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // [AllPayLogisticsID] and [LogisticsSubType] can not both be empty
            if (params['AllPayLogisticsID'] === '' && params['LogisticsSubType'] === ''){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[AllPayLogisticsID] and [LogisticsSubType] can not both be empty.`);
            }
            // if [LogisticsSubType] isn't empty, it will checks info_params values can not be empty.
            let info_params = ['SenderName', 'SenderZipCode', 'SenderAddress', 'ReceiverName', 'ReceiverZipCode', 'ReceiverAddress'];
            if (params['LogisitcsSubType'].includes('TCAT') || params['LogisticsSubType'].includes('ECAN')){
              info_params.forEach(function (param_name){
                // check if there's empty value.
                if (params[param_name] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`${param_name} contains empty value.`);
                }
              });
              // 商品名稱不可以有單引號跟雙引號
              if (params['GoodsName'].match(new RegExp(/[\'\"]+/)) !== null){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] can not contains quotation marks.`);
              }
              if (params['SenderName'].match(new RegExp(/^([\u4e00-\u9fa5]{1,5}|[a-zA-Z]{1,10})$/)) === null || params['ReceiverName'].match(new RegExp(/^([\u4e00-\u9fa5]{1,5}|[a-zA-Z]{1,10})$/)) === null){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderName] or [ReceiverName] must be the most 5 Chinese alphabets or 10 English alphabets.`);
              }
              if (params['SenderAddress'].match(new RegExp(/(^.{7,61}$)/)) === null || params['ReceiverAddress'].match(new RegExp(/(^.{7,61}$)/)) === null){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderAddress] or [ReceiverAddress] must be 7 ~ 61 alphabets.`);
              }
              if (params['SenderZipCode'].match(new RegExp(/(^\d{3,5}$)/)) === null || params['ReceiverZipCode'].match(new RegExp(/(^\d{3,5}$)/)) === null){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderZipCode] or [ReceiverZipCode] must be 3 ~ 5 numbers.`);
              }
              // SenderPhone and SenderCellPhone cannot both be empty
              if (params['SenderPhone'] === '' && params['SenderCellPhone'] === ''){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[SenderPhone] and [SenderCellPhone] can not both be empty when [LogisticsSubType] is TCAT or ECAN.`);
              }
              // ReceiverPhone and ReceiverCellPhone can not both be empty
              if (params['ReceiverPhone'] === '' && params['ReceiverCellPhone'] === ''){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverPhone] and [ReceiverCellPhone] can not both be empty when [LogisticsSubType] is TCAT or ECAN.`);
              }
              // [LogisticsSubType] is ECAN
              if (params['LogisticsSubType'] === 'ECAN'){
                // [LogisticsSubType] is ECAN, Temperature only can be 0001
                if (params['Temperature'] !== '0001'){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[Temperature] can not be ${params['Temperature']} when [LogisticsSubType] is ECAN.`);
                }
                // [LogisticsSubType] is ECAN, ScheduledDeliveryTime can not be '5:20~21'
                if (params['ScheduledDeliveryTime'] === '5'){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ScheduledDeliveryTime] can not be ${params['ScheduledDeliveryTime']} when [LogisticsSubType] is ECAN.`);
                }
                // [LogisticsSubType] is ECAN, PackageCount range is between 1 and 999
                if (parseInt(params["PackageCount"]) < 1 || parseInt(params['PackageCount']) > 999){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[PackageCount] of should be between 1 and 999 when [LogisticsSubType] is ECAN.`);
                }
              }
              // [LogisticsSubType] is TCAT
              else if (params['LogisticsSubType'] === 'TCAT'){
                // [LogisticsSubType] is TCAT, ScheduledDeliveryTime can not be '12:9~17', '13:9~12-17~20' and '23:13~20'
                if (parseInt(params['ScheduledDeliveryTime']) >= 5 && parseInt(params['ScheduledDeliveryTime']) <= 23){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ScheduledDeliveryTime] must be empty when [LogisticsSubType] is TCAT.`);
                }
                // [LogisticsSubType] is TCAT, PackageCount is unuse argument
                if (params['PackageCount'] !== ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[PackageCount] must be empty when [LogisticsSubType] is TCAT.`);
                }
                // [LogisticsSubType] is TCAT, ScheduledPickupTime can not be empty
                if (params['ScheduledPickupTime'] === ''){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[ScheduledPickupTime] can not be empty when [LogisticsSubType] is TCAT.`);
                }
              }
              // [Temperature] is '0003', Specification can not be '0004:150cm'
              if (params['Temperature'] === '0003'){
                if (params['Specification'] === '0004'){
                  throw new ECpayError.ECpayLogisticsRuleViolate(`[Specification] can not be ${params['Specification']} when [Temperature] is 0003.`);
                }
              }
            }

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw new TypeError(`Received argument is not a object.`);
        }
    }

    verify_returncvs_param(params){
        if (params.constructor === Object){
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}.`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // 商品名稱不可以有單引號跟雙引號
            if (params['GoodsName'].match(new RegExp(/[\'\"]+/)) !== null){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] can not contains quotation marks.`);
            }
            let item_params = ['GoodsName', 'Quantity', 'Cost'];
            if (params['GoodsName'] === ''){
                throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] is empty.`);
            } else {
              if (params['GoodsName'].includes('#')){
                let item_cnt = params['GoodsName'].split('#').length;
                item_params.forEach(function (param_name) {
                  // Check if there's empty value.
                  if (params[param_name].match(new RegExp(/(\#\#|^\#|\#$)/)) !== null){
                    throw new ECpayError.ECpayLogisticsRuleViolate(`[${param_name}] contains empty value.`);
                  }
                  let p_cnt = params[param_name].split('#').length;
                  if (item_cnt !== p_cnt){
                    throw new ECpayError.ECpayLogisticsRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [GoodsName] (${item_cnt}).`);
                  }
                });
              } else {
                // 沒有管線 => 逐一檢查後4項有無#號
                item_params.forEach(function (param_name) {
                  if (params[param_name].includes('#')){
                    throw new ECpayError.ECpayLogisticsRuleViolate(`Item info [${param_name}] contain pipeline delimiter but there's only one item in param [ItemName].`);
                  }
                });
              }
            }
            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw new TypeError(`Received argument is not a object.`);
        }
    }

    verify_returnhilifecvs_param(params){
        if (params.constructor === Object){
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}.`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // 商品名稱不可以有單引號跟雙引號
            if (params['GoodsName'].match(new RegExp(/[\'\"]+/)) !== null){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] can not contains quotation marks.`);
            }
            if (params['GoodsName'].match(new RegExp(/^([\u4e00-\u9fa5\w]{0,30}|[\w]{0,60})$/)) === null){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] must be the most 30 Chinese alphabets or 60 English alphabets.`);
            }

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw new TypeError(`Received argument is not a object.`);
        }
    }

    verify_returnunimartcvs_param(params){
        if (params.constructor === Object){
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}.`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // 商品名稱不可以有單引號跟雙引號
            if (params['GoodsName'].match(new RegExp(/[\'\"]+/)) !== null){
              throw new ECpayError.ECpayLogisticsRuleViolate(`[GoodsName] can not contains quotation marks.`);
            }

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw new TypeError(`Received argument is not a object.`);
        }
    }
}
class C2CProcessParamVerify extends LogisticsVerifyBase{
    constructor(apiname){
        super();
        this.logi_basic_param = this.get_basic_params(apiname);
        this.logi_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_c2c_process_param(params){
        if (params.constructor === Object){
            // 所有參數預設要全帶
            Object.keys(params).forEach(function (keys) {
               if (params[keys] === null){
                   throw new ECpayError.ECpayInvalidParam(`Parameter value cannot be null.`);
               }
            });
            // 1. 比對欄位是否缺乏
            let basic_param = this.logi_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new ECpayError.ECpayInvalidParam(`Lack required param ${pname}.`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // [ReceiverStoreID] and [ReturnStoreID] can not both be empty.
            if ('ReceiverStoreID' in params === true){
                if (params['ReceiverStoreID'] === '' && params['ReturneStoreID'] === ''){
                    throw new ECpayError.ECpayLogisticsRuleViolate(`[ReceiverStoreID] and [ReturneStoreID] can not both be empty.`);
                }
            }

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw new TypeError(`Received argument is not a object.`);
        }
    }
}
module.exports = {
    LogisticsVerifyBase: LogisticsVerifyBase,
    CreateParamVerify: CreateParamVerify,
    QueryParamVerify: QueryParamVerify,
    ReturnParamVerify: ReturnParamVerify,
    C2CProcessParamVerify: C2CProcessParamVerify,
};