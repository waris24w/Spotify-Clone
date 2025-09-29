let currentSong = new Audio();
let songsData = []; // Store songs data globally
let currentSongName = ''; // Track current song name
let currentIndex = 0;
let currentFolder = 'songs'; // Track current folder

const playMusik = (track) => {
  currentSong.src = `/${currentFolder}/${track}`;
  currentSongName = track; // Store current song name
  
  // Update currentIndex when a song is played
  currentIndex = songsData.findIndex(song => song === track);
  console.log("Current index updated to:", currentIndex, "for song:", track);
  
  currentSong.play().catch(err => console.error("Error playing song:", err));
  
  // Update the playbar song info
  const playbarSongInfo = document.querySelector(".playbar .songInfo");
  if (playbarSongInfo) {
    playbarSongInfo.innerHTML = track;
  }
  
  // Update play button image to pause when song starts
  const playBtnImg = document.getElementById("btnImg");
  if (playBtnImg) {
    playBtnImg.src = 'resourses/pause.svg';
  }
}

function playPrevious() {
  console.log("playPrevious called, currentIndex:", currentIndex);
  if (songsData.length > 0) {
    let prevIndex = currentIndex - 1;
    
    // If we're at the first song, go to the last song
    if (prevIndex < 0) {
      prevIndex = songsData.length - 1;
    }
    
    console.log("Playing previous:", songsData[prevIndex]);
    playMusik(songsData[prevIndex]);
  }
}

function playNext() {
  console.log("playNext called, currentIndex:", currentIndex);
  if (songsData.length > 0) {
    let nextIndex = currentIndex + 1;
    
    // If we're at the last song, go to the first song
    if (nextIndex >= songsData.length) {
      nextIndex = 0;
    }
    
    console.log("Playing next:", songsData[nextIndex]);
    playMusik(songsData[nextIndex]);
  }
}

function setupNavigationListeners() {
  const hamburger = document.querySelector("#hamburger");
  const closeButton = document.querySelector(".closeCont");
  const leftPanel = document.querySelector(".left");

  if (hamburger && leftPanel) {
    hamburger.addEventListener('click', () => {
      console.log("Hamburger clicked"); // Debug log
      leftPanel.style.left = "0";
    });
  } else {
    console.error("Hamburger or left panel not found");
  }

  if (closeButton && leftPanel) {
    closeButton.addEventListener('click', () => {
      console.log("Close button clicked"); // Debug log
      leftPanel.style.left = "-100%";
    });
  } else {
    console.error("Close button or left panel not found");
  }
}

// Setup card click listeners
function setupCardListeners() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      console.log(`Card ${index + 1} clicked`);
      
      // Define different folders for different cards
      const folders = [
        'songs/cs',      // First card loads CS songs
        'songs/rock',    // Second card loads Rock songs  
        'songs/pop',     // Third card loads Pop songs
        'songs'          // Default folder
      ];
      
      // Get the folder for this card (with fallback to default)
      const folderToLoad = folders[index] || 'songs';
      
      // Load songs from the selected folder
      loadMusicFolder(folderToLoad);
      
      // Update the main heading to show what's loaded
      const mainHeading = document.getElementById('main-h1');
      if (mainHeading) {
        const folderNames = ['CS Songs', 'Rock Songs', 'Pop Songs', 'All Songs'];
        mainHeading.textContent = folderNames[index] || 'Songs';
      }
      
      // Add visual feedback - highlight selected card
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

// Modified getSongs function to accept folder parameter
function getSongs(folder = 'songs') {
  currentFolder = folder; // Update current folder
  
  // Build the API endpoint based on folder structure
  let endpoint;
  if (folder === 'songs') {
    endpoint = 'http://127.0.0.1:8080/songs';
  } else {
    // For subfolders like 'songs/cs', extract just the subfolder name
    const folderName = folder.split('/').pop();
    endpoint = `http://127.0.0.1:8080/songs/${folderName}`;
  }
  
  console.log("Loading songs from:", endpoint);
  
  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      console.log("Songs:", data);
      songsData = data; // Store data globally
      
      const songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
      
      // Clear existing content first
      songsUl.innerHTML = '';
      
      // Add songs to the list
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

      // Add click listeners to each "Play Now" button
      Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((listItem, index) => {
        const playButton = listItem.querySelector(".playNow");
        const songName = listItem.querySelector(".songInfo").firstElementChild.innerHTML.trim();
        
        playButton.addEventListener("click", () => {
          console.log("Playing:", songName);
          playMusik(songName);
        });
      });

      // Setup all other event listeners (only once)
      setupPlaybarListeners(data);
      
    })
    .catch(err => {
      console.error('Error loading songs:', err);
      // Show error message to user
      const songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
      songsUl.innerHTML = '<li style="color: #ff6b6b; padding: 20px;">Error loading songs from this folder</li>';
    });
}

// Separate function for playbar listeners to avoid duplicate listeners
function setupPlaybarListeners(data) {
  // Clear existing listeners by cloning elements (removes all event listeners)
  const playBtn = document.getElementById("playBtn");
  const playBtnImg = document.getElementById("btnImg");
  const playbarSongInfo = document.querySelector(".playbar .songDetail");
  const songTime = document.querySelector(".songTime");

  // Play button in playbar (if it exists)
  if (playBtn) {
    // Clone to remove existing listeners
    const newPlayBtn = playBtn.cloneNode(true);
    playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
    
    newPlayBtn.addEventListener("click", () => {
      if (currentSong.paused) {
        if (currentSong.src) {
          currentSong.play();
          document.getElementById("btnImg").src = 'resourses/pause.svg';
        } else if (data.length > 0) {
          // If no song is loaded, play the first song
          playMusik(data[0]);
        }
      } else {
        currentSong.pause();
        document.getElementById("btnImg").src = 'resourses/play-button.svg';
      }
    });
  }

  // Remove existing timeupdate listeners
  currentSong.removeEventListener("timeupdate", updateTimeDisplay);
  currentSong.removeEventListener("ended", handleSongEnd);

  // Add new listeners
  currentSong.addEventListener("timeupdate", updateTimeDisplay);
  currentSong.addEventListener("ended", handleSongEnd);

  // Setup control buttons
  setupControlButtons();
  setupVolumeControl();
  setupSeekBar();
}

// Separate functions for cleaner code
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
  
  console.log("Found control images:", controlImages.length);
  
  // Remove existing listeners by cloning
  controlImages.forEach((img) => {
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
  });
  
  // Re-query after cloning
  const newControlImages = songControls.querySelectorAll('img');
  
  newControlImages.forEach((img, index) => {
    if (img.src.includes('previuse.svg')) {
      console.log("Adding previous listener to image");
      img.addEventListener("click", (e) => {
        console.log("Previous image clicked!");
        playPrevious();
      });
    } else if (img.src.includes('next.svg')) {
      console.log("Adding next listener to image");
      img.addEventListener("click", (e) => {
        console.log("Next image clicked!");
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
      console.log("Setting volume to", e.target.value, "/ 100")
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

// Function to switch between different music folders
function loadMusicFolder(folderName) {
  console.log("Switching to folder:", folderName);
  getSongs(folderName);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  setupNavigationListeners();
  setupCardListeners(); // Setup card click listeners
  getSongs(); // Load default songs
});