const Sounds = {
    musics: [],
    sounds: [],
    musicVolume: 0.75,
    soundVolume: 0.75,
    init: function() {
        var storage = window.localStorage;
        if (!storage.getItem('musicVolume')) {
            storage.setItem('musicVolume', this.musicVolume);
        } else {
            console.log('restoring stored volume');
            this.musicVolume = storage.getItem('musicVolume');
            console.log(this.musicVolume);
        }
        if (!storage.getItem('soundVolume')) {
            storage.setItem('soundVolume', this.soundVolume);
        } else {
            this.soundVolume = storage.getItem('soundVolume');
        }
    },
    updateStorage: function() {
        var storage = window.localStorage;
        storage.setItem('musicVolume', this.musicVolume);
        storage.setItem('soundVolume', this.soundVolume);
    },
    getMusicVolume: function() {
        return this.musicVolume;
    },
    getSoundVolume: function() {
        return this.soundVolume;
    },
    addSound: function(key, value) {
        if (!this.sounds[key]) {
            this.sounds[key] = value;
        }
    },
    addMusic: function(key, value) {
        if (!this.musics[key]) {
            this.musics[key] = value;
        }
    },
    playSound: function(key, volume=this.soundVolume)
    {
        if (this.sounds[key]) {
            this.sounds[key].setVolume(volume);
            this.sounds[key].play();
        }
    },
    playMusic: function(key, loop=true, volume=this.musicVolume)
    {
        if (this.musics[key]) {
            this.musics[key].setVolume(volume);
            this.musics[key].loop = loop;
            this.musics[key].play();
        }
    },
    stopSound: function(key) {
        if (this.sounds[key]) {
            this.sounds[key].stop();
        }
    },
    pauseMusic: function(key)
    {
        if (this.musics[key]) {
            this.musics[key].pause();
        }
    },
    resumeMusic: function(key)
    {
        if (this.musics[key]) {
            this.musics[key].resume();
        }
    }, 
    stopMusic: function(key)
    {
        if (this.musics[key]) {
            this.musics[key].stop();
        }
    },
    updateMusicVolume: function(volume)
    {
        this.musicVolume = volume;
        Object.keys(this.musics).forEach(function(key) {
            if (this.musics[key].isPlaying) {
                this.musics[key].setVolume(this.musicVolume);
            }
        }, this);
        this.updateStorage();
    },
    updateSoundVolume: function(volume)
    {
        this.soundVolume = volume;
        this.updateStorage();
    }
};

export default Sounds;