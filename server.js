const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 8080;

// Use the cors middleware
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '/')));

// Main API endpoint to get songs from main songs folder
app.get('/songs', (req, res) => {
  const songsDirectory = path.join(__dirname, 'songs');
  console.log('Requesting songs from main folder:', songsDirectory);

  fs.readdir(songsDirectory, (err, files) => {
    if (err) {
      console.error('Error reading songs directory:', err);
      return res.status(500).json({ error: 'Unable to scan directory: ' + songsDirectory });
    }

    const songFiles = files.filter(file => {
      const isFile = fs.statSync(path.join(songsDirectory, file)).isFile();
      const isAudio = file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg') || file.endsWith('.m4a');
      return isFile && isAudio;
    });

    console.log('Found songs in main folder:', songFiles);
    res.json(songFiles);
  });
});

// API endpoint to get songs from subfolders
app.get('/songs/:folder', (req, res) => {
  const folderParam = req.params.folder;
  const songsDirectory = path.join(__dirname, 'songs', folderParam);
  
  console.log('Requesting songs from subfolder:', songsDirectory);

  // Check if directory exists first
  if (!fs.existsSync(songsDirectory)) {
    console.error('Directory does not exist:', songsDirectory);
    return res.status(404).json({ error: 'Folder not found: songs/' + folderParam });
  }

  fs.readdir(songsDirectory, (err, files) => {
    if (err) {
      console.error('Error reading songs directory:', err);
      return res.status(500).json({ error: 'Unable to scan directory: ' + songsDirectory });
    }

    const songFiles = files.filter(file => {
      try {
        const isFile = fs.statSync(path.join(songsDirectory, file)).isFile();
        const isAudio = file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg') || file.endsWith('.m4a');
        return isFile && isAudio;
      } catch (e) {
        return false;
      }
    });

    console.log('Found songs in', folderParam, ':', songFiles);
    res.json(songFiles);
  });
});

// Get list of available folders/categories
app.get('/folders', (req, res) => {
  const songsDirectory = path.join(__dirname, 'songs');
  
  fs.readdir(songsDirectory, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading songs directory:', err);
      return res.status(500).json({ error: 'Unable to scan directory' });
    }

    // Get only directories
    const folders = files
      .filter(file => file.isDirectory())
      .map(file => file.name);

    console.log('Available folders:', folders);
    res.json(folders);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET http://localhost:${port}/songs (main songs folder)`);
  console.log(`- GET http://localhost:${port}/songs/cs (songs/cs folder)`);
  console.log(`- GET http://localhost:${port}/songs/rock (songs/rock folder)`);
  console.log(`- GET http://localhost:${port}/folders (list all folders)`);
});