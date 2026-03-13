const modal = document.getElementById("product_modal");

function openProductModal(product){

modal.classList.add("active");

document.getElementById("modal_product_name").textContent = product.name;
document.getElementById("modal_product_price").textContent = product.price;

document.getElementById("modal_product_image")
.style.backgroundImage = `url(${product.image})`;

document.getElementById("whatsapp_order").onclick = () => {

const message = `Hello, I'm interested in the product: ${product.name} (${product.price})`;

window.open(
`https://wa.me/351XXXXXXXXX?text=${encodeURIComponent(message)}`,
"_blank"
);

};

}

document.querySelector(".modal_close")
.addEventListener("click",()=>{

modal.classList.remove("active");

});

document.querySelector(".modal_overlay")
.addEventListener("click",()=>{

modal.classList.remove("active");

});