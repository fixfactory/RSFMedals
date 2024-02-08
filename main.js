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

// Chrome does not have a browser object defined
if (typeof browser === "undefined") {
  var browser = chrome;
}

var wrURL = browser.runtime.getURL('images/wr.png');
var wrHTML = "<img src='" + wrURL + "' alt='World record trophy' style='vertical-align:middle;margin:0px 2px'>"

var goldURL = browser.runtime.getURL('images/gold.png');
var goldHTML = "<img src='" + goldURL + "' alt='Gold medal' style='vertical-align:middle;margin:0px 2px'>"
var goldHTMLMouseOver = "<img src=\\'" + goldURL + "\\' alt=\\'Gold medal\\' style=\\'vertical-align:middle;margin:0px 2px\\'>"

var silverURL = browser.runtime.getURL('images/silver.png');
var silverHTML = "<img src='" + silverURL + "' alt='Silver medal' style='vertical-align:middle;margin:0px 2px'>"
var silverHTMLMouseOver = "<img src=\\'" + silverURL + "\\' alt=\\'Silver medal\\' style=\\'vertical-align:middle;margin:0px 2px\\'>"

var bronzeURL = browser.runtime.getURL('images/bronze.png');
var bronzeHTML = "<img src='" + bronzeURL + "' alt='Bronze medal' style='vertical-align:middle;margin:0px 2px'>"
var bronzeHTMLMouseOver = "<img src=\\'" + bronzeURL + "\\' alt=\\'Bronze medal\\' style=\\'vertical-align:middle;margin:0px 2px\\'>"

// Statistics
var totalStageCount = 0
var totalStagesCompleted = 0
var totalBronzeMedals = 0
var totalSilverMedals = 0
var totalGoldMedals = 0
var totalWRs = 0
var totalStageTimeWR = 0
var totalStageTime = 0

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
  return date.getMinutes() * 60.0 * 1000.0 +
    date.getSeconds() * 1000.0 +
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
  let targetMs = recordMs * relative / 100.0
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

  totalStageCount++

  // Personal record cell
  let timeDiv = cells[6].querySelectorAll("div");
  if (timeDiv.length <= 0 || !timeDiv[0].firstChild) {
    return
  }

  totalStagesCompleted++

  // World record cell
  let recordDiv = cells[7].querySelectorAll("div");
  if (recordDiv.length <= 0 || !recordDiv[0].firstChild) {
    return
  }

  let time = parseTime(String(timeDiv[0].firstChild.data))
  let timeMs = totalMs(time)
  let record = parseTime(String(recordDiv[0].firstChild.data))
  let recordMs = totalMs(record)
  let relative = 100.0 * timeMs / recordMs
  totalStageTime += timeMs
  totalStageTimeWR += recordMs

  // Constants used to determine the target times
  const wr = 100.0
  const gold = 105.0
  const silver = 110.0
  const bronze = 120.0

  // Inject the medal HTML
  if (relative <= wr) {
    timeDiv[0].insertAdjacentHTML("afterbegin", wrHTML);
    totalWRs++
    totalGoldMedals++
    totalSilverMedals++
    totalBronzeMedals++
  } else if (relative <= gold) {
    timeDiv[0].insertAdjacentHTML("afterbegin", goldHTML);
    totalGoldMedals++
    totalSilverMedals++
    totalBronzeMedals++
  } else if (relative <= silver) {
    timeDiv[0].insertAdjacentHTML("afterbegin", silverHTML);
    totalSilverMedals++
    totalBronzeMedals++
  } else if (relative <= bronze) {
    timeDiv[0].insertAdjacentHTML("afterbegin", bronzeHTML);
    totalBronzeMedals++    
  } else {
    //timeDiv[0].firstChild.data = "💩 " + timeDiv[0].firstChild.data
  }

  // Inject the target times in the mouse over tooltip
  let targetTimes = "<br><br>" +
    goldHTMLMouseOver + targetTime(gold, record) + " (+" + String(gold - 100) + "%)" +
    "<br>" +
    silverHTMLMouseOver + targetTime(silver, record) + " (+" + String(silver - 100) + "%)" +
    "<br>" +
    bronzeHTMLMouseOver + targetTime(bronze, record) + " (+" + String(bronze - 100) + "%)" +
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

// Parse all the world record rows.
rows = document.getElementsByClassName("lista_kiemelt1")
for (let i = 0; i < rows.length; i++) {
  parseRow(rows[i]);
}

// Add stats to the profile table
if (totalStageCount > 0) {
  var profiles = document.getElementsByClassName("profile")

  for (let i = 0; i < profiles.length; i++) {
    console.log(profiles[i].nodeName) 
    if (profiles[i].nodeName == "TABLE")
    {
      let tbody = profiles[i].firstChild
      let stageCompletion = Number(100.0 * totalStagesCompleted / totalStageCount).toFixed(0)
      let row = "<tr><td><b>Stages completed:</b></td><td>" + totalStagesCompleted + " / " + totalStageCount + " (" + stageCompletion + "%)</td></tr>"
      tbody.insertAdjacentHTML("beforeend", row);
      
      if (totalStagesCompleted > 0) {
        let bronzeRatio = Number(100.0 * totalBronzeMedals / totalStagesCompleted).toFixed(0)
        row = "<tr><td><b>" + bronzeHTML + "Bronze medals:</b></td><td>" + totalBronzeMedals + " / " + totalStagesCompleted + " (" + bronzeRatio + "%)</td></tr>"
        tbody.insertAdjacentHTML("beforeend", row);
        
        let silverRatio = Number(100.0 * totalSilverMedals / totalStagesCompleted).toFixed(0)
        row = "<tr><td><b>" + silverHTML + "Silver medals:</b></td><td>" + totalSilverMedals + " / " + totalStagesCompleted + " (" + silverRatio + "%)</td></tr>"
        tbody.insertAdjacentHTML("beforeend", row);
        
        let goldRatio = Number(100.0 * totalGoldMedals / totalStagesCompleted).toFixed(0)
        row = "<tr><td><b>" + goldHTML + "Gold medals:</b></td><td>" + totalGoldMedals + " / " + totalStagesCompleted + " (" + goldRatio + "%)</td></tr>"
        tbody.insertAdjacentHTML("beforeend", row);
        
        row = "<tr><td><b>" + wrHTML + "World records:</b></td><td>" + totalWRs + " / " + totalStagesCompleted + "</td></tr>"
        tbody.insertAdjacentHTML("beforeend", row);
        
        let avgDiff = Number(100.0 * totalStageTime / totalStageTimeWR - 100).toFixed(0)
        row = "<tr><td><b>Average diff:</b></td><td>+" + avgDiff + "%</td></tr>"
        tbody.insertAdjacentHTML("beforeend", row);
      }
      
      break
    }
  }
}
