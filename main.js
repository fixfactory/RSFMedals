//
// RSF Medals
// A browser extension for the Rally Sim Fans website
// Copyright 2024 Fixfactory
//
// This file is part of RSF Medals.
//
// RSF Medals is free software: you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free
// Software Foundation, either version 3 of the License, or any later version.
//
// RSF Medals is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along
// with RSF Medals. If not, see <http://www.gnu.org/licenses/>.
//

// Takes a time string in the format "6:45.123" and returns a Date object.
function parseTime(timeString) {
  let colon = timeString.indexOf(':')
  let dot = timeString.indexOf('.')
  let minutes = timeString.substring(0, colon)
  let seconds = timeString.substring(colon + 1, dot)
  let milliseconds = timeString.substring(dot + 1, timeString.length)
  return new Date(0, 0, 0, 0, minutes, seconds, milliseconds)
}

// Returns the total number of milliseconds in a Date object.
function totalMs(date) {
  return date.getMinutes() * 60 * 1000 +
    date.getSeconds() * 1000 +
    date.getMilliseconds()
}

// Pads a number with leading zeros.
// Example: pad(3, 2) returns "03"
function pad(num, size) {
  var s = "000" + num;
  return s.substr(s.length - size);
}

// Returns the target time string relative to a record time.
function targetTime(relative, record) {
  let recordMs = totalMs(record)
  let targetMs = recordMs * relative / 100
  let target = new Date(0, 0, 0, 0, 0, 0, targetMs)
  return target.getMinutes() + ":" +
    pad(target.getSeconds(), 2) + "." +
    pad(target.getMilliseconds(), 3)
}

// Parses a row of the record times table and inject HTML.
function parseRow(row) {
  let cells = row.querySelectorAll("td");
  if (cells.length < 8) {
    return
  }

  // Personal record cell
  let timeDiv = cells[6].querySelectorAll("div");
  if (timeDiv.length <= 0 || !timeDiv[0].firstChild) {
    return
  }

  // World record cell
  let recordDiv = cells[7].querySelectorAll("div");
  if (recordDiv.length <= 0 || !recordDiv[0].firstChild) {
    return
  }

  let time = parseTime(String(timeDiv[0].firstChild.data))
  let record = parseTime(String(recordDiv[0].firstChild.data))
  let relative = totalMs(time) / totalMs(record) * 100

  // Constants used to determine the target times
  const wr = 100
  const gold = 105
  const silver = 110
  const bronze = 120

  // Inject the medal emoji
  if (relative <= wr) {
    timeDiv[0].firstChild.data = "🏆 " + timeDiv[0].firstChild.data
  } else if (relative <= gold) {
    timeDiv[0].firstChild.data = "🥇 " + timeDiv[0].firstChild.data
  } else if (relative <= silver) {
    timeDiv[0].firstChild.data = "🥈 " + timeDiv[0].firstChild.data
  } else if (relative <= bronze) {
    timeDiv[0].firstChild.data = "🥉 " + timeDiv[0].firstChild.data
  } else {
    //timeDiv[0].firstChild.data = "💩 " + timeDiv[0].firstChild.data
  }

  // Inject the target times in the mouse over tooltip
  let targetTimes = "<br><br>" +
    "🥇 " + targetTime(gold, record) + " (+" + String(gold - 100) + "%)" +
    "<br>" +
    "🥈 " + targetTime(silver, record) + " (+" + String(silver - 100) + "%)" +
    "<br>" +
    "🥉 " + targetTime(bronze, record) + " (+" + String(bronze - 100) + "%)" +
    "<br>"

  let mouseover = timeDiv[0].getAttribute("onmouseover")
  let endDiv = mouseover.indexOf('</div>')
  mouseover = mouseover.slice(0, endDiv) + targetTimes + mouseover.slice(endDiv)
  timeDiv[0].setAttribute("onmouseover", mouseover)
}

// Parse all the odd rows.
var rows = document.getElementsByClassName("paratlan")
for (let i = 0; i < rows.length; i++) {
  parseRow(rows[i]);
}

// Parse all the even rows.
rows = document.getElementsByClassName("paros")
for (let i = 0; i < rows.length; i++) {
  parseRow(rows[i]);
}
