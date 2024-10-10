// Function to update current date and time
         function updateDateTime() {
             const now = new Date();
             document.getElementById('currentDate').innerText = now.toLocaleDateString();
             document.getElementById('currentTime').innerText = now.toLocaleTimeString();
         }
         
         // Call the function immediately to set the initial time
         updateDateTime();
         
         // Update the date and time every second
         setInterval(updateDateTime, 1000);
         
         
         // Function to load report data
         function loadReport() {
             fetch('/get-report')
             .then(response => response.json())
             .then(data => {
                 const reportDiv = document.getElementById('report');
                 reportDiv.innerHTML = ''; // Clear previous report data
         
                 // Create a table for the report
                 const table = document.createElement('table');
                 const thead = document.createElement('thead');
                 const tbody = document.createElement('tbody');
         
                 // Create header row
                 const headerRow = document.createElement('tr');
                 headerRow.innerHTML = `
                     <th>Date</th>
                     <th>Task Number</th>
                     <th>Task Amount ($)</th>
                     <th>Action</th>
                 `;
                 thead.appendChild(headerRow);
         
                 // Populate table with report data
                 for (const [date, tasks] of Object.entries(data)) {
                     tasks.forEach(task => {
                         const row = document.createElement('tr');
                         row.innerHTML = `
                             <td>${date}</td>
                             <td>${task.task_number}</td>
                             <td>${task.task_amount}</td>
                             <td><button class="deleteTaskButton" data-date="${date}" data-task-number="${task.task_number}">Delete</button></td>
                         `;
                         tbody.insertBefore(row, tbody.firstChild); // Add new rows at the top
                     });
                 }
         
                 table.appendChild(thead);
                 table.appendChild(tbody);
                 reportDiv.appendChild(table);
         
                 // Add event listeners for delete buttons
                 document.querySelectorAll('.deleteTaskButton').forEach(button => {
                     button.addEventListener('click', function() {
                         const date = this.getAttribute('data-date');
                         const taskNumber = this.getAttribute('data-task-number');
                         deleteTask(date, taskNumber);
                     });
                 });
             })
             .catch(error => {
                 console.error('Error loading report:', error);
             });
         }
         
         function deleteTask(date, taskNumber) {
             fetch('/delete-task', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({ date: date, task_number: taskNumber })
             })
             .then(response => {
                 if (!response.ok) {
                     throw new Error('Failed to delete task');
                 }
                 return response.json();
             })
             .then(data => {
                 loadReport(); // Reload the report after deletion
             })
             .catch(error => {
                 console.error('Error deleting task:', error);
             });
         }
         
         // Add Task Button event
         document.getElementById('addTaskButton').addEventListener('click', function() {
             const taskNumber = document.getElementById('taskNumber').value;
             const taskAmount = document.getElementById('taskAmount').value;
         
             if (taskNumber && taskAmount) {
                 fetch('/add-task', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify({ task_number: taskNumber, task_amount: taskAmount })
                 })
                 .then(response => {
                     if (response.ok) {
                         loadReport(); // Reload the report after adding
                         document.getElementById('taskNumber').value = ''; // Reset task number field
                         document.getElementById('taskAmount').value = ''; // Reset task amount field
                     } else {
                         alert('Failed to add task.');
                     }
                 });
             } else {
                 alert('Please fill in both fields.');
             }
         });
         
         // Reset Button event
         document.getElementById('resetButton').addEventListener('click', function() {
             document.getElementById('taskNumber').value = ''; // Clear task number field
             document.getElementById('taskAmount').value = ''; // Clear task amount field
         });
         
         
         function convertToSAR(amount) {
         const conversionRate = 3.75; // Example conversion rate (1 USD = 3.75 SAR)
         return (amount * conversionRate).toFixed(2); // Convert and round to 2 decimal places
         }
         
         
         function getRevenue() {
         const filterValue = document.getElementById('filter').value;
         
         fetch(`/get-revenue?filter=${filterValue}`)
          .then(response => response.json())
          .then(data => {
              const reportDiv = document.getElementById('report');
              reportDiv.innerHTML = `
                  <h3>Revenue Report</h3>
                  <table>
                      <thead>
                          <tr>
                              <th>Period</th>
                              <th>Total Revenue (USD)</th>
                              <th>Total Revenue (SAR)</th> <!-- New column for SAR -->
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td>${data.period}</td>
                              <td>${data.total_revenue}</td>
                              <td>${convertToSAR(data.total_revenue)}</td> <!-- Display converted value -->
                          </tr>
                      </tbody>
                  </table>
              `;
          });
         }
         
         // Function to update the earning scale based on the daily revenue
         function updateEarningScale() {
            fetch('/get-daily-revenue')
                .then(response => response.json())
                .then(data => {
                    const dailyRevenue = data.daily_revenue;
                    const scaleMax = 3; // Maximum scale value is $3
                    const scaleFillPercent = (dailyRevenue / scaleMax) * 100;
                    const scaleFill = document.getElementById('scaleFill');
                    const dailyRevenueDisplay = document.getElementById('dailyRevenue');
                    const amountLeftDisplay = document.getElementById('amountLeft');
         
                    // Update the scale fill width based on daily revenue
                    scaleFill.style.width = `${Math.min(scaleFillPercent, 100)}%`;
                    dailyRevenueDisplay.textContent = dailyRevenue.toFixed(2);
                    amountLeftDisplay.textContent = (scaleMax - dailyRevenue).toFixed(2);
                })
                .catch(error => {
                    console.error('Error fetching daily revenue:', error);
                });
         }
         
         // Add event listener to Load Report button
         document.getElementById('loadReportButton').addEventListener('click', loadReport);
         
         // Load report when the page loads
         window.onload = function() {
             updateDateTime();
             loadReport();
             // Call updateEarningScale initially and then every 5 minutes
         updateEarningScale();
         setInterval(updateEarningScale, 2000);
         };
         
         
         document.addEventListener("DOMContentLoaded", function () {
         const elapsedTimeDisplay = document.getElementById("elapsedTime");
         const reminderSound = document.getElementById("reminderSound");
         
         // Check if there's a saved start time in localStorage
         let savedStartTime = localStorage.getItem("startTime");
         let startTime = savedStartTime ? parseInt(savedStartTime, 10) : Date.now();
         
         // Save the initial start time if not already saved
         if (!savedStartTime) {
         localStorage.setItem("startTime", startTime);
         }
         
         let reminderInterval = 15 * 60 * 1000; // 15 minutes in milliseconds
         
         function formatTime(milliseconds) {
         let totalSeconds = Math.floor(milliseconds / 1000);
         let hours = Math.floor(totalSeconds / 3600);
         let minutes = Math.floor((totalSeconds % 3600) / 60);
         let seconds = totalSeconds % 60;
         
         // Format time with leading zeros
         hours = String(hours).padStart(2, '0');
         minutes = String(minutes).padStart(2, '0');
         seconds = String(seconds).padStart(2, '0');
         
         return `${hours}:${minutes}:${seconds}`;
         }
         
         function updateElapsedTime() {
         let currentTime = Date.now();
         let elapsedTime = currentTime - startTime;
         elapsedTimeDisplay.textContent = formatTime(elapsedTime);
         
         // Calculate how many 15-minute intervals have passed
         let intervalsPassed = Math.floor(elapsedTime / reminderInterval);
         
         // Play the reminder sound for each interval passed
         if (intervalsPassed > 0 && (elapsedTime % reminderInterval) < 1000) {
            reminderSound.play();
         }
         }
         
         // Update elapsed time every second
         setInterval(updateElapsedTime, 1000);
         
         // Reset the timer if the page is closed for over 15 minutes
         window.addEventListener("beforeunload", function () {
         localStorage.setItem("lastVisit", Date.now());
         });
         
         const lastVisit = localStorage.getItem("lastVisit");
         if (lastVisit && (Date.now() - parseInt(lastVisit, 10)) > reminderInterval) {
         localStorage.removeItem("startTime");
         }
         });