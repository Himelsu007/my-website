/**
 * LOCKED IN LX — signup counter, roster + totals
 * Paste this into Extensions > Apps Script on your Google Sheet (replace
 * everything that's there), then Deploy > Manage deployments > edit the
 * existing web app > Version: New version > Deploy.
 *    Execute as     : Me
 *    Who has access : Anyone
 *
 * Three tabs, created automatically:
 *   Signups  - one row per form submission. THIS is what the website counts.
 *   Roster   - one row per PERSON (player + each named guest), plus anyone
 *              you add by hand. Beyond capacity they go "Off the bench".
 *   Totals   - per-run headcount. Refresh from the "Locked In" menu.
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

/* ------------------------------------------------- write (from the site) */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
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
function doGet() {
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

/** Adds a "Locked In" menu so you can refresh without opening the editor. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Locked In')
    .addItem('Refresh roster & totals', 'refreshTotals')
    .addItem('Rebuild roster from Signups', 'backfillRoster')
    .addToUi();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
