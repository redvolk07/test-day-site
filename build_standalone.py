from pathlib import Path
import base64
p=Path(__file__).parent
html=(p/'index.html').read_text()
css=(p/'styles.css').read_text()
config=(p/'site.config.js').read_text()
js=(p/'app.js').read_text()
audio=base64.b64encode((p/'assets/bestie-bloom.mp3').read_bytes()).decode('ascii')
config=config.replace("backgroundSong: 'assets/bestie-bloom.mp3'", "backgroundSong: 'data:audio/mpeg;base64,"+audio+"'")
html=html.replace('<link rel="stylesheet" href="styles.css" />', '<style>'+css+'</style>')
html=html.replace('<script src="site.config.js"></script>', '<script>'+config+'</script>')
html=html.replace('<script src="app.js" defer></script>', '')
html=html.replace('</body>', '<script>'+js+'</script>\n</body>')
# Google Fonts work with an internet connection; local fallback remains readable.
(p/'Birthday-Surprise.html').write_text(html)
print('standalone size:',len(html))
