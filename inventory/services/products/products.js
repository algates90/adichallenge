const db = require("../../models");

/**
 * @function quantityAfterInquiry
 *
 * @description This function helps in retrieving the quantity of products that's eligible for a new inquiry (leaving out the active inquiries)
 *
 * @param product models/products
 * @param inquiryInRequest
 * @returns {Promise<number>}
 */
async function quantityAfterInquiry(product, inquiryInRequest = null) {
    var quantityAfterInquiry = 0;
    var sql = 'select COALESCE(sum(quantity), 0) AS val FROM inquiryproducts WHERE productId=:id AND inquiryId IN (SELECT id from inquiries WHERE isconfirmed=0 and validUntil>NOW())';
    var replacementParams = {};
    replacementParams['id'] = product.id;
    if (inquiryInRequest) {
        sql = 'select COALESCE(sum(quantity), 0) AS val FROM inquiryproducts WHERE productId=:id AND inquiryId IN (SELECT id from inquiries WHERE isconfirmed=0 and validUntil>NOW() and id != :inquiryId)';
        replacementParams['inquiryId'] = inquiryInRequest.id;
    }
    await db.sequelize.query(sql, {
        replacements: replacementParams,
        raw: true,
        type: db.Sequelize.QueryTypes.SELECT
    }).then ((result) => quantityAfterInquiry = product.quantity - result[0].val);

    return quantityAfterInquiry;
}

module.exports = {
    quantityAfterInquiry
};