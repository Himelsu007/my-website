/**
 * LOCKED IN LX - signup counter, roster + totals
 * Paste this into Extensions > Apps Script on your Google Sheet (replace
 * everything that's there), then Deploy > Manage deployments > edit the
 * existing web app > Version: New version > Deploy.
 *    Execute as     : Me
 *    Who has access : Anyone
 *
 * Keep this file plain ASCII: write special characters as \u escapes
 * ('\u2019', '\u20ac'). Copied and pasted, anything else can arrive garbled
 * (an ellipsis turned into ",\u00c4\u00b6" in the menu on 2 Nov 2026).
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
 *              opens WhatsApp with the update already written - see onEdit
 *              at the bottom. Type anything into the ETA column ("Sat
 *              18:00-20:00", "Tomorrow morning") and it replaces the
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
    // Column J is JSON for other apps to read. Narrow on purpose - it is not
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
    // place rather than making people start a new tab - existing rows keep
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

    // Store order - logged so you have a row to move along, instead of
    // copying references out of WhatsApp by hand.
    // Matrix changing an order's Status: {kind:'status', ref, status, key}.
    // Locked behind MATRIX_KEY. Sends no email by itself (that's a separate
    // click in Matrix), unless automatic emails are switched on.
    if (d.kind === 'status') {
      if (!matrixOk_(d)) return json_({ ok: false, error: 'locked' });
      var srow = findOrderRow_(d.ref);
      if (!srow) return json_({ ok: false, error: 'no such order' });
      var label = { requested: 'Requested', confirmed: 'Confirmed', ready: 'Ready',
                    delivered: 'Delivered', cancelled: 'Cancelled' }[statusKey_(d.status)];
      if (!label) return json_({ ok: false, error: 'unknown status' });
      var osh = orders_();
      osh.getRange(srow, 4).setValue(label);
      statusChanged_(osh, srow);
      if (autoEmails_() && label !== 'Requested') {
        try { emailOrderRow_(srow, label); } catch (err) {}
      }
      return json_({ ok: true, status: label });
    }

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
      if (autoEmails_()) {
        try { emailOrderRow_(orders_().getLastRow(), 'Requested'); } catch (err) {}
      }
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
  // ?orderEmail=LX-XU4F&status=Confirmed&key=...  -> that email, to preview
  //   &send=1 sends it (Matrix's Customers page); see orderEmailApi_
  if (p.orderEmail) return matrixOk_(p) ? orderEmailApi_(p) : json_({ ok: false, error: 'locked' });
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
        emailed: String(r[15] || ''),
        shortLink: r[13] ? shortUrl_(String(r[1]), String(r[13])) : '',
        lines: lines
      });
    }
    // canUpdate: Matrix may send Status changes back ({kind:'status'} above).
    return json_({ ok: true, canUpdate: true, orders: out });
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
    // the order page close the link - after a short grace for brand-new ones.
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

/* ====================================================== repair tabs =====
   Locked In menu > "Repair Signups & Roster". For when a tab has been turned
   into a Google Sheets Table, or its columns typed, hidden or renamed: a Table
   flags plain names as invalid "people chips" and spot counts as bad
   checkboxes. Copies every row into fresh, plain tabs with the headers this
   script writes, rebuilds the Roster from Signups (people you added by hand
   stay) and refreshes Totals. The old tabs are kept, renamed "(old)", until
   you have looked and deleted them yourself. */
function repairSignupsAndRoster() {
  var ui = SpreadsheetApp.getUi();
  var ok = ui.alert('Repair Signups & Roster',
    'This copies Signups and Roster into fresh, plain tabs and rebuilds the Roster from Signups ' +
    '(people you added by hand are kept). The current tabs are kept, renamed "(old)". Continue?',
    ui.ButtonSet.OK_CANCEL);
  if (ok !== ui.Button.OK) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM HH:mm');

  // ---- Signups: every row, first 12 columns, values only
  var oldS = ss.getSheetByName(SHEET_NAME);
  var signups = [];
  if (oldS && oldS.getLastRow() > 1) {
    oldS.getRange(2, 1, oldS.getLastRow() - 1, 12).getValues().forEach(function (r) {
      if (!String(r[0]).trim() && !String(r[5]).trim()) return;   // empty row
      signups.push([
        r[0] instanceof Date ? r[0] : (r[0] ? new Date(r[0]) : ''),
        String(r[1] || ''), String(r[2] || ''), String(r[3] || ''), String(r[4] || ''),
        String(r[5] || '').trim(), String(r[6] || ''),
        Number(r[7]) || 0, Number(r[8]) || 0, Number(r[9]) || 1,
        String(r[10] || ''), String(r[11] || '')
      ]);
    });
  }

  // ---- Roster: keep the people added by hand (anything not from the form)
  var oldR = ss.getSheetByName(ROSTER_NAME);
  var manual = [];
  if (oldR && oldR.getLastRow() > 1) {
    oldR.getRange(2, 1, oldR.getLastRow() - 1, 8).getValues().forEach(function (r) {
      if (String(r[2] || '').trim() && String(r[6] || '').trim() !== 'Form') {
        manual.push([String(r[0] || ''), String(r[1] || ''), String(r[2]).trim(),
                     String(r[3] || ''), String(r[4] || ''), '', String(r[6] || 'Manual'),
                     r[7] instanceof Date ? r[7] : new Date()]);
      }
    });
  }

  // ---- out with the old (kept, renamed), in with plain tabs in the same place
  var sIndex = oldS ? oldS.getIndex() : ss.getNumSheets() + 1;
  var rIndex = oldR ? oldR.getIndex() : ss.getNumSheets() + 2;
  if (oldS) oldS.setName(SHEET_NAME + ' (old ' + stamp + ')');
  if (oldR) oldR.setName(ROSTER_NAME + ' (old ' + stamp + ')');

  var s = ss.insertSheet(SHEET_NAME, Math.max(0, sIndex - 1));
  var sHead = ['Timestamp', 'Run Key', 'Run', 'When', 'Where',
               'Player', 'Age Group', 'Playing Guests', 'Watching Guests', 'Spots',
               'Playing Guest Names', 'Watching Guest Names'];
  s.getRange(1, 1, 1, 12).setValues([sHead]).setFontWeight('bold');
  if (signups.length) {
    s.getRange(2, 1, signups.length, 12).setValues(signups);
    s.getRange(2, 1, signups.length, 1).setNumberFormat('d mmm yyyy, hh:mm');
  }
  s.setFrozenRows(1);
  s.autoResizeColumns(1, 12);

  var r = ss.insertSheet(ROSTER_NAME, Math.max(0, rIndex - 1));
  r.getRange(1, 1, 1, 8).setValues([['Run', 'When', 'Name', 'Type', 'Role', 'Status', 'Source', 'Added']])
    .setFontWeight('bold');
  r.setFrozenRows(1);

  backfillRoster();          // the form's people, from the fresh Signups
  // Hand-added people after them, as they were: the bench fills in row order.
  if (manual.length) r.getRange(r.getLastRow() + 1, 1, manual.length, 8).setValues(manual);
  refreshTotals();
  r.autoResizeColumns(1, 8);

  ui.alert('Done. ' + signups.length + ' sign-ups copied, ' + manual.length +
    ' hand-added roster rows kept. Check the new tabs, then delete the "(old)" ones.');
}

/* ================================================== telling the buyer */
/*
 * Move an order along in column D and this writes the message to send.
 *
 * Why a link and not an email: the order arrived over WhatsApp, so that chat
 * already exists and that is where they will read it. Apps Script cannot send
 * WhatsApp without the paid Business API, but wa.me with no number opens the
 * chat picker with the text already written - the order you just updated is
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
  // "Pickup - Sat 19 Sep run" -> "Sat 19 Sep run"
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
       end in a full stop \u2014 add one rather than running two sentences together. */
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
    for (var r = first; r <= last; r++) statusChanged_(sh, r, stamp);
  } catch (err) {
    // A simple trigger cannot report anything useful to anyone, and throwing
    // here would leave the edit looking broken. The status itself is saved
    // either way; only the convenience link is lost.
  }
}

/** After a row's Status changes, by hand or from Matrix: stamp Updated
    (what the buyer's page shows) and rewrite the "Tell them" link. */
function statusChanged_(sh, r, stamp) {
  var row = sh.getRange(r, 1, 1, 14).getValues()[0];
  if (!row[1]) return;                             // no reference, not an order
  sh.getRange(r, 6).setValue(stamp || new Date());
  var link = row[13] ? shortUrl_(String(row[1]), String(row[13])) : row[7];
  var msg = orderMessage_(row[1], row[3], row[8], row[4], link);
  var cell = sh.getRange(r, 12);
  if (msg) cell.setFormula(tellFormula_(msg)); else cell.clearContent();
}

/** Adds a "Locked In" menu so you can refresh without opening the editor. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Locked In')
    .addItem('Refresh roster & totals', 'refreshTotals')
    .addItem('Rebuild roster from Signups', 'backfillRoster')
    .addItem('Repair Signups & Roster', 'repairSignupsAndRoster')
    .addSeparator()
    .addItem('Automatic order emails: on', 'turnOnOrderEmails')
    .addItem('Automatic order emails: off', 'turnOffOrderEmails')
    .addItem('Send test emails\u2026', 'sendTestEmails')
    .addToUi();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===== Matrix: sign-up list + locked order list ===========================
   Matrix sends ?key=\u2026 with both. Set the same value once under
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
   Cancelled. Sent from SEND_AS (support@lockedinlx.com) when Gmail has it
   under Settings > Accounts > "Send mail as", which is what lets Apple Mail
   show the Locked In logo; from the Google account that owns this Sheet
   otherwise. Replies go to REPLY_TO either way.

   Sent by hand from Matrix by default: its Customers page previews an
   order's email and sends it through orderEmailApi_ (?orderEmail=...).
   Automatic sending (the "Order received" email from doPost, and one per
   Status change) only happens after Locked In menu > "Automatic order
   emails: on", and stops again with "...: off".
   Try the design with Locked In menu > "Send test emails\u2026".

   Column P (Emailed) remembers the last status each buyer was told about,
   so setting the same status twice never sends the same email twice. */

var REPLY_TO   = 'support@lockedinlx.com';
var SEND_AS    = 'support@lockedinlx.com';
var SITE       = 'https://www.lockedinlx.com';
var EMAIL_LOGO = SITE + '/assets/images/email/locked-in-lx-wordmark.png';
var FONT_HEAD  = SITE + '/assets/fonts/barlow-condensed-900-latin.woff2';

/** "Ready", "out for delivery", "done" ... -> the five keys the emails know. */
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
    where: f.replace(/^[^\u2014]*\u2014\s*/, '').trim(),
    customer: String(r[9] || '').trim(),
    lines: lines,
    eta: etaText_(r[12]),
    email: String(r[14] || '').trim()
  };
}

function shortUrl_(ref, key) {
  return SITE + '/o/#' + String(ref).replace(/^LX-/i, '') + '-' + key;
}

/* A product photo as the email shows it: the 132px JPG on white that
   tools/email-thumbs.sh makes of every product photo, always on the live
   site. The bag stores whatever address the photo had at checkout (WebP,
   and from a local test copy even localhost), which mail apps can't all
   open. */
function emailImage_(url) {
  var m = String(url || '').match(/(?:^|\/)assets\/images\/products\/(.+)\.(webp|png|jpe?g|avif)$/i);
  if (m) return SITE + '/assets/images/email/p/' + m[1] + '.jpg';
  var a = String(url || '').match(/(?:^|\/)(assets\/.+)$/);
  return a ? SITE + '/' + a[1] : String(url || '');
}

/* The order as schema.org data, for mail apps that read it (Apple Mail's
   order card, Gmail). Kept ASCII with \u escapes, because &#...; codes
   are not decoded inside a script. */
function orderLd_(o, key) {
  var pickup = o.how === 'pickup';
  var status = {
    requested: 'OrderProcessing', confirmed: 'OrderProcessing',
    ready: pickup ? 'OrderPickupAvailable' : 'OrderInTransit',
    delivered: 'OrderDelivered', cancelled: 'OrderCancelled'
  }[key];
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'Order',
    merchant: { '@type': 'Organization', name: 'Locked In Lx', url: SITE },
    orderNumber: o.ref,
    orderStatus: 'https://schema.org/' + status,
    priceCurrency: 'EUR',
    price: (Number(o.total) || 0).toFixed(2),
    acceptedOffer: o.lines.map(function (l) {
      return {
        '@type': 'Offer',
        itemOffered: { '@type': 'Product', name: String(l.name || ''), image: l.image ? emailImage_(l.image) : undefined },
        price: (Number(l.price) || 0).toFixed(2),
        priceCurrency: 'EUR',
        eligibleQuantity: { '@type': 'QuantitativeValue', value: Number(l.qty) || 1 }
      };
    })
  };
  if (o.link && key !== 'cancelled') ld.url = o.link;
  return JSON.stringify(ld).replace(/[^\x00-\x7F<>&]/g, function (c) {
    return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
  }).replace(/[<>&]/g, function (c) {
    return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
  });
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
  if (canSendAs_()) {
    GmailApp.sendEmail(to, mail.subject, mail.text, {
      from: SEND_AS,
      htmlBody: mail.html,
      name: 'Locked In Lx',
      replyTo: REPLY_TO
    });
    return;
  }
  MailApp.sendEmail({
    to: to,
    subject: mail.subject,
    htmlBody: mail.html,
    body: mail.text,
    name: 'Locked In Lx',
    replyTo: REPLY_TO
  });
}

/* Whether Gmail lists SEND_AS under "Send mail as". Asked once per run:
   seven test emails should not mean seven lookups. */
var sendAsOk_ = null;
function canSendAs_() {
  if (sendAsOk_ === null) {
    try {
      sendAsOk_ = GmailApp.getAliases().some(function (a) {
        return String(a).toLowerCase() === SEND_AS;
      });
    } catch (err) { sendAsOk_ = false; }
  }
  return sendAsOk_;
}

/**
 * Installable trigger (made by "Turn on order emails"). The simple onEdit
 * above cannot send email, so this one does, and only that.
 */
function onOrderEdit(e) {
  try {
    if (!e || !e.range || !autoEmails_()) return;
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

/** Off unless switched on from the menu: emails go out by hand from Matrix. */
function autoEmails_() {
  return PropertiesService.getScriptProperties().getProperty('AUTO_EMAILS') === 'on';
}

function turnOnOrderEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onOrderEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onOrderEdit').forSpreadsheet(ss).onEdit().create();
  PropertiesService.getScriptProperties().setProperty('AUTO_EMAILS', 'on');
  orders_();   // widens the tab to the Key / Email / Emailed columns
  SpreadsheetApp.getUi().alert('Automatic order emails are on: buyers who left an email hear from you when the order arrives and each time Status changes.');
}

function turnOffOrderEmails() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onOrderEdit') ScriptApp.deleteTrigger(t);
  });
  PropertiesService.getScriptProperties().setProperty('AUTO_EMAILS', 'off');
  orders_();
  SpreadsheetApp.getUi().alert('Automatic order emails are off. Send them from Matrix\u2019s Customers page.');
}

/**
 * Matrix's Customers page: one order's email, to look at or to send.
 *
 *   ?orderEmail=LX-XU4F&key=<MATRIX_KEY>
 *     &status=  requested | confirmed | ready | delivered | cancelled
 *               (blank: the order's Status in the Sheet; Sheet words like
 *               "Out for delivery" work too)
 *     &to=      another address (blank: the Email column)
 *     &note=    replaces the Note column for this email (cancel reason, etc.)
 *     &eta=     replaces the ETA column ("Today 19:00-21:00")
 *     &send=1   send it; without this nothing is sent and the reply has html
 *
 * Reply: { ok, found, ref, status, to, from, subject, emailed, sent, html? }.
 * `emailed` is the last status already sent (column P). Sending by hand
 * always sends, even the same status twice, and updates column P.
 */
function orderEmailApi_(p) {
  try {
    var row = findOrderRow_(String(p.orderEmail));
    if (!row) return json_({ ok: true, found: false });
    var sh = orders_();
    var r = sh.getRange(row, 1, 1, 16).getValues()[0];
    var o = orderFromRow_(r);
    if (p.note != null && String(p.note).trim()) o.note = String(p.note).trim();
    if (p.eta != null && String(p.eta).trim()) o.eta = String(p.eta).trim();
    var key = statusKey_(p.status || o.status);
    if (!key) return json_({ ok: false, error: 'unknown status' });
    var to = String(p.to || o.email || '').trim();
    var mail = orderEmail_(o, key);
    var out = {
      ok: true, found: true, ref: o.ref, status: key,
      to: validEmail_(to) ? to : '',
      from: canSendAs_() ? SEND_AS : Session.getEffectiveUser().getEmail(),
      subject: mail.subject,
      emailed: String(r[15] || ''),
      sent: false
    };
    if (String(p.send) === '1') {
      if (!out.to) { out.ok = false; out.error = 'no email address'; return json_(out); }
      sendOrderEmail_(out.to, o, key);
      sh.getRange(row, 16).setValue(key);
      out.sent = true;
      out.emailed = key;
    } else {
      out.html = mail.html;
    }
    return json_(out);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Every email, with a made-up order, to one address - to see them before buyers do. */
function sendTestEmails() {
  var ui = SpreadsheetApp.getUi();
  var ans = ui.prompt('Send test emails', 'Send all seven to which address?', ui.ButtonSet.OK_CANCEL);
  if (ans.getSelectedButton() !== ui.Button.OK) return;
  var to = ans.getResponseText().trim() || 'himelsu@icloud.com';
  if (!validEmail_(to)) { ui.alert('That does not look like an email address.'); return; }
  testOrderEmails_().forEach(function (t) { sendOrderEmail_(to, t.o, t.key); });
  ui.alert('Sent 7 test emails to ' + to + ', from ' +
    (canSendAs_() ? SEND_AS : Session.getEffectiveUser().getEmail() + ' (' + SEND_AS + ' is not under Gmail\u2019s "Send mail as" yet)') + '.');
}

/* A real order-page link for the made-up test order, so "Track your order"
   in a test email opens what a buyer would see. The page keeps a link with
   no row in this Sheet open for 30 minutes, which is plenty for a test. */
function testOrderLink_(how, where) {
  var code = function (name) {          // lxProductCode in product-catalog.js
    var h = 0x811c9dc5;
    for (var i = 0; i < name.length; i++) {
      h ^= name.charCodeAt(i);
      h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
    }
    return ('000' + (h % 1679616).toString(36)).slice(-4);
  };
  var packed = how === 'pickup' ? 'p|' + where + '|Pavilh\u00e3o Isl\u00e2mico de Lisboa|20:15'
                                : 'd|Himelsu|Rua da Prata 12, 3\u00baD|1100-052';
  var fulfil = Utilities.base64EncodeWebSafe(packed, Utilities.Charset.UTF_8).replace(/=+$/, '');
  return SITE + '/order.html#v1.TEST.' + Date.now().toString(36) + '.' + fulfil +
    '~' + code('Nba Nike-Pro Combat Compression Tank (Black)') + '..sL.1' +
    '~' + code('Nike NBA Elite Crew Socks White') + '..s42_-_46.2';
}

function testOrderEmails_() {
  var lines = [
    { name: 'Nba Nike-Pro Combat Compression Tank (Black)', option: 'L', qty: 1, price: 50,
      image: SITE + '/assets/images/products/nike-pro-combat-tank/nike-pro-combat-tank-black.webp' },
    { name: 'Nike NBA Elite Crew Socks White', option: '42 - 46', qty: 2, price: 19,
      image: SITE + '/assets/images/products/nba-elite-crew-socks/nike-elite-socks-white-back.webp' }
  ];
  var base = { ref: 'LX-TEST', note: '', total: 88, link: '', customer: 'Himelsu',
               lines: lines, eta: '' };
  var d = function (x) {
    var o = JSON.parse(JSON.stringify(base));
    for (var k in x) o[k] = x[k];
    o.link = testOrderLink_(o.how, o.where);
    return o;
  };
  var del = { how: 'delivery', where: 'Rua da Prata 12, 3\u00baD, 1100-052' };
  var pick = { how: 'pickup', where: 'Sat 7 Nov run' };
  return [
    { key: 'requested', o: d(del) },
    { key: 'confirmed', o: d(del) },
    { key: 'ready',     o: d(Object.assign({ eta: 'Today 19:00\u201321:00' }, del)) },
    { key: 'ready',     o: d(pick) },
    { key: 'delivered', o: d(del) },
    { key: 'delivered', o: d(pick) },
    { key: 'cancelled', o: d({ how: 'delivery', where: del.where, note: 'The white socks sold out before we could pack them' }) }
  ];
}

/* ------------------------------------------------------- the email itself
   Tables and inline styles, because that is what every mail app agrees on.
   Dark like the order page, set small: one condensed headline, quiet text,
   gold only where it means something (the status, the total, the button).

   Motion is a bonus for mail apps that play CSS animation (Apple Mail on
   iPhone and Mac): the dot breathes, the current step fills, the sections
   rise in turn and a light crosses the button. Every animated property is
   only ever changed inside @keyframes, so an app that drops them (Gmail,
   Outlook) shows the finished, still email, never a blank one. */
function orderEmail_(o, key) {
  var pickup = o.how === 'pickup';
  var first = (o.customer || '').split(/\s+/)[0];
  var ref = o.ref;
  var copy = {
    requested: { eyebrow: 'Order received', head: ['We got', 'your order'],
      sub: (first ? 'Thanks, ' + first + '. ' : 'Thanks. ') +
           'We\u2019re checking that everything is in stock and will confirm on WhatsApp. Nothing is charged until then.' },
    confirmed: { eyebrow: 'Stock confirmed', head: ['Everything', 'is in'],
      sub: 'All of it is in stock. We\u2019re getting your order ready.' },
    ready: pickup
      ? { eyebrow: 'Set aside for you', head: ['Packed for', 'the run'],
          sub: 'Your order is coming to the ' + (o.where || 'run') +
               '. Open your order page at the court and we\u2019ll scan the code.' }
      : { eyebrow: 'Out for delivery', head: ['On its', 'way'],
          sub: o.eta ? 'Your order is out for delivery. Expect it ' + o.eta + '.'
                     : 'Your order is out for delivery and should reach you within 12 hours.' },
    delivered: { eyebrow: pickup ? 'Collected' : 'Delivered', head: ['Thanks for', 'ordering'],
      sub: (pickup ? 'You picked up your order' : 'Your order has been delivered') +
           (first ? ', ' + first : '') + '. Enjoy the gear, and see you at the next run. ' +
           'Not the right fit? You have 30 days to swap or return it. Just reply to this email.' },
    cancelled: { eyebrow: 'Order cancelled', head: ['Order', 'cancelled'],
      sub: 'Sorry, we had to cancel this order' +
           (o.note ? ': ' + o.note.charAt(0).toLowerCase() + o.note.slice(1).replace(/[.!?]*$/, '') + '.' : '.') +
           ' Nothing has been charged.' }
  }[key];

  var steps = pickup
    ? ['Requested', 'Confirmed', 'Set aside', 'Collected']
    : ['Requested', 'Confirmed', 'On its way', 'Delivered'];
  var at = ['requested', 'confirmed', 'ready', 'delivered'].indexOf(key);
  var void_ = key === 'cancelled';

  var e = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var money = function (v) { return (Math.round(v * 100) % 100 ? v.toFixed(2) : String(Math.round(v))) + '\u20ac'; };

  var GOLD = '#FFD200', INK = '#F4F4F5', INK2 = '#C4C4CC', INK3 = '#9A9AA4', INK4 = '#6E6E78', INK5 = '#4A4A52';
  var CARD = '#0E0E11', RAISE = '#16161A', LINE = '#212127', TRACK = '#26262C', GREEN = '#3FE07B', RED = '#FF6B6B';
  var ACCENT = void_ ? RED : GOLD;
  var HEAD = "'Barlow Condensed','Arial Narrow','Helvetica Neue',Arial,sans-serif";
  var BODY = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  var T = function (size, weight, color, extra) {
    return 'font-family:' + BODY + ';font-size:' + size + 'px;font-weight:' + weight + ';color:' + color + ';' + (extra || '');
  };
  var CAPS = 'text-transform:uppercase;letter-spacing:.18em;';

  var units = o.lines.reduce(function (n, l) { return n + (Number(l.qty) || 1); }, 0);

  /* progress: four thin segments; the current one fills (animated) */
  var bar;
  if (void_) {
    bar = '<tr><td style="padding:0 0 9px"><div style="height:3px;border-radius:3px;background:' + RED + ';opacity:.75"></div></td></tr>' +
          '<tr><td style="' + T(9.5, 600, RED, CAPS) + '">Cancelled</td></tr>';
  } else {
    bar = '<tr>' + steps.map(function (s, i) {
      var fill = i < at ? '<div style="height:3px;border-radius:3px;background:' + GOLD + '"></div>'
               : i === at ? '<div style="height:3px;border-radius:3px;background:' + TRACK + '"><div class="lx-fill" style="height:3px;width:100%;border-radius:3px;background:' + GOLD + '"></div></div>'
               : '<div style="height:3px;border-radius:3px;background:' + TRACK + '"></div>';
      return '<td width="25%" style="padding:0 ' + (i < 3 ? '5px' : '0') + ' 9px 0">' + fill + '</td>';
    }).join('') + '</tr><tr>' + steps.map(function (s, i) {
      return '<td valign="top" style="padding-right:5px;' + T(9.5, 600, i === at ? GOLD : i < at ? INK3 : INK5, CAPS + 'letter-spacing:.14em;') + '">' + e(s) + '</td>';
    }).join('') + '</tr>';
  }

  var items = o.lines.map(function (l, i) {
    var size = l.option ? String(l.option).split(' \u00b7 ').map(function (p) {
      return /^(XS|S|M|L|XL|XXL|\d[\d -]*)$/i.test(p.trim()) ? 'Size ' + p.trim() : p.trim();
    }).join(' \u00b7 ') : '';
    var top = i ? 'border-top:1px solid ' + LINE + ';' : '';
    return '<tr>' +
      '<td width="44" valign="middle" style="padding:12px 14px 12px 0;' + top + '">' +
        (l.image ? '<img src="' + e(emailImage_(l.image)) + '" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border-radius:10px;background:#FFFFFF;object-fit:contain">'
                 : '<div style="width:44px;height:44px;border-radius:10px;background:' + RAISE + '"></div>') +
      '</td>' +
      '<td valign="middle" style="padding:12px 0;' + top + '">' +
        '<div style="' + T(13, 600, INK, 'line-height:1.35;') + '">' + e(l.name) + '</div>' +
        '<div style="padding-top:3px;' + T(11.5, 400, INK4, 'line-height:1.4;') + '">' +
          e(size) + (size ? ' \u00b7 ' : '') + 'Qty ' + (l.qty || 1) + '</div>' +
      '</td>' +
      '<td valign="middle" align="right" style="padding:12px 0 12px 12px;' + top + T(13, 600, INK2, 'white-space:nowrap;font-variant-numeric:tabular-nums;') + '">' +
        money((Number(l.price) || 0) * (l.qty || 1)) + '</td>' +
    '</tr>';
  }).join('');

  var fulfil = (o.how && !void_)
    ? '<tr><td class="lx-in lx-d3" style="padding:0 0 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + RAISE + ';border-radius:12px"><tr><td style="padding:13px 15px">' +
        '<div style="' + T(9.5, 600, INK4, CAPS) + '">' + (pickup ? 'Pickup' : 'Delivery') + '</div>' +
        '<div style="padding-top:5px;' + T(13.5, 600, INK, 'line-height:1.4;') + '">' +
          e(pickup ? (o.where || 'At the run') : (o.eta ? o.eta : 'Free express delivery in Lisbon')) + '</div>' +
        (!pickup && o.where ? '<div style="padding-top:2px;' + T(12, 400, INK3, 'line-height:1.5;') + '">' + e((o.customer ? o.customer + ', ' : '') + o.where) + '</div>' : '') +
      '</td></tr></table></td></tr>'
    : '';

  var note = (o.note && !void_)
    ? '<tr><td class="lx-in lx-d3" style="padding:0 0 22px;' + T(13, 400, INK2, 'line-height:1.6;') + '"><span style="color:' + GOLD + '">Note</span>&nbsp; ' + e(o.note) + '</td></tr>'
    : '';

  /* A delivered order's page closes (see order.html), so the thank-you
     points back to the store instead of at an expired link. */
  var done = key === 'delivered';
  var btnHref = done ? SITE + '/merch.html' : o.link;
  var button = (btnHref && !void_)
    ? '<tr><td class="lx-in lx-d5" style="padding:26px 0 0"><a class="lx-btn" href="' + e(btnHref) + '" style="display:inline-block;background-color:' + GOLD + ';' +
        T(13, 600, '#0A0A0A', 'text-decoration:none;letter-spacing:.01em;padding:13px 24px;border-radius:99px;') + '">' +
        (done ? 'Shop the store' : 'Track your order') + '&nbsp;&nbsp;\u2192</a></td></tr>'
    : '';

  var css =
    '@font-face{font-family:"Barlow Condensed";font-weight:800 900;src:url(' + FONT_HEAD + ') format("woff2")}' +
    'a{color:' + INK2 + '}' +
    '@media (max-width:480px){.lx-pad{padding:26px 20px!important}.lx-h{font-size:27px!important}}' +
    '@media (prefers-reduced-motion:no-preference){' +
      '@keyframes lx-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
      '@keyframes lx-breathe{0%,100%{opacity:1;box-shadow:0 0 0 0 ' + (void_ ? 'rgba(255,107,107,.45)' : 'rgba(255,210,0,.45)') + '}50%{opacity:.55;box-shadow:0 0 0 5px rgba(0,0,0,0)}}' +
      '@keyframes lx-fill{from{width:0}to{width:100%}}' +
      '@keyframes lx-shine{0%,55%{background-position:160% 0}100%{background-position:-60% 0}}' +
      '.lx-in{animation:lx-rise .7s cubic-bezier(.2,.7,.2,1) both}' +
      '.lx-d1{animation-delay:.05s}.lx-d2{animation-delay:.15s}.lx-d3{animation-delay:.25s}.lx-d4{animation-delay:.35s}.lx-d5{animation-delay:.45s}' +
      '.lx-dot{animation:lx-breathe 2.4s ease-in-out infinite}' +
      '.lx-fill{animation:lx-fill 1.4s cubic-bezier(.3,.7,.2,1) .5s both}' +
      '.lx-btn{background-image:linear-gradient(110deg,rgba(255,255,255,0) 35%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 65%);background-size:250% 100%;background-repeat:no-repeat;animation:lx-shine 4.5s ease-in-out 1.2s infinite}' +
    '}';

  var html =
'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">' +
'<style>' + css + '</style>' +
'<script type="application/ld+json">' + orderLd_(o, key) + '</script></head>' +
'<body style="margin:0;padding:0;background:#000000">' +
'<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + e(copy.eyebrow + ' \u00b7 ' + ref + ' \u2014 ' + copy.sub) + '</div>' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000"><tr><td align="center" style="padding:32px 12px 40px">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px">' +

'<tr><td style="padding:0 4px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td><a href="' + SITE + '" style="text-decoration:none"><img src="' + EMAIL_LOGO + '" width="104" height="13" alt="LOCKED IN LX" style="display:block;border:0;' + T(12, 800, '#FFFFFF') + '"></a></td>' +
  '<td align="right" style="' + T(10, 600, INK4, 'letter-spacing:.18em;') + '">' + e(ref) + '</td>' +
'</tr></table></td></tr>' +

'<tr><td class="lx-pad" style="background:' + CARD + ';border-radius:18px;padding:32px 28px 30px">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
  '<tr><td class="lx-in lx-d1" style="padding:0 0 12px;' + T(10, 600, INK3, CAPS + 'letter-spacing:.22em;') + '">' +
    '<span class="lx-dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + ACCENT + ';vertical-align:2px"></span>&nbsp;&nbsp;' + e(copy.eyebrow) + '</td></tr>' +
  '<tr><td class="lx-in lx-d1 lx-h" style="padding:0 0 10px;font-family:' + HEAD + ';font-size:30px;font-weight:900;line-height:1;text-transform:uppercase;letter-spacing:.01em;color:' + INK + '">' +
    e(copy.head[0]) + ' <span style="color:' + ACCENT + '">' + e(copy.head[1]) + '</span></td></tr>' +
  '<tr><td class="lx-in lx-d2" style="padding:0 0 24px;' + T(13.5, 400, INK3, 'line-height:1.65;') + '">' + e(copy.sub) + '</td></tr>' +
  '<tr><td class="lx-in lx-d2" style="padding:0 0 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + bar + '</table></td></tr>' +
  fulfil + note +
  '<tr><td class="lx-in lx-d4" style="padding:0 0 2px;' + T(9.5, 600, INK4, CAPS) + '">Your order \u00b7 ' + units + (units === 1 ? ' item' : ' items') + '</td></tr>' +
  '<tr><td class="lx-in lx-d4"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + items + '</table></td></tr>' +
  '<tr><td class="lx-in lx-d4" style="padding:8px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ' + LINE + '">' +
    '<tr><td style="padding:12px 0 3px;' + T(12.5, 400, INK4) + '">Subtotal</td><td align="right" style="padding:12px 0 3px;' + T(12.5, 500, INK3) + '">' + money(o.total) + '</td></tr>' +
    '<tr><td style="padding:3px 0 12px;' + T(12.5, 400, INK4) + '">' + (pickup ? 'Pickup at the run' : 'Shipping') + '</td><td align="right" style="padding:3px 0 12px;' + T(12.5, 500, GREEN) + '">Free</td></tr>' +
    '<tr><td style="padding:12px 0 0;border-top:1px solid ' + LINE + ';' + T(10, 600, INK2, CAPS) + '">Total</td>' +
        '<td align="right" style="padding:10px 0 0;border-top:1px solid ' + LINE + ';font-family:' + HEAD + ';font-size:22px;font-weight:900;line-height:1;color:' + (void_ ? INK3 : GOLD) + '">' + money(o.total) + '</td></tr>' +
  '</table></td></tr>' +
  button +
'</table></td></tr>' +

'<tr><td align="center" style="padding:22px 16px 0;' + T(11.5, 400, INK4, 'line-height:1.75;') + '">' +
  'Questions? Reply to this email or <a href="https://wa.me/351911861637?text=' + encodeURIComponent('Hi! About order ' + ref + ' \u2014 ') + '" style="color:' + INK2 + '">message us on WhatsApp</a>.<br>' +
  '<span style="color:' + INK5 + '">Locked In Lx \u00b7 Lisbon \u00b7 <a href="' + SITE + '" style="color:' + INK5 + '">lockedinlx.com</a></span>' +
'</td></tr>' +
'</table></td></tr></table></body></html>';

  var text = 'LOCKED IN LX \u2014 ' + copy.eyebrow + ' (' + ref + ')\n\n' + copy.sub + '\n\n' +
    o.lines.map(function (l) { return (l.qty || 1) + '\u00d7 ' + l.name + (l.option ? ' (' + l.option + ')' : '') + ' \u2014 ' + money((Number(l.price) || 0) * (l.qty || 1)); }).join('\n') +
    '\nTotal: ' + money(o.total) + (key === 'delivered' ? '\n\nShop the store: ' + SITE + '/merch.html' : o.link && !void_ ? '\n\nTrack your order: ' + o.link : '') +
    '\n\nQuestions? Reply to this email.';

  var subject = {
    requested: 'We got your order ' + ref,
    confirmed: 'Stock confirmed \u00b7 ' + ref,
    ready: (pickup ? 'Packed for the run \u00b7 ' : 'On its way \u00b7 ') + ref,
    delivered: 'Thanks for ordering \u00b7 ' + ref,
    cancelled: 'Order ' + ref + ' was cancelled'
  }[key];

  return { subject: subject, html: asciiHtml_(html), text: plainText_(text) };
}

/* Mail apps that can't tell how an email is encoded guess, and Apple Mail
   guessed wrong: "\u2019" came out as ",\u00c4\u00f4" and "\u20ac" as ",\u00c7\u00a8". Written as
   &#8217; and &#8364; the HTML is plain ASCII, which reads the same in every
   encoding, customer names and addresses with accents included. */
function asciiHtml_(html) {
  return html.replace(/[^\x00-\x7F]/gu, function (c) { return '&#' + c.codePointAt(0) + ';'; });
}

/* The plain-text copy can't use &#...; codes, so its punctuation goes ASCII. */
function plainText_(text) {
  return text
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-').replace(/\u00b7/g, '-')
    .replace(/\u2192/g, '->').replace(/\u00d7/g, 'x').replace(/\u2026/g, '...')
    .replace(/\u20ac/g, ' EUR');
}
