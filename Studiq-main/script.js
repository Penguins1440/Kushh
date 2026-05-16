// Landing page interactions for Smart Study Routine Maker
// - Sticky navbar shadow on scroll
// - Mobile nav toggle
// - Reveal on scroll animations (IntersectionObserver)
// - Smooth scroll for anchor links
// - Scroll-to-top button

(function() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const toTop = document.getElementById('to-top');

  if (navbar) {
    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 10) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
      if (toTop) { if (y > 300) toTop.classList.add('show'); else toTop.classList.remove('show'); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    if (navLinks && navLinks.classList.contains('open')) navLinks.classList.remove('open');
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = navbar ? 64 : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

// Auth logic (client-side, localStorage)
(function() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const USERS_KEY = 'ssrm_users';
  const LEGACY_USER_KEY = 'ssrm_user';
  const SESSION_KEY = 'ssrm_session_email';
  const SUBJECTS_KEY = 'ssrm_subjects';
  const ROUTINE_KEY = 'ssrm_routine';
  const RATINGS_KEY = 'ssrm_ratings';

  function loadUsers() {
    try {
      const list = JSON.parse(localStorage.getItem(USERS_KEY));
      if (Array.isArray(list)) return list;
    } catch {}
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_USER_KEY));
      if (legacy && legacy.email) {
        const migrated = [legacy];
        localStorage.setItem(USERS_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {}
    return [];
  }

  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

  function findUserByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return loadUsers().find((u) => u.email.trim().toLowerCase() === normalized) || null;
  }

  function loadUser() {
    const email = getSessionEmail();
    return email ? findUserByEmail(email) : null;
  }

  function setSession(email) { localStorage.setItem(SESSION_KEY, email.trim()); }
  function getSessionEmail() { return localStorage.getItem(SESSION_KEY); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function requireAuth() {
    const email = getSessionEmail();
    const user = email ? findUserByEmail(email) : null;
    if (!email || !user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  function loadSubjects() {
    try { return JSON.parse(localStorage.getItem(SUBJECTS_KEY)) || []; } catch { return []; }
  }
  function saveSubjects(list) { localStorage.setItem(SUBJECTS_KEY, JSON.stringify(list)); }
  function loadRoutine() { try { return JSON.parse(localStorage.getItem(ROUTINE_KEY)) || {}; } catch { return {}; } }
  function saveRoutine(data) { localStorage.setItem(ROUTINE_KEY, JSON.stringify(data)); }
  function loadRatings() { try { return JSON.parse(localStorage.getItem(RATINGS_KEY)) || {}; } catch { return {}; } }
  function saveRatings(data) { localStorage.setItem(RATINGS_KEY, JSON.stringify(data)); }

  // Signup page
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    // Show server-passed errors (?error=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) {
        const msg = document.getElementById('signup-message');
        if (msg) { msg.className = 'auth-message error'; msg.textContent = err; }
      }
    } catch {}

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      const msg = document.getElementById('signup-message');

      msg.className = 'auth-message';
      msg.textContent = '';

      if (!name || !email || !password || !confirm) { msg.classList.add('error'); msg.textContent = 'Please fill in all fields.'; return; }
      if (!emailRegex.test(email)) { msg.classList.add('error'); msg.textContent = 'Please enter a valid email address.'; return; }
      if (password.length < 4) { msg.classList.add('error'); msg.textContent = 'Password must be at least 4 characters.'; return; }
      if (password !== confirm) { msg.classList.add('error'); msg.textContent = 'Passwords do not match.'; return; }

      const users = loadUsers();
      if (findUserByEmail(email)) {
        msg.classList.add('error');
        msg.textContent = 'An account with this email already exists.';
        return;
      }

      users.push({ name, email, password });
      saveUsers(users);
      msg.classList.add('success');
      msg.textContent = 'Account created! Please log in.';
      setTimeout(() => { window.location.href = 'login.html?created=1'; }, 900);
    });
  }

  // Login page
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    // Show success after account creation (?created=1) or errors (?error=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const created = params.get('created');
      const err = params.get('error');
      const msg = document.getElementById('login-message');
      if (msg) {
        if (created === '1') { msg.className = 'auth-message success'; msg.textContent = 'Account created! Please log in.'; }
        if (err) { msg.className = 'auth-message error'; msg.textContent = err; }
      }
    } catch {}

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const msg = document.getElementById('login-message');

      msg.className = 'auth-message';
      msg.textContent = '';

      if (!email || !password) { msg.classList.add('error'); msg.textContent = 'Email and password are required.'; return; }
      if (!emailRegex.test(email)) { msg.classList.add('error'); msg.textContent = 'Please enter a valid email address.'; return; }

      const user = findUserByEmail(email);
      if (user && user.password === password) {
        setSession(email);
        window.location.href = 'dashboard.html';
      } else {
        msg.classList.add('error');
        msg.textContent = 'Invalid email or password.';
      }
    });
  }

  // Dashboard helpers
  function formatHourRange(startHour) {
    const endHour = startHour + 1;
    return `${toAmPm(startHour)}–${toAmPm(endHour)}`;
  }
  function toAmPm(h) { const hour = ((h + 11) % 12) + 1; const suffix = h < 12 || h === 24 ? 'AM' : 'PM'; return `${hour} ${suffix}`; }

  function updateKpis(routine, ratings, hoursPerDay) {
    const kHours = document.getElementById('kpi-hours');
    const kProd = document.getElementById('kpi-prod');
    const kFocus = document.getElementById('kpi-focus');
    if (!kHours || !kProd || !kFocus) return;

    const days = Object.keys(routine);
    const totalHours = days.length * hoursPerDay;
    kHours.textContent = String(totalHours);

    // Average productivity from ratings map
    const scores = Object.values(ratings);
    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length).toFixed(1) : '—';
    kProd.textContent = String(avg);

    // Needs focus = subjects with highest (diff+prio) in subjects list
    const subs = loadSubjects();
    const maxWeight = subs.reduce((m,s)=>Math.max(m,(s.difficulty||0)+(s.priority||0)),0);
    const need = subs.filter(s => (s.difficulty+s.priority) >= maxWeight && maxWeight>0).length;
    kFocus.textContent = String(need);
  }

  function renderRoutineTable(days, startHour, hoursPerDay, routine, subjects) {
    const root = document.getElementById('routine-root');
    if (!root) return;
    const table = document.createElement('table');
    table.className = 'routine';
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    hr.appendChild(Object.assign(document.createElement('th'), { textContent: 'Day' }));
    for (let i=0;i<hoursPerDay;i++) {
      const th = document.createElement('th');
      th.textContent = formatHourRange(startHour + i);
      hr.appendChild(th);
    }
    thead.appendChild(hr); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    days.forEach(day => {
      const tr = document.createElement('tr');
      tr.appendChild(Object.assign(document.createElement('td'), { textContent: day }));
      for (let i=0;i<hoursPerDay;i++) {
        const key = `${day}-${startHour+i}`;
        const td = document.createElement('td');
        const value = routine[key] || '';
        td.textContent = value || '—';
        td.classList.add('editable');
        const subMeta = subjects.find(s=>s.name===value);
        if (subMeta && (subMeta.difficulty+subMeta.priority)>=7) td.classList.add('high');
        if (value==="BREAK") td.classList.add('break');
        td.addEventListener('click', () => {
          const names = ['BREAK', ...subjects.map(s=>s.name)];
          const next = prompt(`Set subject for ${day} ${formatHourRange(startHour+i)}\n(leave empty to clear)\nOptions: ${names.join(', ')}`, value);
          const newVal = (next||'').trim();
          if (!newVal) delete routine[key]; else routine[key] = newVal;
          saveRoutine(routine);
          renderRoutineTable(days,startHour,hoursPerDay,routine,subjects);
          updateKpis(routine, loadRatings(), hoursPerDay);
        });
        td.title = 'Click to edit';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
    root.innerHTML='';
    root.appendChild(table);
  }

  function generateWeek(days, hoursPerDay, startHour, subjects) {
    if (!subjects.length) return {};
    const pool = subjects.flatMap(s => Array(Math.max(1,(s.difficulty||0)+(s.priority||0))).fill(s.name));
    const routine = {};
    let idx = 0;
    days.forEach(day => {
      for (let i=0;i<hoursPerDay;i++) {
        routine[`${day}-${startHour+i}`] = pool[idx % pool.length];
        idx++;
      }
    });
    return routine;
  }

  function initDashboard() {
    const welcome = document.getElementById('welcome');
    const logoutBtn = document.getElementById('logout-btn');
    const routineRoot = document.getElementById('routine-root');
    if (!welcome && !logoutBtn && !routineRoot) return; // not on dashboard

    const user = requireAuth();
    if (!user) return;
    if (welcome) welcome.textContent = `Welcome, ${user.name}!`;
    if (logoutBtn) logoutBtn.addEventListener('click', () => { clearSession(); window.location.href = 'login.html'; });

    const subjects = loadSubjects();
    const ratings = loadRatings();

    const hoursInput = document.getElementById('hours-day');
    const startInput = document.getElementById('start-hour');
    const dayFilter = document.getElementById('filter-day');
    const saveSubjBtn = document.getElementById('save-subject');
    const genBtn = document.getElementById('generate-week');
    const dlBtn = document.getElementById('download-pdf');

    const allDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

    function currentDays() {
      const f = (dayFilter && dayFilter.value) || 'all';
      return f==='all'? allDays : [f];
    }

    function refresh() {
      const hrs = Math.max(1, Math.min(12, Number(hoursInput?.value||3)));
      const start = Math.max(5, Math.min(20, Number(startInput?.value||7)));
      const routine = loadRoutine();
      renderRoutineTable(currentDays(), start, hrs, routine, loadSubjects());
      updateKpis(routine, loadRatings(), hrs);
    }

    saveSubjBtn?.addEventListener('click', () => {
      const name = document.getElementById('subj-name').value.trim();
      const difficulty = Number(document.getElementById('subj-diff').value);
      const priority = Number(document.getElementById('subj-prio').value);
      if (!name) return;
      const list = loadSubjects();
      const existing = list.find(s=>s.name.toLowerCase()===name.toLowerCase());
      if (existing) { existing.difficulty = difficulty; existing.priority = priority; }
      else { list.push({ name, difficulty, priority }); }
      saveSubjects(list);
      refresh();
    });

    genBtn?.addEventListener('click', () => {
      const hrs = Math.max(1, Math.min(12, Number(hoursInput?.value||3)));
      const start = Math.max(5, Math.min(20, Number(startInput?.value||7)));
      const routine = generateWeek(allDays, hrs, start, loadSubjects());
      saveRoutine(routine);
      refresh();
    });

    dlBtn?.addEventListener('click', () => window.print());
    dayFilter?.addEventListener('change', refresh);
    hoursInput?.addEventListener('change', refresh);
    startInput?.addEventListener('change', refresh);

    // Initial render
    refresh();
  }

  // init dashboard when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();

// SmartStudy enhancements: save/load/reset, badges, presets, start hour
(function(){
  const subjBody = document.getElementById('p-subjects-body');
  if (!subjBody) return;

  const hoursInput = document.getElementById('p-hours');
  const startInput = document.getElementById('p-starthour');
  const hourSelect = document.getElementById('p-hour');
  const ampmSelect = document.getElementById('p-ampm');
  const nameInput = document.getElementById('p-name');
  const msg = document.getElementById('p-msg');

  // iOS time picker: convert 12-hour to 24-hour
  function updateStartHour(){
    if (!hourSelect || !ampmSelect || !startInput) return;
    const hour = Number(hourSelect.value);
    const ampm = ampmSelect.value;
    let h24 = hour;
    if (ampm === 'PM' && hour !== 12) h24 = hour + 12;
    if (ampm === 'AM' && hour === 12) h24 = 0;
    startInput.value = h24;
  }
  function setStartHourFrom24(h24){
    if (!hourSelect || !ampmSelect) return;
    let hour12 = h24 % 12;
    if (hour12 === 0) hour12 = 12;
    const ampm = h24 < 12 ? 'AM' : 'PM';
    hourSelect.value = String(hour12);
    ampmSelect.value = ampm;
    updateStartHour();
  }
  if (hourSelect && ampmSelect) {
    hourSelect.value = '7'; ampmSelect.value = 'AM';
    hourSelect.addEventListener('change', updateStartHour);
    ampmSelect.addEventListener('change', updateStartHour);
    updateStartHour();
  }
  const addBtn = document.getElementById('p-add');
  const addPresetBtn = document.getElementById('p-addpreset');
  const presetSel = document.getElementById('p-preset');
  const saveBtn = document.getElementById('p-save');
  const loadBtn = document.getElementById('p-load');
  const resetBtn = document.getElementById('p-reset');
  const genBtn = document.getElementById('p-generate');
  const regenBtn = document.getElementById('p-regenerate');
  const dlBtn = document.getElementById('p-download');
  const routineContainer = document.getElementById('p-routine');
  const bDays = document.getElementById('b-days');
  const bSubjects = document.getElementById('b-subjects');
  const bHours = document.getElementById('b-hours');
  const PSTATE = 'smartstudy_planner_state_v1';

  function getDays(){
    return Array.from(document.querySelectorAll('.p-day:checked')).map(i=>i.value);
  }
  function setDays(days){
    document.querySelectorAll('.p-day').forEach(inp=>{ inp.checked = days.includes(inp.value); });
  }
  function getSubjects(){
    return Array.from(subjBody.querySelectorAll('tr')).map(r=>({
      name: r.querySelector('td:nth-child(1) input')?.value.trim() || '',
      difficulty: Number(r.querySelector('td:nth-child(2) select')?.value || '0'),
      priority: Number(r.querySelector('td:nth-child(3) select')?.value || '0'),
    })).filter(s=>s.name);
  }
  function addRow(defaults={name:'',difficulty:3,priority:3}){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type=\"text\" placeholder=\"Subject\" value=\"${defaults.name}\" /></td>
      <td><select><option>1</option><option>2</option><option ${defaults.difficulty==3?'selected':''}>3</option><option ${defaults.difficulty==4?'selected':''}>4</option><option ${defaults.difficulty==5?'selected':''}>5</option></select></td>
      <td><select><option>1</option><option>2</option><option ${defaults.priority==3?'selected':''}>3</option><option ${defaults.priority==4?'selected':''}>4</option><option ${defaults.priority==5?'selected':''}>5</option></select></td>
      <td><button class=\"icon-btn p-remove\" title=\"Remove\">✖</button></td>`;
    subjBody.appendChild(tr);
    updateBadges();
  }

  function updateBadges(){
    const days = getDays();
    const subjects = getSubjects();
    const hours = Number(hoursInput?.value||0);
    if (bDays) bDays.textContent = `Days: ${days.length}`;
    if (bSubjects) bSubjects.textContent = `Subjects: ${subjects.length}`;
    if (bHours) bHours.textContent = `Hours/day: ${hours}`;
  }

  subjBody.addEventListener('click', (e)=>{
    const btn = e.target.closest('.p-remove');
    if (!btn) return;
    const row = btn.closest('tr');
    if (row && subjBody.querySelectorAll('tr').length>1) row.remove();
    updateBadges();
  });
  addBtn?.addEventListener('click', ()=> addRow());
  addPresetBtn?.addEventListener('click', ()=>{ if (!presetSel?.value) return; addRow({name:presetSel.value, difficulty:3, priority:3}); });
  hoursInput?.addEventListener('change', updateBadges);
  document.querySelectorAll('.p-day').forEach(i=> i.addEventListener('change', updateBadges));

  // Time helper functions
  function parseTime(timeStr) {
    if (typeof timeStr === 'number') {
      const h = Math.floor(timeStr);
      return { hours: h, minutes: 0 };
    }
    const parts = String(timeStr).split(':');
    return { hours: parseInt(parts[0]) || 0, minutes: parseInt(parts[1]) || 0 };
  }
  function formatTime(time) {
    const h = ((time.hours + 11) % 12) + 1;
    const ampm = time.hours < 12 ? 'AM' : 'PM';
    return `${h}:${String(time.minutes).padStart(2, '0')} ${ampm}`;
  }
  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }
  function addMinutes(time, minutes) {
    let totalMins = time.hours * 60 + time.minutes + minutes;
    return { hours: Math.floor(totalMins / 60) % 24, minutes: totalMins % 60 };
  }

  // Helper function to shuffle array randomly
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Helper function to get random break time (10-15 minutes)
  function getRandomBreakTime() {
    return 10 + Math.floor(Math.random() * 6); // 10-15 minutes
  }

  function buildRoutine(days, startHour, hoursPerDay, subjects){
    if (!subjects.length || !days.length) return {};
    
    // Calculate weights for each subject (proportional allocation logic)
    const weightedSubjects = subjects.map(s => ({
      name: s.name,
      difficulty: s.difficulty || 3,
      priority: s.priority || 3,
      weight: (s.difficulty || 3) + (s.priority || 3)
    }));
    
    const totalWeight = weightedSubjects.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return {};
    
    // Separate subjects into hard (difficulty >= 4) and easy (difficulty < 4)
    const hardSubjects = weightedSubjects.filter(s => s.difficulty >= 4);
    const easySubjects = weightedSubjects.filter(s => s.difficulty < 4);
    
    // Build routine with exact time slots using proportional allocation + randomness
    const routine = {};
    const totalMinutes = hoursPerDay * 60;
    
    days.forEach(day => {
      // Shuffle subjects randomly for each day
      const shuffledHard = shuffleArray([...hardSubjects]);
      const shuffledEasy = shuffleArray([...easySubjects]);
      
      // Create alternating pattern: hard -> easy -> hard -> easy
      const subjectSequence = [];
      let hardIdx = 0, easyIdx = 0;
      
      while (hardIdx < shuffledHard.length || easyIdx < shuffledEasy.length) {
        // Alternate: hard first if available, then easy
        if (hardIdx < shuffledHard.length) {
          subjectSequence.push(shuffledHard[hardIdx++]);
        }
        if (easyIdx < shuffledEasy.length) {
          subjectSequence.push(shuffledEasy[easyIdx++]);
        }
        // If one list runs out, add remaining from the other
        if (hardIdx >= shuffledHard.length && easyIdx < shuffledEasy.length) {
          while (easyIdx < shuffledEasy.length) {
            subjectSequence.push(shuffledEasy[easyIdx++]);
          }
        }
        if (easyIdx >= shuffledEasy.length && hardIdx < shuffledHard.length) {
          while (hardIdx < shuffledHard.length) {
            subjectSequence.push(shuffledHard[hardIdx++]);
          }
        }
      }
      
      if (subjectSequence.length === 0) return;
      
      // Calculate total time needed (including breaks)
      // Estimate: 1 break per hour of study (10-15 mins avg 12.5)
      // For X hours, we have approximately X-1 breaks (no break after last hour)
      const estimatedBreaks = Math.max(0, Math.floor(totalMinutes / 60) - 1);
      const breakTimeReserved = estimatedBreaks * 12.5; // Average break time
      const availableStudyTime = totalMinutes - breakTimeReserved;
      
      // Calculate proportional time for each subject
      const daySlots = [];
      let currentTime = { hours: startHour, minutes: 0 };
      let cumulativeStudyTime = 0; // Track study time (not break time)
      
      subjectSequence.forEach((subject, idx) => {
        const proportion = subject.weight / totalWeight;
        const minutes = Math.round(availableStudyTime * proportion);
        
        if (minutes > 0) {
          // Add subject slot
          const endTime = addMinutes(currentTime, minutes);
          daySlots.push({
            subject: subject.name,
            startTime: { ...currentTime },
            endTime: { ...endTime },
            minutes: minutes,
            isHard: subject.difficulty >= 4
          });
          currentTime = endTime;
          cumulativeStudyTime += minutes;
          
          // Add break after 1 hour (60 minutes) of cumulative study time
          if (cumulativeStudyTime >= 60) {
            const breakMins = getRandomBreakTime();
            const breakEndTime = addMinutes(currentTime, breakMins);
            daySlots.push({
              subject: 'Break',
              startTime: { ...currentTime },
              endTime: { ...breakEndTime },
              minutes: breakMins
            });
            currentTime = breakEndTime;
            cumulativeStudyTime = 0; // Reset counter after break
          }
        }
      });
      
      // Trim to fit within total time if needed
      const totalUsed = daySlots.reduce((sum, s) => sum + s.minutes, 0);
      if (totalUsed > totalMinutes) {
        // Adjust last break or remove excess
        const excess = totalUsed - totalMinutes;
        if (daySlots.length > 0 && daySlots[daySlots.length - 1].subject === 'Break') {
          daySlots[daySlots.length - 1].minutes = Math.max(5, daySlots[daySlots.length - 1].minutes - excess);
          daySlots[daySlots.length - 1].endTime = addMinutes(daySlots[daySlots.length - 1].startTime, daySlots[daySlots.length - 1].minutes);
        }
      }
      
      routine[day] = daySlots;
    });
    
    return routine;
  }
  function renderRoutine(days, startHour, hours){
    const subs = getSubjects();
    const routine = buildRoutine(days, startHour, hours, subs);
    const table = document.createElement('table');
    table.className='routine-pretty'; // Use pretty styling
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Day'}));
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Time'}));
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Subject'}));
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Duration'}));
    thead.appendChild(trh); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    
    let totalHours = 0;
    days.forEach(day=>{
      const daySlots = routine[day] || [];
      if (daySlots.length === 0) {
        const tr = document.createElement('tr');
        tr.appendChild(Object.assign(document.createElement('td'),{textContent:day}));
        tr.appendChild(Object.assign(document.createElement('td'),{textContent:'—', colSpan:3}));
        tbody.appendChild(tr);
        return;
      }
      
      daySlots.forEach((slot, idx) => {
        const tr = document.createElement('tr');
        // Day name (only on first slot)
        if (idx === 0) {
          const dayCell = document.createElement('td');
          dayCell.textContent = day;
          dayCell.rowSpan = daySlots.length;
          dayCell.style.verticalAlign = 'middle';
          tr.appendChild(dayCell);
        }
        
        // Time range
        const timeCell = document.createElement('td');
        const startStr = formatTime(slot.startTime);
        const endStr = formatTime(slot.endTime);
        timeCell.textContent = `${startStr} - ${endStr}`;
        tr.appendChild(timeCell);
        
        // Subject
        const subCell = document.createElement('td');
        const span = document.createElement('span');
        span.className = 'subject-pill' + (slot.subject === 'Break' ? ' break' : '');
        span.textContent = slot.subject;
        subCell.appendChild(span);
        tr.appendChild(subCell);
        
        // Duration
        const durCell = document.createElement('td');
        durCell.textContent = formatDuration(slot.minutes);
        tr.appendChild(durCell);
        
        tbody.appendChild(tr);
        totalHours += slot.minutes / 60;
      });
    });
    
    table.appendChild(tbody);
    routineContainer.innerHTML=''; routineContainer.appendChild(table);
    
    // Update KPIs
    const kH = document.getElementById('p-kpi-hours'); 
    const kS = document.getElementById('p-kpi-subj'); 
    const kD = document.getElementById('p-kpi-days');
    if (kH) kH.textContent = totalHours.toFixed(1);
    if (kS) kS.textContent = String(getSubjects().length);
    if (kD) kD.textContent = String(days.length);
  }

  function validate(){
    const days = getDays(); const subs = getSubjects(); const hours = Number(hoursInput.value||0);
    if (!days.length) return 'Please select at least one day.';
    if (!subs.length) return 'Please add at least one subject.';
    if (hours<=0) return 'Please set study hours per day.';
    return '';
  }

  function showMsg(text, ok=false){ if (!msg) return; msg.className = 'auth-message ' + (ok? 'success':'error'); msg.textContent = text; }

  function saveState(){
    const state = { name: nameInput?.value||'', hours: Number(hoursInput?.value||3), start: Number(startInput?.value||7), days: getDays(), subjects: getSubjects() };
    localStorage.setItem(PSTATE, JSON.stringify(state));
    showMsg('Saved!', true);
  }
  function loadState(){
    try {
      const raw = localStorage.getItem(PSTATE); if (!raw) { showMsg('No saved plan.'); return; }
      const s = JSON.parse(raw);
      nameInput && (nameInput.value = s.name||'');
      hoursInput && (hoursInput.value = s.hours||3);
      setStartHourFrom24(s.start||7);
      setDays(s.days||[]);
      subjBody.innerHTML='';
      (s.subjects||[]).forEach(x=> addRow(x));
      if (!s.subjects || !s.subjects.length) addRow();
      updateBadges();
      showMsg('Loaded saved plan.', true);
    } catch { showMsg('Could not load saved plan.'); }
  }
  function resetAll(){
    nameInput && (nameInput.value='');
    hoursInput && (hoursInput.value=3);
    setStartHourFrom24(7);
    setDays(['Monday','Tuesday','Wednesday','Thursday','Friday']);
    subjBody.innerHTML=''; addRow({name:'Maths',difficulty:4,priority:5});
    routineContainer.innerHTML=''; updateBadges(); showMsg('Reset done.', true);
  }

  genBtn?.addEventListener('click', ()=>{
    const err = validate(); if (err) { showMsg(err); return; }
    showMsg('');
    genBtn.classList.add('is-loading');
    const originalText = genBtn.textContent;
    genBtn.textContent = 'Generating';
    setTimeout(() => {
      renderRoutine(getDays(), Number(startInput.value||7), Number(hoursInput.value||3));
      genBtn.classList.remove('is-loading');
      genBtn.textContent = originalText;
      routineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  });
  regenBtn?.addEventListener('click', ()=>{
    const err = validate(); if (err) { showMsg(err); return; }
    showMsg('');
    regenBtn.classList.add('is-loading');
    const originalText = regenBtn.textContent;
    regenBtn.textContent = 'Generating';
    setTimeout(() => {
      renderRoutine(getDays(), Number(startInput.value||7), Number(hoursInput.value||3));
      regenBtn.classList.remove('is-loading');
      regenBtn.textContent = originalText;
      routineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  });
  dlBtn?.addEventListener('click', ()=> window.print());
  saveBtn?.addEventListener('click', saveState);
  loadBtn?.addEventListener('click', loadState);
  resetBtn?.addEventListener('click', resetAll);

  // Initialize
  updateBadges();
})();

// Improve SmartStudy routine rendering UI

// Simple line chart for dashboard analytics (vanilla canvas)
(function(){
  const canvas = document.getElementById('lineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Build data: try ratings per day if present, else mock trend
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  let data = [3,4,3.5,4.2,4.6,3.8,4.0];
  try {
    const RATINGS_KEY = 'ssrm_ratings';
    const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY)) || {};
    // ratings stored keyed by slot; we aggregate count per weekday as placeholder
    const sums = new Array(7).fill(0); const counts = new Array(7).fill(0);
    Object.entries(ratings).forEach(([key,val])=>{ const d = new Date().getDay(); /* fallback current */ });
    // keep default if none
  } catch {}

  // Dimensions
  const w = canvas.width, h = canvas.height, pad = 40;
  const maxY = 5; // productivity scale 1-5
  const stepX = (w - pad*2) / (days.length-1);

  // Clear
  ctx.clearRect(0,0,w,h);
  ctx.font = '12px Poppins, sans-serif';
  ctx.strokeStyle = '#e5eef7';
  ctx.lineWidth = 1;
  // Grid + y labels
  for (let i=0;i<=5;i++){
    const y = pad + (h - pad*2) * (1 - i/5);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w-pad, y); ctx.stroke();
    ctx.fillStyle = '#5f7891'; ctx.fillText(String(i), 8, y+4);
  }
  // x labels
  days.forEach((d, i)=>{ const x = pad + i*stepX; ctx.fillStyle = '#5f7891'; ctx.fillText(d, x-10, h-pad+18); });

  // Line path
  ctx.beginPath();
  data.forEach((v, i)=>{
    const x = pad + i*stepX;
    const y = pad + (h - pad*2) * (1 - v/maxY);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = '#4aa3ff'; ctx.lineWidth = 2; ctx.stroke();
  // Points
  data.forEach((v,i)=>{
    const x = pad + i*stepX; const y = pad + (h - pad*2) * (1 - v/maxY);
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fillStyle = '#2f7fd1'; ctx.fill();
  });
})();

// SmartStudy Exams - days left logic
(function(){
  const daysSel = document.getElementById('ex-days');
  const gradeSel = document.getElementById('ex-grade');
  const hourSel = document.getElementById('ex-hour');
  const ampmSel = document.getElementById('ex-ampm');
  const saveBtn = document.getElementById('ex-save');
  const loadBtn = document.getElementById('ex-load');
  const resetBtn = document.getElementById('ex-reset');
  const clearBtn = document.getElementById('ex-clear');
  const msg = document.getElementById('ex-msg');
  const summary = document.getElementById('ex-days-left');
  const STORE_KEY = 'smartstudy_exams';

  if (!daysSel || !summary) return; // not on exams page

  function showMsg(text, ok=false){ if (!msg) return; msg.className = 'auth-message ' + (ok? 'success':'error'); msg.textContent = text; }

  function nowMs(){ return Date.now(); }

  function computeDaysLeft(savedAtMs, initialDays){
    const diffMs = nowMs() - savedAtMs;
    const passedDays = Math.floor(diffMs / 86400000);
    return Math.max(0, (initialDays||0) - passedDays);
  }

  function readState(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch { return null; }
  }

  function writeState(state){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  // Helpers to save/load subjects in SmartStudyExams
  function exGetSubjects(){
    const rows = Array.from(document.querySelectorAll('#ex-subjects-body tr'));
    return rows.map(r=>({
      name: r.querySelector('td:nth-child(1) input')?.value.trim() || '',
      difficulty: Number(r.querySelector('td:nth-child(2) select')?.value || '0'),
      priority: Number(r.querySelector('td:nth-child(3) select')?.value || '0')
    })).filter(s=>s.name);
  }
  function exSetSubjects(subjects){
    const body = document.getElementById('ex-subjects-body');
    if (!body) return;
    body.innerHTML = '';
    if (!subjects || !subjects.length) return;
    subjects.forEach(s=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><input type="text" value="${s.name}" /></td>
        <td><select>
          <option ${s.difficulty==1?'selected':''}>1</option>
          <option ${s.difficulty==2?'selected':''}>2</option>
          <option ${s.difficulty==3?'selected':''}>3</option>
          <option ${s.difficulty==4?'selected':''}>4</option>
          <option ${s.difficulty==5?'selected':''}>5</option>
        </select></td>
        <td><select>
          <option ${s.priority==1?'selected':''}>1</option>
          <option ${s.priority==2?'selected':''}>2</option>
          <option ${s.priority==3?'selected':''}>3</option>
          <option ${s.priority==4?'selected':''}>4</option>
          <option ${s.priority==5?'selected':''}>5</option>
        </select></td>
        <td><button class="icon-btn ex-remove" title="Remove">✖</button></td>`;
      body.appendChild(tr);
    });
    const badge = document.getElementById('ex-b-subjects');
    if (badge) badge.textContent = `Subjects: ${subjects.length}`;
  }

  function renderSummary(){
    const s = readState();
    if (!s) { summary.textContent = '—'; return; }
    const left = computeDaysLeft(s.savedAtMs, s.initialDays);
    summary.textContent = String(left);
  }

  function scheduleMidnightUpdate(){
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();
    setTimeout(()=>{ renderSummary(); scheduleMidnightUpdate(); }, delay);
  }

  saveBtn?.addEventListener('click', ()=>{
    const initialDays = Number(daysSel.value||0);
    if (!initialDays || initialDays < 0) { showMsg('Please choose total days left.', false); return; }
    const state = {
      grade: gradeSel?.value||'',
      initialDays,
      savedAtMs: nowMs(),
      startHour12: hourSel?.value||'7',
      ampm: ampmSel?.value||'AM',
      subjects: exGetSubjects()
    };
    writeState(state);
    renderSummary();
    showMsg('Exams data saved!', true);
  });

  loadBtn?.addEventListener('click', ()=>{
    const s = readState();
    if (!s) { showMsg('No saved exam data.', false); return; }
    if (gradeSel) gradeSel.value = s.grade||'';
    if (daysSel) daysSel.value = String(s.initialDays||7);
    if (hourSel) hourSel.value = s.startHour12||'7';
    if (ampmSel) ampmSel.value = s.ampm||'AM';
    if (s.subjects) exSetSubjects(s.subjects);
    renderSummary();
    showMsg('Exams data loaded.', true);
  });

  resetBtn?.addEventListener('click', ()=>{
    if (gradeSel) gradeSel.value = '';
    if (daysSel) daysSel.value = '7';
    if (hourSel) hourSel.value = '7';
    if (ampmSel) ampmSel.value = 'AM';
    showMsg('Reset done.', true);
  });

  clearBtn?.addEventListener('click', ()=>{
    localStorage.removeItem(STORE_KEY);
    renderSummary();
    showMsg('Cleared all exam data.', true);
    // Also clear subject rows visually
    const body = document.getElementById('ex-subjects-body');
    if (body) body.innerHTML = '';
    const badge = document.getElementById('ex-b-subjects');
    if (badge) badge.textContent = 'Subjects: 0';
  });

  // Initial
  renderSummary();
  scheduleMidnightUpdate();
})();

// Dashboard exam days display
(function(){
  const el = document.getElementById('kpi-exam-days');
  if (!el) return;
  const STORE_KEY = 'smartstudy_exams';
  function computeDaysLeft(savedAtMs, initialDays){
    const diffMs = Date.now() - savedAtMs;
    const passed = Math.floor(diffMs / 86400000);
    return Math.max(0, (initialDays||0) - passed);
  }
  function render(){
    try{
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (!s) { el.textContent = '—'; return; }
      el.textContent = String(computeDaysLeft(s.savedAtMs, s.initialDays));
    }catch{ el.textContent = '—'; }
  }
  function schedule(){
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
    setTimeout(()=>{ render(); schedule(); }, midnight.getTime()-now.getTime());
  }
  render();
  schedule();
})();

// SmartStudy Exams - routine maker (mirrors SmartStudy UI/UX)
(function(){
  const body = document.getElementById('ex-subjects-body');
  const addBtn = document.getElementById('ex-add');
  const addPresetBtn = document.getElementById('ex-addpreset');
  const presetSel = document.getElementById('ex-preset');
  const subjectsBadge = document.getElementById('ex-b-subjects');
  const daysBadge = document.getElementById('ex-b-days');
  const daysSel = document.getElementById('ex-days');
  const hourSel = document.getElementById('ex-hour');
  const ampmSel = document.getElementById('ex-ampm');
  const genBtn = document.getElementById('ex-generate');
  const routineContainer = document.getElementById('ex-routine');

  if (!body || !genBtn) return; // not on exams routine page

  // Local helpers (scoped here so we don't rely on SmartStudy IIFE internals)
  function exFormatTime(time){ const h12 = ((time.hours + 11) % 12) + 1; const ampm = time.hours < 12 ? 'AM' : 'PM'; return `${h12}:${String(time.minutes||0).padStart(2,'0')} ${ampm}`; }
  function exFormatDuration(mins){ const h=Math.floor(mins/60), m=mins%60; if (h>0&&m>0) return `${h}h ${m}m`; if (h>0) return `${h}h`; return `${m}m`; }
  function exAddMinutes(time, minutes){ const total = time.hours*60 + (time.minutes||0) + minutes; return { hours: Math.floor(total/60)%24, minutes: total%60 }; }

  // Build a minute-based routine (copy of buildRoutine tailored for exams page)
  function exBuildRoutine(days, startHour, hoursPerDay, subjects){
    if (!subjects.length || !days.length) return {};
    const weighted = subjects.map(s=>({ name:s.name, difficulty:s.difficulty||3, priority:s.priority||3, weight:(s.difficulty||3)+(s.priority||3) }));
    const totalWeight = weighted.reduce((a,b)=>a+b.weight,0); if (!totalWeight) return {};
    const hard = weighted.filter(s=>s.difficulty>=4), easy=weighted.filter(s=>s.difficulty<4);
    const totalMinutes = hoursPerDay*60;
    const routine = {};
    function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
    function randomBreak(){ return 10 + Math.floor(Math.random()*6); }
    days.forEach(day=>{
      const seq=[]; let h=0,e=0; const sh=shuffle(hard), se=shuffle(easy);
      while(h<sh.length || e<se.length){ if(h<sh.length) seq.push(sh[h++]); if(e<se.length) seq.push(se[e++]); }
      if(!seq.length) return; const estBreaks = Math.max(0, Math.floor(totalMinutes/60)-1); const available = totalMinutes - estBreaks*12.5;
      const slots=[]; let current={hours:startHour,minutes:0}; let sinceBreak=0;
      seq.forEach(s=>{ const mins=Math.round(available*(s.weight/totalWeight)); if(mins>0){ const end=exAddMinutes(current, mins); slots.push({subject:s.name,startTime:{...current},endTime:{...end},minutes:mins}); current=end; sinceBreak+=mins; if(sinceBreak>=60){ const b= randomBreak(); const bend=exAddMinutes(current,b); slots.push({subject:'Break',startTime:{...current},endTime:{...bend},minutes:b}); current=bend; sinceBreak=0; } } });
      const used = slots.reduce((t,s)=>t+s.minutes,0); if(used>totalMinutes && slots.length && slots[slots.length-1].subject==='Break'){ const excess=used-totalMinutes; slots[slots.length-1].minutes=Math.max(5,slots[slots.length-1].minutes-excess); slots[slots.length-1].endTime=exAddMinutes(slots[slots.length-1].startTime, slots[slots.length-1].minutes); }
      routine[day]=slots;
    });
    return routine;
  }

  function getSubjects(){
    return Array.from(body.querySelectorAll('tr')).map(r=>({
      name: r.querySelector('td:nth-child(1) input')?.value.trim() || '',
      difficulty: Number(r.querySelector('td:nth-child(2) select')?.value || '0'),
      priority: Number(r.querySelector('td:nth-child(3) select')?.value || '0')
    })).filter(s=>s.name);
  }
  function updateBadges(){
    const subs = getSubjects();
    if (subjectsBadge) subjectsBadge.textContent = `Subjects: ${subs.length}`;
    if (daysBadge) daysBadge.textContent = `Exam days: ${daysSel?.value||'—'}`;
  }
  body.addEventListener('click', (e)=>{
    const btn = e.target.closest('.ex-remove');
    if (!btn) return;
    const row = btn.closest('tr'); if (row && body.querySelectorAll('tr').length>1) row.remove();
    updateBadges();
  });
  addBtn?.addEventListener('click', ()=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="text" placeholder="Subject" /></td>
      <td><select><option>1</option><option>2</option><option>3</option><option selected>4</option><option>5</option></select></td>
      <td><select><option>1</option><option>2</option><option>3</option><option>4</option><option selected>5</option></select></td>
      <td><button class="icon-btn ex-remove" title="Remove">✖</button></td>`;
    body.appendChild(tr); updateBadges();
  });
  addPresetBtn?.addEventListener('click', ()=>{ if (!presetSel?.value) return; const tr = document.createElement('tr'); tr.innerHTML = `<td><input type="text" value="${presetSel.value}" /></td><td><select><option>1</option><option>2</option><option>3</option><option selected>4</option><option>5</option></select></td><td><select><option>1</option><option>2</option><option>3</option><option>4</option><option selected>5</option></select></td><td><button class="icon-btn ex-remove" title="Remove">✖</button></td>`; body.appendChild(tr); updateBadges(); });
  daysSel?.addEventListener('change', updateBadges);

  function to24(hour12, ampm){ let h = Number(hour12||7); if (ampm==='PM' && h!==12) h+=12; if (ampm==='AM' && h===12) h=0; return h; }

  function updateDaysLeftKPI(){
    const daysLeftEl = document.getElementById('ex-days-left');
    if (!daysLeftEl) return;
    const STORE_KEY = 'smartstudy_exams';
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (!s) { daysLeftEl.textContent = '—'; return; }
      const nowMs = Date.now();
      const diffMs = nowMs - (s.savedAtMs || nowMs);
      const passedDays = Math.floor(diffMs / 86400000);
      const left = Math.max(0, (s.initialDays || 0) - passedDays);
      daysLeftEl.textContent = String(left);
    } catch {
      daysLeftEl.textContent = '—';
    }
  }

  function exRenderRoutine(days, startHour, hours){
    const subs = getSubjects();
    const routine = exBuildRoutine(days, startHour, hours, subs);
    const table = document.createElement('table');
    table.className='routine-pretty'; // Use pretty styling
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Day'}));
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Time'}));
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Subject'}));
    trh.appendChild(Object.assign(document.createElement('th'),{textContent:'Duration'}));
    thead.appendChild(trh); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    
    let totalHours = 0;
    days.forEach(day=>{
      const daySlots = routine[day] || [];
      if (daySlots.length === 0) {
        const tr = document.createElement('tr');
        tr.appendChild(Object.assign(document.createElement('td'),{textContent:day}));
        tr.appendChild(Object.assign(document.createElement('td'),{textContent:'—', colSpan:3}));
        tbody.appendChild(tr);
        return;
      }
      
      daySlots.forEach((slot, idx) => {
        const tr = document.createElement('tr');
        // Day name (only on first slot)
        if (idx === 0) {
          const dayCell = document.createElement('td');
          dayCell.textContent = day;
          dayCell.rowSpan = daySlots.length;
          dayCell.style.verticalAlign = 'middle';
          tr.appendChild(dayCell);
        }
        
        // Time range
        const timeCell = document.createElement('td');
        const startStr = exFormatTime(slot.startTime);
        const endStr = exFormatTime(slot.endTime);
        timeCell.textContent = `${startStr} - ${endStr}`;
        tr.appendChild(timeCell);
        
        // Subject
        const subCell = document.createElement('td');
        const span = document.createElement('span');
        span.className = 'subject-pill' + (slot.subject === 'Break' ? ' break' : '');
        span.textContent = slot.subject;
        subCell.appendChild(span);
        tr.appendChild(subCell);
        
        // Duration
        const durCell = document.createElement('td');
        durCell.textContent = exFormatDuration(slot.minutes);
        tr.appendChild(durCell);
        
        tbody.appendChild(tr);
        totalHours += slot.minutes / 60;
      });
    });
    
    table.appendChild(tbody);
    routineContainer.innerHTML=''; 
    routineContainer.appendChild(table);
    
    // Update KPIs
    const kH = document.getElementById('ex-kpi-hours'); 
    const kS = document.getElementById('ex-kpi-subj');
    if (kH) kH.textContent = totalHours.toFixed(1);
    if (kS) kS.textContent = String(getSubjects().length);
    updateDaysLeftKPI(); // Update days left KPI
  }

  const dlBtn = document.getElementById('ex-download');
  const regenBtn = document.getElementById('ex-regenerate');

  genBtn.addEventListener('click', ()=>{
    // Generate ONE routine that covers a single day's study plan
    const startHour24 = to24(hourSel?.value||'7', ampmSel?.value||'AM');
    const subjects = getSubjects(); 
    if (!subjects.length){ 
      routineContainer.innerHTML=''; 
      return; 
    }
    genBtn.classList.add('is-loading');
    const originalText = genBtn.textContent;
    genBtn.textContent = 'Generating';
    setTimeout(() => {
      // Keep consistent daily study duration for exams page (same visual feel): 3 hours
      const hoursPerDay = 3;
      exRenderRoutine(['Exam Day'], startHour24, hoursPerDay);
      genBtn.classList.remove('is-loading');
      genBtn.textContent = originalText;
      routineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  });

  regenBtn?.addEventListener('click', ()=>{
    const startHour24 = to24(hourSel?.value||'7', ampmSel?.value||'AM');
    const subjects = getSubjects(); 
    if (!subjects.length){ 
      routineContainer.innerHTML=''; 
      return; 
    }
    regenBtn.classList.add('is-loading');
    const originalText = regenBtn.textContent;
    regenBtn.textContent = 'Generating';
    setTimeout(() => {
      const hoursPerDay = 3;
      exRenderRoutine(['Exam Day'], startHour24, hoursPerDay);
      regenBtn.classList.remove('is-loading');
      regenBtn.textContent = originalText;
      routineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  });

  dlBtn?.addEventListener('click', ()=> window.print());

  // Initialize badges and days left KPI
  updateBadges();
  updateDaysLeftKPI();
})();
