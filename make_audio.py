"""Generate a completely original soft birthday instrumental. Optional helper to regenerate."""
from pathlib import Path
import numpy as np, wave, subprocess
RATE=32000
BPM=100
BEAT=60/BPM
BARS=16
DURATION=BARS*4*BEAT+2
N=int(DURATION*RATE)
out=np.zeros(N,dtype=np.float64)
rng=np.random.default_rng(6)
notes={'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196,'A3':220,'Bb3':233.08,'B3':246.94,'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392,'A4':440,'Bb4':466.16,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99}

def add(t, key, beats, amp=.16, voice='bell'):
    i=int(t*RATE)
    if i>=N:return
    ln=min(int((beats*BEAT+.8)*RATE),N-i)
    tt=np.arange(ln,dtype=np.float64)/RATE
    f=notes[key]
    if voice=='bell':
        signal=np.sin(2*np.pi*f*tt)+.24*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*4)+.13*np.sin(2*np.pi*3*f*tt)*np.exp(-tt*5)
        env=(1-np.exp(-tt*80))*np.exp(-tt/(beats*BEAT*.8+.35))*np.minimum(1,(ln/RATE-tt)/.22)
    elif voice=='pad':
        signal=np.sin(2*np.pi*f*tt)+.17*np.sin(2*np.pi*2*f*tt)+.08*np.sin(2*np.pi*.5*f*tt)
        env=np.minimum(1,tt/.22)*np.minimum(1,np.maximum(0,(ln/RATE-tt)/.5))*.82
    else:
        signal=np.sin(2*np.pi*f*tt)+.13*np.sin(2*np.pi*2*f*tt)
        env=(1-np.exp(-tt*35))*np.exp(-tt*3.3)*np.minimum(1,(ln/RATE-tt)/.12)
    out[i:i+ln]+=amp*signal*env

chords=[['F3','A3','C4','E4'],['C3','G3','C4','D4'],['D3','F3','A3','C4'],['Bb3','D4','F4','A4']]
melody=[
 [('A4',0,1),('G4',1,1),('F4',2,1),('A4',3,1)],
 [('G4',0,1.5),('E4',1.5,.5),('D4',2,1),('E4',3,1)],
 [('F4',0,1),('A4',1,1),('C5',2,1),('A4',3,1)],
 [('G4',0,1),('F4',1,1),('D4',2,2)],
 [('C5',0,1),('A4',1,1),('G4',2,1),('A4',3,1)],
 [('E4',0,.5),('G4',.5,.5),('C5',1,1),('G4',2,1),('E4',3,1)],
 [('A4',0,1),('G4',1,.5),('F4',1.5,.5),('E4',2,1),('F4',3,1)],
 [('D4',0,1),('F4',1,1),('A4',2,2)]
]
for bar in range(BARS):
    start=bar*4*BEAT
    chord=chords[bar%4]
    for j,k in enumerate(chord):add(start,k,3.9,.024 if j<3 else .016,'pad')
    for j in range(8):add(start+j*.5*BEAT,chord[[0,2,3,2,1,2,3,2][j]],.5,.045,'pluck')
    seq=melody[bar%8]
    for k,pos,length in seq:add(start+pos*BEAT,k,length,.093,'bell')
# gentle stereo echo + soft saturation
out=np.tanh(out*.86)
lag=int(.19*RATE)
echo=np.concatenate([np.zeros(lag),out[:-lag]])*.12
out=out+echo
fade=np.minimum(1,np.arange(N)/(RATE*1.3))*np.minimum(1,(N-np.arange(N))/(RATE*1.5))
out=out*fade
peak=np.max(np.abs(out))
out=out/peak*.73
wavfile=Path(__file__).parent/'assets'/'bestie-bloom.wav'
with wave.open(str(wavfile),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((out*32767).astype('<i2').tobytes())
mp3file=wavfile.with_suffix('.mp3')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wavfile),'-codec:a','libmp3lame','-b:a','112k',str(mp3file)],check=True)
wavfile.unlink()
print(mp3file,mp3file.stat().st_size)
