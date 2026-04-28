export const CONFIG = {
    DEFAULT_VOLUME: 0.7,
    LOOP_MODES: ['none', 'all', 'one'],
    LOOP_MODE_NAMES: {
        none: '顺序播放',
        all: '列表循环',
        one: '单曲循环'
    }
};

export const DEMO_SONGS = [
    {
        id: 1,
        name: '一样的月光',
        artist: '徐佳莹',
        album: 'LaLa首张创作专辑',
        cover: 'img/徐佳莹.png',    // 封面图片路径
        url: 'music/一样的月光.mp3',    // 音乐文件路径
        duration: 221,                 // 歌曲时长
        lyrics: 'lyrics/一样的月光.lrc'    // LRC歌词文件路径
    },
    {
        id: 2,
        name: '孤雏',
        artist: 'AGA',
        album: '孤雏',
        cover: 'img/AGA.jpg',    // 封面图片路径
        url: 'music/孤雏.mp3',    // 音乐文件路径
        duration: 261,                 // 歌曲时长
        lyrics: 'lyrics/孤雏.lrc'    // LRC歌词文件路径
    },
    {
        id: 3,
        name: '那些年',
        artist: '胡夏',
        album: '那些年，我们一起追的女孩',
        cover: 'img/那些年，我们一起追的女孩.jpg',    // 封面图片路径
        url: 'music/那些年.mp3',    // 音乐文件路径
        duration: 333,                 // 歌曲时长
        lyrics: 'lyrics/那些年.lrc'    // LRC歌词文件路径
    },
    {
        id: 4,
        name: '雨过后的风景',
        artist: 'Dizzy Dizzo',
        album: '黑色彩虹',
        cover: 'img/黑色彩虹.jpg',    // 封面图片路径
        url: 'music/雨过后的风景.mp3',    // 音乐文件路径
        duration: 231,                 // 歌曲时长
        lyrics: 'lyrics/雨过后的风景.lrc'    // LRC歌词文件路径
    },
    {
        id: 5,
        name: '慢冷',
        artist: '梁静茹',
        album: '慢冷',
        cover: 'img/梁静茹.png',    // 封面图片路径
        url: 'music/慢冷.mp3',    // 音乐文件路径
        duration: 252,                 // 歌曲时长
        lyrics: 'lyrics/慢冷.lrc'    // LRC歌词文件路径
    }
];
