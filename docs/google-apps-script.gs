/**
 * LOCKED IN LX — signup counter, roster + totals
 * Paste this into Extensions > Apps Script on your Google Sheet (replace
 * everything that's there), then Deploy > Manage deployments > edit the
 * existing web app > Version: New version > Deploy.
 *    Execute as     : Me
 *    Who has access : Anyone
 *
 * Four tabs, created automatically:
 *   Signups  - one row per form submission. THIS is what the website counts.
 *   Roster   - one row per PERSON (player + each named guest), plus anyone
 *              you add by hand. Beyond capacity they go "Off the bench".
 *   Totals   - per-run headcount. Refresh from the "Locked In" menu.
 *   Orders   - one row per store order, written the moment the buyer sends
 *              it. THE STATUS COLUMN IS YOURS TO EDIT: type Requested,
 *              Confirmed, Ready, Delivered or Cancelled and the buyer's
 *              order link shows it the next time they open it. The Note
 *              column, if you fill it, shows up under the tracker.
 *              Changing Status also writes a one-tap "Tell them" link that
 *              opens WhatsApp with the update already written — see onEdit
 *              at the bottom. Type anything into the ETA column ("Sat
 *              18:00–20:00", "Tomorrow morning") and it replaces the
 *              estimate on the buyer's page; leave it blank and the page
 *              works one out itself.
 *              The order link closes once its order is Delivered or
 *              Cancelled, or once its row is deleted from this tab.
 *              Buyers who leave an email get one when the order arrives and
 *              on each Status change: see ORDER EMAILS at the bottom, and
 *              run "Turn on order emails" from the Locked In menu once.
 */

var SHEET_NAME  = 'Signups';
var ROSTER_NAME = 'Roster';
var TOTALS_NAME = 'Totals';

/* How many PLAYING spots each run has. Anyone past this lands on the bench.
   Key it on the run name exactly as it appears in the Roster "Run" column. */
var CAPACITY = {
  'FULL COURT 5V5': 20
};
var DEFAULT_CAPACITY = 20;

/* ------------------------------------------------------------------ tabs */
function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  var head = ['Timestamp', 'Run Key', 'Run', 'When', 'Where',
              'Player', 'Age Group', 'Playing Guests', 'Watching Guests', 'Spots',
              'Playing Guest Names', 'Watching Guest Names'];
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(head);
    sh.setFrozenRows(1);
  } else {
    // Sheets made before the guest-name columns existed are 10 wide - widen them
    if (sh.getMaxColumns() < head.length) {
      sh.insertColumnsAfter(sh.getMaxColumns(), head.length - sh.getMaxColumns());
    }
    if (sh.getLastRow() > 0 && !String(sh.getRange(1, 11).getValue()).trim()) {
      sh.getRange(1, 11, 1, 2).setValues([[head[10], head[11]]]);
    }
  }
  return sh;
}

function roster_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ROSTER_NAME);
  if (!sh) {
    sh = ss.insertSheet(ROSTER_NAME);
    sh.appendRow(['Run', 'When', 'Name', 'Type', 'Role', 'Status', 'Source', 'Added']);
    sh.setFrozenRows(1);
    sh.getRange('A1:H1').setFontWeight('bold');
  }
  return sh;
}

/** Add one person to the roster. Bench status is worked out on refresh. */
function addToRoster_(run, when, name, type, role, source) {
  name = String(name || '').trim();
  if (!name) return;
  roster_().appendRow([String(run || ''), String(when || ''), name,
                       type, role, '', source, new Date()]);
}

/* The store's order log. Column D (Status) is the one you edit; everything
   else is written for you. Anything not recognised in that column is treated
   as "Requested" by the website rather than shown as a broken status. */
var ORDERS_NAME = 'Orders';

function orders_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ORDERS_NAME);
  if (!sh) {
    sh = ss.insertSheet(ORDERS_NAME);
    sh.appendRow(['Timestamp', 'Ref', 'Items', 'Status', 'Note', 'Updated',
                  'Total', 'Link', 'Fulfilment', 'Customer', 'Lines', 'Tell them', 'ETA',
                  'Key', 'Email', 'Emailed']);
    sh.setFrozenRows(1);
    sh.getRange('A1:P1').setFontWeight('bold');
    sh.setColumnWidth(3, 320);
    sh.setColumnWidth(8, 240);
    sh.setColumnWidth(9, 220);
    // Column J is JSON for other apps to read. Narrow on purpose — it is not
    // meant to be looked at, and a wide column of JSON makes the tab unusable.
    sh.setColumnWidth(11, 60);
    sh.setColumnWidth(12, 110);
    sh.setColumnWidth(13, 170);
    // Plain text, so "18:00" stays "18:00" and is not quietly turned into a
    // date on 30 December 1899, which is what Sheets does to a bare time.
    sh.getRange(2, 13, sh.getMaxRows() - 1, 1).setNumberFormat('@');

    // A dropdown on Status so the wording stays consistent and the website
    // never has to guess what a free-typed cell meant.
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Requested', 'Confirmed', 'Ready', 'Delivered', 'Cancelled'], true)
      .setAllowInvalid(true)
      .build();
    sh.getRange(2, 4, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  } else if (sh.getLastColumn() < 16) {
    // An Orders tab made before these columns existed is narrower. Widen it in
    // place rather than making people start a new tab — existing rows keep
    // every value where it was, because new columns only ever go on the end.
    var had = sh.getLastColumn();
    if (sh.getMaxColumns() < 16) sh.insertColumnsAfter(sh.getMaxColumns(), 16 - sh.getMaxColumns());
    var heads = ['Fulfilment', 'Customer', 'Lines', 'Tell them', 'ETA', 'Key', 'Email', 'Emailed'];
    sh.getRange(1, 9, 1, 8).setValues([heads]).setFontWeight('bold');
    if (had < 13) sh.getRange(2, 13, sh.getMaxRows() - 1, 1).setNumberFormat('@');
  }
  return sh;
}

/** Find an order row by its reference. Returns 0 when there is none. */
function findOrderRow_(ref) {
  var sh = orders_();
  var n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  var refs = sh.getRange(2, 2, n, 1).getValues();
  ref = String(ref || '').trim().toUpperCase();
  for (var i = 0; i < refs.length; i++) {
    if (String(refs[i][0]).trim().toUpperCase() === ref) return i + 2;
  }
  return 0;
}

/* ------------------------------------------------- write (from the site) */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);

    // Store order — logged so you have a row to move along, instead of
    // copying references out of WhatsApp by hand.
    if (d.kind === 'order') {
      var ref = String(d.ref || '').trim();
      if (!ref) return json_({ ok: false, error: 'no ref' });
      if (findOrderRow_(ref)) return json_({ ok: true, duplicate: true });

      orders_().appendRow([
        new Date(),
        ref,
        String(d.items || ''),
        'Requested',
        '',
        new Date(),
        Number(d.total || 0),
        String(d.link || ''),
        String(d.fulfilment || ''),
        String(d.customer || ''),
        JSON.stringify(d.lines || []),
        '',
        '',
        // The short link's secret half: lockedinlx.com/o#<ref>-<key> opens
        // this row's Link, but only with the key, so references can't be
        // guessed through to other people's addresses.
        /^[A-Za-z0-9]{6,12}$/.test(String(d.key || '')) ? String(d.key) : '',
        validEmail_(d.email) ? String(d.email).trim() : '',
        ''
      ]);
      // "We got your order", if they left an address. Never allowed to fail
      // the order itself.
      try { emailOrderRow_(orders_().getLastRow(), 'Requested'); } catch (err) {}
      return json_({ ok: true });
    }

    var playing  = [].concat(d.playingNames  || []).filter(String);
    var watching = [].concat(d.watchingNames || []).filter(String);

    sheet_().appendRow([
      new Date(),
      String(d.runKey || ''),
      String(d.run || ''),
      String(d.when || ''),
      String(d.where || ''),
      String(d.player || ''),
      String(d.age || ''),
      Number(d.guestsPlaying || 0),
      Number(d.guestsWatching || 0),
      Number(d.spots || 1),
      playing.join(', '),
      watching.join(', ')
    ]);

    // Mirror each human into the Roster tab
    addToRoster_(d.run, d.when, d.player, 'Player', 'Playing', 'Form');
    playing.forEach(function (n)  { addToRoster_(d.run, d.when, n, 'Guest', 'Playing',  'Form'); });
    watching.forEach(function (n) { addToRoster_(d.run, d.when, n, 'Guest', 'Watching', 'Form'); });

    refreshTotals();
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* --------------------------------------------- read (the website's count) */
function doGet(e) {
  // ?order=LX-2BD2  -> that order's status (the buyer's tracking page)
  // ?orders=1       -> every order, newest first (another app pulling them in)
  //                    &since=<ISO>  only those logged after that moment
  //                    &limit=<n>    cap the reply, default 100
  // no parameter    -> the signup tally, exactly as before, so the events page
  //                    keeps working untouched.
  var p = (e && e.parameter) ? e.parameter : {};
  var ref = String(p.order || '').trim();
  if (ref) return orderStatus_(ref);
  // ?short=XU4F&key=K7M2P9 -> the full order link behind a short one
  if (p.short) return shortLink_(String(p.short), String(p.key || ''));
  // Names live behind Matrix's key (Script property MATRIX_KEY): the order
  // list carries customer names, the roster carries players' names.
  if (p.orders) return matrixOk_(p) ? orderList_(p.since, p.limit) : json_({ ok: false, error: 'locked' });
  if (p.roster) return matrixOk_(p) ? rosterFor_(String(p.roster)) : json_({ ok: false, error: 'locked' });

  try {
    var sh = sheet_();
    var rows = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, 10).getValues()
      : [];
    var tally = {};
    rows.forEach(function (r) {
      var key = String(r[1] || '').trim();
      if (!key) return;
      tally[key] = (tally[key] || 0) + (Number(r[9]) || 1);
    });
    return json_({ ok: true, tally: tally });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * Every order, newest first, for an app that wants to pull them in rather
 * than ask about one reference at a time.
 *
 * `since` is compared against the logged time, so a caller that remembers the
 * newest stamp it has seen can ask only for what came after it instead of
 * re-reading the whole tab every few minutes.
 */
function orderList_(since, limit) {
  try {
    var sh = orders_();
    var n = sh.getLastRow() - 1;
    if (n < 1) return json_({ ok: true, orders: [] });

    var rows = sh.getRange(2, 1, n, 16).getValues();
    var after = since ? new Date(String(since)).getTime() : 0;
    if (isNaN(after)) after = 0;
    var cap = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    var tz = Session.getScriptTimeZone();

    var out = [];
    for (var i = rows.length - 1; i >= 0 && out.length < cap; i--) {
      var r = rows[i];
      var at = (r[0] instanceof Date) ? r[0] : new Date(r[0]);
      if (!r[1] || isNaN(at.getTime()) || at.getTime() <= after) continue;

      var lines = [];
      try { lines = JSON.parse(r[10] || '[]'); } catch (err) { lines = []; }

      out.push({
        ref: String(r[1]),
        at: at.toISOString(),
        items: String(r[2] || ''),
        status: String(r[3] || 'Requested'),
        note: String(r[4] || ''),
        updated: (r[5] instanceof Date)
          ? Utilities.formatDate(r[5], tz, 'd MMM, HH:mm') : String(r[5] || ''),
        total: Number(r[6]) || 0,
        link: String(r[7] || ''),
        fulfilment: String(r[8] || ''),
        customer: String(r[9] || ''),
        eta: etaText_(r[12]),
        email: String(r[14] || ''),
        shortLink: r[13] ? shortUrl_(String(r[1]), String(r[13])) : '',
        lines: lines
      });
    }
    return json_({ ok: true, orders: out });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * The ETA cell as the text the buyer should read.
 *
 * The column is formatted as plain text, but a tab widened before that, or a
 * value pasted in, can still arrive as a Date. A bare time ("18:00") comes
 * back dated 30 Dec 1899; that one is shown as just the time.
 */
function etaText_(v) {
  if (v instanceof Date) {
    var tz = Session.getScriptTimeZone();
    return v.getFullYear() < 1950
      ? Utilities.formatDate(v, tz, 'HH:mm')
      : Utilities.formatDate(v, tz, 'EEE d MMM, HH:mm');
  }
  return String(v || '').trim();
}

/** The full order link behind lockedinlx.com/o#<ref>-<key>. */
function shortLink_(ref, key) {
  try {
    ref = ref.trim().toUpperCase();
    if (!/^LX-/.test(ref)) ref = 'LX-' + ref;
    var row = findOrderRow_(ref);
    if (!row) return json_({ ok: true, found: false });
    var r = orders_().getRange(row, 1, 1, 16).getValues()[0];
    if (!r[13] || String(r[13]) !== String(key).trim()) return json_({ ok: true, found: false });
    return json_({ ok: true, found: true, link: String(r[7] || '') });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** One order's status, for the buyer's tracking link. */
function orderStatus_(ref) {
  try {
    var row = findOrderRow_(ref);
    // No row: the order was deleted (or is still landing). found:false lets
    // the order page close the link — after a short grace for brand-new ones.
    if (!row) return json_({ ok: true, found: false, status: '', note: '', updated: '' });

    var sh  = orders_();
    var val = sh.getRange(row, 4, 1, 3).getValues()[0];
    var upd = val[2];
    return json_({
      ok: true,
      status: String(val[0] || 'Requested'),
      note: String(val[1] || ''),
      eta: etaText_(sh.getRange(row, 13).getValue()),
      updated: upd instanceof Date
        ? Utilities.formatDate(upd, Session.getScriptTimeZone(), 'd MMM, HH:mm')
        : String(upd || '')
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ------------------------------------------------- roster + totals upkeep */
/**
 * Stamps every roster row as "Playing", "Off the bench" or "Watching", then
 * rewrites the Totals tab. Playing rows fill up to the run's capacity in the
 * order they were added; everyone after that goes on the bench.
 */
function refreshTotals() {
  var rs = roster_();
  var n = rs.getLastRow() - 1;
  var runs = {};

  if (n > 0) {
    var rows = rs.getRange(2, 1, n, 8).getValues();
    var statuses = [];
    var filled = {};

    rows.forEach(function (r) {
      var run  = String(r[0] || '').trim();
      var role = String(r[4] || '').trim().toLowerCase();
      var key  = run + '|' + String(r[1] || '').trim();

      if (!runs[key]) runs[key] = { run: run, when: String(r[1] || ''), playing: 0, bench: 0, watching: 0 };

      if (role === 'watching') {
        runs[key].watching++;
        statuses.push(['Watching']);
      } else {
        var cap = CAPACITY[run] || DEFAULT_CAPACITY;
        filled[key] = (filled[key] || 0) + 1;
        if (filled[key] <= cap) {
          runs[key].playing++;
          statuses.push(['Playing']);
        } else {
          runs[key].bench++;
          statuses.push(['Off the bench']);
        }
      }
    });
    rs.getRange(2, 6, statuses.length, 1).setValues(statuses);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ts = ss.getSheetByName(TOTALS_NAME);
  if (!ts) ts = ss.insertSheet(TOTALS_NAME);
  ts.clear();
  ts.appendRow(['Run', 'When', 'Capacity', 'Playing', 'Off the bench', 'Watching', 'Total people']);
  ts.getRange('A1:G1').setFontWeight('bold');
  ts.setFrozenRows(1);

  Object.keys(runs).forEach(function (k) {
    var r = runs[k];
    ts.appendRow([r.run, r.when, CAPACITY[r.run] || DEFAULT_CAPACITY,
                  r.playing, r.bench, r.watching,
                  r.playing + r.bench + r.watching]);
  });
}

/**
 * Builds the Roster tab from every row already in Signups - use this once,
 * after pasting this script, so past sign-ups appear as names instead of
 * you retyping them. Safe to re-run: it clears the Form rows first and
 * leaves anything you added by hand (Source = Manual) alone.
 */
function backfillRoster() {
  var rs = roster_();

  // Drop existing Form rows, keep manual ones
  var n = rs.getLastRow() - 1;
  if (n > 0) {
    var existing = rs.getRange(2, 1, n, 8).getValues();
    for (var i = existing.length - 1; i >= 0; i--) {
      if (String(existing[i][6]).trim() === 'Form') rs.deleteRow(i + 2);
    }
  }

  var sh = sheet_();
  var width = Math.min(12, sh.getMaxColumns());
  var rows = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues()
    : [];

  rows.forEach(function (r) {
    var run = String(r[2] || ''), when = String(r[3] || '');
    addToRoster_(run, when, r[5], 'Player', 'Playing', 'Form');

    String(r[10] || '').split(',').forEach(function (nm) {
      addToRoster_(run, when, nm, 'Guest', 'Playing', 'Form');
    });
    String(r[11] || '').split(',').forEach(function (nm) {
      addToRoster_(run, when, nm, 'Guest', 'Watching', 'Form');
    });
  });

  refreshTotals();
}

/* ================================================== telling the buyer */
/*
 * Move an order along in column D and this writes the message to send.
 *
 * Why a link and not an email: the order arrived over WhatsApp, so that chat
 * already exists and that is where they will read it. Apps Script cannot send
 * WhatsApp without the paid Business API, but wa.me with no number opens the
 * chat picker with the text already written — the order you just updated is
 * at the top of the list, so it is one tap and send.
 *
 * Nothing here needs the buyer's number, which is the point: it is not asked
 * for, not stored, and not something to look after.
 */

/** What to say at each stage. Pickup and delivery word three of them differently. */
function orderMessage_(ref, status, fulfilment, note, link) {
  var s = String(status || '').toLowerCase().trim();
  var f = String(fulfilment || '');
  /* Three cases, not two. An order placed before the bag asked how they
     wanted it has no method, and guessing "on its way to you" at a customer
     who is planning to collect it at a run is worse than saying less. */
  var how = /^pickup/i.test(f) ? 'pickup' : /^delivery/i.test(f) ? 'delivery' : '';
  // "Pickup — Sat 19 Sep run" -> "Sat 19 Sep run"
  var where = f.replace(/^[^\u2014]*\u2014\s*/, '').trim();

  var body;
  if (s === 'confirmed') {
    body = 'Order ' + ref + ' is confirmed \u2014 everything is in stock.';
  } else if (s === 'ready') {
    body = how === 'pickup'
      ? 'Order ' + ref + ' is packed' + (where ? ' and coming to the ' + where : '') + '.'
      : how === 'delivery'
        ? 'Order ' + ref + ' is on its way to you \u2014 within 12h.'
        : 'Order ' + ref + ' is ready.';
  } else if (s === 'delivered') {
    body = how === 'pickup'
      ? 'Thanks for picking up ' + ref + '! Hope the gear treats you well.'
      : how === 'delivery'
        ? 'Order ' + ref + ' delivered. Enjoy the gear!'
        : 'Order ' + ref + ' is all done. Enjoy the gear!';
  } else if (s === 'cancelled') {
    /* The reason is free text in a spreadsheet cell, so it will not reliably
       end in a full stop — add one rather than running two sentences together. */
    var why = String(note || '').trim().replace(/[.!?]*$/, '');
    body = 'Sorry \u2014 we had to cancel order ' + ref +
           (why ? ': ' + why + '.' : '.') + ' Nothing has been charged.';
  } else {
    // Requested is the state it arrives in; they already have the message
    // they sent us, so there is nothing to tell them yet.
    return '';
  }
  if (note && s !== 'cancelled') body += ' ' + note;
  return 'LOCKED IN LX\n' + body + (link ? '\n\n' + link : '');
}

/** The cell itself: a short label hiding a long prefilled URL. */
function tellFormula_(msg) {
  if (!msg) return '';
  var url = 'https://wa.me/?text=' + encodeURIComponent(msg);
  return '=HYPERLINK("' + url.replace(/"/g, '%22') + '","Tell them \u2192")';
}

/**
 * Simple trigger: fires on every edit in the spreadsheet, so it has to decide
 * fast that an edit is none of its business and get out of the way.
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sh = e.range.getSheet();
    if (sh.getName() !== ORDERS_NAME) return;

    var c0 = e.range.getColumn(), c1 = c0 + e.range.getNumColumns() - 1;
    if (4 < c0 || 4 > c1) return;                 // column D only

    var first = Math.max(2, e.range.getRow());
    var last = e.range.getRow() + e.range.getNumRows() - 1;
    if (last < 2) return;                          // header only

    var stamp = new Date();
    for (var r = first; r <= last; r++) {
      var row = sh.getRange(r, 1, 1, 14).getValues()[0];
      if (!row[1]) continue;                       // no reference, not an order
      sh.getRange(r, 6).setValue(stamp);           // Updated — what the buyer's page shows
      var link = row[13] ? shortUrl_(String(row[1]), String(row[13])) : row[7];
      var msg = orderMessage_(row[1], row[3], row[8], row[4], link);
      var cell = sh.getRange(r, 12);
      if (msg) cell.setFormula(tellFormula_(msg)); else cell.clearContent();
    }
  } catch (err) {
    // A simple trigger cannot report anything useful to anyone, and throwing
    // here would leave the edit looking broken. The status itself is saved
    // either way; only the convenience link is lost.
  }
}

/** Adds a "Locked In" menu so you can refresh without opening the editor. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Locked In')
    .addItem('Refresh roster & totals', 'refreshTotals')
    .addItem('Rebuild roster from Signups', 'backfillRoster')
    .addSeparator()
    .addItem('Turn on order emails', 'turnOnOrderEmails')
    .addItem('Send test emails…', 'sendTestEmails')
    .addToUi();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===== Matrix: sign-up list + locked order list ===========================
   Matrix sends ?key=… with both. Set the same value once under
   Project Settings > Script properties > MATRIX_KEY (Matrix shows it). */
function matrixOk_(p) {
  var want = PropertiesService.getScriptProperties().getProperty('MATRIX_KEY');
  return !!want && String(p.key || '') === want;
}

/** Everyone on the Roster tab for one run, matched on the website's run key. */
function rosterFor_(key) {
  try {
    var sh = roster_();
    var n = sh.getLastRow() - 1;
    if (n < 1) return json_({ ok: true, people: [] });
    var rows = sh.getRange(2, 1, n, 8).getValues();
    var want = String(key).trim().toLowerCase();
    var people = [];
    rows.forEach(function (r) {
      var when = String(r[1] || '').split('\u00B7');
      var k = [r[0], when[0], when.slice(1).join('\u00B7')]
        .map(function (v) { return String(v || '').trim().toLowerCase(); })
        .join('|').replace(/\s+/g, ' ');
      if (k !== want) return;
      var name = String(r[2] || '').trim();
      if (!name) return;
      people.push({ name: name, type: String(r[3] || ''), role: String(r[4] || ''),
                    status: String(r[5] || ''), source: String(r[6] || '') });
    });
    return json_({ ok: true, people: people });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ======================================================= ORDER EMAILS =====
   A buyer who leaves an email at checkout gets one when the order arrives,
   and one each time you move Status on to Confirmed, Ready, Delivered or
   Cancelled. Sent from the Google account that owns this Sheet, with
   replies going to REPLY_TO.

   Turning it on, once: Locked In menu > "Turn on order emails". Google asks
   for permission to send email as you; say yes. Until then nothing is sent
   except the "Order received" email, which goes out from doPost.
   Try it first with Locked In menu > "Send test emails…".

   Column P (Emailed) remembers the last status each buyer was told about,
   so setting the same status twice never sends the same email twice. */

var REPLY_TO   = 'support@lockedinlx.com';
var SITE       = 'https://www.lockedinlx.com';
var EMAIL_LOGO = SITE + '/assets/images/email/locked-in-lx-wordmark.png';
var FONT_HEAD  = SITE + '/assets/fonts/barlow-condensed-900-latin.woff2';

/** "Ready", "out for delivery", "done" … -> the five keys the emails know. */
function statusKey_(raw) {
  var v = String(raw || '').trim().toLowerCase();
  if (/^(requested|request|new|pending|received)$/.test(v)) return 'requested';
  if (/^(confirmed|confirm|accepted|in ?stock)$/.test(v)) return 'confirmed';
  if (/^(ready|packed|prepared|out for delivery|shipped)$/.test(v)) return 'ready';
  if (/^(delivered|done|complete|completed|collected|handed)$/.test(v)) return 'delivered';
  if (/^(cancelled|canceled|cancel|refunded|void)$/.test(v)) return 'cancelled';
  return '';
}

function validEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
}

/** Everything one email needs, read off an Orders row. */
function orderFromRow_(r) {
  var f = String(r[8] || '');
  var lines = [];
  try { lines = JSON.parse(r[10] || '[]'); } catch (err) { lines = []; }
  return {
    ref: String(r[1] || ''),
    status: String(r[3] || 'Requested'),
    note: String(r[4] || '').trim(),
    total: Number(r[6]) || 0,
    link: String(r[13] || '') ? shortUrl_(String(r[1]), String(r[13])) : String(r[7] || ''),
    how: /^pickup/i.test(f) ? 'pickup' : /^delivery/i.test(f) ? 'delivery' : '',
    where: f.replace(/^[^—]*—\s*/, '').trim(),
    customer: String(r[9] || '').trim(),
    lines: lines,
    eta: etaText_(r[12]),
    email: String(r[14] || '').trim()
  };
}

function shortUrl_(ref, key) {
  return SITE + '/o#' + String(ref).replace(/^LX-/i, '') + '-' + key;
}

/** Send the email for `status` on Orders row `row`, if the buyer left an address. */
function emailOrderRow_(row, status) {
  var sh = orders_();
  var r = sh.getRange(row, 1, 1, 16).getValues()[0];
  var o = orderFromRow_(r);
  var key = statusKey_(status || o.status);
  if (!key || !validEmail_(o.email)) return false;
  if (String(r[15] || '').toLowerCase() === key) return false;   // told already
  sendOrderEmail_(o.email, o, key);
  sh.getRange(row, 16).setValue(key);
  return true;
}

function sendOrderEmail_(to, o, key) {
  var mail = orderEmail_(o, key);
  MailApp.sendEmail({
    to: to,
    subject: mail.subject,
    htmlBody: mail.html,
    body: mail.text,
    name: 'Locked In Lx',
    replyTo: REPLY_TO
  });
}

/**
 * Installable trigger (made by "Turn on order emails"). The simple onEdit
 * above cannot send email, so this one does, and only that.
 */
function onOrderEdit(e) {
  try {
    if (!e || !e.range) return;
    var sh = e.range.getSheet();
    if (sh.getName() !== ORDERS_NAME) return;
    var c0 = e.range.getColumn(), c1 = c0 + e.range.getNumColumns() - 1;
    if (4 < c0 || 4 > c1) return;
    var first = Math.max(2, e.range.getRow());
    var last = e.range.getRow() + e.range.getNumRows() - 1;
    for (var row = first; row <= last; row++) {
      var status = sh.getRange(row, 4).getValue();
      // "Requested" was the order-received email, sent when it came in.
      if (statusKey_(status) && statusKey_(status) !== 'requested') emailOrderRow_(row, status);
    }
  } catch (err) {}
}

function turnOnOrderEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onOrderEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onOrderEdit').forSpreadsheet(ss).onEdit().create();
  orders_();   // widens the tab to the Key / Email / Emailed columns
  SpreadsheetApp.getUi().alert('Order emails are on. Buyers who left an email hear from you each time Status changes.');
}

/** Every email, with a made-up order, to one address — to see them before buyers do. */
function sendTestEmails() {
  var ui = SpreadsheetApp.getUi();
  var ans = ui.prompt('Send test emails', 'Send all seven to which address?', ui.ButtonSet.OK_CANCEL);
  if (ans.getSelectedButton() !== ui.Button.OK) return;
  var to = ans.getResponseText().trim() || 'himelsu@icloud.com';
  if (!validEmail_(to)) { ui.alert('That does not look like an email address.'); return; }
  testOrderEmails_().forEach(function (t) { sendOrderEmail_(to, t.o, t.key); });
  ui.alert('Sent 7 test emails to ' + to + '.');
}

function testOrderEmails_() {
  var lines = [
    { name: 'Nba Nike-Pro Combat Compression Tank (Black)', option: 'L', qty: 1, price: 50,
      image: SITE + '/assets/images/products/nike-pro-combat-tank/nike-pro-combat-tank-black.webp' },
    { name: 'Nike NBA Elite Crew Socks White', option: '42 - 46', qty: 2, price: 19,
      image: SITE + '/assets/images/products/nba-elite-crew-socks/nike-elite-socks-white-back.webp' }
  ];
  var base = { ref: 'LX-TEST', note: '', total: 88, link: SITE + '/merch.html', customer: 'Himelsu',
               lines: lines, eta: '' };
  var d = function (x) { var o = JSON.parse(JSON.stringify(base)); for (var k in x) o[k] = x[k]; return o; };
  var del = { how: 'delivery', where: 'Rua da Prata 12, 3ºD, 1100-052' };
  var pick = { how: 'pickup', where: 'Sat 7 Nov run' };
  return [
    { key: 'requested', o: d(del) },
    { key: 'confirmed', o: d(del) },
    { key: 'ready',     o: d(Object.assign({ eta: 'Today 19:00–21:00' }, del)) },
    { key: 'ready',     o: d(pick) },
    { key: 'delivered', o: d(del) },
    { key: 'delivered', o: d(pick) },
    { key: 'cancelled', o: d({ how: 'delivery', where: del.where, note: 'The white socks sold out before we could pack them' }) }
  ];
}

/* ------------------------------------------------------- the email itself
   Tables and inline styles, because that is what every mail app agrees on.
   Dark like the order page. Barlow Condensed where the mail app loads web
   fonts (Apple Mail, iOS), a bold condensed system font where it does not. */
function orderEmail_(o, key) {
  var pickup = o.how === 'pickup';
  var first = (o.customer || '').split(/\s+/)[0];
  var ref = o.ref;
  var copy = {
    requested: { eyebrow: 'Order received', head: ['We got', 'your order'],
      sub: (first ? 'Thanks, ' + first + '! ' : 'Thanks! ') +
           'We’re checking that everything is in stock and will confirm with you on WhatsApp. Nothing is charged until then.' },
    confirmed: { eyebrow: 'Stock confirmed', head: ['Everything', 'is in'],
      sub: 'Good news: all of it is in stock. We’re getting your order ready now.' },
    ready: pickup
      ? { eyebrow: 'Set aside for you', head: ['Packed for', 'the run'],
          sub: 'Your order is packed and coming to the ' + (o.where || 'run') +
               '. Open your order page at the court and we’ll scan the code.' }
      : { eyebrow: 'Out for delivery', head: ['On its', 'way'],
          sub: 'Your order is out for delivery' + (o.eta ? ': expect it ' + o.eta + '.' : ' and should reach you within 12 hours.') },
    delivered: pickup
      ? { eyebrow: 'Collected', head: ['Enjoy', 'the gear'],
          sub: 'Thanks for picking up your order. Not the right fit? You have 30 days to swap or return it: just reply to this email.' }
      : { eyebrow: 'Delivered', head: ['Enjoy', 'the gear'],
          sub: 'Your order has been delivered. Not the right fit? You have 30 days to swap or return it: just reply to this email.' },
    cancelled: { eyebrow: 'Order cancelled', head: ['Order', 'cancelled'],
      sub: 'Sorry, we had to cancel this order' +
           (o.note ? ': ' + o.note.charAt(0).toLowerCase() + o.note.slice(1).replace(/[.!?]*$/, '') + '.' : '.') +
           ' Nothing has been charged.' }
  }[key];

  var steps = pickup
    ? ['Requested', 'Confirmed', 'Set aside', 'Collected']
    : ['Requested', 'Confirmed', 'On its way', 'Delivered'];
  var at = ['requested', 'confirmed', 'ready', 'delivered'].indexOf(key);

  var e = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var money = function (v) { return (Math.round(v * 100) % 100 ? v.toFixed(2) : String(Math.round(v))) + '€'; };
  var GOLD = '#FFD700', INK = '#FFFFFF', INK2 = '#C8C8D0', INK3 = '#A1A1AA', INK4 = '#7A7A84';
  var CARD = '#111114', RAISE = '#18181D', LINE = '#26262D', GREEN = '#3FE07B', RED = '#FF6B6B';
  var HEAD = "'Barlow Condensed','Arial Narrow','Helvetica Neue Condensed Black',Impact,Arial,sans-serif";
  var BODY = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  var bar = key === 'cancelled'
    ? '<tr><td colspan="4" style="padding:0 0 8px"><div style="height:4px;border-radius:4px;background:' + RED + ';opacity:.7"></div></td></tr>' +
      '<tr><td colspan="4" style="font:600 10px/1.4 ' + BODY + ';letter-spacing:.14em;text-transform:uppercase;color:' + RED + '">Cancelled</td></tr>'
    : '<tr>' + steps.map(function (s, i) {
        return '<td width="25%" style="padding:0 ' + (i < 3 ? '6px' : '0') + ' 8px 0"><div style="height:4px;border-radius:4px;background:' +
               (i <= at ? GOLD : LINE) + '"></div></td>';
      }).join('') + '</tr><tr>' + steps.map(function (s, i) {
        return '<td valign="top" style="padding-right:6px;font:600 10px/1.4 ' + BODY + ';letter-spacing:.12em;text-transform:uppercase;color:' +
               (i === at ? GOLD : i < at ? INK2 : INK4) + '">' + e(s) + '</td>';
      }).join('') + '</tr>';

  var items = o.lines.map(function (l) {
    var size = l.option ? String(l.option).split(' · ').map(function (p) {
      return /^(XS|S|M|L|XL|XXL|\d[\d -]*)$/i.test(p.trim()) ? 'Size ' + p.trim() : p.trim();
    }).join(' · ') : '';
    return '<tr>' +
      '<td width="56" valign="middle" style="padding:12px 14px 12px 0;border-bottom:1px solid ' + LINE + '">' +
        (l.image ? '<img src="' + e(l.image) + '" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border-radius:12px;background:#FFFFFF;object-fit:contain">'
                 : '<div style="width:56px;height:56px;border-radius:12px;background:' + RAISE + '"></div>') +
      '</td>' +
      '<td valign="middle" style="padding:12px 0;border-bottom:1px solid ' + LINE + '">' +
        '<div style="font:800 15px/1.2 ' + HEAD + ';letter-spacing:.02em;text-transform:uppercase;color:' + INK + '">' + e(l.name) + '</div>' +
        '<div style="padding-top:5px;font:500 12px/1.4 ' + BODY + ';color:' + INK3 + '">' +
          e(size) + (size ? ' · ' : '') + 'Qty ' + (l.qty || 1) + '</div>' +
      '</td>' +
      '<td valign="middle" align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ' + LINE + ';font:800 17px/1 ' + HEAD + ';color:' + INK + ';white-space:nowrap">' +
        money((Number(l.price) || 0) * (l.qty || 1)) + '</td>' +
    '</tr>';
  }).join('');

  var fulfil = (o.how && key !== 'cancelled')
    ? '<tr><td style="padding:0 0 22px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + RAISE + ';border-radius:14px"><tr><td style="padding:14px 16px">' +
        '<div style="font:600 10px/1.4 ' + BODY + ';letter-spacing:.16em;text-transform:uppercase;color:' + INK4 + '">' + (pickup ? 'Pickup' : 'Delivery') + '</div>' +
        '<div style="padding-top:4px;font:600 15px/1.4 ' + BODY + ';color:' + INK + '">' +
          e(pickup ? (o.where || 'At the run') : (o.eta ? o.eta : 'Free express delivery in Lisbon')) + '</div>' +
        (!pickup && o.where ? '<div style="padding-top:2px;font:400 13px/1.5 ' + BODY + ';color:' + INK3 + '">' + e((o.customer ? o.customer + ', ' : '') + o.where) + '</div>' : '') +
      '</td></tr></table></td></tr>'
    : '';

  var note = (o.note && key !== 'cancelled')
    ? '<tr><td style="padding:0 0 22px;font:400 14px/1.6 ' + BODY + ';color:' + INK2 + '"><span style="color:' + GOLD + '">Note:</span> ' + e(o.note) + '</td></tr>'
    : '';

  var html =
'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">' +
'<style>@font-face{font-family:"Barlow Condensed";font-weight:800 900;src:url(' + FONT_HEAD + ') format("woff2")}' +
'a{color:' + GOLD + '}@media (max-width:480px){.lx-pad{padding:28px 20px!important}.lx-h{font-size:40px!important}}</style></head>' +
'<body style="margin:0;padding:0;background:#000000">' +
'<div style="display:none;max-height:0;overflow:hidden">' + e(copy.eyebrow + ' · ' + ref + ' — ' + copy.sub) + '</div>' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000"><tr><td align="center" style="padding:28px 12px 40px">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">' +

/* logo row */
'<tr><td style="padding:0 6px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td><a href="' + SITE + '" style="text-decoration:none"><img src="' + EMAIL_LOGO + '" width="133" height="16" alt="LOCKED IN LX" style="display:block;border:0;color:#FFFFFF;font:800 16px ' + HEAD + '"></a></td>' +
  '<td align="right" style="font:600 11px/1 ' + BODY + ';letter-spacing:.16em;color:' + INK4 + '">' + e(ref) + '</td>' +
'</tr></table></td></tr>' +

/* card */
'<tr><td class="lx-pad" style="background:' + CARD + ';border-radius:22px;padding:36px 32px">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
  '<tr><td style="padding:0 0 14px;font:600 11px/1 ' + BODY + ';letter-spacing:.22em;text-transform:uppercase;color:' + INK3 + '">' +
    '<span style="color:' + (key === 'cancelled' ? RED : GOLD) + '">●</span>&nbsp; ' + e(copy.eyebrow) + '</td></tr>' +
  '<tr><td class="lx-h" style="padding:0 0 14px;font:900 46px/0.95 ' + HEAD + ';text-transform:uppercase;letter-spacing:.01em;color:' + INK + '">' +
    e(copy.head[0]) + ' <span style="color:' + (key === 'cancelled' ? RED : GOLD) + '">' + e(copy.head[1]) + '</span></td></tr>' +
  '<tr><td style="padding:0 0 26px;font:400 15px/1.65 ' + BODY + ';color:' + INK3 + '">' + e(copy.sub) + '</td></tr>' +
  '<tr><td style="padding:0 0 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + bar + '</table></td></tr>' +
  fulfil + note +
  '<tr><td style="padding:0 0 4px;font:600 11px/1 ' + BODY + ';letter-spacing:.2em;text-transform:uppercase;color:' + INK4 + '">Your order</td></tr>' +
  '<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + items + '</table></td></tr>' +
  '<tr><td style="padding:14px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    '<tr><td style="padding:3px 0;font:400 13px ' + BODY + ';color:' + INK3 + '">Subtotal</td><td align="right" style="font:600 13px ' + BODY + ';color:' + INK2 + '">' + money(o.total) + '</td></tr>' +
    '<tr><td style="padding:3px 0;font:400 13px ' + BODY + ';color:' + INK3 + '">' + (pickup ? 'Pickup at the run' : 'Shipping') + '</td><td align="right" style="font:600 13px ' + BODY + ';color:' + GREEN + '">Free</td></tr>' +
  '</table></td></tr>' +
  '<tr><td style="padding:14px 0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,215,0,0.10);border:1px solid rgba(255,215,0,0.32);border-radius:14px"><tr>' +
    '<td style="padding:12px 16px;font:800 13px/1 ' + BODY + ';letter-spacing:.18em;text-transform:uppercase;color:' + INK2 + '">Total</td>' +
    '<td align="right" style="padding:12px 16px;font:900 24px/1 ' + HEAD + ';color:' + GOLD + '">' + money(o.total) + '</td>' +
  '</tr></table></td></tr>' +
  (o.link && key !== 'cancelled'
    ? '<tr><td align="center"><a href="' + e(o.link) + '" style="display:inline-block;background:' + GOLD + ';color:#0A0A0A;text-decoration:none;font:700 15px/1 ' + BODY + ';padding:16px 34px;border-radius:99px">Track your order →</a></td></tr>'
    : '') +
'</table></td></tr>' +

/* footer */
'<tr><td align="center" style="padding:24px 16px 0;font:400 12.5px/1.7 ' + BODY + ';color:' + INK4 + '">' +
  'Questions? Just reply to this email or <a href="https://wa.me/351911861637?text=' + encodeURIComponent('Hi! About order ' + ref + ' — ') + '" style="color:' + INK2 + '">message us on WhatsApp</a>.<br>' +
  'Locked In Lx · Lisbon · <a href="' + SITE + '" style="color:' + INK3 + '">lockedinlx.com</a><br>' +
  '<span style="color:#55555E">You’re getting this because you left your email with order ' + e(ref) + '.</span>' +
'</td></tr>' +
'</table></td></tr></table></body></html>';

  var text = 'LOCKED IN LX — ' + copy.eyebrow + ' (' + ref + ')\n\n' + copy.sub + '\n\n' +
    o.lines.map(function (l) { return (l.qty || 1) + '× ' + l.name + (l.option ? ' (' + l.option + ')' : '') + ' — ' + money((Number(l.price) || 0) * (l.qty || 1)); }).join('\n') +
    '\nTotal: ' + money(o.total) + (o.link && key !== 'cancelled' ? '\n\nTrack your order: ' + o.link : '') +
    '\n\nQuestions? Reply to this email.';

  var subject = {
    requested: 'We got your order ' + ref,
    confirmed: 'Stock confirmed — order ' + ref,
    ready: pickup ? 'Packed for the run — order ' + ref : 'On its way — order ' + ref,
    delivered: (pickup ? 'Collected' : 'Delivered') + ' — order ' + ref,
    cancelled: 'Order ' + ref + ' was cancelled'
  }[key];

  return { subject: subject, html: html, text: text };
}
