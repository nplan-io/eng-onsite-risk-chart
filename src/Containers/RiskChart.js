import React from "react";
import { ParentSize } from "@visx/responsive";
import { Chart } from "../Components/";

const RiskChart = props => {
  return props.data ? (
    <ParentSize>{parent => <Chart height="600" {...props} />}</ParentSize>
  ) : (
    <div style={{ textAlign: "center", fontSize: "18px" }}>
      Please provide some data to construct this chart.
    </div>
  );
};

export default RiskChart;
