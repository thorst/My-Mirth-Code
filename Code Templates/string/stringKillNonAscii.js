/**
	
    -^ denotes not in the class.  any character not in the class, substititue it with a blank. \x0 -\x7F covers the hex codes for most of the first 127 (non-extended ascii) characters.
     -x20 starts at space.  the values before it could send funky chs. so i kept them in the substitution part.  see http://www.asciitable.com/.
     -tested  and  with ascii 160 which was the original issue for that proc.
     -if more need this we could always send in the 1st and last range instead of hard coding it here.  epiphany is the only one I know who has issues with extended ascii failing msgs.
*/
function stringKillNonAscii(val) {
    //set val [regsub -all {[^\x20-\x7F]} $val ""]
    regEx = new RegExp(/[^\x20-\x7F]/);
    newVal = (val.replace(regEx, ""));
    return newVal;
}