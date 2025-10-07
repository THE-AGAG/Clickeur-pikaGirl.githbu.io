// Main state
const state = {
  pseudo: "",
  score: 0,
  totalClicks: 0,
  autoClickers: 0,
  autoClickCost: 50,
  multiplier: 1,
  multiplierCost: 100,
  critChance: 0.02,       // 2%
  critPower: 5,          // x5
  critChanceCost: 2000,
  critPowerCost: 3000,
  tempBoostActive: false,
  tempBoostEnd: 0,
  tempBoostCost: 500,
  prestigeCount: 0,
  prestigeBonus: 0,       // +% permanent
  lastClickTime: 0,
  bestTimed: 0,
  timedActive: false,
  timedTimeLeft: 60,
  timedScore: 0,
  daily: {
    active: false,
    target: 5000,
    rewardPct: 5,
    expiresAt: 0,
    claimedToday: false
  },
  theme: "default",
  soundOn: true,
  musicOn: false,
  achievementsUnlocked: {},
};

// Selectors
const el = {
  startBtn: document.getElementById("startBtn"),
  pseudoInput: document.getElementById("pseudo"),
  pseudoForm: document.getElementById("pseudoForm"),
  gameArea: document.getElementById("gameArea"),
  score: document.getElementById("score"),
  multiplierStat: document.getElementById("multiplierStat"),
  autoClickStat: document.getElementById("autoClickStat"),
  critStat: document.getElementById("critStat"),
  prestigeStat: document.getElementById("prestigeStat"),
  clickButton: document.getElementById("clicker"),
  gameImage: document.getElementById("gameImage"),
  particlesCanvas: document.getElementById("particlesCanvas"),
  upgradeAuto: document.getElementById("buyAutoClick"),
  upgradeMult: document.getElementById("buyMultiplier"),
  upgradeCritChance: document.getElementById("buyCritChance"),
  upgradeCritPower: document.getElementById("buyCritPower"),
  upgradeTempBoost: document.getElementById("buyTempBoost"),
  doPrestige: document.getElementById("doPrestige"),
  achievementList: document.getElementById("achievementList"),
  achievementToast: document.getElementById("achievementToast"),
  scoreList: document.getElementById("scoreList"),
  bonusButton: document.getElementById("bonusButton"),
  startTimedBtn: document.getElementById("startTimedBtn"),
  timedInfo: document.getElementById("timedInfo"),
  startDailyBtn: document.getElementById("startDailyBtn"),
  dailyInfo: document.getElementById("dailyInfo"),
  dailyStatus: document.getElementById("dailyStatus"),
  musicToggle: document.getElementById("musicToggle"),
  soundToggle: document.getElementById("soundToggle"),
  themeSelect: document.getElementById("themeSelect"),
  saveNowBtn: document.getElementById("saveNowBtn"),
  backBtn: document.getElementById("backBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),
  resetScoresBtn: document.getElementById("resetScoresBtn"),
  pressHint: document.getElementById("pressHint"),
  clickSound: document.getElementById("clickSound"),
  critSound: document.getElementById("critSound"),
  achievementSound: document.getElementById("achievementSound"),
  music: document.getElementById("music"),
};

// --- Audio helpers: set sensible defaults and try to "unlock" audio on first user gesture ---
function unlockAudio() {
  const audios = [el.clickSound, el.critSound, el.achievementSound, el.music];
  audios.forEach(a => {
    if (!a) return;
    try {
      // Some hosts require crossOrigin to decode remote audio
      a.crossOrigin = 'anonymous';
      // sensible default volumes
      if (typeof a.volume === 'number') a.volume = 0.85;
      // Try a short play/pause to unlock audio on browsers with autoplay policies
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => { a.pause(); a.currentTime = 0; }).catch(() => {
          // ignore - will try again later when user interacts
        });
      }
    } catch (e) {
      // ignore
    }
  });
}
document.getElementById("startBtn").addEventListener("click", () => {
  const music = document.getElementById("music");
  const musicToggle = document.getElementById("musicToggle");

  if (musicToggle.checked) {
    music.play().catch(err => {
      console.warn("Lecture automatique bloquée :", err);
    });
  }
});
document.addEventListener("click", tryPlayMusic, { once: true });
document.addEventListener("keydown", tryPlayMusic, { once: true });

function tryPlayMusic() {
  const music = document.getElementById("music");
  const musicToggle = document.getElementById("musicToggle");
  if (musicToggle.checked) {
    music.play().catch(err => console.warn("Lecture bloquée :", err));
  }
}
const volumeSlider = document.getElementById("volumeSlider");
const music = document.getElementById("music");

// Appliquer le volume initial
music.volume = volumeSlider.value / 100;

// Mettre à jour le volume en temps réel
volumeSlider.addEventListener("input", () => {
  music.volume = volumeSlider.value / 100;
});
document.getElementById("startBtn").addEventListener("click", () => {
  const music = document.getElementById("music");
  const clickSound = document.getElementById("clickSound");
  const critSound = document.getElementById("critSound");
  const achievementSound = document.getElementById("achievementSound");

  // Préparer les sons
  [clickSound, critSound, achievementSound].forEach(sound => {
    sound.volume = 0.5;
    sound.play().then(() => sound.pause()); // Débloque l'audio
  });

  // Lancer la musique si activée
  if (document.getElementById("musicToggle").checked) {
    music.volume = document.getElementById("volumeSlider").value / 100;
    music.play().catch(err => console.warn("Musique bloquée :", err));
  }
  if (state.soundOn) {
  const sound = isCrit ? el.critSound : el.clickSound;
  sound.currentTime = 0;
  sound.play().catch(err => console.warn("Son bloqué :", err));
  }
  if (state.soundOn) {
  el.achievementSound.currentTime = 0;
  el.achievementSound.play().catch(err => console.warn("Son bloqué :", err));
  }
});

// Startup
el.startBtn.addEventListener("click", () => {
  const p = el.pseudoInput.value.trim();
  if (!p) {
    alert("Le pseudo est obligatoire !");
    return;
  }
  state.pseudo = p;
  el.pseudoForm.style.display = "none";
  el.gameArea.style.display = "grid";
  // Try to unlock audio now that we have a user gesture
  unlockAudio();
  // Show Save and Back buttons only when inside the game
  try { el.saveNowBtn.style.display = 'inline-block'; } catch (e) {}
  try { el.backBtn.style.display = 'inline-block'; } catch (e) {}
  try { el.exportBtn.style.display = 'inline-block'; } catch (e) {}
  try { el.importBtn.style.display = 'inline-block'; } catch (e) {}
  try { el.resetScoresBtn.style.display = 'inline-block'; } catch (e) {}
  try { el.pressHint.style.display = 'block'; } catch (e) {}
  loadPersisted();
  updateUI();
  displayScores();
  scheduleBonusButton();
  ensureDaily();
});

// Keyboard support: Space or Enter triggers click when not focusing inputs
// Protect against holding the key down by ignoring key repeats and applying a small throttle
let __lastKeyClick = 0;
const __KEY_MIN_DELAY = 80; // ms minimum between key-triggered clicks
document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
  if (e.code === 'Space' || e.code === 'Enter') {
    // ignore the OS/browser autorepeat when key is held
    if (e.repeat) return;
    const now = Date.now();
    if (now - __lastKeyClick < __KEY_MIN_DELAY) return;
    __lastKeyClick = now;
    e.preventDefault();
    // simulate click
    try { el.clickButton.click(); } catch (err) {}
  }
});

// Export/import save (client-side JSON)
el.exportBtn.addEventListener('click', () => {
  const data = localStorage.getItem('clickerState') || JSON.stringify(state);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clicker-save-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
el.importBtn.addEventListener('click', () => {
  try { el.importFile.click(); } catch (e) {}
});
el.importFile.addEventListener('change', (ev) => {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      // Merge minimally
      Object.assign(state, parsed);
      persist();
      loadPersisted();
      updateUI();
      displayScores();
      alert('Import successful');
    } catch (err) { alert('Invalid import file'); }
  };
  reader.readAsText(f);
});

// Reset scoreboard (clears local scores list)
el.resetScoresBtn.addEventListener('click', () => {
  if (!confirm('Reset local scoreboard? This cannot be undone.')) return;
  localStorage.removeItem('scores');
  displayScores();
});

// Back button: return to the initial screen
el.backBtn.addEventListener("click", () => {
  // Reload the page to return to the initial state
  try { location.reload(); } catch (e) { window.location.href = window.location.href; }
});

// Sound / music / theme
el.musicToggle.addEventListener("change", () => {
  state.musicOn = el.musicToggle.checked;
  if (state.musicOn) {
    const p = el.music.play();
    if (p && typeof p.then === 'function') p.catch(() => { /* ignore playback denied */ });
  } else {
    try { el.music.pause(); } catch (e) {}
  }
  persist();
});
el.soundToggle.addEventListener("change", () => {
  state.soundOn = el.soundToggle.checked;
  persist();
});
el.themeSelect.addEventListener("change", () => {
  state.theme = el.themeSelect.value;
  setTheme(state.theme);
  persist();
});
function setTheme(name) {
  document.body.classList.remove("theme-default","theme-fire","theme-ice","theme-pixel");
  document.body.classList.add(`theme-${name}`);
}
setTheme("default");

// Main click
el.clickButton.addEventListener("click", () => {
  const now = Date.now();
  const diff = now - state.lastClickTime;
  state.lastClickTime = now;

  // Critical hit?
  const isCrit = Math.random() < state.critChance;
  let gain = state.multiplier;
  if (state.tempBoostActive) gain *= 2;
  gain *= (1 + state.prestigeBonus / 100);
  if (isCrit) gain *= state.critPower;

  state.score += Math.floor(gain);
  state.totalClicks += 1;

  // Click speed: image change + dynamic background
  if (diff < 250) {
    el.gameImage.src = themeAsset("fast");
    el.gameImage.style.transform = "scale(1.2)";
  } else if (diff < 700) {
    el.gameImage.src = themeAsset("medium");
    el.gameImage.style.transform = "scale(1.1)";
  } else {
    el.gameImage.src = themeAsset("base");
    el.gameImage.style.transform = "scale(1)";
  }

  // Sounds
  if (state.soundOn) {
    const s = (isCrit ? el.critSound : el.clickSound);
    try { s.currentTime = 0; } catch (e) {}
    const p = s.play();
    if (p && typeof p.then === 'function') p.catch(() => { /* playback blocked */ });
  }

  spawnParticles(isCrit ? "#ffd700" : "#ffffff");
  updateUI();
  checkClickAchievements();
});

// Make the main image clickable too
try {
  el.gameImage.style.cursor = 'pointer';
  el.gameImage.addEventListener('click', () => {
    try { el.clickButton.click(); } catch (e) {}
  });
} catch (e) {}

// Purchases
el.upgradeAuto.addEventListener("click", () => {
  if (state.score >= state.autoClickCost) {
    state.score -= state.autoClickCost;
    state.autoClickers += 1;
    state.autoClickCost = Math.floor(state.autoClickCost * 1.5);
    checkUpgradeAchievements();
    updateUI();
    persist();
  } else alert("Pas assez de points !");
});

el.upgradeMult.addEventListener("click", () => {
  if (state.score >= state.multiplierCost) {
    state.score -= state.multiplierCost;
    state.multiplier += 1;
    state.multiplierCost = Math.floor(state.multiplierCost * 2);
    checkUpgradeAchievements();
    updateUI();
    persist();
  } else alert("Pas assez de points !");
});

el.upgradeCritChance.addEventListener("click", () => {
  if (state.score >= state.critChanceCost) {
    state.score -= state.critChanceCost;
    state.critChance = Math.min(0.5, state.critChance + 0.01); // +1%, max 50%
    state.critChanceCost = Math.floor(state.critChanceCost * 2);
    unlockAchievement(`🎯 Crit% augmenté à ${(state.critChance * 100).toFixed(0)}%`);
    updateUI();
    persist();
  } else {
    alert("Pas assez de points !");
  }
});


el.upgradeCritPower.addEventListener("click", () => {
  if (state.score >= state.critPowerCost) {
    state.score -= state.critPowerCost;
    state.critPower = Math.min(50, state.critPower + 5); // max x50
    state.critPowerCost = Math.floor(state.critPowerCost * 2);
    updateUI();{
        el.critStat.textContent = `Crit: ${(state.critChance*100).toFixed(0)}% (x${state.critPower})`;
        el.upgradeCritChance.textContent = `Acheter Crit% (Coût : ${state.critChanceCost})`;
        el.upgradeCritPower.textContent = `Acheter Crit x (Coût : ${state.critPowerCost})`;
      }
    persist();
  } else alert("Pas assez de points !");
});

el.upgradeTempBoost.addEventListener("click", () => {
  if (state.score >= state.tempBoostCost) {
    state.score -= state.tempBoostCost;
    state.tempBoostActive = true;
    state.tempBoostEnd = Date.now() + 30000; // 30s
    updateUI();
    persist();
  } else alert("Pas assez de points !");
});

el.doPrestige.addEventListener("click", () => {
  if (confirm("Prestige va réinitialiser ta progression (score, upgrades) mais ajouter +10% permanent. Continuer ?")) {
    state.prestigeCount += 1;
    state.prestigeBonus += 10;

    // Reset soft
    state.score = 0;
    state.totalClicks = 0;
    state.autoClickers = 0;
    state.autoClickCost = 50;
    state.multiplier = 1;
    state.multiplierCost = 100;
    state.critChance = 0.10;
    state.critPower = 10;
    state.critChanceCost = 200;
    state.critPowerCost = 300;
    state.tempBoostActive = false;
    state.tempBoostEnd = 0;

    unlockAchievement(`🏆 Prestige #${state.prestigeCount}: +10% permanent`);
    updateUI();
    persist();
  }
});

// Timed mode
el.startTimedBtn.addEventListener("click", () => {
  if (state.timedActive) return;
  state.timedActive = true;
  state.timedTimeLeft = 60;
  state.timedScore = 0;
  unlockAchievement("⏱️ Début du mode chronométré !");
  const interval = setInterval(() => {
    state.timedTimeLeft -= 1;
    el.timedInfo.textContent = `Temps: ${state.timedTimeLeft} | Score: ${state.timedScore} | Meilleur: ${state.bestTimed}`;
    if (state.timedTimeLeft <= 0) {
      clearInterval(interval);
      state.timedActive = false;
      state.bestTimed = Math.max(state.bestTimed, state.timedScore);
      unlockAchievement(`⏱️ Fin: score ${state.timedScore}. Meilleur: ${state.bestTimed}`);
      persist();
    }
  }, 1000);
});

// Daily challenge
el.startDailyBtn.addEventListener("click", () => {
  ensureDaily(true);
  state.daily.active = true;
  state.daily.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  el.dailyStatus.textContent = "Statut: en cours (10 min)";
  unlockAchievement("📅 Défi quotidien lancé !");
  persist();
});

// Manual save
el.saveNowBtn.addEventListener("click", () => {
  saveScore();
  unlockAchievement("💾 Score sauvegardé manuellement.");
});

// Auto-click loop
setInterval(() => {
  if (state.autoClickers > 0) {
    let gain = state.autoClickers * state.multiplier;
    if (state.tempBoostActive) gain *= 2;
    gain *= (1 + state.prestigeBonus / 100);
    state.score += Math.floor(gain);
    if (state.timedActive) state.timedScore += Math.floor(gain);
    updateUI();
  }
  // End boost
  if (state.tempBoostActive && Date.now() > state.tempBoostEnd) {
    state.tempBoostActive = false;
    unlockAchievement("⚡ Fin du boost de 30s.");
    updateUI();
  }
}, 1000);

// Random bonus popup
function scheduleBonusButton() {
  setTimeout(() => {
    el.bonusButton.style.display = "block";
    el.bonusButton.style.right = `${12 + Math.random()*40}px`;
    el.bonusButton.style.top = `${-8 + Math.random()*40}px`;
    setTimeout(() => {
      el.bonusButton.style.display = "none";
      scheduleBonusButton();
    }, 5000);
  }, 15000 + Math.random()*15000);
}
el.bonusButton.addEventListener("click", () => {
  const bonus = Math.floor(100 + Math.random()*900);
  state.score += bonus;
  if (state.timedActive) state.timedScore += bonus;

  el.bonusPopup.textContent = `🎁 Bonus reçu : +${bonus} points !`;
  el.bonusPopup.style.display = "block";
  setTimeout(() => el.bonusPopup.style.display = "none", 3000);

  updateUI();
});
// Random bonus function (used in interval as well)
function randomBonus() {
  const bonus = Math.floor(100 + Math.random() * 900);
  state.score += bonus;
  if (state.timedActive) state.timedScore += bonus;

  el.bonusPopup.textContent = `🎁 Bonus reçu : +${bonus} points !`;
  el.bonusPopup.style.display = "block";
  setTimeout(() => el.bonusPopup.style.display = "none", 3000);

  updateUI();
}

// Lancer un bonus toutes les 20 à 40 secondes
setInterval(() => {
  if (state.pseudo) { // seulement si un joueur est connecté
    if (Math.random() < 0.5) { // 50% de chance
      randomBonus();
    }
  }
}, 20000);


// Achievements
function unlockAchievement(text) {
  if (state.achievementsUnlocked[text]) return;
  state.achievementsUnlocked[text] = true;

  const li = document.createElement("li");
  li.textContent = text;
  el.achievementList.appendChild(li);

  el.achievementToast.textContent = text;
  el.achievementToast.style.display = "block";
  if (state.soundOn) {
    try { el.achievementSound.currentTime = 0; } catch (e) {}
    const p = el.achievementSound.play();
    if (p && typeof p.then === 'function') p.catch(() => {/* ignore */});
  }
  setTimeout(() => el.achievementToast.style.display = "none", 2500);
  persist();
}

// Click achievements up to 10M
const clickMilestones = [100, 1000, 10000, 100000, 1000000, 10000000];
function checkClickAchievements() {
  for (const m of clickMilestones) {
    if (state.totalClicks === m) {
      unlockAchievement(`💥 ${state.pseudo} a atteint ${m.toLocaleString()} clics !`);
    }
  }
  // score affects timed mode
  if (state.timedActive) state.timedScore += state.multiplier;
}

// Upgrade achievements every 10 levels
function checkUpgradeAchievements() {
  if (state.autoClickers > 0 && state.autoClickers % 10 === 0) {
    unlockAchievement(`⚙️ ${state.pseudo} a atteint ${state.autoClickers} Auto-Clickers !`);
  }
  if (state.multiplier > 0 && state.multiplier % 10 === 0) {
    unlockAchievement(`🔥 Multiplicateur x${state.multiplier} atteint !`);
  }
}

// UI / Stats / Buttons
function updateUI() {
  el.score.textContent = `Score : ${state.score}`;
  el.multiplierStat.textContent = `x${state.multiplier}${state.tempBoostActive ? " (Boost x2)" : ""}`;
  el.autoClickStat.textContent = `Auto: ${state.autoClickers}/s`;
  el.critStat.textContent = `Crit: ${(state.critChance*100).toFixed(0)}% (x${state.critPower})`;
  el.prestigeStat.textContent = `Prestige: ${state.prestigeCount} (+${state.prestigeBonus}%)`;

  el.upgradeAuto.textContent = `Acheter Auto-Click (Coût : ${state.autoClickCost})`;
  el.upgradeMult.textContent = `Acheter Multiplicateur (Coût : ${state.multiplierCost})`;
  el.upgradeCritChance.textContent = `Acheter Crit% (Coût : ${state.critChanceCost})`;
  el.upgradeCritPower.textContent = `Acheter Crit x (Coût : ${state.critPowerCost})`;
  el.upgradeTempBoost.textContent = `Boost 30s (Coût : ${state.tempBoostCost})`;

  // Dynamic background based on score (subtle)
  const p = Math.min(1, state.score / 100000);
  document.body.style.background = `linear-gradient(135deg, rgba(110,142,251,1), rgba(167,119,227,${Math.max(0.4, p)}))`;

  // Music toggle UI
  el.musicToggle.checked = state.musicOn;
  el.soundToggle.checked = state.soundOn;
  el.themeSelect.value = state.theme;
}

// Skins / assets per theme
function themeAsset(kind) {
  const t = state.theme;
  // you can replace these URLs with your own images (assets/default.png etc.)
  const map = {
    default: {
      base: "https://via.placeholder.com/150/6e8efb/ffffff?text=Click",
      medium: "https://via.placeholder.com/150/ffaa00/ffffff?text=⚡Moyen",
      fast: "https://via.placeholder.com/150/ff4444/ffffff?text=🔥Rapide!",
    },
    fire: {
      base: "https://via.placeholder.com/150/dd2476/ffffff?text=Feu",
      medium: "https://via.placeholder.com/150/ff6a00/ffffff?text=Chaud",
      fast: "https://via.placeholder.com/150/ff0000/ffffff?text=Brase",
    },
    ice: {
      base: "https://via.placeholder.com/150/0072ff/ffffff?text=Glace",
      medium: "https://via.placeholder.com/150/00c6ff/ffffff?text=Givre",
      fast: "https://via.placeholder.com/150/00e5ff/ffffff?text=Blizzard",
    },
    pixel: {
      base: "https://via.placeholder.com/150/34495e/ffffff?text=Pixel",
      medium: "https://via.placeholder.com/150/2c3e50/ffffff?text=8-bit",
      fast: "https://via.placeholder.com/150/1f2a35/ffffff?text=Turbo",
    }
  };
  return map[t][kind] || map.default.base;
}

// Particles
const ctx = el.particlesCanvas.getContext("2d");
let particles = [];
function resizeCanvas() {
  el.particlesCanvas.width = el.particlesCanvas.clientWidth;
  el.particlesCanvas.height = el.particlesCanvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
setTimeout(resizeCanvas, 0);

function spawnParticles(color="#fff") {
  const rect = el.clickButton.getBoundingClientRect();
  const zoneRect = el.particlesCanvas.getBoundingClientRect();
  const x = rect.left + rect.width/2 - zoneRect.left;
  const y = rect.top + rect.height/2 - zoneRect.top;
  for (let i=0;i<12;i++) {
    particles.push({
      x, y,
      vx: (Math.random()-0.5)*3,
      vy: (Math.random()-0.5)*3 - Math.random()*2,
      life: 40 + Math.random()*20,
      color
    });
  }
}
function renderParticles() {
  ctx.clearRect(0,0,el.particlesCanvas.width, el.particlesCanvas.height);
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life/60);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 1;
  });
  particles = particles.filter(p => p.life > 0);
  requestAnimationFrame(renderParticles);
}
renderParticles();

// Scoreboard
function saveScore() {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  // require a non-empty pseudo to save
  const name = state.pseudo && state.pseudo.trim() ? state.pseudo.trim() : null;
  if (!name) {
    alert('Please enter a pseudo before saving your score.');
    return;
  }
  scores.push({pseudo: name, score: state.score});
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0,10); // Top 10
  localStorage.setItem("scores", JSON.stringify(scores));
  displayScores();
}
function displayScores() {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  el.scoreList.innerHTML = "";
  scores.forEach(s => {
    const li = document.createElement("li");
      // skip anonymous entries for a cleaner leaderboard
      const name = (s && s.pseudo) ? s.pseudo : null;
      if (!name || name.toLowerCase() === 'anonymous') return;
      // create a two-column entry: name left, score right
      const left = document.createElement('span');
      left.textContent = name;
      const right = document.createElement('span');
      right.textContent = s.score;
      li.appendChild(left);
      li.appendChild(right);
      // highlight current player if matches
      if (state.pseudo && state.pseudo === name) li.style.fontWeight = '800';
    el.scoreList.appendChild(li);
  });
}

// Persistence
function persist() {
  localStorage.setItem("clickerState", JSON.stringify({
    pseudo: state.pseudo,
    score: state.score,
    totalClicks: state.totalClicks,
    autoClickers: state.autoClickers,
    autoClickCost: state.autoClickCost,
    multiplier: state.multiplier,
    multiplierCost: state.multiplierCost,
    critChance: state.critChance,
    critPower: state.critPower,
    critChanceCost: state.critChanceCost,
    critPowerCost: state.critPowerCost,
    tempBoostActive: state.tempBoostActive,
    tempBoostEnd: state.tempBoostEnd,
    tempBoostCost: state.tempBoostCost,
    prestigeCount: state.prestigeCount,
    prestigeBonus: state.prestigeBonus,
    bestTimed: state.bestTimed,
    theme: state.theme,
    soundOn: state.soundOn,
    musicOn: state.musicOn,
    achievementsUnlocked: state.achievementsUnlocked,
    daily: state.daily,
  }));
}
function loadPersisted() {
  const data = localStorage.getItem("clickerState");
  if (!data) return;
  try {
    const s = JSON.parse(data);
    Object.assign(state, s);
      // Restore achievements list
    el.achievementList.innerHTML = "";
    Object.keys(state.achievementsUnlocked || {}).forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      el.achievementList.appendChild(li);
    });
    if (state.musicOn) {
      const p = el.music.play();
      if (p && typeof p.then === 'function') p.catch(() => {/* ignore */});
    }
    setTheme(state.theme || "default");
  } catch (e) {}
}

// Try an initial unlock in case the user interacts quickly
unlockAudio();

// Populate scoreboard on load
displayScores();

// Auto save
setInterval(() => {
  if (state.pseudo) {
    saveScore();
    persist();
  }
}, 10000);

// Daily
function ensureDaily(forceNew=false) {
  const todayKey = new Date().toDateString();
  const storedKey = localStorage.getItem("dailyKey");
  if (forceNew || storedKey !== todayKey) {
  // New challenge
    state.daily.target = 3000 + Math.floor(Math.random()*7000); // 3k-10k
    state.daily.rewardPct = 3 + Math.floor(Math.random()*7); // 3-9%
    state.daily.active = false;
    state.daily.expiresAt = 0;
    state.daily.claimedToday = false;
    el.dailyInfo.textContent = `Objectif du jour: ${state.daily.target} points. Récompense: +${state.daily.rewardPct}% pendant 10 min.`;
    el.dailyStatus.textContent = "Statut: en attente";
    localStorage.setItem("dailyKey", todayKey);
    persist();
  } else {
    el.dailyInfo.textContent = `Objectif du jour: ${state.daily.target} points. Récompense: +${state.daily.rewardPct}% pendant 10 min.`;
    el.dailyStatus.textContent = state.daily.active ? "Statut: en cours" : "Statut: en attente";
  }
}

// Daily challenge tick
setInterval(() => {
  if (state.daily.active) {
    if (state.score >= state.daily.target && !state.daily.claimedToday) {
      state.daily.claimedToday = true;
      state.daily.active = false;
      state.daily.expiresAt = Date.now() + 10*60*1000;
      state.tempBoostActive = true;
      state.tempBoostEnd = state.daily.expiresAt;
      unlockAchievement(`📅 Défi réussi ! +${state.daily.rewardPct}% pendant 10 min`);
      persist();
      el.dailyStatus.textContent = "Statut: réussi";
    } else if (Date.now() > state.daily.expiresAt && !state.daily.claimedToday) {
      state.daily.active = false;
      el.dailyStatus.textContent = "Statut: expiré";
    }
  }
}, 1000);
