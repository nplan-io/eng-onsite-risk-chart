import { gql } from "@apollo/client";

export const GET_TIME_SERIES = gql`
  {
    Series {
      date
      planned
      actual
      predicted
      plannedWip
      tasks {
        id
        name
        plannedStart
        plannedEnd
        riskShare
      }
      risk
      tasksCount
    }
  }
`;

export const SAVE_REVIEW_PERIODS = gql`
  mutation savePeriods($periods: [PeriodInput!]) {
    savePeriods(periods: $periods) {
      id
      start
      end
      tasks {
        id
        name
        plannedStart
        plannedEnd
        riskShare
      }
      risk
      tasksCount
    }
  }
`;
