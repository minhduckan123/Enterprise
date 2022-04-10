    
    drawChart();
    drawChart2();
    drawPieChart()
    
    async function drawChart(){
        const datapoints = await getBarChartData('../csv/dashboardData.csv');
        const ctx = document.getElementById("chart1").getContext("2d");
        const data = {
            labels: datapoints.xAxes,
            datasets: [
                {
                    label: "IT",
                    backgroundColor: "blue",
                    data: datapoints.yAxesIT
                },
                {
                    label: "Business",
                    backgroundColor: "red",
                    data: datapoints.yAxesBu
                },
                {
                    label: "Design",
                    backgroundColor: "green",
                    data: datapoints.yAxesDes
                }
            ]
        };
        const myBarChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMax: 10,
                            min: 0,
                            stepSize: 1.0
                        }
                    }]
                },
                title: {
                    display: true,
                    text: 'Number of ideas per department/per year',
                    fontSize:20
                }
            }
        });
    }

    async function drawChart2(){
        const datapoints = await getBarChartData('../csv/dashboardData2.csv');
        const ctx = document.getElementById("chart2").getContext("2d");
        const data = {
            labels: datapoints.xAxes,
            datasets: [
                {
                    label: "IT",
                    backgroundColor: "blue",
                    data: datapoints.yAxesIT
                },
                {
                    label: "Business",
                    backgroundColor: "red",
                    data: datapoints.yAxesBu
                },
                {
                    label: "Design",
                    backgroundColor: "green",
                    data: datapoints.yAxesDes
                }
            ]
        };
        const myBarChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMax: 10,
                            min: 0,
                            stepSize: 1.0
                        }
                    }]
                },
                title: {
                    display: true,
                    text: 'Number of contributor (staff with submission) per department',
                    fontSize:20
                }
            }
        });
    }

    async function drawPieChart(){
        const datapoints = await getPieChartData();
        const ctx = document.getElementById("pieChart").getContext("2d");
        const data = {
            labels: datapoints.courseName,
            datasets: [{
                label: 'My First Dataset',
                data: datapoints.totalCourse,
                backgroundColor: randomColor(datapoints.courseName),
                hoverOffset: 4
            }]
        };
        const myBarChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                title: {
                    display: true,
                    text: 'Number of ideas per course',
                    fontSize:20
                }
            }
        });
    }

    async function getBarChartData(dataDir){
        const res = await fetch(dataDir);
        const data = await res.text();

        const yAxesIT = [];
        const yAxesBu = [];
        const yAxesDes = [];
        const xAxes = [];

        const table = data.split('\n').slice(1);
        table.forEach(row=>{
            const column = row.split(',')

            const year = column[3]
            xAxes.push(year)
            
            const IT = column[0]
            yAxesIT.push(IT)

            const Business = column[1]
            yAxesBu.push(Business)

            const Design = column[2]
            yAxesDes.push(Design)
        })
        
        return { xAxes, yAxesBu, yAxesDes, yAxesIT}
    }

    async function getPieChartData(){
        const res = await fetch('../csv/pieChart.csv');
        const data = await res.text();

        const totalCourse = [];
        const courseName = [];

        const table = data.split('\n').slice(1);
        table.forEach(row=>{
            const column = row.split(',')
            
            const totalcourse = column[0]
            totalCourse.push(totalcourse)

            const course = column[1]
            courseName.push(course)
        })
        
        console.log(totalCourse)
        console.log(courseName)
        return { totalCourse, courseName}
    }

    function randomColor(labels){
        const bgColors = [];

        for (let i = 0; i < labels.length; i++){
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);

            bgColors.push('rgb(' + r + ',' + g + ',' + b + ')');
        };

        return bgColors
    }

        