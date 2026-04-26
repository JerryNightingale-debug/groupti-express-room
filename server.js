const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();

const ROOM_TYPES = [
  { key: 'friendGroup', label: 'Friend Group' },
  { key: 'roommates', label: 'Roommates' },
  { key: 'groupProject', label: 'Group Project' },
  { key: 'clubTeam', label: 'Club / Team' },
  { key: 'travelSquad', label: 'Travel Squad' },
  { key: 'justForFun', label: 'Just for Fun' },
];

const QUESTIONS = [
  { id: 1, dimension: 'signal', reverse: false, text: 'In any group chat, I become visible within five messages.' },
  { id: 2, dimension: 'signal', reverse: true, text: 'If nobody speaks first, I am happy to lurk until the vibe reveals itself.' },
  { id: 3, dimension: 'signal', reverse: false, text: 'I naturally become the person narrating what is happening.' },
  { id: 4, dimension: 'signal', reverse: true, text: 'Too much group energy drains me faster than the actual task.' },
  { id: 5, dimension: 'signal', reverse: false, text: 'When plans get awkward, I usually break the silence.' },

  { id: 6, dimension: 'brain', reverse: false, text: 'When people disagree, I start sorting the logic before the feelings.' },
  { id: 7, dimension: 'brain', reverse: true, text: 'I often decide based on who will feel it the hardest.' },
  { id: 8, dimension: 'brain', reverse: false, text: 'If there are two good options, I want the cleaner system.' },
  { id: 9, dimension: 'brain', reverse: true, text: 'I can tell a plan makes emotional sense even when it makes no spreadsheet sense.' },
  { id: 10, dimension: 'brain', reverse: false, text: 'I would rather be precise than be comforting in the first draft.' },

  { id: 11, dimension: 'grid', reverse: false, text: 'I make a plan before the chaos becomes a personality.' },
  { id: 12, dimension: 'grid', reverse: true, text: 'A little improvisation usually turns into a lot, and I am okay with that.' },
  { id: 13, dimension: 'grid', reverse: false, text: '"We will figure it out" is not enough information for me.' },
  { id: 14, dimension: 'grid', reverse: true, text: 'My process looks random from the outside, but I swear there is a vibe-based system.' },
  { id: 15, dimension: 'grid', reverse: false, text: 'I like knowing who is doing what by when.' },

  { id: 16, dimension: 'driver', reverse: false, text: 'If nobody leads, I start steering by reflex.' },
  { id: 17, dimension: 'driver', reverse: true, text: 'I am fine letting the group direction reveal itself over time.' },
  { id: 18, dimension: 'driver', reverse: false, text: 'When something stalls, I will push for a decision.' },
  { id: 19, dimension: 'driver', reverse: true, text: 'I would rather support a decent plan than own the final call.' },
  { id: 20, dimension: 'driver', reverse: false, text: 'I quietly end up coordinating more than I intended.' },
];

const ROLE_LIBRARY = [
  {
    key: 'spreadsheetGoblin',
    title: 'Spreadsheet Goblin',
    image: '/assets/roles/spreadsheet-goblin.png',
    blurb: 'keeps receipts, tracks details, slowly loses faith in “let us just wing it”',
    target: { signal: 32, brain: 80, grid: 94, driver: 66 }
  },
  {
    key: 'vibeDealer',
    title: 'Vibe Dealer',
    image: '/assets/roles/vibe-dealer.png',
    blurb: 'keeps the atmosphere alive even when the plan is spiritually unfinished',
    target: { signal: 88, brain: 28, grid: 34, driver: 36 }
  },
  {
    key: 'loreKeeper',
    title: 'Lore Keeper',
    image: '/assets/roles/lore-keeper.png',
    blurb: 'remembers every detail, every side plot, and exactly who said what first',
    target: { signal: 38, brain: 44, grid: 76, driver: 24 }
  },
  {
    key: 'crisisClown',
    title: 'Crisis Clown',
    image: '/assets/roles/crisis-clown.png',
    blurb: 'gets funnier as the situation worsens, which is useful until it is not',
    target: { signal: 86, brain: 34, grid: 16, driver: 46 }
  },
  {
    key: 'ghostCoder',
    title: 'Ghost Coder',
    image: '/assets/roles/ghost-coder.png',
    blurb: 'quiet for hours, then appears with output like a mythological creature',
    target: { signal: 18, brain: 84, grid: 72, driver: 40 }
  },
  {
    key: 'softDictator',
    title: 'Soft Dictator',
    image: '/assets/roles/soft-dictator-gentle-planner.png',
    blurb: 'sounds gentle, has already decided the workflow, and might be right',
    target: { signal: 56, brain: 72, grid: 82, driver: 92 }
  },
  {
    key: 'chaosEngine',
    title: 'Chaos Engine',
    image: '/assets/roles/chaos-engine.png',
    blurb: 'high-output, high-impulse, occasionally indistinguishable from an event',
    target: { signal: 78, brain: 48, grid: 10, driver: 72 }
  },
  {
    key: 'patchNote',
    title: 'Patch Note',
    image: '/assets/roles/patch-note-fixing-with-care.png',
    blurb: 'spots what broke, fixes it quietly, then disappears back into the build',
    target: { signal: 30, brain: 74, grid: 84, driver: 38 }
  },
  {
    key: 'moodRouter',
    title: 'Mood Router',
    image: '/assets/roles/mood-router-at-work.png',
    blurb: 'reads emotional traffic in real time and reroutes tension before impact',
    target: { signal: 60, brain: 22, grid: 58, driver: 46 }
  },
  {
    key: 'delayWizard',
    title: 'Delay Wizard',
    image: '/assets/roles/delay-wizard.png',
    blurb: 'chronically late to the process but weirdly on time for the outcome',
    target: { signal: 36, brain: 58, grid: 18, driver: 24 }
  },
  {
    key: 'sideQuest',
    title: 'Side Quest',
    image: '/assets/roles/side-quest-desk-adventure.png',
    blurb: 'not malicious, just spiritually incapable of staying on the main objective',
    target: { signal: 68, brain: 36, grid: 12, driver: 18 }
  },
  {
    key: 'humanBuffer',
    title: 'Human Buffer',
    image: '/assets/roles/human-buffer.png',
    blurb: 'absorbs awkwardness, softens impact, and keeps the room from cracking',
    target: { signal: 28, brain: 18, grid: 62, driver: 18 }
  }
];

const GROUP_TYPES = {
  hotMess: { title: 'Hot Mess', image: '/assets/groups/hot-mess.png', strap: 'You like each other. The system does not exist.', desc: 'This group runs on chemistry, instincts, and a dangerous amount of trust in the future. It is affectionate, memorable, and operationally underbuilt.', works: ['fast emotional recovery', 'strong bond under pressure', 'good stories even when the plan collapses'], breaks: ['unclear ownership', 'late decisions', 'everyone thought someone else had it'], tip: 'Assign one planner before the chaos gets narrative rights.' },
  lockedIn: { title: 'Locked In', image: '/assets/groups/locked-in.png', strap: 'Clear goals, clean moves, suspiciously functional.', desc: 'This group has the terrifying aura of people who will actually finish the thing. Coordination is high, decisions land, and the vibes somehow survive structure.', works: ['clean division of labor', 'high follow-through', 'good deadline behavior'], breaks: ['can feel intense to softer members', 'over-optimization', 'less room for detours'], tip: 'Leave a little air in the system so excellence does not become cardio.' },
  vibesOnly: { title: 'Vibes Only', image: '/assets/groups/vibes-only.png', strap: 'Strong chemistry. No operational plan.', desc: 'The emotional weather is excellent. The logistics are mostly folklore. This group works best when the goal is to enjoy the experience, not govern it.', works: ['easy warmth', 'creative spontaneity', 'high social glue'], breaks: ['planning avoidance', 'unfinished details', 'nobody wanted to ruin the vibe by being specific'], tip: 'Keep the vibe. Add one person with a calendar.' },
  cooked: { title: 'Cooked', image: '/assets/groups/cooked.png', strap: 'One inconvenience away from collapse.', desc: 'This group is not doomed. It is just under-resourced, under-structured, and currently negotiating with reality from a weak position.', works: ['adaptability under absurdity', 'raw personality', 'occasional miracle runs'], breaks: ['fragile coordination', 'high chaos load', 'energy drains faster than decisions happen'], tip: 'Reduce ambition by 20%. Increase clarity by 60%.' },
  mainQuest: { title: 'Main Quest', image: '/assets/groups/main-quest.png', strap: 'You move like people with a plot.', desc: 'This group tends to organize around outcomes. There is momentum, there is direction, and somebody is usually steering on purpose.', works: ['goal focus', 'clear momentum', 'good decision speed'], breaks: ['can bulldoze quieter members', 'less playful flexibility', 'moves fast enough to skip nuance'], tip: 'Keep the mission. Check the emotional collateral.' },
  sideQuest: { title: 'Side Quest', image: '/assets/groups/side-quest.png', strap: 'You were trying to do one thing. Now there are four things.', desc: 'This group is generative, funny, and permanently two turns away from the original plan. It wanders, but never without content.', works: ['creative branching', 'surprising discoveries', 'energy stays alive'], breaks: ['scope creep', 'task drift', 'main objective becomes optional fan fiction'], tip: 'Name the main quest out loud before opening the next tab.' },
  damageControl: { title: 'Damage Control', image: '/assets/groups/damage-control.png', strap: 'Something always goes wrong. Someone always fixes it.', desc: 'This group attracts glitches but also produces recovery. It is not smooth. It is resilient in a very specific, slightly cursed way.', works: ['good save behavior', 'high adaptability', 'people notice cracks early'], breaks: ['preventable chaos', 'patching instead of preventing', 'fixers get tired'], tip: 'Build one prevention rule so the same fire does not become tradition.' },
  hardCarry: { title: 'Hard Carry', image: '/assets/groups/hard-carry.png', strap: 'One or two people are the infrastructure.', desc: 'This group works because a small subset of members quietly converts confusion into reality. The rest are not useless. They are just not the plumbing.', works: ['strong anchor presence', 'solid delivery through key members', 'high clutch potential'], breaks: ['uneven labor', 'silent resentment risk', 'group confidence depends on the same people'], tip: 'Expose the hidden labor before the strongest members become folklore and ash.' },
  syncedUp: { title: 'Synced Up', image: '/assets/groups/synced-up.png', strap: 'You think fast, move fast, and somehow do not trip over each other.', desc: 'This group has timing. Not everyone is identical, but the rhythm is shared, and that makes coordination feel strangely easy.', works: ['high mutual readability', 'clean pacing', 'low friction decisions'], breaks: ['can become insular', 'shared blind spots', 'success may hide missing perspectives'], tip: 'Invite one intentional outsider thought before calling it perfect.' },
  tooOnline: { title: 'Too Online', image: '/assets/groups/too-online.png', strap: 'You communicate in references, irony, and psychic damage.', desc: 'This group has elite meme fluency and potentially alarming compression rates. Internal communication is fast. Outsiders may interpret it as weather.', works: ['inside-joke bandwidth', 'rapid vibe transfer', 'absurd resilience through humor'], breaks: ['ambiguity to newcomers', 'important details hidden inside irony', 'serious things get wrapped in bits'], tip: 'Keep the jokes. Surface one literal sentence when the stakes are real.' },
  plotArmor: { title: 'Plot Armor', image: '/assets/groups/plot-armor.png', strap: 'By all logic, this should not work. Yet.', desc: 'This group survives on improbable saves, lucky timing, and the strange narrative law that chaos is not always fatal. Against reason, it keeps landing.', works: ['clutch recovery', 'high tolerance for weird paths', 'momentum returns when it matters'], breaks: ['bad habits get rewarded', 'overconfidence in miracles', 'success can hide weak systems'], tip: 'Treat the miracle as a warning, not a workflow.' },
  groupChat: { title: 'Group Chat', image: '/assets/groups/group-chat.png', strap: 'Emotionally active. Logistically underdeveloped.', desc: 'This group is alive, responsive, and rich in reaction. It cares. It checks in. It also occasionally confuses communication with coordination.', works: ['high social warmth', 'everyone has presence', 'support comes quickly'], breaks: ['decision fog', 'looping discussion', 'strong response energy without final alignment'], tip: 'End the conversation with a concrete next move while everyone is still online.' },
};

function sendError(res, status, message) {
  res.status(status).json({ error: message });
}

function randomCode() {
  let code = '';
  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function randomPlayerId() {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

function playerCount(room) {
  return Object.keys(room.players).length;
}

function orderedPlayers(room) {
  return Object.values(room.players).sort((a, b) => a.joinOrder - b.joinOrder);
}

function serializeRoom(room, playerId) {
  const me = room.players[playerId];
  return {
    roomCode: room.roomCode,
    groupName: room.groupName,
    roomType: room.roomType,
    status: room.status,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers,
    players: orderedPlayers(room).map((player) => ({
      id: player.id,
      name: player.name,
      completed: !!player.completed,
      progress: Object.keys(player.answers || {}).length,
      isHost: player.id === room.hostId,
    })),
    me: me ? {
      id: me.id,
      name: me.name,
      answers: me.answers || {},
      completed: !!me.completed,
      joinOrder: me.joinOrder,
    } : null,
    result: room.status === 'result' ? room.result : null,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function avg(numbers) {
  return numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
}

function stdDev(numbers) {
  if (!numbers.length) return 0;
  const mean = avg(numbers);
  return Math.sqrt(avg(numbers.map((n) => (n - mean) ** 2)));
}

function scoreToPercent(rawAverage) {
  return clamp(((rawAverage - 1) / 6) * 100, 0, 100);
}

function getPoleLabel(value, left, right) {
  if (value >= 60) return right;
  if (value <= 40) return left;
  return `${left} ↔ ${right}`;
}

function distanceToTarget(scores, target) {
  return Math.abs(scores.signal - target.signal)
    + Math.abs(scores.brain - target.brain)
    + Math.abs(scores.grid - target.grid)
    + Math.abs(scores.driver - target.driver);
}

function assignRole(scores) {
  return ROLE_LIBRARY
    .map((role) => ({ ...role, distance: distanceToTarget(scores, role.target) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function calculateMemberProfile(player) {
  const scores = {};
  for (const dimension of ['signal', 'brain', 'grid', 'driver']) {
    const items = QUESTIONS.filter((q) => q.dimension === dimension);
    const scored = items.map((q) => {
      const raw = player.answers?.[q.id] ?? 4;
      return q.reverse ? 8 - raw : raw;
    });
    scores[dimension] = round1(scoreToPercent(avg(scored)));
  }

  const role = assignRole(scores);
  const carry = round1(scores.grid * 0.55 + scores.driver * 0.45);

  return {
    id: player.id,
    name: player.name,
    scores,
    role,
    carry,
    labels: {
      signal: getPoleLabel(scores.signal, 'Static', 'Signal'),
      brain: getPoleLabel(scores.brain, 'Heart', 'Brain'),
      grid: getPoleLabel(scores.grid, 'Chaos', 'Grid'),
      driver: getPoleLabel(scores.driver, 'Drifter', 'Driver'),
    },
  };
}

function emotionalCopyByType(groupType) {
  if (groupType === 'tooOnline') return 'Your friendship language is reference density. Outsiders will not understand the sentence, but you will understand the season finale.';
  if (groupType === 'hotMess') return 'You keep meaning “we should hang out soon,” and unlike most people, you actually mean it with your whole heart.';
  if (groupType === 'plotArmor') return 'By all scheduling law, this group should have drifted apart three times already. Yet it keeps respawning.';
  return 'This friend group has strong internal gravity. The exact method is unclear. The effect is real.';
}

function buildScenario(roomType, groupType, topCarrierName, chaos, followThrough) {
  const typeTitle = GROUP_TYPES[groupType].title;
  if (roomType === 'groupProject') {
    if (groupType === 'hardCarry') return `${topCarrierName} is the infrastructure. Two people are ideas. One person discovers urgency at 1:13 AM. The grade survives anyway.`;
    if (groupType === 'lockedIn' || groupType === 'mainQuest') return 'The doc opens on time, the sections get claimed, and everyone behaves a little too much like adults.';
    if (chaos > 65) return 'You begin with one deliverable and somehow generate three side plots, two aesthetic debates, and a final sprint powered by guilt.';
    return `This would be a very ${typeTitle} group project: emotionally rich, operationally negotiable, and more capable than it first looks.`;
  }
  if (roomType === 'travelSquad') {
    if (followThrough > 65) return 'The itinerary exists, the bookings are real, and the timing only becomes slightly philosophical near sunset.';
    if (chaos > 70) return 'The energy would be immaculate. The logistics would be criminal.';
    return 'You would absolutely make the trip happen. Whether you make the original plan happen is a separate question.';
  }
  if (roomType === 'roommates') {
    if (groupType === 'groupChat') return 'The communication would be active and sincere. The trash schedule would still somehow become mythological.';
    if (followThrough > 66) return 'This house would run on routines, low drama, and suspiciously good fridge governance.';
    return 'The vibes are livable. The chores are a competing ideology.';
  }
  if (roomType === 'clubTeam') {
    return followThrough > 60
      ? 'This team would have real momentum, clean handoffs, and one channel where the important information actually lives.'
      : 'This team would produce moments of brilliance, a lot of personality, and occasional confusion about where the actual update was posted.';
  }
  if (roomType === 'friendGroup') return emotionalCopyByType(groupType);
  return `This is a ${typeTitle} group in the best and most inconvenient sense. The dynamic is specific, memorable, and very shareable.`;
}

function calculateGroupResults(room) {
  const profiles = orderedPlayers(room).map(calculateMemberProfile);

  const signalAvg = round1(avg(profiles.map((p) => p.scores.signal)));
  const brainAvg = round1(avg(profiles.map((p) => p.scores.brain)));
  const gridAvg = round1(avg(profiles.map((p) => p.scores.grid)));
  const driverAvg = round1(avg(profiles.map((p) => p.scores.driver)));
  const heartAvg = round1(100 - brainAvg);

  const chaos = round1(100 - gridAvg);
  const dimensionSpread = avg([
    stdDev(profiles.map((p) => p.scores.signal)),
    stdDev(profiles.map((p) => p.scores.brain)),
    stdDev(profiles.map((p) => p.scores.grid)),
    stdDev(profiles.map((p) => p.scores.driver)),
  ]);
  const sync = round1(clamp(100 - dimensionSpread * 2.05, 0, 100));
  const followThrough = round1(clamp(gridAvg * 0.65 + driverAvg * 0.35, 0, 100));
  const emotionalRange = round1(clamp(signalAvg * 0.45 + heartAvg * 0.55, 0, 100));
  const deadlineSurvival = round1(clamp(followThrough * 0.55 + sync * 0.25 + brainAvg * 0.2 - chaos * 0.12, 0, 100));
  const carryScores = profiles.map((p) => p.carry);
  const carryIndex = round1(Math.max(...carryScores) - avg(carryScores));
  const onlineScore = round1(clamp(signalAvg * 0.32 + chaos * 0.22 + emotionalRange * 0.46, 0, 100));

  let groupTypeKey = 'hotMess';
  if (carryIndex > 22 && followThrough < 68) groupTypeKey = 'hardCarry';
  else if (followThrough > 78 && sync > 68) groupTypeKey = 'lockedIn';
  else if (followThrough > 66 && driverAvg > 62 && chaos < 44) groupTypeKey = 'mainQuest';
  else if (chaos > 78 && deadlineSurvival < 42) groupTypeKey = 'cooked';
  else if (sync > 78 && followThrough > 56) groupTypeKey = 'syncedUp';
  else if (onlineScore > 76 && sync < 68) groupTypeKey = 'tooOnline';
  else if (chaos > 70 && deadlineSurvival > 58) groupTypeKey = 'plotArmor';
  else if (emotionalRange > 76 && followThrough < 38 && sync > 54) groupTypeKey = 'vibesOnly';
  else if (emotionalRange > 72 && followThrough < 48) groupTypeKey = 'groupChat';
  else if (chaos > 66 && signalAvg > 58 && followThrough >= 40 && followThrough <= 64) groupTypeKey = 'sideQuest';
  else if (chaos > 54 && followThrough >= 45 && followThrough <= 70 && carryIndex >= 10 && carryIndex <= 22) groupTypeKey = 'damageControl';
  else if (emotionalRange > 64 && chaos > 60) groupTypeKey = 'hotMess';

  const type = GROUP_TYPES[groupTypeKey];
  const topCarrier = [...profiles].sort((a, b) => b.carry - a.carry)[0];
  const softLanding = [...profiles].sort((a, b) => ((100 - a.scores.brain) + (100 - a.scores.driver)) - ((100 - b.scores.brain) + (100 - b.scores.driver)))[0];

  let bestPair = null;
  let frictionPair = null;
  if (profiles.length >= 2) {
    const pairs = [];
    for (let i = 0; i < profiles.length; i += 1) {
      for (let j = i + 1; j < profiles.length; j += 1) {
        const a = profiles[i];
        const b = profiles[j];
        const diffs = {
          signal: Math.abs(a.scores.signal - b.scores.signal),
          brain: Math.abs(a.scores.brain - b.scores.brain),
          grid: Math.abs(a.scores.grid - b.scores.grid),
          driver: Math.abs(a.scores.driver - b.scores.driver),
        };
        const harmony = round1(100 - avg(Object.values(diffs)));
        const friction = round1(diffs.grid * 0.35 + diffs.driver * 0.35 + diffs.signal * 0.15 + diffs.brain * 0.15);
        pairs.push({ a, b, harmony, friction });
      }
    }
    bestPair = [...pairs].sort((x, y) => y.harmony - x.harmony)[0];
    frictionPair = [...pairs].sort((x, y) => y.friction - x.friction)[0];
  }

  return {
    type,
    topCarrier,
    softLanding,
    metrics: {
      chaos, sync, followThrough, emotionalRange, deadlineSurvival, carryIndex,
      signalAvg, brainAvg, gridAvg, driverAvg, onlineScore,
    },
    bestPair,
    frictionPair,
    scenario: buildScenario(room.roomType, groupTypeKey, topCarrier.name, chaos, followThrough),
    radar: [
      { label: 'Signal', score: signalAvg },
      { label: 'Brain', score: brainAvg },
      { label: 'Grid', score: gridAvg },
      { label: 'Driver', score: driverAvg },
    ],
    profiles,
  };
}

app.get('/api/meta', (req, res) => {
  res.json({ roomTypes: ROOM_TYPES, questions: QUESTIONS, maxPlayers: 4 });
});

app.post('/api/rooms/create', (req, res) => {
  const playerName = String(req.body.playerName || '').trim();
  const groupName = String(req.body.groupName || 'GroupTI Live Room').trim() || 'GroupTI Live Room';
  const roomType = String(req.body.roomType || 'friendGroup').trim() || 'friendGroup';
  if (!playerName) return sendError(res, 400, 'Player name is required.');

  const roomCode = randomCode();
  const playerId = randomPlayerId();
  const room = {
    roomCode, groupName, roomType,
    hostId: playerId, maxPlayers: 4, status: 'lobby', createdAt: Date.now(),
    players: {
      [playerId]: { id: playerId, name: playerName, answers: {}, completed: false, joinOrder: 1 }
    },
    result: null,
  };
  rooms.set(roomCode, room);
  res.json({ roomCode, playerId, room: serializeRoom(room, playerId) });
});

app.post('/api/rooms/join', (req, res) => {
  const roomCode = String(req.body.roomCode || '').trim().toUpperCase();
  const playerName = String(req.body.playerName || '').trim();
  if (!roomCode || !playerName) return sendError(res, 400, 'Room code and player name are required.');

  const room = rooms.get(roomCode);
  if (!room) return sendError(res, 404, 'Room not found.');
  if (room.status !== 'lobby') return sendError(res, 400, 'This room has already started.');
  if (playerCount(room) >= room.maxPlayers) return sendError(res, 400, 'This room is already full.');

  const playerId = randomPlayerId();
  room.players[playerId] = { id: playerId, name: playerName, answers: {}, completed: false, joinOrder: playerCount(room) + 1 };
  res.json({ roomCode, playerId, room: serializeRoom(room, playerId) });
});

app.post('/api/rooms/start', (req, res) => {
  const roomCode = String(req.body.roomCode || '').trim().toUpperCase();
  const playerId = String(req.body.playerId || '').trim();
  const room = rooms.get(roomCode);
  if (!room) return sendError(res, 404, 'Room not found.');
  if (room.hostId !== playerId) return sendError(res, 403, 'Only the host can start the room.');
  if (room.status !== 'lobby') return sendError(res, 400, 'Room has already started.');
  if (playerCount(room) !== room.maxPlayers) return sendError(res, 400, 'All 4 players must join first.');
  room.status = 'quiz';
  room.startedAt = Date.now();
  res.json({ ok: true, room: serializeRoom(room, playerId) });
});

app.post('/api/rooms/answer', (req, res) => {
  const roomCode = String(req.body.roomCode || '').trim().toUpperCase();
  const playerId = String(req.body.playerId || '').trim();
  const questionId = Number(req.body.questionId);
  const score = Number(req.body.score);

  const room = rooms.get(roomCode);
  if (!room) return sendError(res, 404, 'Room not found.');
  if (room.status !== 'quiz') return sendError(res, 400, 'Room is not in quiz mode.');

  const player = room.players[playerId];
  if (!player) return sendError(res, 404, 'Player not found.');
  if (!QUESTIONS.some((q) => q.id === questionId)) return sendError(res, 400, 'Invalid question.');
  if (!Number.isInteger(score) || score < 1 || score > 7) return sendError(res, 400, 'Score must be between 1 and 7.');

  player.answers[questionId] = score;
  res.json({ ok: true, progress: Object.keys(player.answers).length });
});

app.post('/api/rooms/finish', (req, res) => {
  const roomCode = String(req.body.roomCode || '').trim().toUpperCase();
  const playerId = String(req.body.playerId || '').trim();
  const room = rooms.get(roomCode);
  if (!room) return sendError(res, 404, 'Room not found.');
  if (room.status !== 'quiz') return sendError(res, 400, 'Room is not in quiz mode.');

  const player = room.players[playerId];
  if (!player) return sendError(res, 404, 'Player not found.');
  if (Object.keys(player.answers).length < QUESTIONS.length) return sendError(res, 400, 'Please answer all 20 questions first.');

  player.completed = true;
  player.completedAt = Date.now();

  const players = orderedPlayers(room);
  if (players.length === room.maxPlayers && players.every((p) => p.completed)) {
    room.result = calculateGroupResults(room);
    room.status = 'result';
    room.finishedAt = Date.now();
  }

  res.json({ ok: true, room: serializeRoom(room, playerId) });
});

app.get('/api/rooms/:roomCode', (req, res) => {
  const roomCode = String(req.params.roomCode || '').trim().toUpperCase();
  const playerId = String(req.query.playerId || '').trim();
  const room = rooms.get(roomCode);
  if (!room) return sendError(res, 404, 'Room not found.');
  res.json(serializeRoom(room, playerId));
});

app.listen(PORT, () => {
  console.log(`GroupTI server running on http://localhost:${PORT}`);
});
