document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", function () {
            const item = this.parentElement;
            const content = item.querySelector(".accordion-content");
            const iconImg = this.querySelector(".icon img");
            
            // Check if this specific item is already open
            const isActive = item.classList.contains("active");

            // 1. Close all other items (The "Accordion" behavior)
            document.querySelectorAll(".accordion-item").forEach(otherItem => {
                otherItem.classList.remove("active");
                const otherContent = otherItem.querySelector(".accordion-content");
                const otherIcon = otherItem.querySelector(".icon img");
                
                if (otherContent) otherContent.style.height = "0px";
                if (otherIcon) otherIcon.src = "assets/icons/donwards_arrow.svg";
            });

            // 2. If the clicked one wasn't active, open it
            if (!isActive) {
                item.classList.add("active");
                // scrollHeight calculates the exact height of the text inside
                content.style.height = content.scrollHeight + "px";
                iconImg.src = "assets/icons/active_accordition_icon.svg";
            }
        });
    });
});