/* Standard language in UBIT Alerts */
const SERVICE = "Network and Telephones";
const IMPACT = "Unavailable";
const REASON = "During Power Outage";

/* Content markers used to position the cursor or determine if the alert is malformed (i.e. doesn't contain what we expect it to) */
const OCCUPANTS_OF = "Occupants of";
const UNIVERSITY_FACILITIES = "University Facilities\n";
const PRIMARY_CONTACT = "PRIMARY CONTACT: TITLE:\nPHONE:\n";
const SECONDARY_CONTACT = "SECONDARY CONTACT: TITLE:\nPHONE:\n";
const ADDITIONAL_CONTACT = "ADDITIONAL CONTACT: TITLE:\nPHONE:\n";
const PLEASE_NOTIFY = "Please notify ";
const SCHEDULED_DATE = "SCHEDULED DATE";
const SCHEDULED_TIME = "SCHEDULED TIME";

/* Common information additionally included in fields that we don't need. Used to strip out unwanted info. */
const FLAGS = {
	"location": ["loss","building wide power"]
};

/* Info-specific markers used to find information that appears in non-standard ways */
const MARKERS = {
	"date": [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sun ",
		"Mon ",
		"Tue ",
		"Wed ",
		"Thu ",
		"Fri ",
		"Sat ",
		"Sun. ",
		"Mon. ",
		"Tue. ",
		"Wed. ",
		"Thu. ",
		"Fri. ",
		"Sat. ",
		"1/", 
		"2/",
		"3/",
		"4/",
		"5/",
		"6/",
		"7/",
		"8/",
		"9/",
		"10/",
		"11/",
		"12/",
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
		"Jan ",
		"Feb ",
		"Mar ",
		"Apr ",
		"Jun ",
		"Jul ",
		"Aug ",
		"Sep ",
		"Oct ",
		"Nov ",
		"Dec ",
		"Jan. ",
		"Feb. ",
		"Mar. ",
		"Apr. ",
		"Jun. ",
		"Jul. ",
		"Aug. ",
		"Sep. ",
		"Oct. ",
		"Nov. ",
		"Dec. "
	],
	"time": [ "1:", "2:", "3:", "4:", "5:", "6:", "7:", "8:", "9:", "10:", "11:", "12:"],
	"contact": ["PRIMARY CONTACT: TITLE:\n"]
	};

/* Mapping different cases for calling the positionCursor() method for more readable code */
const WHAT = 0;
const WHEN = 1;
const DATE = 2;
const TIME = 3;
const WHO = 4;
const BODY = 5;

/* For readability purposes, a macro representing the first index position of a string */
const START_OF_STRING = 0;

/* The highest index the cursor can reach (designed to prevent infinite loops) */
const CURSOR_LIMIT = 10000;

/* Adobe Acrobat uses a completely different format for copied text from PDFs. This helps
the script identify whether the notice was opened in Acrobat and does certain tasks
differently, depending. */
const ACROBAT_MARKER = "University Facilities";
