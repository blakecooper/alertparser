const service = "Network and Telephones";
const impact = "Unavailable";
const reason = "During Power Outage";
const OCCUPANTS_OF = "Occupants of";
const SCHEDULED_DATE = "SCHEDULED DATE";

const WHAT = 0;
const WHEN = 1;
const WHO = 2;
const BODY = 3;

const cursorLimit = 10000;

let input = "";

let cursor = -1;

let info = {
	"what" : "",
	"when" : "",
	"who" : "",
	"body" : "",
}

function $(id) {
    return document.getElementById(id);
}

String.prototype.splice = function(start, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start, this.length);
    }

function positionCursor(use) {
	cursor = -1;

	if (use == WHAT) {
		cursor = input.indexOf(OCCUPANTS_OF);

		if (cursor != -1) {
			cursor += OCCUPANTS_OF.length;
		}

	} else if (use == WHEN) {
		cursor = input.indexOf(SCHEDULED_DATE);
	
		if (cursor != -1) {
			for (let i = 0; !limitReached(cursor) && i < 4; i++) {
				cursor = newLine(cursor);
			}	
		}
	} else if (use == WHO) {
		cursor = input.indexOf("Occupants of ");
	} else if (use == BODY) {
		cursor = input.indexOf("CURRENT DATE");
	
		if (cursor != -1) {
			for (let i = 0; i < 10; i++) {
				cursor = newLine();	
			}
		}
	}

	return cursor;
}

function copyLineAtCursor() {
	let line = "";

	if (cursor != -1) {
		for (cursor; !limitReached(cursor) && input.charAt(cursor) != '\n'; cursor++) {
			line += input.charAt(cursor);
		}
	}

	return line;
}

function limitReached() {
	if (cursor > input.length) {
		return true;
	}

	return false;
}

function newLine() {
	for (cursor; !limitReached(cursor) && input.charAt(cursor) != '\n'; cursor++) {
	}

	return ++cursor;
}

function notEndOfLine(text, cursor) {
	if (text.charAt(cursor) == '\n') {
		return false;
	}
	
	return true;
}

function parse(i, o) {
	
	getInput(i);

	getWhat();

	getWhen();

	getWho();

	getBody();

	outputFormattedAlert(o);
}

function getInput(e) {
	input = $(e).value;
}

function getWhat() {
	cursor = positionCursor(WHAT);
	
	let loc = "";
	
	if (cursor != -1) {
		loc = copyLineAtCursor();
	
		info.what = loc + " " + service + " " + impact + " " + reason;
	}

}

function getWhen() {
	cursor = positionCursor(WHEN);
	
	let date = time = "";

	if (cursor != -1) {
		date = copyLineAtCursor();
	
		cursor++;
	
		time = copyLineAtCursor();
	
		info.when = date + " " + time;
	}
}

function getWho() {
	cursor = positionCursor(WHO);
	
	let who = "";

	if (cursor != -1) {
		who = copyLineAtCursor();
		
		info.who = who;
	}

}

function getBody() {
	cursor = positionCursor(BODY);

	let body = "";

	if (cursor != -1) {
		for (cursor; !limitReached(cursor); cursor++) {
			body += input.charAt(cursor);
		}
	}
	
	body = formatBody(body);

	info.body = body;
	
}

function formatBody(raw) {
	let formatCursor = raw.indexOf("PRIMARY CONTACT");
	
	let formatted = "";
	
	if (formatCursor != -1) {
		formatted = raw.substr(0, formatCursor);

		for (let i = 0; i < 4; i++) {
			while (formatCursor < raw.length && raw.charAt(formatCursor) != '\n') {
				formatCursor++;
			}
			
			formatCursor++;
		}

		let contact = ["","","",""];

		for (let i = 0; i < contact.length; i++) {
			for (formatCursor; formatCursor < raw.length && raw.charAt(formatCursor) != '\n'; formatCursor++) {
				contact[i] += raw.charAt(formatCursor);	
			}
		
			formatCursor++;
		}

		formatted += 
				"<p>Primary Contact:<br>" 
				+ contact[0] + "<br>" 
				+ contact[1] + "<p>" 
				+ "Secondary Contact:<br>" 
				+ contact[2] + "<br>" 
				+ contact[3] + "<p>";

		formatted += raw.substr(raw.indexOf(contact[3]) + contact[3].length,raw.length);

		if (formatted.indexOf("University Facilities") != -1) {
			formatted = formatted.substr(0, formatted.indexOf("University Facilities"));
		}
	
	}

	return formatted;
}

function outputFormattedAlert(e) {
	$(e).innerHTML = 
		"WHAT: " + info.what + "<p>" 
		+ "WHEN: " + info.when + "<p>" 
		+ "WHO: " + info.who + "<p>" 
		+ info.body;
}
