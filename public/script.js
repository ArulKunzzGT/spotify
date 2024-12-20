let trackQueue = [];
let currentAudio = null;

function addToQueue(trackUrl) {
    trackQueue.push(trackUrl);
    if (trackQueue.length === 1 && currentAudio === null) {
        playNextTrack();
    }
    alert("Lagu ditambahkan ke antrian");
}

function playNextTrack() {
    if (trackQueue.length === 0) {
        alert("Antrian kosong.");
        $('#trackModal').modal('hide');
        currentAudio = null;
        return;
    }

    const currentTrackUrl = trackQueue.shift();

    $('#waitModal').modal('show');

    fetch(`https://spotifyapi.caliphdev.com/api/info/track?url=${currentTrackUrl}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');

            if (!modalTitle || !modalContent) {
                console.error("Elemen modal tidak ditemukan!");
                $('#waitModal').modal('hide');
                return;
            }

            modalTitle.textContent = data.title;
            modalContent.innerHTML = `
                <img src="${data.thumbnail}" alt="${data.title}" class="w-100 rounded">
                <p><strong>Artis:</strong> ${data.artist}</p>
                <p><strong>Album:</strong> ${data.album}</p>
            `;

            if (currentAudio) {
                currentAudio.pause();
                currentAudio.remove();
                currentAudio = null;
            }

            currentAudio = new Audio();
            if (!currentAudio) {
                console.error("Gagal membuat elemen audio!");
                $('#waitModal').modal('hide');
                return;
            }

            currentAudio.controls = true;
            currentAudio.className = "mx-auto mt-4";
            currentAudio.preload = "auto";
            modalContent.appendChild(currentAudio);

            // Pindahkan semua event listener ke dalam satu fungsi
            function setupAudioEventListeners(audioElement) {
                audioElement.addEventListener('loadedmetadata', () => {
                    console.log("Metadata audio dimuat.");
                    $('#waitModal').modal('hide');
                    $('#trackModal').modal('show');
                    audioElement.play();
                });

                audioElement.addEventListener('ended', () => {
                    console.log("Lagu selesai diputar.");
                    playNextTrack();
                });

                audioElement.addEventListener('error', (error) => {
                    console.error("Error loading audio:", error);
                    alert("Gagal memutar audio. Silakan coba lagi nanti.");
                    $('#waitModal').modal('hide');
                    if (trackQueue.length > 0) {
                        trackQueue.shift();
                        playNextTrack();
                    } else {
                        $('#trackModal').modal('hide');
                        currentAudio = null;
                    }
                });
            }

            setupAudioEventListeners(currentAudio);
            currentAudio.src = `https://spotifyapi.caliphdev.com/api/download/track?url=${currentTrackUrl}`;

        })
        .catch(error => {
            console.error('Error fetching track info:', error);
            alert('Gagal mengambil informasi trek. Silakan coba lagi nanti: ' + error.message);
            $('#waitModal').modal('hide');
            if (trackQueue.length > 0) {
                trackQueue.shift();
                playNextTrack();
            } else {
                    $('#trackModal').modal('hide');
                    currentAudio = null;
                }
        });
}

// ... (fungsi searchTracks, closeModal, dan event listener DOMContentLoaded tetap sama)

function searchTracks() {
    const query = document.getElementById('searchInput').value.trim();
    if (query === '') {
        alert('Silakan masukkan kata kunci pencarian.');
        return;
    }

    $('#waitModal').modal('show');

    fetch(`https://spotifyapi.caliphdev.com/api/search/tracks?q=${query}`)
        .then(response => response.json())
        .then(data => {
            const musicGallery = document.getElementById('musicGallery');
            if (!musicGallery) {
                console.error("Elemen musicGallery tidak ditemukan!");
                $('#waitModal').modal('hide');
                return;
            }
            musicGallery.innerHTML = '';

            if (data.length === 0) {
                musicGallery.innerHTML = '<p class="text-center bg-neutral-800">Tidak ada hasil ditemukan.</p>';
                $('#waitModal').modal('hide');
                return;
            }

            data.forEach(track => {
                const card = `
                    <div class="bg-neutral-800 rounded-lg overflow-hidden shadow-md">
                        <img src="${track.thumbnail}" alt="${track.title}" class="w-full h-40 object-cover rounded-t-lg">
                        <div class="p-4">
                            <h2 class="text-lg font-semibold text-white">${track.title}</h2>
                            <p class="text-sm text-gray-400">${track.artist}</p>
                            <button onclick="addToQueue('${track.url}')" class="bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-2">Tambahkan ke Antrian</button>
                        </div>
                    </div>
                `;
                musicGallery.innerHTML += card;
            });

            $('#waitModal').modal('hide');
        })
        .catch(error => {
            console.error('Error fetching tracks:', error);
            alert('Gagal mengambil lagu. Silakan coba lagi nanti.');
            $('#waitModal').modal('hide');
        });
}

function closeModal() {
    $('#trackModal').modal('hide');
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) { // Memastikan elemen ditemukan sebelum menambahkan event listener
        searchInput.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchTracks();
            }
        });
    } else {
        console.error("Elemen searchInput tidak ditemukan!");
    }
});