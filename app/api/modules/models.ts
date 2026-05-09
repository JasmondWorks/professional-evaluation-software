const hrs = {
   frontend:[ 20, 300, 100, 10, 500 ],
   backend:[ 530, 10, 500, 5 ],
   design:[ 400, 200, 10],
}

// for calculating standard man hours
//PERESONNEL REDUNDANCY INDEX
function red_index(hours_used: number, hours_given: number) {
   return 1 - util_index( hours_used, hours_given );
}


// ---------------------------------------------------------------------------------

// STANDARD HOURS ARE CALCULATED THE SAME WAY REARDLESS OF APPROACH

// ---------------------------------------------------------------------------------
//Standard man-hours
function std_hrs(hours: number, no_wrks: number) {
   return hours * no_wrks;
}
//Total Standard man-hours
function T_std_hrs(annual_fx:number, hours: number, no_wrks: number) {
   return annual_fx * std_hrs(hours, no_wrks);
}
//Grand Total available man-hours
function T_man_hrs() {
   let total = 0
   return total;
}
