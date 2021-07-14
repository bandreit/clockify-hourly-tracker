module.exports = {
    splitPeriodIntoWeeks: (from, to) => {
        // Increase date by x amount of days
        const increaseDays = (date, amount) => new Date(date.setDate(date.getDate() + amount));
        
        // Get all weeks in given period
        const buildWeeks = (start, end) => {
          const weeks = [];
          let current = new Date(start);
          
          while(current < end) {
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
  };