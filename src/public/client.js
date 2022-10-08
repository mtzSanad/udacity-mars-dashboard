let store = Immutable.Map({
  user: Immutable.Map({ name: "Student" }),
  apod: "",
  rovers: Immutable.List(["Curiosity", "Opportunity", "Spirit"]),
  roverInfo: Immutable.Map({}),
  roverPics: Immutable.Map({}),
  selectedRover: "",
});

// getting the page root to dynamic work on it as SPA
const root = document.getElementById("root");

// Making updateStore use immutable
const updateStore = (state, newState) => {
  //Using immutable to create the store
  store = state.merge(newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
// This function will render dynamic two views based if user selecs home page or specific rover data
const App = (state) => {
  const apod = state.get("apod");
  const rovers = state.get("rovers");
  const user = state.get("user");
  const selectedRover = state.get("selectedRover");
  const roverInfo = state.get("roverInfo");
  const roverPics = state.get("roverPics");
  if (selectedRover) {
    //Check if no rovers info load it first
    //getRoversInfo fires updateStore which in return re-render the view, 2nd run will not go inside this method
    //data should be loaded if there is difference between current loaded data and selected rover or it is empty
    if (
      !roverInfo?.roverData ||
      roverInfo?.roverData?.photo_manifest?.name != selectedRover
    ) {
      getRoverInfo(selectedRover);
      return `Loading ...`;
    }
    return `
      <header class="app-header">${AppHeader(rovers)}</header>
      <main>
          <section>
              <h3>Welcome to ${selectedRover} Page</h3>
              <p><strong>Launch Date:</strong> ${
                roverInfo.roverData.photo_manifest.launch_date
              }</p>
              <p><strong>Landing Date:</strong> ${
                roverInfo.roverData.photo_manifest.landing_date
              }</p>
              <p><strong>Status:</strong> ${
                roverInfo.roverData.photo_manifest.status
              }</p>
              <div class="pic-gallary">
              ${roverPics.pics.latest_photos
                .map(
                  (img) =>
                    `<div class="sImage">
                      <img src=${img.img_src} alt="rover_pic" width="300" height="300" />
                      <p><strong>Photo date: </strong>${img.earth_date}</p>
                    </div>`
                )
                .join(" ")}
              </div>
          </section>
      </main>
      ${AppFooter(wrapFooterTag)("Msanad - Udacity - Project - 2022")}
    `;
  } else {
    return `
      <header class="app-header">${AppHeader(rovers)}</header>
      <main>
          ${Greeting(welcomeInEnglish)(user.get("name"))}
          <section>
              <h3>Welcome to NASA Info Website!</h3>
              <p>This is Astronomy Picture of the Day!</p>
              <p>
                  One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                  the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                  This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                  applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                  explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                  but generally help with discoverability of relevant imagery.
              </p>
              ${ImageOfTheDay(apod)}
          </section>
      </main>
      ${AppFooter(wrapFooterTag)("Msanad - Udacity - Project - 2022")}
    `;
  }
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.

//We can create diffrent versions of welcome
const welcomeInEnglish = (name) => {
  return `Welcome, ${name}!`;
};

//When calling the greeting we can specify which version we may use
const Greeting = (fn) => (name) => {
  if (name) {
    return `
            <h1>${fn(name)}</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

//Application Header component
const AppHeader = (rovers) => {
  if (rovers) {
    return `
        <nav>
          <ul>
            <div class="site-name" onclick="handleClick(event,true)">NASA ROVERS</div>
            ${Array.from(getRoverList(rovers, false)).join(" ")}
            <a href="" class="ham-menu" onclick="showHamburgurMenu(event)"><i class="fa fa-bars"></i></a>
          </ul>
        </nav>
        <div>
          ${Array.from(getRoverList(rovers, true)).join(" ")}
        </div>
    `;
  }
};

const getRoverList = (rovers, isMobile) => {
  const roversList = rovers.map(
    (rover) =>
      `<li class="${
        isMobile ? "mobile-menu" : "normal-menu"
      }"><a href="" name="${rover}" onclick="handleClick(event,false)">${rover}</a></li>`
  );
  return roversList;
};

const showHamburgurMenu = (e) => {
  e.preventDefault();
  const mobileMenu = document.querySelectorAll(".mobile-menu");
  mobileMenu.forEach((menu) => {
    if (menu.style.display === "block") {
      menu.style.display = "none";
    } else {
      menu.style.display = "block";
    }
  });
};

//Msanad - Udacity - Project - 2022
const wrapFooterTag = (data) => {
  return `<footer>${data}</footer>`;
};

const AppFooter = (fn) => (data) => {
  return fn(data);
};

//Hanldes user clics on app header to either render home page or rovers pages
const handleClick = (e, isHome) => {
  e.preventDefault();
  if (isHome) {
    updateStore(store, { selectedRover: "" });
  } else {
    updateStore(store, { selectedRover: e.target.name });
  }
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(photodate.getDate(), today.getDate());

  console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
    return `Image is Loading...`;
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  } else {
    return `
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `;
  }
};

// ------------------------------------------------------  API CALLS

// Calling picture of the date
const getImageOfTheDay = (state) => {
  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store, { apod }));
};

// get Rovers information and save it in a list, then use this data from store
// This is better for performance and ux as user will not need to wait request response time
const getRoverInfo = async (rover_name) => {
  let rInfo;
  await fetch(`http://localhost:3000/rover/${rover_name}`)
    .then((res) => res.json())
    .then((roverInfo) => {
      //updateStore(store, { roverInfo });
      rInfo = roverInfo;
    });
  const pics = await getRoverLatestPics(rover_name, rInfo);
};

// get Rover lates pictures
const getRoverLatestPics = async (rover_name, roverInfo) => {
  return fetch(`http://localhost:3000/rover/pics/${rover_name}`)
    .then((res) => res.json())
    .then((roverPics) => updateStore(store, { roverPics, roverInfo }));
};
