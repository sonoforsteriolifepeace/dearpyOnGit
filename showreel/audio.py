import numpy as np, wave
SR=44100; D=15.0; N=int(SR*D)
rs=np.random.default_rng(3)
L=np.zeros(N); R=np.zeros(N); VL=np.zeros(N); VR=np.zeros(N)  # dry + reverb send
def tt(d): return np.arange(int(d*SR))/SR
def add(sig,t,g=1.0,pan=0.0,verb=0.0):
    i=int(round(t*SR)); n=min(len(sig),N-i)
    if n<=0: return
    l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    L[i:i+n]+=sig[:n]*g*l*1.414; R[i:i+n]+=sig[:n]*g*r*1.414
    if verb: VL[i:i+n]+=sig[:n]*g*verb*l; VR[i:i+n]+=sig[:n]*g*verb*r
def lp(x,fc):
    fc=np.broadcast_to(np.asarray(fc,float),x.shape)
    a=1-np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s+=a[i]*(x[i]-s); y[i]=s
    return y
def hp(x,fc): return x-lp(x,fc)
def kick(big=False):
    t=tt(.6 if big else .38); f=42+(160 if big else 120)*np.exp(-t*28)
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*(3.5 if big else 8))
    return np.tanh(2.2*s)+rs.standard_normal(len(t))*np.exp(-t*400)*.25
def sub(d=1.8):
    t=tt(d); f=36+22*np.exp(-t*6); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6)*np.minimum(1,t*200)
def crash(d=1.6):
    t=tt(d); x=hp(rs.standard_normal(len(t)),4000); return x*np.exp(-t*2.6)
def hat(open_=False):
    t=tt(.25 if open_ else .05); x=hp(rs.standard_normal(len(t)),7000); return x*np.exp(-t*(18 if open_ else 90))
def clap():
    t=tt(.3); x=lp(hp(rs.standard_normal(len(t)),900),3500)
    e=sum(np.exp(-np.clip(t-o,0,None)*120)*(t>=o) for o in (0,.009,.019))+ .5*np.exp(-t*14)
    return x*e
def tick(f=2600,d=.03):
    t=tt(d); return np.sin(2*np.pi*f*t)*np.exp(-t*160)+hp(rs.standard_normal(len(t)),5000)*np.exp(-t*400)*.4
def blip(f):
    t=tt(.16); return (np.sin(2*np.pi*f*t)+.3*np.sin(4*np.pi*f*t))*np.exp(-t*26)
def whoosh(d,up=True):
    t=tt(d); k=t/d; env=np.sin(np.pi*k)**2
    fc=(300+9000*k**2) if up else (9000-8700*k**.5)
    return lp(rs.standard_normal(len(t)),fc)*env
def riser(d):
    t=tt(d); k=t/d
    return lp(rs.standard_normal(len(t)),200+12000*k**3)*k**2.5
def saw(f,d):
    t=tt(d); ph=(f*t)%1; return 2*ph-1
def bell(f,d=2.4):
    t=tt(d); s=np.zeros_like(t)
    for m,a,dc in [(1,1,1.6),(2.0,.5,2.4),(2.76,.35,3.2),(5.4,.2,5),(8.93,.1,7)]:
        s+=a*np.sin(2*np.pi*f*m*t)*np.exp(-t*dc)
    return s*np.minimum(1,t*800)

# ---- S1: heartbeat + sonified clock (square wave pitch climb) ----
for b in (0,.5,1.0,1.5):
    add(sub(.5)*.9,b,.55); add(tick(1800),b,.25,verb=.4)
t=tt(1.35); k=t/1.35
f=55*2**(6.2*k**1.6)
sq=np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))
osc=lp(sq,1500+6000*k)*np.minimum(1,k*6)*.16
add(osc,.5,1.0,verb=.3)
add(riser(.4)*.45,1.6,1.0)
# ---- main groove 2–12 ----
bass_notes=[55.0,43.65,65.41,49.0,55.0]   # A F C G A (per bar)
for bar in range(5):
    t0=2+bar*2
    for e in range(16):  # eighth notes... 16th-driven bass
        tt0=t0+e*.125
        if tt0>=12: break
        if e%2==0 or e in (7,11,15):
            d=.12; sg=saw(bass_notes[bar],d)+.5*saw(bass_notes[bar]*1.005,d)
            env=np.exp(-tt(d)*18)*np.minimum(1,tt(d)*400)
            sg=lp(sg*env,500+700*(e%4==0)+bar*150)
            add(sg,tt0,.55)
for i in range(20):
    tb=2+i*.5
    add(kick(big=(tb in (2.0,4.0,8.0))), tb, .9)
    if i%2==1: add(clap(),tb,.45,pan=.05,verb=.35)
    add(hat(),tb+.25,.18,pan=.3)
    for s16 in (.125,.375): add(hat(),tb+s16,.07,pan=-.35)
for h in (2.0,8.0): add(sub(),h,.7); add(crash(),h,.35,verb=.3)
add(crash(1.0),4.0,.2); add(crash(1.0),10.0,.18)
add(clap(),2.5,.3,verb=.5)                        # RÉEL
add(whoosh(.5),3.5,.35,pan=-.5); add(whoosh(.5,False),3.52,.25,pan=.5)   # strips
for i,tb in enumerate((5.1,5.25,5.4)): add(blip(880*2**(i*4/12)),tb,.28,verb=.4)  # selections
add(tick(900,.08),5.55,.3)
add(whoosh(.4),5.62,.4)                         # paper wipe
# gantt: tick each scheduled unit start
for u in range(25):
    t_=6+.18+1.44*(0.5-0.5*np.cos(np.pi*u/24))
    add(tick(3200 if u%4==0 else 2400),t_,.12,pan=-.6+1.2*u/24)
add(riser(.5)*.5,7.5,.9)
# keyword blips
scale=[0,3,7,10,12,15,19,22]
for i in range(8): add(blip(440*2**(scale[i]/12)),8+i*.25,.3,pan=(-.4 if i%2 else .4),verb=.35)
add(whoosh(.36),9.64,.35)
# digit rattles + landings
for k in range(4):
    S=10.04+.05*k; Ld=10.38+.25*k
    tr=S
    while tr<Ld-.02:
        add(tick(3000+400*k,.015),tr,.06,pan=-.6+.4*k); tr+= .018+.09*((tr-S)/(Ld-S))**2
    add(kick()*.6,Ld,.5); add(blip(220*2**(scale[k]/12)),Ld,.25,verb=.3)
# clock wipe
add(whoosh(.55),11.45,.45,pan=-.3)
# ---- S7: resolve ----
add(sub(2.5),12.0,.55); add(crash(2.0),12.0,.25,verb=.5)
t=tt(3.0)
pad=sum(np.sin(2*np.pi*f*t+ph) for f,ph in [(220,0),(261.63,1),(329.63,2),(440*1.003,.5)])
pad=pad*np.minimum(1,t/.6)*np.exp(-np.clip(t-2.6,0,None)*6)*.07
add(pad,12.0,1.0,verb=.6)
for i in range(16):
    add(tick(2100 if i%2 else 2700,.03),12+i*.125,.12+.1*i/16,pan=(.25 if i%2 else -.25))
add(riser(.9)*.6,13.1,1.0)
add(kick(big=True),14.0,1.0); add(sub(2.0),14.0,.9); add(crash(1.8),14.0,.45,verb=.5)
add(bell(880),14.0,.35,verb=.8); add(bell(1318.5),14.03,.16,pan=.3,verb=.8)
add(blip(1760)*.6,14.92,.25,verb=.6)
# ---- reverb ----
irl=int(1.4*SR); ti=np.arange(irl)/SR
def ir(): return lp(rs.standard_normal(irl),5000)*np.exp(-ti*3.2)
def conv(x,h):
    n=1<<int(np.ceil(np.log2(len(x)+len(h)))); return np.fft.irfft(np.fft.rfft(x,n)*np.fft.rfft(h,n),n)[:len(x)]
wl=conv(VL,ir()); wr=conv(VR,ir()); g=.35/np.max(np.abs(np.concatenate([wl,wr]))+1e-9)*np.max(np.abs(np.concatenate([VL,VR])))
L+=wl*g*3; R+=wr*g*3
mix=np.stack([L,R],1)
fade=np.ones(N); fn=int(.08*SR); fade[-fn:]=np.linspace(1,0,fn); mix*=fade[:,None]
mix=np.tanh(mix*1.1/np.max(np.abs(mix))*1.6)/np.tanh(1.6)*.94
with wave.open('audio.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok', mix.shape)
