# On-Site Starter

This application was scaffolded using `create-react-app`, with node version `14.15.1`

### Running

- `npm i`
- `npm start`

should get you going.

## Bits provided

Apollo client has been set up and pointed at the correct API.

- ### src/Actions

  Contains the `gql` strings you should need

- ### Containers/RiskChart
  Renders the chart described in the exercise document.
  Props you should care about:
- `data`: `[{date: String, risk: Number, taskCount: Number}]` — this should already work with the data you receive from the API
- `highlightAreas`: `[{start: String, end: String}]` — an array of objects defining the edges of areas to highlight on the chart, as date strings parseable by `new Date`
- `onAreaSelect`: `function` — callback for when the user selects an area of the chart. This will be called with a `{start: String, end: String}` object as above. The chart component is unopinionated about the minimum or maximum size of a highlight.

---

If you'd like to introspect the query and mutation a little more, there should be docs available at https://fakerql.nplan.io/.

How you structure the rest of the application and the flow of data is up to you. Good luck! :)
