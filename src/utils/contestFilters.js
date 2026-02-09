const dayjs = require("dayjs");

function filterToday(contests) {
  const today = dayjs();
  return contests.filter(contest =>
    dayjs(contest.startTime).isSame(today, "day")
  );
}

function filterThisWeek(contests) {
  const startOfWeek = dayjs().startOf("week");
  const endOfWeek = dayjs().endOf("week");

  return contests.filter(contest => {
    const time = dayjs(contest.startTime);
    return time.isAfter(startOfWeek) && time.isBefore(endOfWeek);
  });
}

function sortByStartTime(contests) {
  return contests.sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );
}

module.exports = {
  filterToday,
  filterThisWeek,
  sortByStartTime
};
