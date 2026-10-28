#!/usr/bin/env node
// scripts/build-index.mjs
// data/ にある取引日の一覧を data/index.json に書き出す
// （GitHub Pages ではフォルダの中身を一覧できないため、ページはこの一覧から各日のデータを読む）

import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = 'data';
const DATE_RE = /^(\d{4}-\d{2}-\d{2})\.(csv|json)$/;

async function listDates(dir) {
  try {
    return (await fs.readdir(dir)).map(f => f.match(DATE_RE)).filter(Boolean);
  } catch {
    return [];
  }
}

const days = {};
const mark = (date, key) => { (days[date] ||= { date, csv: false, notes: null })[key] = true; };
for (const [, date, ext] of await listDates(DATA_DIR)) {
  if (ext === 'csv') mark(date, 'csv');
  else days[date] = { ...(days[date] || { date, csv: false }), notes: `${DATA_DIR}/${date}.json` };
}
// 旧方式の振り返りメモ（data/notes/）。新方式（data/日付.json）があればそちらを優先
for (const [, date, ext] of await listDates(path.join(DATA_DIR, 'notes'))) {
  if (ext !== 'json') continue;
  days[date] ||= { date, csv: false, notes: null };
  days[date].notes ||= `${DATA_DIR}/notes/${date}.json`;
}

const list = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
await fs.writeFile(path.join(DATA_DIR, 'index.json'), JSON.stringify(list, null, 2) + '\n');
console.log(`data/index.json: ${list.length} days`);
