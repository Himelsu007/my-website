const events = [
            {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date: "May 3rd",
        time: "10AM - 11:45AM",
        location: "Técnico",
        map: "https://maps.apple/p/KA1ei5NIRign3-",
        spotsTaken: 20,
        spotsTotal: 20,
        price: "€5",
        priceLabel: "Entry Fee"
    },

    {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date: "May 10th",
        time: "10AM - 12:30PM",
        location: "CIL",
        map: "https://maps.apple/p/qd6tPoDv6xcQE8",
        spotsTaken: 13,
        spotsTotal: 20,
        price: "€6",
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

];

const container = document.getElementById("events_container");

container.innerHTML = "";

events.forEach(event => {
    const spotsLeft = event.spotsTotal - event.spotsTaken;
    const fillPercent = Math.round((event.spotsTaken / event.spotsTotal) * 100);

    let spotColor = "#3FFF6F";
    let statusText = "Open Spots";
    let badgeBg = "rgba(63,255,111,0.12)";
    let badgeBorder = "rgba(63,255,111,0.3)";
    let badgeTextColor = "#3FFF6F";

    let buttonHTML = `<button class="join_now_like_button" onclick="window.location.href='private_run_sign_up.html?event=${encodeURIComponent(event.title)}'">JOIN NOW</button>`;

    if (spotsLeft <= 0) {
        spotColor = "#EF4444";
        statusText = "Sold Out";
        badgeBg = "rgba(239,68,68,0.12)";
        badgeBorder = "rgba(239,68,68,0.3)";
        badgeTextColor = "#F87171";
        buttonHTML = `<button class="sold_out_like_button" disabled>SOLD OUT</button>`;
    } else if (spotsLeft <= 3) {
        spotColor = "#EF4444";
        statusText = "Almost Full";
        badgeBg = "rgba(239,68,68,0.12)";
        badgeBorder = "rgba(239,68,68,0.3)";
        badgeTextColor = "#F87171";
    } else if (spotsLeft <= 7) {
        spotColor = "#FFD700";
        statusText = "Filling Fast";
        badgeBg = "rgba(255,215,0,0.1)";
        badgeBorder = "rgba(255,215,0,0.3)";
        badgeTextColor = "#FFD700";
    }

    const card = `
        <article class="schedule_component_father reveal">
            <div class="card_inner">
                <div class="event_type_container">
                    <div class="event_type_indicator">
                        <div style="background-color:${badgeBg}; border-color:${badgeBorder};">
                            <p class="inter-black" style="color:${badgeTextColor};">${event.type}</p>
                        </div>
                        <div>
                            <div class="red_dot" style="background-color:${spotColor};"></div>
                            <p class="inter-regular">${statusText}</p>
                        </div>
                    </div>
                    <div class="event_type_title">
                        <h3 class="barlow-condensed-black">${event.title}</h3>
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

                <div class="spots_progress_wrapper">
                    <div class="spots_progress_label">
                        <span class="inter-regular">Spots filled</span>
                        <strong class="inter-medium" style="color:${spotColor};">${event.spotsTaken}/${event.spotsTotal}</strong>
                    </div>
                    <div class="spots_progress_bar">
                        <div class="spots_progress_fill" style="width:${fillPercent}%; background:${spotColor};"></div>
                    </div>
                </div>

                ${buttonHTML}
            </div>
        </article>
    `;

    container.innerHTML += card;
});