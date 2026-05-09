//Personnel utilization index
function util_index(hours_used: number, hours_given: number) {
    return hours_used / hours_given;
 }

module.exports = util_index