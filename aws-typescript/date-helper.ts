
const splitPeriodIntoWeeks = (from: Date, to: Date) => {
    // Increase date by x amount of days
    const increaseDays = (date: Date, amount: number) => new Date(date.setDate(date.getDate() + amount));

    // Get all weeks in given period
    const buildWeeks = (start: Date, end: Date) => {
        const weeks = [];
        let current = new Date(start);

        while (current < end) {
            // Get start of the week
            const beginOfWeek = new Date(current);
            beginOfWeek.setUTCHours(0, 0, 0, 0);
            // Get end of the week

            let endOfWeek = increaseDays(current, 6);
            endOfWeek.setUTCHours(23, 59, 59, 999);

            // Add week to our collection
            weeks.push([beginOfWeek, endOfWeek]);

            current = increaseDays(current, 1);
        }

        return weeks;
    }

    const weeks = buildWeeks(from, to);
    return weeks;
}


const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export { splitPeriodIntoWeeks, weekdays }