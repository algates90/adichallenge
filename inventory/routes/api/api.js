var express = require('express');
var axios = require('axios');
var router = express.Router();
const db = require("../../models");
const { Op } = require("sequelize");
const moment = require('moment')
let productService = require('../../services/products/products')

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
 *
 *          Inquiry:
 *              type: object
 *              required:
 *                  - validUntil
 *                  - isquantityadapted
 *                  - isconfirmed
 *              properties:
 *                  id:
 *                      type: integer
 *                      description: The auto-generated id of inquiry
 *                  validUntil:
 *                      type: Date
 *                      description: Time until which the inquiry is valid
 *                  isquantityadapted:
 *                      type: boolean
 *                      description: The quantity adapted from the real inquiry request
 *                  isconfirmed:
 *                      type: boolean
 *                      description: The status of the inquiry is confirmed or not
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: The date of inquiry creation
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: The date of inquiry update
 *
 *          Inquiryproducts:
 *              type: object
 *              required:
 *                  - validUntil
 *                  - isquantityadapted
 *                  - isconfirmed
 *              properties:
 *                  id:
 *                      type: integer
 *                      description: The auto-generated id of inquiry
 *                  quantity:
 *                      type: integer
 *                      description: Quantity of products attached to this inquiry for a specific product
 *                  inquiryId:
 *                      type: integer
 *                      description: Inquiry Id linked
 *                  productId:
 *                      type: integer
 *                      description: Product Id linked
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: The date of inquiryproduct creation
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: The date of inquiryproduct update
 */

/**
 * @swagger
 * paths:
 *  /api/products:
 *    get:
 *      summary: Get a list of products available in the inventory
 *      tags: [Products]
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
 */
router.get("/products", function (req, res) {
    db.products.findAll().then(async function(products) {
        if (products.length == 0) {
            res.status(200).json(products);
        } else {
            for await (const item of products){
                item.quantity = await productService.quantityAfterInquiry(item)
                if (item.id == products[products.length-1].id) {
                    res.status(200).json(products);
                }
            }
        }
    })
    return;
});

/**
 *
 * @swagger
 * /api/product/{id}:
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
router.get("/product/:id", function (req, res) {
    if (req.params.id) {
        db.products.findOne({where: {id: req.params.id}}).then(async product => {
            if(product) {
                product.quantity = await productService.quantityAfterInquiry(product)
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

/**
 *
 * @swagger
 * /consume:
 *    post:
 *      summary: Request that helps in creating an inquiry and confirming it in case if products available. If not, just creates an inquiry and waits for user confirmation through /consumeinquiry/{id} API
 *      tags: [Products]
 *      parameters:
 *        - in: post
 *          name: products
 *          schema:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                  id :
 *                      description: Product Id requested
 *                      type: integer
 *                  quantity:
 *                      description: Quantity of the product required
 *                      type: integer
 *
 *          required: true
 *          description: Object consists of the product details in request.
 *      responses:
 *        "200":
 *          description: Inquiry created successfully [ and confirmed ]
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *                      inquiry:
 *                          $ref: '#/components/schemas/Inquiry'
 *        "400":
 *          description: Bad request.
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
router.post("/consume", async function (req, res) {
    var requestedProducts = req.body.products;
    var updateQuantityFlag = false;
    var confirmRequest = true;
    var error = false;

    var data = requestedProducts;

    if (requestedProducts && requestedProducts.length>0) {

        // Check if every product in request is eligible to be processed without further confirmation due to any quantity change.
        for await (var item of data){
            if (Number.isNaN(item.quantity) || item.quantity <= 0) {
                updateQuantityFlag = true;
                confirmRequest = false;
                delete item;
            } else {
                await axios.get('http://inventory-engine:3001/api/product/'+item.id).then(function(response) {
                    if (response.data.product.quantity<item.quantity) {
                        item.quantity = response.data.product.quantity;
                        updateQuantityFlag = true;
                        confirmRequest = false;
                    }
                }).catch(function (error) {
                    error = true;
                })
            }
        }

        if (data.length>0) {
            // Create inquiry and trigger auto-confirmation if no manual confirmation is required.
            await db.inquiry.create({validUntil: new Date(Date.now() + (60 * 1000)), isquantityadapted: updateQuantityFlag, isconfirmed: confirmRequest}).then(async function(inquiry) {
                for await (const item of data){
                    await db.inquiryproducts.create({productId: item.id, inquiryId: inquiry.id, quantity: item.quantity});
                    if (item.id == data[data.length-1].id) {
                        if (confirmRequest) {
                            await axios.get('http://inventory-engine:3001/api/confirminquiry/'+inquiry.id).then(function(response) {
                                if (response.data.error) {
                                    error = true;
                                }
                            }).catch(function (error) {
                                error = true;
                            })
                        }
                        var message = "Inquiry successfully created and consumed.";
                        if (updateQuantityFlag) {
                            message = "Requested quantities unavailable. Please confirm the updated inquiry created.";
                        }
                        res.status(200).json({error: false, message: message, inquiry: inquiry});
                    }
                }

            }).catch(function(error) {
                error = true;
            });
        }

    } else {
        res.status(400).json({error: true, message:"Bad request"});
    }
    if (error) {
        res.status(400).json({error: true, message:"Unable to process request."});
    }
    return;
});

/**
 * @swagger
 * paths:
 *  /api/inquiries:
 *    get:
 *      summary: Get a list of inquiries already available for the inventory
 *      tags: [Products]
 *      responses:
 *        "200":
 *          description: Inquiries retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Inquiry'
 *
 */
router.get("/inquiries", function (req, res) {
    db.inquiry.findAll().then(inquiries => {
        res.status(200).json({error: false, message: "Inquiry retrieved successfully",inquiries: inquiries});
    });
    return;
});

/***
 * @swagger
 * /api/inquiry/{id}:
 *    get:
 *      summary: Gets an inquiry already made for the product
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: integer
 *          required: true
 *          description: The id of the product
 *      responses:
 *        "200":
 *          description: Inquiry retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *                      inquiry:
 *                          $ref: '#/components/schemas/Inquiry'
 *        "400":
 *          description: Bad request. ID of the inquiry must be an integer and greater than 0
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
 *          description: Inquiry not found
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 */
router.get("/inquiry/:id", function (req, res) {
    if (req.params.id) {
        db.inquiry.findOne({where: {id: req.params.id}}).then(inquiry => {
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

/***
 * @swagger
 * /api/inquiryproducts/{inquiryId}:
 *    get:
 *      summary: Gets the inquiry products already made for an inquiry
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: inquiryId
 *          schema:
 *            type: integer
 *          required: true
 *          description: The id of the inquiry
 *      responses:
 *        "200":
 *          description: Inquiry products retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *                      inquiryproducts:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Inquiryproducts'
 *        "400":
 *          description: Bad request. ID of the inquiry must be an integer and greater than 0
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
 *          description: Inquiry products not found
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 */
router.get("/inquiryproducts/:inquiryId", function (req, res) {
    if (req.params.inquiryId) {
        db.inquiryproducts.findAll({where: {inquiryId: req.params.inquiryId}}).then(inquiryproducts => {
            if(inquiryproducts) {
                res.status(200).json({error: false, message: "Inquiryproducts retrieved successfully",inquiryproducts: inquiryproducts});
            } else {
                res.status(404).json({error: true, message:"Inquiryproducts not found"});
            }
        });
    } else {
        res.status(400).json({error: true, message:"Bad request"});
    }
    return;
});

/***
 * @swagger
 * /api/confirminquiry/{inquiryId}:
 *    get:
 *      summary: Confirms the inquiry to be consumed
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: inquiryId
 *          schema:
 *            type: integer
 *          required: true
 *          description: The id of the inquiry
 *      responses:
 *        "200":
 *          description: Inquiry confirmed successfully and consumed.
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 *                      inquiry:
 *                          type: object
 *                          items:
 *                              $ref: '#/components/schemas/Inquiry'
 *        "400":
 *          description: Bad request. ID of the inquiry must be an integer and greater than 0
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
 *          description: Inquiry products not found
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      error:
 *                          type: boolean
 *                      message:
 *                          type: string
 */
router.get("/confirminquiry/:inquiryId", async function (req, res) {
    if (req.params.inquiryId) {
        const inquiry = await db.inquiry.findOne({where: {id: req.params.inquiryId}});
        if (inquiry) {
            if (inquiry.isconfirmed) {
                res.status(200).json({error: false, message:"Inquiry is already confirmed.", inquiry: inquiry});
            } else {
                if (moment()<=moment(inquiry.validUntil)) {
                    const inquiryProducts = await db.inquiryproducts.findAll({where: {inquiryId: inquiry.id}});
                    var quantityInsufficient = false;
                    for await (const item of inquiryProducts){
                        var productInScope = await db.products.findOne({where: {id: item.productId}});
                        if (await productService.quantityAfterInquiry(productInScope, inquiry) < item.quantity) {
                            quantityInsufficient = true;
                        }
                    }
                    if (quantityInsufficient) {
                        res.status(200).json({error: true, message:"Inquiry cannot be confirmed. Products insufficient.", inquiry: inquiry});
                        return;
                    } else {
                        for await (const item of inquiryProducts){
                            await db.products.findByPk(item.productId).then(product => {
                                product.decrement('quantity', {by: item.quantity});
                                inquiry.update({'isconfirmed' : true});
                            })
                            if (item.id == inquiryProducts[inquiryProducts.length-1].id) {
                                res.status(200).json({error: false, message:"Inquiry has been processed successfully.", inquiry: inquiry});
                            }
                        }
                    }
                } else {
                    res.status(200).json({error: true, message:"Inquiry cannot be processed as it was not confirmed within the given time.", inquiry: inquiry});
                }
            }
        } else {
            res.status(200).json({error: true, message:"Inquiry not found"});
        }
    } else
        res.status(400).json({error: true, message:"Bad request"});
    return;
});

module.exports = router;
