import React, { useMemo, useCallback, useState, useEffect } from "react";
import { AreaClosed, Line, Bar } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { scaleTime, scaleLinear } from "@visx/scale";
import { GradientLightgreenGreen } from "@visx/gradient";
import { Group } from "@visx/group";
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { AxisBottom } from "@visx/axis";
import { max, extent, bisector } from "d3-array";
import { timeFormat } from "d3-time-format";

const background = "#3b6978";
const accentColorDark = "#75daad";
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: "1px solid white",
  color: "white",
  fontFamily: "Tahoma",
};

const formatDate = timeFormat("%b %d, '%y");

const getDate = e => new Date(e.date);
const getRisk = e => e.risk;
const getTaskCount = e => e.tasksCount;

const bisectDate = bisector(d => new Date(d.date)).left;

const Chart = ({
  width = 800,
  height = 600,
  margin = { top: 0, right: 0, bottom: 45, left: 0 },
  data,
  highlightAreas = [],
  onAreaSelect = () => {},
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0,
}) => {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(data, getDate),
      }),
    [data, innerWidth, margin.left]
  );

  const riskScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, max(data, getRisk) * 2],
        nice: true,
      }),
    [data, margin.top, innerHeight]
  );

  const [selectHighlight, setSelectHighlight] = useState({
    start: false,
    end: false,
  });
  const [highlights, setHighlights] = useState([...highlightAreas]);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    setHighlights([...highlights, ...highlightAreas]);
  }, [highlightAreas]);

  const handleTooltip = useCallback(
    e => {
      const { x } = localPoint(e) || { x: 0 };
      const timestamp = dateScale.invert(x);
      const index = bisectDate(data, timestamp);
      if (index && data[index]) {
        showTooltip({
          tooltipData: data[index],
          tooltipLeft: x,
          tooltipTop: riskScale(getRisk(data[index])),
        });
      }
    },
    [data, showTooltip, riskScale, dateScale]
  );

  const onMouseMove = e => {
    handleTooltip(e);
    if (clicking) {
      const coords = localPoint(e);
      const timestamp = dateScale.invert(coords.x);
      setSelectHighlight({ ...selectHighlight, end: timestamp });
    }
  };

  const onMouseDown = e => {
    setClicking(true);
    const coords = localPoint(e);
    const timestamp = dateScale.invert(coords.x);
    setSelectHighlight({ ...selectHighlight, start: timestamp });
  };

  const onMouseUp = e => {
    setClicking(false);
    if (selectHighlight.start && selectHighlight.end) {
      const ltr =
        new Date(selectHighlight.start) < new Date(selectHighlight.end);
      const hlt = {
        start: ltr ? selectHighlight.start : selectHighlight.end,
        end: ltr ? selectHighlight.end : selectHighlight.start,
      };
      setHighlights([...highlights, hlt]);
      onAreaSelect(selectHighlight);
    }
    setSelectHighlight({ start: false, end: false });
  };

  const clearHighlights = () => setHighlights([...highlightAreas]);

  return (
    <div>
      <button
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          background: "#fff",
          border: "none",
          padding: "10px",
          fontFamily: "Tahoma",
          fontSize: "12px",
          borderRadius: "8px",
          color: "#5d5d5d",
          cursor: "pointer",
        }}
        onClick={clearHighlights}
      >
        Clear Highlights
      </button>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#background-gradient)"
          rx={14}
        />
        <GradientLightgreenGreen id="background-gradient" />
        <AreaClosed
          data={data}
          x={d => dateScale(getDate(d)) ?? 0}
          y={d => riskScale(getRisk(d)) ?? 0}
          yScale={riskScale}
          strokeWidth={1}
          stroke="#fff"
          fill="#fff"
          fillOpacity="0.33"
          strokeOpacity="0.5"
          curve={curveMonotoneX}
        />
        {highlights.map(
          hl =>
            hl.start &&
            hl.end && (
              <Bar
                data={hl}
                x={dateScale(new Date(hl.start))}
                y={0}
                width={
                  dateScale(new Date(hl.end)) - dateScale(new Date(hl.start))
                }
                height={height - margin.bottom}
                fill="#fff"
                opacity={0.12}
              />
            )
        )}
        <Bar
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          rx={14}
          data={data}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onMouseLeave={hideTooltip}
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
              stroke={accentColorDark}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill={accentColorDark}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
        <AxisBottom
          top={height - margin.bottom}
          left={0}
          scale={dateScale}
          numTicks={10}
          label="Time"
        >
          {axis => {
            const tickLabelSize = 10;
            const color = "#e2e2e2";
            const tickRotate = 45;
            const axisCenter = (axis.axisToPoint.x - axis.axisFromPoint.x) / 2;
            return (
              <g
                className="custom-bottom-axis"
                style={{ fontFamily: "Tahoma" }}
              >
                <Line
                  from={{ x: 0 + margin.left, y: 0 }}
                  to={{ x: innerWidth + margin.left, y: 0 }}
                  stroke={color}
                />
                {axis.ticks.map((tick, i) => {
                  const tickX = tick.to.x;
                  const tickY = tick.to.y + tickLabelSize + axis.tickLength;
                  return (
                    <Group
                      key={`vx-tick-${tick.value}-${i}`}
                      className="vx-axis-tick"
                    >
                      <Line from={tick.from} to={tick.to} stroke={color} />
                      <text
                        transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                        fontSize={tickLabelSize}
                        textAnchor="middle"
                        fill={color}
                      >
                        {tick.formattedValue}
                      </text>
                    </Group>
                  );
                })}
                <text
                  textAnchor="middle"
                  transform={`translate(${axisCenter + 50}, 60)`}
                  fontSize="12"
                  fill={color}
                >
                  {axis.label}
                </text>
              </g>
            );
          }}
        </AxisBottom>
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop - 100}
            left={tooltipLeft}
            style={{ ...tooltipStyles }}
          >
            <p>Risk: {getRisk(tooltipData)}</p>
            <p>Tasks: {getTaskCount(tooltipData)}</p>
          </TooltipWithBounds>
          <Tooltip
            top={innerHeight + margin.top - 5}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: "center",
              transform: "translateX(-55%)",
              fontFamily: "Tahoma",
              fontSize: "12px",
            }}
          >
            {formatDate(getDate(tooltipData))}
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default withTooltip(Chart);
