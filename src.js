let currentSong = new Audio();
let songsData = []; // Store songs data globally
let currentSongName = ''; // Track current song name
let currentIndex = 0;
let currentFolder = 'songs'; // Track current folder

const playMusik = (track) => {
  currentSong.src = `/${currentFolder}/${track}`;
  currentSongName = track; // Store current song name
  
  currentIndex = songsData.findIndex(song => song === track);
  console.log("Current index updated to:", currentIndex, "for song:", track);
  
  currentSong.play().catch(err => console.error("Error playing song:", err));
  
  const playbarSongInfo = document.querySelector(".playbar .songInfo");
  if (playbarSongInfo) {
    playbarSongInfo.innerHTML = track;
  }
  
  const playBtnImg = document.getElementById("btnImg");
  if (playBtnImg) {
    playBtnImg.src = 'resourses/pause.svg';
  }
}

function playPrevious() {
  if (songsData.length > 0) {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songsData.length - 1;
    }
    playMusik(songsData[prevIndex]);
  }
}

function playNext() {
  if (songsData.length > 0) {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= songsData.length) {
      nextIndex = 0;
    }
    playMusik(songsData[nextIndex]);
  }
}

function setupNavigationListeners() {
  const hamburger = document.querySelector("#hamburger");
  const closeButton = document.querySelector(".closeCont");
  const leftPanel = document.querySelector(".left");

  if (hamburger && leftPanel) {
    hamburger.addEventListener('click', () => {
      leftPanel.style.left = "0";
    });
  }

  if (closeButton && leftPanel) {
    closeButton.addEventListener('click', () => {
      leftPanel.style.left = "-100%";
    });
  }
}

function setupCardListeners() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const folders = [
        'songs/cs',
        'songs/rock',
        'songs/pop',
        'songs'
      ];
      const folderToLoad = folders[index] || 'songs';
      loadMusicFolder(folderToLoad);
      const mainHeading = document.getElementById('main-h1');
      if (mainHeading) {
        const folderNames = ['CS Songs', 'Rock Songs', 'Pop Songs', 'All Songs'];
        mainHeading.textContent = folderNames[index] || 'Songs';
      }
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

function getSongs(folder = 'songs') {
  currentFolder = folder;
  let endpoint;
  if (folder === 'songs') {
    endpoint = '/songs';
  } else {
    const folderName = folder.split('/').pop();
    endpoint = `/songs/${folderName}`;
  }
  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      songsData = data;
      const songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
      songsUl.innerHTML = '';
      for (const song of data) {
        songsUl.innerHTML += ` <li>
                            <img class="invert" src="resourses/musik.svg">
                            <div class="songInfo">
                                <div>${song}</div>
                                <div>Waris</div>
                            </div>
                            <div class="playCont">
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="resourses/play-button.svg">
                                </div>
                            </div>
                        </li>`;
      }
      Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((listItem, index) => {
        const playButton = listItem.querySelector(".playNow");
        const songName = listItem.querySelector(".songInfo").firstElementChild.innerHTML.trim();
        playButton.addEventListener("click", () => {
          playMusik(songName);
        });
      });
      setupPlaybarListeners(data);
    })
    .catch(err => {
      const songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
      songsUl.innerHTML = '<li style="color: #ff6b6b; padding: 20px;">Error loading songs from this folder</li>';
    });
}

function setupPlaybarListeners(data) {
  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    const newPlayBtn = playBtn.cloneNode(true);
    playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
    newPlayBtn.addEventListener("click", () => {
      if (currentSong.paused) {
        if (currentSong.src) {
          currentSong.play();
          document.getElementById("btnImg").src = 'resourses/pause.svg';
        } else if (data.length > 0) {
          playMusik(data[0]);
        }
      } else {
        currentSong.pause();
        document.getElementById("btnImg").src = 'resourses/play-button.svg';
      }
    });
  }
  currentSong.removeEventListener("timeupdate", updateTimeDisplay);
  currentSong.removeEventListener("ended", handleSongEnd);
  currentSong.addEventListener("timeupdate", updateTimeDisplay);
  currentSong.addEventListener("ended", handleSongEnd);
  setupControlButtons();
  setupVolumeControl();
  setupSeekBar();
}

function updateTimeDisplay() {
  const playbarSongInfo = document.querySelector(".playbar .songDetail");
  const songTime = document.querySelector(".songTime");
  if (playbarSongInfo && currentSongName) {
    playbarSongInfo.innerHTML = currentSongName;
  }
  if (songTime) {
    const currentTime = Math.floor(currentSong.currentTime);
    const duration = Math.floor(currentSong.duration) || 0;
    const currentMin = Math.floor(currentTime / 60);
    const currentSec = currentTime % 60;
    const durationMin = Math.floor(duration / 60);
    const durationSec = duration % 60;
    songTime.innerHTML = `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${durationMin}:${durationSec.toString().padStart(2, '0')}`;
  }
}

function handleSongEnd() {
  playNext();
}

function setupControlButtons() {
  const songControls = document.querySelector('.songControlls');
  if (!songControls) return;
  const controlImages = songControls.querySelectorAll('img');
  controlImages.forEach((img) => {
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
  });
  const newControlImages = songControls.querySelectorAll('img');
  newControlImages.forEach((img, index) => {
    if (img.src.includes('previuse.svg')) {
      img.addEventListener("click", () => {
        playPrevious();
      });
    } else if (img.src.includes('next.svg')) {
      img.addEventListener("click", () => {
        playNext();
      });
    }
  });
}

function setupVolumeControl() {
  const volInput = document.querySelector(".volDiv input");
  if (volInput) {
    const newVolInput = volInput.cloneNode(true);
    volInput.parentNode.replaceChild(newVolInput, volInput);
    newVolInput.addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100
      if (currentSong.volume > 0) {
        document.querySelector(".volDiv img").src = document.querySelector(".volDiv img").src.replace("mute.svg", "volume.svg")
      }
    });
  }
}

function setupSeekBar() {
  const seekBar = document.querySelector(".seekBar");
  if (seekBar) {
    const newSeekBar = seekBar.cloneNode(true);
    seekBar.parentNode.replaceChild(newSeekBar, seekBar);
    newSeekBar.addEventListener("click", e => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".seekCircle").style.left = percent + "%";
      currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });
  }
}

function loadMusicFolder(folderName) {
  getSongs(folderName);
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigationListeners();
  setupCardListeners();
  getSongs();
});
