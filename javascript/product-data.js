// ========================================
// PRODUCT DATA
// ========================================

const products = [

{
name:"Nike Elite Pro T-Shirt",
price:"€49.99",
image:"../assets/images/products/nike-elite-tee-white.png"
},

{
name:"Locked In Performance Socks",
price:"€14.99",
image:"../assets/images/products/nike-elite-tank-top-black.png"
},

{
name:"Elite Training Tank",
price:"€39.99",
image:"../assets/images/products/nike-elite-tee-black.png.webp"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-tank-top-white.jpeg"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-long-sleeve-white.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-short-sleeve-black.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-long-sleeve-black.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-short-sleeve-white.jpeg"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-socks-black.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-socks-white.png"
},

];


// ========================================
// PRODUCT LOADER
// ========================================

function loadProducts(){

const container = document.getElementById(
"products_show_case_container"
);

products.forEach(product => {

const card = document.createElement("div");

card.className = "products_box";

card.innerHTML = `

<div class="product_image"
style="background-image:url('${product.image}')">
</div>

<div class="product_info">

<span class="product_name barlow-condensed-regular">
${product.name}
</span>

<span class="product_price barlow-condensed-regular">
${product.price}
</span>

</div>

`;

container.appendChild(card);

});

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

loadProducts();

});