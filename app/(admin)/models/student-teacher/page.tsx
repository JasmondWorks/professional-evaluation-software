// "use client"
// import { useState, useEffect } from 'react';

// const Home = () => {
//   // State for input parameters
//   const [params, setParams] = useState({
//     D: 40, // Total official hours available for lecturers' formal activities per week
//     G: 168, // Total hours available in a week (24*7)
//     Y: 3, // Weekly lecture hours per course
//     alpha: 4, // Number of courses to be lectured per week
//     t1: 0.4, // Proportion for student consultation
//     t2: 0.4, // Proportion for research/community service
//     t3: 0.2, // Proportion for assessment
//     t4: 0.5, // Standard hours to assess a single student's work per week
//     lambda: 5, // Rate at which students consult lecturer per hour
//     mu: 6, // Rate at which lecturer attends to students per hour
//     S0: 0.2, // Probability of doing research outside formal hours
//     studentPopulation: 1000, // Total student population
//     staffMix: { // Academic staff mix
//       lecturers: 0.5,
//       seniorLecturers: 0.3,
//       professors: 0.2
//     }
//   });
  
//   const [mus, setMus] = useState({
//     mu0: 6, //base (Rate at which students consult lecturer per hour)
//     mu1: 15.75, // supervisory
//     mu2: 12.75, // level 1
//     mu3: 3.75, // level 2
//     mu4: 0, // top management
//   })

//   const [lambda, setLambda] = useState({
//     lambda0: 5, //base (Rate at which students consult lecturer per hour)
//     lambda1: 2.25, // supervisory
//     lambda2: 3.0, // level 1
//     lambda3: 2.75, // level 2
//     lambda4: 0.75, // top management
//   })

//   // State for calculated results
//   const [results, setResults] = useState({
//     optimalK: 0,
//     totalStaffNeeded: 0,
//     supervisoryStaff: 0,
//     managementStaffLevel1: 0,
//     managementStaffLevel2: 0,
//     topManagementStaff: 0,
//     staffDistribution: {
//       lecturers: 0,
//       seniorLecturers: 0,
//       professors: 0
//     },
//     efficiencyValue: 0
//   });

//   interface StaffMix {
//     lecturers: number;
//     seniorLecturers: number;
//     professors: number;
//   }

//   interface Params {
//     D: number;
//     G: number;
//     Y: number;
//     alpha: number;
//     t1: number;
//     t2: number;
//     t3: number;
//     t4: number;
//     S0: number;
//     studentPopulation: number;
//     staffMix: StaffMix;
//   }


//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     // Handle nested properties like staffMix
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.') as [keyof Params, keyof StaffMix];
//       setParams({
//         ...params,
//         [parent]: {
//           ...params[parent] as StaffMix,
//           [child]: parseFloat(value)
//         }
//       });
//     } else {
//       setParams({
//         ...params,
//         [name]: parseFloat(value)
//       });
//     }
//   };


//   function factorial(n: number): number {
//     if (n < 0) return NaN;
//     return n <= 1 ? 1 : n * factorial(n - 1);
//   }

//   function combination(n: number, k: number) {
//     if (k < 0 || n < 0 || k > n) return NaN;
//     return factorial(n) / (factorial(k) * factorial(n - k));
//   }

//   const calculateP0 = (k: number, rho: number) => {
//     let sum = 1;
//     for (let n = 2; n <= k; n++) {
//       sum +=  combination(n, k) * factorial(n) * Math.pow(rho, n);
//     }

//     return 1 / sum;
//   };

//   const calculateW = (k: number, rho: number, mu: number, P0: number) => {
//     let sum = 0

//     for (let n = 2; n <= k; n++) {
//       sum +=  (n - 1) * combination(n, k) * factorial(n) * Math.pow(rho, n) * P0;
//     }

//     return (1 / mu) + (sum / (mu * (1 - P0)));
//   };

//   const calculateH = (K: number, mu: number, lambda: number): { H_ordinary: number, H_robust: number } => {
//     const { D, G, Y, alpha, t1, t2, t3, t4, S0 } = params;

//     // Calculate basic parameters
//     const F = D - (Y * alpha); // Non-formal classroom lecture hours
//     const B = t1 * F; // Hours scheduled for student consultation
    
//     const rho = lambda / mu;
    
//     // Check if rho < 1 (system stability condition)
//     if (rho >= 1) return { H_ordinary: 0, H_robust: 0 };
    
//     // Calculate P0
//     const P0 = calculateP0(K, rho);
    
//     // Calculate W
//     const W = calculateW(K, lambda, mu, P0);
    
//     // Calculate numerator components
//     const term1 = K * (B - W);
//     const term2 = (B * (1 - P0));
//     const term3 = t4 * K;
//     const term4 = ((1 - S0) * G) - D;
    
//     // Calculate denominator components
//     const denom1 = (K + 1) * (D - Y * alpha) * t1;
//     const denom2 = (1 - t1 - t2) * (D - Y * alpha);
//     const denom3 = G - D;
    
//     // Calculate H
//     const H_robust = (term1 + term2 + term3 + term4) / (denom1 + denom2 + denom3);
    
//     const H_ordinary = (term1 + term2 + term3) / (denom1 + denom2);
    
//     return { H_ordinary, H_robust };
//   };

//   const findOptimalK_ordinary = (mu: number, lambda: number) => {
//     let maxH = 0;
//     let optimalK = 0;
    
//     // Try different values of K from 1 to 50 (can adjust range as needed)
//     for (let K = 1; K <= 10000; K++) {
//       const { H_ordinary} = calculateH(K, mu, lambda);
      
//       if (H_ordinary > maxH) {
//         maxH = H_ordinary;
//         optimalK = K;
//       }
//     }
    
//     return { optimalK, maxH };
//   };

//   const findOptimalK_robust = (mu: number, lambda: number) => {
//     let maxH = 0;
//     let optimalK = 0;
    
//     // Try different values of K from 1 to 50 (can adjust range as needed)
//     for (let K = 1; K <= 50; K++) {
//       const { H_robust} = calculateH(K, mu, lambda);
      
//       if (H_robust > maxH) {
//         maxH = H_robust;
//         optimalK = K;
//       }
//     }
    
//     return { optimalK, maxH };
//   };

//   const calculateStaffNeeds = (optimalK: number, optimalK1: number, optimalK2: number, optimalK3: number, optimalK4: number) => {
//     const { studentPopulation, staffMix } = params;
    
//     const totalStaffNeeded = Math.ceil(studentPopulation / optimalK);
    
//     // Calculate staff distribution based on mix
//     const staffDistribution = {
//       lecturers: Math.round(totalStaffNeeded * staffMix.lecturers),
//       seniorLecturers: Math.round(totalStaffNeeded * staffMix.seniorLecturers),
//       professors: Math.round(totalStaffNeeded * staffMix.professors)
//     };
//     const supervisoryStaff = Math.ceil(totalStaffNeeded / optimalK1); // Assuming 10% supervisory staff
//     const managementStaffLevel1 = Math.ceil(supervisoryStaff / optimalK2); // Assuming 5% level 1 management staff
//     const managementStaffLevel2 = Math.ceil(managementStaffLevel1 / optimalK3); // Assuming 3% level 2 management staff
//     const topManagementStaff = Math.ceil(managementStaffLevel2 / optimalK4); // Assuming 2% top management staff

//     return { totalStaffNeeded, supervisoryStaff, managementStaffLevel1, managementStaffLevel2, topManagementStaff, staffDistribution };
//   };

//   // Define key types for mus and lambda objects
//   type MuKeys = 'mu0' | 'mu1' | 'mu2' | 'mu3' | 'mu4';
//   type LambdaKeys = 'lambda0' | 'lambda1' | 'lambda2' | 'lambda3' | 'lambda4';
  
//   const handleCalculate = () => {
//     const Ks = []
    
//     for (let i = 0; i < 5; i++) {
//       Ks.push(findOptimalK_robust(
//         mus[`mu${i}` as MuKeys],
//         lambda[`lambda${i}` as LambdaKeys]
//       ));

//       console.log(findOptimalK_robust(
//         mus[`mu${i}` as MuKeys],
//         lambda[`lambda${i}` as LambdaKeys]
//       ));

//     }
//     // You may want to extract the optimalK and maxH from Ks[0] or aggregate as needed
//     const { optimalK, maxH } = Ks[0] || { optimalK: 0, maxH: 0 };
//     const optimalK1 = Ks[1]?.optimalK ?? 0;
//     const optimalK2 = Ks[2]?.optimalK ?? 0;
//     const optimalK3 = Ks[3]?.optimalK ?? 0;
//     const optimalK4 = Ks[4]?.optimalK ?? 0;

//     const { totalStaffNeeded, supervisoryStaff, managementStaffLevel1, managementStaffLevel2, topManagementStaff, staffDistribution } = calculateStaffNeeds(optimalK, optimalK1, optimalK2, optimalK3, optimalK4);

//     setResults({
//       optimalK,
//       totalStaffNeeded,
//       supervisoryStaff,
//       managementStaffLevel1,
//       managementStaffLevel2,
//       topManagementStaff,
//       staffDistribution,
//       efficiencyValue: maxH,
//     });
//   };

//   return (
//     <div className="w-full mx-auto p-8 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-6 text-center">Student-Teacher Ratio Calculator</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-gray-50 p-4 rounded-md">
//           <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
          
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Total work hours (D)</label>
//               <input
//                 type="number"
//                 name="D"
//                 value={params.D}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Total weekly hours (G)</label>
//               <input
//                 type="number"
//                 name="G"
//                 value={params.G}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Lecture hours/course (Y)</label>
//               <input
//                 type="number"
//                 name="Y"
//                 value={params.Y}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Courses per week (α)</label>
//               <input
//                 type="number"
//                 name="alpha"
//                 value={params.alpha}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Consultation ratio (t₁)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="t1"
//                 value={params.t1}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Research ratio (t₂)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="t2"
//                 value={params.t2}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Assessment ratio (t₃)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="t3"
//                 value={params.t3}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Assessment time (t₄)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="t4"
//                 value={params.t4}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Student arrival rate (λ)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="lambda"
//                 value={params.lambda}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Service rate (μ)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="mu"
//                 value={params.mu}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Research probability (S₀)</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="S0"
//                 value={params.S0}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Student population</label>
//               <input
//                 type="number"
//                 name="studentPopulation"
//                 value={params.studentPopulation}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
//           </div>
          
//           <h3 className="font-medium mt-4 mb-2">Academic Staff Mix</h3>
//           <div className="grid grid-cols-3 gap-2">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Lecturers</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="staffMix.lecturers"
//                 value={params.staffMix.lecturers}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Senior Lecturers</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="staffMix.seniorLecturers"
//                 value={params.staffMix.seniorLecturers}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Professors</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="staffMix.professors"
//                 value={params.staffMix.professors}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border rounded-md"
//               />
//             </div>
//           </div>
          
//           <div className="mt-6">
//             <button
//               onClick={handleCalculate}
//               className="w-full bg-pes text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700"
//             >
//               Calculate Optimal Ratio
//             </button>
//           </div>
//         </div>
        
//         <div className="bg-gray-50 p-4 rounded-md">
//           <h2 className="text-xl font-semibold mb-4">Results</h2>
          
//           <div className="space-y-4">
//             <div>
//               <h3 className="font-medium text-gray-700">Optimal Student-Teacher Ratio (K*)</h3>
//               <div className="text-xl font-bold">{results.optimalK}</div>
//               <div className="text-sm text-gray-500">Efficiency value: {results.efficiencyValue.toFixed(4)}</div>
//             </div>
            
//             <div>
//               <h3 className="font-medium text-gray-700">Number of Academic Staff</h3>
//               <div className="text-xl font-bold">{results.totalStaffNeeded}</div>
//               <div className="text-sm text-gray-500">Based on student population of {params.studentPopulation}</div>
//             </div>

//             {/* //NEED TO DO */}
//             <h2 className="text-xl font-semibold mt-8">Required Institutions Staff</h2>
//             <div>
//               <h3 className="font-medium text-gray-700">Number of Supervisory Staff (N1*)</h3>
//               <div className="text-xl font-bold">{results.supervisoryStaff}</div>
//             </div>

//             <div>
//               <h3 className="font-medium text-gray-700">Number of Management Staff level 1(registry)</h3>
//               <div className="text-xl font-bold">{results.managementStaffLevel1}</div>
//             </div>
            
//             <div>
//               <h3 className="font-medium text-gray-700">Number of Management Staff level 2(registry)</h3>
//               <div className="text-xl font-bold">{results.managementStaffLevel2}</div>
//             </div>

//             <div>
//               <h3 className="font-medium text-gray-700">Top Management Staff level (registry)</h3>
//               <div className="text-xl font-bold">{results.topManagementStaff}</div>
//             </div>

//             <div>
//               <h3 className="font-medium text-gray-700">Staff Distribution</h3>
//               <div className="grid grid-cols-3 gap-2 mt-2">
//                 <div className="bg-white p-3 rounded border">
//                   <div className="text-lg font-bold">{results.staffDistribution.lecturers}</div>
//                   <div className="text-sm text-gray-600">Lecturers</div>
//                 </div>
                
//                 <div className="bg-white p-3 rounded border">
//                   <div className="text-lg font-bold">{results.staffDistribution.seniorLecturers}</div>
//                   <div className="text-sm text-gray-600">Senior Lecturers</div>
//                 </div>
                
//                 <div className="bg-white p-3 rounded border">
//                   <div className="text-lg font-bold">{results.staffDistribution.professors}</div>
//                   <div className="text-sm text-gray-600">Professors</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-4 p-4 bg-blue-50 rounded-md border border-pes">
//               <h3 className="font-medium text-pes">Interpretation</h3>
//               <p className="text-sm text-pes mt-1">
//                 For optimal teaching-learning efficiency, each teacher should have approximately {results.optimalK} students. 
//                 With your current student population of {params.studentPopulation}, you need {results.totalStaffNeeded} academic staff 
//                 members distributed as shown above.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import Link from 'next/link';

export default function StudentTeacherIndex() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Student-Teacher ratio</h1>
      {/* link to previous */}
      <Link href="/models">{"<- back"}</Link>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <Link href="/models/student-teacher/robust" className="text-blue-600 hover:underline">
            Go to Robust Optimization
          </Link>
        </li>
        <li>
          <Link href="/models/student-teacher/ordinary" className="text-blue-600 hover:underline">
            Go to Ordinary Optimization
          </Link>
        </li>
      </ul>
    </div>
  );
}