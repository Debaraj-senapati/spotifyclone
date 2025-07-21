console.log("Let's write JS");

let currentsong = new Audio();
let songs = [];
let currfolder = "";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`songs/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(element.href.split(`${folder}/`)[1]));
    }
  }
}

const playmusic = (track, pause = false) => {
  currentsong.src = `songs/${currfolder}/` + track;
  if (!pause) currentsong.play();
  document.getElementById("play").src = "pause.svg";
  document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

function updateSongListUI() {
  const songUL = document.querySelector(".songlist ul");
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

  document.querySelectorAll(".songlist li").forEach(li => {
    li.addEventListener("click", () => {
      const songName = li.querySelector(".info div").innerText.trim();
      playmusic(songName);
    });
  });
}

async function displayalbums() {
  const folders = ["cs", "ncs", "Angry_mood", "chill_mood", "Dark_mood", "Love_mood", "phonk_mood", "uplifting_mood", "Arijit_singh", "shreya"];
  const cardcontainer = document.querySelector(".cardcontainer");

  for (let folder of folders) {
    try {
      const res = await fetch(`songs/${folder}/info.json`);
      const data = await res.json();

      cardcontainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                fill="#000" stroke="#000" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="songs/${folder}/cover.jpeg" alt="">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    } catch (err) {
      console.error(`Error loading info for ${folder}`, err);
    }
  }

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
      await getsongs(card.dataset.folder);
      playmusic(songs[0], true);
      updateSongListUI();
      playmusic(songs[0]);
    });
  });
}

async function main() {
  await getsongs("ncs");
  playmusic(songs[0], true);
  updateSongListUI();
  displayalbums();

  document.getElementById("play").addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration || 0)}`;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", e => {
    const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  document.getElementById("previous").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index > 0) playmusic(songs[index - 1]);
  });

  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index < songs.length - 1) playmusic(songs[index + 1]);
  });

  document.querySelector(".range input").addEventListener("input", e => {
    currentsong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume > img").addEventListener("click", e => {
    const isMuted = e.target.src.includes("volume.svg");
    e.target.src = isMuted ? e.target.src.replace("volume.svg", "mute.svg") : e.target.src.replace("mute.svg", "volume.svg");
    currentsong.volume = isMuted ? 0 : 0.1;
  });
}

main();
