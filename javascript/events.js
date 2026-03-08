const events = [
{
type: "KING OF THE COURT",
title: "PRO SKILLS CLINIC",
date: "2026-02-10",
time: "8:30PM - 10PM",
location: "R. João da Silva 20, Lisboa",
map: "https://www.google.com/maps?daddr=R.+João+da+Silva+20,+1900-271+Lisboa",
spotsTaken: 15,
spotsTotal: 15,
price: "€100",
priceLabel: "For The Winner"
},

{
type: "PICKUP GAME",
title: "FULL COURT 5V5",
date: "2026-02-10",
time: "8:30PM - 10PM",
location: "Pavilhão das ...",
map: "#",
spotsTaken: 4,
spotsTotal: 20,
price: "€6",
priceLabel: "Entry Fee"
},

{
type: "PICKUP GAME",
title: "FULL COURT 5V5",
date: "2026-02-10",
time: "8:30PM - 10PM",
location: "Pavilhão das ...",
map: "#",
spotsTaken: 18,
spotsTotal: 20,
price: "€6",
priceLabel: "Entry Fee"
}
];

const container = document.getElementById("events_container");

events.forEach(event => {

const spotsLeft = event.spotsTotal - event.spotsTaken;

let spotColor = "#3FFF6F";
let statusText = "Spots Available";
let buttonHTML = `<button class="join_now_like_button">JOIN NOW</button>`;

if(spotsLeft <= 0){
spotColor = "#EF4444";
statusText = "Sold Out";
buttonHTML = `<button class="sold_out_like_button">SOLD OUT</button>`;
}

else if(spotsLeft <= 3){
spotColor = "#EF4444";
statusText = "Only a few spots left";
}

else if(spotsLeft <= 7){
spotColor = "#FFD700";
statusText = "Limited spots available";
}


const card = `
<article class="schedule_component_father">

<div class="event_type_container">

<div class="event_type_indicator">

<div>
<p class="inter-black">${event.type}</p>
</div>

<div>
<div class="red_dot"></div>
<p class="inter-regular">${statusText}</p>
</div>

</div>

<div class="event_type_title">
<h2 class="inter-black">${event.title}</h2>
</div>

</div>

<div class="event_details_container">

<div class="event_details_small_container">
<div><img src="assets/icons/clock.svg"></div>
<div>
<h4 class="inter-medium">${event.date}</h4>
<p class="inter-regular">${event.time}</p>
</div>
</div>

<div class="event_details_small_container">
<div><img src="assets/icons/location_pin.svg"></div>
<div>
<h4 class="inter-medium">${event.location}</h4>
<a href="${event.map}" class="inter-regular">View Location</a>
</div>
</div>

<div class="event_details_small_container">
<div><img src="assets/icons/people_icon.svg"></div>
<div>
<h4 class="inter-medium">
<span style="color:${spotColor};">${event.spotsTaken}</span>/${event.spotsTotal}
</h4>
<p class="inter-regular">${statusText}</p>
</div>
</div>

<div class="event_details_small_container">
<div><img src="assets/icons/euro_icon.svg"></div>
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