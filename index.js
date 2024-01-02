const express = require('express')
const cors = require('cors')

const app = express()
const { proxy, scriptUrl } = require('rtsp-relay')(app)
const URL = `rtsp://admin:Admin12345@697c05d98444.sn.mynetname.net:17554/Streaming/Channels/1`

const handler = proxy({
  url: URL,
  transport: 'tcp', // optional, default 'udp'
  // if your RTSP stream need credentials, include them in the URL as above
  verbose: true,
})

// the endpoint our RTSP uses
app.ws('/api/stream', handler)

// this is use many camera
app.ws('/v2/api/stream/:cameraID', (ws, req) => {
  const cameraID = +req.params.cameraID
  const URL_PROXY = `rtsp://admin:Admin12345@697c05d98444.sn.mynetname.net:${cameraID}/Streaming/Channels/1`
  proxy({
    url: URL_PROXY,
    transport: 'tcp', // optional, default 'udp'
    // if your RTSP stream need credentials, include them in the URL as above
    verbose: true,
    additionalFlags: [
      '-vf',
      'scale=850:450',
      '-b:v',
      '500k',
      '-fflags',
      'nobuffer',
    ],
  })(ws)
})

app.get('/', (req, res) =>
  res.send(`
  <canvas id='canvas'></canvas>

  <script src='${scriptUrl}'></script>
  <script>
    loadPlayer({
      url: 'ws://' + location.host + '/api/stream',
      canvas: document.getElementById('canvas')
    });
  </script>
`)
)

app.get('/camera/:id', (req, res) => {
  const cameraID = +req.params.id
  res.send(`
    <div>Camera ID: ${cameraID}</div>
    <canvas id='canvas'></canvas>

    <script src='${scriptUrl}'></script>
    <script>
      loadPlayer({
        url: 'ws://' + location.host + '/v2/api/stream/${cameraID}',
        canvas: document.getElementById('canvas')
      });
    </script>
  `)
})

app.use(cors({ origin: '*' }))
app.use(express.json())
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('Listening on port 8000!')
})
