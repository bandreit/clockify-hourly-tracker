const axiosInstance = require('axios')
const XlsxPopulate = require('xlsx-populate');
const { splitPeriodIntoWeeks, getLastMonth15th, getThisMonth15th, getThisMonth16th, weekdays } = require('./date-helper');
const key = process.env.CLOCKIFY_API_KEY || ''

const axios = axiosInstance.create({
    timeout: 10000,
    headers: { 'X-Api-Key': key }
});

const baseUrl = `https://api.clockify.me/api/v1`
const reportsUrl = `https://reports.api.clockify.me/v1`
let username = 'report'

if (!key) {
    console.log(`API key must be provided through 'CLOCKIFY_API_KEY' env variable. Get one at https://clockify.me/user/settings`)
    process.exit(1)
}

thisMonth15th = getThisMonth15th();
thisMonth16th = getThisMonth16th();
lastMonth15th = getLastMonth15th();

; (async () => {
    try {
        const baseUserResponse = await axios.get(`${baseUrl}/user`)

        username = baseUserResponse.data.name;
        const workspaceId = baseUserResponse.data.defaultWorkspace
        console.log(`Welcome, ${username}, this is your workspace: ${workspaceId}`)

        const weeks = splitPeriodIntoWeeks(lastMonth15th, thisMonth15th);
        let promises = [];

        for (const [start, end] of weeks) {
            promises.push(axios.post(`${reportsUrl}/workspaces/${workspaceId}/reports/weekly`,
                {
                    dateRangeStart: start,
                    dateRangeEnd: end,
                    weeklyFilter: {
                        group: "USER",
                        subgroup: "TIME"
                    },
                    sortOrder: "DESCENDING",
                    exportType: "JSON"
                }
            ))
        }

        const weeklyLogs = await Promise.all(promises);
        let weeklyTotals = [];
        weeklyLogs.forEach(weekLog => {
            const weekLogData = weekLog.data.totalsByDay;
            weekLogData.forEach(log => {
                weeklyTotals.push({ ...log, jsDate: new Date(log.date) });
            })
        })
        weeklyTotals = weeklyTotals.filter(log => log.jsDate <= thisMonth16th && log.amount > 0)
        populateXlsFile(weeklyTotals);
    } catch (error) {
        console.log(error);
        // console.log(error.response.data.code + ': ' + error.response.data.message);
    }
})()

const populateXlsFile = (weeklyTotals) => {
    XlsxPopulate.fromFileAsync("./template.xlsx")
        .then(workbook => {
            // Set the values using a 2D array:
            weeklyTotals = weeklyTotals.map(entry => [weekdays[entry.jsDate.getDay()], entry.date, ' ', entry.duration / 3600])
            const r = workbook.sheet('Template').range(`B4:E${weeklyTotals.length + 3}`);

            r.value(weeklyTotals);

            workbook.sheet("Template").cell("C34").value(username);
            workbook.sheet("Template").cell("C37").value((new Date()).toLocaleDateString('en-US'));
            // Write to file.
            console.log('Done.');
            return workbook.toFileAsync(`./${username}.xlsx`);  
        });
}