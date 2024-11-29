const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/webdav', (req, res) => {
  const command = "wget --user=Siteman --password='\\\\sn~4SN4' --no-check-certificate --method=PROPFIND https://192.168.19.14:5356/ -O -";
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Ошибка при выполнении команды' });
    }
    res.setHeader('Content-Type', 'application/xml');
    res.send(stdout);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));