/**
 * First attempt to convert to ts server. Not working yet.
 */
import app from "./Server";

const port = process.env.PORT || 3000;

app.disable("x-powered-by");

// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}.`);
// });
