const axiosInstance = require('axios')
const { splitPeriodIntoWeeks } = require('./date-helper');
const key = process.env.CLOCKIFY_API_KEY || ''

const axios = axiosInstance.create({
    timeout: 10000,
    headers: { 'X-Api-Key': key }
});

const baseUrl = `https://api.clockify.me/api/v1`
const reportsUrl = `https://reports.api.clockify.me/v1`

if (!key) {
    console.log(`API key must be provided through 'CLOCKIFY_API_KEY' env variable. Get one at https://clockify.me/user/settings`)
    process.exit(1)
}

let lastMonth15th = new Date();
lastMonth15th.setHours(2, 0, 0, 0);
lastMonth15th.setDate(0);
lastMonth15th.setDate(16);

let thisMonth15th = new Date();
thisMonth15th.setHours(25, 59, 59, 0);
thisMonth15th.setDate(15);

let thisMonth16th = thisMonth15th;
thisMonth16th.setDate(16);

; (async () => {
    try {
        const baseUserResponse = await axios.get(`${baseUrl}/user`)

        const workspaceId = baseUserResponse.data.defaultWorkspace
        console.log(`Welcome, ${baseUserResponse.data.name}, this is your workspace: ${workspaceId}`)

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
        console.log(weeklyTotals);
    } catch (error) {
        console.log(error.response.data.code + ': ' + error.response.data.message);
    }
})()