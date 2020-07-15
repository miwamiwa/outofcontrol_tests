window.onload = start;
let context;
let sineWaveBuffer;
let env;
let midiloaded = false;
let waitformidi;
const twoPI = Math.PI*2;
let tickConversion = 60000 / (100 * 520);
let filter;
let analyser;
let c = {}; // canvas element

let fishmodel='M80 34 C94 40 94 12 76 22 C70 24 72 28 62 20 C64 26 74 28 64 36 L66 36 C70 36 70 28 76 32 Z';
let fishmodel2='M70 34 C56 40 56 12 74 22 C80 24 78 28 88 20 C86 26 76 28 86 36 L84 36 C80 36 80 28 74 32 Z';
let boatPath;
let fishPath2;
function start(){

//  let splitfish=fishmodel.split("M").split(" ");

  fishPath=new Path2D(fishmodel);
  fishPath2=new Path2D(fishmodel2);
  boatPath=new Path2D('M2 22 C4 34 20 32 22 22 L12 22 L12 14 L8 14 L8 22 Z');
  ////console.log("hello world");
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  filter = context.createBiquadFilter();
  env = new Envelope(0.05,0.1,0.2,2.8);
  analyser = context.createAnalyser();
  analyser.connect(context.destination);
  /*
  sineWaveBuffer = preloadSound(440,1,env,1);
  playSound(sineWaveBuffer);

  delay(sineWaveBuffer,200,6);
  */

  loadmidi();
  waitformidi = setInterval(readyToStart,30);
  createCanvas();

}
let drawwaveInterval;
function readyToStart(){

  if(midiloaded){
    drawwaveInterval=setInterval(draw,60);
    playTune();
    clearInterval(waitformidi);

  }
}
let frame=0;
//let lastplayery=-1;

let lastplayery=-1;
function draw(){

////console.log("hey")
  let scaleX = 0.5;
  let scaleY=0.25;
  c.ctx.fillStyle="#0008";
  c.ctx.fillRect(0,0,c.width,c.height);

  let data = getDataFromAudio();

  let playerx=c.width/2-10;
  let playery=data.t[Math.floor((playerx/c.width)*data.t.length)]*scaleY - 40;
  if(lastplayery==-1) lastplayery=playery;

  if(lastplayery<playery){
    lastplayery+=1;
    playery=lastplayery;
  }


  c.ctx.lineWidth=3;
  c.ctx.save();
  c.ctx.strokeStyle="#f99c";
  c.ctx.fillStyle="#fbbc";
  c.ctx.translate(playerx,playery)
  c.ctx.scale(1.5,1.5);
  c.ctx.stroke(boatPath);
  c.ctx.fill(boatPath);

  c.ctx.restore();
  ////console.log(data);
  for(let i=0; i<data.t.length; i+=8){

    c.ctx.fillStyle="#8886";
    c.ctx.fillRect(i*scaleX,c.height,scaleX*25,-c.height+data.t[i]*scaleY);


  }



  for(let i=fish.length-1; i>=0; i--){
    fish[i].display();

    if(fish[i].frame>=fishSpawnTime){
      fish.splice(i,1);
    }
  }

  frame++;
}

let noteIndex=0;
let fish = [];
let fishSpawnTime=50;
let fishOffsetY=120;
let fishYspacing=50;

let fishPath;

class Fish{
  constructor(x,note){
    //////console.log("fish!")

    this.bigness=1;

    let fact=1;
    if(x>c.width/2);
    fact=-1;

    this.x= x+fact*Math.floor(Math.random()*50);

    while(this.x>c.width){
      this.x= x+fact*Math.floor(Math.random()*50);
    }
    //console.log("note "+note)
    this.initY= c.height- Math.floor( Math.random()*10 +(note/107) * ( 480 ) );
    this.y=this.initY;

    this.direction = 1;
    if(Math.random()>0.5) this.direction=-1;

    this.tick();
    this.note=note;


    this.fill="#88bb";
    this.xSpeed=1;
    this.maxYDisplacement=60;
  }
  tick(){
    this.spawnTime=frame;
    this.despawnTime=frame+fishSpawnTime;
    this.direction*=-1;
    this.frame=0;
    this.bigness+=3;
  }
  display(){
    this.update();
    c.ctx.save();
    if(this.frame<25){
      let r=(250-this.frame*10);
      c.ctx.strokeStyle=`rgba(${r},${r},${r},0.7)`;
    }
    else c.ctx.strokeStyle="rgba(5,5,5,0.7)";

    let fact=this.bigness*2;
    c.ctx.translate(this.x -80 - fact ,this.y -fact);
    let s = (10+this.bigness)/15;

    c.ctx.scale(s,s);
    if(this.direction==1)
    c.ctx.stroke(fishPath);
    else
    c.ctx.stroke(fishPath2);
    //c.ctx.fillRect(this.x,this.y,20,20);
    c.ctx.restore();
  }
  update(){
    if(this.x==0) this.direction=1;
    else if(this.x==c.width) this.direction=-1;

    this.x+=this.xSpeed*this.direction;

    this.y=this.initY+Math.cos(this.frame*2*Math.PI/360)*this.maxYDisplacement;

    this.frame++;
  }
}

function playTune(){

  clearInterval(drawwaveInterval);
  setTimeout(draw,30);
  drawwaveInterval=setInterval(draw,150);


  ////console.log("play")
  let notesToPlay = [];
  let newNoteIndex=0;
  for(let i=noteIndex; i<constrain(noteIndex+12,0,notes.length); i++){
    if(notes[noteIndex].ticks==notes[i].ticks){
      notesToPlay.push(i);
      newNoteIndex=i;
    }
  }

  let randomX = Math.floor(Math.random()*c.width);

  for(let i=0; i<notesToPlay.length; i++){
    //play midi note given by notes[notesToPlay[i]]
    //////console.log(notes[notesToPlay[i]])
    let duration = notes[newNoteIndex].durationTicks*tickConversion/1000;

    sineWaveBuffer = preloadSound(
      Math.pow(2, (notes[notesToPlay[i]].midi - 70) / 12.0) * 440,

      new Envelope(0.05,0.1*duration,0.5,1.85*duration),
      1
    );
    playSound(sineWaveBuffer,notes[notesToPlay[i]].velocity);
    delay(sineWaveBuffer,140,4);
    ////console.log("TICK "+notes[newNoteIndex].ticks)

    let fishIndex = -1;
    for(let j=0; j<fish.length; j++){
      if(fish[j].note==notes[notesToPlay[i]].midi) fishIndex = j;
    }
    if(fishIndex!=-1){
      fish[fishIndex].tick();
    }
    else {
      fish.push(new Fish(randomX,notes[notesToPlay[i]].midi));
    }
  }

  let timeToNext = (notes[newNoteIndex+1].ticks-notes[newNoteIndex].ticks)*tickConversion;

  noteIndex = newNoteIndex+1;
  if(noteIndex<notes.length) setTimeout(playTune,timeToNext);
  else{
    noteIndex=0;
    setTimeout(playTune,1000);
  }


}


let notes = [];

async function loadmidi(){
  const midi = await Midi.fromUrl("prokofiev_vision_fugitives_22_(c)ungar.mid")
  ////console.log(midi.tracks[0].notes);
  notes=midi.tracks[0].notes;

  midiloaded = true;
}

function trunc(input,figuresafter0){
  let mult=Math.pow(10,figuresafter0);
  return Math.floor(input*mult)/mult;
}

function delay(buffer,time,repetitions){

  for(let i=1;i<repetitions; i++){
    let vol = Math.pow(0.8-i/repetitions,2);
    ////console.log(vol);
    setTimeout(function(){
      playSound( buffer,vol )
    },time*i,vol,buffer)
  }
}

// preloadsound()
//
// creates a sound buffer array
// freq: frequency, seconds: sample length
// prebuffercycles: how many cycles should actually be generated (then copied to fill the buffer)

function preloadSound(freq,envelope,preBufferCycles){

  let result = [];
  let seconds = envelope.a+envelope.d+envelope.r;

  let length = context.sampleRate * seconds;
  let sampleFreq = context.sampleRate / freq;
  let prebufferLength = Math.floor(sampleFreq)*preBufferCycles; // length of prebuffer in samples
  let dividor = (sampleFreq / twoPI);

  // preload a cycle
  let prebuffer = [];

  for(let i=0; i<prebufferLength; i++){
    prebuffer.push( constrain(Math.round(Math.sin(i / dividor)),0,0.5));
  }

  // load full sound
  for (let i = 0; i < length; i++) {
    result[i] = 0.4* envelope.level(i) * prebuffer[i%prebufferLength];
  }

  return result;
}

function playSound(arr,vol) {

  let buf = new Float32Array(arr.length)
  for (var i = 0; i < arr.length; i++) buf[i] = vol*arr[i]
  let buffer = context.createBuffer(1, buf.length, context.sampleRate)
  buffer.copyToChannel(buf, 0)
  let source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(analyser);
  source.start(0);

  filter.type = "lowshelf";
  filter.frequency.value=400;
  filter.gain.value = 8;
//biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
}

class Envelope{

  constructor(a,d,s,r){
    this.a=a;
    this.d=d;
    this.s=s;
    this.r=r;

    this.aS=a*context.sampleRate;
    this.dS=d*context.sampleRate;
    this.rS=r*context.sampleRate;

    this.rT=this.aS+this.dS;
  }
  level(i){
    if(i<this.aS) return i/this.aS;
    else if(i<this.rT) return 1 - (1-this.s) * (i-this.aS)/this.dS;
    else return this.s*( 1 - (i-this.rT)/this.rS );
  }
}


function constrain(input,min,max){
  return Math.min(Math.max(input, min), max);
}

// analyze audiocontext
// borrowed from https://gist.github.com/jkohlin/b574145ca23d272a683f34e3c211154b
function getDataFromAudio(){
  //analyser.fftSize = 2048;
  var freqByteData = new Uint8Array(analyser.fftSize/2);
  var timeByteData = new Uint8Array(analyser.fftSize/2);
  analyser.getByteFrequencyData(freqByteData);
  analyser.getByteTimeDomainData(timeByteData);
  return {f:freqByteData, t:timeByteData}; // array of all 1024 levels
}

function createCanvas(){

  c.el = document.createElement("canvas");
  document.body.appendChild(c.el);
  c.width = 500;
  c.height = 500;
  c.el.setAttribute("width",c.width);
  c.el.setAttribute("height",c.height);
  c.ctx = c.el.getContext("2d");
  c.ctx.filter = 'blur(1px) opacity(0.9)';
}
