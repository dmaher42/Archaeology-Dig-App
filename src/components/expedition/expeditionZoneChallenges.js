export const EXPEDITION_ZONE_CHALLENGES = {
  riverbank: {
    zoneId: 'riverbank',
    title: 'Stabilise the Riverbank',
    question: 'Wet ground can preserve clues, but it can also damage a site. What should the team check first?',
    icon: 'riverbankChallengeIcon',
    correctAnswerId: 'stable-silt',
    answers: [
      {
        id: 'stable-silt',
        text: 'Check the ground is stable and that silt or water marks may preserve clues.',
        feedback: 'Correct. Stable ground and preserved marks both matter before surveying.',
      },
      {
        id: 'rush-water',
        text: 'Walk straight through the wettest part so the survey is faster.',
        feedback: 'Try again. Wet ground can be unsafe and can damage clues.',
      },
      {
        id: 'ignore-silt',
        text: 'Ignore silt marks because only stone clues matter.',
        feedback: 'Try again. Natural marks can help explain how the site formed.',
      },
    ],
  },
  burial: {
    zoneId: 'burial',
    title: 'Respectful Access Protocol',
    question: 'Burial places must be treated carefully and respectfully. What should the team do before surveying?',
    icon: 'burialChallengeIcon',
    correctAnswerId: 'respect-remains',
    answers: [
      {
        id: 'respect-remains',
        text: 'Plan a careful, respectful survey before disturbing the area.',
        feedback: 'Correct. Care and respect come first in burial areas.',
      },
      {
        id: 'take-fast',
        text: 'Because burial areas always contain treasure to collect quickly.',
        feedback: 'Try again. Archaeology is not treasure hunting.',
      },
      {
        id: 'skip-records',
        text: 'Because recording the location is not important there.',
        feedback: 'Try again. Location records are especially important.',
      },
    ],
  },
  archive: {
    zoneId: 'archive',
    title: 'Decode the Archive Clue',
    question: 'Some evidence is recorded through marks, symbols or writing. What clue should the team look for?',
    icon: 'archiveChallengeIcon',
    correctAnswerId: 'symbols-records',
    answers: [
      {
        id: 'symbols-records',
        text: 'Symbols, marks, writing, labels or records.',
        feedback: 'Correct. Recorded clues often use marks or writing.',
      },
      {
        id: 'random-stone',
        text: 'Any stone, even if it has no marks or context.',
        feedback: 'Try again. The clue needs signs of recording.',
      },
      {
        id: 'only-gold',
        text: 'Only gold objects can count as archive evidence.',
        feedback: 'Try again. Written evidence can appear on many materials.',
      },
    ],
  },
  market: {
    zoneId: 'market',
    title: 'Ancient or Disturbance?',
    question: 'Not every object belongs to the ancient site. What should the team check before trusting it as evidence?',
    icon: 'marketChallengeIcon',
    correctAnswerId: 'site-context',
    answers: [
      {
        id: 'site-context',
        text: 'Check whether it belongs to the site context or is a modern disturbance.',
        feedback: 'Correct. Context helps decide whether an object is reliable evidence.',
      },
      {
        id: 'looks-old',
        text: 'Trust it if it looks old at first glance.',
        feedback: 'Try again. Looks alone are not enough.',
      },
      {
        id: 'nearest-exit',
        text: 'Keep only the objects closest to the Exit Gate.',
        feedback: 'Try again. Location matters, but not in that way.',
      },
    ],
  },
  wall: {
    zoneId: 'wall',
    title: 'Structural Survey',
    question: 'Built places can show organised construction. What clue should the team look for?',
    icon: 'ruinedWallChallengeIcon',
    correctAnswerId: 'aligned-foundations',
    answers: [
      {
        id: 'aligned-foundations',
        text: 'Aligned stonework, foundations, wall sections or planned building remains.',
        feedback: 'Correct. Patterns in built remains can show organised construction.',
      },
      {
        id: 'loose-sand',
        text: 'Loose sand with no pattern.',
        feedback: 'Try again. Look for a planned building pattern.',
      },
      {
        id: 'single-pebble',
        text: 'One loose pebble far from the wall.',
        feedback: 'Try again. Strong structural clues show alignment or foundations.',
      },
    ],
  },
  gate: {
    zoneId: 'gate',
    title: 'Evidence Check',
    question: 'Before leaving, what should the team confirm?',
    icon: 'exitGateChallengeIcon',
    correctAnswerId: 'enough-recorded',
    answers: [
      {
        id: 'enough-recorded',
        text: 'Enough mission evidence has been collected and recorded.',
        feedback: 'Correct. The Exit Gate needs recorded mission evidence.',
      },
      {
        id: 'leave-early',
        text: 'Leave as soon as one interesting clue is seen.',
        feedback: 'Try again. One clue is not enough for this mission.',
      },
      {
        id: 'ignore-satchel',
        text: 'Ignore the evidence satchel and make a guess.',
        feedback: 'Try again. A strong claim needs collected evidence.',
      },
    ],
  },
};

export const getZoneChallenge = (zoneId) => EXPEDITION_ZONE_CHALLENGES[zoneId] || null;
