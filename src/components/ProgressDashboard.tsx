import React, { useState, useEffect, useRef } from "react";
       import { Chart } from "chart.js/auto";
       import axios from "axios";
       // Assume Clerk for authentication; replace with Learnify's auth system
       import { useUser } from "@clerk/clerk-react";

       // Define TypeScript interface for progress data
       interface ProgressData {
         course_id: number;
         course_name: string;
         completion_percentage: number;
         last_accessed: string;
       }

       const ProgressDashboard: React.FC = () => {
         const [progressData, setProgressData] = useState<ProgressData[]>([]);
         const [loading, setLoading] = useState<boolean>(true);
         const [error, setError] = useState<string | null>(null);
         const chartRef = useRef<HTMLCanvasElement | null>(null);
         const chartInstance = useRef<Chart | null>(null);

         // Replace with actual user ID from Learnify's auth system
         const { user } = useUser(); // Example with Clerk
         const userId: string = user?.id ?? "12345"; // Fallback for testing

         useEffect(() => {
           axios
             .get<ProgressData[]>(`http://localhost:3000/api/user/progress/${userId}`)
             .then((response) => {
               setProgressData(response.data);
               setLoading(false);
             })
             .catch((err: Error) => {
               setError(err.message);
               setLoading(false);
             });
         }, [userId]);

         useEffect(() => {
           if (progressData.length > 0 && chartRef.current) {
             if (chartInstance.current) {
               chartInstance.current.destroy(); // Destroy previous chart instance
             }
             const ctx = chartRef.current.getContext("2d");
             if (ctx) {
               chartInstance.current = new Chart(ctx, {
                 type: "bar",
                 data: {
                   labels: progressData.map((item) => item.course_name),
                   datasets: [
                     {
                       label: "Completion %",
                       data: progressData.map((item) => item.completion_percentage),
                       backgroundColor: [
                         "hsl(var(--chart-1))", // Use Tailwind CSS variable
                         "hsl(var(--chart-2))",
                         "hsl(var(--chart-3))",
                       ],
                       borderColor: [
                         "hsl(var(--chart-1))",
                         "hsl(var(--chart-2))",
                         "hsl(var(--chart-3))",
                       ],
                       borderWidth: 1,
                     },
                   ],
                 },
                 options: {
                   scales: {
                     y: {
                       beginAtZero: true,
                       max: 100,
                       title: {
                         display: true,
                         text: "Completion Percentage",
                         color: "hsl(var(--foreground))",
                       },
                       ticks: {
                         color: "hsl(var(--foreground))",
                       },
                     },
                     x: {
                       ticks: {
                         color: "hsl(var(--foreground))",
                       },
                     },
                   },
                   plugins: {
                     legend: {
                       display: true,
                       position: "top",
                       labels: {
                         color: "hsl(var(--foreground))",
                       },
                     },
                   },
                 },
               });
             }
           }
           return () => {
             if (chartInstance.current) {
               chartInstance.current.destroy();
             }
           };
         }, [progressData]);

         return (
           <div className="container mx-auto p-4 bg-background text-foreground">
             <h1 className="text-3xl font-bold mb-4">Progress Dashboard</h1>
             {loading && <p>Loading...</p>}
             {error && <p className="text-destructive">Error: {error}</p>}
             {!loading && !error && (
               <div>
                 <canvas id="progressChart" ref={chartRef} className="w-full h-64" />
                 <div className="mt-4">
                   <h2 className="text-xl font-semibold">Course Progress</h2>
                   <ul className="list-disc pl-5">
                     {progressData.map((item) => (
                       <li key={item.course_id}>
                         {item.course_name}: {item.completion_percentage}% (Last accessed:{" "}
                         {new Date(item.last_accessed).toLocaleDateString()})
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             )}
           </div>
         );
       };

       export default ProgressDashboard;
