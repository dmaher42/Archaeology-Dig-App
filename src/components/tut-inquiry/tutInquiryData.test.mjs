/**
 * Integrity tests for the Cold Case: KV62 content data.
 * Pure data validation — guards the cross-references between evidence cards,
 * theories, experts, stations and the inquest so a typo can't ship a broken
 * investigation. Run: node --test src/components/tut-inquiry/tutInquiryData.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TUT_THEORIES, TUT_EXPERTS, TUT_EVIDENCE, TUT_STATIONS,
  TUT_INQUEST, TUT_GLOSSARY, TUT_SCORING, TUT_DOSSIER_DEFAULT,
} from './tutInquiryData.js';

const theoryIds = new Set(TUT_THEORIES.map(t => t.id));
const expertIds = new Set(TUT_EXPERTS.map(e => e.id));
const evidenceIds = new Set(TUT_EVIDENCE.map(e => e.id));
const stationIds = new Set(TUT_STATIONS.map(s => s.id));
const glossaryIds = new Set(TUT_GLOSSARY.map(g => g.id));

test('ids are unique within each collection', () => {
  assert.equal(theoryIds.size, TUT_THEORIES.length, 'duplicate theory id');
  assert.equal(expertIds.size, TUT_EXPERTS.length, 'duplicate expert id');
  assert.equal(evidenceIds.size, TUT_EVIDENCE.length, 'duplicate evidence id');
  assert.equal(stationIds.size, TUT_STATIONS.length, 'duplicate station id');
  assert.equal(glossaryIds.size, TUT_GLOSSARY.length, 'duplicate glossary id');
});

test('every theory has a valid lead expert', () => {
  for (const t of TUT_THEORIES) {
    assert.ok(expertIds.has(t.leadExpertId), `theory ${t.id} -> missing expert ${t.leadExpertId}`);
  }
});

test('experts reference real stations and glossary terms', () => {
  for (const e of TUT_EXPERTS) {
    assert.ok(stationIds.has(e.station), `expert ${e.id} -> missing station ${e.station}`);
    for (const gid of e.glossaryIds) {
      assert.ok(glossaryIds.has(gid), `expert ${e.id} -> missing glossary ${gid}`);
    }
  }
});

test('every evidence card links exactly the known theories and a real station/expert', () => {
  for (const card of TUT_EVIDENCE) {
    assert.ok(stationIds.has(card.station), `card ${card.id} -> bad station ${card.station}`);
    assert.ok(expertIds.has(card.expertId), `card ${card.id} -> bad expert ${card.expertId}`);
    for (const k of Object.keys(card.links)) {
      assert.ok(theoryIds.has(k), `card ${card.id} -> link to unknown theory ${k}`);
    }
    for (const v of Object.values(card.links)) {
      assert.ok(Number.isInteger(v) && v >= -3 && v <= 3, `card ${card.id} -> link weight out of range`);
    }
  }
});

test('contest / debunk references point at real cards and are reciprocal', () => {
  for (const card of TUT_EVIDENCE) {
    if (card.contestedBy) {
      assert.ok(evidenceIds.has(card.contestedBy), `card ${card.id} -> contestedBy unknown ${card.contestedBy}`);
      assert.ok(card.whenContested && card.whenContested.links, `card ${card.id} -> contestedBy without whenContested`);
      const other = TUT_EVIDENCE.find(e => e.id === card.contestedBy);
      assert.equal(other.debunks, card.id, `card ${card.contestedBy} should declare debunks ${card.id}`);
    }
    if (card.debunks) {
      assert.ok(evidenceIds.has(card.debunks), `card ${card.id} -> debunks unknown ${card.debunks}`);
    }
  }
});

test('inquest challenges reference real evidence cards', () => {
  for (const c of TUT_INQUEST.challenges) {
    for (const id of c.bestCardIds) assert.ok(evidenceIds.has(id), `inquest ${c.id} -> best card ${id} unknown`);
    for (const id of (c.acceptableCardIds || [])) assert.ok(evidenceIds.has(id), `inquest ${c.id} -> acceptable card ${id} unknown`);
  }
});

test('composite verdict points at real theories', () => {
  const cv = TUT_INQUEST.compositeVerdict;
  assert.ok(theoryIds.has(cv.primaryTheoryId), 'composite primary theory unknown');
  for (const id of cv.chainTheoryIds) assert.ok(theoryIds.has(id), `composite chain theory ${id} unknown`);
});

test('default dossier is a real theory', () => {
  assert.ok(theoryIds.has(TUT_DOSSIER_DEFAULT), 'default dossier theory unknown');
});

test('scoring ranks descend and cover zero', () => {
  const mins = TUT_SCORING.ranks.map(r => r.min);
  const sorted = [...mins].sort((a, b) => b - a);
  assert.deepEqual(mins, sorted, 'ranks must be listed high -> low');
  assert.equal(Math.min(...mins), 0, 'lowest rank must start at 0');
});

test('the four curriculum theories plus the folk theory are present', () => {
  for (const id of ['murder', 'accident', 'frailty', 'disease', 'curse']) {
    assert.ok(theoryIds.has(id), `missing required theory ${id}`);
  }
  assert.ok(TUT_THEORIES.find(t => t.id === 'curse').isFolkTheory, 'curse must be flagged as folk theory');
});

test('at least one keystone debunk exists for the myth-buster path', () => {
  assert.ok(TUT_EVIDENCE.some(e => e.keystone && e.debunks), 'need a keystone debunk card');
});
