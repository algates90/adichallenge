<template>
  <div class="container">
    <div class="row">
      <div class="col-xs-12">
        <h1 class="logo-name">{{header}}</h1>
      </div>
    </div>
    <div class="alert alert-info" v-if="products.length==0 || products.error">
      No products found
    </div>
    <div class="row m-t-md" v-else>
      <template v-for="(product, pIndex) in products">
        <div class="col-md-3">
          <div class="ibox">
            <div class="ibox-content product-box">

              <div class="product-imitation">
                <img :src="'images/'+product.id+'.jpg'" class="full-width full-height">
              </div>
              <div class="product-desc">
                <span class="product-price">
                    {{ product.price }}
                </span>
                <small class="text-muted">Shoes</small>
                <a href="#" class="product-name"> {{ product.name }}</a>
                <div class="small m-t-xs">
                  Modern shoes for all day comfort.
                </div>
                <div>
                  <div class="inline m-t text-left">
                    Available<br/>
                    <span v-if="product.quantity>10" class="btn btn-primary">{{product.quantity}}</span>
                    <span v-else-if="product.quantity==0" class="btn danger">{{product.quantity}}</span>
                    <span v-else-if="product.quantity<=10" class="btn btn-warning">{{product.quantity}}</span>
                    <span v-on:click="updateQuantity(product.id)" class="m-l-xs cursor-pointer"><i class="fa fa-sync"></i></span>
                  </div>
                  <div class="inline m-t text-right pull-right" v-if="product.quantity>0">
                    Required<br/>
                    <input v-model.number="product.required" type="number" class="form-control-sm w-50" min="0" :max="product.quantity">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="row pull-right">
      <button class="btn btn-primary m-b-lg m-r-md" v-on:click="consumeProducts">Consume</button>
    </div>
    <div class="row m-t-lg">
      <div class="ibox">
        <div class="ibox-title"><h5>Inquiries</h5></div>
        <div class="ibox-content">
          <table class="table table-bordered" v-if="inquiries.length>0">
            <thead>
              <tr>
              <td>Inquiry Id</td>
              <td>Products [ Quantity ]</td>
              <td>Valid Until</td>
              <td>Approval Required</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(inquiry, index) in inquiries">
                <td>{{inquiry.id}}</td>
                <td>
                  <template v-for="(ip, ipindex) in inquiryproducts[inquiry.id]">
                    {{getProductById(ip.productId).name}}  [ <strong>{{ip.quantity}}</strong> ]<br/>
                  </template>
                </td>
                <td v-html="Math.round((new Date(inquiry.validUntil) - new Date())/ 1000)+' s'"></td>
                <td>
                  <button type="button" class="custom-label custom-label-primary" v-if="inquiry.isconfirmed">Confimed</button>
                  <button class="btn btn-success" v-else-if="inquiry.isquantityadapted && ((new Date(inquiry.validUntil) - new Date())/ 1000)>0" v-on:click="confirmInquiry(inquiry.id)">Confirm</button>
                  <button class="custom-label custom-label-danger" v-else-if="Math.round((new Date(inquiry.validUntil) - new Date())/ 1000)<0">Expired</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="alert alert-info">No Inquiries created</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
module.exports = {
  data: function () {
    return {
      inquiries: [],
      inquiryproducts: {},
    }
  },
  mounted : function (){
    this.products.forEach(element => element.required = '');
    this.autoUpdate();
  },
  methods: {
    autoUpdate: function() {
      var self = this;
      self.updateInquiries();
      self.inquiries.forEach(function(item, index) {
        self.retrieveInquiryProducts(item.id);
      });
      setTimeout(function () {
        self.autoUpdate();
      }, 5000);
    },
    updateQuantity: function(id) {
      var self = this;
      axios.get('http://localhost:49160/api/product/'+id).then(function(response) {
        self.getProductById(id).quantity = response.data.product.quantity;
        self.getProductById(id).required = '';
      }).catch(function (error) {
        toastr.options = {
          "closeButton": true,
          "timeOut": "0",
          "extendedTimeOut": "0",
          "preventDuplicates": true,
          "preventOpenDuplicates": true
        };
        toastr["error"]("Unable to fetch one or more products. Please retry again.");
      });
    },
    updateInquiries: function() {
      var self = this;
      axios.get('http://localhost:49160/api/inquiries').then(function(response) {
        self.inquiries = response.data.inquiries;
      }).catch(function (error) {
        toastr.options = {
          "closeButton": true,
          "timeOut": "0",
          "extendedTimeOut": "0",
          "preventDuplicates": true,
          "preventOpenDuplicates": true
        };
        toastr["error"]("Unable to fetch one or more inquiries. Please retry again.");
      });
    },
    consumeProducts: function() {
      var requiredProducts = [];
      var self = this;
      for (var product of this.products) {
        if (product.required) {
          requiredProducts.push({id: product.id, quantity: product.required});
        }
      }

      axios.post('http://localhost:49160/api/consume', {
        products: requiredProducts,
      }).then(function (response) {
            if (response.data.error) {
              throw new Error(response.data.message);
            } else {
              requiredProducts.forEach(function(item, index) {
                self.updateQuantity(item.id);
              });
              toastr.options = {
                "closeButton": true,
                "timeOut": "5000",
                "extendedTimeOut": "0",
                "preventDuplicates": true,
                "preventOpenDuplicates": true
              };
              if (response.data.inquiry.isquantityadapted) {
                toastr["warning"](response.data.message);
              } else {
                toastr["success"](response.data.message);
              }
            }
          })
          .catch(function (error) {
            toastr.options = {
              "closeButton": true,
              "timeOut": "0",
              "extendedTimeOut": "0",
              "preventDuplicates": true,
              "preventOpenDuplicates": true
            };
            console.log(error)
            toastr["error"](error.message);
          });
    },
    retrieveInquiry: function (id) {
      var self = this;
      axios.get('http://localhost:49160/api/inquiry/'+id).then(function (response) {
        if (response.data.error) {
          throw new Error(response.data.message);
        } else {
          self.inquiries.push(response.data.inquiry);
        }
      }).catch(function (error) {
        toastr.options = {
          "closeButton": true,
          "timeOut": "0",
          "extendedTimeOut": "0",
          "preventDuplicates": true,
          "preventOpenDuplicates": true
        };
        toastr["error"](error.message);
      });
    },
    retrieveInquiryProducts: function (inquiryId) {
      var self = this;
      axios.get('http://localhost:49160/api/inquiryproducts/'+inquiryId).then(function (response) {
        if (response.data.error) {
          throw new Error(response.data.message);
        } else {
          self.inquiryproducts[inquiryId] = response.data.inquiryproducts;
          response.data.inquiryproducts.forEach(function(item, index) {
              self.updateQuantity(item.productId);
          });
        }
      }).catch(function (error) {
        toastr.options = {
          "closeButton": true,
          "timeOut": "0",
          "extendedTimeOut": "0",
          "preventDuplicates": true,
          "preventOpenDuplicates": true
        };
        toastr["error"](error.message);
      });
    },
    getProductById: function (id) {
      return this.products.find(product => product.id === id);
    },
    getInquiryById: function (id) {
      return this.inquiries.find(inquiry => inquiry.id === id);
    },
    confirmInquiry: function (inquiryId) {
      var self = this;
      axios.get('http://localhost:49160/api/confirminquiry/'+inquiryId).then(function (response) {
        if (response.data.error) {
          throw new Error(response.data.message);
        } else {
          self.updateInquiries();
          toastr.options = {
            "closeButton": true,
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "preventDuplicates": true,
            "preventOpenDuplicates": true
          };
          toastr["success"](response.data.message);
        }
      }).catch(function (error) {
        toastr.options = {
          "closeButton": true,
          "timeOut": "0",
          "extendedTimeOut": "0",
          "preventDuplicates": true,
          "preventOpenDuplicates": true
        };
        toastr["error"](error.message);
      });
    }
  }
};
</script>
