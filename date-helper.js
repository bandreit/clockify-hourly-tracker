module.exports = {
    splitPeriodIntoWeeks: (from, to) => {
        // Increase date by x amount of days
        const increaseDays = (date, amount) => new Date(date.setDate(date.getDate() + amount));

        // Get all weeks in given period
        const buildWeeks = (start, end) => {
            const weeks = [];
            let current = new Date(start);

            while (current < end) {
                // Get start of the week
                const beginOfWeek = new Date(current);
                // Get end of the week
                let endOfWeek = increaseDays(current, 6);
                endOfWeek.setHours(25, 59, 59, 999);

                // Add week to our collection
                weeks.push([beginOfWeek, endOfWeek]);

                current = increaseDays(current, 1);
            }

            return weeks;
        }

        const weeks = buildWeeks(from, to);
        return weeks;
    },
    getLastMonth15th: () => {
        let lastMonth15th = new Date();
        lastMonth15th.setHours(2, 0, 0, 0);
        lastMonth15th.setDate(0);
        lastMonth15th.setDate(16);
        return lastMonth15th
    },
    getThisMonth15th: () => {
        let thisMonth15th = new Date();
        thisMonth15th.setHours(25, 59, 59, 0);
        thisMonth15th.setDate(15);
        return thisMonth15th;
    },
    getThisMonth16th: () => {
        let thisMonth15th = new Date();
        thisMonth15th.setHours(25, 59, 59, 0);
        thisMonth15th.setDate(15);
        let thisMonth16th = thisMonth15th;
        thisMonth16th.setDate(16);
        return thisMonth16th;
    },
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};