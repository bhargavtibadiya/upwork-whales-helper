import { Brush, translucent, type Box } from "./brush";
import { fieldValue } from "./model";

const value = (b: Brush, key: string) => fieldValue(b.state, key).replace(/\s+/g, " ").trim();
function label(b: Brush, text: string, x: number, y: number, width: number, size: number, color = "#fff", weight = 800): void {
  if (!text) return;
  const fitted = b.fit(text, size, width, weight);
  b.text(text, x, y + b.cap(), fitted, color, width, weight);
}
function title(b: Brush, text: string, box: Box, color = "#fff", max = 96): void {
  if (!text) return;
  const [x,y,w,h] = box;
  let lines = [text], size = Math.min(max*b.scale, h*.7);
  for (; size > 12; size -= 1) {
    b.font(size, 800);
    lines = []; let line = "";
    for (const word of text.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && b.ctx.measureText(next).width > w) {lines.push(line); line=word;} else line=next;
    }
    if(line) lines.push(line);
    if(lines.length <= 3 && lines.length*size*1.17 <= h && lines.every(l=>b.ctx.measureText(l).width<=w)) break;
  }
  lines.forEach((l,i)=>label(b,l,x,y+i*size*1.17,w,size,color));
}
function portrait(b: Brush, box: Box, circle=false): void {
  const [x,y,w,h]=box,c=b.ctx;
  b.rect(box,translucent(b.palette.glow,.17),Math.min(w,h)*.08);
  c.save(); c.beginPath();
  if(circle) c.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);
  else c.roundRect(x,y,w,h,Math.min(w,h)*.08);
  c.clip(); b.face(box,"none"); c.restore();
}
function screen(b: Brush,box: Box): void { b.frame(box,14*b.scale,4*b.scale); }
function stats(b: Brush,box: Box,vertical=false): void {
  const [x,y,w,h]=box, rows=[1,2,3].map(i=>[value(b,`stat${i}v`),value(b,`stat${i}l`)]).filter(r=>r.some(Boolean));
  rows.forEach(([v,l],i)=>{
    const gap=12*b.scale, cw=vertical?w:(w-gap*(rows.length-1))/rows.length, ch=vertical?(h-gap*(rows.length-1))/rows.length:h;
    const xx=x+(vertical?0:i*(cw+gap)), yy=y+(vertical?i*(ch+gap):0), pad=18*b.scale;
    b.rect([xx,yy,cw,ch],translucent(b.palette.highlight,.09),12*b.scale,b.palette.line,1*b.scale);
    label(b,v,xx+pad,yy+ch*.18,cw-pad*2,Math.min(48*b.scale,ch*.33),b.palette.highlight);
    label(b,l,xx+pad,yy+ch*.65,cw-pad*2,Math.min(20*b.scale,ch*.18),"#ddd",600);
  });
}
function rule(b:Brush,x:number,y:number,w:number): void { b.rect([x,y,w,3*b.scale],b.palette.highlight); }

// Every composition ends above the dedicated decoration rail painted by render.ts.
// Coordinates are fractions of the content canvas, not text-dependent guesses.
export function editorial(b: Brush): void {
  const w=b.width,h=b.height,m=w*.055,t=b.palette, cw=w-2*m;
  b.background(w*.65,h*.35,Math.max(w,h)*.65);
  const id=b.state.style, headline=value(b,"headline"), sub=value(b,"subline"), name=value(b,"name"), role=value(b,"role");
  if(id==="checklist") {
    portrait(b,[w*.66,m,w*.285,h-m*2]);
    label(b,"THE DELIVERABLES",m,m,w*.52,22*b.scale,t.highlight);
    title(b,headline,[m,h*.16,w*.53,h*.22]);
    const items=value(b,"services").split(/[·,|]/).filter(Boolean).slice(0,5), rh=h*.085;
    items.forEach((text,i)=>{
      const y=h*.43+i*(rh+h*.018);
      b.circle(m+rh*.3,y+rh*.5,rh*.28,t.accent);
      label(b,String(i+1).padStart(2,"0"),m+rh*.09,y+rh*.32,rh*.45,rh*.28,t.foreground);
      label(b,text.trim(),m+rh*.85,y+rh*.25,w*.45,rh*.4,"#fff",600);
      rule(b,m+rh*.85,y+rh,w*.43);
    });
  } else if(id==="cover") {
    label(b,value(b,"pill"),m,m,cw,24*b.scale,t.highlight);
    title(b,headline,[m,h*.14,cw,h*.17]);
    label(b,sub,m,h*.33,cw,25*b.scale,"#ccc",500);
    screen(b,[m,h*.43,cw,h*.52]);
  } else if(id==="duo" || id==="stat") {
    portrait(b,[m,m,w*.35,h-m*2]);
    const x=w*.45,ww=w-x-m;
    label(b,id==="duo"?"MEASURABLE IMPACT":value(b,"pill"),x,m,ww,23*b.scale,t.highlight);
    title(b,headline,[x,h*.17,ww,h*.24],"#fff",132);
    label(b,sub,x,h*.44,ww,28*b.scale,"#ddd",600);
    stats(b,[x,h*.56,ww,h*.27]);
    if(id==="stat") label(b,value(b,"services"),x,h*.9,ww,20*b.scale,"#bbb",500);
  } else if(id==="reviews") {
    const x=m,ww=w*.55;
    label(b,value(b,"badge"),x,m,ww,23*b.scale,t.highlight);
    title(b,headline,[x,h*.16,ww,h*.19]);
    title(b,sub,[x,h*.36,ww,h*.14],t.highlight,70);
    stats(b,[x,h*.59,ww,h*.25]);
    label(b,value(b,"pill"),x,h*.91,ww,25*b.scale,"#ddd",600);
    portrait(b,[w*.68,m,w*.27,h-m*2]);
  } else if(id==="quote") {
    portrait(b,[w*.68,m,w*.27,h-m*2]);
    label(b,"CLIENT VOICE",m,m,w*.55,24*b.scale,t.highlight);
    b.text("“",m,h*.29,160*b.scale,t.highlight);
    title(b,value(b,"quote"),[m,h*.3,w*.54,h*.37],"#fff",64);
    rule(b,m,h*.75,w*.15);
    label(b,name,m,h*.81,w*.54,30*b.scale);
    label(b,value(b,"badge")?`${value(b,"badge")}  /  5 client rating`:"",m,h*.91,w*.54,20*b.scale,t.highlight,600);
  } else if(id==="spotlight") {
    label(b,value(b,"pill"),m,m,w*.7,22*b.scale,t.highlight);
    title(b,headline,[m,h*.15,w*.53,h*.25],"#fff",108);
    label(b,sub,m,h*.45,w*.54,25*b.scale,"#ccc",500);
    screen(b,[m,h*.58,w*.58,h*.36]);
    portrait(b,[w*.7,h*.16,w*.25,h*.78]);
  } else if(id==="beforeafter") {
    title(b,headline,[m,m,w*.43,h*.18]);
    title(b,value(b,"headline2"),[m,h*.26,w*.43,h*.2],t.highlight);
    label(b,sub,m,h*.51,w*.43,24*b.scale,"#ccc",500);
    screen(b,[w*.54,m,w*.405,h*.55]);
    stats(b,[m,h*.7,cw,h*.24]);
  } else if(id==="minimal") {
    b.rect([0,0,w*.32,h],t.accent);
    label(b,value(b,"pill"),m,m,w*.24,17*b.scale,t.foreground);
    title(b,headline,[m,h*.22,w*.22,h*.43],t.foreground,70);
    label(b,sub,m,h*.79,w*.22,19*b.scale,t.foreground,500);
    screen(b,[w*.38,h*.12,w*.56,h*.76]);
  } else if(id==="split") {
    portrait(b,[w*.58,m,w*.365,h-m*2]);
    label(b,value(b,"pill"),m,m,w*.46,23*b.scale,t.highlight);
    title(b,name,[m,h*.27,w*.46,h*.35],"#fff",150);
    rule(b,m,h*.7,w*.16);
    title(b,role,[m,h*.77,w*.46,h*.15],t.highlight,34);
  } else if(id==="centered") {
    label(b,headline,m,m,cw,22*b.scale,t.highlight);
    const side=h*.48;
    portrait(b,[(w-side)/2,h*.16,side,side],true);
    const ns=b.fit(name,80*b.scale,cw,800); b.text(name,w/2,h*.79,ns,"#fff",cw,800,"center");
    const rs=b.fit(role,28*b.scale,cw,600);b.text(role,w/2,h*.91,rs,t.highlight,cw,600,"center");
  } else if(id==="statline") {
    portrait(b,[w*.65,m,w*.295,h*.57]);
    label(b,"PROVEN EXPERIENCE",m,m,w*.54,23*b.scale,t.highlight);
    title(b,headline,[m,h*.19,w*.54,h*.31]);
    label(b,value(b,"services"),m,h*.58,w*.54,23*b.scale,"#ccc",500);
    stats(b,[m,h*.72,cw,h*.23]);
  } else if(id==="tagline") {
    portrait(b,[w*.62,m,w*.325,h-m*2]);
    title(b,headline,[m,h*.13,w*.5,h*.18]);
    title(b,value(b,"headline2"),[m,h*.34,w*.5,h*.18],t.highlight);
    [1,2,3,4].map(i=>value(b,`chip${i}`)).filter(Boolean).forEach((txt,i)=>{
      const ww=w*.235,xx=m+(i%2)*(ww+w*.018),yy=h*.65+Math.floor(i/2)*h*.14;
      b.rect([xx,yy,ww,h*.1],t.surface,10*b.scale,t.line,1*b.scale);
      label(b,txt,xx+16*b.scale,yy+h*.028,ww-32*b.scale,24*b.scale);
    });
  } else if(id==="editorial") {
    b.rect([0,0,w*.43,h],t.accent);
    portrait(b,[m,h*.11,w*.32,h*.72]);
    label(b,value(b,"pill"),w*.49,m,w*.45,20*b.scale,t.highlight);
    title(b,name,[w*.49,h*.25,w*.45,h*.28],"#fff",130);
    title(b,role,[w*.49,h*.57,w*.45,h*.16],t.highlight,40);
    label(b,value(b,"services"),w*.49,h*.85,w*.45,24*b.scale,"#ddd",500);
  } else if(id==="signature") {
    label(b,headline,m,m,cw,22*b.scale,t.highlight);
    title(b,name,[m,h*.2,w*.55,h*.26],"#fff",132);
    title(b,role,[m,h*.5,w*.55,h*.13],t.highlight,44);
    const side=h*.48;
    portrait(b,[w*.72-side*.15,h*.14,side,side],true);
    stats(b,[m,h*.75,cw,h*.21]);
  }
}

export function decorationRail(b: Brush, y: number, height: number, primary: boolean): void {
  const {width:w}=b,s=b.scale,t=b.palette,c=b.ctx;
  b.rect([0,y,w,height],t.base);
  b.rect([w*.055,y,w*.89,1*s],translucent(t.highlight,.25));
  if(primary && b.state.play) b.play(w*.12,y+height*.52,height*.29);
  if(primary && b.state.arrow) b.arrow([w*.33,y+height*.3],[w*.23,y+height*.68],-height*.16,height*.075);
  if(b.state.stars) for(let i=0;i<5;i++) b.star(w*.54+i*height*.36,y+height*.5,height*.12,t.highlight);
  if(b.state.sparkles) {
    for(const [x,yy,r] of [[w*.82,y+height*.5,height*.21],[w*.87,y+height*.32,height*.1]]) {
      c.beginPath();c.moveTo(x,yy-r);c.quadraticCurveTo(x+r*.2,yy-r*.2,x+r,yy);c.quadraticCurveTo(x+r*.2,yy+r*.2,x,yy+r);c.quadraticCurveTo(x-r*.2,yy+r*.2,x-r,yy);c.quadraticCurveTo(x-r*.2,yy-r*.2,x,yy-r);c.fillStyle=t.highlight;c.fill();
    }
  }
}
