// METHOD 3 <WORK SAMPLING APPROACH / WORK CONTENT APPROACH>
// ---------------------------------------------------------
// Preliminary number of observations to determine study params
// Utilization Factor for each position i, (Ui)
// Estimated Annual Man-hours, (EAMi)
// Estimated Basic Man-hours, (EBMi)
// Estimated Standard Man-hours (ESMi)

function P( time_found_busy: number, no_of_observations: number ){
    return time_found_busy / no_of_observations;
}

function util_factor(busy_mode: number[], no_observations: number[]){
    let tempArr = []

    for(let i = 0; i < busy_mode.length; i++) {
        tempArr.push( busy_mode[i] / no_observations[i] )
    }
    return tempArr
}

function estimated_man_hours(busy_mode: number[], no_observations: number[], available_hrs: number) {
    let tempArr = []

    for(let i = 0; i < busy_mode.length; i++) {
        tempArr.push( util_factor(busy_mode, no_observations)[i] * available_hrs )
    }

    return tempArr
}

function basic_man_hours(busy_mode: number[], no_observations: number[], available_hrs: number, rating: number[]) {
    let tempArr = []

    for(let i = 0; i < busy_mode.length; i++) {
        tempArr.push( estimated_man_hours(busy_mode, no_observations, available_hrs)[i] * rating[i] / 100 )
    }

    return tempArr
}

function standard_man_hours(busy_mode: number[], no_observations: number[], available_hrs: number, rating: number[], PA: number[]) {
    let tempArr = []

    for(let i = 0; i < busy_mode.length; i++) {
        tempArr.push( basic_man_hours(busy_mode, no_observations, available_hrs, rating)[i] + (basic_man_hours(busy_mode, no_observations, available_hrs, rating)[i] * PA[i] / 100) )
    } 

    return tempArr
}
function grand_total_ws(busy_mode: number[], no_observations: number[], available_hrs: number, rating: number[], PA: number[]) {
    let tempArr = standard_man_hours(busy_mode, no_observations, available_hrs, rating, PA)
    let grand_total = 0

    for(let i = 0; i < tempArr.length; i++) {
        grand_total += tempArr[i]
    } 
    
    return grand_total
}

module.exports = grand_total_ws