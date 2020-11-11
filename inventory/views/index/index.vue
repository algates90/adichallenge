<template>
  <div class="container">
    <div class="row">
      <div class="col-xs-12">
        <h1 class="logo-name">{{header}}</h1>
      </div>
    </div>
    <div class="alert alert-info" v-if="products.length==0">
      No products found
    </div>
    <div class="row m-t-md" v-else>
      <template v-for="(product, pIndex) in products">
        <div class="col-md-3">
          <div class="ibox">
            <div class="ibox-content product-box">

              <div class="product-imitation">
                [ INFO ]
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
                    <span v-else-if="product.quantity==0" class="btn btn-default">{{product.quantity}}</span>
                    <span v-else-if="product.quantity<=10" class="btn btn-warning">{{product.quantity}}</span>
                    <span v-on:click="updateQuantity(product.id)" class="m-l-xs cursor-pointer"><i class="fa fa-sync"></i></span>
                  </div>
                  <div class="inline m-t text-right pull-right">
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
      <button class="btn btn-success m-b-lg m-r-md" v-on:click="consumeProducts">Consume</button>
    </div>
    <div class="row m-t-lg" v-if="inquiryData.length>0">
      <div class="ibox">
        <div class="ibox-title"><h5>Inquiries</h5></div>
        <div class="ibox-content">
          <table class="table table-bordered">
            <thead>
              <tr>
              <td>Inquiry Id</td>
              <td>Products</td>
              <td>Valid Until</td>
              <td>Approve</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(inquiry, index) in inquiryData">
                <td>{{inquiry.id}}</td>
                <td>
                  <template v-for="(p, pindex) in inquiry.products">
                      {{p.name}} - {{p.inquiryproducts.quantity}}<br/>
                  </template>
                </td>
                <td>{{inquiry.validUntil}}</td>
                <td><button class="btn btn-primary" v-if="inquiries[inquiry.id].autoUpdated">Confirm</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
module.exports = {
  data: function () {
    return {
      inquiries: {},
      inquiryData: [],
    }
  },
  mounted : function (){
    this.products.forEach(element => element.required = '');
  },
  methods: {
    updateQuantity: function(id) {
      var self = this;
      axios.get('http://localhost:49160/api/product/'+id).then(function(response) {
        self.products.find(product => product.id === id).quantity = response.data.product.quantity;
      }).catch(function (error) {
        toastr.options = {
          "closeButton": true,
          "timeOut": "0",
          "extendedTimeOut": "0"
        };
        toastr["error"]("Unable to fetch one or more products. Please retry again.");
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
              self.inquiries[response.data.data.inquiryId] = response.data.data;
              self.retrieveInquiry(response.data.data.inquiryId);
              toastr.options = {
                "closeButton": true,
                "timeOut": "5000",
                "extendedTimeOut": "0"
              };
              if (response.data.data.autoUpdated) {
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
              "extendedTimeOut": "0"
            };
            toastr["error"](error.message);
          });
    },
    retrieveInquiry: function (id) {
      var self = this;
      axios.get('http://localhost:49160/api/inquiry/'+id).then(function (response) {
        if (response.data.error) {
          throw new Error(response.data.message);
        } else {
          self.inquiryData.push(response.data.inquiry);
        }
      }).catch(function (error) {
            toastr.options = {
              "closeButton": true,
              "timeOut": "0",
              "extendedTimeOut": "0"
            };
            toastr["error"](error.message);
          });
    }
  }
};
</script>
