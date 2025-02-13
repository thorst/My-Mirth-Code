/**
    Used to get the channel activity in WAPI, not sure about use casses outside of that

    @param {String} channelId - The id of the channel you want to lookup in the destination map
	
    @return {Object? Or maybe Array?} return the destination config xml?
	
    https://forums.mirthproject.io/forum/mirth-connect/support/14848-channelutil-how-to-get-connectors-list-dynamically

    Example:
    var destinationMap = getDestinationMapById(channel_guid);
*/
function getDestinationMapById(channelId) {
    var result = {}
    var controller = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createChannelController();
    var channel = controller.getChannelById(channelId);
    for (var destination in Iterator(channel.getDestinationConnectors())) {
        result[parseInt(destination.getMetaDataId())] = destination.getName().toString();
    }
    return result;
}
