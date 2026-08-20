/**
 * LOCKED IN LX — signup counter + log
 * Paste this into Extensions ▸ Apps Script on your Google Sheet.
 * Deploy ▸ New deployment ▸ Web app
 *    Execute as     : Me
 *    Who has access : Anyone
 * Copy the /exec URL into javascript/signups-api.js
 */

var SHEET_NAME = 'Signups';

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Timestamp', 'Run Key', 'Run', 'When', 'Where',
                  'Player', 'Age Group', 'Playing Guests', 'Watching Guests', 'Spots']);
  }
  return sh;
}

/** Records one signup. Called by the site when someone sends their registration. */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
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
      Number(d.spots || 1)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Returns { "<run key>": <spots taken>, ... } for the whole sheet. */
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

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
