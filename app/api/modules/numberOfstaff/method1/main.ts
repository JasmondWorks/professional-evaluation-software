// METHOD 1 <PLAIN ESTIMATING>
// ---------------------------
//Basic time

function basic_time(time:number, rate: number) {
   return time * (rate / 100);
}
// Standard time
function std_time(time:number, rate: number, relax_time: number, ctgc_time: number) {
   return basic_time(time, rate) + relax_time + ctgc_time // (5-10%) of relaxation time;
}

function total_man_hours(time:number, rate: number, relax_time: number, ctgc_time: number, num_workers: number, frequency: number){
   return std_time(time, rate, relax_time, ctgc_time) * num_workers * frequency
}

function grand_total_man_hours(time:number[], rate: number[], relax_time: number[], ctgc_time: number[], num_workers: number[], frequency: number[]) {
   let grand_total = 0

   for (let i = 0; i < time.length; i++) {
      grand_total += total_man_hours(time[i], rate[i], relax_time[i], ctgc_time[i], num_workers[i], frequency[i])     
   }

   return grand_total
}



export default grand_total_man_hours