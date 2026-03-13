const dropdown = document.querySelector(".sort-dropdown");
const trigger = document.getElementById("sortTrigger");

trigger.addEventListener("click", () => {
    dropdown.classList.toggle("active");
});

document.addEventListener("click", (e) => {

    if(!dropdown.contains(e.target)){
        dropdown.classList.remove("active");
    }

});