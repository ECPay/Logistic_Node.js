//noinspection BadExpressionStatementJS
/**
 * Created by ying.wu on 2017/6/12.
 */
// export {ECpayError, ECpayMissingOption, ECpayInvalidMode, ECpayInvalidParam, ECpayLogisticsRuleViolate};

class ECpayErrorDefinition extends Error{}
class ECpayError extends ECpayErrorDefinition{}
class ECpayMissingOption extends ECpayErrorDefinition{}
class ECpayInvalidMode extends ECpayErrorDefinition{}
class ECpayInvalidParam extends ECpayErrorDefinition{}
class ECpayLogisticsRuleViolate extends ECpayErrorDefinition{}

module.exports = {
    ECpayErrorDefinition: ECpayErrorDefinition,
    ECpayError: ECpayError,
    ECpayMissingOption: ECpayMissingOption,
    ECpayInvalidMode: ECpayInvalidMode,
    ECpayInvalidParam: ECpayInvalidParam,
    ECpayLogisticsRuleViolate: ECpayLogisticsRuleViolate
};