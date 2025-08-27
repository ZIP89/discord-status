let currentpage = 'home';
let currentspotify = null;
let spotifyinterval = null;
let isFirstLoad = true;
let discordDataLoaded = false;
let currentMusicTrack = 0;
let musicAudio = null;
let isMusicPlaying = false;
let musicProgressInterval = null;
let autoPlayAttempted = false;
const musicTracks = [
    {
        name: "Roi",
        file: "audio/MM2.mp3",
        image: "https://i.pinimg.com/736x/32/1a/03/321a03d1c8733bd740cd7fef234b9fac.jpg"
    },
    {
        name: "on one tonight", 
        file: "audio/MM3.mp3",
        image: "https://i.pinimg.com/736x/c1/b2/ec/c1b2ec92e1f7e81640f0ca7915b8d3d8.jpg"
    }
];

const cursorsys = {
    init: function() {
        if (this.ismobile()) return;
        this.cursor = document.getElementById('customCursor');
        if (!this.cursor) {
            console.log('Custom cursor element not found');
            return;
        }
        this.setupevents();
    },
    
    ismobile: function() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    setupevents: function() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
        
        document.addEventListener('mouseenter', () => {
            this.cursor.classList.remove('hidden');
        });
        
        document.addEventListener('mouseleave', () => {
            this.cursor.classList.add('hidden');
        });
        
        const interactives = 'a, button, .nav-link, .avatar, .contact-item, .info-item, .activity-card, .avatar-item, .close-btn, .invite-card, .music-control';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactives)) {
                this.cursor.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactives)) {
                this.cursor.classList.remove('hover');
            }
        });
        
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest(interactives)) {
                this.cursor.classList.add('click');
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.cursor.classList.add('text');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.cursor.classList.remove('text');
            }
        });
    }
};

function initMusicPlayer() {
    const musicPlayerHTML = `
        <div class="music-player">
            <div class="music-header">
                <div class="music-type"></div>
            </div>
            <div class="music-content">
                <div class="music-album-container">
                    <img id="music-cover" class="music-album-art" src="${musicTracks[0].image}" alt="Album Art">
                </div>
                <div class="music-track-info">
                    <div id="music-title" class="music-title">${musicTracks[0].name}</div>
                    <div class="music-artist">lastanswtcf.xyz</div>
                </div>
            </div>
            <div class="music-controls">
                <button class="music-control prev" onclick="previousTrack()">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button class="music-control play-pause" onclick="togglePlayPause()" id="playPauseBtn">
                    <i class="fas fa-pause"></i>
                </button>
                <button class="music-control next" onclick="nextTrack()">
                    <i class="fas fa-step-forward"></i>
                </button>
            </div>
            <div class="music-progress-container">
                <div class="music-progress-bar">
                    <div id="music-progress" class="music-progress-fill"></div>
                </div>
            </div>
            <div class="music-time">
                <span id="current-music-time">0:00</span>
                <span id="total-music-time">0:00</span>
            </div>
        </div>
    `;
    
    return musicPlayerHTML;
}

function loadTrack(trackIndex) {
    const track = musicTracks[trackIndex];
    if (musicAudio) {
        musicAudio.pause();
        musicAudio = null;
    }
    
    musicAudio = new Audio(track.file);
    document.getElementById('music-cover').src = track.image;
    document.getElementById('music-title').textContent = track.name;
    musicAudio.addEventListener('loadedmetadata', () => {
        document.getElementById('total-music-time').textContent = formattime(musicAudio.duration * 1000);
    });
    musicAudio.addEventListener('ended', () => {
        nextTrack();
    });
    musicAudio.addEventListener('timeupdate', updateMusicProgress);
}

function autoStartMusic() {
    loadTrack(currentMusicTrack);
    const playPromise = musicAudio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
            console.log('a inceput');
        }).catch(() => {
            isMusicPlaying = false;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
            setTimeout(() => {
                const retryPromise = musicAudio.play();
                if (retryPromise !== undefined) {
                    retryPromise.then(() => {
                        isMusicPlaying = true;
                    }).catch(() => {
                        console.log('autoplay blocat');
                    });
                }
            }, 500);
        });
    }
    
    autoPlayAttempted = true;
}

function togglePlayPause() {
    if (!musicAudio) {
        loadTrack(currentMusicTrack);
    }
    
    if (isMusicPlaying) {
        musicAudio.pause();
        isMusicPlaying = false;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    } else {
        const playPromise = musicAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
            }).catch((error) => {
                console.log('Play failed:', error);
                isMusicPlaying = false;
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
            });
        }
    }
}

function nextTrack() {
    currentMusicTrack = (currentMusicTrack + 1) % musicTracks.length;
    loadTrack(currentMusicTrack);
    if (isMusicPlaying) {
        const playPromise = musicAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                isMusicPlaying = false;
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
            });
        }
    }
}

function previousTrack() {
    currentMusicTrack = (currentMusicTrack - 1 + musicTracks.length) % musicTracks.length;
    loadTrack(currentMusicTrack);
    if (isMusicPlaying) {
        const playPromise = musicAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                isMusicPlaying = false;
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
            });
        }
    }
}

function updateMusicProgress() {
    if (musicAudio) {
        const progress = (musicAudio.currentTime / musicAudio.duration) * 100;
        document.getElementById('music-progress').style.width = progress + '%';
        document.getElementById('current-music-time').textContent = formattime(musicAudio.currentTime * 1000);
    }
}

function hideWakeupOverlay() {
    const overlay = document.getElementById('wakeup-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 1200);
    }
}

function checkIfReadyToWakeup() {
    if (discordDataLoaded && isFirstLoad) {
        setTimeout(hideWakeupOverlay, 300);
        isFirstLoad = false;
    }
}

function makestar() {
    const field = document.getElementById('starfield');
    const num = 300;
    for (let i = 0; i < num; i++) {
        const star = document.createElement('div');
        const size = Math.random();
        let cls = 'star small';
        if (size > 0.9) {
            cls = 'star large';
        } else if (size > 0.7) {
            cls = 'star medium';
        }
        
        star.className = cls;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (3 + Math.random() * 3) + 's';
        
        field.appendChild(star);
    }
}

function showpage(page) {
    const pages = ['home', 'contact'];
    const links = document.querySelectorAll('.nav-link');

    pages.forEach(p => {
        const el = document.getElementById(p);
        if (p === page) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    links.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.trim() === page) {
            link.classList.add('active');
        }
    });

    currentpage = page;
}

function formattime(ms) {
    if (!ms || ms < 0) return '0:00';
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function updatespotify() {
    if (!currentspotify || !currentspotify.timestamps) {
        return;
    }

    const now = Date.now();
    const start = new Date(currentspotify.timestamps.start).getTime();
    const end = new Date(currentspotify.timestamps.end).getTime();
    const current = Math.max(0, now - start);
    const total = end - start;
    if (current >= total) {
        clearInterval(spotifyinterval);
        return;
    }

    const progress = Math.min((current / total) * 100, 100);
    const bar = document.querySelector('.progress-bar');
    const time = document.querySelector('.current-time');
    
    if (bar) {
        bar.style.width = progress + '%';
    }
    
    if (time) {
        time.textContent = formattime(current);
    }
}

function startspotify(activity) {
    currentspotify = activity;
    if (spotifyinterval) {
        clearInterval(spotifyinterval);
    }
    spotifyinterval = setInterval(updatespotify, 1000);
}

function stopspotify() {
    if (spotifyinterval) {
        clearInterval(spotifyinterval);
        spotifyinterval = null;
    }
    currentspotify = null;
}

let serverData = null;
async function getserverinfo(forceRefresh = false) {
    if (serverData && !forceRefresh) return serverData;
    try {
        const response = await fetch('https://discord.com/api/v8/invites/2KGxnucsMG?with_counts=true');
        if (response.ok) {
            const data = await response.json();
            serverData = data;
            return data;
        }
        return null;
    } catch (error) {
        console.log('Server info fetch failed:', error.message);
        return null;
    }
}

function createserverinvitecard(serverData) {
    if (!serverData || !serverData.guild) return '';
    const guild = serverData.guild;
    const iconUrl = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    return `
        <div class="invite-card server-invite" onclick="window.open('https://discord.gg/2KGxnucsMG', '_blank')">
            <div class="invite-header">
                <div class="invite-icon">
                    <img src="${iconUrl}" alt="Server Icon" class="invite-avatar">
                </div>
                <div class="invite-details">
                    <div class="invite-name">${guild.name}</div>
                    <div class="invite-stats">
                        <span class="stat">
                            <div class="status-dot online"></div>
                            ${serverData.approximate_presence_count || 0} Online
                        </span>
                        <span class="stat">
                            <div class="status-dot offline"></div>
                            ${serverData.approximate_member_count || 0} Members
                        </span>
                    </div>
                </div>
                <div class="invite-action">
                    <button class="join-btn">Join Server</button>
                </div>
            </div>
        </div>
    `;
}

function createbotinvitecard() {
    return `
        <div class="invite-card bot-invite" onclick="window.open('https://discord.com/oauth2/authorize?client_id=1166359429273354240', '_blank')">
            <div class="invite-header">
                <div class="invite-icon">
                    <img src="https://cdn.discordapp.com/avatars/1166359429273354240/83c8cd56dfaace42e1b747da24c1c2ab.webp?size=1024" alt="Bot Avatar" class="invite-avatar">
                </div>
                <div class="invite-details">
                    <div class="invite-name">seent</div>
                    <div class="invite-description">Powerful Discord Bot</div>
                </div>
                <div class="invite-action">
                    <button class="join-btn bot-btn">Invite Bot</button>
                </div>
            </div>
        </div>
    `;
}

async function ensureinvitecards() {
    const acts = document.getElementById('activities');
    let existingContainer = acts.querySelector('.invite-cards-container');
    if (!existingContainer) {
        const data = await getserverinfo();
        const serverCard = createserverinvitecard(data);
        const botCard = createbotinvitecard();
        if (serverCard || botCard) {
            const inviteContainer = document.createElement('div');
            inviteContainer.className = 'invite-cards-container';
            inviteContainer.innerHTML = serverCard + botCard;
            acts.appendChild(inviteContainer);
        }
    }
}

function updateserverstatistics(newData) {
    const existingInviteCard = document.querySelector('.server-invite');
    if (!existingInviteCard || !newData || !newData.guild) return;
    const onlineSpan = existingInviteCard.querySelector('.stat:first-child');
    const membersSpan = existingInviteCard.querySelector('.stat:last-child');
    
    if (onlineSpan && membersSpan) {
        onlineSpan.innerHTML = `
            <div class="status-dot online"></div>
            ${newData.approximate_presence_count || 0} Online
        `;
        membersSpan.innerHTML = `
            <div class="status-dot offline"></div>
            ${newData.approximate_member_count || 0} Members
        `;
    }
}

async function refreshserverstatistics() {
    try {
        const newData = await getserverinfo(true);
        if (newData) {
            updateserverstatistics(newData);
        }
    } catch (error) {
        console.log('Failed to refresh server statistics:', error.message);
    }
}

async function getdiscord() {
    try {
        const data = await window._API.safeFetch(window._API.getDiscordApi());
        if (data && data.success) {
            updatediscord(data.data);
            discordDataLoaded = true;
            checkIfReadyToWakeup();
        } else {
            console.log('Discord API returned no data');
            showOfflineState();
            discordDataLoaded = true;
            checkIfReadyToWakeup();
        }
    } catch (error) {
        console.log('Discord service temporarily unavailable:', error.message);
        showOfflineState();
        discordDataLoaded = true;
        checkIfReadyToWakeup();
    }
}

function showOfflineState() {
    const username = document.getElementById('username');
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    const acts = document.getElementById('activities');
    username.textContent = 'lastanswtcf';
    dot.className = 'status-indicator offline';
    text.textContent = 'Offline';
    const existingInviteCards = acts.querySelector('.invite-cards-container');
    acts.innerHTML = `
        <div class="activity-card">
            <div class="activity-header">
                <div class="activity-icon">
                    <i class="fas fa-wifi"></i>
                </div>
                <div class="activity-type">Connection Status</div>
            </div>
            <div class="activity-artist">Unable to connect to Discord services<br>Please check back later</div>
        </div>
    `;
    
    if (existingInviteCards) {
        acts.appendChild(existingInviteCards);
    } else {
        ensureinvitecards();
    }
}

async function updatediscord(data) {
    const avatar = document.getElementById('avatar');
    const username = document.getElementById('username');
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    const acts = document.getElementById('activities');
    if (data.discord_user && data.discord_user.avatar) {
        avatar.src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`;
    }

    username.textContent = data.discord_user.display_name || data.discord_user.username;
    const status = data.discord_status;
    dot.className = `status-indicator ${status}`;
    
    const labels = {
        'online': 'Online',
        'idle': 'Away',
        'dnd': 'Do Not Disturb',
        'offline': 'Offline'
    };
    text.textContent = labels[status] || 'Unknown';
    const existingInviteCards = acts.querySelector('.invite-cards-container');
    const activityElements = acts.querySelectorAll('.activity-card');
    activityElements.forEach(el => el.remove());
    stopspotify();

    if (data.activities && data.activities.length > 0) {
        const sorted = data.activities
            .filter(activity => activity.type !== 4)
            .sort((a, b) => {
                if (a.name === 'Spotify') return -1;
                if (b.name === 'Spotify') return 1;
                return 0;
            });

        if (sorted.length > 0) {
            sorted.forEach(activity => {
                const card = document.createElement('div');
                card.className = `activity-card ${activity.name === 'Spotify' ? 'spotify' : ''}`;
                let content = '';
                if (activity.name === 'Spotify') {
                    const now = Date.now();
                    const start = new Date(activity.timestamps?.start || now).getTime();
                    const end = new Date(activity.timestamps?.end || now).getTime();
                    const current = Math.max(0, now - start);
                    const total = end - start;
                    const progress = Math.min((current / total) * 100, 100);
                    let albumImageUrl = '';
                    if (activity.assets && activity.assets.large_image) {
                        if (activity.assets.large_image.startsWith('spotify:')) {
                            const imageId = activity.assets.large_image.replace('spotify:', '');
                            albumImageUrl = `https://i.scdn.co/image/${imageId}`;
                        } else if (activity.assets.large_image.startsWith('https://')) {
                            albumImageUrl = activity.assets.large_image;
                        }
                    }

                    content = `
                        <div class="activity-header">
                            <div class="activity-icon">
                                <i class="fab fa-spotify"></i>
                            </div>
                            <div class="activity-type">Listening to Spotify</div>
                        </div>
                        <div class="spotify-content">
                            ${albumImageUrl ? `
                            <div class="spotify-album-container">
                                <img src="${albumImageUrl}" alt="Album Art" class="spotify-album-art" />
                            </div>
                            ` : ''}
                            <div class="spotify-track-info">
                                <div class="activity-title">${activity.details || 'Unknown Track'}</div>
                                <div class="activity-artist">by ${activity.state || 'Unknown Artist'}</div>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-time">
                            <span class="current-time">${formattime(current)}</span>
                            <span>${formattime(total)}</span>
                        </div>
                    `;

                    setTimeout(() => startspotify(activity), 100);
                } else {
                    let type = '';
                    let icon = '';
                    let hasImage = false;
                    let imageUrl = '';
                    if (activity.assets) {
                        if (activity.assets.large_image) {
                            hasImage = true;
                            if (activity.assets.large_image.startsWith('mp:')) {
                                const imageId = activity.assets.large_image.replace('mp:', '');
                                imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageId}.png`;
                            } else if (activity.assets.large_image.startsWith('https://')) {
                                imageUrl = activity.assets.large_image;
                            } else if (activity.application_id) {
                                imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                            }
                        }
                    }
                    
                    switch(activity.type) {
                        case 0:
                            type = 'Playing';
                            icon = '<i class="fas fa-gamepad"></i>';
                            break;
                        case 1:
                            type = 'Streaming';
                            icon = '<i class="fas fa-video"></i>';
                            break;
                        case 2:
                            type = 'Listening to';
                            icon = '<i class="fas fa-music"></i>';
                            break;
                        case 3:
                            type = 'Watching';
                            icon = '<i class="fas fa-eye"></i>';
                            break;
                        case 5:
                            type = 'Competing in';
                            icon = '<i class="fas fa-trophy"></i>';
                            break;
                        default:
                            type = 'Using';
                            icon = '<i class="fas fa-laptop"></i>';
                    }

                    if (hasImage && imageUrl) {
                        content = `
                            <div class="activity-header">
                                <div class="activity-icon">${icon}</div>
                                <div class="activity-type">${type} ${activity.name}</div>
                            </div>
                            <div class="spotify-content">
                                <div class="spotify-album-container">
                                    <img src="${imageUrl}" alt="${activity.name} Image" class="spotify-album-art" onerror="this.style.display='none'; this.nextElementSibling.style.marginLeft='0';" />
                                </div>
                                <div class="spotify-track-info">
                                    <div class="activity-title">${activity.details || activity.name}</div>
                                    ${activity.state ? `<div class="activity-artist">${activity.state}</div>` : ''}
                                </div>
                            </div>
                        `;
                    } else {
                        content = `
                            <div class="activity-header">
                                <div class="activity-icon">${icon}</div>
                                <div class="activity-type">${type} ${activity.name}</div>
                            </div>
                            <div class="activity-title">${activity.details || activity.name}</div>
                            ${activity.state ? `<div class="activity-artist">${activity.state}</div>` : ''}
                        `;
                    }
                }

                card.innerHTML = content;
                if (existingInviteCards) {
                    acts.insertBefore(card, existingInviteCards);
                } else {
                    acts.appendChild(card);
                }
            });
        } else {
            showIdleCard();
        }
    } else {
        showIdleCard();
    }

    await ensureinvitecards();
}

function showIdleCard() {
    const acts = document.getElementById('activities');
    const existingInviteCards = acts.querySelector('.invite-cards-container');
    
    const idleCard = document.createElement('div');
    idleCard.className = 'activity-card';
    idleCard.innerHTML = `
        <div class="activity-header">
            <div class="activity-icon">
                <i class="fas fa-coffee"></i>
            </div>
            <div class="activity-type">Currently Idle</div>
        </div>
        <div class="activity-artist">No active applications detected<br>Probably chilling or coding something cool</div>
    `;
    
    if (existingInviteCards) {
        acts.insertBefore(idleCard, existingInviteCards);
    } else {
        acts.appendChild(idleCard);
    }
}

async function getavatars() {
    try {
        const data = await window._API.safeFetch(window._API.getAvatarApi());
        if (data && data.avatars && Array.isArray(data.avatars)) {
            const validAvatars = [];
            for (const avatarUrl of data.avatars) {
                try {
                    const imgTest = new Image();
                    const isValid = await new Promise((resolve) => {
                        imgTest.onload = () => resolve(true);
                        imgTest.onerror = () => resolve(false);
                        imgTest.src = avatarUrl;
                        setTimeout(() => resolve(false), 3000);
                    });
                    
                    if (isValid) {
                        validAvatars.push({
                            avatar_url: avatarUrl
                        });
                    }
                } catch (error) {
                    console.log('Avatar validation failed');
                }
            }
            
            return validAvatars;
        }
        return null;
    } catch (error) {
        console.log('Avatar history temporarily unavailable');
        return null;
    }
}

function formatdate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

async function showavtmodal() {
    const modal = document.getElementById('avatarmodal');
    const container = document.getElementById('avatarscontainer');
    modal.classList.add('active');
    container.innerHTML = '<div class="avatars-container-wrapper"><div style="text-align: center; padding: 40px;"><div class="loading"></div><div style="margin-top: 16px; color: #888888; font-size: 14px;">Loading avatars...</div></div></div>';
    const avatars = await getavatars();
    if (avatars && avatars.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'avatars-container-wrapper';
        const grid = document.createElement('div');
        grid.className = 'avatars-grid';
        avatars.forEach((avatar, index) => {
            const item = document.createElement('div');
            item.className = 'avatar-item';
            item.innerHTML = `
                <img src="${avatar.avatar_url}" alt="Avatar ${index + 1}" loading="lazy">
            `;
            item.onclick = () => showAvatarPreview(avatar.avatar_url);
            grid.appendChild(item);
        });
        
        wrapper.appendChild(grid);
        container.innerHTML = '';
        container.appendChild(wrapper);
    } else {
        container.innerHTML = '<div class="avatars-container-wrapper"><div style="text-align: center; color: #888888; padding: 40px;">No avatar history available</div></div>';
    }
}

function showAvatarPreview(avatarUrl) {
    const existingPreview = document.getElementById('avatarPreview');
    if (existingPreview) {
        existingPreview.remove();
    }

    const previewModal = document.createElement('div');
    previewModal.id = 'avatarPreview';
    previewModal.className = 'avatar-preview-modal';
    previewModal.innerHTML = `
        <div class="preview-content">
            <button class="preview-close" onclick="closeAvatarPreview()">&times;</button>
            <img src="${avatarUrl}" alt="Avatar Preview" class="preview-image">
            <a href="${avatarUrl}" target="_blank" class="download-btn">
                <i class="fas fa-download"></i>
                Download
            </a>
        </div>
    `;
    
    document.body.appendChild(previewModal);
    setTimeout(() => {
        previewModal.classList.add('active');
    }, 10);
    
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            closeAvatarPreview();
        }
    });
}

function closeAvatarPreview() {
    const previewModal = document.getElementById('avatarPreview');
    if (previewModal) {
        previewModal.classList.remove('active');
        setTimeout(() => {
            previewModal.remove();
        }, 300);
    }
}

function closeavtmodal() {
    const modal = document.getElementById('avatarmodal');
    modal.classList.remove('active');
}

function addMusicPlayer() {
    const discordCard = document.querySelector('.discord-card');
    const musicPlayerElement = document.createElement('div');
    musicPlayerElement.className = 'discord-card music-player-card';
    musicPlayerElement.innerHTML = initMusicPlayer();
    
    if (discordCard) {
        discordCard.parentNode.insertBefore(musicPlayerElement, discordCard.nextSibling);
        loadTrack(0);
        setTimeout(autoStartMusic, 100);
    }
}

function enableAutoPlayOnInteraction() {
    const interactionEvents = ['click', 'keydown', 'touchstart', 'mousemove'];
    function handleFirstInteraction() {
        if (!isMusicPlaying && musicAudio) {
            const playPromise = musicAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isMusicPlaying = true;
                    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
                }).catch(() => {
                    console.log('play');
                });
            }
        }
        
        interactionEvents.forEach(eventType => {
            document.removeEventListener(eventType, handleFirstInteraction);
        });
    }
    
    interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, handleFirstInteraction, { once: true });
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAvatarPreview();
        closeavtmodal();
    }
});

document.getElementById('avatarmodal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeavtmodal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    cursorsys.init();
    makestar();
    setTimeout(() => {
        if (isFirstLoad) {
            hideWakeupOverlay();
            isFirstLoad = false;
        }
    }, 4000);
    
    addMusicPlayer();
    enableAutoPlayOnInteraction();
    const initDiscord = () => {
        if (window._API) {
            getdiscord();
            setInterval(getdiscord, 5000);
            setInterval(refreshserverstatistics, 30000);
        } else {
            setTimeout(initDiscord, 100);
        }
    };
    initDiscord();
});
