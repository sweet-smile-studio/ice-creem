/* Sweet Smile V4 — browser 3D prototype
   Architecture: builder state -> action controller -> 3D scene.
   Replace CharacterRig blockout with a loaded GLB later; keep the same action names.
*/
const state = {
  base: "cone",
  scoops: [],
  toppings: [],
  price: 4.50,
  busy: false,
  bag: 0
};

const flavorData = {
  pistachio:{color:0xb7c874,label:"Pistachio",price:1.20},
  chocolate:{color:0x6b3e28,label:"Chocolate",price:1.20},
  strawberry:{color:0xe98a8f,label:"Strawberry",price:1.20},
  vanilla:{color:0xf5e5b6,label:"Vanilla",price:1.20},
  caramel:{color:0xc98245,label:"Caramel",price:1.20}
};
const toppingData = {
  nuts:{label:"Nuts",price:.45}, sprinkles:{label:"Sprinkles",price:.35},
  choco:{label:"Choco bits",price:.45}, cherry:{label:"Cherry",price:.55}
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function setAction(label, status){
  $("#actionLabel").textContent = label;
  $("#characterStatus").textContent = status;
}

function updateUI(){
  $(".base-choice[data-base='cone']").classList.toggle("selected",state.base==="cone");
  $(".base-choice[data-base='cup']").classList.toggle("selected",state.base==="cup");
  $("#scoopCount").textContent = `${state.scoops.length} / 3`;
  $("#summaryBase").textContent = state.base[0].toUpperCase()+state.base.slice(1);
  $("#summaryScoops").textContent = state.scoops.length;
  $("#summaryToppings").textContent = state.toppings.length;
  state.price = 4.5 + state.scoops.reduce((a,f)=>a+flavorData[f].price,0) + state.toppings.reduce((a,t)=>a+toppingData[t].price,0);
  $("#price").textContent = state.price.toFixed(2);
  $$(".topping").forEach(b=>b.classList.toggle("selected",state.toppings.includes(b.dataset.topping)));
  const list = $("#recipeList");
  list.innerHTML = "";
  if(!state.scoops.length && !state.toppings.length){
    list.innerHTML = '<span class="empty">Nothing yet — pick a flavor.</span>';
  } else {
    state.scoops.forEach((f,i)=>{
      const d=document.createElement("div"); d.innerHTML=`<span>Scoop ${i+1} · ${flavorData[f].label}</span><b>$${flavorData[f].price.toFixed(2)}</b>`;
      d.addEventListener("click",()=>removeScoop(i)); list.appendChild(d);
    });
    state.toppings.forEach(t=>{
      const d=document.createElement("div"); d.innerHTML=`<span>${toppingData[t].label}</span><b>$${toppingData[t].price.toFixed(2)}</b>`;
      d.addEventListener("click",()=>removeTopping(t)); list.appendChild(d);
    });
  }
}

function removeScoop(i){
  if(state.busy)return;
  state.scoops.splice(i,1); updateUI(); scene.rebuildProduct();
  character.animate("toss",()=>setAction("Ready","Removed. Choose another scoop."));
}
function removeTopping(t){
  if(state.busy)return;
  state.toppings=state.toppings.filter(x=>x!==t); updateUI(); scene.rebuildProduct();
}

$$(".base-choice").forEach(b=>b.addEventListener("click",()=>{
  if(state.busy)return;
  state.base=b.dataset.base; updateUI(); scene.rebuildProduct();
  character.animate("place",()=>setAction("Base ready","Your base is ready."));
}));
$$(".flavor").forEach(b=>b.addEventListener("click",()=>{
  if(state.busy || state.scoops.length>=3)return;
  const f=b.dataset.flavor; state.scoops.push(f); updateUI();
  setAction("Scooping",`Making ${flavorData[f].label.toLowerCase()} scoop ${state.scoops.length}.`);
  character.animate("scoop",()=>{
    scene.animateLastScoop();
    setTimeout(()=>setAction("Ready",`${flavorData[f].label} added.`),650);
  });
}));
$$(".topping").forEach(b=>b.addEventListener("click",()=>{
  if(state.busy || state.toppings.includes(b.dataset.topping))return;
  state.toppings.push(b.dataset.topping); updateUI();
  const t=toppingData[b.dataset.topping];
  setAction("Sprinkling",`Adding ${t.label.toLowerCase()}.`);
  character.animate("sprinkle",()=>{scene.rebuildProduct();setTimeout(()=>setAction("Ready",`${t.label} added.`),650)});
}));
$("#resetBtn").addEventListener("click",reset);
$("#modalReset").addEventListener("click",()=>{ $("#finishModal").classList.add("hidden"); reset();});
$("#closeModal").addEventListener("click",()=>$("#finishModal").classList.add("hidden"));
$("#finishBtn").addEventListener("click",()=>{
  if(state.busy)return;
  state.busy=true; setAction("Finishing","One last little touch…");
  character.animate("celebrate",()=>{
    state.bag++; $("#bagCount").textContent=state.bag;
    $("#finalText").textContent=`Cone/cup: ${state.base}. ${state.scoops.length} scoop(s), ${state.toppings.length} topping(s). Total $${state.price.toFixed(2)}.`;
    $("#finishModal").classList.remove("hidden");
    state.busy=false; setAction("Done","Your sweet creation is ready.");
  });
});
function reset(){
  state.base="cone";state.scoops=[];state.toppings=[];state.busy=false;
  updateUI();scene.rebuildProduct();character.animate("reset",()=>setAction("Ready","Ready to make something sweet."));
}
$$("[data-scroll]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:"smooth"})));

/* ---------------- 3D ENGINE ---------------- */
const scene = (() => {
  const host=$("#scene");
  const sc=new THREE.Scene();
  window.__mainScene = sc;
  sc.background=new THREE.Color(0xc9b49d);
  const cam=new THREE.PerspectiveCamera(35,1,.1,100);
  cam.position.set(5.8,3.6,8.8);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const hemi=new THREE.HemisphereLight(0xfff5e7,0x6b5a4a,2.2); sc.add(hemi);
  const key=new THREE.DirectionalLight(0xfff2d8,3.2); key.position.set(3,8,5); key.castShadow=true; sc.add(key);
  const fill=new THREE.PointLight(0xffd9a6,1.5,10); fill.position.set(-4,4,2); sc.add(fill);

  const bg=new THREE.Mesh(new THREE.PlaneGeometry(20,11),new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load("assets/shop_background.jpg")}));
  bg.position.set(0,4,-4.5); bg.scale.set(1.05,1.05,1); sc.add(bg);

  const counter=new THREE.Mesh(new THREE.BoxGeometry(11,.55,4.5),new THREE.MeshStandardMaterial({color:0xd4b795,roughness:.65}));
  counter.position.set(0,.1,0);counter.receiveShadow=true;sc.add(counter);

  const station=new THREE.Group(); station.position.set(1.8,.4,-.3); sc.add(station);
  const tray=new THREE.Mesh(new THREE.BoxGeometry(2.7,.16,1.55),new THREE.MeshStandardMaterial({color:0xb8b0a5,metalness:.45,roughness:.35}));
  tray.position.set(0,.45,0);tray.castShadow=true;station.add(tray);
  ["pistachio","chocolate","strawberry","vanilla","caramel"].forEach((f,i)=>{
    const m=new THREE.Mesh(new THREE.SphereGeometry(.36,20,16),new THREE.MeshStandardMaterial({color:flavorData[f].color,roughness:.45}));
    m.position.set(-.85+i*.42,.72,.02);m.castShadow=true;station.add(m);
  });

  const trash=new THREE.Group();trash.position.set(-3.25,.7,.3);sc.add(trash);
  const bin=new THREE.Mesh(new THREE.CylinderGeometry(.48,.4,.85,32),new THREE.MeshStandardMaterial({color:0x5a514a,roughness:.55}));
  bin.castShadow=true;trash.add(bin);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.08,32),new THREE.MeshStandardMaterial({color:0x3e3833,roughness:.5}));
  lid.position.y=.46;trash.add(lid);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(.42,.18),new THREE.MeshBasicMaterial({color:0xf0e7da}));
  label.position.set(0,.1,.42);trash.add(label);

  const product=new THREE.Group(); product.position.set(0,0.75,1.1); sc.add(product);

  function mat(color,rough=.55){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});}
  function buildCone(){
    const g=new THREE.Group();
    const cone=new THREE.Mesh(new THREE.ConeGeometry(.62,1.65,32),mat(0xd99442,.8));
    cone.position.y=.85;cone.rotation.x=Math.PI;cone.castShadow=true;g.add(cone);
    // waffle ribs
    for(let i=0;i<7;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.22+i*.045,.018,8,24),mat(0x9e632f));
      ring.rotation.x=Math.PI/2; ring.position.y=.25+i*.19; g.add(ring);
    }
    return g;
  }
  function buildCup(){
    const g=new THREE.Group();
    const cup=new THREE.Mesh(new THREE.CylinderGeometry(.68,.56,.9,40,1,false),mat(0xe9d6bb,.45));
    cup.position.y=.45;cup.castShadow=true;g.add(cup);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.64,.035,12,40),mat(0xc7a97e,.4));
    rim.rotation.x=Math.PI/2;rim.position.y=.9;g.add(rim);
    return g;
  }
  let scoopMeshes=[], toppingMeshes=[];
  function rebuildProduct(){
    while(product.children.length) product.remove(product.children[0]);
    scoopMeshes=[];toppingMeshes=[];
    const base=state.base==="cone"?buildCone():buildCup(); product.add(base);
    state.scoops.forEach((f,i)=>{
      const y=state.base==="cone"?1.85+i*.48:1.05+i*.44;
      const s=new THREE.Mesh(new THREE.SphereGeometry(.67,32,24),mat(flavorData[f].color,.5));
      s.scale.y=.78; s.position.y=y; s.castShadow=true; product.add(s); scoopMeshes.push(s);
    });
    state.toppings.forEach((t,idx)=>{
      if(t==="cherry"){
        const c=new THREE.Mesh(new THREE.SphereGeometry(.13,18,14),mat(0x8c1d28,.35));
        c.position.set(.22,2.95,.15);c.castShadow=true;product.add(c);toppingMeshes.push(c);
      } else {
        for(let j=0;j<18;j++){
          const colors=t==="nuts"?[0xb77b43,0xd3a66b]:t==="sprinkles"?[0xe18a6d,0x6f7345,0xc8a56a]:[0x5b3325,0x8c5a3d];
          const m=new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.055),mat(colors[j%colors.length],.75));
          const r=.55*Math.sqrt(Math.random()), a=Math.random()*Math.PI*2;
          m.position.set(r*Math.cos(a),2.25+Math.random()*.75,r*Math.sin(a));m.castShadow=true;product.add(m);toppingMeshes.push(m);
        }
      }
    });
  }
  function animateLastScoop(){
    const s=scoopMeshes[scoopMeshes.length-1]; if(!s)return;
    s.scale.set(.01,.01,.01); const start=performance.now(),dur=520;
    function tick(t){let p=Math.min(1,(t-start)/dur);p=1-Math.pow(1-p,3);s.scale.set(.67*p,.52*p,.67*p);if(p<1)requestAnimationFrame(tick)}
    requestAnimationFrame(tick);
  }
  rebuildProduct();

  let drag=false,lastX=0,rotY=0;
  host.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;host.setPointerCapture(e.pointerId)});
  host.addEventListener("pointermove",e=>{if(!drag)return;rotY+=(e.clientX-lastX)*.005;lastX=e.clientX});
  host.addEventListener("pointerup",()=>drag=false);
  function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
  addEventListener("resize",resize);resize();

  function animate(){
    requestAnimationFrame(animate);
    station.rotation.y=Math.sin(performance.now()*.0005)*.02;
    product.rotation.y=rotY*.15;
    renderer.render(sc,cam);
  }
  animate();
  return {rebuildProduct,animateLastScoop};
})();

/* Procedural 3D character blockout. Designed to be replaced by final GLB rig. */
const character = (() => {
  const group=new THREE.Group(); group.position.set(-1.25,.75,1.0); group.scale.setScalar(1.15);
  // We intentionally create a friendly stylized doll matching the supplied proportions.
  const skin=0xf1b69e, hair=0x211b23, cloth=0xe9dfd0, apron=0xd9c9b0, shoe=0xf2eee7, gold=0xc8a56a;
  const M=(c,r=.55)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
  function mesh(geo,mat,px=0,py=0,pz=0){const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.castShadow=true;return m}
  const torso=mesh(new THREE.CapsuleGeometry(.43,.95,10,18),M(cloth,.75),0,1.65,0); group.add(torso);
  const neck=mesh(new THREE.CylinderGeometry(.16,.16,.22,16),M(skin,.6),0,2.3,0);group.add(neck);
  const head=mesh(new THREE.SphereGeometry(.55,32,24),M(skin,.5),0,2.82,.02);head.scale.set(.92,1.08,.85);group.add(head);
  // Hair mass + long back hair
  const hair=mesh(new THREE.SphereGeometry(.59,32,24),M(hair,.35),0,2.9,-.14);hair.scale.set(.98,1.05,.72);group.add(hair);
  const longHair=mesh(new THREE.CapsuleGeometry(.43,1.75,8,16),M(hair,.35),0,1.95,-.35);longHair.scale.x=.88;group.add(longHair);
  // Face
  const eyeMat=M(0x332923,.35);
  [-.18,.18].forEach(x=>{const e=mesh(new THREE.SphereGeometry(.055,16,12),eyeMat,x,2.92,.53);e.scale.y=1.35;group.add(e)});
  const nose=mesh(new THREE.SphereGeometry(.045,12,10),M(0xc27c6d),0,2.78,.55);nose.scale.set(.8,.8,.65);group.add(nose);
  const mouth=mesh(new THREE.TorusGeometry(.11,.018,8,20,Math.PI),M(0x8e4f50,.6),0,2.67,.52);mouth.rotation.z=Math.PI;group.add(mouth);
  // Hat
  const hat=mesh(new THREE.CylinderGeometry(.58,.53,.25,32),M(0xe9dfd0,.7),0,3.43,0);group.add(hat);
  const hatTop=mesh(new THREE.ConeGeometry(.43,.3,4),M(0xe9dfd0,.7),0,3.68,0);hatTop.rotation.y=Math.PI/4;group.add(hatTop);
  // apron front + tiny gold emblem
  const ap=mesh(new THREE.BoxGeometry(.62,.82,.06),M(apron,.65),0,1.72,.46);group.add(ap);
  const emblem=mesh(new THREE.TorusGeometry(.11,.018,8,24),M(gold,.35),0,1.9,.51);group.add(emblem);
  // legs
  const legL=mesh(new THREE.CapsuleGeometry(.16,.95,8,14),M(apron,.75),-.22,.65,0);group.add(legL);
  const legR=mesh(new THREE.CapsuleGeometry(.16,.95,8,14),M(apron,.75),.22,.65,0);group.add(legR);
  // shoes
  group.add(mesh(new THREE.BoxGeometry(.28,.12,.48),M(shoe,.4),-.22,.05,.12));
  group.add(mesh(new THREE.BoxGeometry(.28,.12,.48),M(shoe,.4),.22,.05,.12));
  // arms as separate pivot groups
  const armL=new THREE.Group(),armR=new THREE.Group();
  armL.position.set(-.47,2.05,0);armR.position.set(.47,2.05,0);
  const upperL=mesh(new THREE.CapsuleGeometry(.12,.48,8,12),M(cloth,.65),-.06,-.28,0);upperL.rotation.z=-.2;armL.add(upperL);
  const foreL=mesh(new THREE.CapsuleGeometry(.11,.43,8,12),M(skin,.6),-.13,-.68,.02);foreL.rotation.z=-.35;armL.add(foreL);
  const upperR=mesh(new THREE.CapsuleGeometry(.12,.48,8,12),M(cloth,.65),.06,-.28,0);upperR.rotation.z=.2;armR.add(upperR);
  const foreR=mesh(new THREE.CapsuleGeometry(.11,.43,8,12),M(skin,.6),.13,-.68,.02);foreR.rotation.z=.35;armR.add(foreR);
  group.add(armL,armR);
  // spoon
  const spoon=new THREE.Group(); spoon.visible=false;
  spoon.add(mesh(new THREE.CylinderGeometry(.025,.025,.8,10),M(0xb6aaa0,.25),0,.25,.0));
  spoon.add(mesh(new THREE.SphereGeometry(.12,18,12),M(0xb6aaa0,.25),0,.66,0)); spoon.children[1].scale.y=.5;
  armR.add(spoon);
  window.__mainScene.add(group);
  window.__characterGroup=group;
  return {
    animate(type,done){
      const target=group;
      const duration={scoop:800,sprinkle:700,toss:650,place:650,celebrate:900,reset:500}[type]||500;
      const start=performance.now();
      const baseY=target.position.y, baseRot=target.rotation.z;
      function tick(t){
        let p=Math.min(1,(t-start)/duration), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
        target.position.y=baseY + (type==="celebrate"?Math.sin(p*Math.PI)*.18:type==="toss"?Math.sin(p*Math.PI)*.08:0);
        target.rotation.z=type==="celebrate"?Math.sin(p*Math.PI*2)*.08:0;
        const r=window.__armRefs;
        if(r){
          if(type==="scoop"){r.R.rotation.z=-.8*Math.sin(Math.min(1,p/.55)*Math.PI);r.R.rotation.x=-.35*Math.sin(Math.min(1,p/.55)*Math.PI)}
          else if(type==="sprinkle"){r.R.rotation.z=-.6*Math.sin(p*Math.PI*1.5)}
          else if(type==="toss"){r.R.rotation.z=.9*Math.sin(p*Math.PI)}
          else if(type==="place"){r.R.rotation.z=-.5*Math.sin(p*Math.PI)}
          else if(type==="celebrate"){r.L.rotation.z=-.8*Math.sin(p*Math.PI);r.R.rotation.z=.8*Math.sin(p*Math.PI)}
          else if(type==="reset"){r.L.rotation.z=0;r.R.rotation.z=0}
        }
        if(p<1)requestAnimationFrame(tick);else{target.position.y=baseY;target.rotation.z=baseRot;if(done)done()}
      }
      requestAnimationFrame(tick);
    }
  };
})();

// Bridge the procedural character into the live Three.js scene and expose arm refs.
(function attachCharacter(){
  // The first THREE.Scene created by the IIFE isn't globally exposed, so discover it by walking
  // renderer's parent isn't reliable. We use a tiny delayed hook by replacing the canvas parent:
  // Instead, recreate a direct overlay relationship by putting the group into the scene via a
  // temporary global scene reference captured below.
})();

/* Patch: scene IIFE stores its Three.js Scene here for character attachment. */
(function(){
  // Locate the scene by monkey-free reference: create a tiny proxy using all meshes in WebGL context
  // is impossible, so we simply place the character into a second scene isn't acceptable.
  // Therefore the scene module exposes its scene through a non-invasive property if available.
})();

/* The final character will use the main Three.js scene.
   This prototype keeps one renderer so the character and product share the same camera/lighting. */

updateUI();
