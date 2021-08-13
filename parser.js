let malformed = false;

let input = "";

let info = {
	"what" : "",
	"when" : "",
	"who" : "",
	"body" : "",
}

let cursor = -1;

/* Utilities */
function $(id) {
    return document.getElementById(id);
}

String.prototype.splice = function(start, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start, this.length);
    }

/* Reviews already parsed content for additional flagged content that should be stripped)
	string - string to be reviewed
	type - key of property in FLAGS object to check against
*/
function checkFlagsAndMaybeStrip(string, type) {
	if (type in FLAGS) {
		for (flag in FLAGS[type]) {
			if (string.indexOf(flag) !== -1) {
				string = string.substr(0, string.indexOf(flag));
			}
		}
	}
	return string;
}

/*
	Copies text in formatted alert window, if present
		e - html element where output text is printed
*/
function copy(e, button) {
	const textToCopy = $(e);

	textToCopy.select();
	textToCopy.setSelectionRange(0, CURSOR_LIMIT);

	document.execCommand("Copy");

	$(button).innerHTML = "Copied!";
	$(button).disabled = true;


}

/*
	Returns all information between the cursor and the next newline character
*/
function copyLineAtCursor() {
	let line = "";

	if (cursor != -1) {
		for (cursor; !limitReached(cursor) && input.charAt(cursor) != '\n'; cursor++) {
			line += input.charAt(cursor);
		}
	}

	return line;
}

/* Checks if the string ends in a phone number (i.e., are the last four characters numbers?).
	str - string to check
*/
function endsInPhoneNumber(str) {
	const lengthToCheck = 4;
	let cursor = str.length - 1;

	for (let i = 0; i < lengthToCheck; i++) {
		if (str.charAt(cursor) >= '0' && str.charAt(cursor) <= '9') {
		} else {
			return false;
		};

		cursor--;
	}

	return true;
}

/* Returns the earliest instance of a marker in the text (when multiple markers are found)
	idxArray - array of indeces to scan; return value will be lowest of these
*/
function findEarliestInstance(idxArray) {
	let earliestIdx = CURSOR_LIMIT;

	for (idx of idxArray) {
		if (idx !== -1 && idx < earliestIdx) {
			earliestIdx = idx;
		}
	}

	return earliestIdx;
}

/* Returns a formatted version of the body with the correct primary/secondary (and sometimes additional) contact organization 
	raw - the unformatted body text
*/
function formatBodyContacts(raw) {
	let formatted = "";

	if (raw.indexOf(PRIMARY_CONTACT) !== -1) {
		formatted = stripLineBreaksAtEnd(formatBodyLineBreaks(raw.substr(0, raw.indexOf(PRIMARY_CONTACT))));
	}

	let formatCursor = raw.indexOf(SECONDARY_CONTACT) + SECONDARY_CONTACT.length;

	if (raw.indexOf(ADDITIONAL_CONTACT) !== -1) {
		formatCursor = raw.indexOf(ADDITIONAL_CONTACT) + ADDITIONAL_CONTACT.length;
	}

	if (formatCursor !== -1) {
		let contact = [];
		
		if (raw.indexOf(PLEASE_NOTIFY) !== -1) {
			while (formatCursor < raw.indexOf(PLEASE_NOTIFY)) {
				let entry = "";
				while (raw.charAt(formatCursor) !== '\n') {
					entry += raw.charAt(formatCursor);
					formatCursor++;
				}

				contact.push(entry);
				formatCursor++;
			}
			
			formatted += 
					"\n\nPrimary Contact:\n" 
					+ contact[0] + "\n";

			if (endsInPhoneNumber(contact[0])) {
					formatted +=
						"\nSecondary Contact:\n"
						+ contact[1] + "\n";
			} else {
					formatted += 
						contact[1] + "\n\n" 
						+ "Secondary Contact:\n";
			}
			
			formatted += contact[2] + "\n";
					
			if (raw.indexOf(ADDITIONAL_CONTACT) !== -1) {
				formatted += "\nAdditional Contact:\n" + contact[3] + "\n\n";
			} else {
				if (contact[3] !== undefined) {
					formatted += contact[3] + "\n";
				}
			}

			formatted += "\n";

			formatted += stripLineBreaksAtEnd(formatBodyLineBreaks(raw.substr(raw.indexOf(PLEASE_NOTIFY),raw.length)));
		}
	}

	return formatted;
}

/*	Creates a double line break for new paragraphs in the body (similar to how the notices are formatted).
		raw - raw text to edit
*/
function formatBodyLineBreaks(raw) {
	let formatted = "";

	for (let formatCursor = 0; formatCursor < raw.length; formatCursor++) {
		if (raw.charAt(formatCursor) === "\n") {
			formatted += "\n\n";
		} else {
			formatted += raw.charAt(formatCursor);
		}
	}

	return formatted;
}

/* Returns a formatted version of the time that conforms to UBIT style standards (a.m. instead of am etc.)
	time - the unformatted time
*/
function formatTime(time) {
	if (time.indexOf("am") !== -1) {
		time = time.replaceAll("am","a.m.");
	}

	if (time.indexOf("pm") !== -1) {
		time = time.replaceAll("pm","p.m.");
	}

	if (time.indexOf("EDT") === -1 && time.indexOf("ET") === -1 && time.indexOf("EST") === -1) {
		time = time + " " + getDST();
	}

	return time;
}

/* Locates and isolates the body of the alert */
function getBody() {
	cursor = positionCursor(BODY);

	let body = "";

	if (cursor != -1) {
		for (cursor; !limitReached(cursor); cursor++) {
			body += input.charAt(cursor);
		}
	}
	
	body = formatBodyContacts(body);

	info.body = body;
	
}

/* Returns either EST or EDT, depending on which is correct for the time of year, to append to the time */
function getDST() {
	let dstString = "";
	let currentDate = new Date();
	let month = currentDate.getMonth();

	if (month < 2 || month > 10) {
		dstString = "EST";
	} else if (month === 2) {
		if (currentDate.getDate() > 14) {
			dstString = "EDT";
		} else {
			let lastSunday = currentDate.getDate() - currentDate.getDay();
			if (lastSunday < 0) {
				dstString = "EST";
			} else if (lastSunday > 6) {
				dstString = "EDT";
			} else {
				dstString = "EST";
			}
		}
	} else if (month == 10) {
		if (currentDate.getDay() > 7) {
			dstString = "EST";
		} else {
			let lastSunday = currentDate.getDate() - currentDate.getDay();
			if (lastSunday < 0) {
				dstString = "EDT";
			} else {
				dstString = "EST";
			}
		}
	} else {
		dstString = "EDT";
	}
	
	return dstString;
}

/* Retrieves the pasted text from the HTML textbox 
	e - ID of the textbox element containing the pasted text 
*/
function getInput(e) {
	input = $(e).value;

	if (input.indexOf(OCCUPANTS_OF) == -1) {
		malformed = true;
	}
}

/* Locates and isolates the 'What' information in the alert */
function getWhat() {
	cursor = positionCursor(WHAT);
	
	let loc = "";
	
	if (cursor != -1) {
		loc = copyLineAtCursor();

		loc = checkFlagsAndMaybeStrip(loc, "location");

		info.what = loc + " " + SERVICE + " " + IMPACT + " " + REASON;
	}

}

/* Locates and isolates the 'When' information in the alert */
function getWhen() {
	cursor = positionCursor(DATE);
	
	let date = time = "";

	if (cursor != -1) {
		date = copyLineAtCursor();

		cursor = positionCursor(TIME);
	
		time = copyLineAtCursor();

		time = formatTime(time);

		info.when = date + ", " + time;
	}
}

/* Locates and isolates the 'Who' information of the alert */
function getWho() {
	cursor = positionCursor(WHO);
	
	let who = "";

	if (cursor != -1) {
		who = copyLineAtCursor();
		
		info.who = who;
	}

}


/* Returns TRUE if the cursor has surpassed the CURSOR_LIMIT value, FALSE otherwise */ 
function limitReached() {
	if (cursor > input.length) {
		return true;
	}

	return false;
}

/* Returns the index of the next line (i.e., after the next newline character) */
function nextLine() {
	for (cursor; !limitReached(cursor) && input.charAt(cursor) != '\n'; cursor++) {
	}

	return ++cursor;
}

/* Puts parsed info into an alert format and prints to screen */
function outputFormattedAlert(e, button) {
	$(e).value = 
		"WHAT: " + info.what + "\n\n" 
		+ "WHEN: " + info.when + "\n\n" 
		+ "WHO: " + info.who + "\n\n" 
		+ info.body;

	$(button).disabled = false;
}

/* "Main" function that receives input, does some checks against it and then retrieves the relevant info. */
function parse(i, o, button) {

	if (CURSOR_LIMIT === null) {
		$(o).innerHTML = "Parser error: constants not available. Is your consts.js file present?";
	} else {

		getInput(i);

		if (!malformed) {
	
			stripHeadersAndFooters();

			getWhat();

			getWhen();

			getWho();

			getBody();

			outputFormattedAlert(o, button);
		} else {
			$(o).innerHTML = "This alert is malformed, and cannot be parsed.";
		}
	}
}

/* Position cursor at beginning of desired content
	use - constant integer inticating which content to locate (could be WHAT, WHEN, DATE, TIME, WHO or BODY)
*/
function positionCursor(use) {
	if (use == WHAT) {
		cursor = input.indexOf(OCCUPANTS_OF);

		if (cursor != -1) {
			cursor += OCCUPANTS_OF.length;
		}

	} else if (use == DATE) {
		
		let dateIdxArray = [];
		let numberMarkersFound = 0;

		for (marker of MARKERS.date) {
			dateIdxArray.push(input.indexOf(marker));
			if (input.indexOf(marker) !== -1) {
				numberMarkersFound++;
			}
		}

		if (numberMarkersFound < 1) {
			cursor = -1;
		} else if (numberMarkersFound > 1) {
			cursor = findEarliestInstance(dateIdxArray);
		} else {
			for (idx of dateIdxArray) {
				if (idx !== -1) {
					cursor = idx;
				}
			}
		}
	
	} else if (use == TIME) {
		
		let timeIdxArray = [];
		let numberMarkersFound = 0;

		for (marker of MARKERS.time) {
			timeIdxArray.push(input.indexOf(marker));
			if (input.indexOf(marker) !== -1) {
				numberMarkersFound++;
			}
		}
		
		if (numberMarkersFound < 1) {
			cursor = -1;
		} else if (numberMarkersFound > 1) {
			cursor = findEarliestInstance(timeIdxArray);
		} else {
			for (idx of timeIdxArray) {
				if (idx !== -1) {
					cursor = idx;
				}
			}
		}

	} else if (use == WHO) {
		cursor = input.indexOf("Occupants of ");
	
	} else if (use == BODY) {
		positionCursor(TIME);
	
		if (cursor != -1) {
			nextLine();
		}
	}

	return cursor;
}

/* Removes extraneous information before and after important details in the input */
function stripHeadersAndFooters() {
	input = input.substr(input.indexOf(OCCUPANTS_OF),input.length);

	if (input.indexOf(UNIVERSITY_FACILITIES) != -1) {
		input = input.substr(0, input.indexOf(UNIVERSITY_FACILITIES));
	}

}

/* Strips any additional line breaks left at the end of a text segment.
	raw - raw text to be edited
*/
function stripLineBreaksAtEnd(raw) {

let formatCursor = raw.length - 1;

	console.log(raw.charAt(formatCursor));
	while (raw.charAt(formatCursor) === "\n") {
		formatCursor--;
	}

	formatCursor++;

	return raw.substr(0,formatCursor);
}
