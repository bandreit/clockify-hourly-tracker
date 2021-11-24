import * as SDK from "aws-sdk";
const XlsxPopulate = require('xlsx-populate');
import axiosInstance, { AxiosResponse } from 'axios';
import { splitPeriodIntoWeeks, weekdays } from './date-helper';

const axios = axiosInstance.create({
    timeout: 10000
});

const baseUrl = `https://api.clockify.me/api/v1`
const reportsUrl = `https://reports.api.clockify.me/v1`

const generateReport = async (projectId: string, excelTemplate: SDK.S3.Body, CLOCKIFY_API_KEY: string | undefined): Promise<any> => {
    try {
        // generate the dates
        let thisMonth15th = new Date();
        thisMonth15th.setDate(15);
        thisMonth15th.setUTCHours(23, 59, 59, 999);

        let thisMonth16th = thisMonth15th;
        thisMonth16th.setDate(16);

        let lastMonth16th = new Date();
        lastMonth16th.setDate(0);
        lastMonth16th.setDate(16);
        lastMonth16th.setUTCHours(0, 0, 0, 0);

        const baseUserResponse = await axios.get(`${baseUrl}/user`, {
            headers: { "X-Api-Key": CLOCKIFY_API_KEY! }
        })
        const username: string = baseUserResponse.data.name;
        const workspaceId: string = baseUserResponse.data.defaultWorkspace

        const weeks = splitPeriodIntoWeeks(lastMonth16th, thisMonth15th);

        let promises: Array<Promise<AxiosResponse>> = [];
        for (const [start, end] of weeks) {
            promises.push(axios.post(`${reportsUrl}/workspaces/${workspaceId}/reports/weekly`,
                {
                    dateRangeStart: start,
                    dateRangeEnd: end,
                    weeklyFilter: {
                        group: "USER",
                        subgroup: "TIME"
                    },
                    projects: {
                        "ids": [projectId]
                    },
                    sortOrder: "DESCENDING",
                    exportType: "JSON"
                },
                {
                    headers: { "X-Api-Key": CLOCKIFY_API_KEY! }
                }
            ))
        }

        const weeklyLogsResult = await Promise.all(promises);

        let weeklyTotals: any[] = [];

        // filter & remap the values for better handling & adding the JSDate
        weeklyLogsResult.forEach(result => {
            let weekLogDataByDay = result.data.totalsByDay;
            weekLogDataByDay = weekLogDataByDay.map((dayLog: any) => {
                return ({ ...dayLog, jsDate: new Date(dayLog.date) });
            })
            weeklyTotals.push(...weekLogDataByDay);
        })

        // set the last date to be the 15th of the current month
        let thisMonth15thUTC = new Date(thisMonth15th);
        thisMonth15thUTC.setHours(0, 0, 0, 0);
        weeklyTotals = weeklyTotals.filter(log => log.jsDate <= thisMonth15thUTC && log.duration > 0)
        return populateXlsFile(weeklyTotals, excelTemplate, username);
    } catch (error) {
        console.log("Error in generation: " + error);
        return [-1];
    }
}

const populateXlsFile = async (weeklyTotals: any[], excelTemplate: SDK.S3.Body, username: string) => {
    const result = XlsxPopulate.fromDataAsync(excelTemplate)
        .then(async (workbook: any) => {
            // Set the values using a 2D array:                
            weeklyTotals = weeklyTotals.map(entry => {
                const day: number = entry.jsDate.getDay();
                const weekday: string = weekdays[day];
                const timeSpent: string = (entry.duration / 3600).toFixed(2);

                return [weekday, entry.date, timeSpent]
            })
            const tableData = workbook.sheet(0).range(`B4:E${weeklyTotals.length + 3}`);
            tableData.value(weeklyTotals);

            // Set the values in the sum cells:
            const totalHours = weeklyTotals.reduce((acc, curr) => acc + parseFloat(curr[2]), 0);
            const sheet = workbook.sheet(0);
            sheet.cell("C34").value(username);
            sheet.cell("D31").value(totalHours);
            sheet.cell("C32").value(totalHours);
            sheet.cell("C37").value((new Date()).toLocaleDateString('en-US'));

            // Write to file.
            const workbookResult = await workbook.outputAsync("base64").then(function (blob: any) { return blob; });
            return { username, workbookResult };
        });
    return await result;
}

export {
    generateReport
};