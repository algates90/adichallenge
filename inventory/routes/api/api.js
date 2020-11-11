var express = require('express');
var axios = require('axios');
var router = express.Router();
const db = require("../../models");
const { Op } = require("sequelize");
/**
 * @swagger
 *  components:
 *      schemas:
 *          Product:
 *              type: object
 *              required:
 *                  - name
 *                  - quantity
 *              properties:
 *                  id:
 *                      type: integer
 *                      description: The auto-generated id of product
 *                  name:
 *                      type: string
 *                      description: The name of the product
 *                  quantity:
 *                      type: integer
 *                      description: The quantity of products available in stocks
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: The date of product creation
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: The date of product update
 */

/**
 * @swagger
 * paths:
 *  /api/products:
 *    get:
 *      summary: Get a list of products available in the inventory
 *      tags: [Products]
 *      parameters:
 *        - in: header
 *          name: accept-language
 *          schema:
 *            type: string
 *          required: true
 *          description: The locale for retrieving price on corresponding currency
 *
 *      responses:
 *        "200":
 *          description: Products retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Product'
 *
 *  /api/product/{id}:
 *    get:
 *      summary: Gets a product in the inventory by id
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: integer
 *          required: true
 *          description: The id of the product
 *        - in: header
 *          name: accept-language
 *          schema:
 *            type: string
 *          required: true
 *          description: The locale for retrieving price on corresponding currency
 *
 *      responses:
 *        "200":
 *          description: Products retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *                      product:
 *                          $ref: '#/components/schemas/Product'
 *        "400":
 *          description: Bad request. ID of the product must be an integer and greater than 0
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *
 *        "404":
 *          description: Product not found
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *
 */


router.get("/products", function (req, res) {
    db.products.findAll().then(products => res.json(products))
    return;
});

router.get("/product/:id", function (req, res) {
    if (req.params.id) {
        db.products.findOne({where: {id: req.params.id}}).then(product => {
            if(product) {
                res.status(200).json({error: false, message: "Product retrieved successfully",product: product});
            } else {
                res.status(404).json({error: true, message:"Product not found"});
            }
        });
    } else {
        res.status(400).json({error: true, message:"Bad request. ID of the product must be an integer and greater than 0."});
    }
    return;
});

router.post("/consume", function (req, res) {
    var requestedProducts = req.body.products;
    var updateQuantityFlag = false;
    var error = false;

    var data = {};

    if (requestedProducts) {
        var promises = [];

        for (var i = 0; i < requestedProducts.length; i++) {
            data[requestedProducts[i].id] =  requestedProducts[i];
            promises.push(
                axios.get('http://inventory-engine:3001/api/product/'+requestedProducts[i].id, {
                    headers: {
                        "accept-language": "en-us"
                    }
                }).then(function(response) {
                    data[response.data.product.id].entity = response.data.product;
                    if (response.data.product.quantity<data[response.data.product.id].quantity) {
                        data[response.data.product.id].quantity = response.data.product.quantity;
                        updateQuantityFlag = true;
                    }
                }).catch(function (error) {
                    error = true;
                })
            );
        }

        Promise.all(promises).then(() => {
            db.inquiry.create({validUntil: new Date(Date.now() + (60 * 1000))}).then(function(inquirycreated) {
                Object.keys(data).forEach((key, value) => {
                    inquirycreated.addProduct(key, { through: { quantity: data[key].quantity }});
                });
                var message = "Inquiry successfully created.";
                if (updateQuantityFlag) {
                    message = "Requested quantities unavailable. Please confirm the updated inquiry created.";
                }
                res.status(200).json({error: false, message: message, data: {inquiryId: inquirycreated.id, autoUpdated: updateQuantityFlag}});
            }).catch(function(error) {
                error = true;
            });
        });
    } else {
        res.status(400).json({error: true, message:"Bad request"});
    }
    if (error) {
        res.status(400).json({error: true, message:"Unable to process"});
    }
    return;
});

router.get("/inquiry/:id", function (req, res) {
    if (req.params.id) {
        db.inquiry.findAll({where: {id: req.params.id},
            include: [{
                model: db.products,
                as: 'products',
                attributes: ['id', 'name']
            }] }).then(inquiry => {
            if(inquiry) {
                res.status(200).json({error: false, message: "Inquiry retrieved successfully",inquiry: inquiry});
            } else {
                res.status(404).json({error: true, message:"Inquiry not found"});
            }
        });
    } else {
        res.status(400).json({error: true, message:"Bad request"});
    }
    return;
});

router.get("/confirm-inquiry/:id", function (req, res) {
    if (req.params.id) {
        db.inquiryproducts.findAll({where: {inquiryId: req.params.id}}).then(inquiry => {
            if(inquiry) {
                res.status(200).json({error: false, message: "Inquiry retrieved successfully",inquiry: inquiry});
            } else {
                res.status(404).json({error: true, message:"Inquiry not found"});
            }
        });
    } else {
        res.status(400).json({error: true, message:"Bad request"});
    }
    return;
});

module.exports = router;
