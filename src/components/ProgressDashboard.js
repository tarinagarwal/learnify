import React, { useState, useEffect, useRef } from "react";
       import { Chart } from "chart.js/auto";
       import axios from "axios";
       // Assume Clerk for authentication; replace with Learnify's auth system
       import { useUser } from "@clerk/clerk-react"; // Adjust based on actual auth

       const ProgressDashboard = () => {
         const [progressData, setProgressData] = useState([]);
         const [loading, setLoading] = useState(true);
         const [error, setError] = useState(null);
         const chartRef = useRef(null);
         const chartInstance = useRef(null);

         // Replace with actual user ID from Learnify's auth system
         const { user } = useUser(); // Example with Clerk
         const userId = user?.id || "12345"; // Fallback for testing

         useEffect(() => {
           axios
             .get(`http://localhost:3000/api/user/progress/${userId}`)
             .then((response) => {
               setProgressData(response.data);
               setLoading(false);
             })
             .catch((err) => {
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
             chartInstance.current = new Chart(ctx, {
               type: "bar",
               data: {
                 labels: progressData.map((item) => item.course_name),
                 datasets: [
                   {
                     label: "Completion %",
                     data: progressData.map((item) => item.completion_percentage),
                     backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
                     borderColor: ["#388E3C", "#1976D2", "#F57C00"],
                     borderWidth: 1,
                   },
                 ],
               },
               options: {
                 scales: {
                   y: {
                     beginAtZero: true,
                     max: 100,
                     title: { display: true, text: "Completion Percentage" },
                   },
                 },
                 plugins: {
                   legend: { display: true, position: "top" },
                 },
               },
             });
           }
           return () => {
             if (chartInstance.current) {
               chartInstance.current.destroy();
             }
           };
         }, [progressData]);

         return (
           <div className="container mx-auto p-4">
             <h1 className="text-3xl font-bold mb-4">Progress Dashboard</h1>
             {loading && <p>Loading...</p>}
             {error && <p className="text-red-500">Error: {error}</p>}
             {!loading && !error && (
               <div>
                 <canvas id="progressChart" ref={chartRef} className="w-full h-64"></canvas>
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
