const events = [
        {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date: "April 18th",
        time: "7:45PM - 9:30PM",
        location: "Técnico",
        map: "https://maps.app.goo.gl/s8LQtmuZsGKivsxo6",
        spotsTaken: 11,
        spotsTotal: 20,
        price: "€5",
        priceLabel: "Entry Fee"
    },
        {
        type: "PICK UP GAME",
        title: "HALF-COURT 4V4",
        date: " April 11th",
        time: "8PM - 9:35PM",
        location: "Técnico ",
        map: "https://maps.app.goo.gl/s8LQtmuZsGKivsxo6",
        spotsTaken: 30,
        spotsTotal: 30,
        price: "€5",
        priceLabel: "Entry Fee"
    }
    ,

        {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date: "April 5th",
        time: "9:50AM - 12PM",
        location: "S.Sebastião",
        map: "https://maps.app.goo.gl/7GcVBr2GbTnQ3R8aA",
        spotsTaken: 15,
        spotsTotal: 15,
        price: "€6",
        priceLabel: "Entry Fee"
    }

];

const container = document.getElementById("events_container");

// Clear container once before starting the loop
container.innerHTML = "";

events.forEach(event => {
    const spotsLeft = event.spotsTotal - event.spotsTaken;

    let spotColor = "#3FFF6F";
    let statusText = "Open Spots";
    
    // STRATEGY: Use window.location.href inside the button's onclick
    // This passes the title of the event to the next page so you know which game they picked!
    let buttonHTML = `<button class="join_now_like_button" onclick="window.location.href='private_run_sign_up.html?event=${encodeURIComponent(event.title)}'">JOIN NOW</button>`;

    if (spotsLeft <= 0) {
        spotColor = "#EF4444";
        statusText = "Full";
        buttonHTML = `<button class="sold_out_like_button" disabled>SOLD OUT</button>`;
    } 
    else if (spotsLeft <= 3) {
        spotColor = "#EF4444";
        statusText = "Almost Full";
    } 
    else if (spotsLeft <= 7) {
        spotColor = "#FFD700";
        statusText = "Almost Full";
    }

    const card = `
        <article class="schedule_component_father reveal">
            <div class="event_type_container">
                <div class="event_type_indicator">
                    <div>
                        <p class="inter-black">${event.type}</p>
                    </div>
                    <div>
                        <div class="red_dot" style="background-color: ${spotColor};"></div>
                        <p class="inter-regular">${statusText}</p>
                    </div>
                </div>
                <div class="event_type_title">
                    <h2 class="barlow-condensed-black">${event.title}</h2>
                </div>
            </div>

            <div class="event_details_container">
                <div class="event_details_small_container">
                    <div><i class="fa-solid fa-bell"></i></div>
                    <div>
                        <h4 class="inter-medium">${event.date}</h4>
                        <p class="inter-regular">${event.time}</p>
                    </div>
                </div>

                <div class="event_details_small_container">
                    <div><img src="assets/icons/location_pin.svg" alt="Location Pin"></div>
                    <div>
                        <h4 class="inter-medium">${event.location}</h4>
                        <a href="${event.map}" class="inter-regular" target="_blank">View Location</a>
                    </div>
                </div>

                <div class="event_details_small_container">
                    <div><img src="assets/icons/people_icon.svg" alt="People Icon"></div>
                    <div>
                        <h4 class="inter-medium">
                            <span style="color:${spotColor};">${event.spotsTaken}</span>/${event.spotsTotal}
                        </h4>
                        <p class="inter-regular">${statusText}</p>
                    </div>
                </div>

                <div class="event_details_small_container">
                    <div><img src="assets/icons/euro_icon.svg" alt="Euro Icon"></div>
                    <div>
                        <h4 class="inter-medium">${event.price}</h4>
                        <p class="inter-regular">${event.priceLabel}</p>
                    </div>
                </div>
            </div>

            ${buttonHTML}
        </article>
    `;

    container.innerHTML += card;
});