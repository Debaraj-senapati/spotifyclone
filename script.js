console.log("lets write js");
let currentsong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');
  return `${formattedMins}:${formattedSecs}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
}



const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
  }
  play.src = "pause.svg";
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

function updateSongListUI() {
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Deb</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>`;
  }
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}

//display all albums function

async function displayalbums() {
  const folders = ["cs", "ncs","Angry_mood","chill_mood","Dark_mood","Love_mood","phonk_mood","uplifting_mood","Arijit_singh","shreya"]; // Add more folder names if needed
  const cardcontainer = document.querySelector(".cardcontainer");

  for (let folder of folders) {
    try {
      let res = await fetch(`/songs/${folder}/info.json`);
      let data = await res.json();

      cardcontainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                stroke="#000000" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpeg" alt="">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    } catch (err) {
      console.error(`Error loading folder ${folder}:`, err);
    }
  }
  
  //load the playlist whenver it is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0], true);
      updateSongListUI();
      playmusic(songs[0])
    });
  });
}



async function main() {
  await getsongs("songs/ncs");
  playmusic(songs[0], true);
  updateSongListUI();



  
//display all the albums on the page
displayalbums()


  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration || 0)}`;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const range = document.querySelector(".range");
    const volumeInput = range?.getElementsByTagName("input")[0];
    if (volumeInput) {
      volumeInput.addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
      });
    }
  });



  //add an event listener to mute the  track
  document.querySelector(".volume>img").addEventListener("click",e=>{
    console.log(e.target)
    connsole.log("changing",e.target.src)
    if(e.target.src.includes ("volume.svg")){
        e.target.src=e.target.src.replace("volume.svg","mute.svg")
        currentsong .volume=0
      
    }
    else{
        e.target.src=e.target.src.replace("mute.svg","volume.svg")
        currentsong.volume=.10
      
    }
  })


}

main();
