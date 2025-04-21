// utils/dateUtils.js

export function getLastDayOfMonth(monthName, year) {
    const monthMap = {
      'มกราคม': 0,
      'กุมภาพันธ์': 1,
      'มีนาคม': 2,
      'เมษายน': 3,
      'พฤษภาคม': 4,
      'มิถุนายน': 5,
      'กรกฎาคม': 6,
      'สิงหาคม': 7,
      'กันยายน': 8,
      'ตุลาคม': 9,
      'พฤศจิกายน': 10,
      'ธันวาคม': 11
    };
  
    const month = monthMap[monthName];
    return new Date(year, month + 1, 0).getDate();
  }
  
  export function getNextMonthThai(month) {
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const index = months.indexOf(month);
    return months[(index + 1) % 12];
  }
  
  export function getNextMonthYear(month, year) {
    return month === "ธันวาคม" ? parseInt(year) + 1 : year;
  }
  