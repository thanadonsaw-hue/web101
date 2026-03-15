require('dotenv').config({ silent: true });
const app = require('./src/app');

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});