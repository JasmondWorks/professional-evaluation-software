// Define types for equipment and maintenance tasks
type Equipment = {
    id: string;
    name: string;
    location: string;
    maintenanceScheduleRef: string;
    jobSpecRef: string;
    frequency: string;
    tradesRequired: string[];
    componentsToReplace: string[];
    toolsRequired: string[];
    safetyProcedures: string[];
  };
  
  type MaintenanceTask = {
    equipment: Equipment;
    procedure: string;
    inspections: string[];
    tests: string[];
    allowableLimits: string[];
  };
  
  // Define a type for maintenance aids
  type MaintenanceAid = {
    name: string;
    uses: string[];
  };
  
  // Define a type for PM model variables
  type PMModel = {
    L: number; // PM cycle length
    dCo: number; // Average downtime due to corrective maintenance
    dPM: number; // Average downtime due to preventive maintenance
    H:  (param: number) => number; // Function to calculate expected number of failures
  };
  
  // Example data
  const equipment: Equipment = {
    id: "B-66-41",
    name: "Steam Stop Valve",
    location: "All Steam Lines on Sites",
    maintenanceScheduleRef: "MS-001",
    jobSpecRef: "JS-001",
    frequency: "Annually",
    tradesRequired: ["Mech Fitter"],
    componentsToReplace: ["Valve Lid", "Valve Spindle"],
    toolsRequired: ["Wrench", "Valve Lifter"],
    safetyProcedures: ["Obtain permission-to-work", "Secure valves with locks"],
  };
  
  const maintenanceTask: MaintenanceTask = {
    equipment,
    procedure: "Overhaul of Steam Stop Valve",
    inspections: ["Check valve spindle for wear", "Inspect valve seat face"],
    tests: ["Water test valve chest to twice working pressure"],
    allowableLimits: ["Valve seat dimensions per manufacturer specs"],
  };
  
  const maintenanceAids: MaintenanceAid[] = [
    {
      name: "Temperature Indication Stickers",
      uses: ["Detect temperature anomalies", "Measure temperature gradients"],
    },
    
    {
      name: "Electronic Thermometers",
      uses: [ "Check air conditioning systems", "Measure pipe temperatures" ],
    },
  ];
  
  // PM Model function
  const pmModel: PMModel = {
    L: 1200,
    dCo: 1,
    dPM: 2,
    H: (param) => 0.81,
  };
  
  // Function to perform maintenance
  function performMaintenance(task: MaintenanceTask, model: PMModel): void {
    console.log(`Performing maintenance on: ${task.equipment.name}`);
    console.log(`Location: ${task.equipment.location}`);
    console.log(`Procedure: ${task.procedure}`);
    console.log(`Inspections: ${task.inspections.join(", ")}`);
    console.log(`Tests: ${task.tests.join(", ")}`);
    console.log(`Using tools: ${task.equipment.toolsRequired.join(", ")}`);
    console.log(`Safety procedures: ${task.equipment.safetyProcedures.join(", ")}`);
  
    const availability = calculateAvailability(model.L, model.dPM, model.dCo, model.H);
    console.log(`Calculated availability: ${availability}`);
  }
  
  // Function to calculate availability
  function calculateAvailability(L: number, dPM: number, dCo: number, H: (param: number) => number ): number {
    const numFailures = H(L);
    const totalPMDowntime = numFailures * dPM;
    const totalCoDowntime = numFailures * dCo;
    const totalDowntime = totalPMDowntime + totalCoDowntime;
    return (L - totalDowntime) / L;
  }
  
  // Perform the maintenance task
  performMaintenance(maintenanceTask, pmModel);