let currentSong = new Audio();
let songs;
let currFolder;

function timeFormat(seconds){
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for(let i=0; i<as.length; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    return songs;
}

const playMusic = (track, pause=false) => {
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "/img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

    // show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert songImg" src="/img/music.svg" alt="music">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <!-- <div>artist name</div> -->
        </div>
        <div class="playNow">
            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 bneLcE"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
        </div>
    </li>`;
    }
    // Attack an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    });
}

async function main(){

    

    // Get the list of all songs
    songs = await getSongs("songs");
    playMusic(songs[0], true)

    

    // Attack an event listener to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "/img/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "/img/play.svg";
        }
    });

    // Listen for timeupdate events
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${timeFormat(currentSong.currentTime)}/${timeFormat(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left =  '0';
        document.querySelector(".left").style.display =  'block';
    });

    // Add an event listener for hamburger close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left =  '-100%';
        document.querySelector(".left").style.display =  'none';
    });

    // Add an event listener for previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if((index-1) < 0){
            playMusic(songs[songs.length-1]);
        }
        else{
            playMusic(songs[index-1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if((index+1) >= songs.length){
            playMusic(songs[0]);
        }
        else{
            playMusic(songs[index+1]);
        }
    });

    // Load the playlist whenever card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(e =>{
        e.addEventListener("click", async (item) =>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })
}

main();