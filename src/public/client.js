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
  let rovers = state.get("rovers");
  let user = state.get("user");
  let selectedRover = state.get("selectedRover");
  let roverInfo = state.get("roverInfo");
  let roverPics = state.get("roverPics");
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
              <div><strong>Launch Date:</strong> ${
                roverInfo.roverData.photo_manifest.launch_date
              }</div>
              <div><strong>Landing Date:</strong> ${
                roverInfo.roverData.photo_manifest.landing_date
              }</div>
              <div><strong>Status:</strong> ${
                roverInfo.roverData.photo_manifest.status
              }</div>
              <div>
              ${roverPics.pics.latest_photos.map(
                (img) =>
                  `<img src=${img.img_src} alt="rover_pic" width="300" height="300" />`
              )}
              </div>
          </section>
      </main>
      ${AppFooter()}
    `;
  } else {
    return `
      <header class="app-header">${AppHeader(rovers)}</header>
      <main>
          ${Greeting(user.get("name"))}
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
              
          </section>
      </main>
      ${AppFooter()}
    `;
  }
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `
            <h1>Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

//Application Header component
const AppHeader = (rovers) => {
  if (rovers) {
    const roversList = rovers.map(
      (rover) =>
        `<li><a href="" name="${rover}" onclick="handleClick(event,false)">${rover}</a></li>`
    );
    return `
        <nav>
          <ul>
            <div class="site-name">NASA API</div>
            ${Array.from(roversList).join(" ")}
          </ul>
        </nav>
    `;
  }
};

const AppFooter = () => {
  return "<footer>Msanad - Udacity - Project - 2022</footer>";
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
    return;
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
