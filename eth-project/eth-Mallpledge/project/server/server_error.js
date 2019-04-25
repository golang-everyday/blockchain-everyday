//
var error = {

    hashAlreadyInserted: {
        status: "failed",
        msg: "输入了重复的Hash值"
    },
    lowBalance: {
        status: "failed",
        msg: "上链账号余额不足"
    },
    evmError: {
        status: "failed",
        msg: "其他"
    },
    selectHashSuccess: {
        status: "success",
        msg: "查询成功"
    },
    selectHashFailed: {
        status: "failed",
        msg: "查询失败"
    },
    insertHashSuccess: {
        status: "success",
        msg: "上链成功"
    },
    validationFailed: {
        status: "failed",
        msg: "验签失败"
    },
    sellerAddressFailed: {
        status: "sellerAddressFailed",
        msg: "商家地址不合法"
    },
    custAddressFailed: {
        status: "custAddressFailed",
        msg: "客户地址不合法"
    },
    sellerAddressInBlack: {
        status: "sellerAddressInBlack",
        msg: "商家地址在黑名单中"
    },
    custAddressInBlack: {
        status: "custAddressInBlack",
        msg: "客户地址在黑名单中"
    },
    wpListFailed: {
        status: "wpListFailed",
        msg: "物品列表信息不合法"
    },
    notHaveToken: {
        status: "notHaveToken",
        msg: "此TOKEN不是所支持的TOKEN"
    },
    isTimeFailed: {
        status: "isTimeFailed",
        msg: "自动结算时间有误"
    },
    DepositandPrincipalFailed: {
        status: "DepositandPrincipalFailed",
        msg: "押金是本金的比例不符合规定"
    }
}

//
module.exports = error;