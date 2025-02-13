/**
    Method to generate guid.

    @param {Boolean} withoutDash - Defaults: False - Do you want a normal guid with dashes? Pass false or leave as is. If you want dashes removed then pass true.@abstract
	
    @return {String} returns GUID

    See more: https://forums.mirthproject.io/forum/mirth-connect/support/14281-generating-a-32-digit-guid

    Revision History:
    07/18/2023 - TMH
        -Initial Version
*/
function stringGUID(withoutDash) {
    // Default param
    if (typeof withoutDash == "undefined") {
        withoutDash = false;
    }

    // Generate guid
    let guid = UUIDGenerator.getUUID();

    // If without dashes, remove
    if (withoutDash) {
        return guid.replace(/-/g, "");
    }

    // Otherwise return as is
    return guid;
}