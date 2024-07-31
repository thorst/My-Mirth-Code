var sql = "SELECT COUNT(*) \
FROM fridge_message_history \
WHERE inserted <= NOW() - INTERVAL 7 DAY;";
