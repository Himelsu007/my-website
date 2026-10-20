#!/usr/bin/env node
// ========================================
// STOCK SYNC — Matrix → the store
// ========================================
// Reads what is left of every product from Matrix (the Locked In app on this
// Mac) and writes javascript/product-stock.js, which the store, the bag and
// tools/build-store.mjs all count from. bump-assets.sh runs it first, so every
// publish carries Matrix's current stock: a product that runs out drops to
// Back Soon, and one Matrix restocks comes back up.
//
// Matrix keeps its data in Chromium localStorage (a LevelDB folder). This
// reads a copy of that folder, so the app can stay open. If the folder isn't
// there (another computer) it falls back to the newest Matrix backup, and if
// that isn't there either it leaves product-stock.js as it is.
//
// A store product is matched to its Matrix record by `matrixSku`, then by
// `sku`, then by exact name. Anything left unmatched is listed, because it
// would otherwise be sold without a stock limit.
//
//   node tools/sync-stock.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEVELDB = path.join(os.homedir(), "Library/Application Support/Locked In/Local Storage/leveldb");
const BACKUPS = path.join(os.homedir(), "Documents/Matrix/Backups");
const OUT = path.join(ROOT, "javascript/product-stock.js");

// ---- LevelDB, read-only, just enough to find one key ----
function varint(b, i) {
    let r = 0, s = 0, c;
    do { c = b[i++]; r += (c & 0x7f) * 2 ** s; s += 7; } while (c >= 0x80);
    return [r, i];
}

function unsnappy(src) {
    let [n, i] = varint(src, 0);
    const out = Buffer.alloc(n);
    let o = 0;
    while (i < src.length) {
        const t = src[i], tag = t & 3;
        if (tag === 0) {
            let len = t >> 2;
            if (len < 60) { len += 1; i += 1; } else {
                const nb = len - 59;
                len = src.readUIntLE(i + 1, nb) + 1; i += 1 + nb;
            }
            src.copy(out, o, i, i + len); o += len; i += len;
            continue;
        }
        let len, off;
        if (tag === 1) { len = ((t >> 2) & 7) + 4; off = ((t >> 5) << 8) | src[i + 1]; i += 2; }
        else if (tag === 2) { len = (t >> 2) + 1; off = src.readUInt16LE(i + 1); i += 3; }
        else { len = (t >> 2) + 1; off = src.readUInt32LE(i + 1); i += 5; }
        for (let k = 0; k < len; k++, o++) out[o] = out[o - off];
    }
    return out;
}

function* blockEntries(b) {
    const restarts = b.readUInt32LE(b.length - 4);
    const end = b.length - 4 - 4 * restarts;
    let i = 0, key = Buffer.alloc(0);
    while (i < end) {
        let shared, nonShared, vlen;
        [shared, i] = varint(b, i); [nonShared, i] = varint(b, i); [vlen, i] = varint(b, i);
        key = Buffer.concat([key.subarray(0, shared), b.subarray(i, i + nonShared)]); i += nonShared;
        yield [key, b.subarray(i, i + vlen)]; i += vlen;
    }
}

function tableBlock(data, off, size) {
    const raw = data.subarray(off, off + size);
    return data[off + size] === 1 ? unsnappy(raw) : raw;
}

// Every value written to `key`, with its sequence number, from .ldb tables
// and .log files alike; the highest sequence is the current one.
function newestValue(dir, keySuffix) {
    let best = null;
    const consider = (seq, val) => { if (!best || seq > best.seq) best = { seq, val }; };
    for (const f of fs.readdirSync(dir)) {
        const data = fs.readFileSync(path.join(dir, f));
        if (f.endsWith(".ldb")) {
            const foot = data.subarray(data.length - 48);
            let i = 0, io, isz;
            [, i] = varint(foot, i); [, i] = varint(foot, i);
            [io, i] = varint(foot, i); [isz] = varint(foot, i);
            for (const [, handle] of blockEntries(tableBlock(data, io, isz))) {
                let j = 0, bo, bsz;
                [bo, j] = varint(handle, j); [bsz] = varint(handle, j);
                for (const [k, v] of blockEntries(tableBlock(data, bo, bsz))) {
                    const user = k.subarray(0, k.length - 8);
                    if (k[k.length - 8] !== 1 || !user.toString("latin1").endsWith(keySuffix)) continue;
                    consider(Number(k.readBigUInt64LE(k.length - 8) >> 8n), Buffer.from(v));
                }
            }
        } else if (f.endsWith(".log")) {
            let pending = null;
            const records = [];
            for (let bs = 0; bs < data.length; bs += 32768) {
                const blk = data.subarray(bs, bs + 32768);
                let i = 0;
                while (i + 7 <= blk.length) {
                    const len = blk.readUInt16LE(i + 4), type = blk[i + 6];
                    if (type === 0 && len === 0) break;
                    const frag = blk.subarray(i + 7, i + 7 + len); i += 7 + len;
                    if (type === 1) records.push(frag);
                    else if (type === 2) pending = [frag];
                    else if (type === 3 && pending) pending.push(frag);
                    else if (type === 4 && pending) { pending.push(frag); records.push(Buffer.concat(pending)); pending = null; }
                }
            }
            for (const rec of records) {
                if (rec.length < 12) continue;
                const seq = Number(rec.readBigUInt64LE(0)), count = rec.readUInt32LE(8);
                let i = 12;
                try {
                    for (let n = 0; n < count; n++) {
                        const tag = rec[i++];
                        let klen, vlen;
                        [klen, i] = varint(rec, i);
                        const key = rec.subarray(i, i + klen); i += klen;
                        if (tag !== 1) continue;
                        [vlen, i] = varint(rec, i);
                        if (key.toString("latin1").endsWith(keySuffix)) consider(seq + n, Buffer.from(rec.subarray(i, i + vlen)));
                        i += vlen;
                    }
                } catch (e) { /* a torn record at the end of a live log */ }
            }
        }
    }
    return best && best.val;
}

// localStorage values carry a one-byte encoding prefix: 0 = UTF-16LE, 1 = Latin-1.
const decode = v => (v[0] === 0 ? v.subarray(1).toString("utf16le") : v.subarray(1).toString("latin1"));

function readMatrix() {
    if (fs.existsSync(LEVELDB)) {
        const copy = fs.mkdtempSync(path.join(os.tmpdir(), "lx-stock-"));
        try {
            for (const f of fs.readdirSync(LEVELDB)) {
                if (/\.(ldb|log)$/.test(f)) fs.copyFileSync(path.join(LEVELDB, f), path.join(copy, f));
            }
            const v = newestValue(copy, "fin-products");
            if (v) return { from: "Matrix (live)", items: JSON.parse(decode(v)) };
        } catch (e) {
            console.warn("sync-stock: could not read Matrix's live data:", e.message);
        } finally {
            fs.rmSync(copy, { recursive: true, force: true });
        }
    }
    if (fs.existsSync(BACKUPS)) {
        const latest = fs.readdirSync(BACKUPS).filter(f => /^alfred-.*\.json$/.test(f)).sort().pop();
        if (latest) {
            const d = JSON.parse(fs.readFileSync(path.join(BACKUPS, latest), "utf8"));
            const raw = d.finance && d.finance["fin-products"];
            if (raw) return { from: `Matrix backup ${latest}`, items: typeof raw === "string" ? JSON.parse(raw) : raw };
        }
    }
    return null;
}

// ---- match and write ----
const matrix = readMatrix();
if (!matrix) {
    console.log("sync-stock: Matrix not found on this computer; product-stock.js left as it is");
    process.exit(0);
}

const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ROOT, "javascript/product-catalog.js"), "utf8"), ctx);
const products = vm.runInContext("products", ctx);

const norm = s => String(s || "").toLowerCase().replace(/[—–-]/g, "-").replace(/\s+/g, " ").trim();
const bySku = new Map(matrix.items.filter(m => m.sku).map(m => [m.sku, m]));
const byName = new Map(matrix.items.map(m => [norm(m.name), m]));

// Sized records become { size: count }. "Unsized" stock (Matrix's word for
// pairs not yet sorted by size) is a pool any size can draw on, so a record
// that only has that becomes a plain number.
function countOf(m) {
    const variants = m.variants || [];
    if (!variants.length) return Number(m.qty) || 0;
    const unsized = variants.filter(v => /unsized/i.test(v.name));
    const sized = variants.filter(v => !/unsized/i.test(v.name));
    const pool = unsized.reduce((n, v) => n + (Number(v.qty) || 0), 0);
    if (!sized.length) return pool;
    if (pool > 0) console.warn(`sync-stock: ${m.name} has ${pool} unsized next to its sizes; counted by size only`);
    return Object.fromEntries(sized.map(v => [v.name, Number(v.qty) || 0]));
}

const counts = {};
const unmatched = [];
for (const p of products) {
    const m = (p.matrixSku && bySku.get(p.matrixSku)) || bySku.get(p.sku) || byName.get(norm(p.name));
    if (m) counts[p.sku] = countOf(m);
    else if (p.stock == null) unmatched.push(p.name);
}

const body = Object.entries(counts)
    .map(([sku, c]) => `    ${JSON.stringify(sku)}: ${JSON.stringify(c).replace(/,"/g, ', "').replace(/":/g, '": ')}`)
    .join(",\n");
const file = `// Written by tools/sync-stock.mjs from ${matrix.from}. Do not edit:
// change stock in Matrix and publish (./bump-assets.sh runs the sync).
// Keyed by our sku; a number, or { size: count }.
lxApplyStock({
${body}
});
`;
const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
if (before !== file) fs.writeFileSync(OUT, file);

const left = Object.values(counts).reduce((n, c) => n + (typeof c === "number" ? c : Object.values(c).reduce((a, b) => a + b, 0)), 0);
console.log(`stock sync -> ${Object.keys(counts).length} products from ${matrix.from}, ${left} items left${before === file ? " (no change)" : ""}`);
if (unmatched.length) console.warn(`sync-stock: not in Matrix, sold without a limit: ${unmatched.join("; ")}`);
